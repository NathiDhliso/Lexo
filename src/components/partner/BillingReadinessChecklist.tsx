import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  status: 'complete' | 'incomplete' | 'warning' | 'pending';
  description?: string;
}

interface BillingReadinessChecklistProps {
  matterId: string;
  wipValue: number;
  estimatedFee: number;
  hasRetainer: boolean;
  hasTimeEntries: boolean;
  hasInvoice: boolean;
  matterStatus: string;
  onChecklistChange?: (isReady: boolean) => void;
}

export const BillingReadinessChecklist: React.FC<BillingReadinessChecklistProps> = ({
  wipValue,
  estimatedFee,
  hasRetainer,
  hasTimeEntries,
  hasInvoice,
  matterStatus,
  onChecklistChange,
}) => {
  const variance = estimatedFee > 0 ? ((wipValue - estimatedFee) / estimatedFee) * 100 : 0;
  const isOverBudget = variance > 15;

  const checklist: ChecklistItem[] = [
    {
      id: 'time_entries',
      label: 'Time Entries Recorded',
      status: hasTimeEntries ? 'complete' : 'incomplete',
      description: hasTimeEntries ? 'Time entries have been recorded' : 'No time entries found'
    },
    {
      id: 'wip_value',
      label: 'WIP Value Calculated',
      status: wipValue > 0 ? 'complete' : 'incomplete',
      description: wipValue > 0 ? `WIP: R ${wipValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : 'No WIP value'
    },
    {
      id: 'budget_variance',
      label: 'Within Budget',
      status: isOverBudget ? 'warning' : 'complete',
      description: isOverBudget 
        ? `Over budget by ${variance.toFixed(1)}% - Scope amendment may be required`
        : `Variance: ${variance.toFixed(1)}%`
    },
    {
      id: 'retainer',
      label: 'Retainer Agreement',
      status: hasRetainer ? 'complete' : 'warning',
      description: hasRetainer ? 'Retainer agreement in place' : 'No retainer agreement'
    },
    {
      id: 'matter_status',
      label: 'Matter Status',
      status: matterStatus === 'completed' ? 'complete' : 'pending',
      description: `Current status: ${matterStatus}`
    },
    {
      id: 'no_existing_invoice',
      label: 'No Existing Invoice',
      status: !hasInvoice ? 'complete' : 'warning',
      description: hasInvoice ? 'Invoice already exists for this matter' : 'Ready for invoicing'
    }
  ];

  const completedCount = checklist.filter(item => item.status === 'complete').length;
  const totalCount = checklist.length;
  const isReady = completedCount === totalCount;

  React.useEffect(() => {
    onChecklistChange?.(isReady);
  }, [isReady, onChecklistChange]);

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-status-success-600" />;
      case 'incomplete':
        return <XCircle className="w-5 h-5 text-status-error-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getStatusColor = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-status-success-50 dark:bg-status-success-900/20 border-status-success-200 dark:border-status-success-700';
      case 'incomplete':
        return 'bg-status-error-50 dark:bg-status-error-900/20 border-status-error-200 dark:border-status-error-700';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700';
      case 'pending':
        return 'bg-neutral-50 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
          Billing Readiness Checklist
        </h3>
        <div className="text-sm font-medium text-gray-600 dark:text-neutral-400">
          {completedCount} / {totalCount} Complete
        </div>
      </div>

      <div className="space-y-2">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`border rounded-lg p-3 ${getStatusColor(item.status)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(item.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-neutral-100">
                  {item.label}
                </div>
                {item.description && (
                  <div className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isReady ? (
        <div className="bg-status-success-50 dark:bg-status-success-900/20 border border-status-success-200 dark:border-status-success-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-status-success-800 dark:text-status-success-200">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Ready for Partner Approval</span>
          </div>
          <p className="text-sm text-status-success-700 dark:text-status-success-300 mt-1">
            All billing readiness criteria have been met.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Not Ready for Billing</span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Please address the incomplete items before submitting for approval.
          </p>
        </div>
      )}
    </div>
  );
};
