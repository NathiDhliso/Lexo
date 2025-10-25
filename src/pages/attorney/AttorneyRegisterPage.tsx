import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AttorneyService } from '../../services/api/attorney.service';
import { FormInput } from '../../components/ui/FormInput';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import type { Firm } from '../../types/financial.types';
import { CheckCircle, AlertCircle, Building } from 'lucide-react';

export const AttorneyRegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const firmId = searchParams.get('firm_id');
  const token = searchParams.get('token');
  
  const [firmData, setFirmData] = useState<Firm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    attorney_name: '',
    phone_number: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!firmId || !token) {
        setError('Invalid invitation link. Missing required parameters.');
        setLoading(false);
        return;
      }

      try {
        const firm = await AttorneyService.verifyInvitationToken(firmId, token);
        setFirmData(firm);
        
        // Pre-fill form data if available
        setFormData(prev => ({
          ...prev,
          attorney_name: firm.attorney_name || '',
          email: firm.email || ''
        }));
      } catch (err: any) {
        console.error('Token verification error:', err);
        setError(err.message || 'Invalid or expired invitation link');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [firmId, token]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.attorney_name.trim()) {
      errors.attorney_name = 'Attorney name is required';
    }

    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    if (!firmId || !token) {
      toast.error('Invalid invitation link');
      return;
    }

    setSubmitting(true);

    try {
      await AttorneyService.registerViaInvitation({
        firm_id: firmId,
        token: token,
        attorney_name: formData.attorney_name,
        phone_number: formData.phone_number,
        email: formData.email,
        password: formData.password
      });

      // Redirect to matter request page
      navigate('/submit-matter-request');
    } catch (err: any) {
      console.error('Registration error:', err);
      // Error toast is already shown in the service
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mpondo-gold-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-metallic-gray-900 rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Invalid Invitation
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {error}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Please contact the advocate for a new invitation link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-metallic-gray-900 rounded-lg shadow-lg p-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-mpondo-gold-500 text-white flex items-center justify-center text-xs font-bold">1</span>
              Register
            </span>
            <span className="w-8 h-px bg-neutral-300 dark:bg-neutral-600"></span>
            <span className="flex items-center gap-1 opacity-50">
              <span className="w-6 h-6 rounded-full border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-xs font-bold">2</span>
              Submit Matter
            </span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <Building className="w-12 h-12 text-mpondo-gold-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Welcome, {firmData?.firm_name}!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Complete your registration to start submitting matter requests
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Attorney Name"
            type="text"
            value={formData.attorney_name}
            onChange={(e) => handleInputChange('attorney_name', e.target.value)}
            error={formErrors.attorney_name}
            required
            placeholder="Enter your full name"
          />

          <FormInput
            label="Phone Number"
            type="tel"
            value={formData.phone_number}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            error={formErrors.phone_number}
            required
            placeholder="+27 XX XXX XXXX"
          />

          <FormInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={formErrors.email}
            required
            placeholder="your.email@example.com"
          />

          <FormInput
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={formErrors.password}
            required
            placeholder="At least 8 characters"
            helperText="Use at least 8 characters with a mix of letters and numbers"
          />

          <FormInput
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            error={formErrors.confirmPassword}
            required
            placeholder="Re-enter your password"
          />

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Creating Account...' : 'Create Account & Continue'}
            </Button>
          </div>
        </form>

        {/* Security Note */}
        <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-6">
          By registering, you agree to our terms of service and privacy policy.
          Your information is secure and encrypted.
        </p>
      </div>
    </div>
  );
};
