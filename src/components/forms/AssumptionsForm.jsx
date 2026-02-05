import { usePlanStore } from '../../store/planStore'
import { Slider, Card, Input } from '../ui'
import { InfoTooltip } from '../ui/Tooltip'
import { formatPercent } from '../../lib/formatters'

export default function AssumptionsForm() {
  const { currentPlan, updateAssumptions } = usePlanStore()
  const assumptions = currentPlan.assumptions || {}

  // Calculate real return
  const realReturn = ((1 + (assumptions.postRetirementReturn || 0.08)) / (1 + (assumptions.inflation || 0.06)) - 1) * 100

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Assumptions</h2>
        <p className="text-gray-600">
          Set your expected returns, inflation, and other key assumptions. These significantly impact your calculations.
        </p>
      </div>

      {/* Returns */}
      <Card variant="flat">
        <h3 className="font-semibold text-gray-900 mb-4">Expected Returns</h3>
        
        <div className="space-y-6">
          <Slider
            label={
              <span className="flex items-center">
                Pre-Retirement Return (p.a.)
                <InfoTooltip content="Expected return on investments before you retire. Typically 10-14% for equity-heavy portfolios in India." />
              </span>
            }
            value={(assumptions.preRetirementReturn || 0.12) * 100}
            onChange={(val) => updateAssumptions({ preRetirementReturn: val / 100 })}
            min={4}
            max={18}
            step={0.5}
            marks={[
              { value: 6, label: '6%' },
              { value: 10, label: '10%' },
              { value: 14, label: '14%' },
            ]}
          />

          <Slider
            label={
              <span className="flex items-center">
                Post-Retirement Return (p.a.)
                <InfoTooltip content="Expected return after retirement. Usually lower (6-10%) as portfolio shifts to conservative investments." />
              </span>
            }
            value={(assumptions.postRetirementReturn || 0.08) * 100}
            onChange={(val) => updateAssumptions({ postRetirementReturn: val / 100 })}
            min={4}
            max={14}
            step={0.5}
            marks={[
              { value: 5, label: '5%' },
              { value: 8, label: '8%' },
              { value: 11, label: '11%' },
            ]}
          />
        </div>
      </Card>

      {/* Inflation */}
      <Card variant="flat">
        <h3 className="font-semibold text-gray-900 mb-4">Inflation</h3>
        
        <Slider
          label={
            <span className="flex items-center">
              Expected Inflation (p.a.)
              <InfoTooltip content="Historical India inflation is 5-7%. Consider lifestyle inflation which may be higher." />
            </span>
          }
          value={(assumptions.inflation || 0.06) * 100}
          onChange={(val) => updateAssumptions({ inflation: val / 100 })}
          min={3}
          max={10}
          step={0.5}
          marks={[
            { value: 4, label: '4%' },
            { value: 6, label: '6%' },
            { value: 8, label: '8%' },
          ]}
        />

        {/* Real Return Display */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-indigo-700">
              Real Return (Post-Retirement Return - Inflation)
              <InfoTooltip content="Your actual purchasing power growth after accounting for inflation. Should be positive for wealth preservation." />
            </span>
            <span className={`text-lg font-bold ${realReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {realReturn.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* SWR & Buffer (for FIRE modes) */}
      {(currentPlan.mode === 'fire' || currentPlan.mode === 'fatfire' || currentPlan.mode === 'barista' || currentPlan.mode === 'coast') && (
        <Card variant="flat">
          <h3 className="font-semibold text-gray-900 mb-4">FIRE Settings</h3>
          
          <div className="space-y-6">
            <Slider
              label={
                <span className="flex items-center">
                  Safe Withdrawal Rate (SWR)
                  <InfoTooltip content="The percentage of your portfolio you can withdraw annually. 4% is the traditional rule, but 3-3.5% is safer for early retirement." />
                </span>
              }
              value={(assumptions.swr || 0.04) * 100}
              onChange={(val) => updateAssumptions({ swr: val / 100 })}
              min={2.5}
              max={5}
              step={0.25}
              marks={[
                { value: 3, label: '3%' },
                { value: 4, label: '4%' },
                { value: 5, label: '5%' },
              ]}
            />

            <Slider
              label={
                <span className="flex items-center">
                  Safety Buffer
                  <InfoTooltip content="Extra cushion added to your target corpus for unexpected expenses or market volatility." />
                </span>
              }
              value={(assumptions.buffer || 0.10) * 100}
              onChange={(val) => updateAssumptions({ buffer: val / 100 })}
              min={0}
              max={30}
              step={5}
              marks={[
                { value: 0, label: '0%' },
                { value: 10, label: '10%' },
                { value: 20, label: '20%' },
              ]}
            />
          </div>
        </Card>
      )}

      {/* SIP & Growth */}
      <Card variant="flat">
        <h3 className="font-semibold text-gray-900 mb-4">Savings Growth</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Slider
            label={
              <span className="flex items-center">
                Salary Growth (p.a.)
                <InfoTooltip content="Expected annual increase in your income. Used for projecting future savings capacity." />
              </span>
            }
            value={(assumptions.salaryGrowth || 0.08) * 100}
            onChange={(val) => updateAssumptions({ salaryGrowth: val / 100 })}
            min={0}
            max={15}
            step={1}
          />

          <Slider
            label={
              <span className="flex items-center">
                Step-up SIP (p.a.)
                <InfoTooltip content="Annual increase in your SIP amount. E.g., 10% means your ₹50K SIP becomes ₹55K next year." />
              </span>
            }
            value={(assumptions.stepUpSIP || 0.10) * 100}
            onChange={(val) => updateAssumptions({ stepUpSIP: val / 100 })}
            min={0}
            max={20}
            step={1}
          />
        </div>
      </Card>

      {/* Summary */}
      <Card variant="highlight">
        <h3 className="font-semibold text-indigo-900 mb-3">Assumptions Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-indigo-600">Pre-Retirement Return</p>
            <p className="text-xl font-bold text-indigo-900">
              {formatPercent(assumptions.preRetirementReturn || 0.12, false, 1)}
            </p>
          </div>
          <div>
            <p className="text-indigo-600">Post-Retirement Return</p>
            <p className="text-xl font-bold text-indigo-900">
              {formatPercent(assumptions.postRetirementReturn || 0.08, false, 1)}
            </p>
          </div>
          <div>
            <p className="text-indigo-600">Inflation</p>
            <p className="text-xl font-bold text-indigo-900">
              {formatPercent(assumptions.inflation || 0.06, false, 1)}
            </p>
          </div>
          <div>
            <p className="text-indigo-600">Real Return</p>
            <p className={`text-xl font-bold ${realReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {realReturn.toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
