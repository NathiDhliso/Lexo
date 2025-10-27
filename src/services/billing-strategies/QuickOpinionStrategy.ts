/**
 * Quick Opinion Strategy
 * 
 * Implements billing logic for quick legal opinions and consultations.
 * Flat-rate, fast-turnaround matters with simplified workflow.
 */

import {
  BillingStrategy,
  BillingModel,
  FeeMilestone,
  ValidationResult,
  QuickOpinionStrategyConfig,
} from '../../types/billing-strategy.types';
import { Matter } from '../../types';

const DEFAULT_FEE_RANGE = {
  min: 2500,
  max: 10000,
};

const DEFAULT_MILESTONES: FeeMilestone[] = [
  {
    id: 'request-received',
    label: 'Request Received',
    description: 'Opinion request received and acknowledged',
    completed: false,
    order: 1,
  },
  {
    id: 'opinion-delivered',
    label: 'Opinion Delivered',
    description: 'Written opinion delivered to client',
    completed: false,
    order: 2,
  },
];

export class QuickOpinionStrategy implements BillingStrategy {
  public readonly type = BillingModel.QUICK_OPINION;
  private config: QuickOpinionStrategyConfig;

  constructor(config?: Partial<QuickOpinionStrategyConfig>) {
    this.config = {
      defaultFeeRange: DEFAULT_FEE_RANGE,
      typicalTurnaroundDays: 3,
      requiresAgreedFee: true,
      ...config,
    };
  }

  calculateInvoiceAmount(matter: Matter): number {
    // For quick opinions, use the agreed flat fee
    if (!matter.estimated_fee && !matter.actual_fee) {
      throw new Error('Quick opinion matter must have an agreed fee amount');
    }

    return matter.actual_fee || matter.estimated_fee || 0;
  }

  getRequiredFields(): string[] {
    return [
      'title',
      'client_name',
      'instructing_attorney',
      'matter_type',
      'estimated_fee', // The agreed flat fee
      'description', // Opinion request details
    ];
  }

  getOptionalFields(): string[] {
    return [
      'court_case_number',
      'expected_completion_date',
      'tags',
      // Time tracking not typically used for quick opinions
    ];
  }

  shouldShowTimeTracking(): boolean {
    // Time tracking is not shown for quick opinions
    // These are flat-rate, quick-turnaround matters
    return false;
  }

  getMilestones(): FeeMilestone[] {
    return [...DEFAULT_MILESTONES];
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

    if (!matter.description) {
      errors.push({
        field: 'description',
        message: 'Opinion request details are required',
        code: 'REQUIRED_FIELD',
      });
    }

    // Validate agreed fee
    if (this.config.requiresAgreedFee) {
      if (!matter.estimated_fee && !matter.actual_fee) {
        errors.push({
          field: 'estimated_fee',
          message: 'Agreed fee is required for quick opinions',
          code: 'REQUIRED_FIELD',
        });
      }

      const fee = matter.estimated_fee || matter.actual_fee || 0;
      
      if (fee <= 0) {
        errors.push({
          field: 'estimated_fee',
          message: 'Fee must be greater than zero',
          code: 'INVALID_VALUE',
        });
      }

      // Warn if fee is outside typical range
      if (fee < this.config.defaultFeeRange.min) {
        warnings.push({
          field: 'estimated_fee',
          message: `Fee is below typical range (R${this.config.defaultFeeRange.min.toLocaleString()} - R${this.config.defaultFeeRange.max.toLocaleString()})`,
          code: 'BELOW_TYPICAL_RANGE',
        });
      }

      if (fee > this.config.defaultFeeRange.max) {
        warnings.push({
          field: 'estimated_fee',
          message: `Fee is above typical range (R${this.config.defaultFeeRange.min.toLocaleString()} - R${this.config.defaultFeeRange.max.toLocaleString()}). Consider using standard brief fee billing.`,
          code: 'ABOVE_TYPICAL_RANGE',
        });
      }
    }

    // Warnings
    if (!matter.expected_completion_date) {
      warnings.push({
        field: 'expected_completion_date',
        message: `Quick opinions typically have a ${this.config.typicalTurnaroundDays}-day turnaround`,
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
