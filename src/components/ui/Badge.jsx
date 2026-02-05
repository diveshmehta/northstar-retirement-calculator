const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-indigo-100 text-indigo-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  teal: 'bg-teal-100 text-teal-700',
  orange: 'bg-orange-100 text-orange-700',
}

const sizes = {
  xs: 'text-xs px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  removable = false,
  onRemove,
  icon: Icon,
  className = '',
  ...props
}) => {
  const variantClasses = variants[variant] || variants.default
  const sizeClasses = sizes[size] || sizes.sm

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses} ${sizeClasses} ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          variant === 'success' ? 'bg-emerald-500' :
          variant === 'warning' ? 'bg-amber-500' :
          variant === 'danger' ? 'bg-rose-500' :
          variant === 'primary' ? 'bg-indigo-500' :
          'bg-gray-500'
        }`} />
      )}
      
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      
      {children}
      
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  )
}

// Status badge with dot indicator
export const StatusBadge = ({ status, className = '' }) => {
  const configs = {
    active: { label: 'Active', variant: 'success', dot: true },
    pending: { label: 'Pending', variant: 'warning', dot: true },
    inactive: { label: 'Inactive', variant: 'default', dot: true },
    error: { label: 'Error', variant: 'danger', dot: true },
    ontrack: { label: 'On Track', variant: 'success', dot: true },
    behind: { label: 'Behind', variant: 'danger', dot: true },
    ahead: { label: 'Ahead', variant: 'info', dot: true },
  }

  const config = configs[status] || configs.inactive

  return (
    <Badge variant={config.variant} dot={config.dot} className={className}>
      {config.label}
    </Badge>
  )
}

export default Badge
