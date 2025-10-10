import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';

interface WIPAccumulatorProps {
  matterId: string;
}

interface WIPSummary {
  timeEntriesTotal: number;
  timeEntriesCount: number;
  expensesTotal: number;
  expensesCount: number;
  servicesTotal: number;
  servicesCount: number;
  totalWIP: number;
}

export const WIPAccumulator: React.FC<WIPAccumulatorProps> = ({ matterId }) => {
  const [wip, setWip] = useState<WIPSummary>({
    timeEntriesTotal: 0,
    timeEntriesCount: 0,
    expensesTotal: 0,
    expensesCount: 0,
    servicesTotal: 0,
    servicesCount: 0,
    totalWIP: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWIPData();

    const channel = supabase
      .channel(`wip-${matterId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `matter_id=eq.${matterId}`
        },
        () => loadWIPData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `matter_id=eq.${matterId}`
        },
        () => loadWIPData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matterId]);

  const loadWIPData = async () => {
    try {
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('hours, hourly_rate')
        .eq('matter_id', matterId)
        .eq('is_billed', false)
        .is('deleted_at', null);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('matter_id', matterId)
        .eq('is_billed', false)
        .is('deleted_at', null);

      const timeTotal = (timeEntries || []).reduce(
        (sum, entry) => sum + (entry.hours * entry.hourly_rate),
        0
      );

      const expensesTotal = (expenses || []).reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      const totalWIP = timeTotal + expensesTotal;

      setWip({
        timeEntriesTotal: timeTotal,
        timeEntriesCount: timeEntries?.length || 0,
        expensesTotal: expensesTotal,
        expensesCount: expenses?.length || 0,
        servicesTotal: 0,
        servicesCount: 0,
        totalWIP
      });
    } catch (error) {
      console.error('Error loading WIP data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Work In Progress (WIP)</h3>
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Total Unbilled WIP</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatRand(wip.totalWIP)}
          </p>
        </div>

        <div className="space-y-4">
          <WIPItem
            icon={Clock}
            label="Time Entries"
            count={wip.timeEntriesCount}
            amount={wip.timeEntriesTotal}
            color="blue"
          />
          <WIPItem
            icon={Receipt}
            label="Expenses"
            count={wip.expensesCount}
            amount={wip.expensesTotal}
            color="green"
          />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Ready to bill</span>
            <span className="font-semibold text-gray-900">
              {wip.timeEntriesCount + wip.expensesCount} items
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface WIPItemProps {
  icon: React.ElementType;
  label: string;
  count: number;
  amount: number;
  color: 'blue' | 'green' | 'purple';
}

const WIPItem: React.FC<WIPItemProps> = ({ icon: Icon, label, count, amount, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">{count} items</p>
        </div>
      </div>
      <p className="text-lg font-semibold text-gray-900">
        {formatRand(amount)}
      </p>
    </div>
  );
};
