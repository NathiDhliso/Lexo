/**
 * Attorney User Types
 * Types for attorney portal and attorney user management
 */

export interface AttorneyUser {
  id: string;
  email: string;
  firm_name: string;
  attorney_name: string;
  practice_number?: string;
  phone_number?: string;
  status: 'active' | 'inactive';
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
  status?: 'active' | 'inactive';
}

export interface AttorneyMatterAccess {
  id: string;
  attorney_user_id: string;
  matter_id: string;
  access_level: 'view' | 'edit' | 'full';
  granted_by: string;
  granted_at: string;
  revoked_at?: string;
  revoked_by?: string;
  revoked_reason?: string;
}
