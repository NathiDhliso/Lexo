/**
 * RecordPaymentModal Component
 * Modal for recording partial or full payments against invoices
 * Requirements: 1.2, 1.3, 1.4
 */
import React, { useState, useEffect } from 'react';
import { Button } from '../design-system/components';
import { X, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { PaymentService, type PaymentCreate } from '../../services/api/payment.service';
import { formatRand } from '../../lib/currency';
import type { Invoice } from '../../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  'EFT',
  'Cash',
  'Cheque',
  'Credit Card',
  'Debit Card',
  'Direct Deposit',
  'Other'
];

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onSuccess
}) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('EFT');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens with new invoice
  useEffect(() => {
    if (isOpen && invoice) {
      setAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('EFT');
      setReferenceNumber('');
      setNotes('');
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const paymentAmount = parseFloat(amount) || 0;
  const outstandingBalance = invoice.outstanding_balance || 
    (invoice.total_amount - (invoice.amount_paid || 0));
  const remainingBalance = outstandingBalance - paymentAmount;
  
  const isOverpayment = paymentAmount > outstandingBalance;
  const isFullPayment = Math.abs(remainingBalance) < 0.01; // Account for floating point

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentAmount <= 0) {
      return; // Validation handled by input
    }

    setIsLoading(true);

    try {
      const paymentData: PaymentCreate = {
        invoice_id: invoice.id,
        amount: paymentAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined
      };

      await PaymentService.recordPayment(paymentData);

      // Success handled by service (toast notification)
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error handled by service (toast notification)
      console.error('Payment recording failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Record Payment
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Invoice {invoice.invoice_number}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="p-6 bg-neutral-50 dark:bg-metallic-gray-800 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Total Amount</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {formatRand(invoice.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Amount Paid</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatRand(invoice.amount_paid || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Outstanding</p>
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {formatRand(outstandingBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                disabled={isLoading}
                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50"
              />
            </div>
            
            {/* Real-time Balance Calculation */}
            {paymentAmount > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-neutral-100 dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700">
                <div className="flex items-start gap-2">
                  {isOverpayment ? (
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  ) : isFullPayment ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {isOverpayment ? 'Overpayment Warning' : isFullPayment ? 'Full Payment' : 'Partial Payment'}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Remaining balance after payment: <span className={`font-semibold ${
                        isOverpayment ? 'text-orange-600 dark:text-orange-400' : 
                        isFullPayment ? 'text-green-600 dark:text-green-400' : 
                        'text-neutral-900 dark:text-neutral-100'
                      }`}>
                        {formatRand(Math.abs(remainingBalance))}
                        {isOverpayment && ' (overpaid)'}
                      </span>
                    </p>
                    {isOverpayment && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Payment exceeds outstanding balance. This will be recorded as an overpayment.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
              disabled={isLoading}
              className="block w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              disabled={isLoading}
              className="block w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Reference Number <span className="text-neutral-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g., Transaction ID, Cheque number"
              disabled={isLoading}
              className="block w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Notes <span className="text-neutral-400">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this payment..."
              rows={3}
              disabled={isLoading}
              className="block w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || paymentAmount <= 0}
              className="min-w-[120px]"
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
