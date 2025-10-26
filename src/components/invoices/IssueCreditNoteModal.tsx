/**
 * IssueCreditNoteModal Component
 * Modal for issuing credit notes against invoices with sequential numbering
 * Requirements: Credit notes with SARS compliance
 */

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { invoiceNumberingService } from '../../services/api/invoice-numbering.service';
import { creditNoteService } from '../../services/api/credit-note.service';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';
import type { Invoice } from '../../types';

interface IssueCreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess?: () => void;
}

const CREDIT_REASONS = [
  'Fee adjustment',
  'Calculation error',
  'Goodwill discount',
  'Disbursement correction',
  'Service not rendered',
  'Duplicate charge',
  'Other (specify)'
];

export const IssueCreditNoteModal: React.FC<IssueCreditNoteModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess
}) => {
  const [reason, setReason] = useState('Fee adjustment');
  const [customReason, setCustomReason] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nextCreditNoteNumber, setNextCreditNoteNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadNextCreditNoteNumber();
      // Reset form
      setReason('Fee adjustment');
      setCustomReason('');
      setAmount('');
      setNotes('');
    }
  }, [isOpen]);

  const loadNextCreditNoteNumber = async () => {
    try {
      const preview = await invoiceNumberingService.previewNextCreditNoteNumber();
      setNextCreditNoteNumber(preview);
    } catch (error) {
      console.error('Failed to load credit note number:', error);
    }
  };

  if (!isOpen || !invoice) return null;

  const creditAmount = parseFloat(amount) || 0;
  const outstandingBalance = invoice.outstanding_balance || 
    (invoice.total_amount - (invoice.amount_paid || 0));
  const newBalance = outstandingBalance - creditAmount;
  
  const isOverCredit = creditAmount > outstandingBalance;
  const maxCreditAmount = outstandingBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (creditAmount <= 0) {
      toast.error('Credit amount must be greater than zero');
      return;
    }

    if (creditAmount > maxCreditAmount) {
      toast.error(`Credit amount cannot exceed outstanding balance of ${formatRand(maxCreditAmount)}`);
      return;
    }

    const finalReason = reason === 'Other (specify)' ? customReason : reason;
    if (!finalReason.trim()) {
      toast.error('Please specify the reason for credit note');
      return;
    }

    setIsLoading(true);

    try {
      // Create credit note
      const creditNoteData = {
        invoice_id: invoice.id,
        amount: creditAmount,
        reason: finalReason,
        notes: notes.trim() || undefined
      };

      const creditNote = await creditNoteService.createCreditNote(creditNoteData);
      
      if (!creditNote) {
        throw new Error('Failed to create credit note');
      }

      // Issue the credit note immediately
      await creditNoteService.issueCreditNote(creditNote.id);

      toast.success(`Credit note ${nextCreditNoteNumber} issued successfully`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Credit note creation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to issue credit note');
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
              Issue Credit Note
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
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-mpondo-gold-600" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Credit Note Number: <span className="text-mpondo-gold-600">{nextCreditNoteNumber}</span>
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Original Total</p>
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
          {/* Reason for Credit */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Reason for Credit <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              className="block w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50"
            >
              {CREDIT_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Custom Reason (if "Other" selected) */}
          {reason === 'Other (specify)' && (
            <FormInput
              label="Specify Reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Enter the reason for this credit note"
              required
              disabled={isLoading}
            />
          )}

          {/* Credit Amount */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Credit Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                R
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={maxCreditAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                disabled={isLoading}
                className="block w-full pl-8 pr-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50"
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Maximum credit amount: {formatRand(maxCreditAmount)}
            </p>

            {/* Real-time Balance Calculation */}
            {creditAmount > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-neutral-100 dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700">
                <div className="flex items-start gap-2">
                  {isOverCredit ? (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {isOverCredit ? 'Invalid Credit Amount' : 'New Balance After Credit'}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {isOverCredit ? (
                        <span className="text-red-600 dark:text-red-400">
                          Credit amount exceeds outstanding balance
                        </span>
                      ) : (
                        <>
                          New outstanding balance: <span className={`font-semibold ${
                            Math.abs(newBalance) < 0.01 ? 'text-green-600 dark:text-green-400' : 
                            'text-neutral-900 dark:text-neutral-100'
                          }`}>
                            {formatRand(Math.max(0, newBalance))}
                          </span>
                          {Math.abs(newBalance) < 0.01 && ' (Fully credited)'}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Additional Notes <span className="text-neutral-400">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this credit note..."
              rows={3}
              disabled={isLoading}
              className="block w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50 resize-none"
            />
          </div>

          {/* SARS Compliance Notice */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              SARS Compliance
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Credit note will be assigned sequential number: {nextCreditNoteNumber}</li>
              <li>Original invoice reference will be included</li>
              <li>VAT adjustments will be calculated automatically</li>
              <li>Audit trail will be maintained for compliance</li>
            </ul>
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
              disabled={isLoading || creditAmount <= 0 || isOverCredit}
              className="min-w-[140px]"
            >
              {isLoading ? 'Issuing...' : 'Issue Credit Note'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueCreditNoteModal;
