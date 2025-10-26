/**
 * User Preferences API Service
 * Manages user preferences for the 3-step workflow (Pro Forma → Matter → Invoice)
 */

import { BaseApiService, ApiResponse, ApiError, ErrorType } from './base-api.service';
import { supabase } from '../../lib/supabase';

// Core user preferences for the 3-step workflow only
export interface UserPreferences {
  id: string;
  user_id: string;
  // Notification preferences for core workflow
  notifications: {
    email: boolean;
    proforma_updates: boolean;
    matter_deadlines: boolean;
    invoice_reminders: boolean;
  };
  // Display preferences
  display: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
  // Workflow preferences
  workflow: {
    default_proforma_validity_days: number;
    auto_convert_accepted_proformas: boolean;
    default_invoice_payment_terms: number;
  };
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesUpdate {
  notifications?: {
    email?: boolean;
    proforma_updates?: boolean;
    matter_deadlines?: boolean;
    invoice_reminders?: boolean;
  };
  display?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };
  workflow?: {
    default_proforma_validity_days?: number;
    auto_convert_accepted_proformas?: boolean;
    default_invoice_payment_terms?: number;
  };
}

class UserPreferencesService extends BaseApiService<UserPreferences> {
  // When the preferences table is missing in the Supabase project (404/PGRST205),
  // set this flag to avoid repeated noisy requests and gracefully fall back.
  private schemaUnavailable = false;

  constructor() {
    super('user_preferences', `
      id,
      user_id,
      notifications,
      display,
      workflow,
      created_at,
      updated_at
    `);
  }

  /**
   * Get user preferences by user ID
   */
  async getByUserId(userId: string): Promise<ApiResponse<UserPreferences>> {
    // If we already detected the table is unavailable, return a benign response
    if (this.schemaUnavailable) {
      return { data: null, error: null };
    }

    const result = await this.executeQuery(async () => {
      return supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq('user_id', userId)
        .maybeSingle();
    });

    // Suppress errors when the table doesn't exist on the remote project
    if (result.error && (result.error.code === 'PGRST205' ||
      (result.error.message?.toLowerCase?.().includes('not found') ?? false))) {
      this.schemaUnavailable = true;
      return { data: null, error: null };
    }

    return result as ApiResponse<UserPreferences>;
  }

