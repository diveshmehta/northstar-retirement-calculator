import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanStore, fireModes } from '../store/planStore'
import { useCalculations } from '../hooks/useCalculations'
import { formatINR, formatPercent, formatYears } from '../lib/formatters'
import { Card, CardHeader, CardTitle, Button, Badge, ProgressBar, Alert, Slider } from '../components/ui'
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function Results() {
  const navigate = useNavigate()
  const { currentPlan, results, setResults } = usePlanStore()
  const { calculate, calculatedResults, runSensitivity, sensitivityRanges } = useCalculations()

  // Calculate if no results
  useEffect(() => {
    if (!results && currentPlan?.personA?.age) {
      const newResults = calculate()
      if (newResults) {
        setResults(newResults)
      }
    }
  }, [results, currentPlan, calculate, setResults])

  const displayResults = results || calculatedResults

  if (!displayResults) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No results yet</h2>
        <p className="text-gray-600 mb-6">Complete the calculator to see your retirement analysis.</p>
        <Button onClick={() => navigate('/calculator')}>Go to Calculator</Button>
      </div>
    )
  }

  const modeInfo = fireModes.find(m => m.id === displayResults.mode) || fireModes[0]
  const isOnTrack = displayResults.gap?.onTrackPercentage >= 100
  const gap = displayResults.gap || {}

  // Prepare chart data
  const projectionData = []
  const yearsToRetirement = displayResults.timeline?.yearsToRetirement || 25
  const preReturn = currentPlan.assumptions?.preRetirementReturn || 0.12
  const currentAssets = displayResults.wealth?.totalAssetsFV ? 
    displayResults.wealth.totalAssetsFV / Math.pow(1 + preReturn, yearsToRetirement) : 0
  const monthlySIP = gap.requiredSIP || currentPlan.existingSIP || 0
  
  for (let year = 0; year <= yearsToRetirement; year++) {
    const assetGrowth = currentAssets * Math.pow(1 + preReturn, year)
    const sipValue = monthlySIP * 12 * ((Math.pow(1 + preReturn, year) - 1) / preReturn) * (1 + preReturn)
    
    projectionData.push({
      year: new Date().getFullYear() + year,
      assets: assetGrowth,
      sip: sipValue,
      total: assetGrowth + sipValue,
      target: displayResults.corpus?.totalFVRequired * (year / yearsToRetirement)
    })
  }

  // Expense breakdown for pie chart
  const expenseData = currentPlan.expenses?.filter(e => e.amount > 0).map((expense, index) => ({
    name: expense.name,
    value: expense.type === 'monthly_living' ? expense.amount * 12 : expense.amount,
    color: COLORS[index % COLORS.length]
  })) || []

  // Asset breakdown for pie chart
  const assetData = currentPlan.assets?.filter(a => a.currentValue > 0).map((asset, index) => ({
    name: asset.name,
    value: asset.currentValue,
    color: COLORS[index % COLORS.length]
  })) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">{modeInfo.icon}</span>
            <h1 className="text-2xl font-bold text-gray-900">{currentPlan.name || 'Retirement Plan'}</h1>
          </div>
          <p className="text-gray-600">{modeInfo.name} • {displayResults.timeline?.yearsToRetirement} years to retirement</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/calculator')}>
            Edit Plan
          </Button>
          <Button variant="secondary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert variant={isOnTrack ? 'success' : 'warning'}>
        {isOnTrack ? (
          <>
            <strong>Congratulations! You're on track.</strong> Your projected wealth exceeds your target corpus. 
            Consider increasing your lifestyle budget or retiring earlier.
          </>
        ) : (
          <>
            <strong>Action needed:</strong> You have a shortfall of {formatINR(gap.gap)}. 
            Increase your monthly SIP to {formatINR(gap.requiredSIP)} to close the gap.
          </>
        )}
      </Alert>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <p className="text-sm font-medium text-indigo-600 mb-1">Target Corpus</p>
          <p className="text-2xl font-bold text-indigo-900">{formatINR(displayResults.corpus?.totalFVRequired || 0)}</p>
          <p className="text-xs text-indigo-600 mt-1">at retirement</p>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <p className="text-sm font-medium text-emerald-600 mb-1">Projected Wealth</p>
          <p className="text-2xl font-bold text-emerald-900">{formatINR(displayResults.wealth?.totalProjectedWealth || 0)}</p>
          <p className="text-xs text-emerald-600 mt-1">at retirement</p>
        </Card>

        <Card className={`bg-gradient-to-br ${gap.hasShortfall ? 'from-rose-50 border-rose-100' : 'from-emerald-50 border-emerald-100'} to-white`}>
          <p className={`text-sm font-medium ${gap.hasShortfall ? 'text-rose-600' : 'text-emerald-600'} mb-1`}>
            {gap.hasShortfall ? 'Shortfall' : 'Surplus'}
          </p>
          <p className={`text-2xl font-bold ${gap.hasShortfall ? 'text-rose-900' : 'text-emerald-900'}`}>
            {formatINR(gap.gap || gap.surplus || 0)}
          </p>
          <Badge variant={gap.hasShortfall ? 'danger' : 'success'} className="mt-2">
            {formatPercent(gap.onTrackPercentage || 0, true, 0)} on track
          </Badge>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <p className="text-sm font-medium text-amber-600 mb-1">Required SIP</p>
          <p className="text-2xl font-bold text-amber-900">{formatINR(gap.requiredSIP || 0)}</p>
          <p className="text-xs text-amber-600 mt-1">per month</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Your progress towards the target">On-Track Meter</CardTitle>
        </CardHeader>
        <ProgressBar
          value={gap.onTrackPercentage || 0}
          max={100}
          size="lg"
          showLabel
        />
        <div className="flex justify-between mt-4 text-sm text-gray-600">
          <span>Current Progress</span>
          <span>Target: {formatINR(displayResults.corpus?.totalFVRequired || 0)}</span>
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Corpus Growth Projection */}
        <Card>
          <CardHeader>
            <CardTitle subtitle="How your wealth grows over time">Wealth Projection</CardTitle>
          </CardHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="year" stroke="#6B7280" fontSize={12} />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickFormatter={(val) => formatINR(val, { useLakhCrore: true, showSymbol: false })}
                />
                <Tooltip 
                  formatter={(val) => formatINR(val)}
                  labelStyle={{ color: '#111827' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="assets" 
                  stackId="1"
                  stroke="#4F46E5" 
                  fill="#4F46E5" 
                  fillOpacity={0.6}
                  name="Assets Growth"
                />
                <Area 
                  type="monotone" 
                  dataKey="sip" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                  name="SIP Accumulation"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle subtitle="Current portfolio breakdown">Asset Allocation</CardTitle>
          </CardHeader>
          <div className="h-80">
            {assetData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatINR(val)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No assets added yet
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Mode-Specific Insights */}
      <Card>
        <CardHeader>
          <CardTitle subtitle={`Key numbers for ${modeInfo.name}`}>
            <span className="flex items-center">
              <span className="mr-2">{modeInfo.icon}</span>
              {modeInfo.shortName} Insights
            </span>
          </CardTitle>
        </CardHeader>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {displayResults.mode === 'traditional' && (
            <>
              <div>
                <p className="text-sm text-gray-500">Monthly at Retirement</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINR(displayResults.corpus?.monthlyAtRetirement || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Annual at Retirement</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINR(displayResults.corpus?.annualAtRetirement || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Real Return</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPercent(displayResults.corpus?.realReturn || 0, false, 1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Retirement Duration</p>
                <p className="text-xl font-bold text-gray-900">
                  {displayResults.timeline?.yearsInRetirement} years
                </p>
              </div>
            </>
          )}
          
          {(displayResults.mode === 'fire' || displayResults.mode === 'fatfire') && (
            <>
              <div>
                <p className="text-sm text-gray-500">FI Number</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINR(displayResults.corpus?.fiNumber || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">With Buffer</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINR(displayResults.corpus?.fiNumberBuffered || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Safe Withdrawal Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPercent(currentPlan.assumptions?.swr || 0.04, false, 1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Annual Expenses at FI</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINR(displayResults.corpus?.netAnnualExpenses || 0)}
                </p>
              </div>
            </>
          )}
          
          {displayResults.mode === 'coast' && (
            <>
              <div>
                <p className="text-sm text-gray-500">Coast Number Today</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINR(displayResults.corpus?.coastNumber || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Target at Retirement</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINR(displayResults.corpus?.targetCorpusAtRetirement || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Years to Coast</p>
                <p className="text-xl font-bold text-gray-900">
                  {displayResults.corpus?.yearsToCoast || displayResults.timeline?.yearsToRetirement}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Assets</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINR(currentAssets)}
                </p>
              </div>
            </>
          )}
          
          {displayResults.mode === 'barista' && (
            <>
              <div>
                <p className="text-sm text-gray-500">Corpus at FI</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINR(displayResults.corpus?.corpusAtFI || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phase 1 (Part-time)</p>
                <p className="text-xl font-bold text-gray-900">
                  {displayResults.corpus?.yearsInPhase1 || 0} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phase 2 (Retired)</p>
                <p className="text-xl font-bold text-gray-900">
                  {displayResults.corpus?.yearsInPhase2 || 0} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Annual Phase 1 Need</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINR(displayResults.corpus?.annualPhase1 || 0)}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="All your financial goals and expenses">Expense Breakdown</CardTitle>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Goal</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {currentPlan.expenses?.map((expense, index) => (
                <tr key={expense.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{expense.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={expense.type === 'monthly_living' ? 'primary' : expense.type === 'onetime' ? 'info' : 'purple'}>
                      {expense.type === 'monthly_living' ? 'Monthly' : expense.type === 'onetime' ? 'One-time' : 'Yearly'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">
                    {formatINR(expense.amount)}
                    {expense.type === 'monthly_living' && <span className="text-gray-500">/mo</span>}
                    {expense.type === 'yearly' && <span className="text-gray-500">/yr</span>}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {expense.type === 'monthly_living' 
                      ? 'Retirement onwards'
                      : expense.type === 'onetime'
                        ? expense.targetYear
                        : `${expense.startYear} - ${expense.endYear}`
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Asset Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Your current investments and their projections">Asset Breakdown</CardTitle>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Asset</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Current Value</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Return</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Projected FV</th>
              </tr>
            </thead>
            <tbody>
              {displayResults.wealth?.projectedAssets?.map((asset, index) => (
                <tr key={asset.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{asset.name}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">
                    {formatINR(asset.currentValue)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatPercent(asset.returnRate, false, 1)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                    {formatINR(asset.projectedValue)}
                  </td>
                </tr>
              ))}
              {currentPlan.existingSIP > 0 && (
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">SIP Accumulation</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-900">
                    {formatINR(currentPlan.existingSIP)}/mo
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatPercent(currentPlan.assumptions?.preRetirementReturn || 0.12, false, 1)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                    {formatINR(displayResults.wealth?.sipFV || 0)}
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50 font-semibold">
                <td className="py-3 px-4 text-gray-900">Total</td>
                <td className="py-3 px-4 text-right font-mono text-gray-900">
                  {formatINR((displayResults.wealth?.projectedAssets?.reduce((sum, a) => sum + a.currentValue, 0) || 0) + (currentPlan.existingSIP || 0))}
                </td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-right font-mono text-emerald-600">
                  {formatINR(displayResults.wealth?.totalProjectedWealth || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action Items */}
      {gap.hasShortfall && (
        <Card variant="warning">
          <CardHeader>
            <CardTitle>
              <span className="flex items-center">
                <span className="mr-2">⚡</span>
                Action Plan
              </span>
            </CardTitle>
          </CardHeader>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-amber-900">Increase monthly SIP</p>
                <p className="text-amber-700">
                  Start a SIP of {formatINR(gap.requiredSIP)}/month to reach your target corpus.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-amber-900">Consider step-up SIP</p>
                <p className="text-amber-700">
                  Increase your SIP by 10% every year as your income grows.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-amber-900">Review and adjust</p>
                <p className="text-amber-700">
                  Come back quarterly to update your plan and track progress.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
