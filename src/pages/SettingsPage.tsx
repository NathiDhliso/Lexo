/**
 * Settings Page
 * Main settings page with tabs for different settings sections
 */

import React, { useState } from 'react';
import { User, CreditCard, Users, FileText, DollarSign, Cloud, Receipt, Zap } from 'lucide-react';
import { SubscriptionManagement } from '../components/subscription/SubscriptionManagement';
import { TeamManagement } from '../components/settings/TeamManagement';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { PDFTemplateEditor } from '../components/settings/PDFTemplateEditor';
import { RateCardManagement } from '../components/settings/RateCardManagement';
import { CloudStorageSettings } from '../components/settings/CloudStorageSettings';
import { InvoiceSettingsForm } from '../components/settings/InvoiceSettingsForm';
import { InvoiceNumberingAuditLog } from '../components/settings/InvoiceNumberingAuditLog';
import { VATRateHistory } from '../components/settings/VATRateHistory';
import { QuickActionsSettings } from '../components/settings/QuickActionsSettings';

type SettingsTab = 'profile' | 'subscription' | 'team' | 'rate-cards' | 'pdf-templates' | 'cloud-storage' | 'invoicing' | 'quick-actions';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'quick-actions' as SettingsTab, label: 'Quick Actions', icon: Zap },
    { id: 'subscription' as SettingsTab, label: 'Subscription & Billing', icon: CreditCard },
    { id: 'team' as SettingsTab, label: 'Team Members', icon: Users },
    { id: 'invoicing' as SettingsTab, label: 'Invoicing', icon: Receipt },
    { id: 'rate-cards' as SettingsTab, label: 'Rate Cards', icon: DollarSign },
    { id: 'pdf-templates' as SettingsTab, label: 'PDF Templates', icon: FileText },
    { id: 'cloud-storage' as SettingsTab, label: 'Cloud Storage', icon: Cloud },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-neutral-400 dark:text-neutral-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1 bg-white dark:bg-metallic-gray-800 rounded-lg border border-gray-200 dark:border-metallic-gray-700 p-2">
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
                      : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-metallic-gray-700/50'}
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
          <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-gray-200 dark:border-metallic-gray-700 p-6">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'quick-actions' && <QuickActionsSettings />}
            {activeTab === 'subscription' && <SubscriptionManagement />}
            {activeTab === 'team' && <TeamManagement />}
            {activeTab === 'invoicing' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Invoice Settings
                  </h2>
                  <p className="text-gray-600 dark:text-neutral-400">
                    Configure invoice numbering, VAT settings, and SARS compliance
                  </p>
                </div>
                
                <InvoiceSettingsForm />
                
                <div className="border-t border-gray-200 dark:border-metallic-gray-700 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    VAT Rate History
                  </h3>
                  <VATRateHistory />
                </div>
                
                <div className="border-t border-gray-200 dark:border-metallic-gray-700 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Numbering Audit Log
                  </h3>
                  <InvoiceNumberingAuditLog />
                </div>
              </div>
            )}
            {activeTab === 'rate-cards' && <RateCardManagement />}
            {activeTab === 'pdf-templates' && <PDFTemplateEditor />}
            {activeTab === 'cloud-storage' && <CloudStorageSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
