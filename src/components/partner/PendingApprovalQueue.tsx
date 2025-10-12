import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { PartnerApprovalModal } from './PartnerApprovalModal';
import toast from 'react-hot-toast';

interface PendingMatter {
  id: string;
  title: string;
  client_name: string;
  wip_value: number;
  estimated_fee: number;
  status: string;
  billing_status: string;
  created_at: string;
  has_retainer: boolean;
  has_time_entries: boolean;
  has_invoice: boolean;
}

export const PendingApprovalQueue: React.FC = () => {
  const [matters, setMatters] = useState<PendingMatter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatter, setSelectedMatter] = useState<PendingMatter | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const fetchMatters = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('matters')
        .select(`
          id,
          title,
          client_name,
          wip_value,
          estimated_fee,
          status,
          billing_status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('billing_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const enrichedMatters = await Promise.all(
        (data || []).map(async (matter) => {
          const [retainerResult, timeEntriesResult, invoiceResult] = await Promise.all([
            supabase.from('retainer_agreements').select('id').eq('matter_id', matter.id).limit(1),
            supabase.from('time_entries').select('id').eq('matter_id', matter.id).limit(1),
            supabase.from('invoices').select('id').eq('matter_id', matter.id).limit(1)
          ]);

          return {
            ...matter,
            has_retainer: (retainerResult.data?.length || 0) > 0,
            has_time_entries: (timeEntriesResult.data?.length || 0) > 0,
            has_invoice: (invoiceResult.data?.length || 0) > 0
          };
        })
      );

      setMatters(enrichedMatters);
    } catch (error) {
      console.error('Error fetching matters:', error);
      toast.error('Failed to load matters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatters();
  }, [filter]);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200',
      approved: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
      invoiced: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      invoiced: CheckCircle
    };

    const Icon = icons[status as keyof typeof icons] || Clock;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getVarianceIndicator = (wipValue: number, estimatedFee: number) => {
    if (estimatedFee === 0) return null;
    
    const variance = ((wipValue - estimatedFee) / estimatedFee) * 100;
    const isOverBudget = Math.abs(variance) > 15;

    return (
      <div className={`flex items-center gap-1 text-xs ${
        isOverBudget ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
      }`}>
        {isOverBudget && <AlertCircle className="w-3 h-3" />}
        <TrendingUp className="w-3 h-3" />
        {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
          Partner Approval Queue
        </h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-metallic-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {matters.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg">
          <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400">
            No matters {filter !== 'all' && `with ${filter} status`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matters.map((matter) => (
            <div
              key={matter.id}
              className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4 hover:theme-shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-1">
                    {matter.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Client: {matter.client_name}
                  </p>
                </div>
                {getStatusBadge(matter.billing_status || 'pending')}
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">WIP Value</div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatRand(matter.wip_value || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Estimated Fee</div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatRand(matter.estimated_fee || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Variance</div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {getVarianceIndicator(matter.wip_value || 0, matter.estimated_fee || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Status</div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                    {matter.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-metallic-gray-700">
                <div className="flex gap-2 text-xs">
                  {matter.has_retainer && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                      Retainer
                    </span>
                  )}
                  {matter.has_time_entries && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
                      Time Entries
                    </span>
                  )}
                  {matter.has_invoice && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded">
                      Invoiced
                    </span>
                  )}
                </div>

                {matter.billing_status === 'pending' && (
                  <button
                    onClick={() => setSelectedMatter(matter)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMatter && (
        <PartnerApprovalModal
          matterId={selectedMatter.id}
          matterTitle={selectedMatter.title}
          wipValue={selectedMatter.wip_value || 0}
          estimatedFee={selectedMatter.estimated_fee || 0}
          hasRetainer={selectedMatter.has_retainer}
          hasTimeEntries={selectedMatter.has_time_entries}
          hasInvoice={selectedMatter.has_invoice}
          matterStatus={selectedMatter.status}
          onClose={() => setSelectedMatter(null)}
          onSuccess={() => {
            setSelectedMatter(null);
            fetchMatters();
          }}
        />
      )}
    </div>
  );
};
