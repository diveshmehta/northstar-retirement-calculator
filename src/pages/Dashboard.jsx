import { Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { usePlanStore, fireModes } from '../store/planStore'
import { useCalculations } from '../hooks/useCalculations'
import { formatINR, formatPercent } from '../lib/formatters'
import { Button, Card, CardHeader, CardTitle, Badge, MetricCardSkeleton } from '../components/ui'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine 
} from 'recharts'
import { calculateSIPFV, calculateFV } from '../lib/calculations'

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

  // Generate corpus projection data for the chart
  const projectionData = useMemo(() => {
    if (!calculatedResults || !currentPlan?.personA?.age) return []
    
    const yearsToRetirement = calculatedResults.timeline?.yearsToRetirement || 30
    const preReturn = currentPlan.assumptions?.preRetirementReturn || 0.12
    const targetCorpus = calculatedResults.corpus?.totalFVRequired || 0
    
    // Current assets value (discounted from projected)
    const currentAssets = calculatedResults.wealth?.totalAssetsFV 
      ? calculatedResults.wealth.totalAssetsFV / Math.pow(1 + preReturn, yearsToRetirement) 
      : 0
    
    // Monthly SIP (either existing or required)
    const monthlySIP = currentPlan.existingSIP || calculatedResults.gap?.requiredSIP || 0
    
    const data = []
    const currentYear = new Date().getFullYear()
    
    for (let year = 0; year <= yearsToRetirement; year++) {
      // Asset growth from current assets
      const assetGrowth = currentAssets * Math.pow(1 + preReturn, year)
      
      // SIP accumulation (using proper formula)
      let sipValue = 0
      if (monthlySIP > 0 && year > 0) {
        sipValue = calculateSIPFV(monthlySIP, preReturn, year)
      }
      
      // Total projected wealth at this year
      const totalWealth = assetGrowth + sipValue
      
      // Target line (linear interpolation for visualization)
      const targetAtYear = targetCorpus * (year / yearsToRetirement)
      
      data.push({
        year: currentYear + year,
        age: currentPlan.personA.age + year,
        assets: Math.round(assetGrowth),
        sip: Math.round(sipValue),
        total: Math.round(totalWealth),
        target: Math.round(targetAtYear)
      })
    }
    
    return data
  }, [calculatedResults, currentPlan])

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">
            Year {label} (Age {data.age})
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                Assets
              </span>
              <span className="font-mono font-medium">{formatINR(data.assets)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>
                SIP
              </span>
              <span className="font-mono font-medium">{formatINR(data.sip)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100">
              <span className="font-semibold">Total</span>
              <span className="font-mono font-semibold text-indigo-600">{formatINR(data.total)}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
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

      {/* Corpus Growth Chart */}
      {calculatedResults && projectionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle subtitle={`From age ${currentPlan?.personA?.age} to ${currentPlan?.personA?.retirementAge}`}>
              <span className="flex items-center">
                <span className="mr-2">📈</span>
                Corpus Growth Projection
              </span>
            </CardTitle>
          </CardHeader>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={projectionData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorSIP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`
                    if (val >= 100000) return `${(val / 100000).toFixed(0)}L`
                    return `${(val / 1000).toFixed(0)}K`
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={calculatedResults.corpus?.totalFVRequired} 
                  stroke="#EF4444" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: 'Target', 
                    position: 'right', 
                    fill: '#EF4444',
                    fontSize: 12
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="assets" 
                  stackId="1"
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  fill="url(#colorAssets)" 
                  name="Asset Growth"
                />
                <Area 
                  type="monotone" 
                  dataKey="sip" 
                  stackId="1"
                  stroke="#10B981" 
                  strokeWidth={2}
                  fill="url(#colorSIP)" 
                  name="SIP Accumulation"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <span className="w-4 h-4 rounded bg-gradient-to-b from-indigo-500 to-indigo-200 mr-2"></span>
              <span className="text-sm text-gray-600">Asset Growth</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 rounded bg-gradient-to-b from-emerald-500 to-emerald-200 mr-2"></span>
              <span className="text-sm text-gray-600">SIP Accumulation</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-1 bg-red-400 mr-2" style={{ borderStyle: 'dashed' }}></span>
              <span className="text-sm text-gray-600">Target Corpus</span>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-500">Starting Value</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatINR(projectionData[0]?.total || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Final Value</p>
              <p className="text-lg font-semibold text-emerald-600">
                {formatINR(projectionData[projectionData.length - 1]?.total || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Growth Multiple</p>
              <p className="text-lg font-semibold text-indigo-600">
                {projectionData[0]?.total > 0 
                  ? `${((projectionData[projectionData.length - 1]?.total || 0) / projectionData[0].total).toFixed(1)}x`
                  : '∞'
                }
              </p>
            </div>
          </div>
        </Card>
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
