/**
 * Billing Preferences Hook
 * 
 * Hook for managing advocate billing preferences.
 * Uses the reusable useDataFetch pattern for consistency.
 */

import { useCallback } from 'react';
import { useDataFetch } from './useDataFetch';
import { useLoadingState } from './useLoadingState';
import { billingPreferencesService } from '../services/api/billing-preferences.service';
import { useAuth } from '../contexts/AuthContext';
import type { 
  AdvocateBillingPreferences, 
  UpdateBillingPreferences,
  PrimaryWorkflow 
} from '../types/billing.types';

export interface UseBillingPreferencesReturn {
  /**
   * Current billing preferences (null if loading or error)
   */
  preferences: AdvocateBillingPreferences | null;
  
  /**
   * Loading state for initial fetch
   */
  isLoading: boolean;
  
  /**
   * Error state (null if no error)
   */
  error: Error | null;
  
  /**
   * Whether preferences are being updated
   */
  isUpdating: boolean;
  
  /**
   * Update error (separate from fetch error)
   */
  updateError: Error | null;
  
  /**
   * Update billing preferences
   */
  updatePreferences: (updates: UpdateBillingPreferences) => Promise<void>;
  
  /**
   * Set primary workflow (used during onboarding)
   */
  setPrimaryWorkflow: (workflow: PrimaryWorkflow) => Promise<void>;
  
  /**
   * Refetch preferences from server
   */
  refetch: () => Promise<void>;
  
  /**
   * Whether advocate has completed billing setup
   */
  hasCompletedSetup: boolean;
  
  /**
   * Clear any errors
   */
  clearErrors: () => void;
}

/**
 * Hook for managing advocate billing preferences
 * 
 * Features:
 * - Automatic loading of preferences on mount
 * - Caching with automatic refresh
 * - Optimistic updates for better UX
 * - Error handling with toast notifications
 * - Loading states for all operations
 * 
 * @returns Billing preferences state and actions
 */
export function useBillingPreferences(): UseBillingPreferencesReturn {
  const { user } = useAuth();
  const advocateId = user?.id;

  // Fetch preferences using reusable data fetch hook
  const {
    data: preferences,
    isLoading,
    error,
    refetch,
    setData: setPreferences,
    clearError,
  } = useDataFetch(
    `billing-preferences-${advocateId}`,
    () => {
      if (!advocateId) throw new Error('No advocate ID available');
      return billingPreferencesService.getBillingPreferencesWithCache(advocateId);
    },
    {
      enabled: !!advocateId,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Failed to fetch billing preferences:', error);
      },
    }
  );

  // Update preferences with loading state
  const {
    isLoading: isUpdating,
    error: updateError,
    execute: executeUpdate,
    reset: resetUpdateState,
  } = useLoadingState({
    onSuccess: () => {
      // Clear cache to ensure fresh data on next fetch
      if (advocateId) {
        billingPreferencesService.clearCache(advocateId);
      }
    },
    onError: (error) => {
      console.error('Failed to update billing preferences:', error);
    },
  });

  // Update preferences function
  const updatePreferences = useCallback(async (updates: UpdateBillingPreferences) => {
    if (!advocateId) {
      throw new Error('No advocate ID available');
    }

    await executeUpdate(async () => {
      // Optimistic update
      if (preferences) {
        const optimisticUpdate = { ...preferences, ...updates };
        setPreferences(optimisticUpdate);
      }

      try {
        const updatedPreferences = await billingPreferencesService.updateBillingPreferences(
          advocateId,
          updates
        );
        
        // Update with actual server response
        setPreferences(updatedPreferences);
      } catch (error) {
        // Revert optimistic update on error
        if (preferences) {
          setPreferences(preferences);
        }
        throw error;
      }
    });
  }, [advocateId, preferences, executeUpdate, setPreferences]);

  // Set primary workflow function
  const setPrimaryWorkflow = useCallback(async (workflow: PrimaryWorkflow) => {
    if (!advocateId) {
      throw new Error('No advocate ID available');
    }

    await executeUpdate(async () => {
      const updatedPreferences = await billingPreferencesService.setPrimaryWorkflow(
        advocateId,
        workflow
      );
      
      setPreferences(updatedPreferences);
    });
  }, [advocateId, executeUpdate, setPreferences]);

  // Check if setup is completed
  const hasCompletedSetup = preferences?.primary_workflow !== null && preferences?.primary_workflow !== undefined;

  // Clear all errors
  const clearErrors = useCallback(() => {
    clearError();
    resetUpdateState();
  }, [clearError, resetUpdateState]);

  return {
    preferences,
    isLoading,
    error,
    isUpdating,
    updateError,
    updatePreferences,
    setPrimaryWorkflow,
    refetch,
    hasCompletedSetup,
    clearErrors,
  };
}

/**
 * Hook for getting billing preferences in read-only mode
 * Useful for components that only need to read preferences without updating
 * 
 * @returns Read-only billing preferences
 */
export function useBillingPreferencesReadOnly() {
  const { user } = useAuth();
  const advocateId = user?.id;

  const { data: preferences, isLoading, error } = useDataFetch(
    `billing-preferences-readonly-${advocateId}`,
    () => {
      if (!advocateId) throw new Error('No advocate ID available');
      return billingPreferencesService.getBillingPreferencesWithCache(advocateId);
    },
    {
      enabled: !!advocateId,
      cacheDuration: 10 * 60 * 1000, // 10 minutes for read-only
    }
  );

  return {
    preferences,
    isLoading,
    error,
    hasCompletedSetup: preferences?.primary_workflow !== null && preferences?.primary_workflow !== undefined,
  };
}

/**
 * Hook for checking if billing setup is complete
 * Lightweight hook for conditional rendering
 * 
 * @returns Whether billing setup is complete
 */
export function useHasBillingSetup(): boolean {
  const { preferences } = useBillingPreferencesReadOnly();
  return preferences?.primary_workflow !== null && preferences?.primary_workflow !== undefined;
}