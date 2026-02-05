/**
 * Unit Tests for Retirement Calculator
 * Run with: node --experimental-vm-modules node_modules/jest/bin/jest.js
 * Or add to package.json scripts
 */

import {
  calculateFV,
  calculatePV,
  calculateRealReturn,
  annualToMonthlyRate,
  calculateSIPFV,
  calculateRequiredSIP,
  calculateTraditionalCorpus,
  calculateFIRECorpus,
  calculateCoastFIRE,
  calculateBaristaFIRE,
  calculateGapAnalysis,
  calculateProjectedWealth,
  calculateRetirementPlan
} from './calculations.js'

// ==================== TEST UTILITIES ====================

const assertApproxEqual = (actual, expected, tolerance = 0.01, message = '') => {
  const diff = Math.abs(actual - expected) / Math.max(Math.abs(expected), 1)
  if (diff > tolerance) {
    throw new Error(`${message} Expected ~${expected}, got ${actual} (diff: ${(diff * 100).toFixed(2)}%)`)
  }
  return true
}

const runTest = (name, testFn) => {
  try {
    testFn()
    console.log(`✅ ${name}`)
    return true
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`)
    return false
  }
}

// ==================== BASIC CALCULATION TESTS ====================

const testBasicCalculations = () => {
  console.log('\n📊 Basic Calculations Tests\n')
  
  runTest('FV: ₹1L at 10% for 10 years = ₹2.59L', () => {
    const result = calculateFV(100000, 0.10, 10)
    assertApproxEqual(result, 259374, 0.01)
  })
  
  runTest('PV: ₹2.59L discounted at 10% for 10 years = ₹1L', () => {
    const result = calculatePV(259374, 0.10, 10)
    assertApproxEqual(result, 100000, 0.01)
  })
  
  runTest('Real Return: 12% nominal - 6% inflation = 5.66%', () => {
    const result = calculateRealReturn(0.12, 0.06)
    assertApproxEqual(result, 0.0566, 0.01)
  })
  
  runTest('Monthly Rate: 12% annual = 0.949% monthly', () => {
    const result = annualToMonthlyRate(0.12)
    assertApproxEqual(result, 0.00949, 0.01)
  })
  
  runTest('FV with 0 years returns present value', () => {
    const result = calculateFV(100000, 0.10, 0)
    assertApproxEqual(result, 100000, 0.001)
  })
  
  runTest('PV with 0 years returns future value', () => {
    const result = calculatePV(100000, 0.10, 0)
    assertApproxEqual(result, 100000, 0.001)
  })
}

// ==================== SIP CALCULATION TESTS ====================

const testSIPCalculations = () => {
  console.log('\n💰 SIP Calculation Tests\n')
  
  runTest('SIP FV: ₹10K/mo at 12% for 20 years', () => {
    const result = calculateSIPFV(10000, 0.12, 20)
    // Using continuous compounding formula, should be around 91L
    assertApproxEqual(result, 9112111, 0.02)
  })
  
  runTest('Required SIP: ₹1Cr target at 12% for 20 years', () => {
    const result = calculateRequiredSIP(10000000, 0.12, 20)
    // Inverse of SIP FV, should be around ₹10,974
    assertApproxEqual(result, 10974, 0.02)
  })
  
  runTest('SIP FV with 0 years returns 0', () => {
    const result = calculateSIPFV(10000, 0.12, 0)
    assertApproxEqual(result, 0, 0.001)
  })
  
  runTest('Required SIP with 0 years returns 0', () => {
    const result = calculateRequiredSIP(10000000, 0.12, 0)
    assertApproxEqual(result, 0, 0.001)
  })
  
  runTest('Required SIP with 0 target returns 0', () => {
    const result = calculateRequiredSIP(0, 0.12, 20)
    assertApproxEqual(result, 0, 0.001)
  })
  
  runTest('SIP with 0% return is simple multiplication', () => {
    const result = calculateSIPFV(10000, 0, 10)
    assertApproxEqual(result, 1200000, 0.001) // 10000 * 12 * 10
  })
}

// ==================== TRADITIONAL CORPUS TESTS ====================

const testTraditionalCorpus = () => {
  console.log('\n🎯 Traditional Retirement Corpus Tests\n')
  
  runTest('Traditional: ₹1L/mo, 30yr to retire, 25yr in retirement', () => {
    const result = calculateTraditionalCorpus(100000, 30, 25, 0.06, 0.08)
    
    // Monthly at retirement should be inflated
    assertApproxEqual(result.monthlyAtRetirement, 574349, 0.02, 'Monthly at retirement')
    
    // Corpus should be significant
    if (result.corpusAtRetirement < 50000000) {
      throw new Error(`Corpus too low: ${result.corpusAtRetirement}`)
    }
  })
  
  runTest('Traditional: 0 years to retirement uses current expenses', () => {
    const result = calculateTraditionalCorpus(100000, 0, 25, 0.06, 0.08)
    assertApproxEqual(result.monthlyAtRetirement, 100000, 0.001)
  })
  
  runTest('Traditional: 0 years in retirement returns 0 corpus', () => {
    const result = calculateTraditionalCorpus(100000, 30, 0, 0.06, 0.08)
    assertApproxEqual(result.corpusAtRetirement, 0, 0.001)
  })
}

// ==================== FIRE CORPUS TESTS ====================

const testFIRECorpus = () => {
  console.log('\n🔥 FIRE Corpus Tests\n')
  
  runTest('FIRE: ₹12L/yr expenses at 4% SWR = ₹3Cr', () => {
    const result = calculateFIRECorpus(1200000, 0, 0.04, 0)
    assertApproxEqual(result.fiNumber, 30000000, 0.001)
  })
  
  runTest('FIRE: With ₹6L income, net ₹6L at 4% SWR = ₹1.5Cr', () => {
    const result = calculateFIRECorpus(1200000, 600000, 0.04, 0)
    assertApproxEqual(result.netAnnualExpenses, 600000, 0.001)
    assertApproxEqual(result.fiNumber, 15000000, 0.001)
  })
  
  runTest('FIRE: With 10% buffer, ₹3Cr becomes ₹3.3Cr', () => {
    const result = calculateFIRECorpus(1200000, 0, 0.04, 0.10)
    assertApproxEqual(result.fiNumberBuffered, 33000000, 0.001)
  })
  
  runTest('FIRE: 3% SWR = ₹4Cr for ₹12L expenses', () => {
    const result = calculateFIRECorpus(1200000, 0, 0.03, 0)
    assertApproxEqual(result.fiNumber, 40000000, 0.001)
  })
}

// ==================== COAST FIRE TESTS ====================

const testCoastFIRE = () => {
  console.log('\n🏖️ Coast FIRE Tests\n')
  
  runTest('Coast FIRE: ₹3Cr target in 25yr at 12% = ₹17.6L today', () => {
    const result = calculateCoastFIRE(30000000, 25, 0.12)
    assertApproxEqual(result.coastNumber, 1764706, 0.02)
  })
  
  runTest('Coast FIRE: 0 years means need full amount today', () => {
    const result = calculateCoastFIRE(30000000, 0, 0.12)
    assertApproxEqual(result.coastNumber, 30000000, 0.001)
  })
}

// ==================== BARISTA FIRE TESTS ====================

const testBaristaFIRE = () => {
  console.log('\n☕ Barista FIRE Tests\n')
  
  runTest('Barista FIRE: Basic two-phase calculation', () => {
    const result = calculateBaristaFIRE(
      100000,  // monthly expense
      30000,   // part-time income
      0,       // other income
      45,      // FI age
      55,      // full retirement age
      85,      // life expectancy
      0.06,    // inflation
      0.12,    // pre-retirement return
      0.08     // post-retirement return
    )
    
    // Phase 1 should be 10 years
    assertApproxEqual(result.yearsInPhase1, 10, 0.001)
    
    // Phase 2 should be 30 years
    assertApproxEqual(result.yearsInPhase2, 30, 0.001)
    
    // Annual Phase 1 should be (100000 - 30000) * 12 = 840000
    assertApproxEqual(result.annualPhase1, 840000, 0.001)
    
    // Corpus at FI should be positive and significant
    if (result.corpusAtFI < 10000000) {
      throw new Error(`Corpus too low: ${result.corpusAtFI}`)
    }
  })
}

// ==================== GAP ANALYSIS TESTS ====================

const testGapAnalysis = () => {
  console.log('\n📉 Gap Analysis Tests\n')
  
  runTest('Gap: ₹3Cr required, ₹2Cr projected = ₹1Cr gap', () => {
    const result = calculateGapAnalysis(30000000, 20000000, 25, 0.12)
    
    assertApproxEqual(result.gap, 10000000, 0.001)
    assertApproxEqual(result.hasShortfall, true, 0.001)
    assertApproxEqual(result.surplus, 0, 0.001)
    
    // Required SIP should be positive
    if (result.requiredSIP <= 0) {
      throw new Error(`Required SIP should be positive: ${result.requiredSIP}`)
    }
  })
  
  runTest('Gap: ₹2Cr required, ₹3Cr projected = ₹1Cr surplus', () => {
    const result = calculateGapAnalysis(20000000, 30000000, 25, 0.12)
    
    assertApproxEqual(result.gap, 0, 0.001)
    assertApproxEqual(result.hasShortfall, false, 0.001)
    assertApproxEqual(result.surplus, 10000000, 0.001)
    assertApproxEqual(result.requiredSIP, 0, 0.001)
  })
  
  runTest('Gap: On-track percentage calculation', () => {
    const result = calculateGapAnalysis(30000000, 20000000, 25, 0.12)
    assertApproxEqual(result.onTrackPercentage, 66.67, 0.01)
  })
  
  runTest('Gap: 0 years to target uses minimum 1 year', () => {
    // With 0 years, we now use minimum 1 year to avoid edge case
    const result = calculateGapAnalysis(30000000, 20000000, 0, 0.12)
    // SIP should be calculated for at least 1 year
    if (result.requiredSIP <= 0) {
      throw new Error(`SIP should be positive even with 0 years (uses minimum 1): ${result.requiredSIP}`)
    }
  })
}

// ==================== COMPLETE PLAN TESTS ====================

const testCompletePlan = () => {
  console.log('\n📋 Complete Retirement Plan Tests\n')
  
  const currentYear = new Date().getFullYear()
  
  const basePlan = {
    mode: 'traditional',
    personA: { age: 30, retirementAge: 60 },
    personB: null,
    lifeExpectancy: 85,
    assumptions: {
      inflation: 0.06,
      preRetirementReturn: 0.12,
      postRetirementReturn: 0.08,
      swr: 0.04,
      buffer: 0.10,
      stepUpSIP: 0.10
    },
    assets: [
      { id: '1', name: 'EPF', currentValue: 500000, category: 'epf', isLiquid: true }
    ],
    expenses: [
      { id: '1', name: 'Monthly Living', type: 'monthly_living', amount: 100000 }
    ],
    incomeStreams: [],
    existingSIP: 0
  }
  
  // Plan with multiple expense types (like the default in the app)
  const realWorldPlan = {
    mode: 'traditional',
    personA: { age: 30, retirementAge: 60 },
    personB: null,
    lifeExpectancy: 85,
    assumptions: {
      inflation: 0.06,
      preRetirementReturn: 0.12,
      postRetirementReturn: 0.08,
      swr: 0.04,
      buffer: 0.10,
      stepUpSIP: 0.10
    },
    assets: [], // No assets
    expenses: [
      { id: '1', name: 'Monthly Living', type: 'monthly_living', amount: 100000 },
      { id: '2', name: 'Yearly Household', type: 'yearly', amount: 200000, startYear: currentYear, endYear: currentYear + 30, escalation: 0.06 },
      { id: '3', name: 'Yearly Travel', type: 'yearly', amount: 150000, startYear: currentYear, endYear: currentYear + 30, escalation: 0.06 },
      { id: '4', name: 'Child Education', type: 'onetime', amount: 2500000, targetYear: currentYear + 15, escalation: 0.08 }
    ],
    incomeStreams: [],
    existingSIP: 0
  }
  
  runTest('Traditional Plan: Complete calculation', () => {
    const result = calculateRetirementPlan(basePlan)
    
    // Check timeline
    assertApproxEqual(result.timeline.yearsToRetirement, 30, 0.001)
    assertApproxEqual(result.timeline.yearsInRetirement, 25, 0.001)
    
    // Check corpus is calculated
    if (!result.corpus.totalFVRequired || result.corpus.totalFVRequired <= 0) {
      throw new Error(`Total FV Required should be positive: ${result.corpus.totalFVRequired}`)
    }
    
    // Check gap analysis
    if (result.gap.hasShortfall && result.gap.requiredSIP <= 0) {
      throw new Error(`If shortfall exists, required SIP should be positive. Gap: ${result.gap.gap}, SIP: ${result.gap.requiredSIP}`)
    }
  })
  
  runTest('FIRE Plan: Complete calculation', () => {
    const firePlan = { ...basePlan, mode: 'fire' }
    const result = calculateRetirementPlan(firePlan)
    
    // Check FI number is calculated
    if (!result.corpus.fiNumber || result.corpus.fiNumber <= 0) {
      throw new Error(`FI Number should be positive: ${result.corpus.fiNumber}`)
    }
    
    // Check gap analysis
    if (result.gap.hasShortfall && result.gap.requiredSIP <= 0) {
      throw new Error(`FIRE: If shortfall exists, SIP should be positive. Gap: ${result.gap.gap}, SIP: ${result.gap.requiredSIP}`)
    }
  })
  
  runTest('Coast FIRE Plan: Complete calculation', () => {
    const coastPlan = { ...basePlan, mode: 'coast' }
    const result = calculateRetirementPlan(coastPlan)
    
    // Check coast number is calculated
    if (!result.corpus.coastNumber || result.corpus.coastNumber <= 0) {
      throw new Error(`Coast Number should be positive: ${result.corpus.coastNumber}`)
    }
  })
  
  runTest('Barista FIRE Plan: Complete calculation', () => {
    const baristaPlan = { 
      ...basePlan, 
      mode: 'barista',
      assumptions: {
        ...basePlan.assumptions,
        fiAge: 45,
        fullRetirementAge: 55
      },
      incomeStreams: [
        { id: '1', type: 'parttime', amount: 30000, startAge: 45, endAge: 55 }
      ]
    }
    const result = calculateRetirementPlan(baristaPlan)
    
    // Check corpus at FI is calculated
    if (!result.corpus.corpusAtFI || result.corpus.corpusAtFI <= 0) {
      throw new Error(`Corpus at FI should be positive: ${result.corpus.corpusAtFI}`)
    }
  })
  
  runTest('Fat FIRE Plan: Complete calculation', () => {
    const fatPlan = { ...basePlan, mode: 'fatfire' }
    const result = calculateRetirementPlan(fatPlan)
    
    // Check FI number is calculated (same as FIRE)
    if (!result.corpus.fiNumber || result.corpus.fiNumber <= 0) {
      throw new Error(`Fat FIRE FI Number should be positive: ${result.corpus.fiNumber}`)
    }
  })
  
  runTest('Plan with no assets: Should still calculate', () => {
    const noAssetsPlan = { ...basePlan, assets: [] }
    const result = calculateRetirementPlan(noAssetsPlan)
    
    // Projected wealth should be 0
    assertApproxEqual(result.wealth.totalProjectedWealth, 0, 0.001)
    
    // Should have shortfall
    assertApproxEqual(result.gap.hasShortfall, true, 0.001)
    
    // Required SIP should be positive
    if (result.gap.requiredSIP <= 0) {
      throw new Error(`With no assets, required SIP should be positive: ${result.gap.requiredSIP}`)
    }
  })
  
  runTest('Plan with existing SIP: Should project SIP value', () => {
    const sipPlan = { ...basePlan, existingSIP: 50000 }
    const result = calculateRetirementPlan(sipPlan)
    
    // SIP FV should be positive
    if (result.wealth.sipFV <= 0) {
      throw new Error(`SIP FV should be positive: ${result.wealth.sipFV}`)
    }
  })
  
  runTest('Real-world plan with multiple expenses: SIP should be positive', () => {
    const result = calculateRetirementPlan(realWorldPlan)
    
    console.log('  Debug - Real-world plan results:')
    console.log(`    Years to retirement: ${result.timeline.yearsToRetirement}`)
    console.log(`    Total FV Required: ₹${Math.round(result.corpus.totalFVRequired / 100000)} L`)
    console.log(`    Projected Wealth: ₹${Math.round(result.wealth.totalProjectedWealth / 100000)} L`)
    console.log(`    Gap: ₹${Math.round(result.gap.gap / 100000)} L`)
    console.log(`    Required SIP: ₹${Math.round(result.gap.requiredSIP)}`)
    console.log(`    On-track: ${result.gap.onTrackPercentage.toFixed(1)}%`)
    
    // Timeline should be correct
    assertApproxEqual(result.timeline.yearsToRetirement, 30, 0.001)
    
    // Corpus should be positive
    if (result.corpus.totalFVRequired <= 0) {
      throw new Error(`Total FV Required should be positive: ${result.corpus.totalFVRequired}`)
    }
    
    // Gap should exist (no assets)
    assertApproxEqual(result.gap.hasShortfall, true, 0.001)
    
    // THIS IS THE CRITICAL TEST - Required SIP must be positive when there's a shortfall
    if (result.gap.requiredSIP <= 0) {
      throw new Error(`CRITICAL BUG: Required SIP should be positive when there's a shortfall!\n  Gap: ₹${result.gap.gap}\n  Required SIP: ₹${result.gap.requiredSIP}`)
    }
  })
  
  runTest('FIRE plan with multiple expenses: SIP should be positive', () => {
    const firePlan = { ...realWorldPlan, mode: 'fire' }
    const result = calculateRetirementPlan(firePlan)
    
    console.log('  Debug - FIRE plan results:')
    console.log(`    FI Number: ₹${Math.round(result.corpus.fiNumber / 100000)} L`)
    console.log(`    Total FV Required: ₹${Math.round(result.corpus.totalFVRequired / 100000)} L`)
    console.log(`    Gap: ₹${Math.round(result.gap.gap / 100000)} L`)
    console.log(`    Required SIP: ₹${Math.round(result.gap.requiredSIP)}`)
    
    if (result.gap.hasShortfall && result.gap.requiredSIP <= 0) {
      throw new Error(`FIRE: Required SIP should be positive when shortfall exists. Gap: ${result.gap.gap}, SIP: ${result.gap.requiredSIP}`)
    }
  })
  
  runTest('Coast FIRE plan: SIP should be positive', () => {
    const coastPlan = { ...realWorldPlan, mode: 'coast' }
    const result = calculateRetirementPlan(coastPlan)
    
    console.log('  Debug - Coast FIRE plan results:')
    console.log(`    Coast Number: ₹${Math.round(result.corpus.coastNumber / 100000)} L`)
    console.log(`    Total FV Required: ₹${Math.round(result.corpus.totalFVRequired / 100000)} L`)
    console.log(`    Gap: ₹${Math.round(result.gap.gap / 100000)} L`)
    console.log(`    Required SIP: ₹${Math.round(result.gap.requiredSIP)}`)
    
    if (result.gap.hasShortfall && result.gap.requiredSIP <= 0) {
      throw new Error(`Coast FIRE: Required SIP should be positive when shortfall exists. Gap: ${result.gap.gap}, SIP: ${result.gap.requiredSIP}`)
    }
  })
  
  runTest('Barista FIRE plan: SIP should be positive', () => {
    const baristaPlan = { 
      ...realWorldPlan, 
      mode: 'barista',
      assumptions: {
        ...realWorldPlan.assumptions,
        fiAge: 45,
        fullRetirementAge: 55
      },
      incomeStreams: [
        { id: '1', type: 'parttime', amount: 30000, startAge: 45, endAge: 55 }
      ]
    }
    const result = calculateRetirementPlan(baristaPlan)
    
    console.log('  Debug - Barista FIRE plan results:')
    console.log(`    Corpus at FI: ₹${Math.round(result.corpus.corpusAtFI / 100000)} L`)
    console.log(`    Total FV Required: ₹${Math.round(result.corpus.totalFVRequired / 100000)} L`)
    console.log(`    Gap: ₹${Math.round(result.gap.gap / 100000)} L`)
    console.log(`    Required SIP: ₹${Math.round(result.gap.requiredSIP)}`)
    
    if (result.gap.hasShortfall && result.gap.requiredSIP <= 0) {
      throw new Error(`Barista FIRE: Required SIP should be positive when shortfall exists. Gap: ${result.gap.gap}, SIP: ${result.gap.requiredSIP}`)
    }
  })
  
  runTest('Fat FIRE plan: SIP should be positive', () => {
    const fatPlan = { ...realWorldPlan, mode: 'fatfire' }
    const result = calculateRetirementPlan(fatPlan)
    
    console.log('  Debug - Fat FIRE plan results:')
    console.log(`    FI Number: ₹${Math.round(result.corpus.fiNumber / 100000)} L`)
    console.log(`    Total FV Required: ₹${Math.round(result.corpus.totalFVRequired / 100000)} L`)
    console.log(`    Gap: ₹${Math.round(result.gap.gap / 100000)} L`)
    console.log(`    Required SIP: ₹${Math.round(result.gap.requiredSIP)}`)
    
    if (result.gap.hasShortfall && result.gap.requiredSIP <= 0) {
      throw new Error(`Fat FIRE: Required SIP should be positive when shortfall exists. Gap: ${result.gap.gap}, SIP: ${result.gap.requiredSIP}`)
    }
  })
}

