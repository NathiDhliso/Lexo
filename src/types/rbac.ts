/**
 * RBAC Types — LexoHub Role-Based Access Control
 *
 * PRD Section 6: Complete permission model for all system roles.
 * Every action in the system is gated by role. No user may access
 * data, screens, or actions outside their assigned role.
 */

// ─── System Roles (Section 6.1) ─────────────────────────────────────
export type SystemRole =
  | 'super_admin'        // Lexo platform-wide — full access
  | 'support_agent'      // Lexo platform-wide — read + impersonate
  | 'counsel'            // Advocate — own tenant data
  | 'practice_admin'     // PA — assigned counsel's data
  | 'instructing_attorney' // Attorney — assigned matters (read-only + approvals)
  | 'finance'            // Own tenant — financial records
  | 'auditor'            // Own tenant — read-only audit access
  | 'guest';             // Pending verification — welcome screen only

/** Backward-compatible alias: old 'junior'/'senior' map to 'counsel' */
export type LegacyRole = 'junior' | 'senior';
export type UserRole = SystemRole | LegacyRole;

/** Map legacy roles to new system roles */
export function normalizeRole(role: UserRole): SystemRole {
  switch (role) {
    case 'junior': return 'counsel';
    case 'senior': return 'counsel';
    default: return role as SystemRole;
  }
}

// ─── Permissions (Section 6.2) ───────────────────────────────────────
export type Permission =
  // Matter management
  | 'create_matter'
  | 'view_matter'
  | 'edit_matter'
  | 'delete_matter'
  | 'close_matter'
  | 'archive_matter'
  | 'reopen_matter'
  // Time & WIP
  | 'log_time'
  | 'view_time'
  | 'edit_time'
  | 'delete_time'
  // Disbursements
  | 'create_disbursement'
  | 'view_disbursement'
  | 'edit_disbursement'
  // Invoicing
  | 'create_invoice'
  | 'view_invoice'
  | 'edit_invoice'
  | 'send_invoice'
  | 'batch_invoice'
  // Pro Forma / Quotes
  | 'create_proforma'
  | 'view_proforma'
  | 'edit_proforma'
  | 'approve_quote'
  // Payments
  | 'record_payment'
  | 'view_payment'
  // Credit Notes
  | 'issue_credit_note'
  | 'view_credit_note'
  // Trust & Retainer
  | 'manage_trust'
  | 'view_trust'
  // Write-offs
  | 'initiate_writeoff'
  | 'approve_writeoff'
  // Documents
  | 'upload_document'
  | 'view_document'
  | 'delete_document'
  // Calendar / Diary
  | 'manage_diary'
  | 'view_diary'
  // Fee Agreements
  | 'create_fee_agreement'
  | 'view_fee_agreement'
  // Reports & Audit
  | 'view_reports'
  | 'export_audit_pack'
  | 'view_audit_trail'
  // Communication
  | 'log_communication'
  | 'view_communication'
  // Statements
  | 'send_statement'
  | 'view_statement'
  // Settings & Profile
  | 'manage_settings'
  | 'manage_rate_cards'
  | 'view_analytics'
  // Conflict checks
  | 'run_conflict_check'
  | 'view_conflict_log'
  // Notifications
  | 'manage_notification_prefs'
  | 'send_broadcast'
  // Admin — Tenant & User Management
  | 'view_all_tenants'
  | 'manage_tenants'
  | 'view_all_users'
  | 'manage_users'
  | 'manage_rbac'
  | 'impersonate_user'
  | 'manage_feature_flags'
  | 'manage_subscriptions'
  // Platform
  | 'view_platform_health'
  | 'manage_compliance'
  | 'bulk_import';

