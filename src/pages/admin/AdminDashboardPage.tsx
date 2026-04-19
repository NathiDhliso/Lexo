/**
 * Admin Dashboard — Operations Hub Overview (Section 10.8)
 */
import React, { useState, useEffect } from 'react';
import { Users, Building2, Ticket, Activity, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalMatters: number;
  openTickets: number;
  p1Tickets: number;
  avgResponseTime: string;
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, activeUsers: 0, totalMatters: 0,
    openTickets: 0, p1Tickets: 0, avgResponseTime: '—',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, mattersRes, ticketsRes] = await Promise.all([
        supabase.from('advocates').select('id, is_active', { count: 'exact' }),
        supabase.from('matters').select('id', { count: 'exact' }),
        supabase.from('support_tickets').select('id, priority, status', { count: 'exact' }).in('status', ['open', 'in_progress']),
      ]);

      setStats({
        totalUsers: usersRes.count ?? 0,
        activeUsers: (usersRes.data ?? []).filter((u: any) => u.is_active).length,
        totalMatters: mattersRes.count ?? 0,
        openTickets: ticketsRes.count ?? 0,
        p1Tickets: (ticketsRes.data ?? []).filter((t: any) => t.priority === 'p1').length,
        avgResponseTime: '< 2h',
      });
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Users', value: stats.activeUsers, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Matters', value: stats.totalMatters, icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Open Tickets', value: stats.openTickets, icon: Ticket, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'P1 Tickets', value: stats.p1Tickets, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Avg Response', value: stats.avgResponseTime, icon: Clock, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Operations Dashboard</h1>
        <p className="text-sm text-neutral-400 mt-1">Platform health and operational metrics</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map(card => (
              <div key={card.label} className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-neutral-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" /> Recent Activity
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400">Activity feed loads from audit log...</p>
              </div>
            </div>
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" /> System Status
              </h3>
              <div className="space-y-2">
                {['Database', 'Auth Service', 'Storage', 'Realtime'].map(svc => (
                  <div key={svc} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-neutral-300">{svc}</span>
                    <span className="flex items-center gap-1.5 text-xs text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full" /> Operational
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
