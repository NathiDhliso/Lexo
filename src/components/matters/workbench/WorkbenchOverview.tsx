/**
 * Workbench Overview Tab
 * Shows matter summary, quick stats, and recent activity
 */
import React from 'react';
import { Briefcase, User, Building2, Calendar, FileText, TrendingUp } from 'lucide-react';
import { formatRand } from '../../../lib/currency';
import { BudgetComparisonWidget } from './BudgetComparisonWidget';
import type { Matter } from '../../../types';

interface WorkbenchOverviewProps {
  matter: Matter;
  isPathA: boolean;
  originalBudget?: number;
  amendmentTotal?: number;
  amendmentCount?: number;
}

export const WorkbenchOverview: React.FC<WorkbenchOverviewProps> = ({
  matter,
  isPathA,
  originalBudget = 0,
  amendmentTotal = 0,
  amendmentCount = 0,
}) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Matter Info Card */}
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {matter.title}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">{matter.matter_type}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            matter.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}>
            {matter.status?.toUpperCase()}
          </div>
        </div>

        {matter.description && (
          <div className="mb-4 p-4 bg-neutral-50 dark:bg-metallic-gray-900/50 rounded-lg">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{matter.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-neutral-400 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Client</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{matter.client_name}</p>
              {matter.client_email && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400">{matter.client_email}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-neutral-400 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Instructing Firm</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{matter.instructing_firm}</p>
              {matter.instructing_attorney && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400">{matter.instructing_attorney}</p>
              )}
            </div>
          </div>

          {matter.court_case_number && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Case Number</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{matter.court_case_number}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Created</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{formatDate(matter.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* WIP Summary Card */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Work in Progress
          </h3>
        </div>
        <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">
          {formatRand(matter.wip_value || 0)}
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Total unbilled work logged
        </p>
      </div>

      {/* Budget Comparison (Path A Only) */}
      {isPathA && (
        <BudgetComparisonWidget
          originalBudget={originalBudget}
          amendmentTotal={amendmentTotal}
          wipValue={matter.wip_value || 0}
          amendmentCount={amendmentCount}
        />
      )}

      {/* Path B Info */}
      {!isPathA && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <p className="text-sm text-green-800 dark:text-green-300">
            <strong>Path B: Accept & Work</strong> - This matter was accepted without a pro forma. 
            Use Simple Fee Entry for traditional brief fees, or track time and expenses for hybrid billing.
          </p>
        </div>
      )}
    </div>
  );
};
