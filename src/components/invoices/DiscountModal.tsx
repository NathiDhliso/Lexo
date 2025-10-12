import React, { useState } from 'react';
import { X, Percent, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface DiscountModalProps {
  invoiceId: string;
  currentTotal: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  invoiceId,
  currentTotal,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [reason, setReason] = useState('');

  const calculateDiscountAmount = () => {
    const value = parseFloat(discountValue) || 0;
    if (discountType === 'percentage') {
      return (currentTotal * value) / 100;
    }
    return value;
  };

  const newTotal = currentTotal - calculateDiscountAmount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const discountAmount = calculateDiscountAmount();

      const { error } = await supabase
        .from('invoices')
        .update({
          discount_amount: discountAmount,
          discount_type: discountType,
          discount_reason: reason,
          total_amount: newTotal,
        })
        .eq('id', invoiceId);

      if (error) throw error;

      toast.success('Discount applied successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error applying discount:', error);
      toast.error(error.message || 'Failed to apply discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-md w-full">
        <div className="border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
            Apply Discount
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-neutral-400">Current Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              R {currentTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Discount Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="percentage"
                  checked={discountType === 'percentage'}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage')}
                  className="mr-2"
                />
                <Percent className="w-4 h-4 mr-1" />
                Percentage
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="fixed"
                  checked={discountType === 'fixed'}
                  onChange={(e) => setDiscountType(e.target.value as 'fixed')}
                  className="mr-2"
                />
                <DollarSign className="w-4 h-4 mr-1" />
                Fixed Amount
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Discount Value
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder={discountType === 'percentage' ? '10' : '5000'}
              step={discountType === 'percentage' ? '0.1' : '0.01'}
              min="0"
              max={discountType === 'percentage' ? '100' : currentTotal.toString()}
              required
            />
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              {discountType === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount in Rands'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Reason for Discount
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              rows={3}
              placeholder="Early payment discount, goodwill gesture, etc."
              required
            />
          </div>

          {discountValue && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Discount Amount</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  - R {calculateDiscountAmount().toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">New Total</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  R {newTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
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
              disabled={loading || !discountValue}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-mpondo-gold-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-mpondo-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Applying...' : 'Apply Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
