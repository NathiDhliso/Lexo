/**
 * ReportCard Component
 * Card for displaying report options
 */

import React from 'react';
import { LucideIcon, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ReportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  locked?: boolean;
  tier?: 'free' | 'pro' | 'enterprise';
  className?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  locked = false,
  tier,
  className,
}) => {
  return (
    <div
      onClick={locked ? undefined : onClick}
      className={cn(
        'relative p-6 rounded-lg border transition-all duration-200',
        'bg-white dark:bg-metallic-gray-800',
        'border-neutral-200 dark:border-metallic-gray-700',
        locked
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-lg hover:border-mpondo-gold-500 hover:-translate-y-1',
        className
      )}
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-disabled={locked}
      onKeyDown={(e) => {
        if (!locked && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {locked && (
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-neutral-400" />
        </div>
      )}
      
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={cn(
          'p-3 rounded-full',
          locked
            ? 'bg-neutral-100 dark:bg-metallic-gray-700'
            : 'bg-judicial-blue-50 dark:bg-judicial-blue-900/20'
        )}>
          <Icon className={cn(
            'w-8 h-8',
            locked
              ? 'text-neutral-400'
              : 'text-judicial-blue-600 dark:text-judicial-blue-400'
          )} />
        </div>
        
        <div>
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        </div>

        {tier && (
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            tier === 'free' && 'bg-neutral-100 text-neutral-700 dark:bg-metallic-gray-700 dark:text-neutral-300',
            tier === 'pro' && 'bg-mpondo-gold-100 text-mpondo-gold-700 dark:bg-mpondo-gold-900/20 dark:text-mpondo-gold-400',
            tier === 'enterprise' && 'bg-judicial-blue-100 text-judicial-blue-700 dark:bg-judicial-blue-900/20 dark:text-judicial-blue-400'
          )}>
            {tier.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
