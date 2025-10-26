/**
 * This Week Deadlines Card Component
 * Displays matters due within 7 days
 * Sorted by deadline (soonest first)
 */

import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Icon } from '../design-system/components';
import type { ThisWeekDeadline } from '../../services/api/dashboard.service';

interface ThisWeekDeadlinesCardProps {
  deadlines: ThisWeekDeadline[];
  isLoading?: boolean;
  onDeadlineClick?: (deadline: ThisWeekDeadline) => void;
  onViewAll?: () => void;
}

export const ThisWeekDeadlinesCard: React.FC<ThisWeekDeadlinesCardProps> = ({
  deadlines,
  isLoading = false,
  onDeadlineClick,
  onViewAll
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemainingColor = (days: number) => {
    if (days === 0) return 'text-status-error-600 bg-status-error-100';
    if (days <= 2) return 'text-status-warning-600 bg-status-warning-100';
    return 'text-judicial-blue-600 bg-judicial-blue-100';
  };

  const getDaysRemainingText = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon={Calendar} className="w-5 h-5 text-judicial-blue-600" noGradient />
            <h3 className="text-lg font-semibold text-neutral-900">This Week's Deadlines</h3>
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
            <Icon icon={Calendar} className="w-5 h-5 text-judicial-blue-600" noGradient />
            <h3 className="text-lg font-semibold text-neutral-900">This Week's Deadlines</h3>
          </div>
          {deadlines.length > 0 && onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <div className="text-center py-8">
            <Icon icon={Calendar} className="w-12 h-12 mx-auto mb-2 text-neutral-300" noGradient />
            <p className="text-sm text-neutral-500">No deadlines this week</p>
            <p className="text-xs text-neutral-400 mt-1">Your schedule is clear</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deadlines.map((deadline) => (
              <div
                key={deadline.matterId}
                className="p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 cursor-pointer transition-colors"
                onClick={() => onDeadlineClick?.(deadline)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {deadline.title}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {deadline.clientName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-neutral-500">
                        {formatDate(deadline.deadline)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDaysRemainingColor(deadline.daysRemaining)}`}>
                        {getDaysRemainingText(deadline.daysRemaining)}
                      </span>
                    </div>
                  </div>
                  <Icon icon={ArrowRight} className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-1" noGradient />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
