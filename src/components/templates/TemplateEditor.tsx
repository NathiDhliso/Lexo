/**
 * TemplateEditor Component
 * Modal for creating and editing brief fee templates
 */
import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  DollarSign,
  FileText,
  Clock,
  Star
} from 'lucide-react';
import { Button, Input, Textarea } from '../design-system/components';
import { BriefFeeTemplateService } from '../../services/api/brief-fee-template.service';
import { formatRand } from '../../lib/currency';
import type { BriefFeeTemplate, TemplateIncludedService } from '../../types';

interface TemplateEditorProps {
  template: BriefFeeTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  template_name: string;
  case_type: string;
  description: string;
  base_fee: number;
  hourly_rate: number;
  estimated_hours: number;
  included_services: TemplateIncludedService[];
  payment_terms: string;
  cancellation_policy: string;
  additional_notes: string;
  is_default: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const EMPTY_SERVICE: TemplateIncludedService = {
  name: '',
  hours: 0,
  rate: 0,
  amount: 0
};

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormData>({
    template_name: '',
    case_type: '',
    description: '',
    base_fee: 0,
    hourly_rate: 0,
    estimated_hours: 0,
    included_services: [{ ...EMPTY_SERVICE }],
    payment_terms: '',
    cancellation_policy: '',
    additional_notes: '',
    is_default: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseTypes, setCaseTypes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCaseTypes();
      if (template) {
        // Edit mode - populate form
        setFormData({
          template_name: template.template_name,
          case_type: template.case_type,
          description: template.description || '',
          base_fee: template.base_fee,
          hourly_rate: template.hourly_rate || 0,
          estimated_hours: template.estimated_hours || 0,
          included_services: template.included_services.length > 0 
            ? template.included_services 
            : [{ ...EMPTY_SERVICE }],
          payment_terms: template.payment_terms || '',
          cancellation_policy: template.cancellation_policy || '',
          additional_notes: template.additional_notes || '',
          is_default: template.is_default
        });
      } else {
        // Create mode - reset form
        setFormData({
          template_name: '',
          case_type: '',
          description: '',
          base_fee: 0,
          hourly_rate: 0,
          estimated_hours: 0,
          included_services: [{ ...EMPTY_SERVICE }],
          payment_terms: '',
          cancellation_policy: '',
          additional_notes: '',
          is_default: false
        });
      }
      setErrors({});
    }
  }, [isOpen, template]);

  const loadCaseTypes = async () => {
    const types = await BriefFeeTemplateService.getCaseTypes();
    setCaseTypes(types);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.template_name.trim()) {
      newErrors.template_name = 'Template name is required';
    }

    if (!formData.case_type) {
      newErrors.case_type = 'Case type is required';
    }

    if (formData.base_fee <= 0) {
      newErrors.base_fee = 'Base fee must be greater than 0';
    }

    // Validate services
    formData.included_services.forEach((service, index) => {
      if (!service.name.trim()) {
        newErrors[`service_${index}_name`] = 'Service name is required';
      }
      if (service.hours <= 0) {
        newErrors[`service_${index}_hours`] = 'Hours must be greater than 0';
      }
      if (service.rate <= 0) {
        newErrors[`service_${index}_rate`] = 'Rate must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Calculate service amounts
      const servicesWithAmounts = formData.included_services.map(service => ({
        ...service,
        amount: service.hours * service.rate
      }));

      const templateData = {
        template_name: formData.template_name,
        case_type: formData.case_type,
        description: formData.description || undefined,
        base_fee: formData.base_fee,
        hourly_rate: formData.hourly_rate || undefined,
        estimated_hours: formData.estimated_hours || undefined,
        included_services: servicesWithAmounts,
        payment_terms: formData.payment_terms || undefined,
        cancellation_policy: formData.cancellation_policy || undefined,
        additional_notes: formData.additional_notes || undefined,
        is_default: formData.is_default
      };

      if (template) {
        // Update existing template
        await BriefFeeTemplateService.updateTemplate(template.id, templateData);
      } else {
        // Create new template
        await BriefFeeTemplateService.createTemplate(templateData);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      included_services: [...prev.included_services, { ...EMPTY_SERVICE }]
    }));
  };

  const removeService = (index: number) => {
    if (formData.included_services.length === 1) return; // Keep at least one

    setFormData(prev => ({
      ...prev,
      included_services: prev.included_services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index: number, field: keyof TemplateIncludedService, value: string | number) => {
    setFormData(prev => {
      const services = [...prev.included_services];
      services[index] = {
        ...services[index],
        [field]: value
      };

      // Auto-calculate amount
      if (field === 'hours' || field === 'rate') {
        services[index].amount = services[index].hours * services[index].rate;
      }

      return { ...prev, included_services: services };
    });
  };

  const calculateTotalFee = (): number => {
    const servicesTotal = formData.included_services.reduce(
      (sum, service) => sum + (service.amount || 0),
      0
    );
    return formData.base_fee + servicesTotal;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {template ? 'Edit Template' : 'Create Template'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {template ? 'Update your brief fee template' : 'Create a reusable brief fee template'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 
                       rounded-lg hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Template Name *
                  </label>
                  <Input
                    value={formData.template_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, template_name: e.target.value }))
                    }
                    placeholder="e.g., Standard Opinion Template"
                    error={errors.template_name}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Case Type *
                  </label>
                  <select
                    value={formData.case_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, case_type: e.target.value }))}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-metallic-gray-800 
                             text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-judicial-blue-500 
                             focus:border-judicial-blue-500 disabled:opacity-50 ${
                               errors.case_type 
                                 ? 'border-status-error-600' 
                                 : 'border-neutral-300 dark:border-metallic-gray-600'
                             }`}
                  >
                    <option value="">Select case type...</option>
                    {caseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.case_type && (
                    <p className="text-xs text-status-error-600 mt-1">{errors.case_type}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description of what this template is for..."
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-judicial-blue-600 border-neutral-300 rounded 
                           focus:ring-judicial-blue-500 dark:border-metallic-gray-600 
                           dark:bg-metallic-gray-700"
                />
                <label htmlFor="is_default" className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <Star className="w-4 h-4 text-mpondo-gold-600" />
                  Set as default template for this case type
                </label>
              </div>
            </div>

            {/* Fee Structure */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Fee Structure
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Base Fee (R) *
                  </label>
                  <Input
                    type="number"
                    value={formData.base_fee}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, base_fee: parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    error={errors.base_fee}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Hourly Rate (R)
                  </label>
                  <Input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Estimated Hours
                  </label>
                  <Input
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0"
                    min="0"
                    step="0.5"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Included Services */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Included Services
                </h3>
                <Button
                  type="button"
                  onClick={addService}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </Button>
              </div>

              <div className="space-y-3">
                {formData.included_services.map((service, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-neutral-50 
                             dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 
                             dark:border-metallic-gray-700"
                  >
                    {/* Service Name */}
                    <div className="md:col-span-5">
                      <Input
                        value={service.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          updateService(index, 'name', e.target.value)
                        }
                        placeholder="Service name (e.g., Research)"
                        error={errors[`service_${index}_name`]}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Hours */}
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        value={service.hours}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          updateService(index, 'hours', parseFloat(e.target.value) || 0)
                        }
                        placeholder="Hours"
                        min="0"
                        step="0.5"
                        error={errors[`service_${index}_hours`]}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Rate */}
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        value={service.rate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          updateService(index, 'rate', parseFloat(e.target.value) || 0)
                        }
                        placeholder="Rate"
                        min="0"
                        step="0.01"
                        error={errors[`service_${index}_rate`]}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Amount (calculated) */}
                    <div className="md:col-span-2 flex items-center">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {formatRand(service.amount || 0)}
                      </span>
                    </div>

                    {/* Delete */}
                    <div className="md:col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        disabled={formData.included_services.length === 1 || isSubmitting}
                        className="p-2 text-status-error-600 hover:bg-status-error-50 
                                 dark:hover:bg-status-error-900/20 rounded-lg transition-colors 
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Fee Summary */}
              <div className="p-4 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 rounded-lg 
                            border border-judicial-blue-200 dark:border-judicial-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Total Template Fee:
                  </span>
                  <span className="text-2xl font-bold text-judicial-blue-600 dark:text-judicial-blue-400">
                    {formatRand(calculateTotalFee())}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Additional Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Payment Terms
                </label>
                <Textarea
                  value={formData.payment_terms}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setFormData(prev => ({ ...prev, payment_terms: e.target.value }))
                  }
                  placeholder="e.g., 50% upfront, balance within 30 days of invoice"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Cancellation Policy
                </label>
                <Textarea
                  value={formData.cancellation_policy}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setFormData(prev => ({ ...prev, cancellation_policy: e.target.value }))
                  }
                  placeholder="e.g., Full refund if cancelled within 48 hours of acceptance"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Additional Notes
                </label>
                <Textarea
                  value={formData.additional_notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setFormData(prev => ({ ...prev, additional_notes: e.target.value }))
                  }
                  placeholder="Any other relevant information..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 
                        dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-800">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {template ? 'Update Template' : 'Create Template'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
