/**
 * Billing Strategy Factory
 * 
 * Factory for creating billing strategy instances based on billing model.
 * Implements caching for performance optimization.
 */

import {
  BillingStrategy,
  BillingModel,
  BillingStrategyFactoryOptions,
} from '../../types/billing-strategy.types';
import { BriefFeeStrategy } from './BriefFeeStrategy';
import { TimeBasedStrategy } from './TimeBasedStrategy';
import { QuickOpinionStrategy } from './QuickOpinionStrategy';

/**
 * Strategy cache for performance
 * Strategies are stateless and can be reused
 */
const strategyCache = new Map<BillingModel, BillingStrategy>();

export class BillingStrategyFactory {
  private static options: BillingStrategyFactoryOptions = {};

  /**
   * Configure the factory with custom options
   */
  static configure(options: BillingStrategyFactoryOptions): void {
    this.options = options;
    // Clear cache when configuration changes
    strategyCache.clear();
  }

  /**
   * Create a billing strategy instance for the given model
   * Uses caching for performance
   */
  static create(model: BillingModel): BillingStrategy {
    // Check cache first
    if (strategyCache.has(model)) {
      return strategyCache.get(model)!;
    }

    // Create new strategy instance
    let strategy: BillingStrategy;

    switch (model) {
      case BillingModel.BRIEF_FEE:
        strategy = new BriefFeeStrategy(this.options.briefFeeConfig);
        break;

      case BillingModel.TIME_BASED:
        strategy = new TimeBasedStrategy(this.options.timeBasedConfig);
        break;

      case BillingModel.QUICK_OPINION:
        strategy = new QuickOpinionStrategy(this.options.quickOpinionConfig);
        break;

      default:
        throw new Error(`Unknown billing model: ${model}`);
    }

    // Cache the strategy
    strategyCache.set(model, strategy);

    return strategy;
  }

  /**
   * Get all available billing models
   */
  static getAvailableModels(): BillingModel[] {
    return Object.values(BillingModel);
  }

  /**
   * Check if a billing model is valid
   */
  static isValidModel(model: string): model is BillingModel {
    return Object.values(BillingModel).includes(model as BillingModel);
  }

  /**
   * Clear the strategy cache
   * Useful for testing or when configuration changes
   */
  static clearCache(): void {
    strategyCache.clear();
  }

  /**
   * Get a human-readable label for a billing model
   */
  static getModelLabel(model: BillingModel): string {
    const labels: Record<BillingModel, string> = {
      [BillingModel.BRIEF_FEE]: 'Fixed Brief Fee',
      [BillingModel.TIME_BASED]: 'Time-Based Billing',
      [BillingModel.QUICK_OPINION]: 'Quick Opinion/Consultation',
    };

    return labels[model] || model;
  }

  /**
   * Get a description for a billing model
   */
  static getModelDescription(model: BillingModel): string {
    const descriptions: Record<BillingModel, string> = {
      [BillingModel.BRIEF_FEE]:
        'Standard brief fee arrangement. No time tracking required.',
      [BillingModel.TIME_BASED]:
        'Track time and bill hourly. For extended litigation work.',
      [BillingModel.QUICK_OPINION]:
        'Flat rate for quick legal opinions and consultations.',
    };

    return descriptions[model] || '';
  }
}
