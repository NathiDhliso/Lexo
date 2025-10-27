/**
 * PaymentModal Component
 * Unified modal for all payment-related operations
 * 
 * Modes:
 * - record: Record a new payment against an invoice
 * - view: View payment details and history
 * - edit: Edit an existing payment (future)
 * - credit-note: Issue a credit note
 * 
 * @example
 * // Record payment
 * <PaymentModal
 *   mode="record"
 *   invoice={invoice}
 *   isOpen={true}
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 * />
 * 
 * // View payment history
 * <PaymentModal
 *   mode="view"
 *   invoice={invoice}
 *   isOpen={true}
 *   onClose={handleClose}
 * />
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Invoice } from '../../../types';
import { RecordPaymentForm } from './forms/RecordPaymentForm';
import { ViewPaymentHistoryForm } from './forms/ViewPaymentHistoryForm';
import { CreditNoteForm } from './forms/CreditNoteForm';

export type PaymentModalMode = 'record' | 'view' | 'credit-note';

export interface PaymentModalProps {
  mode: PaymentModalMode;
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  mode,
  invoice,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !invoice) return null;

  const getModalTitle = () => {
    switch (mode) {
      case 'record':
        return 'Record Payment';
      case 'view':
        return 'Payment History';
      case 'credit-note':
        return 'Issue Credit Note';
      default:
        return 'Payment';
    }
  };

  const getModalSubtitle = () => {
    return `Invoice ${invoice.invoice_number}`;
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {getModalTitle()}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {getModalSubtitle()}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Render appropriate form based on mode */}
        <div className="p-6">
          {mode === 'record' && (
            <RecordPaymentForm
              invoice={invoice}
              onSuccess={handleSuccess}
              onCancel={handleClose}
              setIsLoading={setIsLoading}
            />
          )}

          {mode === 'view' && (
            <ViewPaymentHistoryForm
              invoice={invoice}
              onClose={handleClose}
              onPaymentChange={onSuccess}
            />
          )}

          {mode === 'credit-note' && (
            <CreditNoteForm
              invoice={invoice}
              onSuccess={handleSuccess}
              onCancel={handleClose}
              setIsLoading={setIsLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};
