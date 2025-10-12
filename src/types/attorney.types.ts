/**
 * Attorney User Types
 * Types for attorney portal and attorney-matter access
 */

export interface AttorneyUser {
  id: string;
  email: string;
  password_hash: string;
  firm_name: string;
  attorney_name: string;
  practice_number?: string;
  phone_number?: string;
  notification_preferences: {
    sms: boolean;
    email: boolean;
    in_app: boolean;
    invoice_issued: boolean;
    invoice_overdue: boolean;
    payment_received: boolean;
    proforma_requests: boolean;
  };
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  deleted_at?: string;
}

export type AttorneyAccessLevel = 'view' | 'edit' | 'full';

export interface AttorneyMatterAccess {
  id: string;
  attorney_user_id: string;
  matter_id: string;
  access_level: AttorneyAccessLevel;
  granted_at: string;
  granted_by?: string;
  revoked_at?: string;
  revoked_by?: string;
  revoked_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AttorneyUserCreate {
  email: string;
  password: string;
  firm_name: string;
  attorney_name: string;
  practice_number?: string;
  phone_number?: string;
}

export interface AttorneyUserUpdate {
  firm_name?: string;
  attorney_name?: string;
  practice_number?: string;
  phone_number?: string;
  notification_preferences?: Partial<AttorneyUser['notification_preferences']>;
}
