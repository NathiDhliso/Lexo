/**
 * Subscription Guard Middleware
 * Protects routes and features based on subscription tier
 */

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_TIERS } from '../config/subscription-tiers.config';
import type { SubscriptionTier } from '../types/subscription.types';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier: SubscriptionTier;
  feature?: string;
  fallback?: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredTier,
  feature,
  fallback
}) => {
  const { subscription, isLoading } = useSubscription();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!subscription) {
      setHasAccess(false);
      return;
    }

    // Check tier hierarchy: admission < advocate < senior_counsel
    const tierHierarchy: Record<SubscriptionTier, number> = {
      admission: 1,
      advocate: 2,
      senior_counsel: 3
    };

    const userTierLevel = tierHierarchy[subscription.tier];
    const requiredTierLevel = tierHierarchy[requiredTier];

    setHasAccess(userTierLevel >= requiredTierLevel);
  }, [subscription, requiredTier]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-gray-600">Checking subscription...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-yellow-900">
          Upgrade Required
        </h3>
        <p className="mb-4 text-yellow-800">
          This feature requires the {SUBSCRIPTION_TIERS[requiredTier].name} plan or higher.
        </p>
        <a
          href="/subscription"
          className="inline-flex items-center rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
        >
          View Plans
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Hook to check feature access
 */
export const useFeatureAccess = (feature: string) => {
  const { subscription } = useSubscription();

  if (!subscription) return false;

  const tierConfig = SUBSCRIPTION_TIERS[subscription.tier];

  // Map features to tier config properties
  const featureMap: Record<string, boolean> = {
    matter_pipeline: tierConfig.features.matterPipeline,
    client_revenue: tierConfig.features.clientRevenue,
    aging_report: tierConfig.features.agingReport,
    matter_profitability: tierConfig.features.matterProfitability,
    custom_reports: tierConfig.features.customReports,
    team_collaboration: tierConfig.features.teamCollaboration,
    api_access: tierConfig.features.apiAccess
  };

  return featureMap[feature] ?? false;
};
