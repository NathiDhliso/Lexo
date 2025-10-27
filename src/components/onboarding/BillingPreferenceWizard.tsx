/**
 * BillingPreferenceWizard Component
 * 
 * Onboarding wizard for setting up billing preferences.
 * Uses the reusable useModalForm hook for form management.
 */

import React, { useMemo } from 'react';
import { FileText, Clock, Zap, CheckCircle } from 'lucide-react';
import { Button } from '../design-system/components';
import { useModalForm } from '../../hooks/useModalForm';
import { useBillingPreferences } from '../../hooks/useBillingPreferences';
import { createValidator, required } from '../../utils/validation.utils';
import { BillingModel } from '../../types/billing.types';
import { cn } from '../../lib/utils';

export interface BillingPreferenceWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface BillingPreferenceFormData {
  primary_workflow: 'brief-fee' | 'mixed' | 'time-based';
  default_billing_model: BillingModel;
  show_time_tracking_by_default: boolean;
  auto_create_milestones: boolean;
}

interface WorkflowOption {
  value: 'brief-fee' | 'mixed' | 'time-based';
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  defaultModel: BillingModel;
  dashboardWidgets: string[];
}

const workflowOptions: WorkflowOption[] = [
  {
    value: 'brief-fee',
    label: 'Mostly Brief Fees',
    description: 'I primarily work on brief fee arrangements with fixed fees agreed upfront.',
    icon: FileText,
    defaultModel: 'brief-fee' as BillingModel,
    dashboardWidgets: ['active-matters', 'fee-milestones', 'pending-invoices', 'recent-payments'],
  },
  {
    value: 'mixed',
    label: 'Mixed Practice',
    description: 'I use both brief fees and time-based billing depending on the matter.',
    icon: Zap,
    defaultModel: 'brief-fee' as BillingModel, // Default to brief fee, but show both options
    dashboardWidgets: ['active-matters', 'time-tracking', 'fee-milestones', 'pending-invoices'],
  },
  {
    value: 'time-based',
    label: 'Primarily Time-Based',
    description: 'I mostly bill hourly with detailed time tracking for complex litigation.',
    icon: Clock,
    defaultModel: 'time-based' as BillingModel,
    dashboardWidgets: ['active-matters', 'time-tracking', 'wip-tracker', 'pending-invoices'],
  },
];

export const BillingPreferenceWizard: React.FC<BillingPreferenceWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { updatePreferences } = useBillingPreferences();

  // Create validator
  const validator = useMemo(() => createValidator<BillingPreferenceFormData>({
    primary_workflow: [required()],
    default_billing_model: [required()],
    show_time_tracking_by_default: [],
    auto_create_milestones: [],
  }), []);

  // Use modal form hook
  const {
    formData,
    isLoading,
    error,
    validationErrors,
    handleChange,
    handleSubmit,
    reset,
  } = useModalForm<BillingPreferenceFormData>({
    initialData: {
      primary_workflow: 'brief-fee',
      default_billing_model: 'brief-fee' as BillingModel,
      show_time_tracking_by_default: false,
      auto_create_milestones: true,
    },
    onSubmit: async (data) => {
      const selectedOption = workflowOptions.find(opt => opt.value === data.primary_workflow);
      
      await updatePreferences({
        primary_workflow: data.primary_workflow,
        default_billing_model: data.default_billing_model,
        dashboard_widgets: selectedOption?.dashboardWidgets || [],
        show_time_tracking_by_default: data.show_time_tracking_by_default,
        auto_create_milestones: data.auto_create_milestones,
      });
    },
    onSuccess: () => {
      onComplete?.();
      onClose();
    },
    validate: (data) => {
      const result = validator.validate(data);
      return result.isValid ? null : result.errors;
    },
    successMessage: 'Billing preferences saved successfully!',
    resetOnSuccess: true,
  });

  // Update default billing model when workflow changes
  React.useEffect(() => {
    const selectedOption = workflowOptions.find(opt => opt.value === formData.primary_workflow);
    if (selectedOption && formData.default_billing_model !== selectedOption.defaultModel) {
      handleChange('default_billing_model', selectedOption.defaultModel);
      
      // Update time tracking preference based on workflow
      handleChange('show_time_tracking_by_default', selectedOption.value === 'time-based');
    }
  }, [formData.primary_workflow, formData.default_billing_model, handleChange]);

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Set Up Your Billing Preferences
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Help us customize your experience based on how you typically bill clients
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Workflow Selection */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              What best describes your practice?
            </h3>
            <div className="space-y-3" role="radiogroup" aria-label="Primary workflow selection">
              {workflowOptions.map((option) => {
                const isSelected = formData.primary_workflow === option.value;
                const Icon = option.icon;
                
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                      'hover:shadow-md',
                      isSelected
                        ? 'border-judicial-blue-600 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 dark:border-judicial-blue-400'
                        : 'border-neutral-300 bg-white dark:bg-neutral-800 dark:border-neutral-600',
                      isLoading && 'opacity-50 cursor-not-allowed',
                      !isLoading && !isSelected && 'hover:border-judicial-blue-400'
                    )}
                  >
                    <input
                      type="radio"
                      name="primary_workflow"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => !isLoading && handleChange('primary_workflow', option.value)}
                      disabled={isLoading}
                      className="sr-only"
                      aria-describedby={`${option.value}-description`}
                    />
                    
                    <div className="flex-shrink-0 mr-4">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center',
                        isSelected
                          ? 'bg-judicial-blue-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          'font-semibold text-lg',
                          isSelected
                            ? 'text-judicial-blue-900 dark:text-judicial-blue-100'
                            : 'text-neutral-900 dark:text-neutral-100'
                        )}>
                          {option.label}
                        </span>
                        
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      
                      <p
                        id={`${option.value}-description`}
                        className={cn(
                          'text-sm',
                          isSelected
                            ? 'text-judicial-blue-700 dark:text-judicial-blue-300'
                            : 'text-neutral-600 dark:text-neutral-400'
                        )}
                      >
                        {option.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            {validationErrors.primary_workflow && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {validationErrors.primary_workflow}
              </p>
            )}
          </div>

          {/* Additional Preferences */}
          <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-6">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Additional Preferences
            </h4>
            
            <div className="space-y-4">
              {/* Time Tracking Default */}
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.show_time_tracking_by_default}
                  onChange={(e) => handleChange('show_time_tracking_by_default', e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 text-judicial-blue-600 border-neutral-300 rounded focus:ring-judicial-blue-500"
                />
                <div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Show time tracking by default
                  </span>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Display time tracking widgets even for brief fee matters (for internal analysis)
                  </p>
                </div>
              </label>

              {/* Auto-create Milestones */}
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.auto_create_milestones}
                  onChange={(e) => handleChange('auto_create_milestones', e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 text-judicial-blue-600 border-neutral-300 rounded focus:ring-judicial-blue-500"
                />
                <div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Auto-create fee milestones
                  </span>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Automatically create progress milestones for brief fee matters
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          {formData.primary_workflow && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Your Dashboard Will Include:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
                {workflowOptions
                  .find(opt => opt.value === formData.primary_workflow)
                  ?.dashboardWidgets.map((widget, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {widget.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="bg-mpondo-gold-600 hover:bg-mpondo-gold-700"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};