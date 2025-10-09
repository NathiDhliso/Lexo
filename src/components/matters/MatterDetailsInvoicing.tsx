import React, { useState } from 'react';
import { FileText, Clock, Receipt, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { MatterInvoicePanel } from '../invoices/MatterInvoicePanel';
import { TimeEntryList } from '../time-entries/TimeEntryList';

interface MatterDetailsInvoicingProps {
  matterId: string;
  matterTitle: string;
  clientName: string;
  bar: string;
  matterType?: string;
  proFormaId?: string;
  defaultRate?: number;
}

export const MatterDetailsInvoicing: React.FC<MatterDetailsInvoicingProps> = ({
  matterId,
  matterTitle,
  clientName,
  bar,
  matterType,
  proFormaId,
  defaultRate = 2000
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'time-entries' | 'expenses'>('overview');

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-metallic-gray-700">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-metallic-gray-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            Billing Overview
          </button>
          <button
            onClick={() => setActiveTab('time-entries')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'time-entries'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-metallic-gray-600'
            }`}
          >
            <Clock className="w-5 h-5" />
            Time Entries
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'expenses'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-metallic-gray-600'
            }`}
          >
            <Receipt className="w-5 h-5" />
            Expenses
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <MatterInvoicePanel
          matterId={matterId}
          matterTitle={matterTitle}
          clientName={clientName}
          bar={bar}
          matterType={matterType}
          proFormaId={proFormaId}
        />
      )}

      {activeTab === 'time-entries' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Track Your Time</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Add time entries to track billable work on this matter
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Time Entry
              </button>
            </div>
          </div>

          <TimeEntryList
            matterId={matterId}
            matterTitle={matterTitle}
            defaultRate={defaultRate}
          />
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">Track Expenses</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Record disbursements and expenses for this matter
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 p-8 text-center">
            <Receipt className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">No expenses recorded yet</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add Your First Expense
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Billing Workflow
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Track time → Add expenses → Generate invoice → Send to client
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            View Billing Overview
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
