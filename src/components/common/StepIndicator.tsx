import React from 'react';
import { Check } from 'lucide-react';
import type { Step } from './MultiStepForm';

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index < currentStep && onStepClick;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={`flex flex-col items-center flex-1 ${
                  isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                } transition-opacity`}
                type="button"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-mpondo-gold-500 border-mpondo-gold-500 text-white'
                      : isCurrent
                      ? 'bg-white border-mpondo-gold-500 text-mpondo-gold-600'
                      : 'bg-white border-neutral-300 text-neutral-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : step.icon ? (
                    <step.icon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center max-w-[120px]">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-mpondo-gold-600'
                        : isCompleted
                        ? 'text-neutral-900'
                        : 'text-neutral-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-neutral-500 mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    index < currentStep
                      ? 'bg-mpondo-gold-500'
                      : 'bg-neutral-300'
                  }`}
                  style={{ maxWidth: '80px' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
