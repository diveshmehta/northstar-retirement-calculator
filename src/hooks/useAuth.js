import { useState, useEffect, useCallback } from 'react'
import { supabase, signIn, signUp, signOut, resetPassword, getUser, onAuthStateChange } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user || null)
      } catch (err) {
        console.error('Error checking session:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen to auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
      
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: signInError } = await signIn(email, password)
      
      if (signInError) {
        setError(signInError.message)
        return { success: false, error: signInError }
      }
      
      setUser(data.user)
      setSession(data.session)
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email, password, metadata = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: signUpError } = await signUp(email, password, metadata)
      
      if (signUpError) {
        setError(signUpError.message)
        return { success: false, error: signUpError }
      }
      
      // Note: Supabase may require email confirmation
      return { success: true, data, requiresConfirmation: !data.session }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: signOutError } = await signOut()
      
      if (signOutError) {
        setError(signOutError.message)
        return { success: false, error: signOutError }
      }
      
      setUser(null)
      setSession(null)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: resetError } = await resetPassword(email)
      
      if (resetError) {
        setError(resetError.message)
        return { success: false, error: resetError }
      }
      
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    clearError
  }
}

export default useAuth
