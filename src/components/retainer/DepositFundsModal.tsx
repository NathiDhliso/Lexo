import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface DepositFundsModalProps {
  retainerId: string;
  currentBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const DepositFundsModal: React.FC<DepositFundsModalProps> = ({
  retainerId,
  currentBalance,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    reference: '',
    description: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const amount = parseFloat(formData.amount);
      const newBalance = currentBalance + amount;

      const { error: transactionError } = await supabase.from('trust_transactions').insert({
        retainer_id: retainerId,
        transaction_type: 'deposit',
        amount: amount,
        reference: formData.reference,
        description: formData.description,
        transaction_date: formData.paymentDate,
        balance_before: currentBalance,
        balance_after: newBalance,
        created_by: user.id,
      });

      if (transactionError) throw transactionError;

      const { error: updateError } = await supabase
        .from('retainers')
        .update({ balance: newBalance })
        .eq('id', retainerId);

      if (updateError) throw updateError;

      toast.success('Deposit recorded successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error recording deposit:', error);
      toast.error(error.message || 'Failed to record deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-lg w-full">
        <div className="border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
            Deposit Funds to Trust Account
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Current Balance: <span className="font-semibold">R {currentBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Deposit Amount (R) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder="50000.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Payment Reference *
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder="EFT-12345"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Payment Date *
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              rows={2}
              placeholder="Initial retainer deposit"
            />
          </div>

          {formData.amount && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-300">
                New Balance: <span className="font-semibold">R {(currentBalance + parseFloat(formData.amount || '0')).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-50 dark:hover:bg-metallic-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Deposit Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