// ==================== EDGE CASE TESTS ====================

const testEdgeCases = () => {
  console.log('\n⚠️ Edge Case Tests\n')
  
  runTest('Edge: Already at retirement age uses minimum 1 year', () => {
    const plan = {
      mode: 'traditional',
      personA: { age: 60, retirementAge: 60 },
      personB: null,
      lifeExpectancy: 85,
      assumptions: {
        inflation: 0.06,
        preRetirementReturn: 0.12,
        postRetirementReturn: 0.08,
        swr: 0.04,
        buffer: 0.10
      },
      assets: [],
      expenses: [{ id: '1', type: 'monthly_living', amount: 100000 }],
      incomeStreams: [],
      existingSIP: 0
    }
    
    const result = calculateRetirementPlan(plan)
    
    // Years to retirement should be at least 1 (minimum to avoid edge case)
    assertApproxEqual(result.timeline.yearsToRetirement, 1, 0.001)
    
    // Should not crash
    if (isNaN(result.corpus.totalFVRequired)) {
      throw new Error('Corpus should not be NaN')
    }
    
    // Should calculate a valid SIP even at retirement age
    if (result.gap.hasShortfall && result.gap.requiredSIP <= 0) {
      throw new Error(`SIP should be positive when at retirement age: ${result.gap.requiredSIP}`)
    }
  })
  
  runTest('Edge: Very high inflation', () => {
    const plan = {
      mode: 'traditional',
      personA: { age: 30, retirementAge: 60 },
      personB: null,
      lifeExpectancy: 85,
      assumptions: {
        inflation: 0.15,
        preRetirementReturn: 0.12,
        postRetirementReturn: 0.08,
        swr: 0.04,
        buffer: 0.10
      },
      assets: [],
      expenses: [{ id: '1', type: 'monthly_living', amount: 100000 }],
      incomeStreams: [],
      existingSIP: 0
    }
    
    const result = calculateRetirementPlan(plan)
    
    // Should handle negative real return
    if (isNaN(result.corpus.totalFVRequired)) {
      throw new Error('Should handle negative real return')
    }
  })
  
  runTest('Edge: Zero monthly expenses', () => {
    const plan = {
      mode: 'traditional',
      personA: { age: 30, retirementAge: 60 },
      personB: null,
      lifeExpectancy: 85,
      assumptions: {
        inflation: 0.06,
        preRetirementReturn: 0.12,
        postRetirementReturn: 0.08,
        swr: 0.04,
        buffer: 0.10
      },
      assets: [{ id: '1', currentValue: 1000000, isLiquid: true }],
      expenses: [{ id: '1', type: 'monthly_living', amount: 0 }],
      incomeStreams: [],
      existingSIP: 0
    }
    
    const result = calculateRetirementPlan(plan)
    
    // Should not crash and corpus should be minimal
    if (isNaN(result.corpus.totalFVRequired)) {
      throw new Error('Should handle zero expenses')
    }
  })
}

// ==================== RUN ALL TESTS ====================

const runAllTests = () => {
  console.log('🧪 Running Retirement Calculator Unit Tests\n')
  console.log('=' .repeat(50))
  
  testBasicCalculations()
  testSIPCalculations()
  testTraditionalCorpus()
  testFIRECorpus()
  testCoastFIRE()
  testBaristaFIRE()
  testGapAnalysis()
  testCompletePlan()
  testEdgeCases()
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ All tests completed!')
}

// Run tests
runAllTests()
