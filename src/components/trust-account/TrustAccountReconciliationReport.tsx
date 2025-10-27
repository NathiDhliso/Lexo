/**
 * Trust Account Reconciliation Report
 * Generate and export reconciliation reports for LPC compliance
 * Requirement: 4.8
 */

import React, { useState } from 'react';
import { X, Download, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trustAccountService } from '../../services/api';
import { formatRand } from '../../lib/currency';

interface TrustAccountReconciliationReportProps {
  onClose: () => void;
  onReconciled: () => void;
}

export const TrustAccountReconciliationReport: React.FC<TrustAccountReconciliationReportProps> = ({
  onClose,
  onReconciled,
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const reportData = await trustAccountService.generateReconciliationReport(startDate, endDate);
      setReport(reportData);
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReconciled = async () => {
    if (!report) return;

    try {
      await trustAccountService.markAsReconciled(endDate, report.closingBalance);
      toast.success('Trust account reconciled successfully');
      onReconciled();
      onClose();
    } catch (error: any) {
      console.error('Error marking as reconciled:', error);
      toast.error(error.message || 'Failed to mark as reconciled');
    }
  };

  const handleExportPDF = () => {
    toast.success('PDF export feature coming soon');
    // TODO: Implement PDF export
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 bg-white dark:bg-metallic-gray-900 z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
            Trust Account Reconciliation
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Report Display */}
          {report && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-metallic-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">Opening Balance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                    {formatRand(report.openingBalance)}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">Total Deposits</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{formatRand(report.totalDeposits)}
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">Total Drawdowns</p>
                  <p className="text-2xl font-bold text-red-600">
                    -{formatRand(report.totalDrawdowns + report.totalTransfers)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">Closing Balance</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatRand(report.closingBalance)}
                  </p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-white dark:bg-metallic-gray-800 border border-gray-200 dark:border-metallic-gray-700 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-metallic-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-neutral-100">
                    Transactions ({report.transactions.length})
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-metallic-gray-700 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-metallic-gray-700">
                      {report.transactions.map((transaction: any) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-100">
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              transaction.transaction_type === 'deposit'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {transaction.transaction_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-neutral-100">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            <span className={transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatRand(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-neutral-100">
                            {formatRand(transaction.balance_after)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-metallic-gray-700">
                <button
                  onClick={handleExportPDF}
                  className="px-6 py-2 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-metallic-gray-700 rounded-lg flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export to PDF
                </button>
                
                {!report.isReconciled && (
                  <button
                    onClick={handleMarkReconciled}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Mark as Reconciled
                  </button>
                )}
              </div>
            </div>
          )}

          {!report && !loading && (
            <div className="text-center py-12 text-gray-500 dark:text-neutral-400">
              Select a date range and click "Generate Report" to view reconciliation details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
