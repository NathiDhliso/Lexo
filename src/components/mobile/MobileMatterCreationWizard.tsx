/**
 * MobileMatterCreationWizard Component
 * 
 * Mobile-optimized 2-step wizard for creating new matters.
 * Simplified workflow: Attorney + Fee, Optional Documents
 * 
 * Requirements: 11.3
 */
import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { VoiceInputField } from './VoiceInputButton';
import { MobileTextInput, MobileCurrencyInput } from './MobileFormInputs';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Building2, 
  Check
} from 'lucide-react';
import type { BillingModel } from '../../types/billing.types';
import { useBillingDefaults } from '../../hooks/useBillingDefaults';
import { formatRand } from '../../lib/currency';
import type { NewMatterForm } from '../../types';

interface MobileMatterCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: NewMatterForm) => Promise<void>;
  initialData?: Partial<NewMatterForm>;
}

interface MatterFormData {
  // Step 1: Attorney + Fee
  title: string;
  instructing_firm: string;
  instructing_attorney: string;
  client_name: string;
  billing_model: BillingModel;
  agreed_fee?: number;
  hourly_rate?: number;
  description: string;
  
  // Step 2: Optional Documents (simplified)
  matter_type: string;
  client_email: string;
  client_type: string;
}

const MATTER_TYPES = [
  'Commercial Litigation',
  'Contract Law',
  'Employment Law',
  'Family Law',
  'Criminal Law',
  'Property Law',
  'Other'
];

const CLIENT_TYPES = ['Individual', 'Business', 'Government', 'NGO'];

/**
 * MobileMatterCreationWizard Component
 * 
 * Mobile-specific optimizations:
 * - 2-step simplified workflow
 * - Large form inputs (minimum 48px height)
 * - Voice-to-text support for descriptions
 * - Auto-complete suggestions
 * - Bottom sheet modal design
 * - Touch-friendly navigation
 * 
 * @example
 * ```tsx
 * <MobileMatterCreationWizard
 *   isOpen={showWizard}
 *   onClose={() => setShowWizard(false)}
 *   onComplete={handleMatterCreation}
 * />
 * ```
 */
