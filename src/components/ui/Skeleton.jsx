const Skeleton = ({
  width,
  height,
  rounded = 'md',
  className = '',
  animate = true,
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  return (
    <div
      className={`
        bg-gray-200 
        ${animate ? 'animate-pulse' : ''}
        ${roundedClasses[rounded] || roundedClasses.md}
        ${className}
      `}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

// Pre-built skeleton variants
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
    <div className="flex items-center space-x-3 mb-4">
      <Skeleton width={40} height={40} rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton height={16} className="w-3/4" />
        <Skeleton height={12} className="w-1/2" />
      </div>
    </div>
    <Skeleton height={12} className="w-full mb-2" />
    <Skeleton height={12} className="w-5/6" />
  </div>
)

export const ListItemSkeleton = ({ className = '' }) => (
  <div className={`flex items-center space-x-4 py-3 ${className}`}>
    <Skeleton width={48} height={48} rounded="lg" />
    <div className="flex-1 space-y-2">
      <Skeleton height={14} className="w-3/4" />
      <Skeleton height={12} className="w-1/2" />
    </div>
    <Skeleton width={60} height={20} rounded="md" />
  </div>
)

export const TableRowSkeleton = ({ columns = 4, className = '' }) => (
  <div className={`flex items-center space-x-4 py-3 ${className}`}>
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} height={14} className="flex-1" />
    ))}
  </div>
)

export const FormSkeleton = ({ fields = 3, className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i}>
        <Skeleton height={14} className="w-1/4 mb-2" />
        <Skeleton height={42} className="w-full" rounded="lg" />
      </div>
    ))}
    <Skeleton height={42} className="w-32" rounded="lg" />
  </div>
)

export const ChartSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton height={20} className="w-1/4" />
      <Skeleton height={32} className="w-24" rounded="lg" />
    </div>
    <Skeleton height={200} className="w-full" rounded="lg" />
  </div>
)

export const MetricCardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
    <Skeleton height={14} className="w-1/2 mb-3" />
    <Skeleton height={32} className="w-3/4 mb-2" />
    <Skeleton height={12} className="w-1/3" />
  </div>
)

export default Skeleton
