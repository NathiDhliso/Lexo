/**
 * Billing Preferences API Service
 * 
 * Service for managing advocate billing preferences.
 * Uses reusable patterns from the codebase for consistency.
 */

import { supabase } from '../../lib/supabase';
import { AppError } from '../../utils/error-handling.utils';
import type { 
  AdvocateBillingPreferences, 
  UpdateBillingPreferences,
  BillingModel,
  PrimaryWorkflow 
} from '../../types/billing.types';

export class BillingPreferencesService {
  // In-flight requests map for deduplication
  private static inflightRequests = new Map<string, Promise<AdvocateBillingPreferences>>();
  
  /**
   * Get billing preferences for an advocate
   */
  async getBillingPreferences(advocateId: string): Promise<AdvocateBillingPreferences> {
    // Check if there's already an in-flight request for this advocate
    const inflightRequest = BillingPreferencesService.inflightRequests.get(advocateId);
    if (inflightRequest) {
      console.log(`[BillingPreferences] Reusing in-flight request for advocate ${advocateId}`);
      return inflightRequest;
    }

    // Create new request
    const requestPromise = this.fetchBillingPreferencesFromDB(advocateId);
    
    // Store in-flight request
    BillingPreferencesService.inflightRequests.set(advocateId, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up in-flight request after completion
      BillingPreferencesService.inflightRequests.delete(advocateId);
    }
  }

  /**
   * Internal method to fetch from database
   */
  private async fetchBillingPreferencesFromDB(advocateId: string): Promise<AdvocateBillingPreferences> {
    try {
      const { data, error } = await supabase
        .from('advocate_billing_preferences')
        .select('*')
        .eq('advocate_id', advocateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create default ones
          return await this.createDefaultPreferences(advocateId);
        }
        if (error.code === '42P01' || error.message.includes('table') || error.message.includes('schema cache')) {
          // Table doesn't exist, return default preferences without trying to create
          console.warn('advocate_billing_preferences table not found, using default preferences');
          return this.getDefaultPreferences(advocateId);
        }
        if (error.code === 'PGRST301' || error.message.includes('permission denied') || error.message.includes('403')) {
          // Permission denied (RLS policy issue), return default preferences
          console.warn('advocate_billing_preferences permission denied (RLS policy issue), using default preferences');
          return this.getDefaultPreferences(advocateId);
        }
        throw new AppError(
          `Failed to fetch billing preferences: ${error.message}`,
          'BILLING_PREFERENCES_FETCH_ERROR',
          500,
          { advocateId, error }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      // If it's a table not found error, return defaults
      if (error instanceof Error && (error.message.includes('table') || error.message.includes('schema cache'))) {
        console.warn('advocate_billing_preferences table not found, using default preferences');
        return this.getDefaultPreferences(advocateId);
      }
      
      throw new AppError(
        'Failed to fetch billing preferences',
        'BILLING_PREFERENCES_FETCH_ERROR',
        500,
        { advocateId, error }
      );
    }
  }

  /**
   * Get default billing preferences (fallback when table doesn't exist)
   */
  private getDefaultPreferences(advocateId: string): AdvocateBillingPreferences {
    return {
      id: `default-${advocateId}`,
      advocate_id: advocateId,
      default_billing_model: 'brief-fee' as BillingModel,
      primary_workflow: 'brief-fee' as PrimaryWorkflow,
      dashboard_widgets: ['active-matters', 'pending-invoices', 'recent-activity'],
      show_time_tracking_by_default: false,
      auto_create_milestones: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Update billing preferences for an advocate
   */
  async updateBillingPreferences(
    advocateId: string, 
    updates: UpdateBillingPreferences
  ): Promise<AdvocateBillingPreferences> {
    try {
      const { data, error } = await supabase
        .from('advocate_billing_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('advocate_id', advocateId)
        .select()
        .single();

      if (error) {
        // If table doesn't exist, return default preferences with updates applied
        if (error.code === '42P01' || error.message.includes('table') || error.message.includes('schema cache')) {
          console.warn('advocate_billing_preferences table not found, using default preferences');
          const defaults = this.getDefaultPreferences(advocateId);
          return { ...defaults, ...updates };
        }
        throw new AppError(
          `Failed to update billing preferences: ${error.message}`,
          'BILLING_PREFERENCES_UPDATE_ERROR',
          500,
          { advocateId, updates, error }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      // If it's a table not found error, return defaults with updates applied
      if (error instanceof Error && (error.message.includes('table') || error.message.includes('schema cache'))) {
        console.warn('advocate_billing_preferences table not found, using default preferences');
        const defaults = this.getDefaultPreferences(advocateId);
        return { ...defaults, ...updates };
      }
      
      throw new AppError(
        'Failed to update billing preferences',
        'BILLING_PREFERENCES_UPDATE_ERROR',
        500,
        { advocateId, updates, error }
      );
    }
  }

  /**
   * Create default billing preferences for a new advocate
   */
  async createDefaultPreferences(advocateId: string): Promise<AdvocateBillingPreferences> {
    try {
      const defaultPreferences = {
        advocate_id: advocateId,
        default_billing_model: 'brief-fee' as BillingModel,
        primary_workflow: 'brief-fee' as PrimaryWorkflow,
        dashboard_widgets: ['active-matters', 'pending-invoices', 'recent-activity'],
        show_time_tracking_by_default: false,
        auto_create_milestones: true,
      };

      const { data, error } = await supabase
        .from('advocate_billing_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (error) {
        // If table doesn't exist, return default preferences
        if (error.code === '42P01' || error.message.includes('table') || error.message.includes('schema cache')) {
          console.warn('advocate_billing_preferences table not found, using default preferences');
          return this.getDefaultPreferences(advocateId);
        }
        throw new AppError(
          `Failed to create default billing preferences: ${error.message}`,
          'BILLING_PREFERENCES_CREATE_ERROR',
          500,
          { advocateId, error }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      // If it's a table not found error, return defaults
      if (error instanceof Error && (error.message.includes('table') || error.message.includes('schema cache'))) {
        console.warn('advocate_billing_preferences table not found, using default preferences');
        return this.getDefaultPreferences(advocateId);
      }
      
      throw new AppError(
        'Failed to create default billing preferences',
        'BILLING_PREFERENCES_CREATE_ERROR',
        500,
        { advocateId, error }
      );
    }
  }

  /**
   * Set primary workflow preference (used during onboarding)
   */
  async setPrimaryWorkflow(
    advocateId: string, 
    workflow: PrimaryWorkflow
  ): Promise<AdvocateBillingPreferences> {
    try {
      // Determine default billing model and settings based on workflow
      const workflowSettings = this.getWorkflowSettings(workflow);
      
      const updates: UpdateBillingPreferences = {
        primary_workflow: workflow,
        default_billing_model: workflowSettings.defaultBillingModel,
        show_time_tracking_by_default: workflowSettings.showTimeTracking,
        dashboard_widgets: workflowSettings.dashboardWidgets,
      };

      return await this.updateBillingPreferences(advocateId, updates);
    } catch (error) {
      throw new AppError(
        'Failed to set primary workflow',
        'BILLING_PREFERENCES_WORKFLOW_ERROR',
        500,
        { advocateId, workflow, error }
      );
    }
  }

  /**
   * Get workflow-specific settings
   */
  private getWorkflowSettings(workflow: PrimaryWorkflow) {
    switch (workflow) {
      case 'brief-fee':
        return {
          defaultBillingModel: 'brief-fee' as BillingModel,
          showTimeTracking: false,
          dashboardWidgets: [
            'active-matters',
            'pending-invoices', 
            'fee-milestones',
            'recent-activity'
          ],
        };
      
      case 'time-based':
        return {
          defaultBillingModel: 'time-based' as BillingModel,
          showTimeTracking: true,
          dashboardWidgets: [
            'active-matters',
            'time-tracking',
            'wip-tracker',
            'pending-invoices',
            'recent-activity'
          ],
        };
      
      case 'mixed':
      default:
        return {
          defaultBillingModel: 'brief-fee' as BillingModel,
          showTimeTracking: true,
          dashboardWidgets: [
            'active-matters',
            'pending-invoices',
            'time-tracking',
            'fee-milestones',
            'recent-activity'
          ],
        };
    }
  }

  /**
   * Check if advocate has completed billing preference setup
   */
  async hasCompletedBillingSetup(advocateId: string): Promise<boolean> {
    try {
      const preferences = await this.getBillingPreferences(advocateId);
      
      // Consider setup complete if they have a primary workflow set
      return preferences.primary_workflow !== null;
    } catch (_error) {
      // If we can't fetch preferences, assume setup is not complete
      return false;
    }
  }

  /**
   * Get billing preferences with caching
   * Uses a simple in-memory cache for performance
   */
  private static cache = new Map<string, { data: AdvocateBillingPreferences; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getBillingPreferencesWithCache(advocateId: string): Promise<AdvocateBillingPreferences> {
    const cached = BillingPreferencesService.cache.get(advocateId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < BillingPreferencesService.CACHE_DURATION) {
      console.log(`[BillingPreferences] Using cached data for advocate ${advocateId}`);
      return cached.data;
    }
    
    console.log(`[BillingPreferences] Fetching fresh data for advocate ${advocateId}`);
    const preferences = await this.getBillingPreferences(advocateId);
    
    BillingPreferencesService.cache.set(advocateId, {
      data: preferences,
      timestamp: now,
    });
    
    return preferences;
  }

  /**
   * Clear cache for specific advocate
   */
  clearCache(advocateId: string): void {
    BillingPreferencesService.cache.delete(advocateId);
  }

  /**
   * Clear all cache
   */
  static clearAllCache(): void {
    BillingPreferencesService.cache.clear();
  }
}

// Export singleton instance
export const billingPreferencesService = new BillingPreferencesService();