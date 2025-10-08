import React, { useState } from 'react';
import { 
  Save, 
  Eye, 
  RotateCcw,
  Building,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../design-system/components';
import { toast } from 'react-hot-toast';

interface BasicTemplateSettings {
  // Basic branding only
  firmName: string;
  firmAddress: string[];
  firmPhone: string;
  firmEmail: string;
  firmWebsite: string;
  vatNumber: string;
  practiceNumber: string;
  
  // Simple color scheme
  primaryColor: string;
  
  // Footer
  footerText: string;
  includeBankingDetails: boolean;
  includeTermsAndConditions: boolean;
}

interface PDFTemplateDesignerProps {
  templateType: 'proforma' | 'invoice';
  onSave: (settings: BasicTemplateSettings) => void;
  onPreview: (settings: BasicTemplateSettings) => void;
  initialSettings?: Partial<BasicTemplateSettings>;
}

const defaultSettings: BasicTemplateSettings = {
  firmName: 'Your Law Firm',
  firmAddress: ['123 Legal Street', 'City, Province 1234'],
  firmPhone: '+27 11 123 4567',
  firmEmail: 'info@lawfirm.co.za',
  firmWebsite: 'www.lawfirm.co.za',
  vatNumber: '4123456789',
  practiceNumber: 'N1234',
  
  primaryColor: '#1f2937',
  
  footerText: 'Professional Legal Services',
  includeBankingDetails: true,
  includeTermsAndConditions: true,
};

const PDFTemplateDesigner: React.FC<PDFTemplateDesignerProps> = ({
  templateType,
  onSave,
  onPreview,
  initialSettings = {}
}) => {
  const [settings, setSettings] = useState<BasicTemplateSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  const updateSetting = <K extends keyof BasicTemplateSettings>(
    key: K,
    value: BasicTemplateSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast.success('Template reset to defaults');
  };

  const handleSave = () => {
    onSave(settings);
    toast.success('Template settings saved');
  };

  const handlePreview = () => {
    onPreview(settings);
  };

  const updateAddress = (index: number, value: string) => {
    const newAddress = [...settings.firmAddress];
    newAddress[index] = value;
    updateSetting('firmAddress', newAddress);
  };

  const addAddressLine = () => {
    if (settings.firmAddress.length < 4) {
      updateSetting('firmAddress', [...settings.firmAddress, '']);
    }
  };

  const removeAddressLine = (index: number) => {
    if (settings.firmAddress.length > 1) {
      const newAddress = settings.firmAddress.filter((_, i) => i !== index);
      updateSetting('firmAddress', newAddress);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
              {templateType} Template - Basic Branding
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Configure basic branding for your {templateType} template
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={resetToDefaults}
              className="text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="secondary"
              onClick={handlePreview}
              className="text-judicial-blue-700 dark:text-judicial-blue-300 border-judicial-blue-300 dark:border-judicial-blue-600 hover:bg-judicial-blue-50 dark:hover:bg-judicial-blue-900/20"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              className="bg-judicial-blue-600 hover:bg-judicial-blue-700 dark:bg-judicial-blue-500 dark:hover:bg-judicial-blue-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-start gap-3 p-4 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-judicial-blue-900 dark:text-judicial-blue-100 mb-1">
              3-Step Workflow Compliance
            </h4>
            <p className="text-sm text-judicial-blue-700 dark:text-judicial-blue-300">
              This template designer is limited to basic branding only to maintain compliance with the strict 3-step workflow: Pro Forma → Matter → Invoice. Advanced customization features have been removed.
            </p>
          </div>
        </div>
      </div>

      {/* Template Settings */}
      <div className="p-6 space-y-8">
        {/* Firm Information */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
              <Building className="w-5 h-5 text-judicial-blue-600 mr-2" />
              Firm Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Firm Name
                </label>
                <input
                  type="text"
                  value={settings.firmName}
                  onChange={(e) => updateSetting('firmName', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  placeholder="Your Law Firm Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Address
                </label>
                <div className="space-y-2">
                  {settings.firmAddress.map((line, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={line}
                        onChange={(e) => updateAddress(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        placeholder={`Address line ${index + 1}`}
                      />
                      {settings.firmAddress.length > 1 && (
                        <Button
                          variant="secondary"
                          onClick={() => removeAddressLine(index)}
                          className="px-2 py-2 text-red-600 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  {settings.firmAddress.length < 4 && (
                    <Button
                      variant="secondary"
                      onClick={addAddressLine}
                      className="text-sm"
                    >
                      + Add Address Line
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={settings.firmPhone}
                    onChange={(e) => updateSetting('firmPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="+27 11 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.firmEmail}
                    onChange={(e) => updateSetting('firmEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="info@lawfirm.co.za"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    value={settings.firmWebsite}
                    onChange={(e) => updateSetting('firmWebsite', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="www.lawfirm.co.za"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    value={settings.vatNumber}
                    onChange={(e) => updateSetting('vatNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="4123456789"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Practice Number
                  </label>
                  <input
                    type="text"
                    value={settings.practiceNumber}
                    onChange={(e) => updateSetting('practiceNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    placeholder="N1234"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Styling */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Basic Styling
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="w-12 h-10 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">Used for headers and accents</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Settings */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
              <FileText className="w-5 h-5 text-judicial-blue-600 mr-2" />
              Footer Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Footer Text
                </label>
                <input
                  type="text"
                  value={settings.footerText}
                  onChange={(e) => updateSetting('footerText', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  placeholder="Professional Legal Services"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeBanking"
                    checked={settings.includeBankingDetails}
                    onChange={(e) => updateSetting('includeBankingDetails', e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-600 text-judicial-blue-600 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400"
                  />
                  <label htmlFor="includeBanking" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                    Include Banking Details
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeTerms"
                    checked={settings.includeTermsAndConditions}
                    onChange={(e) => updateSetting('includeTermsAndConditions', e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-600 text-judicial-blue-600 focus:ring-judicial-blue-500 dark:focus:ring-judicial-blue-400"
                  />
                  <label htmlFor="includeTerms" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                    Include Terms and Conditions
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Guidelines */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Template Guidelines</h4>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                  <p>• Templates must comply with Bar Council requirements</p>
                  <p>• Include all mandatory legal practice information</p>
                  <p>• Maintain professional appearance and readability</p>
                  <p>• Test templates with sample data before use</p>
                  <p>• Only basic branding is allowed to maintain 3-step workflow compliance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PDFTemplateDesigner;
