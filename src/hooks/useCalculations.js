import { useMemo, useCallback } from 'react'
import { usePlanStore } from '../store/planStore'
import { 
  calculateRetirementPlan, 
  runSensitivityAnalysis,
  calculateFV,
  calculatePV,
  calculateRequiredSIP
} from '../lib/calculations'

export const useCalculations = () => {
  const { currentPlan, setResults, results } = usePlanStore()

  // Calculate full retirement plan
  const calculate = useCallback(() => {
    if (!currentPlan) return null
    
    try {
      const result = calculateRetirementPlan(currentPlan)
      setResults(result)
      return result
    } catch (error) {
      console.error('Calculation error:', error)
      return null
    }
  }, [currentPlan, setResults])

  // Memoized calculation based on plan changes
  const calculatedResults = useMemo(() => {
    if (!currentPlan?.personA?.age || !currentPlan?.expenses?.length) {
      return null
    }
    
    try {
      return calculateRetirementPlan(currentPlan)
    } catch (error) {
      console.error('Calculation error:', error)
      return null
    }
  }, [currentPlan])

  // Run sensitivity analysis
  const runSensitivity = useCallback((parameter, range) => {
    if (!currentPlan) return null
    
    try {
      return runSensitivityAnalysis(currentPlan, parameter, range)
    } catch (error) {
      console.error('Sensitivity analysis error:', error)
      return null
    }
  }, [currentPlan])

  // Quick calculations
  const quickFV = useCallback((presentValue, rate, years) => {
    return calculateFV(presentValue, rate, years)
  }, [])

  const quickPV = useCallback((futureValue, rate, years) => {
    return calculatePV(futureValue, rate, years)
  }, [])

  const quickSIP = useCallback((targetFV, rate, years) => {
    return calculateRequiredSIP(targetFV, rate, years)
  }, [])

  // Pre-defined sensitivity ranges
  const sensitivityRanges = useMemo(() => ({
    preRetirementReturn: [0.08, 0.09, 0.10, 0.11, 0.12, 0.13, 0.14],
    postRetirementReturn: [0.05, 0.06, 0.07, 0.08, 0.09, 0.10],
    inflation: [0.04, 0.05, 0.06, 0.07, 0.08],
    swr: [0.025, 0.03, 0.035, 0.04, 0.045, 0.05]
  }), [])

  return {
    calculate,
    calculatedResults,
    results: results || calculatedResults,
    runSensitivity,
    sensitivityRanges,
    quickFV,
    quickPV,
    quickSIP
  }
}

export default useCalculations
