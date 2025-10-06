import React from 'react';
import { Check, Circle } from 'lucide-react';

export interface PipelineStep {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface StatusPipelineProps {
  steps: PipelineStep[];
  currentStep: string;
  completedSteps?: string[];
  variant?: 'matter' | 'proforma' | 'invoice';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getVariantColors = (variant: 'matter' | 'proforma' | 'invoice') => {
  switch (variant) {
    case 'matter':
      return {
        active: 'bg-judicial-blue-500 border-judicial-blue-500 text-white',
        completed: 'bg-judicial-blue-500 border-judicial-blue-500 text-white',
        pending: 'bg-white border-neutral-300 text-neutral-400',
        line: 'bg-judicial-blue-500',
        lineInactive: 'bg-neutral-300'
      };
    case 'proforma':
      return {
        active: 'bg-mpondo-gold-500 border-mpondo-gold-500 text-white',
        completed: 'bg-mpondo-gold-500 border-mpondo-gold-500 text-white',
        pending: 'bg-white border-neutral-300 text-neutral-400',
        line: 'bg-mpondo-gold-500',
        lineInactive: 'bg-neutral-300'
      };
    case 'invoice':
      return {
        active: 'bg-status-success-500 border-status-success-500 text-white',
        completed: 'bg-status-success-500 border-status-success-500 text-white',
        pending: 'bg-white border-neutral-300 text-neutral-400',
        line: 'bg-status-success-500',
        lineInactive: 'bg-neutral-300'
      };
  }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        circle: 'w-6 h-6',
        icon: 'w-3 h-3',
        text: 'text-xs',
        line: 'h-0.5'
      };
    case 'md':
      return {
        circle: 'w-8 h-8',
        icon: 'w-4 h-4',
        text: 'text-sm',
        line: 'h-0.5'
      };
    case 'lg':
      return {
        circle: 'w-10 h-10',
        icon: 'w-5 h-5',
        text: 'text-base',
        line: 'h-1'
      };
  }
};

export const StatusPipeline: React.FC<StatusPipelineProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  variant = 'matter',
  size = 'md',
  className = ''
}) => {
  const colors = getVariantColors(variant);
  const sizes = getSizeClasses(size);
  
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  const getStepStatus = (index: number, stepId: string) => {
    if (completedSteps.includes(stepId) || index < currentIndex) {
      return 'completed';
    }
    if (stepId === currentStep) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index, step.id);
          const isCompleted = status === 'completed';
          const isActive = status === 'active';
          const isPending = status === 'pending';

          const circleClasses = isCompleted
            ? colors.completed
            : isActive
            ? colors.active
            : colors.pending;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`${sizes.circle} rounded-full flex items-center justify-center border-2 transition-all ${circleClasses}`}
                >
                  {isCompleted ? (
                    <Check className={sizes.icon} />
                  ) : step.icon ? (
                    <step.icon className={sizes.icon} />
                  ) : (
                    <Circle className={sizes.icon} fill={isActive ? 'currentColor' : 'none'} />
                  )}
                </div>
                
                <div className="mt-2 text-center max-w-[100px]">
                  <p
                    className={`${sizes.text} font-medium ${
                      isActive
                        ? 'text-neutral-900'
                        : isCompleted
                        ? 'text-neutral-700'
                        : 'text-neutral-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-neutral-500 mt-0.5 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 ${sizes.line} mx-2 transition-all ${
                    index < currentIndex ? colors.line : colors.lineInactive
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

export const MATTER_PIPELINE_STEPS: PipelineStep[] = [
  { id: 'pending', label: 'Pending', description: 'Awaiting approval' },
  { id: 'active', label: 'Active', description: 'In progress' },
  { id: 'settled', label: 'Settled', description: 'Resolved' },
  { id: 'closed', label: 'Closed', description: 'Completed' }
];

export const PROFORMA_PIPELINE_STEPS: PipelineStep[] = [
  { id: 'draft', label: 'Draft', description: 'Creating' },
  { id: 'sent', label: 'Sent', description: 'Delivered' },
  { id: 'accepted', label: 'Accepted', description: 'Approved' },
  { id: 'converted', label: 'Converted', description: 'To invoice' }
];

export const INVOICE_PIPELINE_STEPS: PipelineStep[] = [
  { id: 'draft', label: 'Draft', description: 'Preparing' },
  { id: 'sent', label: 'Sent', description: 'Delivered' },
  { id: 'viewed', label: 'Viewed', description: 'Opened' },
  { id: 'paid', label: 'Paid', description: 'Payment received' }
];
