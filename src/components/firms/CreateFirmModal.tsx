import React, { useState, useEffect, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { supabase } from '../../lib/supabase';
import type { FirmCreate } from '../../types/financial.types';
import { toast } from 'react-hot-toast';

interface CreateFirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  firm_name: string;
  attorney_name: string;
  email: string;
  phone_number: string;
  practice_number: string;
  address: string;
}

interface FormErrors {
  firm_name?: string;
  attorney_name?: string;
  email?: string;
  phone_number?: string;
  practice_number?: string;
  address?: string;
}

export const CreateFirmModal: React.FC<CreateFirmModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firm_name: '',
    attorney_name: '',
    email: '',
    phone_number: '',
    practice_number: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        firm_name: '',
        attorney_name: '',
        email: '',
        phone_number: '',
        practice_number: '',
        address: '',
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.firm_name.trim()) {
      newErrors.firm_name = 'Firm name is required';
    } else if (formData.firm_name.trim().length < 2) {
      newErrors.firm_name = 'Firm name must be at least 2 characters';
    }

    if (!formData.attorney_name.trim()) {
      newErrors.attorney_name = 'Attorney name is required';
    } else if (formData.attorney_name.trim().length < 2) {
      newErrors.attorney_name = 'Attorney name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Optional fields validation
    if (formData.phone_number && !/^\+?[\d\s\-()]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (formData.practice_number && formData.practice_number.trim().length < 3) {
      newErrors.practice_number = 'Practice number must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear error for this field when user starts typing
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Create memoized handlers for each field to prevent re-renders
  const handleFirmNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('firm_name', e.target.value);
  }, [handleFieldChange]);

  const handleAttorneyNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('attorney_name', e.target.value);
  }, [handleFieldChange]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('email', e.target.value);
  }, [handleFieldChange]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('phone_number', e.target.value);
  }, [handleFieldChange]);

  const handlePracticeNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('practice_number', e.target.value);
  }, [handleFieldChange]);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleFieldChange('address', e.target.value);
  }, [handleFieldChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      // Prepare firm data
      const firmData: FirmCreate = {
        firm_name: formData.firm_name.trim(),
        attorney_name: formData.attorney_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim() || undefined,
        practice_number: formData.practice_number.trim() || undefined,
        address: formData.address.trim() || undefined,
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('firms')
        .insert([{
          ...firmData,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating firm:', error);
        throw error;
      }

      toast.success(`Firm "${formData.firm_name}" created successfully`);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating firm:', error);
      if (error.code === '23505') {
        // Unique constraint violation
        toast.error('A firm with this email already exists');
      } else {
        toast.error('Failed to create firm. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (loading) return;
    onClose();
  }, [loading, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create New Firm"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Create a new law firm profile. You can invite attorneys to this firm after creation.
          </p>
        </div>

        {/* Firm Name - Required */}
        <FormInput
          label="Firm Name"
          required
          placeholder="e.g., Smith & Associates"
          value={formData.firm_name}
          onChange={handleFirmNameChange}
          error={touched.firm_name ? errors.firm_name : undefined}
          touched={touched.firm_name}
          disabled={loading}
        />

        {/* Attorney Name - Required */}
        <FormInput
          label="Primary Attorney Name"
          required
          placeholder="e.g., John Smith"
          value={formData.attorney_name}
          onChange={handleAttorneyNameChange}
          error={touched.attorney_name ? errors.attorney_name : undefined}
          touched={touched.attorney_name}
          disabled={loading}
        />

        {/* Email - Required */}
        <FormInput
          label="Email Address"
          required
          type="email"
          placeholder="e.g., contact@firm.com"
          value={formData.email}
          onChange={handleEmailChange}
          error={touched.email ? errors.email : undefined}
          touched={touched.email}
          disabled={loading}
        />

        {/* Phone Number - Optional */}
        <FormInput
          label="Phone Number"
          placeholder="e.g., +27 11 123 4567"
          value={formData.phone_number}
          onChange={handlePhoneChange}
          error={touched.phone_number ? errors.phone_number : undefined}
          touched={touched.phone_number}
          disabled={loading}
        />

        {/* Practice Number - Optional */}
        <FormInput
          label="Practice Number"
          placeholder="e.g., 12345/2020"
          value={formData.practice_number}
          onChange={handlePracticeNumberChange}
          error={touched.practice_number ? errors.practice_number : undefined}
          touched={touched.practice_number}
          disabled={loading}
        />

        {/* Address - Optional */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Address</span>
            </div>
          </label>
          <textarea
            placeholder="e.g., 123 Main Street, Johannesburg, 2000"
            value={formData.address}
            onChange={handleAddressChange}
            disabled={loading}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg 
                     bg-white dark:bg-metallic-gray-800 
                     text-neutral-900 dark:text-neutral-100
                     placeholder-neutral-400 dark:placeholder-neutral-500
                     focus:outline-none focus:ring-2 focus:ring-firm-primary-500 dark:focus:ring-firm-primary-400
                     disabled:bg-neutral-100 dark:disabled:bg-metallic-gray-900 disabled:cursor-not-allowed
                     transition-colors duration-200"
          />
          {touched.address && errors.address && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Firm'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
