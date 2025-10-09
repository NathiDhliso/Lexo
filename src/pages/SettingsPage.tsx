import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Eye,
  Edit3,
  FileText,
  AlertCircle,
  Briefcase,
  Receipt,
  FileCheck,
  Workflow,
  DollarSign,
  Target,
  BarChart3,
  Plus
} from 'lucide-react';
import { Card, CardContent, Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Input, Select, Textarea } from '../components/design-system/components';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { rateCardService, RateCard, StandardServiceTemplate, ServiceCategory, PricingType, CreateRateCardRequest } from '../services/rate-card.service';
import { PDFTemplateEditor } from '../components/settings/PDFTemplateEditor';

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
    proFormaUpdates: boolean;
    matterDeadlines: boolean;
    invoiceReminders: boolean;
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
  workflow: {
    autoProgressMatters: boolean;
    requireApprovalForInvoices: boolean;
    defaultHourlyRate: number;
    autoTimeTracking: boolean;
    proFormaExpiryDays: number;
  };
  integrations: {
    calendarSync: boolean;
    emailIntegration: boolean;
    documentStorage: string;
    backupFrequency: string;
  };
}

const SettingsPage: React.FC = () => {
  const { } = useAuth();
  const [activeTab, setActiveTab] = useState('workflow');
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
      proFormaUpdates: true,
      matterDeadlines: true,
      invoiceReminders: true,
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true,
    },
    billing: {
      autoInvoice: false,
      reminderDays: 7,
      defaultPaymentTerms: 30,
    },
    workflow: {
      autoProgressMatters: false,
      requireApprovalForInvoices: true,
      defaultHourlyRate: 1500,
      autoTimeTracking: true,
      proFormaExpiryDays: 30,
    },
    integrations: {
      calendarSync: false,
      emailIntegration: false,
      documentStorage: 'local',
      backupFrequency: 'weekly',
    },
  });


  // Rate card management state
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [standardTemplates, setStandardTemplates] = useState<StandardServiceTemplate[]>([]);
  const [isLoadingRateCards, setIsLoadingRateCards] = useState(false);
  const [showCreateRateCardModal, setShowCreateRateCardModal] = useState(false);
  const [showRateCards, setShowRateCards] = useState(true); // Toggle between rate cards and templates
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards'); // Toggle between cards and list view

  const [createRateCardForm, setCreateRateCardForm] = useState<CreateRateCardRequest>({
    service_name: '',
    service_description: '',
    service_category: 'consultation' as ServiceCategory,
    matter_type: '',
    pricing_type: 'hourly' as PricingType,
    hourly_rate: 2500,
    fixed_fee: 0,
    minimum_fee: undefined,
    maximum_fee: undefined,
    estimated_hours_min: 1,
    estimated_hours_max: 1,
    is_default: false,
    requires_approval: false
  });
  const [createLoading, setCreateLoading] = useState(false);
  const serviceCategories: { value: ServiceCategory; label: string }[] = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'research', label: 'Research' },
    { value: 'drafting', label: 'Drafting' },
    { value: 'court_appearance', label: 'Court Appearance' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'document_review', label: 'Document Review' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'filing', label: 'Filing' },
    { value: 'travel', label: 'Travel' },
    { value: 'other', label: 'Other' }
  ];

  const tabs = [
    { id: 'workflow', label: 'Workflow Settings', icon: Workflow },
    { id: 'ratecards', label: 'Rate Cards', icon: DollarSign },
    { id: 'templates', label: 'PDF Templates', icon: FileText },
  ];


  const handlePreferenceChange = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => {
      const sectionData = prev[section];
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [key]: value,
          },
        };
      }
      return prev;
    });
  };

  const handleSavePreferences = () => {
    // Here you would typically save to your backend
    toast.success('Preferences saved successfully');
  };

  // Rate card management functions
  const loadRateCards = async () => {
    setIsLoadingRateCards(true);
    try {
      const cards = await rateCardService.getRateCards();
      setRateCards(cards);
    } catch (error) {
      toast.error('Failed to load rate cards');
    } finally {
      setIsLoadingRateCards(false);
    }
  };

  const loadStandardTemplates = async () => {
    try {
      const templates = await rateCardService.getStandardServiceTemplates();
      setStandardTemplates(templates);
    } catch (error) {
      toast.error('Failed to load standard templates');
    }
  };

  const handleCreateFromTemplate = async (template: StandardServiceTemplate) => {
    try {
      const newRateCard = await rateCardService.createFromTemplate(template.id);
      setRateCards(prev => [...prev, newRateCard]);
      toast.success('Rate card created successfully');
    } catch (error) {
      toast.error('Failed to create rate card');
    }
  };

  const handleDeleteRateCard = async (id: string) => {
    try {
      await rateCardService.delete(id);
      setRateCards(prev => prev.filter(card => card.id !== id));
      toast.success('Rate card deleted successfully');
    } catch (error) {
      toast.error('Failed to delete rate card');
    }
  };

  const handleCreateRateCardSubmit = async () => {
    try {
      if (!createRateCardForm.service_name.trim()) {
        toast.error('Please enter a service name');
        return;
      }
      setCreateLoading(true);
      const request: CreateRateCardRequest = {
        service_name: createRateCardForm.service_name.trim(),
        service_description: createRateCardForm.service_description?.trim() || undefined,
        service_category: createRateCardForm.service_category,
        matter_type: createRateCardForm.matter_type?.trim() || undefined,
        pricing_type: createRateCardForm.pricing_type,
        hourly_rate: createRateCardForm.pricing_type === 'hourly' ? createRateCardForm.hourly_rate : undefined,
        fixed_fee: createRateCardForm.pricing_type === 'fixed' ? createRateCardForm.fixed_fee : undefined,
        minimum_fee: createRateCardForm.minimum_fee,
        maximum_fee: createRateCardForm.maximum_fee,
        estimated_hours_min: createRateCardForm.estimated_hours_min,
        estimated_hours_max: createRateCardForm.estimated_hours_max,
        is_default: createRateCardForm.is_default || false,
        requires_approval: createRateCardForm.requires_approval || false
      };
      const newRateCard = await rateCardService.createRateCard(request);
      setRateCards(prev => [newRateCard, ...prev]);
      toast.success('Rate card created successfully');
      setShowCreateRateCardModal(false);
      setCreateRateCardForm({
        service_name: '',
        service_description: '',
        service_category: 'consultation',
        matter_type: '',
        pricing_type: 'hourly',
        hourly_rate: 2500,
        fixed_fee: 0,
        minimum_fee: undefined,
        maximum_fee: undefined,
        estimated_hours_min: 1,
        estimated_hours_max: 1,
        is_default: false,
        requires_approval: false
      });
    } catch (error) {
      toast.error('Failed to create rate card');
    } finally {
      setCreateLoading(false);
    }
  };

  // Load rate cards when the rate cards tab is accessed
  useEffect(() => {
    if (activeTab === 'ratecards') {
      loadRateCards();
      loadStandardTemplates();
    }
  }, [activeTab]);


  const renderWorkflowTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Workflow Settings</h3>
      <p className="text-sm text-neutral-600">Configure your 3-step workflow preferences</p>
      
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-neutral-900 mb-4 flex items-center">
            <Workflow className="w-5 h-5 text-judicial-blue-600 mr-2" />
            Pro Forma Settings
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-neutral-900">Auto Progress Matters</h5>
                <p className="text-sm text-neutral-600">Automatically progress matters when pro forma is accepted</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.workflow.autoProgressMatters}
                  onChange={(e) => handlePreferenceChange('workflow', 'autoProgressMatters', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full ${preferences.workflow.autoProgressMatters ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.workflow.autoProgressMatters ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Pro Forma Expiry Days</label>
              <input
                type="number"
                value={preferences.workflow.proFormaExpiryDays}
                onChange={(e) => handlePreferenceChange('workflow', 'proFormaExpiryDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
                min="1"
                max="365"
              />
              <p className="text-xs text-neutral-500 mt-1">Days before pro forma expires</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-neutral-900 mb-4 flex items-center">
            <Receipt className="w-5 h-5 text-judicial-blue-600 mr-2" />
            Invoice Settings
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-neutral-900">Require Approval for Invoices</h5>
                <p className="text-sm text-neutral-600">Require approval before sending invoices</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.workflow.requireApprovalForInvoices}
                  onChange={(e) => handlePreferenceChange('workflow', 'requireApprovalForInvoices', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full ${preferences.workflow.requireApprovalForInvoices ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.workflow.requireApprovalForInvoices ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Default Hourly Rate (ZAR)</label>
              <input
                type="number"
                value={preferences.workflow.defaultHourlyRate}
                onChange={(e) => handlePreferenceChange('workflow', 'defaultHourlyRate', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
                min="100"
                max="10000"
                step="50"
              />
              <p className="text-xs text-neutral-500 mt-1">Default hourly rate for new matters</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-neutral-900">Auto Time Tracking</h5>
                <p className="text-sm text-neutral-600">Automatically track time spent on matters</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.workflow.autoTimeTracking}
                  onChange={(e) => handlePreferenceChange('workflow', 'autoTimeTracking', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full ${preferences.workflow.autoTimeTracking ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.workflow.autoTimeTracking ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSavePreferences} variant="primary">
        Save Workflow Settings
      </Button>
    </div>
  );

  const renderRateCardsTab = () => {
    const activeRateCards = rateCards.filter(card => card.is_active);
    const totalRateCards = rateCards.length;
    const averageRate = rateCards.length > 0 
      ? Math.round(rateCards.reduce((sum, card) => sum + (card.hourly_rate || 0), 0) / rateCards.length)
      : 0;

    return (
      <div className="space-y-8">
        {/* Prominent Header with Statistics */}
        <div className="bg-gradient-to-r from-judicial-blue-50 to-judicial-blue-100 dark:from-judicial-blue-900/20 dark:to-judicial-blue-800/20 rounded-xl p-6 border border-judicial-blue-200 dark:border-judicial-blue-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-judicial-blue-900 dark:text-judicial-blue-100 mb-2">
                Rate Card Management
              </h3>
              <p className="text-judicial-blue-700 dark:text-judicial-blue-300 mb-4">
                Manage your professional rates with transparency and precision
              </p>
              
              {/* Toggle between Rate Cards and Templates */}
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-1 border border-judicial-blue-200 dark:border-judicial-blue-700">
                  <div className="flex">
                    <button
                      onClick={() => setShowRateCards(true)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        showRateCards
                          ? 'bg-judicial-blue-600 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-judicial-blue-600 dark:hover:text-judicial-blue-400'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      Your Rate Cards
                    </button>
                    <button
                      onClick={() => setShowRateCards(false)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        !showRateCards
                          ? 'bg-judicial-blue-600 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-judicial-blue-600 dark:hover:text-judicial-blue-400'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Standard Services
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-4 border border-judicial-blue-200 dark:border-judicial-blue-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-judicial-blue-100 dark:bg-judicial-blue-900/50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Cards</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalRateCards}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-4 border border-judicial-blue-200 dark:border-judicial-blue-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active Cards</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{activeRateCards.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-4 border border-judicial-blue-200 dark:border-judicial-blue-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Avg. Rate</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">R{averageRate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setShowCreateRateCardModal(true)} 
                variant="primary"
                className="flex items-center justify-center px-6 py-3 text-base font-medium"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Create Rate Card
              </Button>
              <Button 
                variant="secondary"
                className="flex items-center justify-center px-6 py-3 text-base font-medium"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Rates
              </Button>
            </div>
          </div>
        </div>

        {/* Conditional Content Based on Toggle */}
        {showRateCards ? (
          /* Your Rate Cards Section - Enhanced */
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h4 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400 mr-3 flex-shrink-0" />
                <span className="whitespace-nowrap">Your Professional Rate Cards</span>
              </h4>
              
              {/* View Toggle and Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-neutral-100 dark:bg-metallic-gray-800 rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                      viewMode === 'cards' 
                        ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 shadow-sm' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    Cards
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 shadow-sm' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    List
                  </button>
                </div>
                
                <select className="px-3 py-2 text-sm border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100">
                  <option value="all">All Categories</option>
                  <option value="consultation">Consultation</option>
                  <option value="court_appearance">Court Appearance</option>
                  <option value="drafting">Drafting</option>
                  <option value="research">Research</option>
                </select>
              </div>
            </div>

            {/* Rate Cards Content */}
            {isLoadingRateCards ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-judicial-blue-600"></div>
                <span className="ml-3 text-neutral-600 dark:text-neutral-400 text-lg">Loading your rate cards...</span>
              </div>
            ) : rateCards.length === 0 ? (
              <Card className="border-2 border-dashed border-neutral-300 dark:border-metallic-gray-600">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-judicial-blue-100 dark:bg-judicial-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-10 h-10 text-judicial-blue-600 dark:text-judicial-blue-400" />
                  </div>
                  <h5 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Ready to Set Your Rates?</h5>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                    Create professional rate cards that showcase your expertise and ensure transparent pricing for your clients.
                  </p>
                  <Button 
                    onClick={() => setShowCreateRateCardModal(true)} 
                    variant="primary"
                    className="px-8 py-3 text-base font-medium"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Create Your First Rate Card
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rateCards.map((rateCard) => (
                  <Card key={rateCard.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-judicial-blue-500">
                    <CardContent className="p-6">
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                              {rateCard.service_name}
                            </h5>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              rateCard.is_active 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                                : 'bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-600 dark:text-neutral-400'
                            }`}>
                              {rateCard.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {rateCard.is_default && (
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 text-judicial-blue-800 dark:text-judicial-blue-400">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                            {rateCard.service_description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Rate Information */}
                      <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                              Pricing Type
                            </p>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                              {rateCard.pricing_type.replace('_', ' ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                              Rate
                            </p>
                            <p className="text-lg font-bold text-judicial-blue-600 dark:text-judicial-blue-400">
                              {rateCard.pricing_type === 'hourly' && rateCard.hourly_rate 
                                ? `R${rateCard.hourly_rate}/hr`
                                : rateCard.pricing_type === 'fixed' && rateCard.fixed_fee
                                ? `R${rateCard.fixed_fee}`
                                : 'Rate not set'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Rate Adjustment */}
                        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-metallic-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                              Quick Adjust
                            </span>
                            <div className="flex items-center gap-2">
                              <button className="p-1 hover:bg-neutral-200 dark:hover:bg-metallic-gray-700 rounded text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                                <span className="text-xs">-10%</span>
                              </button>
                              <button className="p-1 hover:bg-neutral-200 dark:hover:bg-metallic-gray-700 rounded text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                                <span className="text-xs">-5%</span>
                              </button>
                              <button className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                                <span className="text-xs">+5%</span>
                              </button>
                              <button className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                                <span className="text-xs">+10%</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="grid grid-cols-2 gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                        <div>
                          <span className="font-medium">Category:</span>
                          <span className="ml-1 capitalize">{rateCard.service_category.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="font-medium">Updated:</span>
                          <span className="ml-1">{new Date(rateCard.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Experience/Skill Indicators */}
                      {rateCard.requires_approval && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>Requires Approval</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-metallic-gray-600">
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button variant="secondary" size="sm" className="flex items-center gap-1">
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                          >
                            <span className="text-xs">Duplicate</span>
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleDeleteRateCard(rateCard.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-3">
                {rateCards.map((rateCard) => (
                  <Card key={rateCard.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-judicial-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        {/* Left Section - Service Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h5 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                              {rateCard.service_name}
                            </h5>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                              rateCard.is_active 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                                : 'bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-600 dark:text-neutral-400'
                            }`}>
                              {rateCard.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {rateCard.is_default && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 text-judicial-blue-800 dark:text-judicial-blue-400 flex-shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                            {rateCard.service_description || 'No description provided'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="capitalize">{rateCard.service_category.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{new Date(rateCard.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {/* Center Section - Rate Info */}
                        <div className="flex items-center gap-6 px-6">
                          <div className="text-center">
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                              Type
                            </p>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                              {rateCard.pricing_type.replace('_', ' ')}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                              Rate
                            </p>
                            <p className="text-lg font-bold text-judicial-blue-600 dark:text-judicial-blue-400">
                              {rateCard.pricing_type === 'hourly' && rateCard.hourly_rate 
                                ? `R${rateCard.hourly_rate}/hr`
                                : rateCard.pricing_type === 'fixed' && rateCard.fixed_fee
                                ? `R${rateCard.fixed_fee}`
                                : 'Not set'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button variant="secondary" size="sm" className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="secondary" size="sm" className="flex items-center gap-1">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleDeleteRateCard(rateCard.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Standard Templates Section */
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
                <FileText className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400 mr-2" />
                Standard Service Templates
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Create custom rate cards based on our standard service templates
              </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {standardTemplates.map((template) => (
              <div key={template.id} className="border border-neutral-200 rounded-lg p-4 hover:border-judicial-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-neutral-900">{template.template_name}</h5>
                    <p className="text-sm text-neutral-600 mt-1">{template.template_description}</p>
                  </div>
                  <span className="text-xs bg-judicial-blue-100 text-judicial-blue-800 px-2 py-1 rounded-full">
                    {template.service_category}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Default Rate:</span>
                    <span className="font-medium">
                      {template.default_hourly_rate ? `R${template.default_hourly_rate}/hr` : 
                       template.default_fixed_fee ? `R${template.default_fixed_fee} fixed` : 
                       'Rate not set'}
                    </span>
                  </div>
                  {template.estimated_hours && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Est. Hours:</span>
                      <span className="font-medium">{template.estimated_hours}h</span>
                    </div>
                  )}
                  {template.matter_types && template.matter_types.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Matter Types:</span>
                      <span className="font-medium">{template.matter_types.length}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleCreateFromTemplate(template)}
                  variant="secondary" 
                  className="w-full"
                >
                  Create from Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        )}



 


      {showCreateRateCardModal && (
        <Modal isOpen={showCreateRateCardModal} onClose={() => setShowCreateRateCardModal(false)} size="lg">
          <ModalHeader>
            <h4 className="text-lg font-semibold">Create Rate Card</h4>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rc-service-name">Service Name *</Label>
                <Input
                  id="rc-service-name"
                  value={createRateCardForm.service_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateRateCardForm(prev => ({ ...prev, service_name: e.target.value }))}
                  placeholder="e.g., Contract Review"
                />
              </div>
              <div>
                <Label htmlFor="rc-service-description">Description</Label>
                <Textarea
                  id="rc-service-description"
                  value={createRateCardForm.service_description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateRateCardForm(prev => ({ ...prev, service_description: e.target.value }))}
                  placeholder="Brief description of the service"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rc-category">Category</Label>
                  <Select
                    id="rc-category"
                    value={createRateCardForm.service_category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCreateRateCardForm(prev => ({ ...prev, service_category: e.target.value as ServiceCategory }))}
                  >
                    {serviceCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rc-matter-type">Matter Type (optional)</Label>
                  <Input
                    id="rc-matter-type"
                    value={createRateCardForm.matter_type || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateRateCardForm(prev => ({ ...prev, matter_type: e.target.value }))}
                    placeholder="e.g., Civil Litigation"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rc-pricing-type">Pricing Type</Label>
                  <Select
                    id="rc-pricing-type"
                    value={createRateCardForm.pricing_type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCreateRateCardForm(prev => ({ ...prev, pricing_type: e.target.value as PricingType }))}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="fixed">Fixed Fee</option>
                  </Select>
                </div>
                {createRateCardForm.pricing_type === 'hourly' ? (
                  <div>
                    <Label htmlFor="rc-hourly-rate">Hourly Rate (ZAR)</Label>
                    <Input
                      id="rc-hourly-rate"
                      type="number"
                      min={0}
                      value={createRateCardForm.hourly_rate ?? 0}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateRateCardForm(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="rc-fixed-fee">Fixed Fee (ZAR)</Label>
                    <Input
                      id="rc-fixed-fee"
                      type="number"
                      min={0}
                      value={createRateCardForm.fixed_fee ?? 0}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateRateCardForm(prev => ({ ...prev, fixed_fee: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rc-est-hours-min">Estimated Hours (Min)</Label>
                  <Input
                    id="rc-est-hours-min"
                    type="number"
                    min={0}
                    value={createRateCardForm.estimated_hours_min ?? 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateRateCardForm(prev => ({ ...prev, estimated_hours_min: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rc-est-hours-max">Estimated Hours (Max)</Label>
                  <Input
                    id="rc-est-hours-max"
                    type="number"
                    min={0}
                    value={createRateCardForm.estimated_hours_max ?? 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateRateCardForm(prev => ({ ...prev, estimated_hours_max: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="rc-is-default"
                    type="checkbox"
                    checked={createRateCardForm.is_default || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateRateCardForm(prev => ({ ...prev, is_default: e.target.checked }))}
                  />
                  <Label htmlFor="rc-is-default" className="mb-0">Set as default for this category</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="rc-requires-approval"
                    type="checkbox"
                    checked={createRateCardForm.requires_approval || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateRateCardForm(prev => ({ ...prev, requires_approval: e.target.checked }))}
                  />
                  <Label htmlFor="rc-requires-approval" className="mb-0">Requires approval</Label>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowCreateRateCardModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateRateCardSubmit} disabled={createLoading}>
              {createLoading ? 'Creating...' : 'Create Rate Card'}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {!showRateCards && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center">
                <FileText className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400 mr-3" />
                Standard Service Templates
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Choose from pre-configured service templates to quickly create rate cards
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {standardTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h5 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        {template.template_name}
                      </h5>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">
                        {template.template_description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                          {template.service_category}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Est. {template.estimated_hours}h
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Default Rate:</span>
                      <span className="text-lg font-bold text-judicial-blue-600 dark:text-judicial-blue-400">
                        R{template.default_hourly_rate}/hr
                      </span>
                    </div>
                    
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="font-medium">Matter Types:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.matter_types?.map((type, index) => (
                          <span key={index} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setCreateRateCardForm({
                        service_name: template.template_name,
                        service_description: template.template_description,
                        service_category: template.service_category,
                        matter_type: template.matter_types?.[0] || '',
                        pricing_type: 'hourly' as PricingType,
                        hourly_rate: template.default_hourly_rate,
                        fixed_fee: 0,
                        minimum_fee: undefined,
                        maximum_fee: undefined,
                        estimated_hours_min: template.estimated_hours || 1,
                        estimated_hours_max: template.estimated_hours || 1,
                        is_default: false,
                        requires_approval: false
                      });
                      setShowCreateRateCardModal(true);
                    }}
                    variant="primary" 
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create from Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Notification Preferences</h3>
      
      {/* General Notifications */}
      <div className="space-y-4">
        <h4 className="font-medium text-neutral-900 border-b border-neutral-200 pb-2">General Notifications</h4>
        
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-neutral-900">Email Notifications</h5>
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
            <h5 className="font-medium text-neutral-900">Push Notifications</h5>
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
            <h5 className="font-medium text-neutral-900">SMS Notifications</h5>
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

      {/* Core Feature Notifications */}
      <div className="space-y-4">
        <h4 className="font-medium text-neutral-900 border-b border-neutral-200 pb-2">Core Feature Notifications</h4>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileCheck className="w-5 h-5 text-judicial-blue-600 mr-3" />
            <div>
              <h5 className="font-medium text-neutral-900">Pro Forma Updates</h5>
              <p className="text-sm text-neutral-600">Notifications for Pro Forma status changes and approvals</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications.proFormaUpdates}
              onChange={(e) => handlePreferenceChange('notifications', 'proFormaUpdates', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${preferences.notifications.proFormaUpdates ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.notifications.proFormaUpdates ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Briefcase className="w-5 h-5 text-judicial-blue-600 mr-3" />
            <div>
              <h5 className="font-medium text-neutral-900">Matter Deadlines</h5>
              <p className="text-sm text-neutral-600">Reminders for upcoming matter deadlines and milestones</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications.matterDeadlines}
              onChange={(e) => handlePreferenceChange('notifications', 'matterDeadlines', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${preferences.notifications.matterDeadlines ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.notifications.matterDeadlines ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Receipt className="w-5 h-5 text-judicial-blue-600 mr-3" />
            <div>
              <h5 className="font-medium text-neutral-900">Invoice Reminders</h5>
              <p className="text-sm text-neutral-600">Payment reminders and invoice status updates</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications.invoiceReminders}
              onChange={(e) => handlePreferenceChange('notifications', 'invoiceReminders', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${preferences.notifications.invoiceReminders ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.notifications.invoiceReminders ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>
      </div>

      {/* Marketing */}
      <div className="space-y-4">
        <h4 className="font-medium text-neutral-900 border-b border-neutral-200 pb-2">Marketing & Updates</h4>
        
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-neutral-900">Marketing Communications</h5>
            <p className="text-sm text-neutral-600">Receive updates about new features and promotions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications.marketing}
              onChange={(e) => handlePreferenceChange('notifications', 'marketing', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${preferences.notifications.marketing ? 'bg-judicial-blue-600' : 'bg-neutral-300'} relative transition-colors`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${preferences.notifications.marketing ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>
      </div>

      <Button onClick={handleSavePreferences} variant="primary">
        Save Notification Settings
      </Button>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Privacy & Security</h3>
      
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-neutral-900 mb-4">Profile Privacy</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Profile Visibility</label>
              <select
                value={preferences.privacy.profileVisibility}
                onChange={(e) => handlePreferenceChange('privacy', 'profileVisibility', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
              >
                <option value="private">Private</option>
                <option value="contacts">Contacts Only</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-neutral-900">Data Sharing</h5>
                <p className="text-sm text-neutral-600">Allow anonymous usage data to improve the service</p>
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
        </CardContent>
      </Card>

      <Button onClick={handleSavePreferences} variant="primary">
        Save Privacy Settings
      </Button>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Appearance</h3>
      
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-neutral-900 mb-4">Theme</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Color Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', '', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', '', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Date Format</label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', '', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', '', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
              >
                <option value="ZAR">ZAR (South African Rand)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSavePreferences} variant="primary">
        Save Appearance Settings
      </Button>
    </div>
  );

  // Simplified billing settings - only basic billing for the 3-step workflow
  const renderBillingTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Billing Settings</h3>
      <p className="text-sm text-neutral-600">Configure billing settings for invoices</p>
      
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-neutral-900 mb-4 flex items-center">
            <Receipt className="w-5 h-5 text-judicial-blue-600 mr-2" />
            Invoice Settings
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Payment Reminder Days</label>
              <input
                type="number"
                value={preferences.billing.reminderDays}
                onChange={(e) => handlePreferenceChange('billing', 'reminderDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
                min="1"
                max="90"
              />
              <p className="text-xs text-neutral-500 mt-1">Days before sending payment reminders</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Default Payment Terms (Days)</label>
              <input
                type="number"
                value={preferences.billing.defaultPaymentTerms}
                onChange={(e) => handlePreferenceChange('billing', 'defaultPaymentTerms', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500"
                min="1"
                max="365"
              />
              <p className="text-xs text-neutral-500 mt-1">Default payment terms for new invoices</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSavePreferences} variant="primary">
        Save Billing Settings
      </Button>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Data & Export</h3>
      
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-neutral-900 mb-4">Export Data</h4>
          <p className="text-sm text-neutral-600 mb-4">Export your 3-step workflow data</p>
          
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start">
              <FileCheck className="w-4 h-4 mr-2" />
              Export Pro Forma Data
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <Briefcase className="w-4 h-4 mr-2" />
              Export Matter Data
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <Receipt className="w-4 h-4 mr-2" />
              Export Invoice Data
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-neutral-900 mb-4 text-red-600">Danger Zone</h4>
          <p className="text-sm text-neutral-600 mb-4">Irreversible actions</p>
          
          <Button variant="secondary" className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50">
            <AlertCircle className="w-4 h-4 mr-2" />
            Delete All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workflow':
        return renderWorkflowTab();
      case 'ratecards':
        return renderRateCardsTab();
      case 'templates':
        return <PDFTemplateEditor />;
      default:
        return renderWorkflowTab();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">Manage your profile and 3-step workflow preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-judicial-blue-100 dark:bg-judicial-blue-900/30 text-judicial-blue-700 dark:text-judicial-blue-300'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-3" />
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
    </div>
  );
};

export default SettingsPage;
