/**
 * Financial Snapshot Cards Component
 * Displays 3 financial metric cards:
 * - Outstanding Fees
 * - WIP (Work in Progress)
 * - Month Invoiced
 */

import React from 'react';
import { DollarSign, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, Icon } from '../design-system/components';
import type { FinancialSnapshot } from '../../services/api/dashboard.service';

interface FinancialSnapshotCardsProps {
  snapshot: FinancialSnapshot;
  isLoading?: boolean;
  onOutstandingFeesClick?: () => void;
  onWipClick?: () => void;
  onMonthInvoicedClick?: () => void;
}

export const FinancialSnapshotCards: React.FC<FinancialSnapshotCardsProps> = ({
  snapshot,
  isLoading = false,
  onOutstandingFeesClick,
  onWipClick,
  onMonthInvoicedClick
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Outstanding Fees Card */}
      <Card
        hoverable
        onClick={onOutstandingFeesClick}
        className="cursor-pointer hover:theme-shadow-lg transition-shadow"
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-status-warning-50 rounded-lg">
              <Icon icon={DollarSign} className="w-6 h-6 text-status-warning-600" noGradient />
            </div>
            <span className="text-xs text-neutral-500">
              {snapshot.outstandingFees.count} {snapshot.outstandingFees.count === 1 ? 'invoice' : 'invoices'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {formatCurrency(snapshot.outstandingFees.amount)}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Outstanding Fees
          </p>
          <div className="flex items-center text-xs text-status-warning-600 hover:text-status-warning-700">
            View Details <Icon icon={ArrowRight} className="w-3 h-3 ml-1" noGradient />
          </div>
        </CardContent>
      </Card>

      {/* WIP Card */}
      <Card
        hoverable
        onClick={onWipClick}
        className="cursor-pointer hover:theme-shadow-lg transition-shadow"
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-judicial-blue-50 rounded-lg">
              <Icon icon={FileText} className="w-6 h-6 text-judicial-blue-600" noGradient />
            </div>
            <span className="text-xs text-neutral-500">
              {snapshot.wipValue.count} {snapshot.wipValue.count === 1 ? 'matter' : 'matters'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {formatCurrency(snapshot.wipValue.amount)}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Work in Progress
          </p>
          <div className="flex items-center text-xs text-judicial-blue-600 hover:text-judicial-blue-700">
            View WIP Report <Icon icon={ArrowRight} className="w-3 h-3 ml-1" noGradient />
          </div>
        </CardContent>
      </Card>

      {/* Month Invoiced Card */}
      <Card
        hoverable
        onClick={onMonthInvoicedClick}
        className="cursor-pointer hover:theme-shadow-lg transition-shadow"
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-status-success-50 rounded-lg">
              <Icon icon={TrendingUp} className="w-6 h-6 text-status-success-600" noGradient />
            </div>
            <span className="text-xs text-neutral-500">
              {snapshot.monthInvoiced.count} {snapshot.monthInvoiced.count === 1 ? 'invoice' : 'invoices'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {formatCurrency(snapshot.monthInvoiced.amount)}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            This Month Invoiced
          </p>
          <div className="flex items-center text-xs text-status-success-600 hover:text-status-success-700">
            View Reports <Icon icon={ArrowRight} className="w-3 h-3 ml-1" noGradient />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
