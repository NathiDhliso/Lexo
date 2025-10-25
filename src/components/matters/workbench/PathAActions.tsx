/**
 * Path A Actions Component
 * Actions available for matters created from pro forma (Quote First workflow)
 */
import React from 'react';
import { Clock, Receipt, FileText, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '../../design-system/components';

interface PathAActionsProps {
  matterId: string;
  onLogTime: () => void;
  onLogExpense: () => void;
  onLogService: () => void;
  onRequestAmendment: () => void;
  onViewBudget: () => void;
}

export const PathAActions: React.FC<PathAActionsProps> = ({
  matterId,
  onLogTime,
  onLogExpense,
  onLogService,
  onRequestAmendment,
  onViewBudget,
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Path A: Quote First Workflow
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Track detailed work against approved estimate
          </p>
        </div>
        <div className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
          PRO FORMA
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Button
          variant="primary"
          onClick={onLogTime}
          className="flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4" />
          <span>Log Time</span>
        </Button>

        <Button
          variant="primary"
          onClick={onLogExpense}
          className="flex items-center justify-center gap-2"
        >
          <Receipt className="w-4 h-4" />
          <span>Log Expense</span>
        </Button>

        <Button
          variant="primary"
          onClick={onLogService}
          className="flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Log Service</span>
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={onRequestAmendment}
          className="flex items-center justify-center gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Request Scope Amendment</span>
        </Button>

        <Button
          variant="outline"
          onClick={onViewBudget}
          className="flex items-center justify-center gap-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
        >
          <TrendingUp className="w-4 h-4" />
          <span>View Budget Comparison</span>
        </Button>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Path A:</strong> All work is tracked against the approved pro forma estimate. 
          If additional scope is needed, request an amendment for attorney approval.
        </p>
      </div>
    </div>
  );
};
