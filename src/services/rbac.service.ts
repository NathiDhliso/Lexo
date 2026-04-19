/**
 * RBAC Service — Runtime Permission Enforcement
 *
 * Server-side enforcement is the primary gate (RLS policies).
 * This client-side service provides supplementary UI gating
 * and route protection.
 */

import { ROLE_PERMISSIONS, FEATURE_ACCESS_MATRIX, ROUTE_ROLE_MAP, normalizeRole } from '../types/rbac';
import type { SystemRole, Permission, DelegatableModule, PADelegation } from '../types/rbac';
import { supabase } from '../lib/supabase';

class RBACService {
  private delegations: PADelegation[] = [];
  private delegationsLoaded = false;

  /**
   * Check if a role has a specific permission
   */
  hasPermission(role: SystemRole | string, permission: Permission): boolean {
    const normalized = normalizeRole(role as any);
    const permissions = ROLE_PERMISSIONS[normalized];
    if (!permissions) return false;
    return permissions.includes(permission);
  }

  /**
   * Check if a role can access a specific route
   */
  canAccessRoute(role: SystemRole | string, routePath: string): boolean {
    const normalized = normalizeRole(role as any);

    // Find matching route (check exact match first, then prefix match)
    const exactMatch = ROUTE_ROLE_MAP[routePath];
    if (exactMatch) return exactMatch.includes(normalized);

    // Prefix match for parameterized routes like /matter-workbench/:id
    const matchingRoute = Object.keys(ROUTE_ROLE_MAP).find(route =>
      routePath.startsWith(route)
    );
    if (matchingRoute) return ROUTE_ROLE_MAP[matchingRoute].includes(normalized);

    // If route is not in the map, allow access (public routes)
    return true;
  }

  /**
   * Check if a role can access a feature/module
   */
  canAccessFeature(role: SystemRole | string, feature: string): boolean {
    const normalized = normalizeRole(role as any);
    const allowedRoles = FEATURE_ACCESS_MATRIX[feature];
    if (!allowedRoles) return true; // Feature not in matrix = accessible
    return allowedRoles.includes(normalized);
  }

  /**
   * Get all permissions for a role
   */
  getPermissions(role: SystemRole | string): Permission[] {
    const normalized = normalizeRole(role as any);
    return ROLE_PERMISSIONS[normalized] || [];
  }

  /**
   * Get navigation items visible to a role
   */
  getVisibleRoutes(role: SystemRole | string): string[] {
    const normalized = normalizeRole(role as any);
    return Object.entries(ROUTE_ROLE_MAP)
      .filter(([_, roles]) => roles.includes(normalized))
      .map(([route]) => route);
  }

  /**
   * Check PA delegation — does this PA have access to this module for this counsel?
   */
  async isDelegatedAction(
    paId: string,
    counselId: string,
    module: DelegatableModule
  ): Promise<boolean> {
    await this.loadDelegations(paId);

    const delegation = this.delegations.find(
      d => d.pa_id === paId &&
        d.counsel_id === counselId &&
        d.is_active &&
        d.modules.includes(module) &&
        (!d.expires_at || new Date(d.expires_at) > new Date())
    );

    return !!delegation;
  }

  /**
   * Get all active delegations for a PA
   */
  async getActiveDelegations(paId: string): Promise<PADelegation[]> {
    await this.loadDelegations(paId);
    return this.delegations.filter(
      d => d.pa_id === paId && d.is_active &&
        (!d.expires_at || new Date(d.expires_at) > new Date())
    );
  }

  /**
   * Get audit attribution for an action
   * Returns both actor (PA) and principal (Counsel) for dual attribution
   */
  getAuditAttribution(actorId: string, actorRole: SystemRole, principalId?: string): {
    actor_id: string;
    actor_role: SystemRole;
    principal_id?: string;
    is_delegated: boolean;
  } {
    return {
      actor_id: actorId,
      actor_role: actorRole,
      principal_id: actorRole === 'practice_admin' ? principalId : undefined,
      is_delegated: actorRole === 'practice_admin' && !!principalId,
    };
  }

  /**
   * Log a role change (immutable audit record)
   */
  async logRoleChange(
    userId: string,
    oldRole: SystemRole,
    newRole: SystemRole,
    changedBy: string,
    reason: string
  ): Promise<void> {
    try {
      await supabase.from('role_change_log').insert({
        user_id: userId,
        old_role: oldRole,
        new_role: newRole,
        changed_by: changedBy,
        reason,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log role change:', error);
    }
  }

  /**
   * Check if a role is an admin/internal role
   */
  isInternalRole(role: SystemRole): boolean {
    return role === 'super_admin' || role === 'support_agent';
  }

  /**
   * Check if a role can perform impersonation
   */
  canImpersonate(role: SystemRole): boolean {
    return role === 'super_admin' || role === 'support_agent';
  }

  /**
   * Load PA delegations from database
   */
  private async loadDelegations(paId: string): Promise<void> {
    if (this.delegationsLoaded) return;

    try {
      const { data, error } = await supabase
        .from('pa_delegations')
        .select('*')
        .eq('pa_id', paId)
        .eq('is_active', true);

      if (!error && data) {
        this.delegations = data as PADelegation[];
        this.delegationsLoaded = true;
      }
    } catch (error) {
      console.error('Failed to load PA delegations:', error);
    }
  }

  /** Clear cached delegations (call on auth state change) */
  clearCache(): void {
    this.delegations = [];
    this.delegationsLoaded = false;
  }
}

export const rbacService = new RBACService();
