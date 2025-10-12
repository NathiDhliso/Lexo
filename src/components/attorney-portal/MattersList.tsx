import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Filter, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { MatterStateBadge } from '../matters/MatterStateSelector';
import type { MatterState } from '../matters/MatterStateSelector';

interface Matter {
  id: string;
  reference_number: string;
  title: string;
  client_name: string;
  state: MatterState;
  status: string;
  actual_total: number;
  created_at: string;
  advocates: {
    full_name: string;
  };
}

export const MattersList: React.FC = () => {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<MatterState | 'all'>('all');

  useEffect(() => {
    loadMatters();
  }, [stateFilter]);

  const loadMatters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: accessibleMatters } = await supabase
        .from('attorney_matter_access')
        .select('matter_id')
        .eq('attorney_user_id', user.id)
        .is('revoked_at', null);

      const matterIds = accessibleMatters?.map(a => a.matter_id) || [];

      let query = supabase
        .from('matters')
        .select(`
          *,
          advocates (
            full_name
          )
        `)
        .in('id', matterIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (stateFilter !== 'all') {
        query = query.eq('state', stateFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMatters(data || []);
    } catch (error) {
      console.error('Error loading matters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatters = matters.filter(matter =>
    matter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    matter.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    matter.reference_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStateCounts = () => {
    return {
      active: matters.filter(m => m.state === 'active').length,
      completed: matters.filter(m => m.state === 'completed').length,
      all: matters.length
    };
  };

  const counts = getStateCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">My Matters</h1>
        <p className="text-gray-600 dark:text-neutral-400">
          {counts.all} total matters • {counts.active} active • {counts.completed} completed
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search matters..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value as MatterState | 'all')}
          className="px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All States</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="on_hold">On Hold</option>
          <option value="awaiting_court">Awaiting Court</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatters.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 dark:text-neutral-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-neutral-400">No matters found</p>
          </div>
        ) : (
          filteredMatters.map((matter) => (
            <MatterCard key={matter.id} matter={matter} />
          ))
        )}
      </div>
    </div>
  );
};

interface MatterCardProps {
  matter: Matter;
}

const MatterCard: React.FC<MatterCardProps> = ({ matter }) => {
  const [unbilledWIP, setUnbilledWIP] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);

  useEffect(() => {
    loadMatterStats();
  }, [matter.id]);

  const loadMatterStats = async () => {
    try {
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('hours, hourly_rate')
        .eq('matter_id', matter.id)
        .eq('is_billed', false)
        .is('deleted_at', null);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('matter_id', matter.id)
        .eq('is_billed', false)
        .is('deleted_at', null);

      const { data: invoices } = await supabase
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('matter_id', matter.id)
        .is('deleted_at', null);

      const timeTotal = (timeEntries || []).reduce(
        (sum, entry) => sum + (entry.hours * entry.hourly_rate),
        0
      );

      const expensesTotal = (expenses || []).reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      setUnbilledWIP(timeTotal + expensesTotal);
      setInvoiceCount(invoices?.length || 0);
    } catch (error) {
      console.error('Error loading matter stats:', error);
    }
  };

  return (
    <a
      href={`/attorney/matters/${matter.id}`}
      className="block bg-white dark:bg-metallic-gray-800 rounded-lg shadow hover:theme-shadow-lg transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">{matter.reference_number}</p>
            <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-2 line-clamp-2">
              {matter.title}
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <MatterStateBadge state={matter.state} />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-neutral-400">Client</span>
            <span className="font-medium text-gray-900 dark:text-neutral-100">{matter.client_name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-neutral-400">Advocate</span>
            <span className="font-medium text-gray-900 dark:text-neutral-100">{matter.advocates?.full_name}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-metallic-gray-700 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-neutral-400">
              <TrendingUp className="h-4 w-4" />
              <span>Unbilled WIP</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-neutral-100">
              {formatRand(unbilledWIP)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-neutral-400">
              <CheckCircle className="h-4 w-4" />
              <span>Invoices</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-neutral-100">
              {invoiceCount}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-500">
            <Clock className="h-3 w-3" />
            <span>Created {new Date(matter.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </a>
  );
};
