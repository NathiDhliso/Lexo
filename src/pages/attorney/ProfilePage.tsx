/**
 * Attorney Profile Page
 * Attorney profile management and settings
 */
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Save,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Globe
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Card, CardContent, Button, Input, Select } from '../../components/design-system/components';

interface AttorneyProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  firm_name?: string;
  practice_areas?: string[];
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  bar_number?: string;
  years_experience?: number;
  specializations?: string[];
  bio?: string;
  website?: string;
  linkedin?: string;
  preferred_communication?: 'email' | 'phone' | 'both';
  notification_preferences?: {
    email_notifications: boolean;
    sms_notifications: boolean;
    matter_updates: boolean;
    invoice_updates: boolean;
    payment_reminders: boolean;
  };
}

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<AttorneyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'preferences'>('personal');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to get existing profile
      const { data: existingProfile, error } = await supabase
        .from('attorney_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        // Create default profile
        const defaultProfile: AttorneyProfile = {
          id: user.id,
          email: user.email || '',
          notification_preferences: {
            email_notifications: true,
            sms_notifications: false,
            matter_updates: true,
            invoice_updates: true,
            payment_reminders: true
          }
        };
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('attorney_profiles')
        .upsert(profile, { onConflict: 'id' });

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (updates: Partial<AttorneyProfile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
  };

  const updateNotificationPreferences = (key: string, value: boolean) => {
    if (!profile) return;
    setProfile({
      ...profile,
      notification_preferences: {
        ...profile.notification_preferences!,
        [key]: value
      }
    });
  };

  const practiceAreas = [
    'Corporate Law',
    'Criminal Law',
    'Family Law',
    'Property Law',
    'Labour Law',
    'Tax Law',
    'Constitutional Law',
    'Commercial Law',
    'Intellectual Property',
    'Environmental Law',
    'Immigration Law',
    'Personal Injury',
    'Estate Planning',
    'Litigation',
    'Arbitration',
    'Other'
  ];

  const provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-metallic-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-neutral-200 dark:bg-metallic-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Profile not found
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Unable to load your profile information
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            My Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your attorney profile and preferences
          </p>
        </div>
        <Button onClick={saveProfile} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-metallic-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'personal', label: 'Personal Info', icon: User },
            { id: 'professional', label: 'Professional', icon: Building },
            { id: 'preferences', label: 'Preferences', icon: Bell }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Personal Information
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPersonalInfo(!showPersonalInfo)}
                >
                  {showPersonalInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              {showPersonalInfo && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateProfile({ full_name: e.target.value })
                      }
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-neutral-100 dark:bg-metallic-gray-800"
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateProfile({ phone: e.target.value })
                      }
                      placeholder="+27 XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Preferred Communication
                    </label>
                    <Select
                      value={profile.preferred_communication || 'email'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                        updateProfile({ preferred_communication: e.target.value as any })
                      }
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="both">Both</option>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Address Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Street Address
                  </label>
                  <Input
                    type="text"
                    value={profile.address || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateProfile({ address: e.target.value })
                    }
                    placeholder="Enter your address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      City
                    </label>
                    <Input
                      type="text"
                      value={profile.city || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateProfile({ city: e.target.value })
                      }
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Province
                    </label>
                    <Select
                      value={profile.province || ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                        updateProfile({ province: e.target.value })
                      }
                    >
                      <option value="">Select Province</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Postal Code
                  </label>
                  <Input
                    type="text"
                    value={profile.postal_code || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateProfile({ postal_code: e.target.value })
                    }
                    placeholder="0000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Professional Information Tab */}
      {activeTab === 'professional' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Professional Details
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Firm Name
                    </label>
                    <Input
                      type="text"
                      value={profile.firm_name || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateProfile({ firm_name: e.target.value })
                      }
                      placeholder="Your law firm name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Bar Number
                    </label>
                    <Input
                      type="text"
                      value={profile.bar_number || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateProfile({ bar_number: e.target.value })
                      }
                      placeholder="Your bar admission number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Years of Experience
                    </label>
                    <Input
                      type="number"
                      value={profile.years_experience || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateProfile({ years_experience: parseInt(e.target.value) || undefined })
                      }
                      placeholder="0"
                      min="0"
                      max="50"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Website
                    </label>
                    <Input
                      type="url"
                      value={profile.website || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateProfile({ website: e.target.value })
                      }
                      placeholder="https://yourfirm.co.za"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      LinkedIn Profile
                    </label>
                    <Input
                      type="url"
                      value={profile.linkedin || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateProfile({ linkedin: e.target.value })
                      }
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Professional Bio
                </label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  placeholder="Brief description of your practice and experience..."
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Practice Areas
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Select the areas of law you practice (hold Ctrl/Cmd to select multiple)
              </p>

              <select
                multiple
                value={profile.practice_areas || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  updateProfile({ practice_areas: selected });
                }}
                className="w-full h-40 px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
              >
                {practiceAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>

              {profile.practice_areas && profile.practice_areas.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Selected areas:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.practice_areas.map(area => (
                      <span
                        key={area}
                        className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Notification Preferences
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Receive notifications via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notification_preferences?.email_notifications || false}
                  onChange={(e) => updateNotificationPreferences('email_notifications', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    SMS Notifications
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Receive notifications via SMS
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notification_preferences?.sms_notifications || false}
                  onChange={(e) => updateNotificationPreferences('sms_notifications', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Matter Updates
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Get notified about updates to your matters
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notification_preferences?.matter_updates || false}
                  onChange={(e) => updateNotificationPreferences('matter_updates', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Invoice Updates
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Get notified about invoice status changes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notification_preferences?.invoice_updates || false}
                  onChange={(e) => updateNotificationPreferences('invoice_updates', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Payment Reminders
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Receive reminders about upcoming payments
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notification_preferences?.payment_reminders || false}
                  onChange={(e) => updateNotificationPreferences('payment_reminders', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;