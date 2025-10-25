import React, { useState, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface AddAttorneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  firmName: string;
  attorneyName: string;
  attorneyEmail: string;
  practiceNumber: string;
  phoneNumber: string;
  address: string;
  role: string;
}

interface FormErrors {
  firmName?: string;
  attorneyName?: string;
  attorneyEmail?: string;
  practiceNumber?: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
}

const ATTORNEY_ROLES = [
  { value: 'partner', label: 'Partner' },
  { value: 'senior_associate', label: 'Senior Associate' },
  { value: 'associate', label: 'Associate' },
  { value: 'junior_associate', label: 'Junior Associate' },
  { value: 'attorney', label: 'Attorney' },
];

export const AddAttorneyModal: React.FC<AddAttorneyModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firmName: '',
    attorneyName: '',
    attorneyEmail: '',
    practiceNumber: '',
    phoneNumber: '',
    address: '',
    role: 'attorney',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firmName.trim()) {
      newErrors.firmName = 'Firm name is required';
    }

    if (!formData.attorneyName.trim()) {
      newErrors.attorneyName = 'Attorney name is required';
    } else if (formData.attorneyName.trim().length < 2) {
      newErrors.attorneyName = 'Name must be at least 2 characters';
    }

    if (!formData.attorneyEmail.trim()) {
      newErrors.attorneyEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.attorneyEmail)) {
      newErrors.attorneyEmail = 'Please enter a valid email address';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      // Get current user to set advocate_id
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to add an attorney');
        return;
      }

      // Insert the firm with attorney details
      const { error } = await supabase
        .from('firms')
        .insert({
          firm_name: formData.firmName.trim(),
          attorney_name: formData.attorneyName.trim(),
          email: formData.attorneyEmail.trim().toLowerCase(),
          practice_number: formData.practiceNumber.trim() || null,
          phone_number: formData.phoneNumber.trim() || null,
          address: formData.address.trim() || null,
          status: 'active',
          advocate_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding attorney/firm:', error);
        
        // Handle duplicate email error
        if (error.code === '23505' && error.message.includes('email')) {
          toast.error('An attorney with this email already exists');
        } else {
          toast.error('Failed to add attorney. Please try again.');
        }
        return;
      }

      toast.success(`${formData.attorneyName} added successfully!`);
      
      // Reset form
      setFormData({
        firmName: '',
        attorneyName: '',
        attorneyEmail: '',
        practiceNumber: '',
        phoneNumber: '',
        address: '',
        role: 'attorney',
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form on close
      setFormData({
        firmName: '',
        attorneyName: '',
        attorneyEmail: '',
        practiceNumber: '',
        phoneNumber: '',
        address: '',
        role: 'attorney',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Attorney / Firm"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Add a new attorney and their firm to your network. They will appear in your firms list
          and can be assigned to matters.
        </p>

        {/* Firm Name */}
        <FormInput
          label="Firm Name"
          type="text"
          value={formData.firmName}
          onChange={(e) => handleFieldChange('firmName', e.target.value)}
          error={errors.firmName}
          placeholder="e.g., Smith & Associates"
          required
        />

        {/* Attorney Name */}
        <FormInput
          label="Attorney Name"
          type="text"
          value={formData.attorneyName}
          onChange={(e) => handleFieldChange('attorneyName', e.target.value)}
          error={errors.attorneyName}
          placeholder="e.g., John Smith"
          required
        />

        {/* Attorney Email */}
        <FormInput
          label="Email Address"
          type="email"
          value={formData.attorneyEmail}
          onChange={(e) => handleFieldChange('attorneyEmail', e.target.value)}
          error={errors.attorneyEmail}
          placeholder="e.g., john.smith@firm.com"
          required
        />

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleFieldChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {ATTORNEY_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* Practice Number */}
        <FormInput
          label="Practice Number (Optional)"
          type="text"
          value={formData.practiceNumber}
          onChange={(e) => handleFieldChange('practiceNumber', e.target.value)}
          error={errors.practiceNumber}
          placeholder="e.g., 12345/2020"
        />

        {/* Phone Number */}
        <FormInput
          label="Phone Number (Optional)"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
          error={errors.phoneNumber}
          placeholder="e.g., 011 123 4567"
        />

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address (Optional)
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="e.g., 123 Main Street, Johannesburg, 2000"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            Add Attorney
          </Button>
        </div>
      </div>
    </Modal>
  );
};
