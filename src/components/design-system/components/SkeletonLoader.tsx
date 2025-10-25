import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
  shimmer?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
  shimmer = true
}) => {
  const baseClasses = shimmer 
    ? 'bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-metallic-gray-700 dark:via-metallic-gray-600 dark:to-metallic-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]'
    : 'animate-pulse bg-neutral-200 dark:bg-metallic-gray-700';
  
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
      aria-label="Loading"
      role="status"
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

export const SkeletonMatterCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <Skeleton width="70%" height={24} className="mb-2" />
        <Skeleton width="40%" height={16} />
      </div>
      <Skeleton variant="rectangular" width={80} height={24} />
    </div>
    <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton width="60%" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton width="50%" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton width="45%" />
      </div>
    </div>
  </div>
);

export const SkeletonFirmCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 ${className}`}>
    <div className="flex items-start gap-4 mb-4">
      <Skeleton variant="circular" width={56} height={56} />
      <div className="flex-1">
        <Skeleton width="70%" height={20} className="mb-2" />
        <Skeleton width="50%" height={14} />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton width="100%" height={12} />
      <Skeleton width="90%" height={12} />
      <Skeleton width="80%" height={12} />
    </div>
    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700 flex gap-2">
      <Skeleton variant="rectangular" width="45%" height={36} />
      <Skeleton variant="rectangular" width="45%" height={36} />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 5, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    ))}
  </div>
);
