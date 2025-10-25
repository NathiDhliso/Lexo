/**
 * Budget Comparison Widget
 * Shows original estimate, amendments, and work logged (Path A only)
 */
import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { formatRand } from '../../../lib/currency';

interface BudgetComparisonWidgetProps {
  originalBudget: number;
  amendmentTotal: number;
  wipValue: number;
  amendmentCount: number;
}

export const BudgetComparisonWidget: React.FC<BudgetComparisonWidgetProps> = ({
  originalBudget,
  amendmentTotal,
  wipValue,
  amendmentCount,
}) => {
  const currentBudget = originalBudget + amendmentTotal;
  const remaining = currentBudget - wipValue;
  const percentageUsed = currentBudget > 0 ? (wipValue / currentBudget) * 100 : 0;
  
  const getStatusColor = () => {
    if (percentageUsed >= 100) return 'text-red-600 dark:text-red-400';
    if (percentageUsed >= 80) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = () => {
    if (percentageUsed >= 100) return 'bg-red-600';
    if (percentageUsed >= 80) return 'bg-amber-600';
    return 'bg-green-600';
  };

  const getStatusIcon = () => {
    if (percentageUsed >= 100) return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    if (percentageUsed >= 80) return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Budget Tracking
          </h3>
        </div>
        {getStatusIcon()}
      </div>

      {/* Budget Breakdown */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Original Pro Forma</span>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {formatRand(originalBudget)}
          </span>
        </div>

        {amendmentTotal > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Amendments ({amendmentCount})
            </span>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              + {formatRand(amendmentTotal)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-700">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Current Budget</span>
          <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {formatRand(currentBudget)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Work Logged</span>
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {percentageUsed.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Logged</span>
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {formatRand(wipValue)}
          </span>
        </div>

        <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Remaining</span>
          </div>
          <span className={`text-lg font-bold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatRand(Math.max(remaining, 0))}
          </span>
        </div>
      </div>

      {/* Status Messages */}
      {percentageUsed >= 100 && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
          <p className="text-xs text-red-800 dark:text-red-300 font-medium">
            ⚠️ Budget exceeded! Consider requesting a scope amendment.
          </p>
        </div>
      )}

      {percentageUsed >= 80 && percentageUsed < 100 && (
        <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            ⚠️ Approaching budget limit. Monitor closely.
          </p>
        </div>
      )}
    </div>
  );
};
