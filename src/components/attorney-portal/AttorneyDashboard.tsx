import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, DollarSign, Briefcase, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';

interface DashboardStats {
  activeMatters: number;
  pendingProformas: number;
  outstandingInvoices: number;
  totalOutstanding: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export const AttorneyDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeMatters: 0,
    pendingProformas: 0,
    outstandingInvoices: 0,
    totalOutstanding: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: accessibleMatters } = await supabase
        .from('attorney_matter_access')
        .select('matter_id')
        .eq('attorney_user_id', user.id)
        .is('revoked_at', null);

      const matterIds = accessibleMatters?.map(a => a.matter_id) || [];

      const { data: matters } = await supabase
        .from('matters')
        .select('id, state')
        .in('id', matterIds)
        .in('state', ['active', 'paused', 'on_hold', 'awaiting_court']);

      const { data: proformas } = await supabase
        .from('proforma_requests')
        .select('id')
        .in('matter_id', matterIds)
        .eq('client_response_status', 'pending');

      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total_amount, amount_paid')
        .in('matter_id', matterIds)
        .in('payment_status', ['pending', 'partial']);

      const totalOutstanding = invoices?.reduce((sum, inv) => 
        sum + (inv.total_amount - (inv.amount_paid || 0)), 0
      ) || 0;

      setStats({
        activeMatters: matters?.length || 0,
        pendingProformas: proformas?.length || 0,
        outstandingInvoices: invoices?.length || 0,
        totalOutstanding
      });

      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_type', 'attorney')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity(notifications || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Attorney Dashboard</h1>
        <p className="text-gray-600 dark:text-neutral-400">Overview of your matters and invoices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Briefcase}
          label="Active Matters"
          value={stats.activeMatters}
          color="blue"
        />
        <StatCard
          icon={FileText}
          label="Pending Pro Formas"
          value={stats.pendingProformas}
          color="purple"
          alert={stats.pendingProformas > 0}
        />
        <StatCard
          icon={AlertCircle}
          label="Outstanding Invoices"
          value={stats.outstandingInvoices}
          color="orange"
          alert={stats.outstandingInvoices > 0}
        />
        <StatCard
          icon={DollarSign}
          label="Total Outstanding"
          value={formatRand(stats.totalOutstanding)}
          color="red"
          alert={stats.totalOutstanding > 0}
        />
      </div>

      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-metallic-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-neutral-500">
              No recent activity
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  !activity.read_at ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-neutral-100">{activity.title}</h3>
                      {!activity.read_at && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                      <span className="text-xs text-gray-500 dark:text-neutral-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionCard
          title="Review Pro Formas"
          description="Approve or negotiate pending fee estimates"
          action="View Pro Formas"
          href="/attorney/proformas"
          count={stats.pendingProformas}
        />
        <QuickActionCard
          title="Pay Invoices"
          description="View and pay outstanding invoices"
          action="View Invoices"
          href="/attorney/invoices"
          count={stats.outstandingInvoices}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'blue' | 'purple' | 'orange' | 'red';
  alert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, alert }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${alert ? 'ring-2 ring-orange-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  action: string;
  href: string;
  count?: number;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  action,
  href,
  count
}) => {
  return (
    <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">{description}</p>
        </div>
        {count !== undefined && count > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            {count}
          </span>
        )}
      </div>
      <a
        href={href}
        className="inline-flex items-center justify-center w-full mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {action}
      </a>
    </div>
  );
};