// ─── Role → Permission Matrix ────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  super_admin: [
    // Super Admin has ALL permissions
    'create_matter', 'view_matter', 'edit_matter', 'delete_matter', 'close_matter', 'archive_matter', 'reopen_matter',
    'log_time', 'view_time', 'edit_time', 'delete_time',
    'create_disbursement', 'view_disbursement', 'edit_disbursement',
    'create_invoice', 'view_invoice', 'edit_invoice', 'send_invoice', 'batch_invoice',
    'create_proforma', 'view_proforma', 'edit_proforma', 'approve_quote',
    'record_payment', 'view_payment',
    'issue_credit_note', 'view_credit_note',
    'manage_trust', 'view_trust',
    'initiate_writeoff', 'approve_writeoff',
    'upload_document', 'view_document', 'delete_document',
    'manage_diary', 'view_diary',
    'create_fee_agreement', 'view_fee_agreement',
    'view_reports', 'export_audit_pack', 'view_audit_trail',
    'log_communication', 'view_communication',
    'send_statement', 'view_statement',
    'manage_settings', 'manage_rate_cards', 'view_analytics',
    'run_conflict_check', 'view_conflict_log',
    'manage_notification_prefs', 'send_broadcast',
    'view_all_tenants', 'manage_tenants', 'view_all_users', 'manage_users',
    'manage_rbac', 'impersonate_user', 'manage_feature_flags', 'manage_subscriptions',
    'view_platform_health', 'manage_compliance', 'bulk_import',
  ],

  support_agent: [
    // Read access to all tenants + impersonation (audit-logged)
    'view_matter', 'view_time', 'view_disbursement',
    'view_invoice', 'view_proforma', 'view_payment', 'view_credit_note',
    'view_trust', 'view_document', 'view_diary',
    'view_fee_agreement', 'view_reports', 'view_audit_trail',
    'view_communication', 'view_statement',
    'view_conflict_log',
    'view_all_tenants', 'view_all_users', 'impersonate_user',
    'view_platform_health', 'manage_compliance',
  ],

  counsel: [
    'create_matter', 'view_matter', 'edit_matter', 'close_matter', 'archive_matter',
    'log_time', 'view_time', 'edit_time', 'delete_time',
    'create_disbursement', 'view_disbursement', 'edit_disbursement',
    'create_invoice', 'view_invoice', 'edit_invoice', 'send_invoice', 'batch_invoice',
    'create_proforma', 'view_proforma', 'edit_proforma',
    'record_payment', 'view_payment',
    'issue_credit_note', 'view_credit_note',
    'manage_trust', 'view_trust',
    'initiate_writeoff',
    'upload_document', 'view_document', 'delete_document',
    'manage_diary', 'view_diary',
    'create_fee_agreement', 'view_fee_agreement',
    'view_reports', 'export_audit_pack', 'view_audit_trail',
    'log_communication', 'view_communication',
    'send_statement', 'view_statement',
    'manage_settings', 'manage_rate_cards', 'view_analytics',
    'run_conflict_check', 'view_conflict_log',
    'manage_notification_prefs', 'bulk_import',
  ],

  practice_admin: [
    // PA actions require explicit delegation — marked with * in PRD
    'create_matter', 'view_matter', 'edit_matter', 'close_matter', 'archive_matter',
    'log_time', 'view_time', 'edit_time',
    'create_disbursement', 'view_disbursement', 'edit_disbursement',
    'create_invoice', 'view_invoice', 'edit_invoice', 'send_invoice', 'batch_invoice',
    'create_proforma', 'view_proforma', 'edit_proforma',
    'record_payment', 'view_payment',
    'issue_credit_note', 'view_credit_note',
    'manage_trust', 'view_trust',
    'upload_document', 'view_document',
    'manage_diary', 'view_diary',
    'view_fee_agreement',
    'view_reports', 'export_audit_pack',
    'view_communication',
    'send_statement', 'view_statement',
    'run_conflict_check',
    'manage_notification_prefs',
  ],

  instructing_attorney: [
    // Read-only + approvals
    'view_matter', 'view_invoice', 'view_proforma', 'view_statement',
    'view_document', // Only documents marked as "Shared"
    'view_communication', // Only communications marked as "Shared"
    'approve_quote',
    'view_fee_agreement',
    'manage_notification_prefs',
  ],

  finance: [
    'view_matter',
    'view_time',
    'view_disbursement',
    'view_invoice', 'view_proforma',
    'record_payment', 'view_payment',
    'issue_credit_note', 'view_credit_note',
    'manage_trust', 'view_trust',
    'initiate_writeoff',
    'view_document',
    'view_reports', 'export_audit_pack', 'view_audit_trail',
    'view_statement', 'send_statement',
    'manage_notification_prefs',
  ],

  auditor: [
    // Read-only — audit trail and financial records only
    'view_matter', 'view_time', 'view_disbursement',
    'view_invoice', 'view_proforma', 'view_payment', 'view_credit_note',
    'view_trust', 'view_document',
    'view_reports', 'export_audit_pack', 'view_audit_trail',
    'view_statement', 'view_fee_agreement',
    'view_conflict_log',
  ],

  guest: [
    // Awaiting verification — no data access
  ],
};