  /**
   * Get current user's preferences
   */
  async getCurrentUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    // If we already detected the table is unavailable, return a benign response
    if (this.schemaUnavailable) {
      return { data: null, error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return a standardized error via BaseApiService to keep contracts consistent
      return { 
        data: null, 
        error: {
          type: ErrorType.AUTHENTICATION_ERROR,
          message: 'User not authenticated',
          timestamp: new Date(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2)}`
        }
      };
    }

    const result = await this.executeQuery(async () => {
      return supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq('user_id', user.id)
        .maybeSingle();
    });

    // Suppress errors when the table doesn't exist on the remote project
    if (result.error && (result.error.code === 'PGRST205' ||
      (result.error.message?.toLowerCase?.().includes('not found') ?? false))) {
      this.schemaUnavailable = true;
      return { data: null, error: null };
    }

    return result as ApiResponse<UserPreferences>;
  }

  /**
   * Create or update user preferences (upsert)
   */
  async upsertUserPreferences(
    userId: string, 
    preferences: UserPreferencesUpdate
  ): Promise<ApiResponse<UserPreferences>> {
    return this.executeQuery(async () => {
      // First try to get existing preferences
      const existing = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing.data) {
        // Update existing preferences
        const updatedData = {
          notifications: {
            ...existing.data.notifications,
            ...preferences.notifications
          },
          display: {
            ...existing.data.display,
            ...preferences.display
          },
          workflow: {
            ...existing.data.workflow,
            ...preferences.workflow
          }
        };

        return supabase
          .from(this.tableName)
          .update(updatedData)
          .eq('user_id', userId)
          .select(this.selectFields)
          .single();
      } else {
        // Create new preferences
        const newData = {
          user_id: userId,
          notifications: {
            email: true,
            proforma_updates: true,
            matter_deadlines: true,
            invoice_reminders: true,
            ...preferences.notifications
          },
          display: {
            theme: 'system' as const,
            language: 'en',
            timezone: 'UTC',
            ...preferences.display
          },
          workflow: {
            default_proforma_validity_days: 30,
            auto_convert_accepted_proformas: false,
            default_invoice_payment_terms: 30,
            ...preferences.workflow
          }
        };

        return supabase
          .from(this.tableName)
          .insert(newData)
          .select(this.selectFields)
          .single();
      }
    });
  }

  /**
   * Update current user's preferences
   */
  async updateCurrentUserPreferences(
    preferences: UserPreferencesUpdate
  ): Promise<ApiResponse<UserPreferences>> {
    return this.executeQuery(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      return this.upsertUserPreferences(user.id, preferences);
    });
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    notifications: UserPreferencesUpdate['notifications']
  ): Promise<ApiResponse<UserPreferences>> {
    const preferences: UserPreferencesUpdate = {
      notifications
    };

    return this.updateCurrentUserPreferences(preferences);
  }

  /**
   * Update display preferences
   */
  async updateDisplayPreferences(
    display: UserPreferencesUpdate['display']
  ): Promise<ApiResponse<UserPreferences>> {
    const preferences: UserPreferencesUpdate = {
      display
    };

    return this.updateCurrentUserPreferences(preferences);
  }

  /**
   * Update workflow preferences
   */
  async updateWorkflowPreferences(
    workflow: UserPreferencesUpdate['workflow']
  ): Promise<ApiResponse<UserPreferences>> {
    const preferences: UserPreferencesUpdate = {
      workflow
    };

    return this.updateCurrentUserPreferences(preferences);
  }

  /**
   * Initialize preferences for a new user
   */
  async initializeForNewUser(userId: string): Promise<ApiResponse<UserPreferences>> {
    const defaultPreferences: UserPreferencesUpdate = {
      notifications: {
        email: true,
        proforma_updates: true,
        matter_deadlines: true,
        invoice_reminders: true
      },
      display: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC'
      },
      workflow: {
        default_proforma_validity_days: 30,
        auto_convert_accepted_proformas: false,
        default_invoice_payment_terms: 30
      }
    };

    return this.upsertUserPreferences(userId, defaultPreferences);
  }

  /**
   * Reset user preferences to defaults
   */
  async resetToDefaults(): Promise<ApiResponse<UserPreferences>> {
    const defaultPreferences: UserPreferencesUpdate = {
      notifications: {
        email: true,
        proforma_updates: true,
        matter_deadlines: true,
        invoice_reminders: true
      },
      display: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC'
      },
      workflow: {
        default_proforma_validity_days: 30,
        auto_convert_accepted_proformas: false,
        default_invoice_payment_terms: 30
      }
    };

    return this.updateCurrentUserPreferences(defaultPreferences);
  }

  /**
   * Bulk update preferences for multiple users (admin function)
   */
  async bulkUpdatePreferences(
    updates: { userId: string; preferences: UserPreferencesUpdate }[]
  ): Promise<ApiResponse<UserPreferences[]>> {
    const requestId = this.generateRequestId();

    try {
      const results: UserPreferences[] = [];
      const errors: Array<{ userId: string; error: ApiError }> = [];

      // Execute updates in parallel
      const promises = updates.map(async ({ userId, preferences }) => {
        const response = await this.upsertUserPreferences(userId, preferences);
        if (response.error) {
          errors.push({ userId, error: response.error });
        } else if (response.data) {
          results.push(response.data);
        }
      });

      await Promise.all(promises);

      if (errors.length > 0) {
        return {
          data: null,
          error: {
            type: ErrorType.DATABASE_ERROR,
            message: `${errors.length} preference updates failed`,
            details: { errors },
            timestamp: new Date(),
            requestId
          }
        };
      }

      return { data: results, error: null };
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, requestId)
      };
    }
  }

  /**
   * Check if a feature notification should be shown
   */
  async shouldShowFeatureNotification(featureId: string): Promise<ApiResponse<boolean>> {
    try {
      const storageKey = `feature_notification_${featureId}`;
      const dismissed = localStorage.getItem(storageKey);
      return {
        data: dismissed !== 'true',
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, this.generateRequestId())
      };
    }
  }

  /**
   * Dismiss a feature notification
   */
  async dismissNotification(featureId: string): Promise<ApiResponse<void>> {
    try {
      const storageKey = `feature_notification_${featureId}`;
      localStorage.setItem(storageKey, 'true');
      return {
        data: undefined as any,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, this.generateRequestId())
      };
    }
  }

  /**
   * Mark a notification as shown
   */
  async markNotificationShown(featureId: string): Promise<ApiResponse<void>> {
    try {
      const storageKey = `feature_notification_shown_${featureId}`;
      localStorage.setItem(storageKey, 'true');
      return {
        data: undefined as any,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, this.generateRequestId())
      };
    }
  }
}

// Export singleton instance
export const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;
