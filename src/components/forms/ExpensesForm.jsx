import { useState } from 'react'
import { usePlanStore, expensePresets } from '../../store/planStore'
import { formatINR, formatPercent } from '../../lib/formatters'
import { Card, Button, Modal, Input, AmountInput, Select, Badge } from '../ui'

const expenseTypes = [
  { value: 'monthly_living', label: 'Monthly Living Expenses' },
  { value: 'onetime', label: 'One-time Goal' },
  { value: 'yearly', label: 'Yearly Recurring' },
]

export default function ExpensesForm() {
  const { currentPlan, addExpense, updateExpense, removeExpense } = usePlanStore()
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const currentYear = new Date().getFullYear()
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'onetime',
    amount: 0,
    amountMode: 'today',
    targetYear: currentYear + 10,
    startYear: currentYear + 25,
    endYear: currentYear + 55,
    escalation: 0.06,
    priority: 'must'
  })

  const expenses = currentPlan.expenses || []
  const monthlyLiving = expenses.find(e => e.type === 'monthly_living')
  const otherExpenses = expenses.filter(e => e.type !== 'monthly_living')

  const handleOpenModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense)
      setFormData({
        name: expense.name || '',
        type: expense.type || 'onetime',
        amount: expense.amount || 0,
        amountMode: expense.amountMode || 'today',
        targetYear: expense.targetYear || currentYear + 10,
        startYear: expense.startYear || currentYear + 25,
        endYear: expense.endYear || currentYear + 55,
        escalation: expense.escalation || 0.06,
        priority: expense.priority || 'must'
      })
    } else {
      setEditingExpense(null)
      setFormData({
        name: '',
        type: 'onetime',
        amount: 0,
        amountMode: 'today',
        targetYear: currentYear + 10,
        startYear: currentYear + 25,
        endYear: currentYear + 55,
        escalation: 0.06,
        priority: 'must'
      })
    }
    setShowModal(true)
  }

  const handleSave = () => {
    if (editingExpense) {
      updateExpense(editingExpense.id, formData)
    } else {
      addExpense(formData)
    }
    setShowModal(false)
  }

  const handleQuickAdd = (preset) => {
    setFormData({
      name: preset.name,
      type: preset.type,
      amount: preset.defaultAmount,
      amountMode: 'today',
      targetYear: currentYear + 15,
      startYear: currentYear + 25,
      endYear: currentYear + 55,
      escalation: 0.06,
      priority: 'must'
    })
    setEditingExpense(null)
    setShowModal(true)
  }

  const getTypeIcon = (type) => {
    if (type === 'monthly_living') return '🏠'
    if (type === 'onetime') return '🎯'
    if (type === 'yearly') return '📅'
    return '📦'
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Expenses & Goals</h2>
        <p className="text-gray-600">
          Define your monthly living expenses and financial goals. These determine your required corpus.
        </p>
      </div>

      {/* Monthly Living Expenses */}
      <Card variant="flat">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-xl mr-2">🏠</span>
          Monthly Living Expenses
        </h3>
        <AmountInput
          value={monthlyLiving?.amount || 100000}
          onChange={(val) => {
            if (monthlyLiving) {
              updateExpense(monthlyLiving.id, { amount: val })
            } else {
              addExpense({
                name: 'Monthly Living Expenses',
                type: 'monthly_living',
                amount: val,
                amountMode: 'today',
                escalation: 0.06,
                priority: 'must'
              })
            }
          }}
          label="Current Monthly Expenses"
          hint="Your total monthly household expenses today. Will be adjusted for inflation at retirement."
        />
      </Card>

      {/* Quick Add Goals */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Add Goals</p>
        <div className="flex flex-wrap gap-2">
          {expensePresets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(preset)}
            >
              <span className="mr-2">{preset.icon}</span>
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Goals List */}
      {otherExpenses.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals added yet</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Add financial goals like child education, car purchase, or annual vacations.
          </p>
          <Button onClick={() => handleOpenModal()}>Add Your First Goal</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {otherExpenses.map((expense) => (
            <Card key={expense.id} variant="interactive" padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                    {getTypeIcon(expense.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{expense.name}</h4>
                      <Badge 
                        variant={expense.type === 'onetime' ? 'info' : 'purple'} 
                        size="xs"
                      >
                        {expense.type === 'onetime' ? 'One-time' : 'Yearly'}
                      </Badge>
                      {expense.priority === 'optional' && (
                        <Badge variant="default" size="xs">Optional</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {expense.type === 'onetime' 
                        ? `Target: ${expense.targetYear}` 
                        : `${expense.startYear} - ${expense.endYear}`
                      }
                      {expense.amountMode === 'today' && ' (today\'s ₹)'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatINR(expense.amount)}</p>
                    {expense.type === 'yearly' && (
                      <p className="text-xs text-gray-500">/year</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenModal(expense)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeExpense(expense.id)}
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
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Another Goal</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingExpense ? 'Edit Goal' : 'Add Goal'}
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingExpense ? 'Update' : 'Add'} Goal
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Goal Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={expenseTypes.filter(t => t.value !== 'monthly_living')}
          />

          <Input
            label="Goal Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Child's Education"
          />

          <AmountInput
            label={formData.type === 'yearly' ? 'Annual Amount' : 'Amount'}
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

          {formData.type === 'onetime' ? (
            <Input
              label="Target Year"
              type="number"
              value={formData.targetYear}
              onChange={(e) => setFormData({ ...formData, targetYear: parseInt(e.target.value) })}
              min={currentYear}
              max={currentYear + 60}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Year"
                type="number"
                value={formData.startYear}
                onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) })}
                min={currentYear}
                max={currentYear + 60}
              />
              <Input
                label="End Year"
                type="number"
                value={formData.endYear}
                onChange={(e) => setFormData({ ...formData, endYear: parseInt(e.target.value) })}
                min={formData.startYear}
                max={currentYear + 70}
              />
            </div>
          )}

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={[
              { value: 'must', label: 'Must have' },
              { value: 'optional', label: 'Nice to have' },
            ]}
          />
        </div>
      </Modal>
    </div>
  )
}
