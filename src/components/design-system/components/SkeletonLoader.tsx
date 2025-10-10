import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1
}) => {
  const baseClasses = 'animate-pulse bg-neutral-200 dark:bg-metallic-gray-700';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  ));
  
  return count > 1 ? (
    <div className="space-y-3">
      {skeletons}
    </div>
  ) : (
    <>{skeletons}</>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 ${className}`}>
    <div className="flex items-start gap-4 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" />
        <Skeleton width="40%" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton count={3} />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    <div className="flex gap-4 pb-3 border-b border-neutral-200 dark:border-metallic-gray-700">
      <Skeleton width="30%" height={20} />
      <Skeleton width="25%" height={20} />
      <Skeleton width="20%" height={20} />
      <Skeleton width="25%" height={20} />
    </div>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton width="30%" />
        <Skeleton width="25%" />
        <Skeleton width="20%" />
        <Skeleton width="25%" />
      </div>
    ))}
  </div>
);
