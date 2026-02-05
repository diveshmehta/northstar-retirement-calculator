import { Link, useNavigate } from 'react-router-dom'
import { usePlanStore, fireModes } from '../store/planStore'
import { useCalculations } from '../hooks/useCalculations'
import { formatINR, formatPercent } from '../lib/formatters'
import { Button, Card, CardHeader, CardTitle, Badge, MetricCardSkeleton } from '../components/ui'

export default function Dashboard() {
  const navigate = useNavigate()
  const { savedPlans, currentPlan, loadPlan, deletePlan, resetPlan } = usePlanStore()
  const { calculatedResults } = useCalculations()

  const handleNewPlan = () => {
    resetPlan()
    navigate('/calculator')
  }

  const handleLoadPlan = (planId) => {
    loadPlan(planId)
    navigate('/calculator')
  }

  const handleDeletePlan = (e, planId) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this plan?')) {
      deletePlan(planId)
    }
  }

  const getModeInfo = (mode) => {
    return fireModes.find(m => m.id === mode) || fireModes[0]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your retirement planning progress</p>
        </div>
        <Button onClick={handleNewPlan}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Plan
        </Button>
      </div>

      {/* Quick Stats - Only show if there's an active plan with results */}
      {calculatedResults && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Target Corpus</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">
                  {formatINR(calculatedResults.corpus?.totalFVRequired || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Projected Wealth</p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  {formatINR(calculatedResults.wealth?.totalProjectedWealth || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </Card>

          <Card className={`bg-gradient-to-br ${calculatedResults.gap?.hasShortfall ? 'from-rose-50 border-rose-100' : 'from-emerald-50 border-emerald-100'} to-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${calculatedResults.gap?.hasShortfall ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {calculatedResults.gap?.hasShortfall ? 'Gap' : 'Surplus'}
                </p>
                <p className={`text-2xl font-bold mt-1 ${calculatedResults.gap?.hasShortfall ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {formatINR(calculatedResults.gap?.gap || calculatedResults.gap?.surplus || 0)}
                </p>
              </div>
              <div className={`w-12 h-12 ${calculatedResults.gap?.hasShortfall ? 'bg-rose-100' : 'bg-emerald-100'} rounded-xl flex items-center justify-center`}>
                <span className="text-2xl">{calculatedResults.gap?.hasShortfall ? '⚠️' : '✅'}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Required SIP</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {formatINR(calculatedResults.gap?.requiredSIP || 0)}/mo
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Current Plan Card */}
      {currentPlan && currentPlan.personA?.age && (
        <Card>
          <CardHeader action={
            <Link to="/calculator">
              <Button variant="outline" size="sm">Continue Editing</Button>
            </Link>
          }>
            <CardTitle subtitle="Your active plan">
              {currentPlan.name || 'Current Plan'}
            </CardTitle>
          </CardHeader>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Mode</p>
              <p className="font-medium text-gray-900 flex items-center mt-1">
                <span className="mr-2">{getModeInfo(currentPlan.mode).icon}</span>
                {getModeInfo(currentPlan.mode).shortName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Age</p>
              <p className="font-medium text-gray-900 mt-1">{currentPlan.personA.age} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Retirement Age</p>
              <p className="font-medium text-gray-900 mt-1">{currentPlan.personA.retirementAge} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">On Track</p>
              <Badge 
                variant={calculatedResults?.gap?.onTrackPercentage >= 100 ? 'success' : 'warning'}
                className="mt-1"
              >
                {formatPercent(calculatedResults?.gap?.onTrackPercentage || 0, true, 0)}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Saved Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Plans</h2>
        
        {savedPlans.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved plans yet</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Create your first retirement plan to start tracking your financial goals.
            </p>
            <Button onClick={handleNewPlan}>Create Your First Plan</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPlans.map((plan) => {
              const mode = getModeInfo(plan.mode)
              return (
                <Card 
                  key={plan.id}
                  variant="interactive"
                  onClick={() => handleLoadPlan(plan.id)}
                  className="relative group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-${mode.color}-100 rounded-xl flex items-center justify-center text-xl`}>
                        {mode.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-500">{mode.shortName}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeletePlan(e, plan.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ages</span>
                      <span className="text-gray-900">
                        {plan.personA?.age} → {plan.personA?.retirementAge}
                      </span>
                    </div>
                    {plan.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Updated</span>
                        <span className="text-gray-900">
                          {new Date(plan.updatedAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="interactive" onClick={() => navigate('/calculator')} className="text-center">
          <div className="text-3xl mb-3">🧮</div>
          <h3 className="font-semibold text-gray-900">Calculator</h3>
          <p className="text-sm text-gray-600 mt-1">Build or edit your plan</p>
        </Card>
        
        <Card variant="interactive" onClick={() => navigate('/results')} className="text-center">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-gray-900">Results</h3>
          <p className="text-sm text-gray-600 mt-1">View detailed analysis</p>
        </Card>
        
        <Card variant="interactive" className="text-center opacity-60 cursor-not-allowed">
          <div className="text-3xl mb-3">📄</div>
          <h3 className="font-semibold text-gray-900">Export PDF</h3>
          <p className="text-sm text-gray-600 mt-1">Coming soon</p>
        </Card>
      </div>
    </div>
  )
}
