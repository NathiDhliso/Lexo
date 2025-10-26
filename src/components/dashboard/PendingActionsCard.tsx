/**
 * Pending Actions Card Component
 * Displays counts for 4 action types:
 * - New matter requests from attorneys
 * - Pro forma approvals needed
 * - Scope amendments awaiting attorney approval
 * - Completed matters ready to invoice
 */

import React from 'react';
import { CheckSquare, FileText, Edit, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardContent, Icon } from '../design-system/components';
import type { PendingActions } from '../../services/api/dashboard.service';

interface PendingActionsCardProps {
  actions: PendingActions;
  isLoading?: boolean;
  onNewRequestsClick?: () => void;
  onProformaApprovalsClick?: () => void;
  onScopeAmendmentsClick?: () => void;
  onReadyToInvoiceClick?: () => void;
}

export const PendingActionsCard: React.FC<PendingActionsCardProps> = ({
  actions,
  isLoading = false,
  onNewRequestsClick,
  onProformaApprovalsClick,
  onScopeAmendmentsClick,
  onReadyToInvoiceClick
}) => {
  const actionItems = [
    {
      label: 'New Requests',
      count: actions.newRequests,
      icon: FileText,
      color: 'text-judicial-blue-600 bg-judicial-blue-50',
      onClick: onNewRequestsClick
    },
    {
      label: 'Pro Forma Approvals',
      count: actions.proformaApprovals,
      icon: CheckSquare,
      color: 'text-mpondo-gold-600 bg-mpondo-gold-50',
      onClick: onProformaApprovalsClick
    },
    {
      label: 'Scope Amendments',
      count: actions.scopeAmendments,
      icon: Edit,
      color: 'text-status-warning-600 bg-status-warning-50',
      onClick: onScopeAmendmentsClick
    },
    {
      label: 'Ready to Invoice',
      count: actions.readyToInvoice,
      icon: DollarSign,
      color: 'text-status-success-600 bg-status-success-50',
      onClick: onReadyToInvoiceClick
    }
  ];

  const totalActions = actions.newRequests + actions.proformaApprovals + actions.scopeAmendments + actions.readyToInvoice;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon={CheckSquare} className="w-5 h-5 text-mpondo-gold-600" noGradient />
            <h3 className="text-lg font-semibold text-neutral-900">Pending Actions</h3>
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
            <Icon icon={CheckSquare} className="w-5 h-5 text-mpondo-gold-600" noGradient />
            <h3 className="text-lg font-semibold text-neutral-900">Pending Actions</h3>
          </div>
          {totalActions > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mpondo-gold-100 text-mpondo-gold-800">
              {totalActions} {totalActions === 1 ? 'action' : 'actions'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {totalActions === 0 ? (
          <div className="text-center py-8">
            <Icon icon={CheckSquare} className="w-12 h-12 mx-auto mb-2 text-neutral-300" noGradient />
            <p className="text-sm text-neutral-500">No pending actions</p>
            <p className="text-xs text-neutral-400 mt-1">All caught up!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actionItems.map((item) => (
              <div
                key={item.label}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  item.count > 0
                    ? 'border-neutral-200 dark:border-metallic-gray-700 bg-white dark:bg-metallic-gray-800'
                    : 'border-neutral-100 dark:border-metallic-gray-800 bg-neutral-50 dark:bg-metallic-gray-900 opacity-60'
                }`}
                onClick={item.count > 0 ? item.onClick : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <Icon icon={item.icon} className="w-4 h-4" noGradient />
                  </div>
                  <span className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-sm font-bold ${
                    item.count > 0
                      ? 'bg-mpondo-gold-100 text-mpondo-gold-800'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {item.count}
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
