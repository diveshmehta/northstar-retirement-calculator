import { useState } from 'react'
import { usePlanStore } from '../../store/planStore'
import { Input, Card, Button } from '../ui'

export default function ProfileForm() {
  const { currentPlan, updatePlan, updatePersonA, updatePersonB, removePersonB } = usePlanStore()
  const [showPersonB, setShowPersonB] = useState(!!currentPlan.personB)

  const handleAddPersonB = () => {
    setShowPersonB(true)
    updatePersonB({ name: 'Person B', age: 30, retirementAge: 60 })
  }

  const handleRemovePersonB = () => {
    setShowPersonB(false)
    removePersonB()
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile & Timeline</h2>
        <p className="text-gray-600">
          Tell us about yourself and when you'd like to retire. This helps us calculate your timeline.
        </p>
      </div>

      {/* Plan Name */}
      <Input
        label="Plan Name"
        value={currentPlan.name || ''}
        onChange={(e) => updatePlan({ name: e.target.value })}
        placeholder="My Retirement Plan"
        hint="Give your plan a memorable name"
      />

      {/* Person A */}
      <Card variant="flat">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Primary Person</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Name"
            value={currentPlan.personA?.name || ''}
            onChange={(e) => updatePersonA({ name: e.target.value })}
            placeholder="Your name"
          />
          
          <Input
            label="Current Age"
            type="number"
            value={currentPlan.personA?.age || ''}
            onChange={(e) => updatePersonA({ age: parseInt(e.target.value) || 0 })}
            placeholder="30"
            min={18}
            max={80}
          />
          
          <Input
            label="Retirement Age"
            type="number"
            value={currentPlan.personA?.retirementAge || ''}
            onChange={(e) => updatePersonA({ retirementAge: parseInt(e.target.value) || 0 })}
            placeholder="60"
            min={30}
            max={80}
          />
        </div>
      </Card>

      {/* Person B */}
      {showPersonB ? (
        <Card variant="flat">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Partner/Spouse</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemovePersonB}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Remove
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Name"
              value={currentPlan.personB?.name || ''}
              onChange={(e) => updatePersonB({ name: e.target.value })}
              placeholder="Partner's name"
            />
            
            <Input
              label="Current Age"
              type="number"
              value={currentPlan.personB?.age || ''}
              onChange={(e) => updatePersonB({ age: parseInt(e.target.value) || 0 })}
              placeholder="28"
              min={18}
              max={80}
            />
            
            <Input
              label="Retirement Age"
              type="number"
              value={currentPlan.personB?.retirementAge || ''}
              onChange={(e) => updatePersonB({ retirementAge: parseInt(e.target.value) || 0 })}
              placeholder="58"
              min={30}
              max={80}
            />
          </div>
        </Card>
      ) : (
        <button
          onClick={handleAddPersonB}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Partner/Spouse</span>
        </button>
      )}

      {/* Life Expectancy */}
      <Input
        label="Life Expectancy"
        type="number"
        value={currentPlan.lifeExpectancy || 85}
        onChange={(e) => updatePlan({ lifeExpectancy: parseInt(e.target.value) || 85 })}
        placeholder="85"
        min={60}
        max={100}
        hint="Used to calculate how long your retirement corpus needs to last"
      />

      {/* Timeline Summary */}
      {currentPlan.personA?.age && currentPlan.personA?.retirementAge && (
        <Card variant="highlight">
          <h3 className="font-semibold text-indigo-900 mb-3">Timeline Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-indigo-600">Years to Retirement</p>
              <p className="text-2xl font-bold text-indigo-900">
                {Math.max(0, currentPlan.personA.retirementAge - currentPlan.personA.age)}
              </p>
            </div>
            <div>
              <p className="text-indigo-600">Retirement Duration</p>
              <p className="text-2xl font-bold text-indigo-900">
                {Math.max(0, (currentPlan.lifeExpectancy || 85) - currentPlan.personA.retirementAge)} years
              </p>
            </div>
            <div>
              <p className="text-indigo-600">Retirement Year</p>
              <p className="text-2xl font-bold text-indigo-900">
                {new Date().getFullYear() + Math.max(0, currentPlan.personA.retirementAge - currentPlan.personA.age)}
              </p>
            </div>
            <div>
              <p className="text-indigo-600">Planning Horizon</p>
              <p className="text-2xl font-bold text-indigo-900">
                {Math.max(0, (currentPlan.lifeExpectancy || 85) - currentPlan.personA.age)} years
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
