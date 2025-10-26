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
  initialFirmName?: string;
}

interface FormData {
  firmName: string;
  attorneyName: string;
  attorneyEmail: string;
}

interface FormErrors {
  firmName?: string;
  attorneyName?: string;
  attorneyEmail?: string;
}

export const AddAttorneyModal: React.FC<AddAttorneyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialFirmName = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firmName: initialFirmName,
    attorneyName: '',
    attorneyEmail: '',
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
        firmName: initialFirmName,
        attorneyName: '',
        attorneyEmail: '',
      });
      setErrors({});
      onClose();
    }
  };

  // Update form when initialFirmName changes
  React.useEffect(() => {
    if (isOpen && initialFirmName) {
      setFormData(prev => ({ ...prev, firmName: initialFirmName }));
    }
  }, [isOpen, initialFirmName]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Attorney"
      size="md"
    >
      <div className="space-y-4">
        <FormInput
          label="Firm Name"
          type="text"
          value={formData.firmName}
          onChange={(e) => handleFieldChange('firmName', e.target.value)}
          error={errors.firmName}
          placeholder="Smith & Associates"
          required
        />

        <FormInput
          label="Attorney Name"
          type="text"
          value={formData.attorneyName}
          onChange={(e) => handleFieldChange('attorneyName', e.target.value)}
          error={errors.attorneyName}
          placeholder="John Smith"
          required
        />

        <FormInput
          label="Email"
          type="email"
          value={formData.attorneyEmail}
          onChange={(e) => handleFieldChange('attorneyEmail', e.target.value)}
          error={errors.attorneyEmail}
          placeholder="john.smith@firm.com"
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
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
