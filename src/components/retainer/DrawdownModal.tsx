import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface DrawdownModalProps {
  retainerId: string;
  currentBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const DrawdownModal: React.FC<DrawdownModalProps> = ({
  retainerId,
  currentBalance,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    invoiceReference: '',
  });

  const amount = parseFloat(formData.amount || '0');
  const newBalance = currentBalance - amount;
  const insufficientFunds = amount > currentBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (insufficientFunds) {
      toast.error('Insufficient funds in trust account');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: transactionError } = await supabase.from('trust_transactions').insert({
        retainer_id: retainerId,
        transaction_type: 'drawdown',
        amount: amount,
        description: formData.description,
        reference: formData.invoiceReference,
        transaction_date: new Date().toISOString().split('T')[0],
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

      toast.success('Drawdown recorded successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error recording drawdown:', error);
      toast.error(error.message || 'Failed to record drawdown');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-lg w-full">
        <div className="border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
            Drawdown Funds from Trust Account
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
              Available Balance: <span className="font-semibold">R {currentBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Drawdown Amount (R) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder="10000.00"
              step="0.01"
              min="0.01"
              max={currentBalance}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Invoice Reference (Optional)
            </label>
            <input
              type="text"
              name="invoiceReference"
              value={formData.invoiceReference}
              onChange={(e) => setFormData({ ...formData, invoiceReference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder="INV-2025-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              rows={2}
              placeholder="Payment for legal services rendered"
              required
            />
          </div>

          {insufficientFunds && formData.amount && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Insufficient Funds</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  The drawdown amount exceeds the available balance.
                </p>
              </div>
            </div>
          )}

          {!insufficientFunds && formData.amount && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                New Balance: <span className="font-semibold">R {newBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </p>
              {newBalance < currentBalance * 0.2 && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  ⚠️ Warning: Balance will be below 20% threshold
                </p>
              )}
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
              disabled={loading || insufficientFunds}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Drawdown Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
