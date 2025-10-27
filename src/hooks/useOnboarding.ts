/**
 * Onboarding Hook
 * 
 * Manages onboarding state and determines when to show onboarding flow.
 * Uses reusable patterns for consistency.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBillingPreferences } from './useBillingPreferences';

export interface UseOnboardingReturn {
  /**
   * Whether to show the onboarding flow
   */
  shouldShowOnboarding: boolean;
  
  /**
   * Whether onboarding is currently open
   */
  isOnboardingOpen: boolean;
  
  /**
   * Open the onboarding flow
   */
  openOnboarding: () => void;
  
  /**
   * Close the onboarding flow
   */
  closeOnboarding: () => void;
  
  /**
   * Mark onboarding as completed
   */
  completeOnboarding: () => void;
  
  /**
   * Whether the user has completed onboarding
   */
  hasCompletedOnboarding: boolean;
  
  /**
   * Reset onboarding state (for testing/admin)
   */
  resetOnboarding: () => void;
}



/**
 * Hook for checking onboarding completion status only
 * Lightweight version for components that just need to know completion status
 * 
 * @returns Whether onboarding has been completed
 */
export function useHasCompletedOnboarding(): boolean {
  const { user } = useAuth();
  const { hasCompletedSetup } = useBillingPreferences();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const storageKey = `onboarding-completed-${user.id}`;
      const completed = localStorage.getItem(storageKey) === 'true';
      setHasCompletedOnboarding(completed);
    }
  }, [user?.id]);

  return hasCompletedOnboarding || hasCompletedSetup;
}

// Create a context for sharing onboarding state
const OnboardingContext = createContext<UseOnboardingReturn | null>(null);

// Export the context so the provider can use it
export { OnboardingContext };

// Main hook implementation
export function useOnboardingState(): UseOnboardingReturn {
  const { user } = useAuth();
  const { hasCompletedSetup } = useBillingPreferences();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if user should see onboarding
  const shouldShowOnboarding = !!(
    user && 
    !hasCompletedOnboarding && 
    !hasCompletedSetup
  );

  // Load onboarding completion state from localStorage
  useEffect(() => {
    if (user?.id) {
      const storageKey = `onboarding-completed-${user.id}`;
      const completed = localStorage.getItem(storageKey) === 'true';
      setHasCompletedOnboarding(completed);
    }
  }, [user?.id]);

  // Auto-open onboarding for new users (but respect dismissal)
  useEffect(() => {
    if (shouldShowOnboarding && !isOnboardingOpen && user?.id) {
      // Check if user previously dismissed to explore
      const dismissKey = `onboarding-dismissed-${user.id}`;
      const wasDismissed = localStorage.getItem(dismissKey) === 'true';
      
      // Don't auto-open if user dismissed it to explore
      if (!wasDismissed) {
        // Small delay to ensure the app has loaded
        const timer = setTimeout(() => {
          setIsOnboardingOpen(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [shouldShowOnboarding, isOnboardingOpen, user?.id]);

  // Open onboarding manually
  const openOnboarding = useCallback(() => {
    setIsOnboardingOpen(true);
  }, []);

  // Close onboarding
  const closeOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
    
    // Remember that user dismissed onboarding to explore
    if (user?.id) {
      const dismissKey = `onboarding-dismissed-${user.id}`;
      localStorage.setItem(dismissKey, 'true');
    }
  }, [user?.id]);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    if (user?.id) {
      const storageKey = `onboarding-completed-${user.id}`;
      localStorage.setItem(storageKey, 'true');
      setHasCompletedOnboarding(true);
      setIsOnboardingOpen(false);
      
      // Also clear dismissal flag
      const dismissKey = `onboarding-dismissed-${user.id}`;
      localStorage.removeItem(dismissKey);
    }
  }, [user?.id]);

  // Reset onboarding (for testing/admin)
  const resetOnboarding = useCallback(() => {
    if (user?.id) {
      const storageKey = `onboarding-completed-${user.id}`;
      const dismissKey = `onboarding-dismissed-${user.id}`;
      localStorage.removeItem(storageKey);
      localStorage.removeItem(dismissKey);
      setHasCompletedOnboarding(false);
    }
  }, [user?.id]);

  return {
    shouldShowOnboarding,
    isOnboardingOpen,
    openOnboarding,
    closeOnboarding,
    completeOnboarding,
    hasCompletedOnboarding,
    resetOnboarding,
  };
}

// Export the hook that uses context
export function useOnboarding(): UseOnboardingReturn {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingContextProvider');
  }
  return context;
}