/**
 * MobileRecordPaymentModal Component
 * 
 * Mobile-optimized modal for recording payments with simplified form layout.
 * Designed for touch interaction with large inputs and clear visual hierarchy.
 * 
 * Requirements: 11.2
 */
import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { MobileCurrencyInput, MobileTextInput } from './MobileFormInputs';
import { X, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { PaymentService, type PaymentCreate } from '../../services/api/payment.service';
import { formatRand } from '../../lib/currency';
import { useModalForm } from '../../hooks/useModalForm';
import { createValidator, required, numeric, positive } from '../../utils/validation.utils';
import type { Invoice } from '../../types';

interface MobileRecordPaymentModalProps {
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
  'Direct Deposit',
];

interface PaymentFormData {
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  notes: string;
}

/**
 * MobileRecordPaymentModal Component
 * 
 * Mobile-specific optimizations:
 * - Simplified form layout with fewer fields visible at once
 * - Large touch targets (minimum 48px)
 * - Bottom sheet style modal
 * - Reduced cognitive load with step-by-step flow
 * - Auto-focus on amount field
 * - Quick amount buttons for common values
 * 
 * @example
 * ```tsx
 * <MobileRecordPaymentModal
 *   isOpen={showPaymentModal}
 *   invoice={selectedInvoice}
 *   onClose={() => setShowPaymentModal(false)}
 *   onSuccess={handlePaymentSuccess}
 * />
 * ```
 */
export const MobileRecordPaymentModal: React.FC<MobileRecordPaymentModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onSuccess
}) => {
  // Create validator for payment form
  const validator = useMemo(() => createValidator<PaymentFormData>({
    amount: [required(), numeric(), positive()],
    payment_date: [required()],
    payment_method: [required()],
    reference_number: [], // Optional
    notes: [], // Optional
  }), []);

  // Use the modal form hook
  const {
    formData,
    isLoading,
    error,
    validationErrors,
    handleChange,
    handleSubmit,
    reset,
  } = useModalForm<PaymentFormData>({
    initialData: {
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'EFT',
      reference_number: '',
      notes: '',
    },
    onSubmit: async (data) => {
      if (!invoice) throw new Error('No invoice selected');
      
      const paymentData: PaymentCreate = {
        invoice_id: invoice.id,
        amount: data.amount,
        payment_date: data.payment_date,
        payment_method: data.payment_method,
        reference_number: data.reference_number.trim() || undefined,
        notes: data.notes.trim() || undefined,
      };

      await PaymentService.recordPayment(paymentData);
    },
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    validate: (data) => {
      const result = validator.validate(data);
      return result.isValid ? null : result.errors;
    },
    successMessage: 'Payment recorded successfully!',
    resetOnSuccess: true,
  });

  // Calculate payment details
  const paymentCalculations = useMemo(() => {
    if (!invoice) return null;
    
    const paymentAmount = formData.amount || 0;
    const outstandingBalance = invoice.outstanding_balance || 
      (invoice.total_amount - (invoice.amount_paid || 0));
    const remainingBalance = outstandingBalance - paymentAmount;
    
    const isOverpayment = paymentAmount > outstandingBalance;
    const isFullPayment = Math.abs(remainingBalance) < 0.01;

    return {
      paymentAmount,
      outstandingBalance,
      remainingBalance,
      isOverpayment,
      isFullPayment,
    };
  }, [invoice, formData.amount]);

  // Quick amount buttons for common payment scenarios
  const quickAmounts = useMemo(() => {
    if (!paymentCalculations) return [];
    
    const { outstandingBalance } = paymentCalculations;
    const amounts: Array<{
      label: string;
      amount: number;
      variant: 'primary' | 'secondary';
    }> = [];
    
    // Full payment
    amounts.push({
      label: 'Full Payment',
      amount: outstandingBalance,
      variant: 'primary' as const,
    });
    
    // Half payment
    if (outstandingBalance > 100) {
      amounts.push({
        label: 'Half Payment',
        amount: Math.round(outstandingBalance / 2),
        variant: 'secondary' as const,
      });
    }
    
    // Common round amounts
    const roundAmounts = [1000, 5000, 10000].filter(amt => amt < outstandingBalance);
    roundAmounts.forEach(amt => {
      amounts.push({
        label: formatRand(amt),
        amount: amt,
        variant: 'secondary' as const,
      });
    });
    
    return amounts.slice(0, 4); // Limit to 4 buttons
  }, [paymentCalculations]);

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  const handleQuickAmount = (amount: number) => {
    handleChange('amount', amount);
  };

  if (!isOpen || !invoice || !paymentCalculations) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:p-4 sm:items-center">
      <div className={cn(
        "bg-white dark:bg-metallic-gray-900 w-full max-w-lg overflow-hidden",
        "sm:rounded-xl sm:shadow-xl sm:max-h-[90vh]",
        // Mobile: bottom sheet style
        "rounded-t-2xl max-h-[85vh]",
        // Animation
        "animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in-0 duration-300"
      )}>
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white dark:bg-metallic-gray-900 border-b border-neutral-200 dark:border-metallic-gray-700 z-10">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Record Payment
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Invoice {invoice.invoice_number}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300",
                "hover:bg-neutral-100 dark:hover:bg-metallic-gray-800",
                "transition-colors disabled:opacity-50",
                "mobile-touch-target"
              )}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto">
          {/* Invoice Summary - Compact */}
          <div className="p-4 sm:p-6 bg-neutral-50 dark:bg-metallic-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Outstanding</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {formatRand(paymentCalculations.outstandingBalance)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Total Invoice</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatRand(invoice.total_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Payment Amount */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Payment Amount
              </label>
              
              {/* Quick Amount Buttons */}
              {quickAmounts.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {quickAmounts.map((quickAmount, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuickAmount(quickAmount.amount)}
                      disabled={isLoading}
                      className={cn(
                        "p-3 rounded-lg text-sm font-medium transition-colors",
                        "mobile-touch-target",
                        quickAmount.variant === 'primary' 
                          ? "bg-judicial-blue-900 text-white hover:bg-judicial-blue-800"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-metallic-gray-700 dark:text-neutral-300 dark:hover:bg-metallic-gray-600"
                      )}
                    >
                      {quickAmount.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Amount Input */}
              <MobileCurrencyInput
                value={formData.amount || 0}
                onChange={(value) => handleChange('amount', value)}
                required
                disabled={isLoading}
                min={0.01}
                step={0.01}
              />
              
              {validationErrors.amount && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {validationErrors.amount}
                </p>
              )}
              
              {/* Balance Calculation */}
              {paymentCalculations.paymentAmount > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-neutral-100 dark:bg-metallic-gray-800">
                  <div className="flex items-center gap-3">
                    {paymentCalculations.isOverpayment ? (
                      <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    ) : paymentCalculations.isFullPayment ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {paymentCalculations.isOverpayment ? 'Overpayment' : 
                         paymentCalculations.isFullPayment ? 'Full Payment' : 'Partial Payment'}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Remaining: {formatRand(Math.abs(paymentCalculations.remainingBalance))}
                        {paymentCalculations.isOverpayment && ' (overpaid)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => handleChange('payment_method', e.target.value)}
                required
                disabled={isLoading}
                className={cn(
                  "block w-full px-4 py-4 text-base",
                  "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
                  "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
                  "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
                  "disabled:opacity-50",
                  "mobile-touch-target"
                )}
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Reference Number */}
            <MobileTextInput
              label="Reference Number"
              value={formData.reference_number}
              onChange={(value) => handleChange('reference_number', value)}
              placeholder="Transaction ID, Cheque number, etc."
              disabled={isLoading}
              helpText="Optional - for tracking purposes"
            />

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error.message || 'An error occurred while recording the payment.'}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Actions - Sticky Bottom */}
        <div className="sticky bottom-0 bg-white dark:bg-metallic-gray-900 border-t border-neutral-200 dark:border-metallic-gray-700 p-4 sm:p-6">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
              size="lg"
              className="flex-1 mobile-touch-target"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading || formData.amount <= 0}
              size="lg"
              className="flex-1 mobile-touch-target"
              loading={isLoading}
            >
              Record Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};