/**
 * Path B Actions Component
 * Actions available for matters accepted without pro forma (Accept & Work workflow)
 */
import React from 'react';
import { DollarSign, Clock, Receipt } from 'lucide-react';
import { Button } from '../../design-system/components';

interface PathBActionsProps {
  matterId: string;
  onSimpleFeeEntry: () => void;
  onLogTime: () => void;
  onLogExpense: () => void;
}

export const PathBActions: React.FC<PathBActionsProps> = ({
  matterId,
  onSimpleFeeEntry,
  onLogTime,
  onLogExpense,
}) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Path B: Accept & Work Workflow
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Choose your billing method: flat fee or time-based
          </p>
        </div>
        <div className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
          ACCEPTED BRIEF
        </div>
      </div>

      {/* Primary Action */}
      <div className="mb-4">
        <Button
          variant="primary"
          onClick={onSimpleFeeEntry}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <DollarSign className="w-5 h-5" />
          <span>Simple Fee Entry</span>
        </Button>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 text-center">
          Enter a flat fee (e.g., "Opinion fee: R15,000")
        </p>
      </div>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-300 dark:border-neutral-600"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-green-50 dark:bg-green-900/20 px-2 text-neutral-500 dark:text-neutral-400">
            OR use hybrid time tracking
          </span>
        </div>
      </div>

      {/* Hybrid Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={onLogTime}
          className="flex items-center justify-center gap-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
        >
          <Clock className="w-4 h-4" />
          <span>Log Time (Hybrid)</span>
        </Button>

        <Button
          variant="outline"
          onClick={onLogExpense}
          className="flex items-center justify-center gap-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
        >
          <Receipt className="w-4 h-4" />
          <span>Log Expense</span>
        </Button>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
        <p className="text-xs text-green-800 dark:text-green-300">
          <strong>Path B:</strong> Use Simple Fee Entry for traditional brief fees (fixed amount), 
          or switch to Hybrid mode to track hours + expenses if needed.
        </p>
      </div>
    </div>
  );
};
