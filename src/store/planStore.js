import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Default values for a new plan
const defaultPlan = {
  // Profile
  name: 'My Retirement Plan',
  mode: 'traditional', // traditional, fire, barista, coast, fatfire
  
  // Person A (required)
  personA: {
    name: 'Person A',
    age: 30,
    retirementAge: 60
  },
  
  // Person B (optional)
  personB: null,
  
  // Life expectancy
  lifeExpectancy: 85,
  
  // Assumptions
  assumptions: {
    inflation: 0.06, // 6%
    preRetirementReturn: 0.12, // 12%
    postRetirementReturn: 0.08, // 8%
    salaryGrowth: 0.08, // 8%
    stepUpSIP: 0.10, // 10%
    swr: 0.04, // 4% (for FIRE modes)
    buffer: 0.10, // 10%
    fiAge: null, // For FIRE modes
    fullRetirementAge: null // For Barista FIRE
  },
  
  // Current assets
  assets: [],
  
  // Expenses and goals
  expenses: [
    {
      id: 'monthly-living',
      name: 'Monthly Living Expenses',
      type: 'monthly_living',
      amount: 100000, // ₹1 lakh
      amountMode: 'today',
      escalation: 0.06, // follows inflation
      priority: 'must'
    }
  ],
  
  // Income streams (post-retirement)
  incomeStreams: [],
  
  // Current SIP
  existingSIP: 0
}

// Asset category presets
export const assetCategories = [
  { id: 'epf', name: 'EPF/VPF', defaultReturn: 0.081, icon: '🏛️' },
  { id: 'ppf', name: 'PPF', defaultReturn: 0.071, icon: '🏦' },
  { id: 'nps', name: 'NPS', defaultReturn: 0.10, icon: '📊' },
  { id: 'mf_equity', name: 'Mutual Funds (Equity)', defaultReturn: 0.12, icon: '📈' },
  { id: 'mf_debt', name: 'Mutual Funds (Debt)', defaultReturn: 0.07, icon: '📉' },
  { id: 'mf_hybrid', name: 'Mutual Funds (Hybrid)', defaultReturn: 0.10, icon: '⚖️' },
  { id: 'stocks', name: 'Stocks/RSUs', defaultReturn: 0.12, icon: '💹' },
  { id: 'fd', name: 'FDs/Bonds', defaultReturn: 0.065, icon: '🔒' },
  { id: 'cash', name: 'Cash/Savings', defaultReturn: 0.04, icon: '💵' },
  { id: 'gold', name: 'Gold', defaultReturn: 0.08, icon: '🥇' },
  { id: 'real_estate', name: 'Real Estate', defaultReturn: 0.08, icon: '🏠' },
  { id: 'other', name: 'Other', defaultReturn: 0.08, icon: '📦' }
]

// Expense type presets
export const expensePresets = [
  { id: 'child_education', name: 'Child Education', type: 'onetime', icon: '🎓', defaultAmount: 2500000 },
  { id: 'child_marriage', name: 'Child Marriage', type: 'onetime', icon: '💒', defaultAmount: 3000000 },
  { id: 'car', name: 'Car Purchase', type: 'onetime', icon: '🚗', defaultAmount: 1500000 },
  { id: 'home_renovation', name: 'Home Renovation', type: 'onetime', icon: '🏠', defaultAmount: 2000000 },
  { id: 'medical_fund', name: 'Medical Emergency Fund', type: 'onetime', icon: '🏥', defaultAmount: 1000000 },
  { id: 'vacation', name: 'Annual Vacation', type: 'yearly', icon: '✈️', defaultAmount: 200000 },
  { id: 'insurance', name: 'Insurance Premiums', type: 'yearly', icon: '🛡️', defaultAmount: 100000 },
  { id: 'gifts', name: 'Gifts & Charity', type: 'yearly', icon: '🎁', defaultAmount: 50000 }
]

// Income stream presets
export const incomePresets = [
  { id: 'parttime', name: 'Part-time Income', icon: '💼' },
  { id: 'pension', name: 'Pension/Annuity', icon: '📋' },
  { id: 'rental', name: 'Rental Income', icon: '🏘️' },
  { id: 'other', name: 'Other Income', icon: '💰' }
]

// FIRE mode descriptions
export const fireModes = [
  {
    id: 'traditional',
    name: 'Traditional Retirement',
    shortName: 'Traditional',
    description: 'Plan for a comfortable retirement at age 60 with inflation-adjusted spending until life expectancy.',
    icon: '🎯',
    color: 'indigo'
  },
  {
    id: 'fire',
    name: 'FIRE (Financial Independence)',
    shortName: 'FIRE',
    description: 'Achieve financial independence early using the Safe Withdrawal Rate (SWR) method. Stop working when your portfolio can sustain your lifestyle.',
    icon: '🔥',
    color: 'orange'
  },
  {
    id: 'barista',
    name: 'Barista FIRE',
    shortName: 'Barista',
    description: 'Semi-retire early with part-time work to cover some expenses. Less corpus needed initially, transitioning to full retirement later.',
    icon: '☕',
    color: 'amber'
  },
  {
    id: 'coast',
    name: 'Coast FIRE',
    shortName: 'Coast',
    description: 'Save enough that compound growth alone will fund your retirement. After reaching your "coast number", you can stop saving aggressively.',
    icon: '🏖️',
    color: 'teal'
  },
  {
    id: 'fatfire',
    name: 'Fat FIRE',
    shortName: 'Fat FIRE',
    description: 'FIRE with a higher lifestyle budget. For those who want financial independence without compromising on lifestyle.',
    icon: '👑',
    color: 'purple'
  }
]

