/**
 * Quick Stats Card Component
 * Displays 4 metrics for last 30 days:
 * - Matters completed
 * - Invoiced amount
 * - Payments received
 * - Average time to invoice
 * With trend indicators (up/down arrows) and comparison to previous 30 days
 */

import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, FileText, DollarSign, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, Icon } from '../design-system/components';
import type { QuickStats } from '../../services/api/dashboard.service';

interface QuickStatsCardProps {
  stats: QuickStats;
  isLoading?: boolean;
  previousStats?: QuickStats; // For trend comparison
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  stats,
  isLoading = false,
  previousStats
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTrend = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNeutral: Math.abs(change) < 1
    };
  };

  const statItems = [
    {
      label: 'Matters Completed',
      value: stats.mattersCompleted30d,
      icon: CheckCircle,
      color: 'text-status-success-600 bg-status-success-50',
      trend: previousStats ? calculateTrend(stats.mattersCompleted30d, previousStats.mattersCompleted30d) : null,
      format: (val: number) => val.toString()
    },
    {
      label: 'Invoiced Amount',
      value: stats.invoiced30d,
      icon: FileText,
      color: 'text-judicial-blue-600 bg-judicial-blue-50',
      trend: previousStats ? calculateTrend(stats.invoiced30d, previousStats.invoiced30d) : null,
      format: formatCurrency
    },
    {
      label: 'Payments Received',
      value: stats.paymentsReceived30d,
      icon: DollarSign,
      color: 'text-mpondo-gold-600 bg-mpondo-gold-50',
      trend: previousStats ? calculateTrend(stats.paymentsReceived30d, previousStats.paymentsReceived30d) : null,
      format: formatCurrency
    },
    {
      label: 'Avg Time to Invoice',
      value: stats.avgTimeToInvoice,
      icon: Clock,
      color: 'text-status-warning-600 bg-status-warning-50',
      trend: previousStats ? calculateTrend(stats.avgTimeToInvoice, previousStats.avgTimeToInvoice) : null,
      format: (val: number) => `${val} days`,
      invertTrend: true // Lower is better for time to invoice
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon={TrendingUp} className="w-5 h-5 text-mpondo-gold-600" noGradient />
            <h3 className="text-lg font-semibold text-neutral-900">Quick Stats (Last 30 Days)</h3>
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
        <div className="flex items-center gap-2">
          <Icon icon={TrendingUp} className="w-5 h-5 text-mpondo-gold-600" noGradient />
          <h3 className="text-lg font-semibold text-neutral-900">Quick Stats (Last 30 Days)</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((item) => {
            const trend = item.trend;
            const showPositiveTrend = item.invertTrend 
              ? trend && !trend.isPositive 
              : trend && trend.isPositive;
            const showNegativeTrend = item.invertTrend
              ? trend && trend.isPositive
              : trend && !trend.isPositive;

            return (
              <div
                key={item.label}
                className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <Icon icon={item.icon} className="w-4 h-4" noGradient />
                  </div>
                  {trend && !trend.isNeutral && (
                    <div className={`flex items-center gap-1 ${
                      showPositiveTrend
                        ? 'text-status-success-600'
                        : showNegativeTrend
                        ? 'text-status-error-600'
                        : 'text-neutral-500'
                    }`}>
                      <Icon 
                        icon={showPositiveTrend ? TrendingUp : TrendingDown} 
                        className="w-3 h-3" 
                        noGradient 
                      />
                      <span className="text-xs font-medium">{trend.percentage}%</span>
                    </div>
                  )}
                </div>
                <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {item.format(item.value)}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
        {previousStats && (
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
            <p className="text-xs text-neutral-500 text-center">
              Compared to previous 30 days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
