import { useState } from 'react'
import { usePlanStore, incomePresets } from '../../store/planStore'
import { formatINR, formatPercent } from '../../lib/formatters'
import { Card, Button, Modal, Input, AmountInput, Select, Badge, Alert } from '../ui'

export default function IncomeForm() {
  const { currentPlan, addIncomeStream, updateIncomeStream, removeIncomeStream } = usePlanStore()
  const [showModal, setShowModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const currentYear = new Date().getFullYear()
  const retirementAge = currentPlan.assumptions?.fiAge || currentPlan.personA?.retirementAge || 60
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'pension',
    amount: 0,
    amountMode: 'today',
    startAge: retirementAge,
    endAge: currentPlan.lifeExpectancy || 85,
    growthRate: 0.03
  })

  const incomeStreams = currentPlan.incomeStreams || []
  const isBarista = currentPlan.mode === 'barista'

  const handleOpenModal = (income = null) => {
    if (income) {
      setEditingIncome(income)
      setFormData({
        name: income.name || '',
        type: income.type || 'pension',
        amount: income.amount || 0,
        amountMode: income.amountMode || 'today',
        startAge: income.startAge || retirementAge,
        endAge: income.endAge || (currentPlan.lifeExpectancy || 85),
        growthRate: income.growthRate || 0.03
      })
    } else {
      setEditingIncome(null)
      setFormData({
        name: '',
        type: 'pension',
        amount: 0,
        amountMode: 'today',
        startAge: retirementAge,
        endAge: currentPlan.lifeExpectancy || 85,
        growthRate: 0.03
      })
    }
    setShowModal(true)
  }

  const handleSave = () => {
    const preset = incomePresets.find(p => p.id === formData.type)
    const incomeData = {
      ...formData,
      name: formData.name || preset?.name || 'Income'
    }

    if (editingIncome) {
      updateIncomeStream(editingIncome.id, incomeData)
    } else {
      addIncomeStream(incomeData)
    }
    setShowModal(false)
  }

  const getTypeIcon = (type) => {
    const preset = incomePresets.find(p => p.id === type)
    return preset?.icon || '💰'
  }

  const totalMonthlyIncome = incomeStreams.reduce((sum, inc) => sum + (inc.amount || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Post-Retirement Income</h2>
        <p className="text-gray-600">
          Add any expected income after retirement. This reduces the corpus needed from your investments.
        </p>
      </div>

      {/* Barista FIRE specific notice */}
      {isBarista && (
        <Alert variant="info">
          <strong>Barista FIRE Mode:</strong> Add your expected part-time income here. This will be used 
          to calculate the reduced corpus needed during your semi-retirement phase.
        </Alert>
      )}

      {/* Quick Add Buttons */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Add Income Source</p>
        <div className="flex flex-wrap gap-2">
          {incomePresets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData({
                  name: preset.name,
                  type: preset.id,
                  amount: 0,
                  amountMode: 'today',
                  startAge: preset.id === 'parttime' ? (currentPlan.assumptions?.fiAge || 45) : retirementAge,
                  endAge: preset.id === 'parttime' ? (currentPlan.assumptions?.fullRetirementAge || 55) : (currentPlan.lifeExpectancy || 85),
                  growthRate: 0.03
                })
                setEditingIncome(null)
                setShowModal(true)
              }}
            >
              <span className="mr-2">{preset.icon}</span>
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Income List */}
      {incomeStreams.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💵</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No income streams added</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            {isBarista 
              ? 'Add your expected part-time income and any other post-retirement income.'
              : 'Add any pension, rental income, or other expected income in retirement. This is optional.'
            }
          </p>
          <Button onClick={() => handleOpenModal()}>Add Income Source</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {incomeStreams.map((income) => (
            <Card key={income.id} variant="interactive" padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
                    {getTypeIcon(income.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{income.name}</h4>
                      <Badge variant="success" size="xs">Income</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Age {income.startAge} - {income.endAge}
                      {income.amountMode === 'today' && ' (today\'s ₹)'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{formatINR(income.amount)}</p>
                    <p className="text-xs text-gray-500">/month</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenModal(income)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeIncomeStream(income.id)}
                      className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <button
            onClick={() => handleOpenModal()}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Another Income Source</span>
          </button>
        </div>
      )}

      {/* Summary */}
      {incomeStreams.length > 0 && (
        <Card variant="success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Total Monthly Income (at retirement)</p>
              <p className="text-3xl font-bold text-emerald-900">{formatINR(totalMonthlyIncome)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-600">Annual Income</p>
              <p className="text-xl font-bold text-emerald-900">{formatINR(totalMonthlyIncome * 12)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Skip notice */}
      {incomeStreams.length === 0 && !isBarista && (
        <p className="text-sm text-gray-500 text-center">
          💡 No post-retirement income? That's okay! Your plan will assume all expenses are funded from your corpus.
        </p>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingIncome ? 'Edit Income Source' : 'Add Income Source'}
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingIncome ? 'Update' : 'Add'} Income
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Income Type"
            value={formData.type}
            onChange={(e) => {
              const preset = incomePresets.find(p => p.id === e.target.value)
              setFormData({
                ...formData,
                type: e.target.value,
                name: formData.name || preset?.name || ''
              })
            }}
            options={incomePresets.map(p => ({
              value: p.id,
              label: `${p.icon} ${p.name}`
            }))}
          />

          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., NPS Pension"
          />

          <AmountInput
            label="Monthly Amount"
            value={formData.amount}
            onChange={(val) => setFormData({ ...formData, amount: val })}
          />

          <Select
            label="Amount Type"
            value={formData.amountMode}
            onChange={(e) => setFormData({ ...formData, amountMode: e.target.value })}
            options={[
              { value: 'today', label: 'Today\'s rupees (will be inflated)' },
              { value: 'future', label: 'Future rupees (as-is)' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Age"
              type="number"
              value={formData.startAge}
              onChange={(e) => setFormData({ ...formData, startAge: parseInt(e.target.value) })}
              min={currentPlan.personA?.age || 30}
              max={currentPlan.lifeExpectancy || 85}
            />
            <Input
              label="End Age"
              type="number"
              value={formData.endAge}
              onChange={(e) => setFormData({ ...formData, endAge: parseInt(e.target.value) })}
              min={formData.startAge}
              max={currentPlan.lifeExpectancy || 100}
            />
          </div>

          <Input
            label="Annual Growth Rate"
            type="number"
            value={(formData.growthRate || 0) * 100}
            onChange={(e) => setFormData({ ...formData, growthRate: parseFloat(e.target.value) / 100 })}
            suffix="%"
            hint="Expected annual increase in this income (e.g., pension DA)"
          />
        </div>
      </Modal>
    </div>
  )
}
