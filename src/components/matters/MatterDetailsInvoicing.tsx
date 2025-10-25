import React, { useState } from 'react';
import { FileText, Clock, Receipt, TrendingUp, ArrowRight, Briefcase } from 'lucide-react';
import { MatterInvoicePanel } from '../invoices/MatterInvoicePanel';
import { TimeEntryList } from '../time-entries/TimeEntryList';
import { ServiceList } from '../services/ServiceList';
import { ExpenseList } from '../expenses/ExpenseList';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'time-entries' | 'expenses'>('overview');

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
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'services'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-metallic-gray-600'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Services
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

      {activeTab === 'services' && (
        <ServiceList
          matterId={matterId}
          matterTitle={matterTitle}
        />
      )}

      {activeTab === 'time-entries' && (
        <TimeEntryList
          matterId={matterId}
          matterTitle={matterTitle}
          defaultRate={defaultRate}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpenseList matterId={matterId} />
      )}

      {activeTab !== 'overview' && (
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
                  Log services → Track time → Add expenses → Generate invoice
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
      )}
    </div>
  );
};
