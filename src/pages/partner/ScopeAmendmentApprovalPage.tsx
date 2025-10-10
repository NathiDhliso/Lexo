import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Amendment {
  id: string;
  matter_id: string;
  amendment_type: string;
  reason: string;
  description: string;
  current_estimated_cost: number;
  new_estimated_cost: number;
  new_estimated_hours: number;
  justification: string;
  current_wip: number;
  cost_variance_percentage: number;
  status: string;
  created_at: string;
  matters?: {
    title: string;
    reference_number: string;
    client_name: string;
  };
}

export const ScopeAmendmentApprovalPage: React.FC = () => {
  const { user } = useAuth();
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingAmendments();
  }, []);

  const loadPendingAmendments = async () => {
    try {
      const { data, error } = await supabase
        .from('scope_amendments')
        .select(`
          *,
          matters (
            title,
            reference_number,
            client_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAmendments(data || []);
    } catch (error) {
      console.error('Error loading amendments:', error);
      toast.error('Failed to load amendments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (amendmentId: string) => {
    setProcessing(true);
    try {
      const amendment = amendments.find(a => a.id === amendmentId);
      if (!amendment) return;

      const { error: amendmentError } = await supabase
        .from('scope_amendments')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', amendmentId);

      if (amendmentError) throw amendmentError;

      const { error: matterError } = await supabase
        .from('matters')
        .update({
          estimated_fee: amendment.new_estimated_cost,
        })
        .eq('id', amendment.matter_id);

      if (matterError) throw matterError;

      toast.success('Scope amendment approved successfully');
      loadPendingAmendments();
      setSelectedAmendment(null);
    } catch (error: any) {
      console.error('Error approving amendment:', error);
      toast.error(error.message || 'Failed to approve amendment');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (amendmentId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('scope_amendments')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: user?.id,
          rejection_reason: rejectionReason,
        })
        .eq('id', amendmentId);

      if (error) throw error;

      toast.success('Scope amendment rejected');
      loadPendingAmendments();
      setSelectedAmendment(null);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Error rejecting amendment:', error);
      toast.error(error.message || 'Failed to reject amendment');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 dark:text-neutral-400">Loading amendments...</p>
      </div>
    );
  }

  if (selectedAmendment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => setSelectedAmendment(null)}
          className="flex items-center gap-2 text-blue-600 dark:text-mpondo-gold-400 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>

        <div className="bg-white dark:bg-metallic-gray-900 rounded-lg border border-gray-200 dark:border-metallic-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-6">
            Scope Amendment Review
          </h1>

          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-2">
                {selectedAmendment.matters?.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                Ref: {selectedAmendment.matters?.reference_number} | Client: {selectedAmendment.matters?.client_name}
              </p>
            </div>

            {selectedAmendment.cost_variance_percentage > 15 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Cost Variance Alert</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Current WIP exceeds estimated cost by {selectedAmendment.cost_variance_percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                Amendment Type
              </label>
              <p className="text-gray-900 dark:text-neutral-100 capitalize">
                {selectedAmendment.amendment_type.replace('_', ' ')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                Reason
              </label>
              <p className="text-gray-900 dark:text-neutral-100">{selectedAmendment.reason}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                Description
              </label>
              <p className="text-gray-900 dark:text-neutral-100">{selectedAmendment.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-metallic-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1">Current Estimate</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {formatCurrency(selectedAmendment.current_estimated_cost)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-metallic-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1">Current WIP</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {formatCurrency(selectedAmendment.current_wip)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1">New Estimate</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(selectedAmendment.new_estimated_cost)}
                </p>
              </div>
            </div>

            {selectedAmendment.new_estimated_hours > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                  New Estimated Hours
                </label>
                <p className="text-gray-900 dark:text-neutral-100">
                  {selectedAmendment.new_estimated_hours} hours
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                Justification
              </label>
              <p className="text-gray-900 dark:text-neutral-100">{selectedAmendment.justification}</p>
            </div>

            <div className="border-t border-gray-200 dark:border-metallic-gray-700 pt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                Rejection Reason (if rejecting)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100"
                rows={3}
                placeholder="Provide reason for rejection..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleReject(selectedAmendment.id)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                {processing ? 'Rejecting...' : 'Reject Amendment'}
              </button>
              <button
                onClick={() => handleApprove(selectedAmendment.id)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {processing ? 'Approving...' : 'Approve Amendment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-6">
        Pending Scope Amendments
      </h1>

      {amendments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-metallic-gray-900 rounded-lg border border-gray-200 dark:border-metallic-gray-700">
          <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-neutral-400">No pending scope amendments</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {amendments.map((amendment) => (
            <div
              key={amendment.id}
              className="bg-white dark:bg-metallic-gray-900 rounded-lg border border-gray-200 dark:border-metallic-gray-700 p-6 hover:border-blue-300 dark:hover:border-mpondo-gold-600 transition-colors cursor-pointer"
              onClick={() => setSelectedAmendment(amendment)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-1">
                    {amendment.matters?.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    {amendment.matters?.reference_number} | {amendment.matters?.client_name}
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium">
                  Pending Review
                </span>
              </div>

              <p className="text-gray-700 dark:text-neutral-300 mb-4">{amendment.reason}</p>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-neutral-400">Current</p>
                  <p className="font-semibold text-gray-900 dark:text-neutral-100">
                    {formatCurrency(amendment.current_estimated_cost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-neutral-400">WIP</p>
                  <p className="font-semibold text-gray-900 dark:text-neutral-100">
                    {formatCurrency(amendment.current_wip)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-neutral-400">New Estimate</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(amendment.new_estimated_cost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-neutral-400">Variance</p>
                  <p className="font-semibold text-amber-600 dark:text-amber-400">
                    {amendment.cost_variance_percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-neutral-500 mt-4">
                Submitted {formatDate(amendment.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