export const MobileMatterCreationWizard: React.FC<MobileMatterCreationWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData = {}
}) => {
  const { getMatterDefaults } = useBillingDefaults();
  const defaults = getMatterDefaults();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MatterFormData>({
    title: '',
    instructing_firm: '',
    instructing_attorney: '',
    client_name: '',
    billing_model: defaults.billing_model || 'brief-fee',
    description: '',
    matter_type: '',
    client_email: '',
    client_type: 'Individual',
    ...initialData
  });

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof MatterFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);



  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.title &&
          formData.instructing_firm &&
          formData.instructing_attorney &&
          formData.client_name &&
          formData.billing_model &&
          (formData.billing_model === 'time-based' ? formData.hourly_rate : formData.agreed_fee)
        );
      case 2:
        return !!(formData.matter_type && formData.client_type);
      default:
        return false;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsLoading(true);
    try {
      const matterData: NewMatterForm = {
        title: formData.title,
        description: formData.description,
        matterType: formData.matter_type,
        matter_type: formData.matter_type,
        clientName: formData.client_name,
        client_name: formData.client_name,
        clientEmail: formData.client_email,
        client_email: formData.client_email,
        clientType: formData.client_type as any,
        client_type: formData.client_type as any,
        instructingAttorney: formData.instructing_attorney,
        instructing_attorney: formData.instructing_attorney,
        instructingFirm: formData.instructing_firm,
        instructing_firm: formData.instructing_firm,
        feeType: 'Fixed Fee' as any,
        fee_type: 'Fixed Fee' as any,
        estimatedFee: formData.agreed_fee || formData.hourly_rate,
        estimated_fee: formData.agreed_fee || formData.hourly_rate,
        riskLevel: 'Medium' as any,
        risk_level: 'Medium' as any,
        billing_model: formData.billing_model as any,
        billingModel: formData.billing_model as any,
        agreed_fee: formData.agreed_fee,
        agreedFee: formData.agreed_fee,
      };

      await onComplete(matterData);
      onClose();
    } catch (error) {
      console.error('Failed to create matter:', error);
      alert('Failed to create matter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:p-4 sm:items-center">
      <div className={cn(
        "bg-white dark:bg-metallic-gray-900 w-full max-w-lg overflow-hidden",
        "sm:rounded-xl sm:shadow-xl sm:max-h-[90vh]",
        // Mobile: bottom sheet style
        "rounded-t-2xl max-h-[85vh]",
        // Animation
        "animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in-0 duration-300"
      )}>
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white dark:bg-metallic-gray-900 border-b border-neutral-200 dark:border-metallic-gray-700 z-10">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className={cn(
                    "p-2 rounded-lg text-neutral-600 dark:text-neutral-400",
                    "hover:bg-neutral-100 dark:hover:bg-metallic-gray-800",
                    "transition-colors disabled:opacity-50",
                    "mobile-touch-target"
                  )}
                  aria-label="Previous step"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  New Matter
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Step {currentStep} of 2
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300",
                "hover:bg-neutral-100 dark:hover:bg-metallic-gray-800",
                "transition-colors disabled:opacity-50",
                "mobile-touch-target"
              )}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-4 sm:px-6 pb-4">
            <div className="w-full bg-neutral-200 dark:bg-metallic-gray-700 rounded-full h-2">
              <div
                className="bg-mpondo-gold-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 2) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Step 1: Attorney + Fee */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-judicial-blue-100 dark:bg-judicial-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-8 h-8 text-judicial-blue-600 dark:text-judicial-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Attorney & Fee Details
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Basic information about the matter and billing
                  </p>
                </div>

                {/* Matter Title */}
                <div>
                  <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Matter Title *
                  </label>
                  <VoiceInputField
                    value={formData.title}
                    onChange={(value) => handleFieldChange('title', value)}
                    placeholder="e.g., Smith v. Jones Commercial Dispute"
                    language="en-ZA"
                  />
                </div>

                {/* Instructing Firm */}
                <MobileTextInput
                  label="Instructing Firm"
                  value={formData.instructing_firm}
                  onChange={(value) => handleFieldChange('instructing_firm', value)}
                  placeholder="Law firm name"
                  required
                  autoComplete="organization"
                />

                {/* Instructing Attorney */}
                <MobileTextInput
                  label="Instructing Attorney"
                  value={formData.instructing_attorney}
                  onChange={(value) => handleFieldChange('instructing_attorney', value)}
                  placeholder="Attorney name"
                  required
                  autoComplete="name"
                />

                {/* Client Name */}
                <MobileTextInput
                  label="Client Name"
                  value={formData.client_name}
                  onChange={(value) => handleFieldChange('client_name', value)}
                  placeholder="Client name"
                  required
                  autoComplete="name"
                />

                {/* Billing Model */}
                <div>
                  <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Billing Model *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: 'brief-fee' as const, label: 'Brief Fee', desc: 'Fixed fee for the matter' },
                      { value: 'time-based' as const, label: 'Time Based', desc: 'Hourly billing' },
                      { value: 'quick-opinion' as const, label: 'Quick Opinion', desc: 'Fixed consultation fee' },
                    ].map((model) => (
                      <button
                        key={model.value}
                        type="button"
                        onClick={() => handleFieldChange('billing_model', model.value)}
                        className={cn(
                          "p-4 rounded-xl text-left transition-colors border-2",
                          "mobile-touch-target",
                          formData.billing_model === model.value
                            ? "border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20"
                            : "border-neutral-200 dark:border-metallic-gray-600 hover:border-neutral-300 dark:hover:border-metallic-gray-500"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {model.label}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {model.desc}
                            </p>
                          </div>
                          {formData.billing_model === model.value && (
                            <Check className="w-5 h-5 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fee Amount */}
                <MobileCurrencyInput
                  label={formData.billing_model === 'time-based' ? 'Hourly Rate' : 'Fee Amount'}
                  value={formData.billing_model === 'time-based' ? formData.hourly_rate || 0 : formData.agreed_fee || 0}
                  onChange={(value) => {
                    if (formData.billing_model === 'time-based') {
                      handleFieldChange('hourly_rate', value);
                    } else {
                      handleFieldChange('agreed_fee', value);
                    }
                  }}
                  required
                  min={0}
                  step={formData.billing_model === 'time-based' ? 50 : 100}
                  helpText={
                    formData.billing_model === 'time-based' 
                      ? 'Your hourly rate for this matter'
                      : formData.billing_model === 'quick-opinion'
                        ? 'Fixed fee for the legal opinion'
                        : 'The agreed brief fee with the instructing attorney'
                  }
                />

                {/* Description */}
                <div>
                  <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Brief Description
                  </label>
                  <VoiceInputField
                    value={formData.description}
                    onChange={(value) => handleFieldChange('description', value)}
                    placeholder="Brief description of the matter..."
                    multiline={true}
                    rows={4}
                    language="en-ZA"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Optional Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-mpondo-gold-100 dark:bg-mpondo-gold-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Additional Details
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Complete the matter information
                  </p>
                </div>

                {/* Matter Type */}
                <div>
                  <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Matter Type *
                  </label>
                  <select
                    value={formData.matter_type}
                    onChange={(e) => handleFieldChange('matter_type', e.target.value)}
                    required
                    className={cn(
                      "block w-full px-4 py-4 text-base",
                      "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
                      "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
                      "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
                      "mobile-touch-target"
                    )}
                  >
                    <option value="">Select matter type...</option>
                    {MATTER_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Client Type */}
                <div>
                  <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Client Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {CLIENT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleFieldChange('client_type', type)}
                        className={cn(
                          "p-4 rounded-xl text-center transition-colors border-2",
                          "mobile-touch-target",
                          formData.client_type === type
                            ? "border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20 text-mpondo-gold-700 dark:text-mpondo-gold-300"
                            : "border-neutral-200 dark:border-metallic-gray-600 hover:border-neutral-300 dark:hover:border-metallic-gray-500 text-neutral-700 dark:text-neutral-300"
                        )}
                      >
                        <span className="font-medium">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Client Email */}
                <MobileTextInput
                  label="Client Email"
                  type="email"
                  inputMode="email"
                  value={formData.client_email}
                  onChange={(value) => handleFieldChange('client_email', value)}
                  placeholder="client@example.com"
                  autoComplete="email"
                  helpText="Optional - for sending invoices and updates"
                />

                {/* Summary */}
                <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-xl p-4">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    Matter Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Title:</span>
                      <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                        {formData.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Attorney:</span>
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {formData.instructing_attorney}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Client:</span>
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {formData.client_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Billing:</span>
                      <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                        {formData.billing_model === 'time-based' 
                          ? `${formatRand(formData.hourly_rate || 0)}/hour`
                          : formatRand(formData.agreed_fee || 0)
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions - Sticky Bottom */}
        <div className="sticky bottom-0 bg-white dark:bg-metallic-gray-900 border-t border-neutral-200 dark:border-metallic-gray-700 p-4 sm:p-6">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
              size="lg"
              className="flex-1 mobile-touch-target"
            >
              Cancel
            </Button>
            
            {currentStep === 1 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={!validateStep(1)}
                size="lg"
                className="flex-1 mobile-touch-target"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={!validateStep(2) || isLoading}
                size="lg"
                className="flex-1 mobile-touch-target"
                loading={isLoading}
                icon={<Check className="w-5 h-5" />}
              >
                Create Matter
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};