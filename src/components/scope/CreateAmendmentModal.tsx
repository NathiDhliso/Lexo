import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface CreateAmendmentModalProps {
  matterId: string;
  matterTitle: string;
  currentEstimatedCost: number;
  currentWIP: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAmendmentModal: React.FC<CreateAmendmentModalProps> = ({
  matterId,
  matterTitle,
  currentEstimatedCost,
  currentWIP,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amendmentType: 'scope_increase',
    reason: '',
    description: '',
    newEstimatedHours: '',
    newEstimatedCost: '',
    justification: '',
  });

  const costVariance = currentWIP > 0 && currentEstimatedCost > 0
    ? ((currentWIP - currentEstimatedCost) / currentEstimatedCost) * 100
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('scope_amendments').insert({
        matter_id: matterId,
        advocate_id: user.id,
        amendment_type: formData.amendmentType,
        reason: formData.reason,
        description: formData.description,
        original_estimate: currentEstimatedCost,
        new_estimate: parseFloat(formData.newEstimatedCost),
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Scope amendment created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating scope amendment:', error);
      toast.error(error.message || 'Failed to create scope amendment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-metallic-gray-900 border-b border-gray-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
            Create Scope Amendment
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

          {costVariance > 15 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Cost Variance Alert</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Current WIP exceeds estimated cost by {costVariance.toFixed(1)}%. Scope amendment recommended.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-metallic-gray-800 p-4 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 dark:text-neutral-400">Current Estimated Cost</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                R {currentEstimatedCost.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-neutral-400">Current WIP</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                R {currentWIP.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Amendment Type *
            </label>
            <select
              name="amendmentType"
              value={formData.amendmentType}
              onChange={(e) => setFormData({ ...formData, amendmentType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              required
            >
              <option value="scope_increase">Scope Increase</option>
              <option value="timeline_change">Timeline Change</option>
              <option value="cost_adjustment">Cost Adjustment</option>
              <option value="service_addition">Additional Services</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Reason *
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              placeholder="Client requested additional work"
              required
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
              rows={3}
              placeholder="Extended scope to include additional research and court appearances..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                New Estimated Hours
              </label>
              <input
                type="number"
                name="newEstimatedHours"
                value={formData.newEstimatedHours}
                onChange={(e) => setFormData({ ...formData, newEstimatedHours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
                placeholder="50"
                step="0.5"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                New Estimated Cost (R) *
              </label>
              <input
                type="number"
                name="newEstimatedCost"
                value={formData.newEstimatedCost}
                onChange={(e) => setFormData({ ...formData, newEstimatedCost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
                placeholder="125000"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Justification *
            </label>
            <textarea
              name="justification"
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
              rows={3}
              placeholder="Provide detailed justification for this scope amendment..."
              required
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
              {loading ? 'Creating...' : 'Create Amendment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
