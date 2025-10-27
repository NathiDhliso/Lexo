/**
 * OnboardingChecklist Component
 * 
 * Manages the onboarding flow for new advocates.
 * Includes billing preference setup as a key step.
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  User, 
  CreditCard, 
  Settings, 
  FileText,
  ArrowRight,
  X
} from 'lucide-react';
import { Button } from '../design-system/components';
import { BillingPreferenceWizard } from './BillingPreferenceWizard';
import { useBillingPreferences } from '../../hooks/useBillingPreferences';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

export interface OnboardingChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isCompleted: boolean;
  isOptional?: boolean;
  action?: () => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { user } = useAuth();
  const { preferences, hasCompletedSetup } = useBillingPreferences();
  const [showBillingWizard, setShowBillingWizard] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Define onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your practice details and contact information',
      icon: User,
      isCompleted: !!user?.user_metadata?.full_name,
      action: () => {
        // Navigate to profile settings
        window.location.href = '/settings/profile';
      },
    },
    {
      id: 'billing-preferences',
      title: 'Set Up Billing Preferences',
      description: 'Configure how you typically bill clients to customize your experience',
      icon: CreditCard,
      isCompleted: hasCompletedSetup,
      action: () => setShowBillingWizard(true),
    },
    {
      id: 'matter-templates',
      title: 'Create Matter Templates',
      description: 'Set up templates for common matter types to speed up matter creation',
      icon: FileText,
      isCompleted: false, // TODO: Check if user has created templates
      isOptional: true,
      action: () => {
        // Navigate to templates
        window.location.href = '/settings/templates';
      },
    },
    {
      id: 'dashboard-setup',
      title: 'Customize Dashboard',
      description: 'Arrange your dashboard widgets to match your workflow',
      icon: Settings,
      isCompleted: !!preferences?.dashboard_widgets?.length,
      isOptional: true,
      action: () => {
        // Navigate to dashboard settings
        window.location.href = '/dashboard/customize';
      },
    },
  ];

  // Calculate progress
  const requiredSteps = steps.filter(step => !step.isOptional);
  const completedRequiredSteps = requiredSteps.filter(step => step.isCompleted);
  const progress = (completedRequiredSteps.length / requiredSteps.length) * 100;
  const isOnboardingComplete = completedRequiredSteps.length === requiredSteps.length;

  // Handle billing wizard completion
  const handleBillingWizardComplete = () => {
    setShowBillingWizard(false);
    setCompletedSteps(prev => new Set([...prev, 'billing-preferences']));
    
    // Check if onboarding is now complete
    if (isOnboardingComplete) {
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    }
  };

  // Handle step completion
  const handleStepAction = (step: OnboardingStep) => {
    if (step.action) {
      step.action();
    }
  };

  // Auto-close when onboarding is complete
  useEffect(() => {
    if (isOnboardingComplete && completedSteps.size > 0) {
      const timer = setTimeout(() => {
        onComplete?.();
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnboardingComplete, completedSteps.size, onComplete, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Welcome to LexoHub
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Let's get your account set up for success
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 rounded-lg transition-colors"
                aria-label="Close onboarding"
                title="Explore the app first"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Explore First Notice */}
            <div className="mt-4 p-3 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 border border-judicial-blue-200 dark:border-judicial-blue-800 rounded-lg">
              <p className="text-sm text-judicial-blue-900 dark:text-judicial-blue-100">
                💡 <strong>Want to explore first?</strong> Feel free to close this and tour the app. You can always complete setup later from Settings.
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                <span>Setup Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-metallic-gray-700 rounded-full h-2">
                <div
                  className="bg-mpondo-gold-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="p-6">
            <div className="space-y-4">
              {steps.map((step) => {
                const Icon = step.icon;
                const isCompleted = step.isCompleted || completedSteps.has(step.id);
                
                return (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-start p-4 rounded-lg border transition-all duration-200',
                      isCompleted
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                        : 'border-neutral-200 bg-white dark:bg-neutral-800 dark:border-neutral-600 hover:shadow-md'
                    )}
                  >
                    {/* Step Icon */}
                    <div className="flex-shrink-0 mr-4">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center',
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn(
                          'font-semibold',
                          isCompleted
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-neutral-900 dark:text-neutral-100'
                        )}>
                          {step.title}
                        </h3>
                        
                        {step.isOptional && (
                          <span className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                      
                      <p className={cn(
                        'text-sm mb-3',
                        isCompleted
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-neutral-600 dark:text-neutral-400'
                      )}>
                        {step.description}
                      </p>
                      
                      {/* Action Button */}
                      {!isCompleted && step.action && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStepAction(step)}
                          className="flex items-center gap-2"
                        >
                          {step.id === 'billing-preferences' ? 'Set Up Now' : 'Configure'}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {isCompleted && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Completion Message */}
            {isOnboardingComplete && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      Setup Complete!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your account is ready to use. You can always update these settings later.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800"
              >
                🚀 Explore App First
              </Button>
              
              {isOnboardingComplete ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    onComplete?.();
                    onClose();
                  }}
                  className="bg-mpondo-gold-600 hover:bg-mpondo-gold-700"
                >
                  Get Started
                </Button>
              ) : (
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {completedRequiredSteps.length} of {requiredSteps.length} required steps completed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Preference Wizard */}
      <BillingPreferenceWizard
        isOpen={showBillingWizard}
        onClose={() => setShowBillingWizard(false)}
        onComplete={handleBillingWizardComplete}
      />
    </>
  );
};