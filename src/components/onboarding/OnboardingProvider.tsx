/**
 * OnboardingProvider Component
 * 
 * Provides onboarding functionality throughout the app.
 * Automatically shows onboarding for new users.
 */

import React from 'react';
import { OnboardingChecklist } from './OnboardingChecklist';
import { OnboardingContext, useOnboardingState, useOnboarding } from '../../hooks/useOnboarding';

export interface OnboardingProviderProps {
  children: React.ReactNode;
}

/**
 * Internal component that renders the onboarding UI
 */
const OnboardingUI: React.FC = () => {
  const {
    isOnboardingOpen,
    closeOnboarding,
    completeOnboarding,
  } = useOnboarding();

  return (
    <OnboardingChecklist
      isOpen={isOnboardingOpen}
      onClose={closeOnboarding}
      onComplete={completeOnboarding}
    />
  );
};

/**
 * Provider component that manages onboarding flow
 * 
 * Features:
 * - Automatic onboarding detection for new users
 * - Global onboarding state management
 * - Integration with billing preferences
 * 
 * Usage:
 * Wrap your app or main layout with this provider
 */
export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const value = useOnboardingState();
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <OnboardingUI />
    </OnboardingContext.Provider>
  );
};

/**
 * Hook to access onboarding controls from anywhere in the app
 * Must be used within OnboardingProvider
 */
export { useOnboarding } from '../../hooks/useOnboarding';