import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePlanStore } from '../store/planStore'
import { useAuth } from './useAuth'

export const usePlans = () => {
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cloudPlans, setCloudPlans] = useState([])

  const { 
    currentPlan, 
    savedPlans, 
    savePlan: saveLocalPlan,
    loadPlan: loadLocalPlan,
    deletePlan: deleteLocalPlan,
    duplicatePlan: duplicateLocalPlan,
    setCurrentPlan,
    resetPlan
  } = usePlanStore()

  // Fetch plans from Supabase
  const fetchCloudPlans = useCallback(async () => {
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError

      setCloudPlans(data || [])
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching plans:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Save plan to Supabase
  const saveToCloud = useCallback(async (plan = currentPlan) => {
    if (!isAuthenticated) {
      // Fall back to local storage
      saveLocalPlan(plan)
      return { success: true, local: true }
    }

    setLoading(true)
    setError(null)

    try {
      const planData = {
        user_id: user.id,
        name: plan.name,
        mode: plan.mode,
        person_a_age: plan.personA?.age,
        person_a_retirement_age: plan.personA?.retirementAge,
        person_a_name: plan.personA?.name,
        person_b_age: plan.personB?.age,
        person_b_retirement_age: plan.personB?.retirementAge,
        person_b_name: plan.personB?.name,
        life_expectancy: plan.lifeExpectancy,
        inflation: plan.assumptions?.inflation,
        pre_fi_return: plan.assumptions?.preRetirementReturn,
        post_fi_return: plan.assumptions?.postRetirementReturn,
        swr: plan.assumptions?.swr,
        buffer_percent: plan.assumptions?.buffer,
        step_up_sip_percent: plan.assumptions?.stepUpSIP,
        fi_age: plan.assumptions?.fiAge,
        full_retirement_age: plan.assumptions?.fullRetirementAge,
        existing_sip: plan.existingSIP,
        plan_data: plan, // Store full plan as JSONB
        updated_at: new Date().toISOString()
      }

      let result
      if (plan.cloudId) {
        // Update existing
        result = await supabase
          .from('plans')
          .update(planData)
          .eq('id', plan.cloudId)
          .select()
          .single()
      } else {
        // Insert new
        result = await supabase
          .from('plans')
          .insert(planData)
          .select()
          .single()
      }

      if (result.error) throw result.error

      // Update current plan with cloud ID
      setCurrentPlan({ ...plan, cloudId: result.data.id })
      
      // Refresh cloud plans
      await fetchCloudPlans()

      return { success: true, data: result.data }
    } catch (err) {
      setError(err.message)
      console.error('Error saving plan:', err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, currentPlan, setCurrentPlan, fetchCloudPlans, saveLocalPlan])

  // Load plan from Supabase
  const loadFromCloud = useCallback(async (planId) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (fetchError) throw fetchError

      // Load the full plan data
      const plan = data.plan_data || {
        name: data.name,
        mode: data.mode,
        personA: {
          name: data.person_a_name || 'Person A',
          age: data.person_a_age,
          retirementAge: data.person_a_retirement_age
        },
        personB: data.person_b_age ? {
          name: data.person_b_name || 'Person B',
          age: data.person_b_age,
          retirementAge: data.person_b_retirement_age
        } : null,
        lifeExpectancy: data.life_expectancy,
        assumptions: {
          inflation: data.inflation,
          preRetirementReturn: data.pre_fi_return,
          postRetirementReturn: data.post_fi_return,
          swr: data.swr,
          buffer: data.buffer_percent,
          stepUpSIP: data.step_up_sip_percent,
          fiAge: data.fi_age,
          fullRetirementAge: data.full_retirement_age
        },
        existingSIP: data.existing_sip,
        cloudId: data.id
      }

      setCurrentPlan({ ...plan, cloudId: data.id })
      return { success: true, data: plan }
    } catch (err) {
      setError(err.message)
      console.error('Error loading plan:', err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, setCurrentPlan])

  // Delete plan from Supabase
  const deleteFromCloud = useCallback(async (planId) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' }

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId)

      if (deleteError) throw deleteError

      // Refresh cloud plans
      await fetchCloudPlans()

      return { success: true }
    } catch (err) {
      setError(err.message)
      console.error('Error deleting plan:', err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, fetchCloudPlans])

  // Sync local plans to cloud
  const syncToCloud = useCallback(async () => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' }

    setLoading(true)
    const results = []

    for (const plan of savedPlans) {
      if (!plan.cloudId) {
        const result = await saveToCloud(plan)
        results.push(result)
      }
    }

    setLoading(false)
    return { success: true, results }
  }, [isAuthenticated, savedPlans, saveToCloud])

  // Fetch cloud plans on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchCloudPlans()
    } else {
      setCloudPlans([])
    }
  }, [isAuthenticated, fetchCloudPlans])

  // Combined plans (local + cloud)
  const allPlans = [...cloudPlans.map(p => ({ ...p.plan_data, cloudId: p.id, isCloud: true })), 
                    ...savedPlans.filter(p => !p.cloudId)]

  return {
    currentPlan,
    savedPlans,
    cloudPlans,
    allPlans,
    loading,
    error,
    saveToCloud,
    loadFromCloud,
    deleteFromCloud,
    fetchCloudPlans,
    syncToCloud,
    saveLocalPlan,
    loadLocalPlan,
    deleteLocalPlan,
    duplicateLocalPlan,
    setCurrentPlan,
    resetPlan,
    clearError: () => setError(null)
  }
}

export default usePlans
