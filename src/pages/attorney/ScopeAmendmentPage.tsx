import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

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
  status: string;
  created_at: string;
  client_notified_at?: string;
  client_approved_at?: string;
  matters?: {
    title: string;
    reference_number: string;
  };
}

export const ScopeAmendmentPage: React.FC = () => {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadAmendments();
  }, []);

  const loadAmendments = async () => {
    try {
      const { data, error } = await supabase
        .from('scope_amendments')
        .select(`
          *,
          matters (
            title,
            reference_number
          )
        `)
        .in('status', ['approved', 'pending'])
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

  const handleClientApprove = async (amendmentId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('scope_amendments')
        .update({
          client_approved_at: new Date().toISOString(),
        })
        .eq('id', amendmentId);

      if (error) throw error;

      toast.success('Scope amendment accepted');
      loadAmendments();
    } catch (error: any) {
      console.error('Error approving amendment:', error);
      toast.error(error.message || 'Failed to accept amendment');
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

  const pendingAmendments = amendments.filter(a => a.status === 'approved' && !a.client_approved_at);
  const approvedAmendments = amendments.filter(a => a.client_approved_at);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-2">
        Scope Amendments
      </h1>
      <p className="text-gray-600 dark:text-neutral-400 mb-6">
        Review and approve changes to your matter scope and costs
      </p>

      {pendingAmendments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
            Pending Your Approval
          </h2>
          <div className="space-y-4">
            {pendingAmendments.map((amendment) => (
              <div
                key={amendment.id}
                className="bg-white dark:bg-metallic-gray-900 rounded-lg border-2 border-amber-300 dark:border-amber-700 p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-1">
                      {amendment.matters?.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      Ref: {amendment.matters?.reference_number}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium">
                    Action Required
                  </span>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
                    Why is this amendment needed?
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    {amendment.reason}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-neutral-100">{amendment.description}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Justification
                  </label>
                  <p className="text-gray-900 dark:text-neutral-100">{amendment.justification}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-metallic-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1">Current Agreed Cost</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                      {formatCurrency(amendment.current_estimated_cost)}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-xs text-gray-600 dark:text-neutral-400 mb-1">New Proposed Cost</p>
                    <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(amendment.new_estimated_cost)}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <strong>Cost Increase:</strong> {formatCurrency(amendment.new_estimated_cost - amendment.current_estimated_cost)}
                    {amendment.new_estimated_hours > 0 && (
                      <> ({amendment.new_estimated_hours} additional hours)</>
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleClientApprove(amendment.id)}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {processing ? 'Approving...' : 'Accept Amendment'}
                  </button>
                  <button
                    disabled={processing}
                    className="px-6 py-3 border border-gray-300 dark:border-metallic-gray-600 text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-50 dark:bg-metallic-gray-900 dark:hover:bg-metallic-gray-800 transition-colors disabled:opacity-50"
                  >
                    Contact Advocate
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-neutral-500 mt-4">
                  Submitted {formatDate(amendment.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {approvedAmendments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
            Approved Amendments
          </h2>
          <div className="space-y-4">
            {approvedAmendments.map((amendment) => (
              <div
                key={amendment.id}
                className="bg-white dark:bg-metallic-gray-900 rounded-lg border border-gray-200 dark:border-metallic-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-1">
                      {amendment.matters?.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      Ref: {amendment.matters?.reference_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-neutral-300 mb-4">{amendment.reason}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-neutral-400">Previous Cost</p>
                    <p className="font-semibold text-gray-900 dark:text-neutral-100">
                      {formatCurrency(amendment.current_estimated_cost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-neutral-400">New Cost</p>
                    <p className="font-semibold text-gray-900 dark:text-neutral-100">
                      {formatCurrency(amendment.new_estimated_cost)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-neutral-500 mt-4">
                  Approved {amendment.client_approved_at && formatDate(amendment.client_approved_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingAmendments.length === 0 && approvedAmendments.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-metallic-gray-900 rounded-lg border border-gray-200 dark:border-metallic-gray-700">
          <CheckCircle className="w-16 h-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-neutral-400">No scope amendments</p>
        </div>
      )}
    </div>
  );
};
