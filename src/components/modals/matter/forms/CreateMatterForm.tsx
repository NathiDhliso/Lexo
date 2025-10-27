/**
 * CreateMatterForm - Full matter creation wizard
 * Extracted from MatterCreationModal
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { AsyncButton } from '../../../ui/AsyncButton';
import { FormInput } from '../../../ui/FormInput';
import { useForm } from '../../../../hooks/useForm';
import { toastService } from '../../../../services/toast.service';
import { matterApiService } from '../../../../services/api/matter-api.service';
import { BillingModelSelector } from '../../../matters/BillingModelSelector';
import { BillingModel } from '../../../../services/billing-strategies';
import { useBillingPreferences } from '../../../../hooks/useBillingPreferences';
import type { Matter } from '../../../../types';

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
  billingModel: BillingModel;
  hourlyRate?: number;
  estimatedFee?: number;
  feeCap?: number;
}

export interface CreateMatterFormProps {
  onSuccess: (matter: Matter) => void;
  onClose: () => void;
  firmId?: string;
  prefillData?: Partial<Matter>;
}

export const CreateMatterForm: React.FC<CreateMatterFormProps> = ({
  onSuccess,
  onClose,
  firmId,
  prefillData,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Get user's billing preferences to pre-select default billing model
  const { preferences, loading: preferencesLoading } = useBillingPreferences();
  const defaultBillingModel = preferences?.default_billing_model || BillingModel.BRIEF_FEE;

  const form = useForm<MatterFormData>({
    initialValues: {
      clientName: prefillData?.client_name || '',
      clientEmail: prefillData?.client_email || '',
      clientPhone: prefillData?.client_phone || '',
      matterName: prefillData?.title || '',
      matterType: prefillData?.matter_type || '',
      description: prefillData?.description || '',
      billingModel: (prefillData?.billing_model as BillingModel) || defaultBillingModel,
      estimatedFee: prefillData?.estimated_fee,
      hourlyRate: prefillData?.hourly_rate,
      feeCap: prefillData?.fee_cap,
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
      try {
        const matterData = {
          title: values.matterName,
          matter_type: values.matterType,
          description: values.description,
          client_name: values.clientName,
          client_email: values.clientEmail,
          client_phone: values.clientPhone,
          billing_model: values.billingModel,
          estimated_fee: values.estimatedFee,
          hourly_rate: values.hourlyRate,
          fee_cap: values.feeCap,
          firm_id: firmId,
          status: 'active',
          ...prefillData,
        };

        const result = await matterApiService.create(matterData as any);
        
        if (result.error || !result.data) {
          throw new Error(result.error?.message || 'Failed to create matter');
        }

        toastService.success('Matter created successfully');
        onSuccess(result.data);
        onClose();
        form.resetForm();
        setCurrentStep(1);
      } catch (error: any) {
        toastService.error(error.message || 'Failed to create matter');
        throw error;
      }
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
    <div>
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Billing Model</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Select how you'll bill for this matter. This determines how fees are calculated and tracked.
              </p>
              <BillingModelSelector
                value={form.values.billingModel}
                onChange={(model) => form.handleChange('billingModel', model)}
                disabled={preferencesLoading}
              />
            </div>

            {/* Brief Fee & Quick Opinion - Estimated Fee */}
            {(form.values.billingModel === BillingModel.BRIEF_FEE || 
              form.values.billingModel === BillingModel.QUICK_OPINION) && (
              <FormInput
                label={form.values.billingModel === BillingModel.BRIEF_FEE ? "Agreed Brief Fee (ZAR)" : "Consultation Fee (ZAR)"}
                type="number"
                required
                value={form.values.estimatedFee || ''}
                onChange={(e) => form.handleChange('estimatedFee', parseFloat(e.target.value) || undefined)}
                placeholder="Enter the agreed fee"
              />
            )}

            {/* Time-Based - Hourly Rate & Optional Fee Cap */}
            {form.values.billingModel === BillingModel.TIME_BASED && (
              <>
                <FormInput
                  label="Hourly Rate (ZAR)"
                  type="number"
                  required
                  value={form.values.hourlyRate || ''}
                  onChange={(e) => form.handleChange('hourlyRate', parseFloat(e.target.value) || undefined)}
                  placeholder="Enter your hourly rate"
                />
                <div>
                  <FormInput
                    label="Fee Cap (Optional)"
                    type="number"
                    value={form.values.feeCap || ''}
                    onChange={(e) => form.handleChange('feeCap', parseFloat(e.target.value) || undefined)}
                    placeholder="Maximum fee for this matter"
                  />
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Set a maximum fee limit for time-based billing
                  </p>
                </div>
              </>
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
    </div>
  );
};

export default CreateMatterForm;
