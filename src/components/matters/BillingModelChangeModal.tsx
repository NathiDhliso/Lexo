/**
 * BillingModelChangeModal Component
 * 
 * Confirmation modal for changing billing models on existing matters.
 * Uses the reusable useModalForm hook for form management.
 */

import React, { useMemo } from 'react';
import { AlertTriangle, Clock, FileText, DollarSign } from 'lucide-react';
import { Button } from '../design-system/components';
import { BillingModelSelector } from './BillingModelSelector';
import { useModalForm } from '../../hooks/useModalForm';
import { createValidator, required } from '../../utils/validation.utils';
import { BillingModel } from '../../services/billing-strategies';
import { matterApiService } from '../../services/api';
import type { Matter } from '../../types';

export interface BillingModelChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  matter: Matter;
  onSuccess?: (updatedMatter: Matter) => void;
}

interface BillingModelChangeFormData {
  billing_model: BillingModel;
  agreed_fee?: number;
  hourly_rate?: number;
}

/**
 * Get warning messages based on current matter state and new billing model
 */
function getWarningMessages(matter: Matter, newModel: BillingModel): string[] {
  const warnings: string[] = [];
  
  // Check for existing time entries
  if (matter.time_entries && matter.time_entries.length > 0) {
    if (newModel === BillingModel.BRIEF_FEE) {
      warnings.push('Existing time entries will be hidden but preserved for internal analysis.');
    }
  }
  
  // Check for existing invoices
  if (matter.invoices && matter.invoices.length > 0) {
    warnings.push('This matter already has invoices. Changing billing model may affect future invoicing.');
  }
  
  // Check WIP value
  if (matter.wip_value > 0) {
    warnings.push('This matter has work in progress. Ensure the new billing model aligns with recorded work.');
  }
  
  return warnings;
}

/**
 * Get impact description for the billing model change
 */
function getImpactDescription(currentModel: BillingModel | undefined, newModel: BillingModel): string {
  if (!currentModel) {
    return 'This will set the billing model for this matter.';
  }
  
  if (currentModel === newModel) {
    return 'No changes will be made.';
  }
  
  const impacts: Record<string, string> = {
    [`${BillingModel.TIME_BASED}-${BillingModel.BRIEF_FEE}`]: 
      'Time tracking will be hidden. The matter will use a fixed fee structure.',
    [`${BillingModel.BRIEF_FEE}-${BillingModel.TIME_BASED}`]: 
      'Time tracking will be enabled. You can track hours for detailed billing.',
    [`${BillingModel.QUICK_OPINION}-${BillingModel.BRIEF_FEE}`]: 
      'The matter will switch to a standard brief fee structure.',
    [`${BillingModel.BRIEF_FEE}-${BillingModel.QUICK_OPINION}`]: 
      'The matter will be treated as a quick opinion with flat-rate billing.',
    [`${BillingModel.TIME_BASED}-${BillingModel.QUICK_OPINION}`]: 
      'Time tracking will be hidden. The matter will use flat-rate opinion billing.',
    [`${BillingModel.QUICK_OPINION}-${BillingModel.TIME_BASED}`]: 
      'Time tracking will be enabled for detailed hourly billing.',
  };
  
  return impacts[`${currentModel}-${newModel}`] || 'The billing model will be updated.';
}

