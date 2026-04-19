/**
 * PermissionGate — Inline permission check component
 *
 * Hides UI elements the user doesn't have permission to see.
 * This is SUPPLEMENTARY to server-side enforcement — never the primary gate.
 */
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { rbacService } from '../../services/rbac.service';
import { normalizeRole } from '../../types/rbac';
import type { Permission } from '../../types/rbac';

interface PermissionGateProps {
  /** Permission required to see this content */
  permission: Permission;
  /** Content to render if permitted */
  children: React.ReactNode;
  /** Optional content to show when not permitted (e.g., a disabled button) */
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  const userRole = normalizeRole(
    (user?.user_metadata?.role ?? user?.user_metadata?.user_type ?? 'guest') as any
  );

  const hasPermission = rbacService.hasPermission(userRole, permission);

  if (hasPermission) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Hook version for programmatic permission checks
 */
export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  const userRole = normalizeRole(
    (user?.user_metadata?.role ?? user?.user_metadata?.user_type ?? 'guest') as any
  );
  return rbacService.hasPermission(userRole, permission);
}

/**
 * Hook to get current user's system role
 */
export function useUserRole() {
  const { user } = useAuth();
  return normalizeRole(
    (user?.user_metadata?.role ?? user?.user_metadata?.user_type ?? 'guest') as any
  );
}

export default PermissionGate;
