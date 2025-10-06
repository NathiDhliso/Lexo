import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  LogOut,
  Settings as SettingsIcon,
  Mail,
  Phone,
  Building,
  CreditCard,
  FileText,
  Clock,
  AlertCircle,
  Layout
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Icon } from '../design-system/components';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts';
    dataSharing: boolean;
    analytics: boolean;
  };
  billing: {
    autoInvoice: boolean;
    reminderDays: number;
    defaultPaymentTerms: number;
  };
}

const SettingsPage: React.FC = () => {
  const { user, signOut, updateProfile, operationLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en',
    timezone: 'Africa/Johannesburg',
    dateFormat: 'DD/MM/YYYY',
    currency: 'ZAR',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true,
    },
    billing: {
      autoInvoice: true,
      reminderDays: 7,
      defaultPaymentTerms: 30,
    },
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    firm: user?.firm_name || '',
    practiceAreas: user?.practice_areas || [],
    bio: user?.bio || '',
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'templates', label: 'PDF Templates', icon: Layout },
    { id: 'data', label: 'Data & Export', icon: Download },
  ];

  const handleSaveProfile = async () => {
    try {
      const { error } = await updateProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        firm_name: profileData.firm,
        practice_areas: profileData.practiceAreas,
        bio: profileData.bio,
      });

      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handlePreferenceChange = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSavePreferences = () => {
    // Here you would typically save to your backend
    toast.success('Preferences saved successfully');
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Profile Information</h3>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSaveProfile} variant="primary" disabled={operationLoading.updateProfile}>
                <Save className="w-4 h-4 mr-2" />
                {operationLoading.updateProfile ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="secondary">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="primary">
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">First Name</label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 disabled:bg-neutral-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Last Name</label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 disabled:bg-neutral-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
          <input
            type="email"
            value={profileData.email}
            disabled
            className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-100 text-neutral-500"
          />
          <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 disabled:bg-neutral-100"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Law Firm</label>
          <input
            type="text"
            value={profileData.firm}
            onChange={(e) => setProfileData(prev => ({ ...prev, firm: e.target.value }))}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 disabled:bg-neutral-100"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Bio</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 disabled:bg-neutral-100"
            placeholder="Tell us about your practice and experience..."
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Notification Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-neutral-900">Email Notifications</h4>
            <p className="text-sm text-neutral-600">Receive notifications via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications.email}
              onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${preferences.notifications.email ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.notifications.email ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-neutral-900">Push Notifications</h4>
            <p className="text-sm text-neutral-600">Receive push notifications in browser</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications.push}
              onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${preferences.notifications.push ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.notifications.push ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-neutral-900">SMS Notifications</h4>
            <p className="text-sm text-neutral-600">Receive important updates via SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications.sms}
              onChange={(e) => handlePreferenceChange('notifications', 'sms', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${preferences.notifications.sms ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.notifications.sms ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>
      </div>

      <Button onClick={handleSavePreferences} variant="primary">
        Save Notification Preferences
      </Button>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Privacy & Security</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-neutral-900 mb-2">Profile Visibility</h4>
          <select
            value={preferences.privacy.profileVisibility}
            onChange={(e) => handlePreferenceChange('privacy', 'profileVisibility', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="contacts">Contacts Only</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-neutral-900">Data Sharing</h4>
            <p className="text-sm text-neutral-600">Allow sharing anonymized data for research</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.privacy.dataSharing}
              onChange={(e) => handlePreferenceChange('privacy', 'dataSharing', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${preferences.privacy.dataSharing ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.privacy.dataSharing ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
        <p className="text-sm text-red-700 mb-3">These actions cannot be undone.</p>
        <Button variant="secondary" className="text-red-600 border-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Appearance</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-neutral-900 mb-2">Theme</h4>
          <div className="grid grid-cols-3 gap-3">
            {['light', 'dark', 'system'].map((theme) => (
              <button
                key={theme}
                onClick={() => handlePreferenceChange('appearance', 'theme', theme)}
                className={`p-3 border rounded-lg text-center capitalize ${
                  preferences.theme === theme 
                    ? 'border-judicial-blue-500 bg-judicial-blue-50' 
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-neutral-900 mb-2">Language</h4>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('appearance', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
          >
            <option value="en">English</option>
            <option value="af">Afrikaans</option>
            <option value="zu">Zulu</option>
            <option value="xh">Xhosa</option>
          </select>
        </div>

        <div>
          <h4 className="font-medium text-neutral-900 mb-2">Timezone</h4>
          <select
            value={preferences.timezone}
            onChange={(e) => handlePreferenceChange('appearance', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
          >
            <option value="Africa/Johannesburg">South Africa (SAST)</option>
            <option value="UTC">UTC</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="America/New_York">New York (EST)</option>
          </select>
        </div>
      </div>

      <Button onClick={handleSavePreferences} variant="primary">
        Save Appearance Settings
      </Button>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Billing Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-neutral-900">Auto-generate Invoices</h4>
            <p className="text-sm text-neutral-600">Automatically create invoices when matters are completed</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.billing.autoInvoice}
              onChange={(e) => handlePreferenceChange('billing', 'autoInvoice', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${preferences.billing.autoInvoice ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.billing.autoInvoice ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>

        <div>
          <h4 className="font-medium text-neutral-900 mb-2">Payment Reminder (Days)</h4>
          <input
            type="number"
            value={preferences.billing.reminderDays}
            onChange={(e) => handlePreferenceChange('billing', 'reminderDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
            min="1"
            max="30"
          />
        </div>

        <div>
          <h4 className="font-medium text-neutral-900 mb-2">Default Payment Terms (Days)</h4>
          <select
            value={preferences.billing.defaultPaymentTerms}
            onChange={(e) => handlePreferenceChange('billing', 'defaultPaymentTerms', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      <Button onClick={handleSavePreferences} variant="primary">
        Save Billing Preferences
      </Button>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Data Management</h3>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-neutral-900">Export Data</h4>
                <p className="text-sm text-neutral-600">Download all your data in JSON format</p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-neutral-900">Data Usage</h4>
                <p className="text-sm text-neutral-600">View your current data usage and storage</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-neutral-900">2.4 GB used</div>
                <div className="text-xs text-neutral-600">of 10 GB limit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">PDF Templates</h3>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-neutral-900">Customize PDF Templates</h4>
                <p className="text-sm text-neutral-600">Design and customize your pro forma and invoice PDF templates</p>
              </div>
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/pdf-templates'}
              >
                <Layout className="w-4 h-4 mr-2" />
                Open Designer
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">Pro Forma Template</h4>
                  <p className="text-xs text-neutral-600">Customize your pro forma layout</p>
                </div>
              </div>
              <div className="text-xs text-neutral-600 space-y-1">
                <p>• Header and branding</p>
                <p>• Color schemes</p>
                <p>• Typography settings</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">Invoice Template</h4>
                  <p className="text-xs text-neutral-600">Customize your invoice layout</p>
                </div>
              </div>
              <div className="text-xs text-neutral-600 space-y-1">
                <p>• Professional formatting</p>
                <p>• Payment terms</p>
                <p>• VAT compliance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">Template Guidelines</h4>
                <div className="text-sm text-neutral-600 space-y-1">
                  <p>• Templates must comply with Bar Council requirements</p>
                  <p>• Include all mandatory legal practice information</p>
                  <p>• Maintain professional appearance and readability</p>
                  <p>• Test templates with sample data before use</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'billing':
        return renderBillingTab();
      case 'templates':
        return renderTemplatesTab();
      case 'data':
        return renderDataTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-1">Manage your account settings and preferences</p>
        </div>
        <Button onClick={handleSignOut} variant="secondary" disabled={operationLoading.signOut}>
          <LogOut className="w-4 h-4 mr-2" />
          {operationLoading.signOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-judicial-blue-50 text-judicial-blue-700 border-r-2 border-judicial-blue-500'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;