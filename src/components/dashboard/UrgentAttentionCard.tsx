/**
 * Urgent Attention Card Component
 * Displays items requiring immediate attention:
 * - Matters with deadlines today
 * - Invoices overdue 45+ days
 * - Pro forma requests pending 5+ days
 */

import React from 'react';
import { AlertTriangle, Calendar, FileText, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, Icon } from '../design-system/components';
import type { UrgentAttentionItem } from '../../services/api/dashboard.service';

interface UrgentAttentionCardProps {
  items: UrgentAttentionItem[];
  isLoading?: boolean;
  onItemClick?: (item: UrgentAttentionItem) => void;
}

export const UrgentAttentionCard: React.FC<UrgentAttentionCardProps> = ({
  items,
  isLoading = false,
  onItemClick
}) => {
  const getItemIcon = (type: UrgentAttentionItem['type']) => {
    switch (type) {
      case 'deadline_today':
        return Calendar;
      case 'overdue_invoice':
        return FileText;
      case 'pending_proforma':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getItemColor = (type: UrgentAttentionItem['type']) => {
    switch (type) {
      case 'deadline_today':
        return 'text-status-error-600 bg-status-error-50';
      case 'overdue_invoice':
        return 'text-status-warning-600 bg-status-warning-50';
      case 'pending_proforma':
        return 'text-judicial-blue-600 bg-judicial-blue-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon={AlertTriangle} className="w-5 h-5 text-status-error-600" noGradient />
            <h3 className="text-lg font-semibold text-neutral-900">Urgent Attention</h3>
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
            <Icon icon={AlertTriangle} className="w-5 h-5 text-status-error-600" noGradient />
            <h3 className="text-lg font-semibold text-neutral-900">Urgent Attention</h3>
          </div>
          {items.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-error-100 text-status-error-800">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Icon icon={AlertTriangle} className="w-12 h-12 mx-auto mb-2 text-neutral-300" noGradient />
            <p className="text-sm text-neutral-500">No urgent items</p>
            <p className="text-xs text-neutral-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const ItemIcon = getItemIcon(item.type);
              const colorClass = getItemColor(item.type);

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                    item.type === 'deadline_today'
                      ? 'border-status-error-500 bg-status-error-50/50'
                      : item.type === 'overdue_invoice'
                      ? 'border-status-warning-500 bg-status-warning-50/50'
                      : 'border-judicial-blue-500 bg-judicial-blue-50/50'
                  }`}
                  onClick={() => onItemClick?.(item)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon icon={ItemIcon} className="w-4 h-4" noGradient />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {item.description}
                      </p>
                      {item.amount && (
                        <p className="text-xs font-semibold text-neutral-900 mt-1">
                          {formatCurrency(item.amount)}
                        </p>
                      )}
                    </div>
                    {item.daysOverdue && item.daysOverdue > 0 && (
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.daysOverdue >= 45
                            ? 'bg-status-error-100 text-status-error-800'
                            : 'bg-status-warning-100 text-status-warning-800'
                        }`}>
                          {item.daysOverdue}d
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
