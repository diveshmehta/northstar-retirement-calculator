import { forwardRef } from 'react'
import { formatPercent } from '../../lib/formatters'

const Slider = forwardRef(({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  formatValue,
  unit = '%',
  marks = [],
  disabled = false,
  className = '',
  hint,
  ...props
}, ref) => {
  const percentage = ((value - min) / (max - min)) * 100

  const displayValue = formatValue 
    ? formatValue(value) 
    : unit === '%' 
      ? formatPercent(value, true, 1)
      : `${value}${unit}`

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className="text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {displayValue}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className={`
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:bg-indigo-600
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:hover:bg-indigo-700
            [&::-webkit-slider-thumb]:transition-colors
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:bg-indigo-600
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:cursor-pointer
          `}
          style={{
            background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`
          }}
          {...props}
        />
        
        {/* Marks */}
        {marks.length > 0 && (
          <div className="relative w-full mt-2">
            {marks.map((mark) => {
              const markPosition = ((mark.value - min) / (max - min)) * 100
              return (
                <div
                  key={mark.value}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${markPosition}%` }}
                >
                  <div className="w-0.5 h-2 bg-gray-300 mx-auto" />
                  {mark.label && (
                    <span className="text-xs text-gray-500 mt-1 block text-center whitespace-nowrap">
                      {mark.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {hint && (
        <p className="mt-2 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
})

Slider.displayName = 'Slider'

export default Slider
