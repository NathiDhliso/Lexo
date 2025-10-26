import React, { useState, useEffect } from 'react';
import { X, Briefcase, Save, Calendar, DollarSign } from 'lucide-react';
import { Button, Input, Textarea, Select } from '../design-system/components';
import { LoggedServicesService } from '../../services/api/logged-services.service';
import { RateCardSelector } from '../pricing/RateCardSelector';
import type { LoggedService } from '../../types/financial.types';

interface LogServiceModalProps {
  matterId: string;
  matterTitle: string;
  service?: LoggedService | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isEstimate?: boolean;
  proFormaId?: string;
}

const SERVICE_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'drafting', label: 'Drafting' },
  { value: 'research', label: 'Research' },
  { value: 'court_appearance', label: 'Court Appearance' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'review', label: 'Review' },
  { value: 'other', label: 'Other' },
];

export const LogServiceModal: React.FC<LogServiceModalProps> = ({
  matterId,
  matterTitle,
  service,
  isOpen,
  onClose,
  onSave,
  isEstimate = false,
  proFormaId
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    service_type: 'consultation' as 'consultation' | 'drafting' | 'research' | 'court_appearance' | 'negotiation' | 'review' | 'other',
    description: '',
    estimated_hours: 0,
    unit_rate: 0,
    quantity: 1,
    rate_card_id: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (service) {
      setFormData({
        date: service.service_date || new Date().toISOString().split('T')[0],
        service_type: service.service_type,
        description: service.description || '',
        estimated_hours: service.estimated_hours || 0,
        unit_rate: service.unit_rate || 0,
        quantity: service.quantity || 1,
        rate_card_id: service.rate_card_id || '',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        service_type: 'consultation',
        description: '',
        estimated_hours: 0,
        unit_rate: 0,
        quantity: 1,
        rate_card_id: '',
      });
    }
  }, [service]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.description || formData.description.length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    }

    if (formData.unit_rate <= 0) {
      newErrors.unit_rate = 'Unit rate must be greater than 0';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[LogServiceModal] Form submitted', formData);

    if (!validate()) {
      console.log('[LogServiceModal] Validation failed', errors);
      return;
    }

    setIsSaving(true);
    try {
      console.log('[LogServiceModal] Creating service:', {
        matterId,
        ...formData,
        isEstimate,
        proFormaId
      });

      if (service) {
        await LoggedServicesService.updateService(service.id, {
          service_date: formData.date,
          description: formData.description,
          service_type: formData.service_type,
          estimated_hours: formData.estimated_hours || undefined,
          unit_rate: formData.unit_rate,
          quantity: formData.quantity,
          rate_card_id: formData.rate_card_id || undefined,
        });
      } else {
        await LoggedServicesService.createService({
          matter_id: matterId,
          service_date: formData.date,
          description: formData.description,
          service_type: formData.service_type,
          estimated_hours: formData.estimated_hours || undefined,
          unit_rate: formData.unit_rate,
          quantity: formData.quantity,
          rate_card_id: formData.rate_card_id || undefined,
          is_estimate: isEstimate,
          pro_forma_id: proFormaId,
        });
      }

      console.log('[LogServiceModal] Service saved successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('[LogServiceModal] Error saving service:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRateCardSelect = (rateCardId: string, rate: number) => {
    setFormData(prev => ({
      ...prev,
      rate_card_id: rateCardId,
      unit_rate: rate,
    }));
  };

  const calculateAmount = () => {
    return formData.unit_rate * formData.quantity;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-blue-600 dark:text-mpondo-gold-400" />
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {service ? 'Edit Service' : isEstimate ? 'Add Service (Estimate)' : 'Log Service'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{matterTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  error={errors.date}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Service Type *
                </label>
                <Select
                  value={formData.service_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value as any }))}
                >
                  {SERVICE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the service performed..."
                rows={4}
                error={errors.description}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Rate Card (Optional)
              </label>
              {/* TODO: Fix RateCardSelector props - component expects different interface */}
              <RateCardSelector
                matterType={undefined}
                onEstimateChange={undefined}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Estimated Hours
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Unit Rate (R) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.unit_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_rate: parseFloat(e.target.value) || 0 }))}
                  error={errors.unit_rate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Quantity *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                  error={errors.quantity}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Calculated Amount
              </label>
              <div className="h-10 px-3 py-2 bg-neutral-100 dark:bg-metallic-gray-900 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg flex items-center">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  R{calculateAmount().toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-neutral-200 dark:border-metallic-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : service ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
