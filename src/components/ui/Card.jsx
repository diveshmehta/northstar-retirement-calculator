const variants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white shadow-md',
  outlined: 'bg-white border border-gray-300',
  flat: 'bg-gray-50 border border-gray-100',
  interactive: 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer',
  highlight: 'bg-indigo-50 border border-indigo-200',
  success: 'bg-emerald-50 border border-emerald-200',
  warning: 'bg-amber-50 border border-amber-200',
  danger: 'bg-rose-50 border border-rose-200',
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
}

export const Card = ({ 
  children, 
  variant = 'default', 
  padding = 'md',
  className = '',
  ...props 
}) => {
  const variantClasses = variants[variant] || variants.default
  const paddingClasses = paddings[padding] || paddings.md

  return (
    <div 
      className={`rounded-xl ${variantClasses} ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ 
  children, 
  className = '',
  action,
  ...props 
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
}

export const CardTitle = ({ 
  children, 
  className = '',
  subtitle,
  ...props 
}) => {
  return (
    <div {...props}>
      <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
        {children}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}

export const CardBody = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export const CardFooter = ({ 
  children, 
  className = '',
  border = true,
  ...props 
}) => {
  return (
    <div 
      className={`mt-4 pt-4 ${border ? 'border-t border-gray-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
