/**
 * Unified User Types
 * Consolidates advocates and user_profiles into a single user model
 */

import { BarAssociation } from './index';

export enum UserRole {
  JUNIOR_ADVOCATE = 'junior_advocate',
  SENIOR_ADVOCATE = 'senior_advocate',
  CHAMBERS_ADMIN = 'chambers_admin'
}

export interface BankingDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_code: string;
  swift_code?: string;
}

export interface NotificationPreferences {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
}

export interface InvoiceSettings {
  auto_remind: boolean;
  reminder_days: number[];
}

/**
 * Unified User Profile
 * Combines user_profiles and advocates tables
 */
export interface UserProfile {
  // Core identity (from user_profiles)
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  initials?: string;
  phone?: string;
  avatar_url?: string;
  
  // Practice information (from advocates)
  practice_number?: string;
  bar?: BarAssociation;
  year_admitted?: number;
  
  // Rates and fees (from advocates)
  hourly_rate: number;
  contingency_rate?: number;
  success_fee_rate?: number;
  
  // Address information
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  chambers_address?: string;
  postal_address?: string;
  
  // Firm branding (from advocates)
  practice_name?: string;
  firm_name?: string;
  firm_tagline?: string;
  firm_logo_url?: string;
  
  // Financial
  vat_number?: string;
  banking_details?: BankingDetails;
  
  // Preferences (from advocates)
  notification_preferences: NotificationPreferences;
  invoice_settings: InvoiceSettings;
  
  // Status and metadata
  user_role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  deleted_at?: string;
}

/**
 * User Profile Update DTO
 */
export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  initials?: string;
  phone?: string;
  avatar_url?: string;
  practice_number?: string;
  bar?: BarAssociation;
  year_admitted?: number;
  hourly_rate?: number;
  contingency_rate?: number;
  success_fee_rate?: number;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  chambers_address?: string;
  postal_address?: string;
  practice_name?: string;
  firm_name?: string;
  firm_tagline?: string;
  firm_logo_url?: string;
  vat_number?: string;
  banking_details?: BankingDetails;
  notification_preferences?: NotificationPreferences;
  invoice_settings?: InvoiceSettings;
}

/**
 * User Profile Creation DTO
 */
export interface UserProfileCreate extends UserProfileUpdate {
  user_id: string;
  email: string;
}

// Backward compatibility: Advocate is now an alias for UserProfile
export type Advocate = UserProfile;
