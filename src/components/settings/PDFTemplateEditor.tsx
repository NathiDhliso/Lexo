import React, { useState, useEffect } from 'react';
import { Save, Upload, Eye, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';
import { PDFTemplate, PDFColorScheme, DEFAULT_COLOR_SCHEMES, createDefaultTemplate } from '../../types/pdf-template.types';
import { pdfTemplateService } from '../../services/pdf-template.service';
import { useAuth } from '../../hooks/useAuth';

import { ColorsTab } from './pdf-template-tabs/ColorsTab';
import { HeaderTab } from './pdf-template-tabs/HeaderTab';
import { LayoutTab } from './pdf-template-tabs/LayoutTab';
import { SectionsTab } from './pdf-template-tabs/SectionsTab';
import { TableTab } from './pdf-template-tabs/TableTab';
import { FooterTab } from './pdf-template-tabs/FooterTab';
import { PreviewPanel } from './pdf-template-tabs/PreviewPanel';

export const PDFTemplateEditor: React.FC = () => {
  const { user } = useAuth();
  const [template, setTemplate] = useState<PDFTemplate>(createDefaultTemplate());
  const [activeTab, setActiveTab] = useState<'colors' | 'header' | 'layout' | 'sections' | 'table' | 'footer'>('colors');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'presets' | 'advanced'>('presets');

  useEffect(() => {
    if (user) {
      loadTemplate();
    }
  }, [user]);

  useEffect(() => {
    if (template.header.logoUrl) {
      setLogoPreview(template.header.logoUrl);
    }
  }, [template.header.logoUrl]);

  const loadTemplate = async () => {
    if (!user) return;
    const defaultTemplate = await pdfTemplateService.getDefaultTemplate(user.id);
    setTemplate(defaultTemplate);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      if (logoFile) {
        const logoUrl = await pdfTemplateService.uploadLogo(user.id, logoFile);
        template.header.logoUrl = logoUrl;
      }

      await pdfTemplateService.saveTemplate(user.id, template);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorSchemeSelect = (scheme: PDFColorScheme) => {
    setTemplate({
      ...template,
      colorScheme: scheme,
      header: {
        ...template.header,
        titleStyle: {
          ...template.header.titleStyle,
          color: scheme.primary,
        },
      },
      table: {
        ...template.table,
        headerBackgroundColor: scheme.primary,
      },
    });
  };

  const applyLayoutPreset = (presetName: string) => {
    const presets: Record<string, Partial<PDFTemplate>> = {
      formal: {
        header: {
          ...template.header,
          titleStyle: {
            ...template.header.titleStyle,
            fontFamily: 'times',
            fontSize: 24,
            fontWeight: 'bold',
          },
          logoPlacement: 'left',
          showBorder: true,
          borderStyle: 'solid',
          borderWidth: 2,
        },
        pageMargins: { top: 25, right: 25, bottom: 25, left: 25 },
      },
      modern: {
        header: {
          ...template.header,
          titleStyle: {
            ...template.header.titleStyle,
            fontFamily: 'helvetica',
            fontSize: 32,
            fontWeight: 'bold',
          },
          logoPlacement: 'center',
          showBorder: false,
        },
        pageMargins: { top: 15, right: 15, bottom: 15, left: 15 },
      },
      minimalist: {
        header: {
          ...template.header,
          titleStyle: {
            ...template.header.titleStyle,
            fontFamily: 'helvetica',
            fontSize: 20,
            fontWeight: 'normal',
          },
          logoPlacement: 'right',
          showBorder: false,
        },
        pageMargins: { top: 30, right: 30, bottom: 30, left: 30 },
      },
      classic: {
        header: {
          ...template.header,
          titleStyle: {
            ...template.header.titleStyle,
            fontFamily: 'times',
            fontSize: 28,
            fontWeight: 'bold',
          },
          logoPlacement: 'center',
          showBorder: true,
          borderStyle: 'solid',
          borderWidth: 1,
        },
        pageMargins: { top: 20, right: 20, bottom: 20, left: 20 },
      },
      executive: {
        header: {
          ...template.header,
          titleStyle: {
            ...template.header.titleStyle,
            fontFamily: 'helvetica',
            fontSize: 26,
            fontWeight: 'bold',
          },
          logoPlacement: 'left',
          showBorder: true,
          borderStyle: 'solid',
          borderWidth: 3,
        },
        pageMargins: { top: 20, right: 20, bottom: 20, left: 20 },
      },
      elegant: {
        header: {
          ...template.header,
          titleStyle: {
            ...template.header.titleStyle,
            fontFamily: 'times',
            fontSize: 30,
            fontWeight: 'bold',
          },
          logoPlacement: 'center',
          showBorder: true,
          borderStyle: 'solid',
          borderWidth: 1,
        },
        pageMargins: { top: 25, right: 25, bottom: 25, left: 25 },
      },
      compact: {
        header: {
          ...template.header,
          titleStyle: {
            ...template.header.titleStyle,
            fontFamily: 'helvetica',
            fontSize: 22,
            fontWeight: 'bold',
          },
          logoPlacement: 'left',
          showBorder: false,
        },
        pageMargins: { top: 12, right: 12, bottom: 12, left: 12 },
      },
      spacious: {
        header: {
          ...template.header,
          titleStyle: {
            ...template.header.titleStyle,
            fontFamily: 'helvetica',
            fontSize: 28,
            fontWeight: 'normal',
          },
          logoPlacement: 'center',
          showBorder: false,
        },
        pageMargins: { top: 40, right: 40, bottom: 40, left: 40 },
      },
    };

    const preset = presets[presetName.toLowerCase()];
    if (preset) {
      setTemplate({
        ...template,
        ...preset,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">PDF Template Customization</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Customize your invoice and pro forma PDF templates with live preview
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex border-b border-neutral-200 dark:border-metallic-gray-700 overflow-x-auto">
            {[
              { id: 'colors', label: 'Color Scheme', icon: Palette },
              { id: 'header', label: 'Header & Logo', icon: ImageIcon },
              { id: 'layout', label: 'Layout', icon: Layout },
              { id: 'sections', label: 'Sections', icon: Type },
              { id: 'table', label: 'Tables', icon: Type },
              { id: 'footer', label: 'Footer', icon: Type },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === id
                    ? 'text-neutral-600 dark:text-mpondo-gold-500 border-b-2 border-neutral-600 dark:border-mpondo-gold-500'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'colors' && (
              <ColorsTab 
                template={template} 
                setTemplate={setTemplate} 
                handleColorSchemeSelect={handleColorSchemeSelect} 
              />
            )}

            {activeTab === 'header' && (
              <HeaderTab 
                template={template} 
                setTemplate={setTemplate} 
                logoPreview={logoPreview}
                handleLogoUpload={handleLogoUpload}
              />
            )}

            {activeTab === 'layout' && (
              <LayoutTab 
                template={template} 
                setTemplate={setTemplate} 
                applyLayoutPreset={applyLayoutPreset}
                layoutMode={layoutMode}
                setLayoutMode={setLayoutMode}
              />
            )}

            {activeTab === 'sections' && (
              <SectionsTab 
                template={template} 
                setTemplate={setTemplate} 
              />
            )}

            {activeTab === 'table' && (
              <TableTab 
                template={template} 
                setTemplate={setTemplate} 
              />
            )}

            {activeTab === 'footer' && (
              <FooterTab 
                template={template} 
                setTemplate={setTemplate} 
              />
            )}
          </div>
        </div>

        <PreviewPanel 
          template={template} 
          setTemplate={setTemplate}
          logoPreview={logoPreview} 
        />
      </div>
    </div>
  );
};
