/**
 * useFeatureFlag Hook
 * React hook for checking if a feature is enabled
 */

import React, { useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  isFeatureEnabled, 
  isUserInRollout, 
  isInternalTestingMode,
  type FeatureFlags 
} from '../config/feature-flags';

/**
 * Hook to check if a feature flag is enabled for the current user
 * 
 * @param feature - The feature flag to check
 * @returns boolean indicating if the feature is enabled
 * 
 * @example
 * const partialPaymentsEnabled = useFeatureFlag('partialPayments');
 * 
 * if (partialPaymentsEnabled) {
 *   return <RecordPaymentModal />;
 * }
 */
export const useFeatureFlag = (feature: keyof FeatureFlags): boolean => {
  // Get current user from Supabase
  const [user, setUser] = React.useState<any>(null);
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);
  
  return useMemo(() => {
    // Check if feature is globally enabled
    const featureEnabled = isFeatureEnabled(feature);
    
    if (!featureEnabled) {
      return false;
    }
    
    // If in internal testing mode, enable for all authenticated users
    if (isInternalTestingMode() && user) {
      return true;
    }
    
    // Check if user is in rollout group
    if (user) {
      return isUserInRollout(user.id);
    }
    
    // Default to disabled for unauthenticated users
    return false;
  }, [feature, user]);
};

/**
 * Hook to get all feature flags for the current user
 * 
 * @returns Object with all feature flags and their enabled status
 * 
 * @example
 * const features = useFeatureFlags();
 * 
 * if (features.partialPayments) {
 *   // Show payment features
 * }
 */
export const useFeatureFlags = (): FeatureFlags => {
  // Get current user from Supabase
  const [user, setUser] = React.useState<any>(null);
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);
  
  return useMemo(() => {
    const features: FeatureFlags = {
      partialPayments: false,
      disbursements: false,
      invoiceNumbering: false,
      enhancedDashboard: false,
      matterSearch: false,
    };
    
    // Check each feature
    Object.keys(features).forEach((key) => {
      const featureKey = key as keyof FeatureFlags;
      const featureEnabled = isFeatureEnabled(featureKey);
      
      if (!featureEnabled) {
        features[featureKey] = false;
        return;
      }
      
      // If in internal testing mode, enable for all authenticated users
      if (isInternalTestingMode() && user) {
        features[featureKey] = true;
        return;
      }
      
      // Check if user is in rollout group
      if (user) {
        features[featureKey] = isUserInRollout(user.id);
      }
    });
    
    return features;
  }, [user]);
};