// Zustand store
export const usePlanStore = create(
  persist(
    (set, get) => ({
      // Current plan being edited
      currentPlan: { ...defaultPlan },
      
      // All saved plans
      savedPlans: [],
      
      // Current wizard step
      currentStep: 0,
      
      // Calculation results
      results: null,
      
      // Loading state
      isLoading: false,
      
      // Actions
      setCurrentPlan: (plan) => set({ currentPlan: { ...defaultPlan, ...plan } }),
      
      updatePlan: (updates) => set((state) => ({
        currentPlan: { ...state.currentPlan, ...updates }
      })),
      
      updatePersonA: (updates) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          personA: { ...state.currentPlan.personA, ...updates }
        }
      })),
      
      updatePersonB: (updates) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          personB: state.currentPlan.personB 
            ? { ...state.currentPlan.personB, ...updates }
            : { name: 'Person B', age: 30, retirementAge: 60, ...updates }
        }
      })),
      
      removePersonB: () => set((state) => ({
        currentPlan: { ...state.currentPlan, personB: null }
      })),
      
      updateAssumptions: (updates) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          assumptions: { ...state.currentPlan.assumptions, ...updates }
        }
      })),
      
      // Asset management
      addAsset: (asset) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          assets: [...state.currentPlan.assets, { 
            id: `asset-${Date.now()}`,
            ...asset 
          }]
        }
      })),
      
      updateAsset: (id, updates) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          assets: state.currentPlan.assets.map(a => 
            a.id === id ? { ...a, ...updates } : a
          )
        }
      })),
      
      removeAsset: (id) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          assets: state.currentPlan.assets.filter(a => a.id !== id)
        }
      })),
      
      // Expense management
      addExpense: (expense) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          expenses: [...state.currentPlan.expenses, {
            id: `expense-${Date.now()}`,
            ...expense
          }]
        }
      })),
      
      updateExpense: (id, updates) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          expenses: state.currentPlan.expenses.map(e => 
            e.id === id ? { ...e, ...updates } : e
          )
        }
      })),
      
      removeExpense: (id) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          expenses: state.currentPlan.expenses.filter(e => e.id !== id)
        }
      })),
      
      // Income stream management
      addIncomeStream: (income) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          incomeStreams: [...state.currentPlan.incomeStreams, {
            id: `income-${Date.now()}`,
            ...income
          }]
        }
      })),
      
      updateIncomeStream: (id, updates) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          incomeStreams: state.currentPlan.incomeStreams.map(i => 
            i.id === id ? { ...i, ...updates } : i
          )
        }
      })),
      
      removeIncomeStream: (id) => set((state) => ({
        currentPlan: {
          ...state.currentPlan,
          incomeStreams: state.currentPlan.incomeStreams.filter(i => i.id !== id)
        }
      })),
      
      // Wizard navigation
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      
      // Results
      setResults: (results) => set({ results }),
      clearResults: () => set({ results: null }),
      
      // Plan persistence
      savePlan: (plan) => set((state) => {
        const existingIndex = state.savedPlans.findIndex(p => p.id === plan.id)
        if (existingIndex >= 0) {
          const updated = [...state.savedPlans]
          updated[existingIndex] = { ...plan, updatedAt: new Date().toISOString() }
          return { savedPlans: updated }
        }
        return {
          savedPlans: [...state.savedPlans, {
            ...plan,
            id: `plan-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        }
      }),
      
      loadPlan: (planId) => {
        const plan = get().savedPlans.find(p => p.id === planId)
        if (plan) {
          set({ currentPlan: plan, currentStep: 0, results: null })
        }
      },
      
      deletePlan: (planId) => set((state) => ({
        savedPlans: state.savedPlans.filter(p => p.id !== planId)
      })),
      
      duplicatePlan: (planId) => {
        const plan = get().savedPlans.find(p => p.id === planId)
        if (plan) {
          const newPlan = {
            ...plan,
            id: `plan-${Date.now()}`,
            name: `${plan.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          set((state) => ({
            savedPlans: [...state.savedPlans, newPlan],
            currentPlan: newPlan
          }))
        }
      },
      
      // Reset
      resetPlan: () => set({ 
        currentPlan: { ...defaultPlan }, 
        currentStep: 0, 
        results: null 
      }),
      
      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'retirement-calculator-storage',
      partialize: (state) => ({
        savedPlans: state.savedPlans,
        currentPlan: state.currentPlan
      })
    }
  )
)

export default usePlanStore