export const BillingModelChangeModal: React.FC<BillingModelChangeModalProps> = ({
  isOpen,
  onClose,
  matter,
  onSuccess,
}) => {
  // Create validator
  const validator = useMemo(() => createValidator<BillingModelChangeFormData>({
    billing_model: [required()],
    agreed_fee: [], // Conditional validation handled in validate function
    hourly_rate: [], // Conditional validation handled in validate function
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
  } = useModalForm<BillingModelChangeFormData>({
    initialData: {
      billing_model: matter.billing_model || BillingModel.BRIEF_FEE,
      agreed_fee: matter.agreed_fee,
      hourly_rate: matter.hourly_rate,
    },
    onSubmit: async (data) => {
      const additionalData: any = {};
      
      if (data.billing_model === BillingModel.BRIEF_FEE || data.billing_model === BillingModel.QUICK_OPINION) {
        if (!data.agreed_fee) {
          throw new Error('Fee amount is required for this billing model');
        }
        additionalData.agreed_fee = data.agreed_fee;
      }
      
      if (data.billing_model === BillingModel.TIME_BASED) {
        if (!data.hourly_rate) {
          throw new Error('Hourly rate is required for time-based billing');
        }
        additionalData.hourly_rate = data.hourly_rate;
      }

      const result = await matterApiService.updateBillingModel(
        matter.id,
        data.billing_model,
        additionalData
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (updatedMatter) => {
      onSuccess?.(updatedMatter);
      onClose();
    },
    validate: (data) => {
      const errors: Record<string, string> = {};
      
      if (data.billing_model === BillingModel.BRIEF_FEE || data.billing_model === BillingModel.QUICK_OPINION) {
        if (!data.agreed_fee || data.agreed_fee <= 0) {
          errors.agreed_fee = 'Fee amount is required and must be greater than 0';
        }
      }
      
      if (data.billing_model === BillingModel.TIME_BASED) {
        if (!data.hourly_rate || data.hourly_rate <= 0) {
          errors.hourly_rate = 'Hourly rate is required and must be greater than 0';
        }
      }
      
      return Object.keys(errors).length > 0 ? errors : null;
    },
    successMessage: 'Billing model updated successfully!',
    resetOnSuccess: true,
  });

  const warnings = useMemo(() => 
    getWarningMessages(matter, formData.billing_model), 
    [matter, formData.billing_model]
  );

  const impactDescription = useMemo(() => 
    getImpactDescription(matter.billing_model, formData.billing_model),
    [matter.billing_model, formData.billing_model]
  );

  const hasChanges = matter.billing_model !== formData.billing_model ||
    matter.agreed_fee !== formData.agreed_fee ||
    matter.hourly_rate !== formData.hourly_rate;

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Change Billing Model
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {matter.title}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current State Info */}
          <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Current Billing Model
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {matter.billing_model ? 
                `${matter.billing_model.charAt(0).toUpperCase() + matter.billing_model.slice(1).replace('-', ' ')}` :
                'Not set'
              }
            </p>
          </div>

          {/* Billing Model Selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              New Billing Model *
            </label>
            <BillingModelSelector
              value={formData.billing_model}
              onChange={(model) => handleChange('billing_model', model)}
              disabled={isLoading}
            />
            {validationErrors.billing_model && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.billing_model}
              </p>
            )}
          </div>

          {/* Additional Fields Based on Billing Model */}
          {formData.billing_model === BillingModel.BRIEF_FEE && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Agreed Brief Fee (R) *
              </label>
              <input
                type="number"
                value={formData.agreed_fee || ''}
                onChange={(e) => handleChange('agreed_fee', parseFloat(e.target.value) || 0)}
                placeholder="15000.00"
                min="0"
                step="100"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-judicial-blue-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50"
              />
              {validationErrors.agreed_fee && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.agreed_fee}
                </p>
              )}
            </div>
          )}

          {formData.billing_model === BillingModel.TIME_BASED && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Hourly Rate (R) *
              </label>
              <input
                type="number"
                value={formData.hourly_rate || ''}
                onChange={(e) => handleChange('hourly_rate', parseFloat(e.target.value) || 0)}
                placeholder="2500.00"
                min="0"
                step="50"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-judicial-blue-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50"
              />
              {validationErrors.hourly_rate && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.hourly_rate}
                </p>
              )}
            </div>
          )}

          {formData.billing_model === BillingModel.QUICK_OPINION && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Opinion Fee (R) *
              </label>
              <input
                type="number"
                value={formData.agreed_fee || ''}
                onChange={(e) => handleChange('agreed_fee', parseFloat(e.target.value) || 0)}
                placeholder="3500.00"
                min="0"
                step="50"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-judicial-blue-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-50"
              />
              {validationErrors.agreed_fee && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {validationErrors.agreed_fee}
                </p>
              )}
            </div>
          )}

          {/* Impact Description */}
          {hasChanges && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Impact of Change
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {impactDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                    Please Note
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-amber-600 dark:bg-amber-400 rounded-full flex-shrink-0 mt-2"></span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
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
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !hasChanges}
              className="bg-judicial-blue-600 hover:bg-judicial-blue-700"
            >
              {isLoading ? 'Updating...' : 'Update Billing Model'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};