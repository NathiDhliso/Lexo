/**
 * RoleGuard — Route-level role protection component
 *
 * Wraps content that should only be visible to specific roles.
 * Shows an "Access Denied" screen for unauthorized users.
 */
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { rbacService } from '../../services/rbac.service';
import { normalizeRole } from '../../types/rbac';
import type { SystemRole } from '../../types/rbac';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoleGuardProps {
  /** Roles allowed to access this content */
  roles: SystemRole[];
  /** Content to render if authorized */
  children: React.ReactNode;
  /** Optional fallback component instead of the default access-denied screen */
  fallback?: React.ReactNode;
  /** If true, silently hides content instead of showing access denied */
  silent?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  children,
  fallback,
  silent = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userRole = normalizeRole(
    (user?.user_metadata?.role ?? user?.user_metadata?.user_type ?? 'guest') as any
  );

  const isAuthorized = roles.includes(userRole);

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (silent) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access-denied screen
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-status-error-50 dark:bg-status-error-900/20 flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-status-error-500 dark:text-status-error-400" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Access Denied
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          You don't have permission to access this page. If you believe this is an error,
          please contact your administrator or Lexo support.
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-6">
          Your role: <span className="font-medium capitalize">{userRole.replace('_', ' ')}</span>
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-mpondo-gold-600 hover:bg-mpondo-gold-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default RoleGuard;
