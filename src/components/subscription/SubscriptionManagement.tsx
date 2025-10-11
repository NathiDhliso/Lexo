/**
 * Subscription Management Component
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { SubscriptionTierCard } from './SubscriptionTierCard';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { toastService } from '../../services/toast.service';
import { subscriptionService } from '../../services/api/subscription.service';
import { paymentGatewayService } from '../../services/payment/payment-gateway.service';
import { SUBSCRIPTION_TIERS } from '../../config/subscription-tiers.config';
import { 
  SubscriptionTier, 
  PaymentGateway,
  type Subscription, 
  type UsageMetrics 
} from '../../types/subscription.types';

export const SubscriptionManagement: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const additionalUsers = 0; // Can be made dynamic later

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const [subData, usageData] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getUsageMetrics()
      ]);
      setSubscription(subData);
      setUsage(usageData);
    } catch (error) {
      toastService.error('Failed to load subscription data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTierSelect = (tier: SubscriptionTier) => {
    if (tier === SubscriptionTier.ADMISSION) {
      // Free tier - no payment needed
      handleUpgrade(tier, PaymentGateway.PAYSTACK);
    } else {
      setSelectedTier(tier);
      setShowUpgradeModal(true);
    }
  };

  const handleUpgrade = async (tier: SubscriptionTier, gateway: PaymentGateway) => {
    try {
      setIsLoading(true);

      if (tier === SubscriptionTier.ADMISSION) {
        // Create free subscription
        await subscriptionService.createSubscription(tier);
        toastService.success('Welcome to LexoHub!');
        await loadSubscriptionData();
        return;
      }

      // Initiate payment
      const user = { email: 'user@example.com', name: { first: 'John', last: 'Doe' } }; // Get from auth context
      const result = await paymentGatewayService.initiateSubscriptionPayment({
        tier,
        additionalUsers,
        gateway,
        userEmail: user.email,
        userName: user.name,
        callbackUrl: `${window.location.origin}/subscription/callback`,
        cancelUrl: `${window.location.origin}/subscription`
      });

      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        toastService.error(result.error || 'Failed to initiate payment');
      }
    } catch (error) {
      toastService.error('Failed to upgrade subscription');
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowUpgradeModal(false);
    }
  };

  if (isLoading && !subscription) {
    return <div className="p-8 text-center">Loading subscription data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      {subscription && (
        <div className="rounded-lg border border-neutral-200 dark:border-metallic-gray-700 bg-white dark:bg-metallic-gray-800 p-6">
          <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">Current Subscription</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Plan</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {SUBSCRIPTION_TIERS[subscription.tier].name}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Status</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                {subscription.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Next Billing Date</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>

          {subscription.cancel_at_period_end && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-3 text-yellow-800 dark:text-yellow-300">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">
                Your subscription will be cancelled on {new Date(subscription.current_period_end).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Usage Metrics */}
      {usage && subscription && (
        <div className="rounded-lg border border-neutral-200 dark:border-metallic-gray-700 bg-white dark:bg-metallic-gray-800 p-6">
          <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">Usage</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Matters</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {usage.active_matters_count}
                {SUBSCRIPTION_TIERS[subscription.tier].features.maxActiveMatters && 
                  ` / ${SUBSCRIPTION_TIERS[subscription.tier].features.maxActiveMatters}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Users</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {usage.users_count} / {SUBSCRIPTION_TIERS[subscription.tier].features.maxUsers + subscription.additional_users}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.values(SUBSCRIPTION_TIERS).map((tier) => (
            <SubscriptionTierCard
              key={tier.id}
              tier={tier}
              currentTier={subscription?.tier}
              onSelect={() => handleTierSelect(tier.id)}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade Subscription"
      >
        <div className="space-y-6">
          {selectedTier && (
            <>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {SUBSCRIPTION_TIERS[selectedTier].name}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {SUBSCRIPTION_TIERS[selectedTier].description}
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Select Payment Method
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedGateway(PaymentGateway.PAYSTACK)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                      selectedGateway === PaymentGateway.PAYSTACK
                        ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                        : 'border-neutral-200 dark:border-metallic-gray-600 hover:border-mpondo-gold-300 dark:hover:border-mpondo-gold-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">Paystack</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Card, bank transfer, mobile money</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedGateway(PaymentGateway.PAYFAST)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                      selectedGateway === PaymentGateway.PAYFAST
                        ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                        : 'border-neutral-200 dark:border-metallic-gray-600 hover:border-mpondo-gold-300 dark:hover:border-mpondo-gold-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇿🇦</span>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">PayFast</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">South African payment gateway</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedGateway && handleUpgrade(selectedTier, selectedGateway)}
                  disabled={!selectedGateway || isLoading}
                  className="flex-1"
                >
                  Proceed to Payment
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
