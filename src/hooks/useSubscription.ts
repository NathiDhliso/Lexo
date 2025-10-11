/**
 * Subscription Hook
 * Custom hook for managing subscription state and operations
 */

import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/api/subscription.service';
import type { Subscription, UsageMetrics } from '../types/subscription.types';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load subscription'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsage = async () => {
    try {
      const data = await subscriptionService.getUsageMetrics();
      setUsage(data);
    } catch (err) {
      console.error('Failed to load usage metrics:', err);
    }
  };

  const canPerformAction = async (action: string): Promise<boolean> => {
    try {
      return await subscriptionService.canPerformAction(action);
    } catch (err) {
      console.error('Failed to check action permission:', err);
      return false;
    }
  };

  useEffect(() => {
    loadSubscription();
    loadUsage();
  }, []);

  return {
    subscription,
    usage,
    isLoading,
    error,
    reload: () => {
      loadSubscription();
      loadUsage();
    },
    canPerformAction
  };
};
