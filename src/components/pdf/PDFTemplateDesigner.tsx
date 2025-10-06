import React, { useState, useRef } from 'react';
import { 
  Palette, 
  Type, 
  Image, 
  Layout, 
  Download, 
  Eye, 
  Save, 
  RotateCcw,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Grid,
  Building,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Icon } from '../../design-system/components';
import { toast } from 'react-hot-toast';

interface PDFTemplateSettings {
  // Header settings
  headerHeight: number;
  headerBackgroundColor: string;
  headerTextColor: string;
  logoPosition: 'left' | 'center' | 'right';
  logoSize: number;
  
  // Typography
  primaryFont: string;
  secondaryFont: string;
  headerFontSize: number;
  bodyFontSize: number;
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  
  // Layout
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  lineSpacing: number;
  
  // Branding
  firmName: string;
  firmAddress: string[];
  firmPhone: string;
  firmEmail: string;
  firmWebsite: string;
  vatNumber: string;
  practiceNumber: string;
  
  // Footer
  footerText: string;
  includeBankingDetails: boolean;
  includeTermsAndConditions: boolean;
  
  // Watermark
  watermarkText: string;
  watermarkOpacity: number;
  watermarkRotation: number;
}

interface PDFTemplateDesignerProps {
  templateType: 'proforma' | 'invoice';
  onSave: (settings: PDFTemplateSettings) => void;
  onPreview: (settings: PDFTemplateSettings) => void;
  initialSettings?: Partial<PDFTemplateSettings>;
}

const defaultSettings: PDFTemplateSettings = {
  headerHeight: 80,
  headerBackgroundColor: '#1f2937',
  headerTextColor: '#ffffff',
  logoPosition: 'left',
  logoSize: 40,
  
  primaryFont: 'Arial',
  secondaryFont: 'Arial',
  headerFontSize: 24,
  bodyFontSize: 11,
  
  primaryColor: '#1f2937',
  secondaryColor: '#6b7280',
  accentColor: '#d97706',
  textColor: '#374151',
  borderColor: '#e5e7eb',
  
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  lineSpacing: 1.2,
  
  firmName: 'Your Law Firm',
  firmAddress: ['123 Legal Street', 'City, Province 1234'],
  firmPhone: '+27 11 123 4567',
  firmEmail: 'info@lawfirm.co.za',
  firmWebsite: 'www.lawfirm.co.za',
  vatNumber: '4123456789',
  practiceNumber: 'N1234',
  
  footerText: 'Professional Legal Services',
  includeBankingDetails: true,
  includeTermsAndConditions: true,
  
  watermarkText: '',
  watermarkOpacity: 0.1,
  watermarkRotation: 45,
};

