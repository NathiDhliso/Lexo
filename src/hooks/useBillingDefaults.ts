/**
 * Billing Defaults Hook
 * 
 * Provides default values based on user billing preferences.
 * Used for matter creation, dashboard configuration, etc.
 */

import { useMemo } from 'react';
import { useBillingPreferencesReadOnly } from './useBillingPreferences';
import type { 
  AdvocateBillingPreferences 
} from '../types/billing.types';
import { BillingModel } from '../types/billing-strategy.types';

export interface BillingDefaults {
  /**
   * Default billing model for new matters
   */
  defaultBillingModel: BillingModel;
  
  /**
   * Default hourly rate (if applicable)
   */
  defaultHourlyRate?: number;
  
  /**
   * Default fee cap (if applicable)
   */
  defaultFeeCap?: number;
  
  /**
   * Whether to show time tracking by default
   */
  showTimeTrackingByDefault: boolean;
  
  /**
   * Whether to auto-create milestones for brief fee matters
   */
  autoCreateMilestones: boolean;
  
  /**
   * Dashboard widgets to display
   */
  dashboardWidgets: string[];
  
  /**
   * Primary workflow preference
   */
  primaryWorkflow: 'brief-fee' | 'mixed' | 'time-based';
}

export interface UseBillingDefaultsReturn {
  /**
   * Billing defaults based on user preferences
   */
  defaults: BillingDefaults;
  
  /**
   * Whether defaults are loading
   */
  isLoading: boolean;
  
  /**
   * Get default values for matter creation
   */
  getMatterDefaults: () => {
    billing_model: BillingModel;
    hourly_rate?: number;
    fee_cap?: number;
  };
  
  /**
   * Get dashboard widget configuration
   */
  getDashboardConfig: () => {
    widgets: string[];
    showTimeTracking: boolean;
  };
  
  /**
   * Check if a specific feature should be shown by default
   */
  shouldShowFeature: (feature: 'time-tracking' | 'milestones' | 'wip-tracker') => boolean;
}

/**
 * Hook for getting billing defaults based on user preferences
 * 
 * Features:
 * - Automatic fallback to sensible defaults
 * - Preference-based configuration
 * - Matter creation defaults
 * - Dashboard configuration
 * 
 * @returns Billing defaults and utilities
 */
export function useBillingDefaults(): UseBillingDefaultsReturn {
  const { preferences, isLoading } = useBillingPreferencesReadOnly();

  // Calculate defaults based on preferences
  const defaults = useMemo((): BillingDefaults => {
    if (!preferences) {
      // Fallback defaults for new users
      return {
        defaultBillingModel: BillingModel.BRIEF_FEE,
        showTimeTrackingByDefault: false,
        autoCreateMilestones: true,
        dashboardWidgets: ['active-matters', 'pending-invoices', 'recent-activity'],
        primaryWorkflow: 'brief-fee',
      };
    }

    // Convert string billing model to enum
    const getBillingModelEnum = (model: string): BillingModel => {
      switch (model) {
        case 'brief-fee':
          return BillingModel.BRIEF_FEE;
        case 'time-based':
          return BillingModel.TIME_BASED;
        case 'quick-opinion':
          return BillingModel.QUICK_OPINION;
        default:
          return BillingModel.BRIEF_FEE;
      }
    };

    return {
      defaultBillingModel: getBillingModelEnum(preferences.default_billing_model),
      defaultHourlyRate: preferences.default_hourly_rate || undefined,
      defaultFeeCap: preferences.default_fee_cap || undefined,
      showTimeTrackingByDefault: preferences.show_time_tracking_by_default,
      autoCreateMilestones: preferences.auto_create_milestones,
      dashboardWidgets: Array.isArray(preferences.dashboard_widgets) 
        ? preferences.dashboard_widgets 
        : ['active-matters', 'pending-invoices', 'recent-activity'],
      primaryWorkflow: preferences.primary_workflow,
    };
  }, [preferences]);

  // Get matter creation defaults
  const getMatterDefaults = useMemo(() => {
    return () => ({
      billing_model: defaults.defaultBillingModel,
      hourly_rate: defaults.defaultHourlyRate,
      fee_cap: defaults.defaultFeeCap,
    });
  }, [defaults]);

  // Get dashboard configuration
  const getDashboardConfig = useMemo(() => {
    return () => ({
      widgets: defaults.dashboardWidgets,
      showTimeTracking: defaults.showTimeTrackingByDefault,
    });
  }, [defaults]);

  // Check if a feature should be shown by default
  const shouldShowFeature = useMemo(() => {
    return (feature: 'time-tracking' | 'milestones' | 'wip-tracker'): boolean => {
      switch (feature) {
        case 'time-tracking':
          return defaults.showTimeTrackingByDefault || defaults.primaryWorkflow === 'time-based';
        
        case 'milestones':
          return defaults.autoCreateMilestones && 
                 (defaults.primaryWorkflow === 'brief-fee' || defaults.primaryWorkflow === 'mixed');
        
        case 'wip-tracker':
          return defaults.primaryWorkflow === 'time-based' || defaults.primaryWorkflow === 'mixed';
        
        default:
          return false;
      }
    };
  }, [defaults]);

  return {
    defaults,
    isLoading,
    getMatterDefaults,
    getDashboardConfig,
    shouldShowFeature,
  };
}

/**
 * Hook for getting default billing model only
 * Lightweight version for components that just need the default billing model
 * 
 * @returns Default billing model
 */
export function useDefaultBillingModel(): BillingModel {
  const { defaults } = useBillingDefaults();
  return defaults.defaultBillingModel;
}

/**
 * Hook for checking if time tracking should be shown by default
 * 
 * @returns Whether to show time tracking by default
 */
export function useShowTimeTrackingByDefault(): boolean {
  const { defaults } = useBillingDefaults();
  return defaults.showTimeTrackingByDefault;
}

/**
 * Hook for getting dashboard widget configuration
 * 
 * @returns Dashboard configuration
 */
export function useDashboardConfig() {
  const { getDashboardConfig, isLoading } = useBillingDefaults();
  return {
    config: getDashboardConfig(),
    isLoading,
  };
}