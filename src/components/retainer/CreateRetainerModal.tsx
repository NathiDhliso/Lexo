import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface CreateRetainerModalProps {
  matterId: string;
  matterTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRetainerModal: React.FC<CreateRetainerModalProps> = ({
  matterId,
  matterTitle,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    retainerType: 'project',
    retainerAmount: '',
    billingPeriod: 'one-time',
    startDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('retainer_agreements').insert({
        matter_id: matterId,
        advocate_id: user.id,
        retainer_type: formData.retainerType,
        retainer_amount: parseFloat(formData.retainerAmount),
        billing_period: formData.billingPeriod,
        start_date: formData.startDate,
        notes: formData.description,
        trust_account_balance: 0,
        status: 'active',
      });

      if (error) throw error;

      toast.success('Retainer agreement created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating retainer:', error);
      toast.error(error.message || 'Failed to create retainer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-metallic-gray-900 border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
            Create Retainer Agreement
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Matter
            </label>
            <input
              type="text"
              value={matterTitle}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-gray-50 dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Retainer Type
            </label>
            <select
              name="retainerType"
              value={formData.retainerType}
              onChange={(e) => setFormData({ ...formData, retainerType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              required
            >
              <option value="project">Project-Based</option>
              <option value="monthly">Monthly Retainer</option>
              <option value="hourly">Hourly Retainer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Retainer Amount (R)
            </label>
            <input
              type="number"
              name="retainerAmount"
              value={formData.retainerAmount}
              onChange={(e) => setFormData({ ...formData, retainerAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder="50000"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Billing Period
            </label>
            <select
              name="billingPeriod"
              value={formData.billingPeriod}
              onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              required
            >
              <option value="one-time">One-Time</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              rows={3}
              placeholder="Additional details about this retainer agreement..."
            />
          </div>

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
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-mpondo-gold-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-mpondo-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Retainer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
