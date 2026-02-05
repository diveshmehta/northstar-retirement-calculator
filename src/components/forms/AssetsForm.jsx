import { useState } from 'react'
import { usePlanStore, assetCategories } from '../../store/planStore'
import { formatINR, formatPercent } from '../../lib/formatters'
import { Card, Button, Modal, Input, AmountInput, Select, Badge } from '../ui'

export default function AssetsForm() {
  const { currentPlan, addAsset, updateAsset, removeAsset, updatePlan } = usePlanStore()
  const [showModal, setShowModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'mf_equity',
    currentValue: 0,
    returnOverride: null,
    isLiquid: true,
    tag: 'retirement'
  })

  const assets = currentPlan.assets || []
  const totalAssets = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0)

  const handleOpenModal = (asset = null) => {
    if (asset) {
      setEditingAsset(asset)
      setFormData({
        name: asset.name || '',
        category: asset.category || 'other',
        currentValue: asset.currentValue || 0,
        returnOverride: asset.returnOverride,
        isLiquid: asset.isLiquid !== false,
        tag: asset.tag || 'retirement'
      })
    } else {
      setEditingAsset(null)
      setFormData({
        name: '',
        category: 'mf_equity',
        currentValue: 0,
        returnOverride: null,
        isLiquid: true,
        tag: 'retirement'
      })
    }
    setShowModal(true)
  }

  const handleSave = () => {
    const categoryInfo = assetCategories.find(c => c.id === formData.category)
    const assetData = {
      ...formData,
      name: formData.name || categoryInfo?.name || 'Asset',
      defaultReturn: categoryInfo?.defaultReturn || 0.08
    }

    if (editingAsset) {
      updateAsset(editingAsset.id, assetData)
    } else {
      addAsset(assetData)
    }
    setShowModal(false)
  }

  const getCategoryIcon = (categoryId) => {
    return assetCategories.find(c => c.id === categoryId)?.icon || '📦'
  }

  const getExpectedReturn = (asset) => {
    if (asset.returnOverride !== null && asset.returnOverride !== undefined) {
      return asset.returnOverride
    }
    const category = assetCategories.find(c => c.id === asset.category)
    return category?.defaultReturn || 0.08
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Current Assets</h2>
        <p className="text-gray-600">
          Add all your current investments and savings. These form the foundation of your retirement corpus.
        </p>
      </div>

      {/* Existing SIP */}
      <Card variant="flat">
        <h3 className="font-semibold text-gray-900 mb-4">Current Monthly SIP</h3>
        <AmountInput
          value={currentPlan.existingSIP || 0}
          onChange={(val) => updatePlan({ existingSIP: val })}
          label="Monthly SIP Amount"
          hint="Your total monthly systematic investment across all funds"
        />
      </Card>

      {/* Quick Add Buttons */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Add</p>
        <div className="flex flex-wrap gap-2">
          {assetCategories.slice(0, 8).map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData({
                  name: category.name,
                  category: category.id,
                  currentValue: 0,
                  returnOverride: null,
                  isLiquid: true,
                  tag: 'retirement'
                })
                setEditingAsset(null)
                setShowModal(true)
              }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Assets List */}
      {assets.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets added yet</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Add your savings, investments, and other assets to calculate your projected wealth.
          </p>
          <Button onClick={() => handleOpenModal()}>Add Your First Asset</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <Card key={asset.id} variant="interactive" padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                    {getCategoryIcon(asset.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{asset.name}</h4>
                      {!asset.isLiquid && (
                        <Badge variant="warning" size="xs">Illiquid</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatPercent(getExpectedReturn(asset), false, 1)} expected return
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatINR(asset.currentValue)}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenModal(asset)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeAsset(asset.id)}
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
            <span>Add Another Asset</span>
          </button>
        </div>
      )}

      {/* Total Summary */}
      {assets.length > 0 && (
        <Card variant="highlight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600">Total Assets</p>
              <p className="text-3xl font-bold text-indigo-900">{formatINR(totalAssets)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-600">Number of Assets</p>
              <p className="text-3xl font-bold text-indigo-900">{assets.length}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAsset ? 'Edit Asset' : 'Add Asset'}
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingAsset ? 'Update' : 'Add'} Asset
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Asset Category"
            value={formData.category}
            onChange={(e) => {
              const category = assetCategories.find(c => c.id === e.target.value)
              setFormData({
                ...formData,
                category: e.target.value,
                name: formData.name || category?.name || ''
              })
            }}
            options={assetCategories.map(c => ({
              value: c.id,
              label: `${c.icon} ${c.name} (${formatPercent(c.defaultReturn, false, 1)} default)`
            }))}
          />

          <Input
            label="Asset Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., HDFC Equity Fund"
          />

          <AmountInput
            label="Current Value"
            value={formData.currentValue}
            onChange={(val) => setFormData({ ...formData, currentValue: val })}
          />

          <Input
            label="Return Override (optional)"
            type="number"
            value={formData.returnOverride !== null ? formData.returnOverride * 100 : ''}
            onChange={(e) => setFormData({
              ...formData,
              returnOverride: e.target.value ? parseFloat(e.target.value) / 100 : null
            })}
            placeholder={`Default: ${formatPercent(assetCategories.find(c => c.id === formData.category)?.defaultReturn || 0.08, false, 1)}`}
            suffix="%"
            hint="Leave empty to use category default"
          />

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isLiquid"
              checked={formData.isLiquid}
              onChange={(e) => setFormData({ ...formData, isLiquid: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isLiquid" className="text-sm text-gray-700">
              Include in retirement corpus calculation
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
