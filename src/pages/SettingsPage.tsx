/**
 * Settings Page
 * Main settings page with tabs for different settings sections
 */

import React, { useState } from 'react';
import { User, CreditCard, Users, FileText, DollarSign } from 'lucide-react';
import { SubscriptionManagement } from '../components/subscription/SubscriptionManagement';
import { TeamManagement } from '../components/settings/TeamManagement';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { PDFTemplateEditor } from '../components/settings/PDFTemplateEditor';
import { RateCardManagement } from '../components/settings/RateCardManagement';

type SettingsTab = 'profile' | 'subscription' | 'team' | 'rate-cards' | 'pdf-templates';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'subscription' as SettingsTab, label: 'Subscription & Billing', icon: CreditCard },
    { id: 'team' as SettingsTab, label: 'Team Members', icon: Users },
    { id: 'rate-cards' as SettingsTab, label: 'Rate Cards', icon: DollarSign },
    { id: 'pdf-templates' as SettingsTab, label: 'PDF Templates', icon: FileText },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'subscription' && <SubscriptionManagement />}
            {activeTab === 'team' && <TeamManagement />}
            {activeTab === 'rate-cards' && <RateCardManagement />}
            {activeTab === 'pdf-templates' && <PDFTemplateEditor />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
