/**
 * MatterCreationModal Component
 * Multi-step form for creating new matters
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AsyncButton } from '../ui/AsyncButton';
import { FormInput } from '../ui/FormInput';
import { useForm } from '../../hooks/useForm';
import { toastService } from '../../services/toast.service';

interface MatterFormData {
  // Client Info
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  
  // Matter Details
  matterName: string;
  matterType: string;
  description: string;
  
  // Billing Setup
  billingType: 'hourly' | 'fixed' | 'contingency';
  hourlyRate?: number;
  fixedFee?: number;
  contingencyPercentage?: number;
}

export interface MatterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MatterFormData) => Promise<void>;
}

export const MatterCreationModal: React.FC<MatterCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<MatterFormData>({
    initialValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      matterName: '',
      matterType: '',
      description: '',
      billingType: 'hourly',
    },
    validationSchema: {
      clientName: [{ type: 'required', message: 'Client name is required' }],
      clientEmail: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Invalid email address' },
      ],
      matterName: [{ type: 'required', message: 'Matter name is required' }],
      matterType: [{ type: 'required', message: 'Matter type is required' }],
    },
    onSubmit: async (values) => {
      await onSubmit(values);
      toastService.success('Matter created successfully');
      onClose();
      form.resetForm();
      setCurrentStep(1);
    },
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    if (form.isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
        form.resetForm();
        setCurrentStep(1);
      }
    } else {
      onClose();
      form.resetForm();
      setCurrentStep(1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Matter" size="lg">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                step < currentStep
                  ? 'bg-status-success-600 text-white'
                  : step === currentStep
                  ? 'bg-judicial-blue-600 text-white'
                  : 'bg-neutral-200 dark:bg-metallic-gray-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < totalSteps && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  step < currentStep
                    ? 'bg-status-success-600'
                    : 'bg-neutral-200 dark:bg-metallic-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit} className="space-y-6">
        {/* Step 1: Client Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Client Information</h3>
            <FormInput
              label="Client Name"
              required
              value={form.values.clientName}
              onChange={(e) => form.handleChange('clientName', e.target.value)}
              onBlur={() => form.handleBlur('clientName')}
              error={form.errors.clientName}
              touched={form.touched.clientName}
            />
            <FormInput
              label="Email"
              type="email"
              required
              value={form.values.clientEmail}
              onChange={(e) => form.handleChange('clientEmail', e.target.value)}
              onBlur={() => form.handleBlur('clientEmail')}
              error={form.errors.clientEmail}
              touched={form.touched.clientEmail}
            />
            <FormInput
              label="Phone"
              type="tel"
              value={form.values.clientPhone}
              onChange={(e) => form.handleChange('clientPhone', e.target.value)}
            />
          </div>
        )}

        {/* Step 2: Matter Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Matter Details</h3>
            <FormInput
              label="Matter Name"
              required
              value={form.values.matterName}
              onChange={(e) => form.handleChange('matterName', e.target.value)}
              onBlur={() => form.handleBlur('matterName')}
              error={form.errors.matterName}
              touched={form.touched.matterName}
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Matter Type <span className="text-status-error-600">*</span>
              </label>
              <select
                value={form.values.matterType}
                onChange={(e) => form.handleChange('matterType', e.target.value)}
                onBlur={() => form.handleBlur('matterType')}
                className="w-full px-3 py-2.5 min-h-[44px] border rounded-lg bg-white dark:bg-metallic-gray-900"
              >
                <option value="">Select type</option>
                <option value="litigation">Litigation</option>
                <option value="corporate">Corporate</option>
                <option value="family">Family Law</option>
                <option value="criminal">Criminal</option>
                <option value="other">Other</option>
              </select>
              {form.touched.matterType && form.errors.matterType && (
                <p className="mt-1 text-sm text-status-error-600">{form.errors.matterType}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Description
              </label>
              <textarea
                value={form.values.description}
                onChange={(e) => form.handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-metallic-gray-900"
              />
            </div>
          </div>
        )}

        {/* Step 3: Billing Setup */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Billing Setup</h3>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Billing Type
              </label>
              <div className="space-y-2">
                {(['hourly', 'fixed', 'contingency'] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billingType"
                      value={type}
                      checked={form.values.billingType === type}
                      onChange={(e) => form.handleChange('billingType', e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.values.billingType === 'hourly' && (
              <FormInput
                label="Hourly Rate (ZAR)"
                type="number"
                value={form.values.hourlyRate || ''}
                onChange={(e) => form.handleChange('hourlyRate', parseFloat(e.target.value))}
              />
            )}

            {form.values.billingType === 'fixed' && (
              <FormInput
                label="Fixed Fee (ZAR)"
                type="number"
                value={form.values.fixedFee || ''}
                onChange={(e) => form.handleChange('fixedFee', parseFloat(e.target.value))}
              />
            )}

            {form.values.billingType === 'contingency' && (
              <FormInput
                label="Contingency Percentage (%)"
                type="number"
                value={form.values.contingencyPercentage || ''}
                onChange={(e) => form.handleChange('contingencyPercentage', parseFloat(e.target.value))}
              />
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={currentStep === 1 ? handleClose : handleBack}
            icon={currentStep > 1 ? <ChevronLeft className="w-4 h-4" /> : undefined}
            iconPosition="left"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < totalSteps ? (
            <Button 
              type="button" 
              variant="primary" 
              onClick={handleNext} 
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Next
            </Button>
          ) : (
            <AsyncButton
              type="submit"
              variant="primary"
              onAsyncClick={form.handleSubmit}
              successMessage="Matter created"
              errorMessage="Failed to create matter"
            >
              Create Matter
            </AsyncButton>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default MatterCreationModal;
