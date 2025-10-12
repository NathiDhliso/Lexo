import React, { useState } from 'react';
import { FileText, FileCheck, Clock } from 'lucide-react';
import { InvoiceList } from '../components/invoices/InvoiceList';
import { PaymentTrackingDashboard } from '../components/invoices/PaymentTrackingDashboard';
import { ProFormaInvoiceList } from '../components/invoices/ProFormaInvoiceList';
import { MatterTimeEntriesView } from '../components/invoices/MatterTimeEntriesView';

const InvoicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'proforma' | 'time-entries' | 'tracking'>('invoices');

  return (
    <div className="w-full space-y-6 min-h-screen bg-neutral-50 dark:bg-metallic-gray-950 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Invoices</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage your invoices and payment tracking</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-neutral-100 dark:bg-metallic-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'invoices'
              ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 theme-shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
          data-testid="invoices-tab"
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('proforma')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'proforma'
              ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 theme-shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
          data-testid="proforma-tab"
        >
          <FileCheck className="w-4 h-4 inline mr-2" />
          Pro Forma
        </button>
        <button
          onClick={() => setActiveTab('time-entries')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'time-entries'
              ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 theme-shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
          data-testid="time-entries-tab"
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Time Entries
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tracking'
              ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 theme-shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
          data-testid="tracking-tab"
        >
          Payment Tracking
        </button>
      </div>

      {activeTab === 'invoices' && <InvoiceList />}
      {activeTab === 'proforma' && <ProFormaInvoiceList />}
      {activeTab === 'time-entries' && <MatterTimeEntriesView />}
      {activeTab === 'tracking' && <PaymentTrackingDashboard />}
    </div>
  );
};

export default InvoicesPage;