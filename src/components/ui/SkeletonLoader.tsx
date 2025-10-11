/**
 * SkeletonLoader Component
 * Content placeholder for loading states
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className,
}) => {
  const baseClasses = 'animate-pulse bg-neutral-200 dark:bg-metallic-gray-700';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'h-32 rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '16px' : variant === 'circular' ? '40px' : undefined),
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      aria-label="Loading"
      role="status"
    />
  ));

  return count > 1 ? <div className="space-y-2">{skeletons}</div> : <>{skeletons}</>;
};

export default SkeletonLoader;
