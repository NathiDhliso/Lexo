import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../components/design-system/components';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const { user, updateProfile } = useAuth();

  // Real user profile bound to auth/advocate data
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    practiceNumber: '',
    admissionDate: '',
    chambers: '',
    specializations: [] as string[],
    experience: '',
    successRate: '0%',
    totalMatters: 0,
    totalRecovered: 'R0'
  });

  useEffect(() => {
    if (!user) return;
    const md = user.user_metadata || {};
    const ap = user.advocate_profile || {};
    const year = md.year_admitted || new Date().getFullYear();
    const experienceYears = Math.max(0, new Date().getFullYear() - (md.year_admitted || new Date().getFullYear()));
    setUserProfile({
      name: ap.full_name || md.full_name || user.email || '',
      email: user.email || '',
      phone: md.phone_number || '',
      practiceNumber: ap.practice_number || md.practice_number || '',
      admissionDate: `${year}-01-01`,
      chambers: md.chambers_address || '',
      specializations: ap.specialisations || md.specialisations || [],
      experience: `${experienceYears} years`,
      successRate: '0%',
      totalMatters: 0,
      totalRecovered: 'R0'
    });
  }, [user]);

  const handleSave = async () => {
    try {
      const year = userProfile.admissionDate ? Number(userProfile.admissionDate.split('-')[0]) : undefined;
      const updates = {
        full_name: userProfile.name,
        practice_number: userProfile.practiceNumber,
        phone_number: userProfile.phone || undefined,
        chambers_address: userProfile.chambers || undefined,
        specialisations: userProfile.specializations,
        year_admitted: year
      };
      const { error } = await updateProfile(updates);
      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated');
        setIsEditing(false);
      }
    } catch (e) {
      toast.error('Unexpected error updating profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values if needed
  };

  const handleInputChange = (field: string, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon }
  ];

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Profile</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage your professional profile and development</p>
        </div>
        <div className="flex space-x-2">
          {isEditing && (
            <Button onClick={handleSave} variant="primary">
              Save Changes
            </Button>
          )}
          <Button
            onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            variant={isEditing ? "secondary" : "primary"}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-judicial-blue-100 dark:bg-judicial-blue-900/30 rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-judicial-blue-600 dark:text-judicial-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 bg-transparent border-b border-neutral-300 dark:border-metallic-gray-600 focus:border-judicial-blue-500 outline-none"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{userProfile.name}</h2>
                )}
                <span className="badge badge-success">Active</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <div>
                  <p><strong>Email:</strong> {isEditing ? (
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="ml-2 bg-transparent border-b border-neutral-300 dark:border-metallic-gray-600 focus:border-judicial-blue-500 outline-none text-neutral-900 dark:text-neutral-100"
                    />
                  ) : userProfile.email}</p>
                  <p><strong>Phone:</strong> {isEditing ? (
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="ml-2 bg-transparent border-b border-neutral-300 dark:border-metallic-gray-600 focus:border-judicial-blue-500 outline-none text-neutral-900 dark:text-neutral-100"
                    />
                  ) : userProfile.phone}</p>
                  <p><strong>Practice Number:</strong> {isEditing ? (
                    <input
                      type="text"
                      value={userProfile.practiceNumber}
                      onChange={(e) => handleInputChange('practiceNumber', e.target.value)}
                      className="ml-2 bg-transparent border-b border-neutral-300 dark:border-metallic-gray-600 focus:border-judicial-blue-500 outline-none text-neutral-900 dark:text-neutral-100"
                    />
                  ) : userProfile.practiceNumber}</p>
                </div>
                <div>
                  <p><strong>Chambers:</strong> {isEditing ? (
                    <input
                      type="text"
                      value={userProfile.chambers}
                      onChange={(e) => handleInputChange('chambers', e.target.value)}
                      className="ml-2 bg-transparent border-b border-neutral-300 dark:border-metallic-gray-600 focus:border-judicial-blue-500 outline-none text-neutral-900 dark:text-neutral-100"
                    />
                  ) : userProfile.chambers}</p>
                  <p><strong>Admitted:</strong> {new Date(userProfile.admissionDate).toLocaleDateString()}</p>
                  <p><strong>Experience:</strong> {isEditing ? (
                    <input
                      type="text"
                      value={userProfile.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="ml-2 bg-transparent border-b border-neutral-300 dark:border-metallic-gray-600 focus:border-judicial-blue-500 outline-none text-neutral-900 dark:text-neutral-100"
                    />
                  ) : userProfile.experience}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-judicial-blue-600 dark:text-judicial-blue-400">{userProfile.successRate}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Success Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-mpondo-gold-600 dark:text-mpondo-gold-400">{userProfile.totalMatters}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Total Matters</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-status-success-600 dark:text-status-success-400">{userProfile.totalRecovered}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Total Recovered</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200 dark:border-metallic-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-judicial-blue-500 text-judicial-blue-600 dark:text-judicial-blue-400'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-metallic-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Professional Summary</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {userProfile.specializations.map((spec, index) => (
                    <span key={index} className="badge badge-primary">{spec}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Practice Areas</h4>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Experienced advocate specializing in commercial law, contract disputes, and corporate litigation. 
                  Known for strategic thinking and successful case outcomes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Recent Activity</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-status-success-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Completed Advanced Contract Law Course</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-judicial-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Won major commercial dispute case</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">1 week ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-mpondo-gold-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Updated specialization profile</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">2 weeks ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
