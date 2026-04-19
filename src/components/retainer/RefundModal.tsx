import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface RefundModalProps {
  retainerId: string;
  currentBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  retainerId,
  currentBalance,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    refundMethod: 'EFT',
    accountDetails: '',
  });

  const amount = parseFloat(formData.amount || '0');
  const newBalance = currentBalance - amount;
  const insufficientFunds = amount > currentBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (insufficientFunds) {
      toast.error('Refund amount exceeds available balance');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: transactionError } = await supabase.from('trust_transactions').insert({
        retainer_id: retainerId,
        transaction_type: 'refund',
        amount: amount,
        description: formData.reason,
        reference: `REFUND-${Date.now()}`,
        transaction_date: new Date().toISOString().split('T')[0],
        balance_before: currentBalance,
        balance_after: newBalance,
        created_by: user.id,
        metadata: {
          refund_method: formData.refundMethod,
          account_details: formData.accountDetails,
        },
      });

      if (transactionError) throw transactionError;

      const { error: updateError } = await supabase
        .from('retainer_agreements')
        .update({ trust_account_balance: newBalance })
        .eq('id', retainerId);

      if (updateError) throw updateError;

      toast.success('Refund processed successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast.error(error.message || 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-lg w-full">
        <div className="border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
            Process Retainer Refund
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-sm text-neutral-800 dark:text-neutral-300">
              Available Balance: <span className="font-semibold">R {currentBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Important</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Refunds are typically processed when a matter is completed early or cancelled.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Refund Amount (R) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder="5000.00"
              step="0.01"
              min="0.01"
              max={currentBalance}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Refund Method *
            </label>
            <select
              name="refundMethod"
              value={formData.refundMethod}
              onChange={(e) => setFormData({ ...formData, refundMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              required
            >
              <option value="EFT">EFT Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Account Details (Optional)
            </label>
            <input
              type="text"
              name="accountDetails"
              value={formData.accountDetails}
              onChange={(e) => setFormData({ ...formData, accountDetails: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder="Bank account or reference"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Reason for Refund *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              rows={3}
              placeholder="Matter completed early, unused retainer funds..."
              required
            />
          </div>

          {insufficientFunds && formData.amount && (
            <div className="bg-status-error-50 dark:bg-status-error-900/20 border border-status-error-200 dark:border-status-error-800 rounded-lg p-4">
              <p className="text-sm text-status-error-800 dark:text-status-error-300">
                Refund amount exceeds available balance
              </p>
            </div>
          )}

          {!insufficientFunds && formData.amount && (
            <div className="bg-status-success-50 dark:bg-status-success-900/20 border border-status-success-200 dark:border-status-success-800 rounded-lg p-4">
              <p className="text-sm text-status-success-800 dark:text-status-success-300">
                Remaining Balance: <span className="font-semibold">R {newBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </p>
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
              disabled={loading || insufficientFunds}
              className="flex-1 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Process Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