// ─── Feature Access Matrix ───────────────────────────────────────────
export interface FeatureAccess {
  [key: string]: SystemRole[];
}

export const FEATURE_ACCESS_MATRIX: FeatureAccess = {
  dashboard: ['counsel', 'practice_admin', 'finance', 'auditor', 'super_admin', 'support_agent'],
  matters: ['counsel', 'practice_admin', 'instructing_attorney', 'super_admin', 'support_agent'],
  invoices: ['counsel', 'practice_admin', 'finance', 'auditor', 'instructing_attorney', 'super_admin', 'support_agent'],
  wip_tracker: ['counsel', 'practice_admin', 'finance', 'super_admin'],
  proforma_requests: ['counsel', 'practice_admin', 'instructing_attorney', 'super_admin', 'support_agent'],
  reports: ['counsel', 'practice_admin', 'finance', 'auditor', 'super_admin'],
  audit_trail: ['counsel', 'finance', 'auditor', 'super_admin', 'support_agent'],
  settings: ['counsel', 'super_admin'],
  analytics: ['counsel', 'super_admin'],
  user_management: ['super_admin'],
  admin_portal: ['super_admin', 'support_agent'],
  trust_account: ['counsel', 'practice_admin', 'finance', 'super_admin'],
  credit_notes: ['counsel', 'practice_admin', 'finance', 'auditor', 'super_admin'],
  firms: ['counsel', 'practice_admin', 'super_admin'],
  notifications: ['counsel', 'practice_admin', 'instructing_attorney', 'finance', 'auditor', 'super_admin', 'support_agent'],
  calendar: ['counsel', 'practice_admin', 'super_admin'],
  documents: ['counsel', 'practice_admin', 'instructing_attorney', 'finance', 'auditor', 'super_admin'],
};

// ─── PA Delegation ───────────────────────────────────────────────────
export type DelegatableModule =
  | 'matters'
  | 'time_entries'
  | 'disbursements'
  | 'invoicing'
  | 'proformas'
  | 'trust'
  | 'diary'
  | 'documents'
  | 'statements';

export interface PADelegation {
  id: string;
  pa_id: string;           // Practice Administrator user ID
  counsel_id: string;      // Counsel user ID
  modules: DelegatableModule[];
  granted_at: string;
  expires_at?: string;     // Time-bound delegation
  granted_by: string;      // Who created this delegation
  is_active: boolean;
  revoked_at?: string;
  revoke_reason?: string;
}

// ─── Role Change Audit ───────────────────────────────────────────────
export interface RoleChangeLog {
  id: string;
  user_id: string;
  old_role: SystemRole;
  new_role: SystemRole;
  changed_by: string;
  reason: string;
  timestamp: string;
}

