/**
 * PaymentHistoryTable Component
 * Displays payment history for an invoice with edit/delete actions
 * Requirements: 1.9, 1.10
 */
import React, { useState, useEffect } from 'react';
import { Button } from '../design-system/components';
import { Edit2, Trash2, Download, AlertCircle } from 'lucide-react';
import { PaymentService, type Payment, type PaymentHistory } from '../../services/api/payment.service';
import { formatRand } from '../../lib/currency';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useConfirmation } from '../../hooks/useConfirmation';

interface PaymentHistoryTableProps {
  invoiceId: string;
  onPaymentChange?: () => void;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  invoiceId,
  onPaymentChange
}) => {
  const [history, setHistory] = useState<PaymentHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const { confirm } = useConfirmation();

  useEffect(() => {
    loadPaymentHistory();
  }, [invoiceId]);

  const loadPaymentHistory = async () => {
    try {
      setIsLoading(true);
      const data = await PaymentService.getPaymentHistory(invoiceId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load payment history:', error);
      // Error toast shown by service
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (payment: Payment) => {
    const confirmed = await confirm({
      title: 'Delete Payment',
      message: `Are you sure you want to delete this payment of ${formatRand(payment.amount)}? This will update the invoice balance.`,
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await PaymentService.deletePayment(payment.id, 'User requested deletion');
      await loadPaymentHistory();
      onPaymentChange?.();
    } catch (error) {
      // Error toast shown by service
      console.error('Failed to delete payment:', error);
    }
  };

  const handleExportCSV = () => {
    if (!history || history.payments.length === 0) {
      toast.error('No payments to export');
      return;
    }

    const csvHeaders = ['Date', 'Amount', 'Method', 'Reference', 'Notes', 'Running Balance'];
    const csvRows = history.payments.map((payment, index) => {
      // Calculate running balance (working backwards from current)
      const paymentsUpToThis = history.payments.slice(index);
      const runningBalance = history.outstanding_balance + 
        paymentsUpToThis.reduce((sum, p) => sum + p.amount, 0);

      return [
        format(new Date(payment.payment_date), 'yyyy-MM-dd'),
        payment.amount.toFixed(2),
        payment.payment_method,
        payment.reference_number || '',
        payment.notes || '',
        runningBalance.toFixed(2)
      ];
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${history.invoice_number}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Payment history exported');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500"></div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
        <p>Failed to load payment history</p>
      </div>
    );
  }

  if (history.payments.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
        <p>No payments recorded yet</p>
        <p className="text-sm mt-1">Click "Record Payment" to add the first payment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Payment History
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {history.payments.length} payment{history.payments.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportCSV}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-metallic-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Method
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Balance After
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-metallic-gray-900 divide-y divide-neutral-200 dark:divide-metallic-gray-700">
            {history.payments.map((payment, index) => {
              // Calculate running balance (working backwards from current)
              const paymentsUpToThis = history.payments.slice(index);
              const balanceAfter = history.outstanding_balance + 
                paymentsUpToThis.reduce((sum, p) => sum + p.amount, 0);

              return (
                <tr key={payment.id} className="hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    {format(new Date(payment.payment_date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    {formatRand(payment.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                    {payment.payment_method}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {payment.reference_number || (
                      <span className="text-neutral-400 dark:text-neutral-500 italic">No reference</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-neutral-900 dark:text-neutral-100">
                    {formatRand(balanceAfter)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDelete(payment)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Delete payment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-neutral-50 dark:bg-metallic-gray-800">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Current Outstanding Balance
              </td>
              <td className="px-4 py-3 text-sm font-bold text-right text-orange-600 dark:text-orange-400">
                {formatRand(history.outstanding_balance)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes Section */}
      {history.payments.some(p => p.notes) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Payment Notes</h4>
          {history.payments
            .filter(p => p.notes)
            .map(payment => (
              <div key={payment.id} className="p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {format(new Date(payment.payment_date), 'dd MMM yyyy')} • {formatRand(payment.amount)}
                    </p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                      {payment.notes}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
