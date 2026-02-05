import { forwardRef, useState, useCallback } from 'react'
import { formatINR, parseINR, formatIndianNumber } from '../../lib/formatters'

const AmountInput = forwardRef(({
  label,
  value,
  onChange,
  error,
  hint,
  className = '',
  disabled = false,
  required = false,
  showLakhCrore = true,
  min = 0,
  max,
  placeholder = 'Enter amount',
  ...props
}, ref) => {
  const [displayValue, setDisplayValue] = useState(() => {
    if (value) {
      return formatIndianNumber(value)
    }
    return ''
  })
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    // Show raw number on focus
    if (value) {
      setDisplayValue(value.toString())
    }
  }, [value])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Format on blur
    const numValue = parseINR(displayValue)
    setDisplayValue(numValue ? formatIndianNumber(numValue) : '')
  }, [displayValue])

  const handleChange = useCallback((e) => {
    const inputValue = e.target.value
    
    // Allow only numbers, commas, and decimal
    const sanitized = inputValue.replace(/[^\d.,]/g, '')
    setDisplayValue(sanitized)
    
    // Parse and call onChange
    const numValue = parseINR(sanitized)
    if (onChange) {
      onChange(numValue)
    }
  }, [onChange])

  const handleQuickAmount = useCallback((amount) => {
    const newValue = (value || 0) + amount
    setDisplayValue(formatIndianNumber(newValue))
    if (onChange) {
      onChange(newValue)
    }
  }, [value, onChange])

  const quickAmounts = [
    { label: '+1L', value: 100000 },
    { label: '+5L', value: 500000 },
    { label: '+10L', value: 1000000 },
    { label: '+1Cr', value: 10000000 },
  ]

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 font-medium">₹</span>
        </div>
        
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full pl-8 pr-4 py-2.5 text-gray-900 bg-white border rounded-lg
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors duration-200 font-mono
            ${error ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-gray-300'}
          `}
          {...props}
        />
        
        {showLakhCrore && value > 0 && !isFocused && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {formatINR(value, { useLakhCrore: true, showSymbol: false })}
            </span>
          </div>
        )}
      </div>
      
      {/* Quick amount buttons */}
      <div className="flex gap-2 mt-2">
        {quickAmounts.map((qa) => (
          <button
            key={qa.label}
            type="button"
            onClick={() => handleQuickAmount(qa.value)}
            disabled={disabled}
            className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {qa.label}
          </button>
        ))}
        {value > 0 && (
          <button
            type="button"
            onClick={() => {
              setDisplayValue('')
              onChange?.(0)
            }}
            disabled={disabled}
            className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1.5 text-sm text-rose-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
})

AmountInput.displayName = 'AmountInput'

export default AmountInput
