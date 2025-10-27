/**
 * OnboardingProvider Component
 * 
 * Provides onboarding functionality throughout the app.
 * Automatically shows onboarding for new users.
 */

import React from 'react';
import { OnboardingChecklist } from './OnboardingChecklist';
import { useOnboarding } from '../../hooks/useOnboarding';

export interface OnboardingProviderProps {
  children: React.ReactNode;
}

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
  const {
    isOnboardingOpen,
    closeOnboarding,
    completeOnboarding,
  } = useOnboarding();

  return (
    <>
      {children}
      
      <OnboardingChecklist
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </>
  );
};

/**
 * Hook to access onboarding controls from anywhere in the app
 * Must be used within OnboardingProvider
 */
export { useOnboarding } from '../../hooks/useOnboarding';