/**
 * Format number as Indian currency (INR)
 * @param {number} amount - Amount to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.showSymbol - Show ₹ symbol (default: true)
 * @param {boolean} options.useLakhCrore - Use lakh/crore notation (default: true)
 * @param {number} options.decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted amount
 */
export const formatINR = (amount, options = {}) => {
  const { 
    showSymbol = true, 
    useLakhCrore = true, 
    decimals = 0 
  } = options

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0' : '0'
  }

  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  const symbol = showSymbol ? '₹' : ''

  if (useLakhCrore) {
    if (absAmount >= 10000000) {
      // Crores (1 crore = 10 million)
      const crores = absAmount / 10000000
      return `${sign}${symbol}${crores.toFixed(decimals > 0 ? decimals : (crores < 10 ? 2 : 1))} Cr`
    } else if (absAmount >= 100000) {
      // Lakhs (1 lakh = 100,000)
      const lakhs = absAmount / 100000
      return `${sign}${symbol}${lakhs.toFixed(decimals > 0 ? decimals : (lakhs < 10 ? 2 : 1))} L`
    } else if (absAmount >= 1000) {
      // Thousands
      const thousands = absAmount / 1000
      return `${sign}${symbol}${thousands.toFixed(decimals > 0 ? decimals : (thousands < 10 ? 1 : 0))}K`
    }
  }

  // Standard Indian number formatting (with commas)
  return `${sign}${symbol}${formatIndianNumber(absAmount, decimals)}`
}

/**
 * Format number with Indian comma system (XX,XX,XXX)
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number
 */
export const formatIndianNumber = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) return '0'
  
  const parts = num.toFixed(decimals).split('.')
  let intPart = parts[0]
  const decPart = parts[1]
  
  // Indian numbering system: XX,XX,XXX
  let lastThree = intPart.slice(-3)
  let otherNumbers = intPart.slice(0, -3)
  
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree
  }
  
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
  
  return decPart ? `${formatted}.${decPart}` : formatted
}

/**
 * Parse INR string to number
 * @param {string} str - String to parse (e.g., "₹10,00,000" or "10L" or "1Cr")
 * @returns {number} Parsed number
 */
export const parseINR = (str) => {
  if (!str) return 0
  if (typeof str === 'number') return str
  
  // Remove currency symbol and spaces
  let cleaned = str.replace(/[₹,\s]/g, '').trim()
  
  // Handle lakh/crore notation
  const croreMatch = cleaned.match(/^([\d.]+)\s*(?:cr|crore|Cr|CR)s?$/i)
  if (croreMatch) {
    return parseFloat(croreMatch[1]) * 10000000
  }
  
  const lakhMatch = cleaned.match(/^([\d.]+)\s*(?:l|lakh|L|lac)s?$/i)
  if (lakhMatch) {
    return parseFloat(lakhMatch[1]) * 100000
  }
  
  const thousandMatch = cleaned.match(/^([\d.]+)\s*(?:k|K|thousand)s?$/i)
  if (thousandMatch) {
    return parseFloat(thousandMatch[1]) * 1000
  }
  
  return parseFloat(cleaned) || 0
}

/**
 * Format percentage
 * @param {number} value - Value to format (0.05 = 5%)
 * @param {boolean} asDecimal - If true, value is already percentage (5 = 5%)
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercent = (value, asDecimal = false, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  
  const percentage = asDecimal ? value : value * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Format years/age
 * @param {number} years - Number of years
 * @returns {string} Formatted string
 */
export const formatYears = (years) => {
  if (years === null || years === undefined || isNaN(years)) return '0 years'
  
  const roundedYears = Math.round(years)
  return roundedYears === 1 ? '1 year' : `${roundedYears} years`
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Get ordinal suffix for a number
 * @param {number} n - Number
 * @returns {string} Number with ordinal suffix
 */
export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/**
 * Format a number as compact (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Compact formatted number
 */
export const formatCompact = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0'
  
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  
  if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(1)}B`
  } else if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(1)}M`
  } else if (absNum >= 1e3) {
    return `${sign}${(absNum / 1e3).toFixed(1)}K`
  }
  
  return `${sign}${absNum}`
}
