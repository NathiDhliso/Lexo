/**
 * Audit Log Service
 * Handles audit trail operations
 */

import { supabase } from '../../lib/supabase';
import { BaseApiService } from './base-api.service';
import type { AuditLog, AuditLogFilters } from '../../types/audit.types';

export class AuditService extends BaseApiService<AuditLog> {
  constructor() {
    super('audit_log');
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.user_type) {
        query = query.eq('user_type', filters.user_type);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }
      if (filters.entity_id) {
        query = query.eq('entity_id', filters.entity_id);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditLog(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.getAuditLogs({ entity_type: entityType as any, entity_id: entityId });
  }

  /**
   * Get recent activity for a user
   */
  async getUserActivity(userId: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }
}

export const auditService = new AuditService();
