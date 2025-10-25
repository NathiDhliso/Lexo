import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { AttorneyService } from '../../services/api/attorney.service';
import type { Firm, InvitationTokenResponse } from '../../types/financial.types';
import { toast } from 'react-hot-toast';

interface InviteAttorneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  firm: Firm;
}

interface FormData {
  attorneyName: string;
  attorneyEmail: string;
  role: string;
}

interface FormErrors {
  attorneyName?: string;
  attorneyEmail?: string;
  role?: string;
}

const ATTORNEY_ROLES = [
  { value: 'partner', label: 'Partner' },
  { value: 'senior_associate', label: 'Senior Associate' },
  { value: 'associate', label: 'Associate' },
  { value: 'junior_associate', label: 'Junior Associate' },
  { value: 'attorney', label: 'Attorney' },
];

export const InviteAttorneyModal: React.FC<InviteAttorneyModalProps> = ({
  isOpen,
  onClose,
  firm
}) => {
  const [invitationData, setInvitationData] = useState<InvitationTokenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    attorneyName: '',
    attorneyEmail: '',
    role: 'attorney',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        attorneyName: '',
        attorneyEmail: '',
        role: 'attorney',
      });
      setErrors({});
      setTouched({});
      setInvitationData(null);
      setCopied(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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

  // Memoized handlers
  const handleAttorneyNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('attorneyName', e.target.value);
  }, [handleFieldChange]);

  const handleAttorneyEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('attorneyEmail', e.target.value);
  }, [handleFieldChange]);

  const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFieldChange('role', e.target.value);
  }, [handleFieldChange]);

  const generateToken = async () => {
    // Validate form before generating token
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      const data = await AttorneyService.generateInvitationToken(firm.id);
      setInvitationData(data);
      toast.success('Invitation link generated successfully');
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error('Failed to generate invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!invitationData) return;
    
    try {
      await navigator.clipboard.writeText(invitationData.invitation_link);
      setCopied(true);
      toast.success('Invitation link copied to clipboard');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Attorney"
      size="md"
    >
      <div className="space-y-4">
        {/* Firm Info */}
        <div className="bg-firm-primary-50 dark:bg-firm-primary-900/20 border border-firm-primary-200 dark:border-firm-primary-800 rounded-lg p-4">
          <h3 className="font-semibold text-firm-primary-900 dark:text-firm-primary-100 mb-1">
            {firm.firm_name}
          </h3>
          <p className="text-sm text-firm-primary-700 dark:text-firm-primary-300">
            {firm.email}
          </p>
        </div>

        {!invitationData ? (
          <>
            {/* Attorney Details Form */}
            <div className="space-y-4">
              <FormInput
                label="Attorney Name"
                placeholder="Enter attorney's full name"
                value={formData.attorneyName}
                onChange={handleAttorneyNameChange}
                error={errors.attorneyName}
                touched={touched.attorneyName}
                required
              />

              <FormInput
                label="Attorney Email"
                type="email"
                placeholder="attorney@lawfirm.co.za"
                value={formData.attorneyEmail}
                onChange={handleAttorneyEmailChange}
                error={errors.attorneyEmail}
                touched={touched.attorneyEmail}
                required
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Role <span className="text-status-error-600">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={handleRoleChange}
                  className={`
                    w-full px-3 py-2.5 min-h-[44px]
                    border rounded-lg
                    bg-white dark:bg-metallic-gray-800
                    text-neutral-900 dark:text-neutral-100
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-0
                    ${
                      touched.role && errors.role
                        ? 'border-status-error-500 focus:border-status-error-500 focus:ring-status-error-500'
                        : 'border-neutral-300 dark:border-metallic-gray-600 focus:border-mpondo-gold-500 focus:ring-mpondo-gold-500'
                    }
                    hover:border-neutral-400 dark:hover:border-metallic-gray-500
                  `}
                >
                  {ATTORNEY_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {touched.role && errors.role && (
                  <p className="mt-1 text-sm text-status-error-600">{errors.role}</p>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              variant="primary"
              onClick={generateToken}
              loading={loading}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Generating...' : 'Generate Invitation Link'}
            </Button>
          </>
        ) : (
          <>
            {/* Invitation Link */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Invitation Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={invitationData.invitation_link}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm"
                />
                <Button
                  onClick={handleCopy}
                  variant={copied ? 'success' : 'primary'}
                  size="md"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Expiration Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                <Clock className="w-4 h-4" />
                <span>This link expires in 7 days</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
              <p className="font-medium">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Copy the invitation link above</li>
                <li>Send it to {formData.attorneyName} at {formData.attorneyEmail}</li>
                <li>They'll register as {ATTORNEY_ROLES.find(r => r.value === formData.role)?.label}</li>
                <li>Once registered, they can submit matter requests</li>
              </ol>
            </div>

            {/* Generate Another Button */}
            <Button
              variant="secondary"
              onClick={() => setInvitationData(null)}
              fullWidth
            >
              Invite Another Attorney
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};
