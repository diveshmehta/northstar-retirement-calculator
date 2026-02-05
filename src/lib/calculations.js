/**
 * Retirement Corpus Calculator - Financial Calculations
 * Based on PRD Section 9
 */

// ==================== BASIC CALCULATIONS ====================

/**
 * Calculate Future Value
 * FV = PV * (1 + r)^n
 */
export const calculateFV = (presentValue, rate, years) => {
  if (years <= 0) return presentValue
  return presentValue * Math.pow(1 + rate, years)
}

/**
 * Calculate Present Value
 * PV = FV / (1 + r)^n
 */
export const calculatePV = (futureValue, rate, years) => {
  if (years <= 0) return futureValue
  return futureValue / Math.pow(1 + rate, years)
}

/**
 * Calculate Real Return
 * r_real = (1 + r_nominal) / (1 + inflation) - 1
 */
export const calculateRealReturn = (nominalReturn, inflation) => {
  return (1 + nominalReturn) / (1 + inflation) - 1
}

/**
 * Calculate monthly rate from annual rate
 * r_monthly = (1 + r_annual)^(1/12) - 1
 */
export const annualToMonthlyRate = (annualRate) => {
  return Math.pow(1 + annualRate, 1 / 12) - 1
}

// ==================== SIP CALCULATIONS ====================

/**
 * Calculate Future Value of SIP
 * FV = PMT * ((1 + r)^n - 1) / r
 */
export const calculateSIPFV = (monthlyAmount, annualRate, years) => {
  if (years <= 0) return 0
  const monthlyRate = annualToMonthlyRate(annualRate)
  const months = years * 12
  
  if (monthlyRate === 0) {
    return monthlyAmount * months
  }
  
  return monthlyAmount * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
}

/**
 * Calculate required monthly SIP for target FV
 * PMT = FV * r / ((1 + r)^n - 1)
 */
export const calculateRequiredSIP = (targetFV, annualRate, years) => {
  // Handle edge cases
  if (!targetFV || targetFV <= 0) return 0
  if (!years || years <= 0) return 0
  if (annualRate === undefined || annualRate === null) annualRate = 0.12 // Default 12%
  
  const monthlyRate = annualToMonthlyRate(annualRate)
  const months = years * 12
  
  if (monthlyRate === 0 || isNaN(monthlyRate)) {
    return targetFV / months
  }
  
  const result = targetFV * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1)
  
  // Ensure we don't return NaN or Infinity
  if (isNaN(result) || !isFinite(result)) {
    return targetFV / months // Fallback to simple division
  }
  
  return result
}

/**
 * Calculate Present Value of SIP
 * PV = PMT * (1 - (1 + r)^(-n)) / r
 */
export const calculateSIPPV = (monthlyAmount, annualRate, years) => {
  if (years <= 0) return 0
  const monthlyRate = annualToMonthlyRate(annualRate)
  const months = years * 12
  
  if (monthlyRate === 0) {
    return monthlyAmount * months
  }
  
  return monthlyAmount * (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate
}

/**
 * Calculate Step-up SIP Future Value
 * Each year, SIP increases by stepUpRate
 */
export const calculateStepUpSIPFV = (initialMonthlyAmount, annualRate, stepUpRate, years) => {
  if (years <= 0) return 0
  
  let totalFV = 0
  let currentMonthly = initialMonthlyAmount
  const monthlyRate = annualToMonthlyRate(annualRate)
  
  for (let year = 0; year < years; year++) {
    // FV of this year's SIP, compounded for remaining years
    const yearsRemaining = years - year - 1
    const yearSIPFV = calculateSIPFV(currentMonthly, annualRate, 1)
    const compoundedFV = calculateFV(yearSIPFV, annualRate, yearsRemaining)
    totalFV += compoundedFV
    
    // Step up for next year
    currentMonthly = currentMonthly * (1 + stepUpRate)
  }
  
  return totalFV
}

// ==================== CORPUS CALCULATIONS ====================

/**
 * Calculate Traditional Retirement Corpus (Annuity lens)
 * Corpus needed at retirement to fund expenses until life expectancy
 * 
 * @param {number} monthlyExpense - Monthly expense today
 * @param {number} yearsToRetirement - Years until retirement
 * @param {number} yearsInRetirement - Years from retirement to life expectancy
 * @param {number} inflation - Annual inflation rate
 * @param {number} postRetirementReturn - Expected return post-retirement
 */
export const calculateTraditionalCorpus = (
  monthlyExpense,
  yearsToRetirement,
  yearsInRetirement,
  inflation,
  postRetirementReturn
) => {
  // Inflate monthly expense to retirement
  const monthlyAtRetirement = calculateFV(monthlyExpense, inflation, yearsToRetirement)
  const annualAtRetirement = monthlyAtRetirement * 12
  
  // Real return post-retirement
  const realReturn = calculateRealReturn(postRetirementReturn, inflation)
  
  // Corpus at retirement (present value of annuity at retirement)
  let corpusAtRetirement
  if (Math.abs(realReturn) < 0.0001) {
    // Zero real return edge case
    corpusAtRetirement = annualAtRetirement * yearsInRetirement
  } else {
    corpusAtRetirement = annualAtRetirement * (1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn
  }
  
  return {
    monthlyAtRetirement,
    annualAtRetirement,
    corpusAtRetirement,
    realReturn
  }
}

/**
 * Calculate FIRE Corpus (SWR lens)
 * FI Number = Annual Expenses / SWR
 * 
 * @param {number} annualExpenses - Annual expenses at FI (in future value)
 * @param {number} annualIncome - Annual income post-FI (part-time, rental, etc.)
 * @param {number} swr - Safe Withdrawal Rate (e.g., 0.04 for 4%)
 * @param {number} buffer - Buffer percentage (e.g., 0.1 for 10%)
 */
export const calculateFIRECorpus = (annualExpenses, annualIncome, swr, buffer = 0) => {
  const netAnnualExpenses = Math.max(0, annualExpenses - annualIncome)
  const fiNumber = netAnnualExpenses / swr
  const fiNumberBuffered = fiNumber * (1 + buffer)
  
  return {
    netAnnualExpenses,
    fiNumber,
    fiNumberBuffered
  }
}

/**
 * Calculate Coast FIRE Number
 * How much you need today so compounding alone reaches your target at retirement
 * 
 * @param {number} targetCorpus - Required corpus at retirement
 * @param {number} yearsToRetirement - Years until retirement
 * @param {number} expectedReturn - Expected annual return
 */
export const calculateCoastFIRE = (targetCorpus, yearsToRetirement, expectedReturn) => {
  const coastNumber = calculatePV(targetCorpus, expectedReturn, yearsToRetirement)
  
  return {
    coastNumber,
    yearsToCoast: yearsToRetirement
  }
}

/**
 * Calculate Barista FIRE (Two-phase model)
 * Phase 1: FI age to full retirement age (partial income)
 * Phase 2: Full retirement age to life expectancy (no work income)
 */
export const calculateBaristaFIRE = (
  monthlyExpense,
  partTimeIncome,
  otherIncome, // pension, rental, etc.
  fiAge,
  fullRetirementAge,
  lifeExpectancy,
  inflation,
  preRetirementReturn,
  postRetirementReturn
) => {
  const currentAge = fiAge // We calculate from FI age perspective
  const yearsInPhase1 = fullRetirementAge - fiAge
  const yearsInPhase2 = lifeExpectancy - fullRetirementAge
  
  // Phase 1: Semi-retirement (partial income)
  const monthlyPhase1 = monthlyExpense - partTimeIncome
  const annualPhase1 = Math.max(0, monthlyPhase1 * 12)
  
  // Phase 2: Full retirement (other income only)
  const inflatedExpense = calculateFV(monthlyExpense, inflation, yearsInPhase1)
  const monthlyPhase2 = inflatedExpense - (otherIncome / 12)
  const annualPhase2 = Math.max(0, monthlyPhase2 * 12)
  
  // Calculate PV of Phase 1 withdrawals at FI age
  const realReturnPre = calculateRealReturn(preRetirementReturn, inflation)
  let pvPhase1 = 0
  if (Math.abs(realReturnPre) < 0.0001) {
    pvPhase1 = annualPhase1 * yearsInPhase1
  } else {
    pvPhase1 = annualPhase1 * (1 - Math.pow(1 + realReturnPre, -yearsInPhase1)) / realReturnPre
  }
  
  // Calculate PV of Phase 2 withdrawals at full retirement age
  const realReturnPost = calculateRealReturn(postRetirementReturn, inflation)
  let pvPhase2AtFullRetirement = 0
  if (Math.abs(realReturnPost) < 0.0001) {
    pvPhase2AtFullRetirement = annualPhase2 * yearsInPhase2
  } else {
    pvPhase2AtFullRetirement = annualPhase2 * (1 - Math.pow(1 + realReturnPost, -yearsInPhase2)) / realReturnPost
  }
  
  // Discount Phase 2 PV back to FI age
  const pvPhase2AtFI = calculatePV(pvPhase2AtFullRetirement, preRetirementReturn, yearsInPhase1)
  
  // Total corpus needed at FI age
  const corpusAtFI = pvPhase1 + pvPhase2AtFI
  
  return {
    yearsInPhase1,
    yearsInPhase2,
    annualPhase1,
    annualPhase2,
    pvPhase1,
    pvPhase2AtFullRetirement,
    pvPhase2AtFI,
    corpusAtFI
  }
}

// ==================== GOAL CALCULATIONS ====================

/**
 * Calculate FV and PV for a one-time goal
 */
export const calculateOneTimeGoal = (
  amount,
  isInTodaysRupees,
  yearsFromNow,
  inflation,
  discountRate
) => {
  let futureValue
  if (isInTodaysRupees) {
    futureValue = calculateFV(amount, inflation, yearsFromNow)
  } else {
    futureValue = amount
  }
  
  const presentValue = calculatePV(futureValue, discountRate, yearsFromNow)
  
  return {
    futureValue,
    presentValue,
    yearsFromNow
  }
}

/**
 * Calculate FV and PV for a recurring goal (yearly)
 * Expands to yearly cashflows and sums PV
 */
export const calculateRecurringGoal = (
  annualAmount,
  isInTodaysRupees,
  startYear,
  endYear,
  escalation, // annual growth rate of the expense
  discountRate
) => {
  let totalFV = 0
  let totalPV = 0
  const cashflows = []
  
  for (let year = startYear; year <= endYear; year++) {
    let cashflow
    if (isInTodaysRupees) {
      // Amount grows with escalation from today
      cashflow = calculateFV(annualAmount, escalation, year)
    } else {
      // Amount is already in future value for start year, grows with escalation
      cashflow = calculateFV(annualAmount, escalation, year - startYear)
    }
    
    const pv = calculatePV(cashflow, discountRate, year)
    
    cashflows.push({
      year,
      amount: cashflow,
      presentValue: pv
    })
    
    totalFV += cashflow
    totalPV += pv
  }
  
  return {
    totalFutureValue: totalFV,
    totalPresentValue: totalPV,
    cashflows
  }
}

/**
 * Calculate monthly living expenses corpus requirement
 */
export const calculateLivingExpensesCorpus = (
  monthlyExpense,
  startYear, // year expenses start (e.g., retirement year)
  endYear, // year expenses end (e.g., life expectancy year)
  inflation,
  discountRate
) => {
  const annualExpense = monthlyExpense * 12
  return calculateRecurringGoal(
    annualExpense,
    true, // in today's rupees
    startYear,
    endYear,
    inflation,
    discountRate
  )
}

// ==================== PROJECTION CALCULATIONS ====================

/**
 * Project asset values to target date
 */
export const projectAssets = (assets, yearsToTarget) => {
  return assets.map(asset => {
    const returnRate = asset.returnOverride ?? asset.defaultReturn ?? 0.08
    const projectedValue = calculateFV(asset.currentValue, returnRate, yearsToTarget)
    
    return {
      ...asset,
      returnRate,
      projectedValue
    }
  })
}

/**
 * Calculate total projected wealth at target age
 */
export const calculateProjectedWealth = (
  assets,
  existingSIP,
  yearsToTarget,
  preTargetReturn
) => {
  // Ensure valid inputs
  const validAssets = Array.isArray(assets) ? assets : []
  const validSIP = existingSIP || 0
  const validYears = Math.max(1, yearsToTarget || 1)
  const validReturn = preTargetReturn ?? 0.12
  
  // Project assets (only liquid assets)
  const liquidAssets = validAssets.filter(a => a.isLiquid !== false && a.currentValue > 0)
  const projectedAssets = projectAssets(liquidAssets, validYears)
  const totalAssetsFV = projectedAssets.reduce((sum, a) => sum + (a.projectedValue || 0), 0)
  
  // Project SIP (if any)
  const sipFV = validSIP > 0 ? calculateSIPFV(validSIP, validReturn, validYears) : 0
  
  return {
    projectedAssets,
    totalAssetsFV,
    sipFV,
    totalProjectedWealth: totalAssetsFV + sipFV
  }
}

/**
 * Calculate gap and required SIP
 */
export const calculateGapAnalysis = (
  requiredCorpus,
  projectedWealth,
  yearsToTarget,
  preTargetReturn
) => {
  // Ensure valid inputs
  const validRequiredCorpus = requiredCorpus || 0
  const validProjectedWealth = projectedWealth || 0
  const validYears = Math.max(1, yearsToTarget || 1) // Minimum 1 year
  const validReturn = preTargetReturn ?? 0.12
  
  const gap = validRequiredCorpus - validProjectedWealth
  const hasShortfall = gap > 0
  
  // Calculate required SIP to close the gap
  let requiredSIP = 0
  if (hasShortfall && validYears > 0) {
    requiredSIP = calculateRequiredSIP(gap, validReturn, validYears)
    
    // Debug logging for troubleshooting
    if (typeof window !== 'undefined' && window.DEBUG_CALC) {
      console.log('Gap Analysis:', {
        requiredCorpus: validRequiredCorpus,
        projectedWealth: validProjectedWealth,
        gap,
        yearsToTarget: validYears,
        preTargetReturn: validReturn,
        calculatedSIP: requiredSIP
      })
    }
  }
  
  // Calculate on-track percentage
  const onTrackPercentage = validRequiredCorpus > 0 
    ? Math.min(100, (validProjectedWealth / validRequiredCorpus) * 100)
    : 100
  
  return {
    requiredCorpus: validRequiredCorpus,
    projectedWealth: validProjectedWealth,
    gap: hasShortfall ? gap : 0,
    surplus: hasShortfall ? 0 : Math.abs(gap),
    hasShortfall,
    requiredSIP,
    onTrackPercentage
  }
}

// ==================== COMPLETE PLAN CALCULATION ====================

/**
 * Calculate complete retirement plan based on mode
 */
export const calculateRetirementPlan = (planData) => {
  const {
    mode, // 'traditional', 'fire', 'barista', 'coast', 'fatfire'
    personA,
    personB,
    lifeExpectancy = 85,
    assumptions = {},
    assets = [],
    expenses = [],
    incomeStreams = [],
    existingSIP = 0
  } = planData
  
  const currentYear = new Date().getFullYear()
  const currentAge = Math.min(personA?.age || 30, personB?.age || personA?.age || 30)
  const retirementAge = assumptions.fiAge || Math.min(
    personA?.retirementAge || 60, 
    personB?.retirementAge || personA?.retirementAge || 60
  )
  const yearsToRetirement = Math.max(1, retirementAge - currentAge) // Minimum 1 year
  const yearsInRetirement = Math.max(1, lifeExpectancy - retirementAge) // Minimum 1 year
  
  // Extract assumptions with defaults
  const inflation = assumptions.inflation ?? 0.06
  const preRetirementReturn = assumptions.preRetirementReturn ?? 0.12
  const postRetirementReturn = assumptions.postRetirementReturn ?? 0.08
  const swr = assumptions.swr ?? 0.04
  const buffer = assumptions.buffer ?? 0.10
  const stepUpSIP = assumptions.stepUpSIP ?? 0.10
  
  // Calculate monthly living expenses
  const monthlyLivingExpense = expenses.find(e => e.type === 'monthly_living' || e.type === 'monthly')
  const monthlyLiving = monthlyLivingExpense?.amount || 0
  
  // Calculate post-FI income
  const postFIIncome = incomeStreams.reduce((sum, inc) => {
    if (inc.startAge <= retirementAge) {
      return sum + (inc.amount * 12)
    }
    return sum
  }, 0)
  
  let corpusResult
  
  switch (mode) {
    case 'fire':
    case 'fatfire': {
      const annualExpenses = calculateFV(monthlyLiving * 12, inflation, yearsToRetirement)
      corpusResult = calculateFIRECorpus(annualExpenses, postFIIncome, swr, buffer)
      break
    }
    
    case 'coast': {
      // First calculate target corpus at retirement
      const traditionalResult = calculateTraditionalCorpus(
        monthlyLiving,
        yearsToRetirement,
        yearsInRetirement,
        inflation,
        postRetirementReturn
      )
      corpusResult = {
        ...calculateCoastFIRE(
          traditionalResult.corpusAtRetirement,
          yearsToRetirement,
          preRetirementReturn
        ),
        targetCorpusAtRetirement: traditionalResult.corpusAtRetirement
      }
      break
    }
    
    case 'barista': {
      const partTimeIncome = incomeStreams.find(inc => inc.type === 'parttime')?.amount || 0
      const otherIncome = incomeStreams
        .filter(inc => inc.type !== 'parttime')
        .reduce((sum, inc) => sum + inc.amount * 12, 0)
      
      const fullRetirementAge = assumptions.fullRetirementAge || retirementAge + 10
      
      corpusResult = calculateBaristaFIRE(
        monthlyLiving,
        partTimeIncome,
        otherIncome,
        retirementAge,
        fullRetirementAge,
        lifeExpectancy,
        inflation,
        preRetirementReturn,
        postRetirementReturn
      )
      break
    }
    
    case 'traditional':
    default: {
      corpusResult = calculateTraditionalCorpus(
        monthlyLiving,
        yearsToRetirement,
        yearsInRetirement,
        inflation,
        postRetirementReturn
      )
      break
    }
  }
  
  // Calculate one-time and recurring goals
  const goalResults = expenses
    .filter(e => e.type !== 'monthly_living' && e.type !== 'monthly')
    .map(expense => {
      if (expense.type === 'onetime' || expense.type === 'one-time') {
        const yearsFromNow = (expense.targetYear || currentYear + 10) - currentYear
        return {
          ...calculateOneTimeGoal(
            expense.amount || 0,
            expense.amountMode === 'today',
            Math.max(1, yearsFromNow),
            inflation,
            preRetirementReturn
          ),
          name: expense.name
        }
      } else {
        // Yearly recurring expense
        const startYearRel = Math.max(0, (expense.startYear || currentYear) - currentYear)
        const endYearRel = Math.max(startYearRel + 1, (expense.endYear || currentYear + 20) - currentYear)
        const escalation = typeof expense.escalation === 'number' ? expense.escalation : inflation
        
        return {
          ...calculateRecurringGoal(
            expense.amount || 0,
            expense.amountMode === 'today',
            startYearRel,
            endYearRel,
            escalation,
            preRetirementReturn
          ),
          name: expense.name
        }
      }
    })
  
  const totalGoalsPV = goalResults.reduce((sum, g) => sum + (g.presentValue || g.totalPresentValue || 0), 0)
  
  // Get required corpus based on mode
  const baseCorpus = corpusResult.corpusAtRetirement || 
                     corpusResult.fiNumberBuffered || 
                     corpusResult.corpusAtFI ||
                     corpusResult.coastNumber || 0
  
  // PV of corpus
  const corpusPV = mode === 'coast' 
    ? corpusResult.coastNumber 
    : calculatePV(baseCorpus, preRetirementReturn, yearsToRetirement)
  
  // Total PV required
  const totalPVRequired = corpusPV + totalGoalsPV
  const totalPVRequiredBuffered = totalPVRequired * (1 + (buffer || 0))
  
  // Total FV required at target age
  const totalFVRequired = calculateFV(totalPVRequiredBuffered, preRetirementReturn, yearsToRetirement)
  
  // Project current wealth
  const wealthProjection = calculateProjectedWealth(
    assets,
    existingSIP || 0,
    yearsToRetirement,
    preRetirementReturn
  )
  
  // Gap analysis
  const gapAnalysis = calculateGapAnalysis(
    totalFVRequired,
    wealthProjection.totalProjectedWealth,
    yearsToRetirement,
    preRetirementReturn
  )
  
  return {
    mode,
    timeline: {
      currentAge,
      retirementAge,
      lifeExpectancy,
      yearsToRetirement,
      yearsInRetirement
    },
    corpus: {
      ...corpusResult,
      totalFVRequired,
      totalPVRequired: totalPVRequiredBuffered
    },
    goals: goalResults,
    totalGoalsPV,
    wealth: wealthProjection,
    gap: gapAnalysis
  }
}

// ==================== SENSITIVITY ANALYSIS ====================

/**
 * Run sensitivity analysis varying a parameter
 */
export const runSensitivityAnalysis = (planData, parameter, range) => {
  const results = range.map(value => {
    const modifiedPlan = {
      ...planData,
      assumptions: {
        ...planData.assumptions,
        [parameter]: value
      }
    }
    
    const result = calculateRetirementPlan(modifiedPlan)
    
    return {
      parameterValue: value,
      requiredCorpus: result.corpus.totalFVRequired,
      projectedWealth: result.wealth.totalProjectedWealth,
      gap: result.gap.gap,
      requiredSIP: result.gap.requiredSIP,
      onTrackPercentage: result.gap.onTrackPercentage
    }
  })
  
  return {
    parameter,
    results
  }
}
