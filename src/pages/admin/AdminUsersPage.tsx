/**
 * Admin User Management — Section 10.2
 * View, search, create, and manage users across all tenants.
 */
import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Shield, MoreVertical, Eye, Ban, RefreshCw, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import type { SystemRole } from '../../types/rbac';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: SystemRole;
  is_active: boolean;
  onboarding_completed: boolean;
  matters_count: number;
  created_at: string;
  last_login_at?: string;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('advocates')
        .select('id, email, full_name, role, is_active, onboarding_completed, matters_count, created_at, last_login_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data ?? []);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    const reason = prompt('Reason for deactivation:');
    if (!reason) return;

    const { error } = await supabase
      .from('advocates')
      .update({ is_active: false })
      .eq('id', userId);

    if (error) toast.error('Failed to deactivate user');
    else { toast.success('User deactivated'); loadUsers(); }
  };

  const handleReactivate = async (userId: string) => {
    const { error } = await supabase
      .from('advocates')
      .update({ is_active: true })
      .eq('id', userId);

    if (error) toast.error('Failed to reactivate user');
    else { toast.success('User reactivated'); loadUsers(); }
  };

  const handleRoleChange = async (userId: string, newRole: SystemRole) => {
    const reason = prompt('Reason for role change:');
    if (!reason) return;

    const { error } = await supabase
      .from('advocates')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) toast.error('Failed to change role');
    else { toast.success(`Role updated to ${newRole}`); loadUsers(); }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const ROLE_BADGES: Record<string, string> = {
    super_admin: 'bg-status-error-100 text-status-error-700 dark:bg-status-error-900/30 dark:text-status-error-400',
    support_agent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    counsel: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-400',
    practice_admin: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-400',
    finance: 'bg-status-success-100 text-status-success-700 dark:bg-status-success-900/30 dark:text-status-success-400',
    auditor: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    guest: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-neutral-400 mt-1">{users.length} total users across all tenants</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text" placeholder="Search by name, email, or LPC number..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <select
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Roles</option>
          <option value="counsel">Counsel</option>
          <option value="practice_admin">Practice Admin</option>
          <option value="finance">Finance</option>
          <option value="auditor">Auditor</option>
          <option value="guest">Guest / Pending</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-700">
              {['User', 'Role', 'Status', 'Onboarding', 'Matters', 'Last Active', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-neutral-500">Loading...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-neutral-500">No users found</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{user.full_name || 'No name'}</p>
                    <p className="text-xs text-neutral-400">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${ROLE_BADGES[user.role] ?? ROLE_BADGES.guest}`}>
                    {(user.role ?? 'counsel').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${user.is_active ? 'text-status-success-400' : 'text-status-error-400'}`}>
                    {user.is_active ? '● Active' : '● Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${user.onboarding_completed ? 'text-status-success-400' : 'text-amber-400'}`}>
                    {user.onboarding_completed ? '✓ Complete' : '◐ Incomplete'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-300">{user.matters_count}</td>
                <td className="px-4 py-3 text-xs text-neutral-400">
                  {user.last_login_at ? format(new Date(user.last_login_at), 'dd MMM yyyy') : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelectedUser(user)} className="p-1.5 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white" title="View details">
                      <Eye className="w-4 h-4" />
                    </button>
                    {user.is_active ? (
                      <button onClick={() => handleDeactivate(user.id)} className="p-1.5 hover:bg-status-error-900/30 rounded-lg text-neutral-400 hover:text-status-error-400" title="Deactivate">
                        <Ban className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleReactivate(user.id)} className="p-1.5 hover:bg-status-success-900/30 rounded-lg text-neutral-400 hover:text-status-success-400" title="Reactivate">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
