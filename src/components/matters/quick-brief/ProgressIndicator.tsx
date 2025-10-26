/**
 * ProgressIndicator Component
 * Visual progress indicator for multi-step questionnaire
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  className
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={cn('w-full', className)}>
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            {/* Step circle */}
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200',
                step < currentStep
                  ? 'bg-mpondo-gold-600 text-white'
                  : step === currentStep
                  ? 'bg-judicial-blue-600 text-white ring-4 ring-judicial-blue-100 dark:ring-judicial-blue-900/30'
                  : 'bg-neutral-200 dark:bg-metallic-gray-700 text-neutral-600 dark:text-neutral-400'
              )}
              aria-current={step === currentStep ? 'step' : undefined}
            >
              {step < currentStep ? (
                <Check className="w-5 h-5" aria-label="Completed" />
              ) : (
                step
              )}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 transition-all duration-200',
                  step < currentStep
                    ? 'bg-mpondo-gold-600'
                    : 'bg-neutral-200 dark:bg-metallic-gray-700'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels (optional) */}
      {stepLabels && stepLabels.length === totalSteps && (
        <div className="flex items-start justify-between mt-3">
          {stepLabels.map((label, index) => (
            <div
              key={index}
              className={cn(
                'text-xs text-center transition-colors duration-200',
                'flex-1 px-1',
                index + 1 === currentStep
                  ? 'text-judicial-blue-600 dark:text-judicial-blue-400 font-medium'
                  : index + 1 < currentStep
                  ? 'text-mpondo-gold-600 dark:text-mpondo-gold-400'
                  : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Current step text */}
      <div className="text-center mt-4">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
};

export default ProgressIndicator;
