/**
 * Billing Model Types
 * 
 * Type definitions for the billing workflow modernization.
 * Supports brief-fee, time-based, and quick-opinion billing models.
 */

// ============================================================================
// CORE BILLING TYPES
// ============================================================================

/**
 * Billing model enum - matches database enum
 */
export type BillingModel = 'brief-fee' | 'time-based' | 'quick-opinion';

/**
 * Primary workflow preference for advocates
 */
export type PrimaryWorkflow = 'brief-fee' | 'mixed' | 'time-based';

/**
 * Fee milestone for brief-fee matters
 */
export interface FeeMilestone {
  id: string;
  name: string;
  description: string;
  percentage: number; // Percentage of total fee
  isCompleted: boolean;
  completedAt?: Date;
  order: number;
}

/**
 * Billing strategy interface - defines behavior for each billing model
 */
export interface BillingStrategy {
  type: BillingModel;
  
  /**
   * Calculate invoice amount for this matter
   */
  calculateInvoiceAmount(matter: MatterWithBilling): number;
  
  /**
   * Get required fields for this billing model
   */
  getRequiredFields(): string[];
  
  /**
   * Get optional fields for this billing model
   */
  getOptionalFields(): string[];
  
  /**
   * Whether to show time tracking widgets
   */
  shouldShowTimeTracking(): boolean;
  
  /**
   * Get milestones for this billing model
   */
  getMilestones(): FeeMilestone[];
  
  /**
   * Validate matter data for this billing model
   */
  validate(matter: Partial<MatterWithBilling>): ValidationResult;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// MATTER TYPES WITH BILLING
// ============================================================================

/**
 * Matter interface extended with billing model fields
 */
export interface MatterWithBilling {
  id: string;
  title: string;
  client_name: string;
  description?: string;
  matter_type?: string;
  
  // Billing model fields
  billing_model: BillingModel;
  agreed_fee?: number;
  hourly_rate?: number;
  
  // Existing fields
  estimated_fee?: number;
  fee_cap?: number;
  status: string;
  advocate_id: string;
  created_at: string;
  updated_at: string;
  
