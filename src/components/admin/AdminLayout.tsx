/**
 * Admin Portal Layout — Lexo Operations Hub (Section 10)
 * Isolated layout for internal Lexo staff only.
 */
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Users, Building2, Ticket, Activity, ToggleLeft,
  CreditCard, Shield, Megaphone, LayoutDashboard, LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserRole } from '../auth/PermissionGate';
import lexoLogo from '../../Public/Assets/lexo-logo.png';

const ADMIN_NAV = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { path: '/admin/users', label: 'Users & Tenants', icon: Users },
  { path: '/admin/tickets', label: 'Support Tickets', icon: Ticket },
  { path: '/admin/health', label: 'Platform Health', icon: Activity },
  { path: '/admin/feature-flags', label: 'Feature Flags', icon: ToggleLeft, superOnly: true },
  { path: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard, superOnly: true },
  { path: '/admin/compliance', label: 'Compliance & Audit', icon: Shield },
  { path: '/admin/broadcasts', label: 'Broadcasts', icon: Megaphone, superOnly: true },
];

export const AdminLayout: React.FC = () => {
  const { signOut } = useAuth();
  const role = useUserRole();
  const navigate = useNavigate();
  const isSuperAdmin = role === 'super_admin';

  const filteredNav = ADMIN_NAV.filter(item => !item.superOnly || isSuperAdmin);

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <img src={lexoLogo} alt="Lexo" className="w-8 h-8" />
            <div>
              <span className="text-sm font-bold text-white">LexoHub</span>
              <span className="block text-[10px] text-amber-400 font-medium tracking-wider uppercase">Operations</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {filteredNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-600/20 text-amber-400'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-neutral-800 space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Back to App
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
