/**
 * Audit Log Types
 * For tracking system activities and changes
 */

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'send'
  | 'approve'
  | 'reject'
  | 'login'
  | 'logout';

export type AuditEntityType =
  | 'matter'
  | 'invoice'
  | 'proforma'
  | 'time_entry'
  | 'expense'
  | 'payment'
  | 'credit_note'
  | 'dispute'
  | 'user'
  | 'attorney'
  | 'team_member';

export interface AuditLog {
  id: string;
  user_type: 'advocate' | 'attorney' | 'admin' | 'system';
  user_id: string;
  user_email?: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLogFilters {
  user_id?: string;
  user_type?: AuditLog['user_type'];
  action?: AuditAction;
  entity_type?: AuditEntityType;
  entity_id?: string;
  date_from?: string;
  date_to?: string;
}
