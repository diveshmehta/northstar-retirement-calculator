import { usePlanStore, fireModes } from '../../store/planStore'
import { Input, Card } from '../ui'

const modeColors = {
  traditional: 'indigo',
  fire: 'orange',
  barista: 'amber',
  coast: 'teal',
  fatfire: 'purple',
}

export default function ModeSelector() {
  const { currentPlan, updatePlan, updateAssumptions } = usePlanStore()
  const selectedMode = currentPlan.mode || 'traditional'

  const handleModeChange = (modeId) => {
    updatePlan({ mode: modeId })
    
    // Set default SWR based on mode
    if (modeId === 'fire' || modeId === 'fatfire') {
      updateAssumptions({ swr: 0.04 })
    } else if (modeId === 'coast') {
      updateAssumptions({ swr: 0.04 })
    } else if (modeId === 'barista') {
      updateAssumptions({ swr: 0.035 })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Planning Mode</h2>
        <p className="text-gray-600">
          Select the retirement strategy that best fits your goals. Each mode uses different calculations.
        </p>
      </div>

      {/* Mode Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fireModes.map((mode) => {
          const isSelected = selectedMode === mode.id
          const colorClass = modeColors[mode.id] || 'indigo'
          
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`
                relative p-5 rounded-xl border-2 text-left transition-all duration-200
                ${isSelected 
                  ? `border-${colorClass}-500 bg-${colorClass}-50 ring-2 ring-${colorClass}-200` 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className={`absolute top-3 right-3 w-6 h-6 bg-${colorClass}-500 rounded-full flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              <div className="text-3xl mb-3">{mode.icon}</div>
              <h3 className={`font-semibold mb-1 ${isSelected ? `text-${colorClass}-900` : 'text-gray-900'}`}>
                {mode.name}
              </h3>
              <p className={`text-sm ${isSelected ? `text-${colorClass}-700` : 'text-gray-600'}`}>
                {mode.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Mode-specific options */}
      {(selectedMode === 'fire' || selectedMode === 'fatfire' || selectedMode === 'coast') && (
        <Card variant="flat">
          <h3 className="font-semibold text-gray-900 mb-4">
            {selectedMode === 'coast' ? 'Coast FIRE Options' : 'FIRE Options'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target FI Age"
              type="number"
              value={currentPlan.assumptions?.fiAge || ''}
              onChange={(e) => updateAssumptions({ fiAge: parseInt(e.target.value) || null })}
              placeholder={currentPlan.personA?.retirementAge?.toString() || '55'}
              hint="Age when you want to achieve financial independence"
              min={30}
              max={70}
            />
            
            {selectedMode === 'fatfire' && (
              <Input
                label="Fat FIRE Monthly Budget"
                type="number"
                value={currentPlan.fatFireMonthly || ''}
                onChange={(e) => updatePlan({ fatFireMonthly: parseInt(e.target.value) || 0 })}
                placeholder="200000"
                hint="Your desired monthly spending in retirement"
              />
            )}
          </div>
        </Card>
      )}

      {selectedMode === 'barista' && (
        <Card variant="flat">
          <h3 className="font-semibold text-gray-900 mb-4">Barista FIRE Options</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Semi-Retirement Age (FI)"
              type="number"
              value={currentPlan.assumptions?.fiAge || ''}
              onChange={(e) => updateAssumptions({ fiAge: parseInt(e.target.value) || null })}
              placeholder="45"
              hint="When you'll start working part-time"
              min={30}
              max={70}
            />
            
            <Input
              label="Full Retirement Age"
              type="number"
              value={currentPlan.assumptions?.fullRetirementAge || ''}
              onChange={(e) => updateAssumptions({ fullRetirementAge: parseInt(e.target.value) || null })}
              placeholder="55"
              hint="When you'll stop working entirely"
              min={35}
              max={75}
            />
          </div>
          
          <p className="mt-4 text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
            💡 <strong>Tip:</strong> Between your FI age and full retirement age, you'll work part-time 
            to cover some expenses while your corpus continues to grow.
          </p>
        </Card>
      )}

      {/* Mode explanation card */}
      <Card className={`bg-gradient-to-br from-${modeColors[selectedMode]}-50 to-white border-${modeColors[selectedMode]}-100`}>
        <div className="flex items-start space-x-4">
          <div className="text-4xl">{fireModes.find(m => m.id === selectedMode)?.icon}</div>
          <div>
            <h3 className={`font-semibold text-${modeColors[selectedMode]}-900 mb-2`}>
              How {fireModes.find(m => m.id === selectedMode)?.name} works
            </h3>
            <div className={`text-sm text-${modeColors[selectedMode]}-700 space-y-2`}>
              {selectedMode === 'traditional' && (
                <>
                  <p>Traditional retirement planning uses the <strong>annuity method</strong> to calculate how much corpus you need at retirement age to sustain your lifestyle until life expectancy.</p>
                  <p>Your expenses are adjusted for inflation, and the corpus is sized to provide inflation-adjusted withdrawals throughout retirement.</p>
                </>
              )}
              {selectedMode === 'fire' && (
                <>
                  <p>FIRE (Financial Independence, Retire Early) uses the <strong>Safe Withdrawal Rate (SWR)</strong> method, typically 4%.</p>
                  <p>Your FI Number = Annual Expenses ÷ SWR. Once your portfolio reaches this number, you can retire and live off withdrawals indefinitely.</p>
                </>
              )}
              {selectedMode === 'barista' && (
                <>
                  <p>Barista FIRE involves <strong>semi-retiring early</strong> with part-time work to cover some expenses.</p>
                  <p>This reduces the corpus needed initially, as your part-time income bridges the gap until full retirement.</p>
                </>
              )}
              {selectedMode === 'coast' && (
                <>
                  <p>Coast FIRE calculates your <strong>coast number</strong> – the amount you need invested today so that compound growth alone reaches your target at retirement.</p>
                  <p>Once you hit your coast number, you can "coast" without aggressive saving.</p>
                </>
              )}
              {selectedMode === 'fatfire' && (
                <>
                  <p>Fat FIRE is FIRE with a <strong>higher lifestyle budget</strong>. Same SWR calculation, bigger numbers.</p>
                  <p>For those who want financial independence without compromising on lifestyle.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
