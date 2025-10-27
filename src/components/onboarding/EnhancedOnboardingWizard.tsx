/**
 * EnhancedOnboardingWizard Component
 * Progressive 4-phase onboarding with interactive tours and sample data
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Circle,
  ChevronRight,
  Play,
  SkipForward,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { AsyncButton } from '../ui/AsyncButton';
import { useHelp } from '../../hooks/useHelp';
import type { OnboardingPhase } from '../../types/help.types';

interface EnhancedOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const EnhancedOnboardingWizard: React.FC<EnhancedOnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { 
    onboardingPhase, 
    setOnboardingPhase, 
    completeOnboarding,
    startTour,
  } = useHelp();
  
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isCreatingSample, setIsCreatingSample] = useState(false);

  // Define 4 onboarding phases
  const phases: OnboardingPhase[] = [
    {
      phase: 1,
      name: 'Essential Setup',
      description: 'Configure your account',
      estimatedDuration: 5,
      isOptional: false,
      steps: [
        {
          id: 'profile',
          title: 'Complete Profile',
          description: 'Add practice details',
          action: () => {
            window.location.href = '/settings/profile';
          },
          isCompleted: false,
        },
        {
          id: 'billing-preferences',
          title: 'Billing Preferences',
          description: 'Configure billing settings',
          action: () => {
            // Open billing wizard
          },
          isCompleted: false,
        },
        {
          id: 'invoice-settings',
          title: 'Invoice Settings',
          description: 'Configure numbering and branding',
          action: () => {
            window.location.href = '/settings/invoices';
          },
          isCompleted: false,
        },
      ],
    },
    {
      phase: 2,
      name: 'Core Workflow',
      description: 'Learn key features',
      estimatedDuration: 15,
      isOptional: false,
      steps: [
        {
          id: 'create-matter',
          title: 'Create Matter',
          description: 'Interactive matter creation',
          tourId: 'matter-creation',
          action: async () => {
            startTour('matter-creation');
          },
          isCompleted: false,
        },
        {
          id: 'log-services',
          title: 'Log Time',
          description: 'Track billable hours',
          tourId: 'time-tracking',
          action: () => {
            startTour('time-tracking');
          },
          isCompleted: false,
        },
        {
          id: 'generate-invoice',
          title: 'Generate Invoice',
          description: 'Create professional invoices',
          tourId: 'invoice-generation',
          action: () => {
            startTour('invoice-generation');
          },
          isCompleted: false,
        },
      ],
    },
    {
      phase: 3,
      name: 'Advanced Features',
      description: 'Expand capabilities',
      estimatedDuration: 20,
      isOptional: true,
      steps: [
        {
          id: 'attorney-connection',
          title: 'Attorney Network',
          description: 'Connect with attorneys',
          tourId: 'attorney-network',
          action: () => {
            startTour('attorney-network');
          },
          isCompleted: false,
          isOptional: true,
        },
        {
          id: 'document-linking',
          title: 'Cloud Storage',
          description: 'Link documents',
          tourId: 'document-management',
          action: () => {
            startTour('document-management');
          },
          isCompleted: false,
          isOptional: true,
        },
        {
          id: 'brief-fee-templates',
          title: 'Fee Templates',
          description: 'Reusable fee structures',
          tourId: 'template-management',
          action: () => {
            startTour('template-management');
          },
          isCompleted: false,
          isOptional: true,
        },
      ],
    },
    {
      phase: 4,
      name: 'Power User',
      description: 'Advanced tools',
      estimatedDuration: 30,
      isOptional: true,
      steps: [
        {
          id: 'keyboard-shortcuts',
          title: 'Keyboard Shortcuts',
          description: 'Boost productivity',
          action: () => {
            // Open keyboard shortcuts help
          },
          isCompleted: false,
          isOptional: true,
        },
        {
          id: 'custom-reports',
          title: 'Custom Reports',
          description: 'Track key metrics',
          action: () => {
            window.location.href = '/reports';
          },
          isCompleted: false,
          isOptional: true,
        },
        {
          id: 'automation',
          title: 'Automation',
          description: 'Automate tasks',
          action: () => {
            // Open automation settings
          },
          isCompleted: false,
          isOptional: true,
        },
      ],
    },
  ];

  const currentPhaseData = phases[onboardingPhase - 1];
  const totalPhases = phases.length;
  const progressPercentage = (onboardingPhase / totalPhases) * 100;

  // Load completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lexohub_completed_onboarding_steps');
    if (saved) {
      setCompletedSteps(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save completed steps to localStorage
  useEffect(() => {
    localStorage.setItem('lexohub_completed_onboarding_steps', JSON.stringify([...completedSteps]));
  }, [completedSteps]);

  const handleMarkComplete = (stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepId);
      return newSet;
    });
  };

  const handleStepAction = async (step: any) => {
    if (step.action) {
      await step.action();
    }
    handleMarkComplete(step.id);
  };

  const handleNextPhase = () => {
    if (onboardingPhase < totalPhases) {
      setOnboardingPhase(onboardingPhase + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkipPhase = () => {
    if (currentPhaseData.isOptional) {
      handleNextPhase();
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    onComplete();
    onClose();
  };

  const handleCreateSampleData = async () => {
    setIsCreatingSample(true);
    try {
      // In production, call API to create sample matter with services
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Mark phase 2 steps as completed
      handleMarkComplete('create-matter');
      handleMarkComplete('log-services');
    } finally {
      setIsCreatingSample(false);
    }
  };

  // Calculate phase completion
  const requiredSteps = currentPhaseData.steps.filter(s => !s.isOptional);
  const completedRequired = requiredSteps.filter(s => completedSteps.has(s.id)).length;
  const isPhaseComplete = completedRequired === requiredSteps.length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[90vh] bg-white dark:bg-metallic-gray-900 rounded-lg shadow-2xl border border-neutral-200 dark:border-metallic-gray-700 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mpondo-gold-100 dark:bg-mpondo-gold-900/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {currentPhaseData.name}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Phase {onboardingPhase} of {totalPhases}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 rounded-lg transition-colors"
              aria-label="Close onboarding"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-2">
              <span>Setup Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 dark:bg-metallic-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-mpondo-gold-600 dark:bg-mpondo-gold-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Phase Description */}
          <div className="mb-6">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {currentPhaseData.description} • ~{currentPhaseData.estimatedDuration} min
            </p>
          </div>

          {/* Sample Data Option (Phase 2 only) */}
          {onboardingPhase === 2 && (
            <div className="mb-6 p-4 bg-neutral-50 dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                🚀 Quick Start
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Create sample data to explore
              </p>
              <AsyncButton
                onAsyncClick={handleCreateSampleData}
                variant="primary"
                className="w-full"
              >
                {isCreatingSample ? 'Creating...' : 'Create Sample'}
              </AsyncButton>
            </div>
          )}

          {/* Steps List */}
          <div className="space-y-3">
            {currentPhaseData.steps.map((step) => {
              const isCompleted = completedSteps.has(step.id);
              
              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? 'bg-neutral-50 dark:bg-metallic-gray-800 border-mpondo-gold-300 dark:border-mpondo-gold-700'
                      : 'bg-white dark:bg-metallic-gray-800 border-neutral-200 dark:border-metallic-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className={`font-medium ${
                            isCompleted 
                              ? 'text-neutral-700 dark:text-neutral-300' 
                              : 'text-neutral-900 dark:text-neutral-100'
                          }`}>
                            {step.title}
                            {step.isOptional && (
                              <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                                (Optional)
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {step.description}
                          </p>
                        </div>
                        
                        {!isCompleted && step.action && (
                          <Button
                            onClick={() => handleStepAction(step)}
                            variant="secondary"
                            size="sm"
                            className="flex-shrink-0 flex items-center gap-1"
                          >
                            {step.tourId ? (
                              <>
                                <Play className="w-4 h-4" />
                                Start
                              </>
                            ) : (
                              <>
                                Configure
                                <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {isPhaseComplete ? (
                <span className="text-mpondo-gold-600 dark:text-mpondo-gold-400 font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Phase Complete
                </span>
              ) : (
                <span className="text-neutral-600 dark:text-neutral-400">
                  {completedRequired} of {requiredSteps.length} required steps
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentPhaseData.isOptional && !isPhaseComplete && (
                <Button
                  onClick={handleSkipPhase}
                  variant="ghost"
                  className="text-neutral-600 dark:text-neutral-400"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Phase
                </Button>
              )}

              {onboardingPhase < totalPhases ? (
                <Button
                  onClick={handleNextPhase}
                  disabled={!isPhaseComplete && !currentPhaseData.isOptional}
                  variant="primary"
                >
                  Next Phase
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!isPhaseComplete}
                  variant="primary"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
