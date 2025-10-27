/**
 * Dashboard Configuration Hook
 * 
 * Hook for managing dashboard widget configuration based on billing preferences.
 */

import { useMemo } from 'react';
import { useBillingPreferencesReadOnly } from './useBillingPreferences';
import { 
  generateDashboardConfig, 
  shouldShowWidget, 
  getVisibleWidgets,
  type DashboardConfig,
  type DashboardWidget 
} from '../utils/dashboard-config.utils';

export interface UseDashboardConfigurationReturn {
  /**
   * Complete dashboard configuration
   */
  config: DashboardConfig;
  
  /**
   * Visible widgets in order
   */
  visibleWidgets: DashboardWidget[];
  
  /**
   * Whether configuration is loading
   */
  isLoading: boolean;
  
  /**
   * Check if a specific widget should be shown
   */
  shouldShowWidget: (widgetId: string) => boolean;
  
  /**
   * Configuration flags for common features
   */
  features: {
    showTimeTracking: boolean;
    showMilestones: boolean;
    showWIPTracker: boolean;
  };
}

/**
 * Hook for dashboard configuration based on billing preferences
 * 
 * Features:
 * - Automatic configuration based on primary workflow
 * - Custom widget visibility from preferences
 * - Feature flags for conditional rendering
 * - Loading state management
 * 
 * @returns Dashboard configuration and utilities
 */
export function useDashboardConfiguration(): UseDashboardConfigurationReturn {
  const { preferences, isLoading } = useBillingPreferencesReadOnly();

  // Generate configuration based on preferences
  const config = useMemo(() => {
    return generateDashboardConfig(preferences || undefined);
  }, [preferences]);

  // Get visible widgets
  const visibleWidgets = useMemo(() => {
    return getVisibleWidgets(preferences || undefined);
  }, [preferences]);

  // Create shouldShowWidget function
  const shouldShowWidgetFn = useMemo(() => {
    return (widgetId: string) => shouldShowWidget(widgetId, preferences || undefined);
  }, [preferences]);

  // Extract feature flags
  const features = useMemo(() => ({
    showTimeTracking: config.showTimeTracking,
    showMilestones: config.showMilestones,
    showWIPTracker: config.showWIPTracker,
  }), [config]);

  return {
    config,
    visibleWidgets,
    isLoading,
    shouldShowWidget: shouldShowWidgetFn,
    features,
  };
}

/**
 * Hook for checking if a specific widget should be visible
 * Lightweight version for individual components
 * 
 * @param widgetId Widget ID to check
 * @returns Whether the widget should be visible
 */
export function useWidgetVisibility(widgetId: string): boolean {
  const { shouldShowWidget } = useDashboardConfiguration();
  return shouldShowWidget(widgetId);
}

/**
 * Hook for getting feature flags only
 * Lightweight version for conditional rendering
 * 
 * @returns Feature flags
 */
export function useDashboardFeatures() {
  const { features, isLoading } = useDashboardConfiguration();
  return { features, isLoading };
}