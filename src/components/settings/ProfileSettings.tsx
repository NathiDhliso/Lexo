/**
 * Profile Settings Component
 */

import React, { useState, useEffect } from 'react';
import { Camera, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { useAuth } from '../../hooks/useAuth';
import { toastService } from '../../services/toast.service';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: user?.email || '',
    phone: '',
    practice_name: '',
    practice_number: '',
    address: '',
    city: '',
    province: '',
    postal_code: ''
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: user.email || '',
          phone: data.phone || '',
          practice_name: data.practice_name || '',
          practice_number: data.practice_number || '',
          address: data.address || '',
          city: data.city || '',
          province: data.province || '',
          postal_code: data.postal_code || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toastService.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toastService.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toastService.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Information</h2>
        <p className="text-sm text-gray-600 dark:text-neutral-400 dark:text-neutral-500">
          Update your personal and practice information
        </p>
      </div>

      {/* Profile Photo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-2xl font-bold text-primary-700 dark:text-primary-400">
            {profileData.first_name?.[0]}{profileData.last_name?.[0]}
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-metallic-gray-300 rounded-full border-2 border-gray-200 dark:border-metallic-gray-400 hover:bg-gray-50 dark:bg-metallic-gray-900 dark:hover:bg-gray-600 dark:bg-metallic-gray-400">
            <Camera className="h-4 w-4 text-gray-600 dark:text-neutral-300 dark:text-neutral-600" />
          </button>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Photo</p>
          <p className="text-xs text-gray-500 dark:text-neutral-400 dark:text-neutral-500">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          value={profileData.first_name}
          onChange={(e) => handleChange('first_name', e.target.value)}
          placeholder="John"
        />
        <FormInput
          label="Last Name"
          value={profileData.last_name}
          onChange={(e) => handleChange('last_name', e.target.value)}
          placeholder="Doe"
        />
        <FormInput
          label="Email"
          type="email"
          value={profileData.email}
          disabled
          placeholder="john@example.com"
        />
        <FormInput
          label="Phone"
          type="tel"
          value={profileData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+27 12 345 6789"
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
          />
          <FormInput
            label="Practice Number"
            value={profileData.practice_number}
            onChange={(e) => handleChange('practice_number', e.target.value)}
            placeholder="12345"
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
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="City"
              value={profileData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Johannesburg"
            />
            <FormInput
              label="Province"
              value={profileData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              placeholder="Gauteng"
            />
            <FormInput
              label="Postal Code"
              value={profileData.postal_code}
              onChange={(e) => handleChange('postal_code', e.target.value)}
              placeholder="2000"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-metallic-gray-700">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
