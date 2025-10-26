/**
 * Active Matters Card Component
 * Displays top 5 most recently active matters with:
 * - Completion percentage
 * - Last activity timestamp
 * - Deadline, budget, and amount used
 * - Warning indicator for stale matters (14+ days no activity)
 */

import React from 'react';
import { Briefcase, ArrowRight, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Icon } from '../design-system/components';
import type { ActiveMatterWithProgress } from '../../services/api/dashboard.service';

interface ActiveMattersCardProps {
  matters: ActiveMatterWithProgress[];
  isLoading?: boolean;
  onMatterClick?: (matter: ActiveMatterWithProgress) => void;
  onViewAll?: () => void;
}

export const ActiveMattersCard: React.FC<ActiveMattersCardProps> = ({
  matters,
  isLoading = false,
  onMatterClick,
  onViewAll
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-status-success-500';
    if (percentage >= 50) return 'bg-judicial-blue-500';
    if (percentage >= 25) return 'bg-status-warning-500';
    return 'bg-neutral-300';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon={Briefcase} className="w-5 h-5 text-mpondo-gold-600" noGradient />
            <h3 className="text-lg font-semibold text-neutral-900">Active Matters</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon={Briefcase} className="w-5 h-5 text-mpondo-gold-600" noGradient />
            <h3 className="text-lg font-semibold text-neutral-900">Active Matters</h3>
          </div>
          {matters.length > 0 && onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {matters.length === 0 ? (
          <div className="text-center py-8">
            <Icon icon={Briefcase} className="w-12 h-12 mx-auto mb-2 text-neutral-300" noGradient />
            <p className="text-sm text-neutral-500">No active matters</p>
            <p className="text-xs text-neutral-400 mt-1">Start a new matter to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matters.map((item) => (
              <div
                key={item.matter.id}
                className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 cursor-pointer transition-colors"
                onClick={() => onMatterClick?.(item)}
              >
                {/* Header with title and stale warning */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {item.matter.title}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {item.matter.client_name}
                    </p>
                  </div>
                  {item.isStale && (
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-1 px-2 py-1 bg-status-warning-100 rounded-full">
                        <Icon icon={AlertCircle} className="w-3 h-3 text-status-warning-600" noGradient />
                        <span className="text-xs font-medium text-status-warning-700">Stale</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{item.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-metallic-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getCompletionColor(item.completionPercentage)}`}
                      style={{ width: `${item.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                    <Icon icon={Calendar} className="w-3 h-3" noGradient />
                    <span>{formatDate(item.lastActivity)}</span>
                  </div>
                  {item.deadline && (
                    <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                      <Icon icon={Calendar} className="w-3 h-3" noGradient />
                      <span>Due: {new Date(item.deadline).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                  {item.budget && (
                    <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                      <Icon icon={DollarSign} className="w-3 h-3" noGradient />
                      <span>Budget: {formatCurrency(item.budget)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                    <Icon icon={DollarSign} className="w-3 h-3" noGradient />
                    <span>Used: {formatCurrency(item.amountUsed)}</span>
                  </div>
                </div>

                {/* View arrow */}
                <div className="flex items-center justify-end mt-2">
                  <Icon icon={ArrowRight} className="w-4 h-4 text-neutral-400" noGradient />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
