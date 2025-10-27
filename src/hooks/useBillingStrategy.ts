/**
 * useBillingStrategy Hook
 * 
 * React hook for accessing billing strategy functionality.
 * Provides easy access to billing strategy methods and validation.
 */

import { useMemo } from 'react';
import { BillingModel, BillingStrategy } from '../types/billing-strategy.types';
import { BillingStrategyFactory } from '../services/billing-strategies/BillingStrategyFactory';
import { Matter } from '../types';
import { MatterWithBilling } from '../types/billing.types';

/**
 * Hook to get a billing strategy instance for a given model
 * 
 * @param model - The billing model to get a strategy for
 * @returns The billing strategy instance
 * 
 * @example
 * ```tsx
 * const strategy = useBillingStrategy(BillingModel.BRIEF_FEE);
 * const shouldShowTimer = strategy.shouldShowTimeTracking();
 * const milestones = strategy.getMilestones();
 * ```
 */
export function useBillingStrategy(model: BillingModel): BillingStrategy {
  return useMemo(() => {
    return BillingStrategyFactory.create(model);
  }, [model]);
}

/**
 * Hook to get billing strategy for a matter
 * Falls back to BRIEF_FEE if no billing model is set
 * 
 * @param matter - The matter to get a strategy for
 * @returns The billing strategy instance
 * 
 * @example
 * ```tsx
 * const strategy = useMatterBillingStrategy(matter);
 * const invoiceAmount = strategy.calculateInvoiceAmount(matter);
 * ```
 */
export function useMatterBillingStrategy(
  matter: Matter | MatterWithBilling | null | undefined
): BillingStrategy {
  const billingModel = useMemo(() => {
    // Check if matter has billing_model property (MatterWithBilling)
    if (matter && 'billing_model' in matter) {
      const model = matter.billing_model;
      // Convert string to enum value
      if (model === 'brief-fee') return BillingModel.BRIEF_FEE;
      if (model === 'time-based') return BillingModel.TIME_BASED;
      if (model === 'quick-opinion') return BillingModel.QUICK_OPINION;
      return BillingModel.BRIEF_FEE; // Default fallback
    }
    // Default to BRIEF_FEE for regular Matter objects
    return BillingModel.BRIEF_FEE;
  }, [matter]);

  return useBillingStrategy(billingModel);
}

/**
 * Hook to validate matter data against its billing strategy
 * 
 * @param matter - The matter to validate
 * @returns Validation result with errors and warnings
 * 
 * @example
 * ```tsx
 * const validation = useValidateMatter(matter);
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 * }
 * ```
 */
export function useValidateMatter(matter: Partial<Matter> | null | undefined) {
  const strategy = useMatterBillingStrategy(matter as Matter);

  return useMemo(() => {
    if (!matter) {
      return {
        isValid: false,
        errors: [
          {
            field: 'matter',
            message: 'Matter data is required',
            code: 'REQUIRED',
          },
        ],
        warnings: [],
      };
    }

    return strategy.validate(matter);
  }, [matter, strategy]);
}

/**
 * Hook to get all available billing models with labels and descriptions
 * 
 * @returns Array of billing model options
 * 
 * @example
 * ```tsx
 * const billingOptions = useBillingModelOptions();
 * return (
 *   <select>
 *     {billingOptions.map(option => (
 *       <option key={option.value} value={option.value}>
 *         {option.label}
 *       </option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export function useBillingModelOptions() {
  return useMemo(() => {
    const models = BillingStrategyFactory.getAvailableModels();

    return models.map((model) => ({
      value: model,
      label: BillingStrategyFactory.getModelLabel(model),
      description: BillingStrategyFactory.getModelDescription(model),
    }));
  }, []);
}
