import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../design-system/components';
import { StepIndicator } from './StepIndicator';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  fields: string[];
  validate?: (data: any) => boolean | string;
}

interface MultiStepFormProps {
  steps: Step[];
  initialData?: any;
  onComplete: (data: any) => void;
  onCancel: () => void;
  children: (currentStep: Step, data: any, updateData: (field: string, value: any) => void) => React.ReactNode;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  initialData = {},
  onComplete,
  onCancel,
  children
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const updateData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep.validate) {
      const result = currentStep.validate(formData);
      if (typeof result === 'string') {
        setErrors({ [currentStep.id]: result });
        return false;
      }
      return result;
    }

    const missingFields = currentStep.fields.filter(field => {
      const value = formData[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      setErrors({ [currentStep.id]: `Please fill in all required fields` });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        onComplete(formData);
      } else {
        setCurrentStepIndex(prev => prev + 1);
        setErrors({});
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
      setErrors({});
    }
  };

  const handleStepClick = (index: number) => {
    if (index < currentStepIndex) {
      setCurrentStepIndex(index);
      setErrors({});
    }
  };

  return (
    <div className="space-y-6">
      <StepIndicator
        steps={steps}
        currentStep={currentStepIndex}
        onStepClick={handleStepClick}
      />

      <div className="min-h-[400px]">
        {children(currentStep, formData, updateData)}
      </div>

      {errors[currentStep.id] && (
        <div className="p-3 bg-status-error-50 border border-status-error-200 rounded-lg">
          <p className="text-sm text-status-error-700">{errors[currentStep.id]}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <Button
          variant="outline"
          onClick={isFirstStep ? onCancel : handleBack}
        >
          {isFirstStep ? (
            'Cancel'
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </>
          )}
        </Button>

        <div className="text-sm text-neutral-600">
          Step {currentStepIndex + 1} of {steps.length}
        </div>

        <Button
          variant="primary"
          onClick={handleNext}
        >
          {isLastStep ? (
            'Complete'
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
