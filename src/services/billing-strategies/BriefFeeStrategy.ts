/**
 * Brief Fee Strategy
 * 
 * Implements billing logic for fixed brief fee arrangements.
 * This is the default billing model for most South African advocates.
 */

import {
  BillingStrategy,
  BillingModel,
  FeeMilestone,
  ValidationResult,
  BriefFeeStrategyConfig,
} from '../../types/billing-strategy.types';
import { Matter } from '../../types';

const DEFAULT_MILESTONES: FeeMilestone[] = [
  {
    id: 'brief-accepted',
    label: 'Brief Accepted',
    description: 'Brief has been accepted and matter is active',
    completed: false,
    order: 1,
  },
  {
    id: 'opinion-delivered',
    label: 'Opinion Delivered',
    description: 'Legal opinion has been delivered to client',
    completed: false,
    order: 2,
  },
  {
    id: 'court-appearance',
    label: 'Court Appearance Completed',
    description: 'Court appearance or hearing completed',
    completed: false,
    order: 3,
  },
];

export class BriefFeeStrategy implements BillingStrategy {
  public readonly type = BillingModel.BRIEF_FEE;
  private config: BriefFeeStrategyConfig;

  constructor(config?: Partial<BriefFeeStrategyConfig>) {
    this.config = {
      defaultMilestones: DEFAULT_MILESTONES,
      requiresAgreedFee: true,
      allowTimeTracking: true, // For internal analysis only
      ...config,
    };
  }

  calculateInvoiceAmount(matter: Matter): number {
    // For brief fees, the invoice amount is the agreed fee
    if (!matter.estimated_fee && !matter.actual_fee) {
      throw new Error('Brief fee matter must have an agreed fee amount');
    }

    return matter.actual_fee || matter.estimated_fee || 0;
  }

  getRequiredFields(): string[] {
    const fields = [
      'title',
      'client_name',
      'instructing_attorney',
      'matter_type',
      'estimated_fee', // The agreed brief fee
    ];

    return fields;
  }

  getOptionalFields(): string[] {
    return [
      'description',
      'court_case_number',
      'expected_completion_date',
      'tags',
      // Time tracking is optional for internal analysis
      'time_entries',
    ];
  }

  shouldShowTimeTracking(): boolean {
    // Time tracking is hidden by default for brief fees
    // Can be enabled for internal analysis via advanced options
    return false;
  }

  getMilestones(): FeeMilestone[] {
    return [...this.config.defaultMilestones];
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

    // Validate agreed fee
    if (this.config.requiresAgreedFee) {
      if (!matter.estimated_fee && !matter.actual_fee) {
        errors.push({
          field: 'estimated_fee',
          message: 'Agreed brief fee is required',
          code: 'REQUIRED_FIELD',
        });
      }

      if (matter.estimated_fee && matter.estimated_fee <= 0) {
        errors.push({
          field: 'estimated_fee',
          message: 'Brief fee must be greater than zero',
          code: 'INVALID_VALUE',
        });
      }
    }

    // Warnings
    if (!matter.description) {
      warnings.push({
        field: 'description',
        message: 'Adding a description helps track matter details',
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