// ─── Restricted Actions ──────────────────────────────────────────────
export interface RestrictedAction {
  action: string;
  roles: SystemRole[];
  description: string;
}

export const RESTRICTED_ACTIONS: RestrictedAction[] = [
  { action: 'delete_matter', roles: ['counsel', 'super_admin'], description: 'Only counsel or admin can delete matters' },
  { action: 'delete_invoice', roles: ['counsel', 'super_admin'], description: 'Only counsel or admin can delete invoices' },
  { action: 'manage_settings', roles: ['counsel', 'super_admin'], description: 'Only counsel or admin can manage settings' },
  { action: 'manage_rbac', roles: ['super_admin'], description: 'Only super admin can manage roles' },
  { action: 'impersonate_user', roles: ['support_agent', 'super_admin'], description: 'Impersonation requires support or admin role' },
  { action: 'manage_feature_flags', roles: ['super_admin'], description: 'Only super admin can manage feature flags' },
  { action: 'manage_subscriptions', roles: ['super_admin'], description: 'Only super admin can manage billing' },
  { action: 'approve_writeoff', roles: ['counsel', 'super_admin'], description: 'Write-off approval requires counsel or admin' },
  { action: 'reopen_matter', roles: ['counsel', 'super_admin'], description: 'Matter re-open requires counsel or admin' },
  { action: 'send_broadcast', roles: ['super_admin'], description: 'Only super admin can send broadcast notifications' },
];

// ─── Route → Role Mapping ────────────────────────────────────────────
export const ROUTE_ROLE_MAP: Record<string, SystemRole[]> = {
  '/dashboard': ['counsel', 'practice_admin', 'finance', 'auditor', 'super_admin', 'support_agent'],
  '/matters': ['counsel', 'practice_admin', 'super_admin', 'support_agent'],
  '/matter-workbench': ['counsel', 'practice_admin', 'super_admin', 'support_agent'],
  '/invoices': ['counsel', 'practice_admin', 'finance', 'auditor', 'super_admin', 'support_agent'],
  '/wip-tracker': ['counsel', 'practice_admin', 'finance', 'super_admin'],
  '/wip-report': ['counsel', 'practice_admin', 'finance', 'super_admin'],
  '/proforma-requests': ['counsel', 'practice_admin', 'super_admin', 'support_agent'],
  '/firms': ['counsel', 'practice_admin', 'super_admin'],
  '/reports': ['counsel', 'practice_admin', 'finance', 'auditor', 'super_admin'],
  '/credit-notes': ['counsel', 'practice_admin', 'finance', 'auditor', 'super_admin'],
  '/audit-trail': ['counsel', 'finance', 'auditor', 'super_admin', 'support_agent'],
  '/profile': ['counsel', 'practice_admin', 'finance', 'auditor', 'instructing_attorney', 'super_admin', 'support_agent'],
  '/settings': ['counsel', 'super_admin'],
  '/notifications': ['counsel', 'practice_admin', 'finance', 'auditor', 'instructing_attorney', 'super_admin', 'support_agent'],
  '/calendar': ['counsel', 'practice_admin', 'super_admin'],
  // Admin portal routes
  '/admin': ['super_admin', 'support_agent'],
  '/admin/users': ['super_admin', 'support_agent'],
  '/admin/tenants': ['super_admin'],
  '/admin/tickets': ['super_admin', 'support_agent'],
  '/admin/health': ['super_admin', 'support_agent'],
  '/admin/feature-flags': ['super_admin'],
  '/admin/subscriptions': ['super_admin'],
  '/admin/compliance': ['super_admin', 'support_agent'],
  '/admin/broadcasts': ['super_admin'],
  // Attorney routes
  '/attorney/dashboard': ['instructing_attorney'],
  '/attorney/matters': ['instructing_attorney'],
  '/attorney/invoices': ['instructing_attorney'],
  '/attorney/profile': ['instructing_attorney'],
};
