export type UserRole = 'junior' | 'senior';

export type Permission = 
  | 'view_dashboard'
  | 'create_proforma'
  | 'view_proforma'
  | 'edit_proforma'
  | 'delete_proforma'
  | 'create_matter'
  | 'view_matter'
  | 'edit_matter'
  | 'delete_matter'
  | 'create_invoice'
  | 'view_invoice'
  | 'edit_invoice'
  | 'delete_invoice'
  | 'view_reports'
  | 'manage_settings'
  | 'view_analytics';

export interface RolePermissions {
  [key: string]: Permission[];
}

export interface FeatureAccess {
  [key: string]: UserRole[];
}

export interface RestrictedAction {
  action: string;
  roles: UserRole[];
  description: string;
}

export const ROLE_PERMISSIONS: RolePermissions = {
  junior: [
    'view_dashboard',
    'create_proforma',
    'view_proforma',
    'edit_proforma',
    'create_matter',
    'view_matter',
    'edit_matter',
    'create_invoice',
    'view_invoice',
    'edit_invoice',
    'view_reports',
  ],
  senior: [
    'view_dashboard',
    'create_proforma',
    'view_proforma',
    'edit_proforma',
    'delete_proforma',
    'create_matter',
    'view_matter',
    'edit_matter',
    'delete_matter',
    'create_invoice',
    'view_invoice',
    'edit_invoice',
    'delete_invoice',
    'view_reports',
    'manage_settings',
    'view_analytics',
  ],
};

export const FEATURE_ACCESS_MATRIX: FeatureAccess = {
  'pro_forma_requests': ['junior', 'senior'],
  'matters': ['junior', 'senior'],
  'invoices': ['junior', 'senior'],
  'dashboard': ['junior', 'senior'],
  'settings': ['senior'],
  'analytics': ['senior'],
  'user_management': ['senior'],
};

export const RESTRICTED_ACTIONS: RestrictedAction[] = [
  {
    action: 'delete_matter',
    roles: ['senior'],
    description: 'Only senior advocates can delete matters',
  },
  {
    action: 'delete_invoice',
    roles: ['senior'],
    description: 'Only senior advocates can delete invoices',
  },
  {
    action: 'manage_settings',
    roles: ['senior'],
    description: 'Only senior advocates can manage system settings',
  },
  {
    action: 'view_analytics',
    roles: ['senior'],
    description: 'Only senior advocates can view analytics',
  },
];