  // Optional milestone tracking
  milestones?: FeeMilestone[];
}

/**
 * Matter creation data with billing model
 */
export interface CreateMatterWithBilling {
  title: string;
  client_name: string;
  description?: string;
  matter_type?: string;
  billing_model: BillingModel;
  agreed_fee?: number;
  hourly_rate?: number;
  estimated_fee?: number;
  fee_cap?: number;
  instructing_attorney: string;
  instructing_attorney_email?: string;
  instructing_firm?: string;
}

/**
 * Matter update data with billing model
 */
export interface UpdateMatterWithBilling {
  billing_model?: BillingModel;
  agreed_fee?: number;
  hourly_rate?: number;
  title?: string;
  description?: string;
  matter_type?: string;
  estimated_fee?: number;
  fee_cap?: number;
}

// ============================================================================
// BILLING PREFERENCES
// ============================================================================

/**
 * Advocate billing preferences
 */
export interface AdvocateBillingPreferences {
  id: string;
  advocate_id: string;
  default_billing_model: BillingModel;
  primary_workflow: PrimaryWorkflow;
  dashboard_widgets: string[];
  show_time_tracking_by_default: boolean;
  auto_create_milestones: boolean;
  default_hourly_rate?: number;
  default_fee_cap?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Billing preferences update data
 */
export interface UpdateBillingPreferences {
  default_billing_model?: BillingModel;
  primary_workflow?: PrimaryWorkflow;
  dashboard_widgets?: string[];
  show_time_tracking_by_default?: boolean;
  auto_create_milestones?: boolean;
  default_hourly_rate?: number;
  default_fee_cap?: number;
}

// ============================================================================
// BILLING STRATEGY IMPLEMENTATIONS
// ============================================================================

/**
 * Brief fee strategy configuration
 */
export interface BriefFeeStrategyConfig {
  defaultMilestones: Omit<FeeMilestone, 'id' | 'isCompleted' | 'completedAt'>[];
  requiresAgreedFee: boolean;
  allowsTimeTracking: boolean;
}

/**
 * Time-based strategy configuration
 */
export interface TimeBasedStrategyConfig {
  requiresHourlyRate: boolean;
  allowsFeeCapOverride: boolean;
  defaultTimeTrackingEnabled: boolean;
}

/**
 * Quick opinion strategy configuration
 */
export interface QuickOpinionStrategyConfig {
  defaultFeeRange: {
    min: number;
    max: number;
  };
  maxDurationHours: number;
  allowsTimeTracking: boolean;
}

// ============================================================================
// BILLING MODEL SELECTOR
// ============================================================================

/**
 * Billing model option for selector
 */
export interface BillingModelOption {
  value: BillingModel;
  label: string;
  description: string;
  icon?: string;
  isRecommended?: boolean;
  isDefault?: boolean;
}

/**
 * Billing model selector props
 */
export interface BillingModelSelectorProps {
  value: BillingModel;
  onChange: (model: BillingModel) => void;
  defaultModel?: BillingModel;
  showDescription?: boolean;
  disabled?: boolean;
  error?: string;
  options?: BillingModelOption[];
}

// ============================================================================
// BILLING MODEL CHANGE
// ============================================================================

/**
 * Billing model change confirmation data
 */
export interface BillingModelChangeConfirmation {
  fromModel: BillingModel;
  toModel: BillingModel;
  matterId: string;
  implications: string[];
  dataLoss: string[];
  requiresConfirmation: boolean;
}

/**
 * Billing model change result
 */
export interface BillingModelChangeResult {
  success: boolean;
  error?: string;
  warnings?: string[];
  updatedMatter?: MatterWithBilling;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default billing model options
 */
export const BILLING_MODEL_OPTIONS: BillingModelOption[] = [
  {
    value: 'brief-fee',
    label: 'Fixed Brief Fee',
    description: 'Standard brief fee arrangement. No time tracking required.',
    icon: '📄',
    isRecommended: true,
    isDefault: true,
  },
  {
    value: 'quick-opinion',
    label: 'Quick Opinion/Consultation',
    description: 'Flat rate for quick legal opinions and consultations.',
    icon: '⚡',
  },
  {
    value: 'time-based',
    label: 'Time-Based Billing',
    description: 'Track time and bill hourly. For extended work.',
    icon: '⏱️',
  },
];

/**
 * Default fee milestones for brief-fee matters
 */
export const DEFAULT_BRIEF_FEE_MILESTONES: Omit<FeeMilestone, 'id' | 'isCompleted' | 'completedAt'>[] = [
  {
    name: 'Brief Accepted',
    description: 'Brief has been accepted and work commenced',
    percentage: 0,
    order: 1,
  },
  {
    name: 'Opinion Delivered',
    description: 'Written opinion or advice delivered to attorney',
    percentage: 80,
    order: 2,
  },
  {
    name: 'Court Appearance',
    description: 'Court appearance completed (if applicable)',
    percentage: 100,
    order: 3,
  },
];

/**
 * Primary workflow options for onboarding
 */
export const PRIMARY_WORKFLOW_OPTIONS = [
  {
    value: 'brief-fee' as PrimaryWorkflow,
    label: 'Mostly brief fees',
    description: 'I primarily work on fixed-fee brief arrangements and rarely track time.',
  },
  {
    value: 'mixed' as PrimaryWorkflow,
    label: 'Mix of brief fees and hourly',
    description: 'I use both billing methods depending on the matter type.',
  },
  {
    value: 'time-based' as PrimaryWorkflow,
    label: 'Primarily time-based',
    description: 'I track time for most matters and bill hourly.',
  },
];

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for billing model
 */
export function isBillingModel(value: any): value is BillingModel {
  return typeof value === 'string' && ['brief-fee', 'time-based', 'quick-opinion'].includes(value);
}

/**
 * Type guard for primary workflow
 */
export function isPrimaryWorkflow(value: any): value is PrimaryWorkflow {
  return typeof value === 'string' && ['brief-fee', 'mixed', 'time-based'].includes(value);
}

/**
 * Type guard for matter with billing
 */
export function isMatterWithBilling(value: any): value is MatterWithBilling {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.client_name === 'string' &&
    isBillingModel(value.billing_model)
  );
}