import React, { useState } from 'react';
import { FileText, Download, Eye, Settings, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Icon } from '../design-system/components';
import PDFTemplateDesigner from '../components/pdf/PDFTemplateDesigner';
import { InvoicePDFService } from '../services/pdf/invoice-pdf.service';
import { toast } from 'react-hot-toast';
import type { Page } from '../types';
import LexoHubBGhd from '../Public/Assets/LexoHubBGhd.jpg';

interface PDFTemplatesPageProps {
  onNavigate?: (page: Page) => void;
}

interface PDFTemplateSettings {
  headerHeight: number;
  headerBackgroundColor: string;
  headerTextColor: string;
  logoPosition: 'left' | 'center' | 'right';
  logoSize: number;
  primaryFont: string;
  secondaryFont: string;
  headerFontSize: number;
  bodyFontSize: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  lineSpacing: number;
  firmName: string;
  firmAddress: string[];
  firmPhone: string;
  firmEmail: string;
  firmWebsite: string;
  vatNumber: string;
  practiceNumber: string;
  footerText: string;
  includeBankingDetails: boolean;
  includeTermsAndConditions: boolean;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkRotation: number;
}

export const PDFTemplatesPage: React.FC<PDFTemplatesPageProps> = ({ onNavigate }) => {
  const [activeTemplate, setActiveTemplate] = useState<'proforma' | 'invoice' | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<{
    proforma?: PDFTemplateSettings;
    invoice?: PDFTemplateSettings;
  }>({});

  const handleSaveTemplate = (templateType: 'proforma' | 'invoice', settings: PDFTemplateSettings) => {
    // In a real implementation, this would save to the backend
    setSavedTemplates(prev => ({
      ...prev,
      [templateType]: settings
    }));
    
    // Save to localStorage for persistence
    localStorage.setItem(`pdfTemplate_${templateType}`, JSON.stringify(settings));
    
    toast.success(`${templateType === 'proforma' ? 'Pro Forma' : 'Invoice'} template saved successfully`);
  };

  const handlePreviewTemplate = async (templateType: 'proforma' | 'invoice', settings: PDFTemplateSettings) => {
    try {
      // Create sample data for preview
      const sampleData = {
        id: 'preview-001',
        invoice_number: 'PREVIEW-001',
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        total_amount: 15000,
        vat_amount: 2250,
        subtotal: 12750,
        status: 'draft' as const,
        lineItems: [
          {
            id: '1',
            description: 'Legal consultation and advice',
            quantity: 5,
            rate: 2550,
            amount: 12750,
            vat_rate: 0.15
          }
        ]
      };

      const sampleMatter = {
        id: 'matter-001',
        title: 'Sample Legal Matter',
        client_id: 'client-001',
        client: {
          id: 'client-001',
          name: 'Sample Client (Pty) Ltd',
          email: 'client@example.com',
          phone: '+27 11 123 4567',
          address: '123 Business Street, Johannesburg, 2000'
        }
      };

      const sampleAdvocate = {
        id: 'advocate-001',
        name: settings.firmName,
        email: settings.firmEmail,
        phone: settings.firmPhone,
        practice_number: settings.practiceNumber,
        vat_number: settings.vatNumber,
        address: settings.firmAddress.join(', '),
        banking_details: {
          bank_name: 'Sample Bank',
          account_number: '1234567890',
          branch_code: '123456',
          account_type: 'Business Cheque'
        }
      };

      // Generate preview PDF with custom settings
      const result = templateType === 'proforma' 
        ? await InvoicePDFService.generateProFormaPDF(sampleData, sampleMatter, sampleAdvocate, {
            customSettings: settings
          })
        : await InvoicePDFService.generateInvoicePDF(sampleData, sampleMatter, sampleAdvocate, {
            customSettings: settings
          });

      if (result.success && result.blob) {
        // Open preview in new window
        const url = URL.createObjectURL(result.blob);
        window.open(url, '_blank');
        toast.success('Preview opened in new window');
      } else {
        throw new Error(result.error || 'Failed to generate preview');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview. Please try again.');
    }
  };

  const loadSavedTemplate = (templateType: 'proforma' | 'invoice'): Partial<PDFTemplateSettings> => {
    const saved = localStorage.getItem(`pdfTemplate_${templateType}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading saved template:', error);
      }
    }
    return {};
  };

  if (activeTemplate) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200"
        style={{
          backgroundImage: `url(${LexoHubBGhd})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTemplate(null)}
                className="dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <Icon icon={ArrowLeft} className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {activeTemplate === 'proforma' ? 'Pro Forma' : 'Invoice'} Template Designer
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Customize your {activeTemplate === 'proforma' ? 'pro forma' : 'invoice'} PDF template
                </p>
              </div>
            </div>
          </div>
          
          <PDFTemplateDesigner
            templateType={activeTemplate}
            onSave={(settings) => handleSaveTemplate(activeTemplate, settings)}
            onPreview={(settings) => handlePreviewTemplate(activeTemplate, settings)}
            initialSettings={loadSavedTemplate(activeTemplate)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200"
      style={{
        backgroundImage: `url(${LexoHubBGhd})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">PDF Templates</h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Design and customize your PDF templates for pro formas and invoices to match your firm's branding.
                </p>
              </div>
              {onNavigate && (
                <Button
                  variant="outline"
                  onClick={() => onNavigate('settings')}
                  className="dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <Icon icon={Settings} className="w-4 h-4 mr-2" />
                  Back to Settings
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pro Forma Template Card */}
            <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] dark:bg-neutral-800/90 dark:border-neutral-700 dark:hover:bg-neutral-700/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                      <Icon icon={FileText} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Pro Forma Template</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Professional pro forma invoice template</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    <p>• Professional layout and branding</p>
                    <p>• Customizable header and footer</p>
                    <p>• Legal compliance formatting</p>
                    <p>• Watermark and signature options</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setActiveTemplate('proforma')}
                      className="flex-1 dark:bg-mpondo-gold-500 dark:hover:bg-mpondo-gold-600"
                    >
                      <Icon icon={Settings} className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePreviewTemplate('proforma', savedTemplates.proforma || {})}
                      className="dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                      <Icon icon={Eye} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Template Card */}
            <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] dark:bg-neutral-800/90 dark:border-neutral-700 dark:hover:bg-neutral-700/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
                      <Icon icon={FileText} className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Invoice Template</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Standard invoice template for completed work</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    <p>• Professional invoice layout</p>
                    <p>• Payment terms and banking details</p>
                    <p>• VAT compliance formatting</p>
                    <p>• Custom watermarks and footers</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setActiveTemplate('invoice')}
                      className="flex-1 dark:bg-mpondo-gold-500 dark:hover:bg-mpondo-gold-600"
                    >
                      <Icon icon={Settings} className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePreviewTemplate('invoice', savedTemplates.invoice || {})}
                      className="dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                      <Icon icon={Eye} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Overview */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Template Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dark:bg-neutral-800/90 dark:border-neutral-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Icon icon={Settings} className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Full Customization</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Customize colors, fonts, layout, margins, and branding elements to match your firm's identity.
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-neutral-800/90 dark:border-neutral-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Icon icon={Eye} className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Live Preview</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Preview your templates with sample data before saving to ensure they look perfect.
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-neutral-800/90 dark:border-neutral-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon icon={Download} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Professional Output</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Generate professional, Bar Council compliant PDFs with your custom branding and styling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PDFTemplatesPage;