const PDFTemplateDesigner: React.FC<PDFTemplateDesignerProps> = ({
  templateType,
  onSave,
  onPreview,
  initialSettings = {}
}) => {
  const [settings, setSettings] = useState<PDFTemplateSettings>({
    ...defaultSettings,
    ...initialSettings
  });
  const [activeTab, setActiveTab] = useState<'header' | 'typography' | 'colors' | 'layout' | 'branding' | 'footer'>('header');

  const updateSetting = <K extends keyof PDFTemplateSettings>(
    key: K,
    value: PDFTemplateSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const tabs = [
    { id: 'header' as const, label: 'Header', icon: Layout },
    { id: 'typography' as const, label: 'Typography', icon: Type },
    { id: 'colors' as const, label: 'Colors', icon: Palette },
    { id: 'layout' as const, label: 'Layout', icon: Grid },
    { id: 'branding' as const, label: 'Branding', icon: Building },
    { id: 'footer' as const, label: 'Footer', icon: FileText }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
              {templateType} Template Designer
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Customize your {templateType} template appearance and branding
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
              onClick={() => onPreview(settings)}
              className="text-judicial-blue-700 dark:text-judicial-blue-300 border-judicial-blue-300 dark:border-judicial-blue-600 hover:bg-judicial-blue-50 dark:hover:bg-judicial-blue-900/20"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={() => onSave(settings)}
              className="bg-mpondo-gold-600 hover:bg-mpondo-gold-700 dark:bg-mpondo-gold-500 dark:hover:bg-mpondo-gold-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-mpondo-gold-500 text-mpondo-gold-600 dark:text-mpondo-gold-400'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
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
      <div className="p-6">
        {activeTab === 'header' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Header Height (px)
              </label>
              <input
                type="number"
                value={settings.headerHeight}
                onChange={(e) => updateSetting('headerHeight', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                min="40"
                max="200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Header Background Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.headerBackgroundColor}
                  onChange={(e) => updateSetting('headerBackgroundColor', e.target.value)}
                  className="w-12 h-10 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.headerBackgroundColor}
                  onChange={(e) => updateSetting('headerBackgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Header Text Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.headerTextColor}
                  onChange={(e) => updateSetting('headerTextColor', e.target.value)}
                  className="w-12 h-10 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.headerTextColor}
                  onChange={(e) => updateSetting('headerTextColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Logo Position
              </label>
              <select
                value={settings.logoPosition}
                onChange={(e) => updateSetting('logoPosition', e.target.value as 'left' | 'center' | 'right')}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Logo Size (px)
              </label>
              <input
                type="number"
                value={settings.logoSize}
                onChange={(e) => updateSetting('logoSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                min="20"
                max="100"
              />
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Primary Font
                </label>
                <select
                  value={settings.primaryFont}
                  onChange={(e) => updateSetting('primaryFont', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Calibri">Calibri</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Secondary Font
                </label>
                <select
                  value={settings.secondaryFont}
                  onChange={(e) => updateSetting('secondaryFont', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Calibri">Calibri</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Header Font Size (px)
                </label>
                <input
                  type="number"
                  value={settings.headerFontSize}
                  onChange={(e) => updateSetting('headerFontSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  min="12"
                  max="36"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Body Font Size (px)
                </label>
                <input
                  type="number"
                  value={settings.bodyFontSize}
                  onChange={(e) => updateSetting('bodyFontSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  min="8"
                  max="16"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Line Spacing
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.lineSpacing}
                onChange={(e) => updateSetting('lineSpacing', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                min="1"
                max="3"
              />
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                    className="w-12 h-10 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => updateSetting('accentColor', e.target.value)}
                    className="w-12 h-10 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => updateSetting('accentColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Text Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => updateSetting('textColor', e.target.value)}
                    className="w-12 h-10 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.textColor}
                    onChange={(e) => updateSetting('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Border Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.borderColor}
                  onChange={(e) => updateSetting('borderColor', e.target.value)}
                  className="w-12 h-10 border border-neutral-300 dark:border-neutral-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.borderColor}
                  onChange={(e) => updateSetting('borderColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Top Margin (mm)
                </label>
                <input
                  type="number"
                  value={settings.marginTop}
                  onChange={(e) => updateSetting('marginTop', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  min="10"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Bottom Margin (mm)
                </label>
                <input
                  type="number"
                  value={settings.marginBottom}
                  onChange={(e) => updateSetting('marginBottom', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  min="10"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Left Margin (mm)
                </label>
                <input
                  type="number"
                  value={settings.marginLeft}
                  onChange={(e) => updateSetting('marginLeft', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  min="10"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Right Margin (mm)
                </label>
                <input
                  type="number"
                  value={settings.marginRight}
                  onChange={(e) => updateSetting('marginRight', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  min="10"
                  max="50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Firm Name
              </label>
              <input
                type="text"
                value={settings.firmName}
                onChange={(e) => updateSetting('firmName', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Address (one line per field)
              </label>
              {settings.firmAddress.map((line, index) => (
                <input
                  key={index}
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const newAddress = [...settings.firmAddress];
                    newAddress[index] = e.target.value;
                    updateSetting('firmAddress', newAddress);
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 mb-2"
                  placeholder={`Address line ${index + 1}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={settings.firmPhone}
                  onChange={(e) => updateSetting('firmPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={settings.firmWebsite}
                  onChange={(e) => updateSetting('firmWebsite', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Practice Number
                </label>
                <input
                  type="text"
                  value={settings.practiceNumber}
                  onChange={(e) => updateSetting('practiceNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Footer Text
              </label>
              <input
                type="text"
                value={settings.footerText}
                onChange={(e) => updateSetting('footerText', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeBanking"
                  checked={settings.includeBankingDetails}
                  onChange={(e) => updateSetting('includeBankingDetails', e.target.checked)}
                  className="rounded border-neutral-300 dark:border-neutral-600 text-mpondo-gold-600 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400"
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
                  className="rounded border-neutral-300 dark:border-neutral-600 text-mpondo-gold-600 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400"
                />
                <label htmlFor="includeTerms" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                  Include Terms and Conditions
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Watermark Text (optional)
              </label>
              <input
                type="text"
                value={settings.watermarkText}
                onChange={(e) => updateSetting('watermarkText', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="e.g., CONFIDENTIAL, DRAFT"
              />
            </div>

            {settings.watermarkText && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Watermark Opacity
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.05"
                    value={settings.watermarkOpacity}
                    onChange={(e) => updateSetting('watermarkOpacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {Math.round(settings.watermarkOpacity * 100)}%
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Watermark Rotation (degrees)
                  </label>
                  <input
                    type="number"
                    value={settings.watermarkRotation}
                    onChange={(e) => updateSetting('watermarkRotation', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    min="-90"
                    max="90"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFTemplateDesigner;