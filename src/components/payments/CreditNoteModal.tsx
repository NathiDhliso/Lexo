import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface CreditNoteModalProps {
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmount: number;
  disputeId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreditNoteModal: React.FC<CreditNoteModalProps> = ({
  invoiceId,
  invoiceNumber,
  invoiceAmount,
  disputeId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    reason: disputeId ? 'dispute_resolution' : 'billing_error',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const creditAmount = parseFloat(formData.amount);
      if (creditAmount > invoiceAmount) {
        throw new Error('Credit amount cannot exceed invoice amount');
      }

      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      
      const { data: lastCreditNote } = await supabase
        .from('credit_notes')
        .select('credit_note_number')
        .like('credit_note_number', `CN-${year}${month}-%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let sequence = 1;
      if (lastCreditNote?.credit_note_number) {
        const lastSequence = parseInt(lastCreditNote.credit_note_number.split('-')[2]);
        sequence = lastSequence + 1;
      }

      const creditNoteNumber = `CN-${year}${month}-${String(sequence).padStart(4, '0')}`;

      const { error } = await supabase.from('credit_notes').insert({
        credit_note_number: creditNoteNumber,
        invoice_id: invoiceId,
        dispute_id: disputeId || null,
        amount: creditAmount,
        reason: formData.reason,
        description: formData.description,
        status: 'issued',
        issued_by: user.id,
        issued_at: new Date().toISOString(),
      });

      if (error) throw error;

      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('id', invoiceId)
        .single();

      if (invoice) {
        const newTotal = invoice.total_amount - creditAmount;
        await supabase
          .from('invoices')
          .update({ 
            total_amount: newTotal,
            payment_status: newTotal === 0 ? 'paid' : 'partial'
          })
          .eq('id', invoiceId);
      }

      if (disputeId) {
        await supabase
          .from('payment_disputes')
          .update({ 
            status: 'resolved',
            resolution_type: 'credit_note',
            resolved_at: new Date().toISOString()
          })
          .eq('id', disputeId);
      }

      toast.success(`Credit note ${creditNoteNumber} created successfully`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating credit note:', error);
      toast.error(error.message || 'Failed to create credit note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-lg w-full">
        <div className="border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
              Create Credit Note
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-neutral-400">Invoice Number</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-neutral-100">{invoiceNumber}</p>
            <p className="text-sm text-gray-600 dark:text-neutral-400 mt-2">Invoice Amount</p>
            <p className="text-xl font-bold text-gray-900 dark:text-neutral-100">
              R {invoiceAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {disputeId && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                This credit note will resolve the associated payment dispute.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Credit Amount (R) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max={invoiceAmount}
              required
            />
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              Maximum: R {invoiceAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Reason *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              required
            >
              <option value="dispute_resolution">Dispute Resolution</option>
              <option value="billing_error">Billing Error</option>
              <option value="goodwill">Goodwill Gesture</option>
              <option value="discount">Discount Applied</option>
              <option value="overpayment">Overpayment Refund</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              rows={3}
              placeholder="Provide details about this credit note..."
              required
            />
          </div>

          {formData.amount && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">New Invoice Total</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  R {(invoiceAmount - parseFloat(formData.amount)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-50 dark:bg-metallic-gray-900 dark:hover:bg-metallic-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.amount}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-mpondo-gold-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-mpondo-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Credit Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
