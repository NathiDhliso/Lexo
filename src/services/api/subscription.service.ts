/**
 * Subscription Service
 * Handles subscription management and tier operations
 */

import { supabase } from '../../lib/supabase';
import type {
  Subscription,
  SubscriptionTier,
  SubscriptionUpgradeRequest,
  UsageMetrics
} from '../../types/subscription.types';

class SubscriptionApiService {
  private supabase = supabase;

  private handleError(error: any): never {
    console.error('Subscription API Error:', error);
    throw new Error(error.message || 'An error occurred');
  }
  /**
   * Get current user's subscription
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', (await this.supabase.auth.getUser()).data.user?.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw this.handleError(error);
    }

    return data;
  }

  /**
   * Create a new subscription (typically for Admission tier)
   */
  async createSubscription(tier: SubscriptionTier): Promise<Subscription> {
    const user = (await this.supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        tier,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        additional_users: 0
      })
      .select()
      .single();

    if (error) throw this.handleError(error);
    return data;
  }

  /**
   * Upgrade subscription to a new tier
   */
  async upgradeSubscription(request: SubscriptionUpgradeRequest): Promise<Subscription> {
    const user = (await this.supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        tier: request.new_tier,
        additional_users: request.additional_users || 0,
        payment_gateway: request.payment_gateway,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return data;
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(): Promise<Subscription> {
    const user = (await this.supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return data;
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(): Promise<Subscription> {
    const user = (await this.supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return data;
  }

  /**
   * Get usage metrics for current subscription
   */
  async getUsageMetrics(): Promise<UsageMetrics> {
    const user = (await this.supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Get active matters count (use advocate_id, not user_id)
    const { count: mattersCount } = await this.supabase
      .from('matters')
      .select('*', { count: 'exact', head: true })
      .eq('advocate_id', user.id)
      .eq('status', 'active');

    // Get team members count (use team_members table, not user_profiles)
    const { count: teamMembersCount } = await this.supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.id)
      .eq('status', 'active');

    return {
      active_matters_count: mattersCount || 0,
      users_count: (teamMembersCount || 0) + 1, // +1 for the owner
      storage_used_mb: 0, // TODO: Implement storage tracking
      api_calls_count: 0 // TODO: Implement API call tracking
    };
  }

  /**
   * Check if user can perform action based on subscription tier
   */
  async canPerformAction(action: string): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription) return false;

    const metrics = await this.getUsageMetrics();

    // Check matter limits
    if (action === 'create_matter') {
      const { SUBSCRIPTION_TIERS } = await import('../../config/subscription-tiers.config');
      const tierConfig = SUBSCRIPTION_TIERS[subscription.tier];
      
      if (tierConfig.features.maxActiveMatters !== null) {
        return metrics.active_matters_count < tierConfig.features.maxActiveMatters;
      }
    }

    return true;
  }
}

export const subscriptionService = new SubscriptionApiService();
