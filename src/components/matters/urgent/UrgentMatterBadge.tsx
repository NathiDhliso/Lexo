/**
 * UrgentMatterBadge Component
 * Orange "URGENT" badge for matter cards and lists
 * Requirements: 7.6
 */

import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface UrgentMatterBadgeProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const UrgentMatterBadge: React.FC<UrgentMatterBadgeProps> = ({
  className,
  showIcon = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        'bg-status-error-100 text-status-error-800 dark:bg-status-error-900/30 dark:text-status-error-300',
        'border border-status-error-300 dark:border-status-error-700',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Zap className={cn(iconSizes[size], 'fill-current')} />}
      URGENT
    </span>
  );
};

export default UrgentMatterBadge;
