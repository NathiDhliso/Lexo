/**
 * Billing Strategies
 * 
 * Exports all billing strategy implementations and factory
 */

export { BriefFeeStrategy } from './BriefFeeStrategy';
export { TimeBasedStrategy } from './TimeBasedStrategy';
export { QuickOpinionStrategy } from './QuickOpinionStrategy';
export { BillingStrategyFactory } from './BillingStrategyFactory';

// Re-export types for convenience
export { BillingModel } from '../../types/billing-strategy.types';
export type {
  BillingStrategy,
  FeeMilestone,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../../types/billing-strategy.types';
