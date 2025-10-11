import React, { useState } from 'react';
import { X, Zap, AlertCircle } from 'lucide-react';
import { Button, Input, Textarea, Select } from '../design-system/components';
import { matterApiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import type { QuickCreateMatterRequest } from '../../types';

interface QuickCreateMatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (matterId: string) => void;
}

export const QuickCreateMatterModal: React.FC<QuickCreateMatterModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuickCreateMatterRequest>({
    title: '',
    client_name: '',
    instructing_attorney: '',
    urgency: 'standard',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof QuickCreateMatterRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Matter title is required';
    }

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }

    if (!formData.instructing_attorney.trim()) {
      newErrors.instructing_attorney = 'Instructing attorney is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const matterData = {
        advocate_id: user?.id,
        title: formData.title,
        client_name: formData.client_name,
        instructing_attorney: formData.instructing_attorney,
        urgency: formData.urgency || 'standard',
        description: formData.description || 'Quick create - details to be added',
        creation_source: 'quick_create',
        is_quick_create: true,
        status: 'active'
      };

      const { data, error } = await matterApiService.create(matterData);

      if (error) {
        toast.error(error.message || 'Failed to create matter');
        return;
      }

      toast.success('Matter created successfully! You can add more details later.');
      
      if (onSuccess && data) {
        onSuccess(data.id);
      }

      onClose();
      
      setFormData({
        title: '',
        client_name: '',
        instructing_attorney: '',
        urgency: 'standard',
        description: ''
      });
    } catch (error) {
      console.error('Error creating matter:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-metallic-gray-800 border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Quick Create Matter</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Create a matter with minimal details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Perfect for urgent instructions</p>
                <p>Create a matter quickly with just the essential details. You can add more information like contact details, fee arrangements, and case specifics later.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Matter Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Smith v Jones - Urgent Opinion"
                error={errors.title}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Client Name *
              </label>
              <Input
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                placeholder="Full name or company name"
                error={errors.client_name}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Instructing Attorney *
              </label>
              <Input
                value={formData.instructing_attorney}
                onChange={(e) => handleInputChange('instructing_attorney', e.target.value)}
                placeholder="Attorney name"
                error={errors.instructing_attorney}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Urgency Level
              </label>
              <Select
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="routine">Routine</option>
                <option value="standard">Standard</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Brief Description (Optional)
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Quick notes about the matter..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Create Matter</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
