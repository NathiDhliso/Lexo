/**
 * Subscription Tier Configuration
 * Defines the three subscription tiers for LexoHub
 */

import { SubscriptionTier, type SubscriptionTierConfig } from '../types/subscription.types';

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierConfig> = {
  [SubscriptionTier.ADMISSION]: {
    id: SubscriptionTier.ADMISSION,
    name: 'Admission',
    description: 'Ideal for recently admitted advocates and solo practitioners getting started',
    monthlyPrice: 0, // R0
    features: {
      maxActiveMatters: 10,
      maxUsers: 1,
      additionalUserPrice: 0,
      timeTracking: true,
      invoicing: true,
      basicReporting: true,
      matterPipeline: false,
      clientRevenue: false,
      agingReport: false,
      matterProfitability: false,
      customReports: false,
      teamCollaboration: false,
      mobileAccess: true,
      prioritySupport: 'email',
      apiAccess: false
    },
    limitations: [
      'Maximum 10 active matters',
      'Single user account',
      'Basic reporting only',
      'No custom reports',
      'Email support only'
    ]
  },

  [SubscriptionTier.ADVOCATE]: {
    id: SubscriptionTier.ADVOCATE,
    name: 'Advocate (Pro)',
    description: 'Established solo advocates and small chambers with 10-50 active matters',
    monthlyPrice: 29900, // R299
    features: {
      maxActiveMatters: 50,
      maxUsers: 1,
      additionalUserPrice: 14900, // R149 per additional user
      timeTracking: true,
      invoicing: true,
      basicReporting: true,
      matterPipeline: true,
      clientRevenue: true,
      agingReport: true,
      matterProfitability: false,
      customReports: false,
      teamCollaboration: false,
      mobileAccess: true,
      prioritySupport: 'email',
      apiAccess: false
    }
  },

  [SubscriptionTier.SENIOR_COUNSEL]: {
    id: SubscriptionTier.SENIOR_COUNSEL,
    name: 'Senior Counsel (Enterprise)',
    description: 'Large chambers and partnerships with 50+ matters and multiple advocates',
    monthlyPrice: 79900, // R799
    features: {
      maxActiveMatters: null, // unlimited
      maxUsers: 5,
      additionalUserPrice: 9900, // R99 per additional user
      timeTracking: true,
      invoicing: true,
      basicReporting: true,
      matterPipeline: true,
      clientRevenue: true,
      agingReport: true,
      matterProfitability: true,
      customReports: true,
      teamCollaboration: true,
      mobileAccess: true,
      prioritySupport: 'phone_email',
      apiAccess: true
    }
  }
};

export const formatPrice = (priceInCents: number): string => {
  return `R${(priceInCents / 100).toFixed(2)}`;
};

export const calculateSubscriptionPrice = (
  tier: SubscriptionTier,
  additionalUsers: number = 0
): number => {
  const config = SUBSCRIPTION_TIERS[tier];
  const basePrice = config.monthlyPrice;
  const additionalUsersCost = additionalUsers * config.features.additionalUserPrice;
  return basePrice + additionalUsersCost;
};
