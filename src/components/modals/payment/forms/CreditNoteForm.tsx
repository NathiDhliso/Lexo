/**
 * CreditNoteForm Component
 * Form for issuing a credit note against an invoice
 */

import React, { useState } from 'react';
import { Button, Input } from '../../../design-system/components';
import { AlertCircle } from 'lucide-react';
import { InvoiceService } from '../../../../services/api/invoices.service';
import { supabase } from '../../../../lib/supabase';
import { formatRand } from '../../../../lib/currency';
import { toast } from 'react-hot-toast';
import type { Invoice } from '../../../../types';

interface CreditNoteFormProps {
  invoice: Invoice;
  onSuccess: () => void;
  onCancel: () => void;
  setIsLoading: (loading: boolean) => void;
}

type CreditNoteCategory = 'billing_error' | 'service_issue' | 'client_dispute' | 'goodwill' | 'other';

export const CreditNoteForm: React.FC<CreditNoteFormProps> = ({
  invoice,
  onSuccess,
  onCancel,
  setIsLoading
}) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState<CreditNoteCategory>('billing_error');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const creditAmount = parseFloat(amount) || 0;
  const balanceDue = invoice.balance_due || (invoice.total_amount - (invoice.amount_paid || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (creditAmount <= 0) {
      toast.error('Please enter a valid credit amount');
      return;
    }
    
    if (creditAmount > balanceDue) {
      toast.error('Credit amount cannot exceed balance due');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for the credit note');
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    const loadingToast = toast.loading('Issuing credit note...');
    
    try {
      // Create credit note
      const { error } = await supabase
        .from('credit_notes')
        .insert({
          invoice_id: invoice.id,
          advocate_id: invoice.advocate_id,
          amount: creditAmount,
          reason: reason.trim(),
          reason_category: category,
          status: 'issued',
          issued_at: new Date().toISOString(),
          credit_note_number: `CN-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        })
        .select()
        .single();

      if (error) throw error;

      // Update invoice balance
      const newBalance = balanceDue - creditAmount;
      await InvoiceService.updateInvoice(invoice.id, { 
        balance_due: newBalance,
        amount_paid: (invoice.amount_paid || 0) + creditAmount
      });

      toast.success(`Credit note issued: ${formatRand(creditAmount)}`, { 
        id: loadingToast,
        duration: 4000 
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error issuing credit note:', error);
      toast.error('Failed to issue credit note', { 
        id: loadingToast,
        duration: 5000 
      });
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Balance Info */}
      <div className="bg-judicial-blue-50 dark:bg-judicial-blue-900/20 border border-judicial-blue-200 dark:border-judicial-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-judicial-blue-900 dark:text-judicial-blue-100">
              Invoice Balance: {formatRand(balanceDue)}
            </p>
            <p className="text-xs text-judicial-blue-700 dark:text-judicial-blue-300 mt-1">
              Credit notes reduce the amount owed by the client
            </p>
          </div>
        </div>
      </div>

      {/* Credit Amount */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Credit Amount <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0.01"
          max={balanceDue}
          step="0.01"
          required
          disabled={isSubmitting}
        />
        {creditAmount > 0 && creditAmount <= balanceDue && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
            New balance after credit: <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {formatRand(balanceDue - creditAmount)}
            </span>
          </p>
        )}
      </div>

      {/* Reason Category */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Reason Category <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as CreditNoteCategory)}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent disabled:opacity-50"
        >
          <option value="billing_error">Fee Adjustment / Billing Error</option>
          <option value="service_issue">Service Issue</option>
          <option value="client_dispute">Client Dispute</option>
          <option value="goodwill">Goodwill Credit</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Reason / Notes */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Reason / Notes <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain the reason for this credit note..."
          required
          disabled={isSubmitting}
          rows={4}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent disabled:opacity-50 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || creditAmount <= 0 || creditAmount > balanceDue}
          className="min-w-[140px] bg-status-warning-600 hover:bg-status-warning-700"
        >
          {isSubmitting ? 'Issuing...' : 'Issue Credit Note'}
        </Button>
      </div>
    </form>
  );
};
