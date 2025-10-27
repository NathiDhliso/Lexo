/**
 * Profile Settings Component
 */

import React, { useMemo } from 'react';
import { Camera, Save, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { useAuth } from '../../hooks/useAuth';
import { useDataFetch } from '../../hooks/useDataFetch';
import { useModalForm } from '../../hooks/useModalForm';
import { useOnboarding } from '../../hooks/useOnboarding';
import { createValidator, required, email, minLength } from '../../utils/validation.utils';
import { supabase } from '../../lib/supabase';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  practice_name: string;
  practice_number: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { openOnboarding, resetOnboarding } = useOnboarding();

  // Load profile data with caching
  const { data: profileDataRaw, isLoading, error: loadError, refetch } = useDataFetch(
    `profile-${user?.id}`,
    async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || {};
    },
    {
      enabled: !!user,
      cacheDuration: 600000, // Cache for 10 minutes
    }
  );

  // Create validator for profile form
  const validator = useMemo(() => createValidator<ProfileData>({
    first_name: [required(), minLength(2)],
    last_name: [required(), minLength(2)],
    email: [required(), email()],
    phone: [],
    practice_name: [],
    practice_number: [],
    address: [],
    city: [],
    province: [],
    postal_code: [],
  }), []);

  // Use modal form hook for form management
  const {
    formData: profileData,
    isLoading: isSaving,
    error: saveError,
    validationErrors,
    handleChange,
    handleSubmit,
    setFormData,
  } = useModalForm<ProfileData>({
    initialData: {
      first_name: profileDataRaw?.first_name || '',
      last_name: profileDataRaw?.last_name || '',
      email: user?.email || '',
      phone: profileDataRaw?.phone || '',
      practice_name: profileDataRaw?.practice_name || '',
      practice_number: profileDataRaw?.practice_number || '',
      address: profileDataRaw?.address || '',
      city: profileDataRaw?.city || '',
      province: profileDataRaw?.province || '',
      postal_code: profileDataRaw?.postal_code || '',
    },
    onSubmit: async (data) => {
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Refetch the data to update cache
      await refetch();
    },
    validate: (data) => {
      const result = validator.validate(data);
      return result.isValid ? null : result.errors;
    },
    successMessage: 'Profile updated successfully!',
    resetOnSuccess: false, // Don't reset form after save
  });

  // Update form data when profile data loads
  React.useEffect(() => {
    if (profileDataRaw) {
      setFormData({
        first_name: profileDataRaw.first_name || '',
        last_name: profileDataRaw.last_name || '',
        email: user?.email || '',
        phone: profileDataRaw.phone || '',
        practice_name: profileDataRaw.practice_name || '',
        practice_number: profileDataRaw.practice_number || '',
        address: profileDataRaw.address || '',
        city: profileDataRaw.city || '',
        province: profileDataRaw.province || '',
        postal_code: profileDataRaw.postal_code || '',
      });
    }
  }, [profileDataRaw, user?.email, setFormData]);

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (loadError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load profile data</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Information</h2>
        <p className="text-sm text-gray-600 dark:text-neutral-400">
          Update your personal and practice information
        </p>
      </div>

      {/* Profile Photo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-2xl font-bold text-primary-700 dark:text-primary-400">
            {profileData.first_name?.[0]}{profileData.last_name?.[0]}
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-metallic-gray-700 rounded-full border-2 border-gray-200 dark:border-metallic-gray-600 hover:bg-gray-50 dark:hover:bg-metallic-gray-600">
            <Camera className="h-4 w-4 text-gray-600 dark:text-neutral-300" />
          </button>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Photo</p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormInput
            label="First Name"
            value={profileData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            placeholder="John"
            disabled={isSaving}
          />
          {validationErrors.first_name && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.first_name}</p>
          )}
        </div>
        <div>
          <FormInput
            label="Last Name"
            value={profileData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            placeholder="Doe"
            disabled={isSaving}
          />
          {validationErrors.last_name && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.last_name}</p>
          )}
        </div>
        <div>
          <FormInput
            label="Email"
            type="email"
            value={profileData.email}
            disabled
            placeholder="john@example.com"
          />
          {validationErrors.email && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
          )}
        </div>
        <FormInput
          label="Phone"
          type="tel"
          value={profileData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+27 12 345 6789"
          disabled={isSaving}
        />
      </div>

      {/* Practice Information */}
      <div className="pt-6 border-t border-gray-200 dark:border-metallic-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Practice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Practice Name"
            value={profileData.practice_name}
            onChange={(e) => handleChange('practice_name', e.target.value)}
            placeholder="Doe & Associates"
            disabled={isSaving}
          />
          <FormInput
            label="Practice Number"
            value={profileData.practice_number}
            onChange={(e) => handleChange('practice_number', e.target.value)}
            placeholder="12345"
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="pt-6 border-t border-gray-200 dark:border-metallic-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Address</h3>
        <div className="space-y-4">
          <FormInput
            label="Street Address"
            value={profileData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="123 Main Street"
            disabled={isSaving}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="City"
              value={profileData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Johannesburg"
              disabled={isSaving}
            />
            <FormInput
              label="Province"
              value={profileData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              placeholder="Gauteng"
              disabled={isSaving}
            />
            <FormInput
              label="Postal Code"
              value={profileData.postal_code}
              onChange={(e) => handleChange('postal_code', e.target.value)}
              placeholder="2000"
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {saveError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {saveError.message || 'Failed to save profile'}
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-metallic-gray-700">
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Setup Guide Section */}
      <div className="pt-6 border-t border-gray-200 dark:border-metallic-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Need Help Getting Started?</h3>
        <div className="bg-judicial-blue-50 dark:bg-judicial-blue-900/20 border border-judicial-blue-200 dark:border-judicial-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-judicial-blue-600 rounded-full flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-judicial-blue-900 dark:text-judicial-blue-100 mb-1">
                Reopen Setup Guide
              </h4>
              <p className="text-sm text-judicial-blue-700 dark:text-judicial-blue-300 mb-3">
                Walked through the setup wizard yet? Or need to revisit billing preferences and templates? You can reopen the setup guide anytime.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  resetOnboarding(); // Clear dismissal flag
                  openOnboarding(); // Open the modal
                }}
                className="flex items-center gap-2 text-sm"
              >
                <HelpCircle className="h-4 w-4" />
                Open Setup Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
