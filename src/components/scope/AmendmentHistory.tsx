import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AmendmentHistoryProps {
  matterId: string;
}

interface Amendment {
  id: string;
  amendment_type: string;
  reason: string;
  description: string;
  current_estimated_cost: number;
  new_estimated_cost: number;
  status: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

export const AmendmentHistory: React.FC<AmendmentHistoryProps> = ({ matterId }) => {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAmendments();
  }, [matterId]);

  const loadAmendments = async () => {
    try {
      const { data, error } = await supabase
        .from('scope_amendments')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAmendments(data || []);
    } catch (error) {
      console.error('Error loading amendments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-neutral-400">Loading amendment history...</p>
      </div>
    );
  }

  if (amendments.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-neutral-400">No scope amendments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
        Amendment History
      </h3>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-metallic-gray-700" />

        <div className="space-y-6">
          {amendments.map((amendment, index) => (
            <div key={amendment.id} className="relative pl-14">
              <div className="absolute left-4 top-2 bg-white dark:bg-metallic-gray-900 p-1 rounded-full border-2 border-gray-200 dark:border-metallic-gray-700">
                {getStatusIcon(amendment.status)}
              </div>

              <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-gray-200 dark:border-metallic-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-neutral-100">
                        {amendment.reason}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(amendment.status)}`}>
                        {amendment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      {formatDate(amendment.created_at)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-neutral-500 uppercase">
                    {amendment.amendment_type.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-neutral-300 mb-3">
                  {amendment.description}
                </p>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-metallic-gray-900 rounded-lg p-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-neutral-400">Previous Cost</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
                      {formatCurrency(amendment.current_estimated_cost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-neutral-400">New Cost</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
                      {formatCurrency(amendment.new_estimated_cost)}
                    </p>
                  </div>
                </div>

                {amendment.status === 'approved' && amendment.approved_at && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-metallic-gray-700">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ Approved on {formatDate(amendment.approved_at)}
                    </p>
                  </div>
                )}

                {amendment.status === 'rejected' && amendment.rejected_at && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-metallic-gray-700">
                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                      ✗ Rejected on {formatDate(amendment.rejected_at)}
                    </p>
                    {amendment.rejection_reason && (
                      <p className="text-xs text-gray-600 dark:text-neutral-400">
                        Reason: {amendment.rejection_reason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
