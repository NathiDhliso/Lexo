import React, { useState } from 'react';
import { X, CheckCircle, XCircle, MessageSquare, TrendingUp } from 'lucide-react';
import { BillingReadinessChecklist } from './BillingReadinessChecklist';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import toast from 'react-hot-toast';

interface PartnerApprovalModalProps {
  matterId: string;
  matterTitle: string;
  wipValue: number;
  estimatedFee: number;
  hasRetainer: boolean;
  hasTimeEntries: boolean;
  hasInvoice: boolean;
  matterStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PartnerApprovalModal: React.FC<PartnerApprovalModalProps> = ({
  matterId,
  matterTitle,
  wipValue,
  estimatedFee,
  hasRetainer,
  hasTimeEntries,
  hasInvoice,
  matterStatus,
  onClose,
  onSuccess,
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async () => {
    if (!action) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('partner_approvals')
        .insert({
          matter_id: matterId,
          partner_id: user.id,
          status: action === 'approve' ? 'approved' : 'rejected',
          comments,
          approved_at: action === 'approve' ? new Date().toISOString() : null
        });

      if (error) throw error;

      await supabase
        .from('matters')
        .update({
          billing_status: action === 'approve' ? 'approved' : 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', matterId);

      toast.success(action === 'approve' ? 'Matter approved for billing' : 'Matter rejected');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting approval:', error);
      toast.error('Failed to submit approval');
    } finally {
      setLoading(false);
    }
  };

  const variance = estimatedFee > 0 ? ((wipValue - estimatedFee) / estimatedFee) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 bg-white dark:bg-metallic-gray-800 z-10">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Partner Approval - Billing Readiness
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Matter Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Matter</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{matterTitle}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Status</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">{matterStatus}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">WIP Value</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{formatRand(wipValue)}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Estimated Fee</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{formatRand(estimatedFee)}</div>
              </div>
            </div>
          </div>

          {variance !== 0 && (
            <div className={`rounded-lg p-4 ${
              Math.abs(variance) > 15 
                ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700'
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-5 h-5 ${
                  Math.abs(variance) > 15 ? 'text-amber-600' : 'text-blue-600'
                }`} />
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  Budget Variance: {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                </span>
              </div>
              <p className={`text-sm ${
                Math.abs(variance) > 15 
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-blue-700 dark:text-blue-300'
              }`}>
                {Math.abs(variance) > 15 
                  ? 'Significant variance detected. Scope amendment may be required.'
                  : 'Variance is within acceptable range.'}
              </p>
            </div>
          )}

          <BillingReadinessChecklist
            matterId={matterId}
            wipValue={wipValue}
            estimatedFee={estimatedFee}
            hasRetainer={hasRetainer}
            hasTimeEntries={hasTimeEntries}
            hasInvoice={hasInvoice}
            matterStatus={matterStatus}
            onChecklistChange={setIsReady}
          />

          <div className="border-t border-neutral-200 dark:border-metallic-gray-700 pt-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Partner Decision
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => setAction('approve')}
                disabled={!isReady}
                className={`p-4 rounded-lg border-2 transition-all ${
                  action === 'approve'
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-neutral-200 dark:border-metallic-gray-700 hover:border-green-300'
                } ${!isReady ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className={`w-6 h-6 ${
                    action === 'approve' ? 'text-green-600' : 'text-neutral-400'
                  }`} />
                  <div className="text-left">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      Approve for Billing
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Ready to generate invoice
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction('reject')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  action === 'reject'
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-neutral-200 dark:border-metallic-gray-700 hover:border-red-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <XCircle className={`w-6 h-6 ${
                    action === 'reject' ? 'text-red-600' : 'text-neutral-400'
                  }`} />
                  <div className="text-left">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      Request Changes
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Send back to associate
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {action && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Comments {action === 'reject' && <span className="text-red-600">*</span>}
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={action === 'approve' 
                      ? 'Optional: Add any notes or instructions...'
                      : 'Required: Explain what changes are needed...'}
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || (action === 'reject' && !comments.trim())}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      action === 'approve'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? 'Submitting...' : action === 'approve' ? 'Approve for Billing' : 'Request Changes'}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="px-6 py-3 bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-metallic-gray-600 font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
