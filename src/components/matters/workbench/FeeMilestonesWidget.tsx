/**
 * FeeMilestonesWidget Component
 * 
 * Displays and manages fee milestones for brief fee matters.
 * Uses reusable hooks for data fetching and form management.
 */

import React, { useMemo } from 'react';
import { CheckCircle, Circle, Clock, FileText, Gavel, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '../../design-system/components';
import { useDataFetch } from '../../../hooks/useDataFetch';
import { useSimpleModal } from '../../../hooks/useModalForm';
// import { useMatterBillingStrategy } from '../../../hooks/useBillingStrategy';
import { cn } from '../../../lib/utils';
import type { Matter } from '../../../types';
import type { FeeMilestone } from '../../../types/billing.types';

export interface FeeMilestonesWidgetProps {
  matter: Matter;
  onMilestoneComplete?: (milestone: FeeMilestone) => void;
}

// Mock milestone service - in real implementation, this would be an API service
const milestoneService = {
  async getMilestones(matterId: string): Promise<FeeMilestone[]> {
    // This would fetch from the database
    return [
      {
        id: '1',
        name: 'Brief Accepted',
        description: 'Initial brief received and accepted',
        percentage: 25,
        isCompleted: true,
        completedAt: new Date(),
        order: 1,
      },
      {
        id: '2',
        name: 'Research Completed',
        description: 'Legal research and case preparation completed',
        percentage: 25,
        isCompleted: false,
        completedAt: undefined,
        order: 2,
      },
      {
        id: '3',
        name: 'Opinion Delivered',
        description: 'Legal opinion or advice delivered to client',
        percentage: 30,
        isCompleted: false,
        completedAt: undefined,
        order: 3,
      },
      {
        id: '4',
        name: 'Court Appearance',
        description: 'Court appearance or final deliverable completed',
        percentage: 20,
        isCompleted: false,
        completedAt: undefined,
        order: 4,
      },
    ];
  },

  async completeMilestone(milestoneId: string): Promise<void> {
    // This would update the database
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};

/**
 * Get icon for milestone based on its type
 */
function getMilestoneIcon(milestone: FeeMilestone): React.ComponentType<any> {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'Brief Accepted': FileText,
    'Research Completed': Clock,
    'Opinion Delivered': FileText,
    'Court Appearance': Gavel,
  };
  
  return iconMap[milestone.name] || Circle;
}

/**
 * Format milestone completion date
 */
function formatCompletionDate(date: Date | undefined): string {
  if (!date) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-ZA', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export const FeeMilestonesWidget: React.FC<FeeMilestonesWidgetProps> = ({
  matter,
  onMilestoneComplete,
}) => {
  // const billingStrategy = useMatterBillingStrategy(matter);

  // Fetch milestones using data fetching hook
  const { data: milestones, isLoading, error, refetch } = useDataFetch(
    `milestones-${matter.id}`,
    () => milestoneService.getMilestones(matter.id),
    {
      enabled: !!matter.id,
    }
  );

  // State for completing milestones
  const [completingMilestoneId, setCompletingMilestoneId] = React.useState<string | null>(null);

  // Calculate progress
  const progress = useMemo(() => {
    if (!milestones) return { percentage: 0, completed: 0, total: 0 };
    
    const completedMilestones = milestones.filter(m => m.isCompleted);
    const totalPercentage = completedMilestones.reduce((sum, m) => sum + m.percentage, 0);
    const completedCount = completedMilestones.length;
    
    return {
      percentage: totalPercentage,
      completed: completedCount,
      total: milestones.length,
    };
  }, [milestones]);

  // Handle milestone completion
  const handleMilestoneClick = async (milestone: FeeMilestone) => {
    if (milestone.isCompleted || completingMilestoneId) return;
    
    setCompletingMilestoneId(milestone.id);
    
    try {
      await milestoneService.completeMilestone(milestone.id);
      await refetch();
      onMilestoneComplete?.(milestone);
      
      // Show success toast
      const { toast } = await import('react-hot-toast');
      toast.success(`Milestone "${milestone.name}" completed!`);
    } catch (error) {
      console.error('Error completing milestone:', error);
      const { toast } = await import('react-hot-toast');
      toast.error('Failed to complete milestone. Please try again.');
    } finally {
      setCompletingMilestoneId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">Failed to load milestones</p>
          <p className="text-sm text-red-500 mt-1">{error.message}</p>
          <Button onClick={() => refetch()} className="mt-3">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Fee Milestones
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Track progress towards fee completion
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-judicial-blue-600 dark:text-judicial-blue-400">
            {progress.percentage}%
          </p>
          <p className="text-xs text-neutral-500">
            {progress.completed} of {progress.total} completed
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-judicial-blue-500 to-mpondo-gold-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones?.map((milestone, index) => {
          const Icon = getMilestoneIcon(milestone);
          const isNext = !milestone.isCompleted && 
            (index === 0 || milestones?.[index - 1]?.isCompleted);
          
          return (
            <div
              key={milestone.id}
              className={cn(
                'flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-200',
                milestone.isCompleted
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                  : isNext
                  ? 'border-judicial-blue-200 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 dark:border-judicial-blue-800 cursor-pointer hover:shadow-md'
                  : 'border-neutral-200 bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700',
                !milestone.isCompleted && !isNext && 'opacity-60',
                completingMilestoneId === milestone.id && 'opacity-50 cursor-wait'
              )}
              onClick={() => isNext && !completingMilestoneId && handleMilestoneClick(milestone)}
            >
              {/* Status Icon */}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                milestone.isCompleted
                  ? 'bg-green-500 text-white'
                  : isNext
                  ? 'bg-judicial-blue-500 text-white'
                  : 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400'
              )}>
                {milestone.isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={cn(
                    'font-medium',
                    milestone.isCompleted
                      ? 'text-green-900 dark:text-green-100'
                      : isNext
                      ? 'text-judicial-blue-900 dark:text-judicial-blue-100'
                      : 'text-neutral-700 dark:text-neutral-300'
                  )}>
                    {milestone.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-medium px-2 py-1 rounded',
                      milestone.isCompleted
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                    )}>
                      {milestone.percentage}%
                    </span>
                  </div>
                </div>
                
                <p className={cn(
                  'text-sm mb-2',
                  milestone.isCompleted
                    ? 'text-green-700 dark:text-green-300'
                    : isNext
                    ? 'text-judicial-blue-700 dark:text-judicial-blue-300'
                    : 'text-neutral-600 dark:text-neutral-400'
                )}>
                  {milestone.description}
                </p>

                {milestone.isCompleted && milestone.completedAt && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Completed {formatCompletionDate(milestone.completedAt)}
                  </p>
                )}

                {isNext && (
                  <p className="text-xs text-judicial-blue-600 dark:text-judicial-blue-400 font-medium">
                    {completingMilestoneId === milestone.id ? 'Completing...' : 'Click to mark as completed'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">
            Fee Progress
          </span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            R{(((matter as any).agreed_fee || 0) * progress.percentage / 100).toLocaleString()} of R{((matter as any).agreed_fee || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};