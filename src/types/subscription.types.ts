/**
 * Subscription Types
 * Type definitions for subscription tiers and payment processing
 */

export enum SubscriptionTier {
  ADMISSION = 'admission',
  ADVOCATE = 'advocate',
  SENIOR_COUNSEL = 'senior_counsel'
}

export enum PaymentGateway {
  PAYSTACK = 'paystack',
  PAYFAST = 'payfast'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  EXPIRED = 'expired'
}

export interface SubscriptionTierConfig {
  id: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number; // in ZAR cents (R0 = 0, R299 = 29900)
  features: {
    maxActiveMatters: number | null; // null = unlimited
    maxUsers: number;
    additionalUserPrice: number; // in ZAR cents
    timeTracking: boolean;
    invoicing: boolean;
    basicReporting: boolean;
    matterPipeline: boolean;
    clientRevenue: boolean;
    agingReport: boolean;
    matterProfitability: boolean;
    customReports: boolean;
    teamCollaboration: boolean;
    mobileAccess: boolean;
    prioritySupport: 'email' | 'phone_email';
    apiAccess: boolean;
  };
  limitations?: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_gateway: PaymentGateway;
  gateway_subscription_id?: string;
  gateway_customer_id?: string;
  additional_users: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  subscription_id: string;
  amount: number; // in ZAR cents
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_gateway: PaymentGateway;
  gateway_transaction_id?: string;
  gateway_reference?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  amount: string;
  item_name: string;
  item_description: string;
  subscription_type: '1'; // 1 = subscription
  billing_date: string;
  recurring_amount: string;
  frequency: '3'; // 3 = monthly
  cycles: '0'; // 0 = until cancelled
  signature?: string;
}

export interface SubscriptionUpgradeRequest {
  new_tier: SubscriptionTier;
  additional_users?: number;
  payment_gateway: PaymentGateway;
}

export interface UsageMetrics {
  active_matters_count: number;
  users_count: number;
  storage_used_mb: number;
  api_calls_count: number;
}
