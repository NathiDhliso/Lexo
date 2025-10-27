/**
 * Time-Based Strategy
 * 
 * Implements billing logic for hourly/time-based billing arrangements.
 * Used for extended litigation or matters where time tracking is essential.
 */

import {
  BillingStrategy,
  BillingModel,
  FeeMilestone,
  ValidationResult,
  TimeBasedStrategyConfig,
} from '../../types/billing-strategy.types';
import { Matter } from '../../types';

export class TimeBasedStrategy implements BillingStrategy {
  public readonly type = BillingModel.TIME_BASED;
  private config: TimeBasedStrategyConfig;

  constructor(config?: Partial<TimeBasedStrategyConfig>) {
    this.config = {
      requiresHourlyRate: true,
      allowBudgetTracking: true,
      requiresTimeEntries: true,
      ...config,
    };
  }

  calculateInvoiceAmount(matter: Matter): number {
    // For time-based billing, calculate from time entries
    // This is a simplified calculation - actual implementation would
    // fetch time entries from the database
    
    // If actual_fee is set (from time entries), use that
    if (matter.actual_fee) {
      return matter.actual_fee;
    }

    // Otherwise, use WIP value as estimate
    if (matter.wip_value) {
      return matter.wip_value;
    }

    // Fallback to estimated fee if no time entries yet
    return matter.estimated_fee || 0;
  }

  getRequiredFields(): string[] {
    const fields = [
      'title',
      'client_name',
      'instructing_attorney',
      'matter_type',
    ];

    // Hourly rate is required for time-based billing
    // Note: This would typically come from advocate settings
    // but can be overridden per matter
    if (this.config.requiresHourlyRate) {
      fields.push('hourly_rate');
    }

    return fields;
  }

  getOptionalFields(): string[] {
    const optional = [
      'description',
      'court_case_number',
      'expected_completion_date',
      'tags',
      'estimated_fee', // Budget estimate
      'fee_cap', // Maximum fee cap
    ];

    return optional;
  }

  shouldShowTimeTracking(): boolean {
    // Time tracking is always visible for time-based billing
    return true;
  }

  getMilestones(): FeeMilestone[] {
    // Time-based billing doesn't use milestones
    // Progress is tracked through time entries instead
    return [];
  }

  validate(matter: Partial<Matter>): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // Validate required fields
    if (!matter.title) {
      errors.push({
        field: 'title',
        message: 'Matter title is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!matter.client_name) {
      errors.push({
        field: 'client_name',
        message: 'Client name is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!matter.instructing_attorney) {
      errors.push({
        field: 'instructing_attorney',
        message: 'Instructing attorney is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!matter.matter_type) {
      errors.push({
        field: 'matter_type',
        message: 'Matter type is required',
        code: 'REQUIRED_FIELD',
      });
    }

    // Validate hourly rate (would typically come from advocate settings)
    // This is a placeholder - actual implementation would check advocate.hourly_rate
    
    // Warnings
    if (!matter.description) {
      warnings.push({
        field: 'description',
        message: 'Adding a description helps track matter details',
        code: 'RECOMMENDED_FIELD',
      });
    }

    if (!matter.estimated_fee && this.config.allowBudgetTracking) {
      warnings.push({
        field: 'estimated_fee',
        message: 'Setting a budget estimate helps track against actual time',
        code: 'RECOMMENDED_FIELD',
      });
    }

    if (!matter.fee_cap) {
      warnings.push({
        field: 'fee_cap',
        message: 'Consider setting a fee cap to manage client expectations',
        code: 'RECOMMENDED_FIELD',
      });
    }

    if (!matter.expected_completion_date) {
      warnings.push({
        field: 'expected_completion_date',
        message: 'Setting an expected completion date helps with planning',
        code: 'RECOMMENDED_FIELD',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
