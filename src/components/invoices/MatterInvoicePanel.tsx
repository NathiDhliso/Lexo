import React, { useState, useEffect } from 'react';
import { FileText, Clock, DollarSign, Plus, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { UnifiedInvoiceWizard } from './UnifiedInvoiceWizard';
import { TimeEntryService } from '../../services/api/time-entries.service';
import { formatRand } from '../../lib/currency';

interface MatterInvoicePanelProps {
  matterId: string;
  matterTitle: string;
  clientName: string;
  bar: string;
  matterType?: string;
  proFormaId?: string;
}

export const MatterInvoicePanel: React.FC<MatterInvoicePanelProps> = ({
  matterId,
  matterTitle,
  clientName,
  bar,
  matterType,
  proFormaId
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceStats, setInvoiceStats] = useState({
    totalBillable: 0,
    totalBilled: 0,
    unbilledHours: 0,
    unbilledAmount: 0
  });

  useEffect(() => {
    loadMatterData();
  }, [matterId]);

  const loadMatterData = async () => {
    setLoading(true);
    try {
      const timeEntriesResult = await TimeEntryService.getTimeEntries({
        matterId,
        sortBy: 'entry_date',
        sortOrder: 'desc'
      });
      
      const unbilledEntries = timeEntriesResult.data.filter((entry: any) => !entry.is_billed);
      setTimeEntries(unbilledEntries);

      const totalBillable = unbilledEntries.reduce((sum: number, entry: any) => 
        sum + (entry.amount || 0), 0
      );
      
      const totalHours = unbilledEntries.reduce((sum: number, entry: any) => 
        sum + (entry.hours || 0), 0
      );

      setInvoiceStats({
        totalBillable,
        totalBilled: 0,
        unbilledHours: totalHours,
        unbilledAmount: totalBillable
      });
    } catch (error) {
      console.error('Error loading matter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceGenerated = (invoiceData: any) => {
    console.log('Invoice generated:', invoiceData);
    setShowWizard(false);
    loadMatterData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Billing & Invoices</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Manage time entries, expenses, and generate invoices
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          disabled={timeEntries.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

      {proFormaId && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Linked to Pro Forma Request
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This matter was created from a pro forma request. You can convert the pro forma to a final invoice.
              </p>
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Convert to Invoice
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Unbilled Hours</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {invoiceStats.unbilledHours.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Unbilled Amount</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {formatRand(invoiceStats.unbilledAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Billed</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {formatRand(invoiceStats.totalBilled)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-metallic-gray-900 p-4 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Invoices</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                0
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
        <div className="p-4 border-b border-neutral-200 dark:border-metallic-gray-700">
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Unbilled Time Entries</h4>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-metallic-gray-700">
          {timeEntries.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
              <p className="text-neutral-600 dark:text-neutral-400">No unbilled time entries</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                Add time entries to generate an invoice
              </p>
            </div>
          ) : (
            timeEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {new Date(entry.entry_date).toLocaleDateString('en-ZA', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {entry.hours.toFixed(1)} hours
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{entry.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatRand(entry.amount)}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      @ {formatRand(entry.hourly_rate)}/hr
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {timeEntries.length > 5 && (
          <div className="p-3 border-t border-neutral-200 dark:border-metallic-gray-700 text-center">
            <button className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium">
              View all {timeEntries.length} time entries
            </button>
          </div>
        )}
      </div>

      {timeEntries.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100">Ready to Invoice</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You have {timeEntries.length} unbilled time {timeEntries.length === 1 ? 'entry' : 'entries'} totaling {formatRand(invoiceStats.unbilledAmount)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Create Invoice
            </button>
          </div>
        </div>
      )}

      {showWizard && (
        <UnifiedInvoiceWizard
          matter={{
            id: matterId,
            title: matterTitle,
            clientName,
            bar,
            wipValue: invoiceStats.unbilledAmount,
            disbursements: 0,
            matterType
          }}
          onClose={() => setShowWizard(false)}
          onGenerate={handleInvoiceGenerated}
        />
      )}
    </div>
  );
};
