/**
 * Billing Strategy Types
 * 
 * Defines the billing model architecture for the system, supporting
 * multiple billing approaches (brief fees, time-based, quick opinions)
 * with a strategy pattern implementation.
 */

import { Matter } from './index';

/**
 * Billing Model Enum
 * Defines the available billing models in the system
 */
export enum BillingModel {
  BRIEF_FEE = 'brief-fee',
  TIME_BASED = 'time-based',
  QUICK_OPINION = 'quick-opinion',
}

/**
 * Fee Milestone
 * Represents progress milestones for brief fee matters
 */
export interface FeeMilestone {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
  order: number;
}

/**
 * Billing Strategy Interface
 * Defines the contract that all billing strategies must implement
 */
export interface BillingStrategy {
  /** The type of billing model */
  type: BillingModel;
  
  /** Calculate the invoice amount for a matter */
  calculateInvoiceAmount(matter: Matter): number;
  
  /** Get required fields for this billing model */
  getRequiredFields(): string[];
  
  /** Get optional fields for this billing model */
  getOptionalFields(): string[];
  
  /** Determine if time tracking should be shown */
  shouldShowTimeTracking(): boolean;
  
  /** Get milestones for this billing model (if applicable) */
  getMilestones(): FeeMilestone[];
  
  /** Validate matter data for this billing model */
  validate(matter: Partial<Matter>): ValidationResult;
}

/**
 * Validation Result
 * Result of validating matter data against billing strategy requirements
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

/**
 * Brief Fee Strategy Configuration
 */
export interface BriefFeeStrategyConfig {
  defaultMilestones: FeeMilestone[];
  requiresAgreedFee: boolean;
  allowTimeTracking: boolean; // For internal analysis
}

/**
 * Time-Based Strategy Configuration
 */
export interface TimeBasedStrategyConfig {
  requiresHourlyRate: boolean;
  allowBudgetTracking: boolean;
  requiresTimeEntries: boolean;
}

/**
 * Quick Opinion Strategy Configuration
 */
export interface QuickOpinionStrategyConfig {
  defaultFeeRange: {
    min: number;
    max: number;
  };
  typicalTurnaroundDays: number;
  requiresAgreedFee: boolean;
}

/**
 * Billing Strategy Factory Options
 */
export interface BillingStrategyFactoryOptions {
  briefFeeConfig?: Partial<BriefFeeStrategyConfig>;
  timeBasedConfig?: Partial<TimeBasedStrategyConfig>;
  quickOpinionConfig?: Partial<QuickOpinionStrategyConfig>;
}
