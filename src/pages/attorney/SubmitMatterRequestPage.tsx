import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { matterApiService } from '../../services/api/matter-api.service';
import { FormInput } from '../../components/ui/FormInput';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { CheckCircle, FileText, AlertCircle } from 'lucide-react';

export const SubmitMatterRequestPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [firmId, setFirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [matterReference, setMatterReference] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    matter_type: 'civil',
    urgency_level: 'standard' as 'low' | 'standard' | 'high'
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get firm_id from authenticated user's session
  useEffect(() => {
    const getUserFirmId = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          toast.error('Please log in to submit a matter request');
          navigate('/login');
          return;
        }

        const userFirmId = user.user_metadata?.firm_id;
        
        if (!userFirmId) {
          toast.error('No firm associated with your account');
          setLoading(false);
          return;
        }

        setFirmId(userFirmId);
      } catch (err) {
        console.error('Error getting user firm:', err);
        toast.error('Failed to load your firm information');
      } finally {
        setLoading(false);
      }
    };

    getUserFirmId();
  }, [navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Matter title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      errors.description = 'Please provide a more detailed description (at least 20 characters)';
    }

    if (!formData.matter_type) {
      errors.matter_type = 'Matter type is required';
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

    if (!firmId) {
      toast.error('No firm ID available');
      return;
    }

    setSubmitting(true);

    try {
      const matter = await matterApiService.createMatterRequest({
        title: formData.title,
        description: formData.description,
        matter_type: formData.matter_type,
        urgency_level: formData.urgency_level,
        firm_id: firmId
      });

      setMatterReference(matter.id);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting matter request:', err);
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

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setMatterReference('');
    setFormData({
      title: '',
      description: '',
      matter_type: 'civil',
      urgency_level: 'standard'
    });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mpondo-gold-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!firmId) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-metallic-gray-900 rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            No Firm Associated
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Your account is not associated with a firm. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-metallic-gray-900 rounded-lg shadow-lg p-8">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1 opacity-50">
                <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                Register
              </span>
              <span className="w-8 h-px bg-neutral-300 dark:bg-neutral-600"></span>
              <span className="flex items-center gap-1">
                <span className="w-6 h-6 rounded-full bg-mpondo-gold-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                Submit Matter
              </span>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Matter Request Submitted!
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Your matter request has been successfully submitted to the advocate for review.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                Matter Reference Number
              </p>
              <p className="text-lg font-mono font-bold text-blue-700 dark:text-blue-300">
                {matterReference}
              </p>
            </div>

            <div className="text-left bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                What happens next?
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>The advocate will review your matter request</li>
                <li>You'll be notified once the advocate accepts or requests more information</li>
                <li>Once accepted, you can track the matter progress</li>
              </ol>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleSubmitAnother}
            >
              Submit Another Request
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
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
            <span className="flex items-center gap-1 opacity-50">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
              Register
            </span>
            <span className="w-8 h-px bg-neutral-300 dark:bg-neutral-600"></span>
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-mpondo-gold-500 text-white flex items-center justify-center text-xs font-bold">2</span>
              Submit Matter
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <FileText className="w-12 h-12 text-mpondo-gold-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Submit Matter Request
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Provide details about the matter you need assistance with
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Matter Title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={formErrors.title}
            required
            placeholder="e.g., Contract Dispute - ABC Corp"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent ${
                formErrors.description
                  ? 'border-red-500'
                  : 'border-neutral-300 dark:border-neutral-600'
              } bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100`}
              placeholder="Provide a detailed description of the matter, including key facts, parties involved, and any urgent considerations..."
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
              {formData.description.length} characters (minimum 20)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Matter Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.matter_type}
              onChange={(e) => handleInputChange('matter_type', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent ${
                formErrors.matter_type
                  ? 'border-red-500'
                  : 'border-neutral-300 dark:border-neutral-600'
              } bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100`}
            >
              <option value="civil">Civil</option>
              <option value="criminal">Criminal</option>
              <option value="commercial">Commercial</option>
              <option value="family">Family</option>
              <option value="labour">Labour</option>
              <option value="constitutional">Constitutional</option>
              <option value="administrative">Administrative</option>
              <option value="other">Other</option>
            </select>
            {formErrors.matter_type && (
              <p className="mt-1 text-sm text-red-500">{formErrors.matter_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Urgency Level
            </label>
            <select
              value={formData.urgency_level}
              onChange={(e) => handleInputChange('urgency_level', e.target.value as 'low' | 'standard' | 'high')}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
            >
              <option value="low">Low - No immediate deadline</option>
              <option value="standard">Standard - Normal processing</option>
              <option value="high">High - Urgent attention needed</option>
            </select>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Submitting Request...' : 'Submit Matter Request'}
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-6">
          The advocate will review your request and contact you within 1-2 business days.
        </p>
      </div>
    </div>
  );
};
