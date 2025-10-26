/**
 * Feature Flags Configuration
 * Enables gradual rollout and quick rollback of new features
 */

export interface FeatureFlags {
  partialPayments: boolean;
  disbursements: boolean;
  invoiceNumbering: boolean;
  enhancedDashboard: boolean;
  matterSearch: boolean;
}

/**
 * Get feature flags from environment variables
 */
export const getFeatureFlags = (): FeatureFlags => {
  return {
    partialPayments: import.meta.env.VITE_FEATURE_PARTIAL_PAYMENTS === 'true',
    disbursements: import.meta.env.VITE_FEATURE_DISBURSEMENTS === 'true',
    invoiceNumbering: import.meta.env.VITE_FEATURE_INVOICE_NUMBERING === 'true',
    enhancedDashboard: import.meta.env.VITE_FEATURE_ENHANCED_DASHBOARD === 'true',
    matterSearch: import.meta.env.VITE_FEATURE_MATTER_SEARCH === 'true',
  };
};

/**
 * Check if a specific feature is enabled
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlags();
  return flags[feature];
};

/**
 * Get rollout percentage (0-100)
 * Used for gradual feature rollout
 */
export const getRolloutPercentage = (): number => {
  const percentage = parseInt(import.meta.env.VITE_ROLLOUT_PERCENTAGE || '100', 10);
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Check if user is in rollout group
 * Uses user ID to deterministically assign users to rollout groups
 */
export const isUserInRollout = (userId: string): boolean => {
  const rolloutPercentage = getRolloutPercentage();
  
  if (rolloutPercentage === 100) return true;
  if (rolloutPercentage === 0) return false;
  
  // Use simple hash of user ID to determine rollout group
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const userPercentile = Math.abs(hash % 100);
  return userPercentile < rolloutPercentage;
};

/**
 * Check if internal testing mode is enabled
 */
export const isInternalTestingMode = (): boolean => {
  return import.meta.env.VITE_INTERNAL_TESTING_MODE === 'true';
};

// Default feature flags (all enabled for development)
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  partialPayments: true,
  disbursements: true,
  invoiceNumbering: true,
  enhancedDashboard: true,
  matterSearch: true,
};
