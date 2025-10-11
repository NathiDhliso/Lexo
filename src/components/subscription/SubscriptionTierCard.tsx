/**
 * Subscription Tier Card Component
 */

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';
import type { SubscriptionTierConfig } from '../../types/subscription.types';
import { formatPrice } from '../../config/subscription-tiers.config';

interface SubscriptionTierCardProps {
  tier: SubscriptionTierConfig;
  currentTier?: string;
  onSelect: () => void;
  isLoading?: boolean;
}

export const SubscriptionTierCard: React.FC<SubscriptionTierCardProps> = ({
  tier,
  currentTier,
  onSelect,
  isLoading
}) => {
  const isCurrent = currentTier === tier.id;
  const isFree = tier.monthlyPrice === 0;

  return (
    <div className={`
      rounded-lg border-2 p-6 transition-all
      ${isCurrent ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}
    `}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
        <p className="mt-2 text-sm text-gray-600">{tier.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(tier.monthlyPrice)}
          </span>
          {!isFree && <span className="ml-2 text-gray-600">/month</span>}
        </div>
        {tier.features.additionalUserPrice > 0 && (
          <p className="mt-1 text-sm text-gray-600">
            + {formatPrice(tier.features.additionalUserPrice)} per additional user
          </p>
        )}
      </div>

      <ul className="mb-6 space-y-3">
        <li className="flex items-start">
          <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
          <span className="text-sm text-gray-700">
            {tier.features.maxActiveMatters 
              ? `Up to ${tier.features.maxActiveMatters} active matters`
              : 'Unlimited active matters'}
          </span>
        </li>
        <li className="flex items-start">
          <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
          <span className="text-sm text-gray-700">
            {tier.features.maxUsers} user{tier.features.maxUsers > 1 ? 's' : ''} included
          </span>
        </li>
        {tier.features.timeTracking && (
          <li className="flex items-start">
            <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
            <span className="text-sm text-gray-700">Time tracking</span>
          </li>
        )}
        {tier.features.invoicing && (
          <li className="flex items-start">
            <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
            <span className="text-sm text-gray-700">Invoicing & billing</span>
          </li>
        )}
        {tier.features.matterPipeline && (
          <li className="flex items-start">
            <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
            <span className="text-sm text-gray-700">Matter pipeline</span>
          </li>
        )}
        {tier.features.matterProfitability && (
          <li className="flex items-start">
            <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
            <span className="text-sm text-gray-700">Matter profitability analysis</span>
          </li>
        )}
        {tier.features.teamCollaboration && (
          <li className="flex items-start">
            <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
            <span className="text-sm text-gray-700">Team collaboration</span>
          </li>
        )}
        <li className="flex items-start">
          <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
          <span className="text-sm text-gray-700">
            {tier.features.prioritySupport === 'phone_email' 
              ? 'Priority phone & email support'
              : 'Email support'}
          </span>
        </li>
      </ul>

      <Button
        onClick={onSelect}
        disabled={isCurrent || isLoading}
        variant={isCurrent ? 'secondary' : 'primary'}
        className="w-full"
      >
        {isCurrent ? 'Current Plan' : isFree ? 'Get Started' : 'Upgrade'}
      </Button>
    </div>
  );
};
