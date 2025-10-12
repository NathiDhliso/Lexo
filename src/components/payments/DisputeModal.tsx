import React, { useState } from 'react';
import { X, AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface DisputeModalProps {
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  invoiceId,
  invoiceNumber,
  invoiceAmount,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    disputeType: 'amount_incorrect',
    disputedAmount: '',
    reason: '',
    description: '',
    evidenceUrls: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('payment_disputes').insert({
        invoice_id: invoiceId,
        dispute_type: formData.disputeType,
        disputed_amount: parseFloat(formData.disputedAmount) || invoiceAmount,
        reason: formData.reason,
        description: formData.description,
        evidence_urls: formData.evidenceUrls,
        status: 'open',
        created_by: user.id,
      });

      if (error) throw error;

      await supabase
        .from('invoices')
        .update({ payment_status: 'disputed' })
        .eq('id', invoiceId);

      toast.success('Payment dispute created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      toast.error(error.message || 'Failed to create dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-metallic-gray-900 border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
              Create Payment Dispute
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-neutral-400">Invoice Number</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-neutral-100">{invoiceNumber}</p>
            <p className="text-sm text-gray-600 dark:text-neutral-400 mt-2">Invoice Amount</p>
            <p className="text-xl font-bold text-gray-900 dark:text-neutral-100">
              R {invoiceAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Dispute Type *
            </label>
            <select
              value={formData.disputeType}
              onChange={(e) => setFormData({ ...formData, disputeType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              required
            >
              <option value="amount_incorrect">Amount Incorrect</option>
              <option value="work_not_done">Work Not Done</option>
              <option value="quality_issue">Quality Issue</option>
              <option value="billing_error">Billing Error</option>
              <option value="duplicate_charge">Duplicate Charge</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Disputed Amount (R)
            </label>
            <input
              type="number"
              value={formData.disputedAmount}
              onChange={(e) => setFormData({ ...formData, disputedAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder={invoiceAmount.toString()}
              step="0.01"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              Leave empty to dispute the full amount
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Reason *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder="Brief summary of the dispute"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Detailed Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              rows={4}
              placeholder="Provide detailed information about the dispute..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Supporting Evidence
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-metallic-gray-600 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 dark:text-neutral-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                Upload documents, emails, or other evidence
              </p>
              <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
                (Optional - can be added later)
              </p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">Important</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              Creating a dispute will mark this invoice as disputed and notify the relevant parties. 
              Please ensure all information is accurate before submitting.
            </p>
          </div>

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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
