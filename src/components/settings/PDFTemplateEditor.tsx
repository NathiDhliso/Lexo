import React, { useState, useEffect } from 'react';
import { Save, Upload, Eye, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';
import { PDFTemplate, PDFColorScheme, DEFAULT_COLOR_SCHEMES, createDefaultTemplate } from '../../types/pdf-template.types';
import { pdfTemplateService } from '../../services/pdf-template.service';
import { useAuth } from '../../hooks/useAuth';

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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
                  ? 'text-blue-600 dark:text-mpondo-gold-500 border-b-2 border-blue-600 dark:border-mpondo-gold-500'
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
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Choose Color Scheme
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DEFAULT_COLOR_SCHEMES.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => handleColorSchemeSelect(scheme)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        template.colorScheme.id === scheme.id
                          ? 'border-blue-600 dark:border-mpondo-gold-500 bg-blue-50 dark:bg-mpondo-gold-900/20'
                          : 'border-neutral-200 dark:border-metallic-gray-700 hover:border-neutral-300 dark:hover:border-metallic-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{scheme.name}</span>
                        {template.colorScheme.id === scheme.id && (
                          <div className="w-5 h-5 bg-blue-600 dark:bg-mpondo-gold-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-8 rounded" style={{ backgroundColor: scheme.primary }}></div>
                        <div className="flex-1 h-8 rounded" style={{ backgroundColor: scheme.secondary }}></div>
                        <div className="flex-1 h-8 rounded" style={{ backgroundColor: scheme.accent }}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Customize Colors
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Click on any color to customize it
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(template.colorScheme).map(([key, value]) => {
                    if (key === 'id' || key === 'name') return null;
                    return (
                      <div key={key} className="relative">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="relative group">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => setTemplate({
                              ...template,
                              colorScheme: {
                                ...template.colorScheme,
                                [key]: e.target.value,
                              },
                            })}
                            className="w-full h-12 rounded-lg border-2 border-neutral-300 dark:border-metallic-gray-600 cursor-pointer hover:border-blue-500 transition-colors"
                            style={{ backgroundColor: value }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to change
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'header' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Logo Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={template.header.showLogo}
                        onChange={(e) => setTemplate({
                          ...template,
                          header: {
                            ...template.header,
                            showLogo: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Show Logo</span>
                    </label>
                  </div>

                  {template.header.showLogo && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Upload Logo
                        </label>
                        <div className="flex items-center gap-4">
                          {logoPreview && (
                            <div className="relative w-24 h-24 border-2 border-neutral-200 dark:border-metallic-gray-700 rounded-lg overflow-hidden">
                              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                            </div>
                          )}
                          <label className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-metallic-gray-600 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            Choose File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Logo Width (px)
                          </label>
                          <input
                            type="number"
                            value={template.header.logoWidth}
                            onChange={(e) => setTemplate({
                              ...template,
                              header: {
                                ...template.header,
                                logoWidth: parseInt(e.target.value),
                              },
                            })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Logo Height (px)
                          </label>
                          <input
                            type="number"
                            value={template.header.logoHeight}
                            onChange={(e) => setTemplate({
                              ...template,
                              header: {
                                ...template.header,
                                logoHeight: parseInt(e.target.value),
                              },
                            })}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Title Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Title Text
                    </label>
                    <input
                      type="text"
                      value={template.header.title}
                      onChange={(e) => setTemplate({
                        ...template,
                        header: {
                          ...template.header,
                          title: e.target.value,
                        },
                      })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Font Family
                      </label>
                      <select
                        value={template.header.titleStyle.fontFamily}
                        onChange={(e) => setTemplate({
                          ...template,
                          header: {
                            ...template.header,
                            titleStyle: {
                              ...template.header.titleStyle,
                              fontFamily: e.target.value as any,
                            },
                          },
                        })}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                      >
                        <option value="helvetica">Helvetica</option>
                        <option value="times">Times</option>
                        <option value="courier">Courier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Font Size
                      </label>
                      <input
                        type="number"
                        value={template.header.titleStyle.fontSize}
                        onChange={(e) => setTemplate({
                          ...template,
                          header: {
                            ...template.header,
                            titleStyle: {
                              ...template.header.titleStyle,
                              fontSize: parseInt(e.target.value),
                            },
                          },
                        })}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Color
                      </label>
                      <input
                        type="color"
                        value={template.header.titleStyle.color}
                        onChange={(e) => setTemplate({
                          ...template,
                          header: {
                            ...template.header,
                            titleStyle: {
                              ...template.header.titleStyle,
                              color: e.target.value,
                            },
                          },
                        })}
                        className="w-full h-10 rounded border border-neutral-300 dark:border-metallic-gray-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Page Layout & Structure
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Configure page size, margins, and document structure
                </p>
                
                {/* Toggle between Presets and Advanced */}
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-metallic-gray-800 rounded-lg p-1 w-fit">
                  <button
                    onClick={() => setLayoutMode('presets')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      layoutMode === 'presets'
                        ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    onClick={() => setLayoutMode('advanced')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      layoutMode === 'advanced'
                        ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              </div>

              {layoutMode === 'presets' ? (
                /* Presets Mode */
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Layout Presets</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      Choose a professional layout preset to get started quickly
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { 
                        name: 'Formal', 
                        desc: 'Traditional legal document with Times font and left-aligned logo',
                        icon: '📜',
                        features: ['Times font', 'Left logo', 'Standard margins']
                      },
                      { 
                        name: 'Modern', 
                        desc: 'Clean and contemporary with large centered title',
                        icon: '✨',
                        features: ['Helvetica font', 'Centered logo', 'Minimal margins']
                      },
                      { 
                        name: 'Minimalist', 
                        desc: 'Simple and elegant with lots of white space',
                        icon: '⚪',
                        features: ['Light font', 'Right logo', 'Wide margins']
                      },
                      { 
                        name: 'Classic', 
                        desc: 'Timeless professional appearance with subtle border',
                        icon: '🎩',
                        features: ['Times font', 'Centered logo', 'Border accent']
                      },
                      { 
                        name: 'Executive', 
                        desc: 'Bold and authoritative with strong border',
                        icon: '💼',
                        features: ['Bold title', 'Left logo', 'Thick border']
                      },
                      { 
                        name: 'Elegant', 
                        desc: 'Sophisticated serif styling with balanced layout',
                        icon: '👔',
                        features: ['Large serif', 'Centered', 'Refined spacing']
                      },
                      { 
                        name: 'Compact', 
                        desc: 'Space-efficient layout for detailed documents',
                        icon: '📋',
                        features: ['Smaller font', 'Tight margins', 'No border']
                      },
                      { 
                        name: 'Spacious', 
                        desc: 'Generous spacing for easy reading and notes',
                        icon: '📄',
                        features: ['Large margins', 'Centered', 'Airy layout']
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyLayoutPreset(preset.name)}
                        className="p-4 border-2 border-neutral-300 dark:border-metallic-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-mpondo-gold-500 hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{preset.icon}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-mpondo-gold-500 transition-colors">
                              {preset.name}
                            </div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                              {preset.desc}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {preset.features.map((feature) => (
                                <span key={feature} className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-600 dark:text-neutral-400 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Advanced Mode */
                <div className="space-y-6">

              {/* Page Size */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Page Size</h4>
                <div className="grid grid-cols-3 gap-3">
                  {['A4', 'Letter', 'Legal'].map((size) => (
                    <button
                      key={size}
                      className="px-4 py-3 border-2 border-neutral-300 dark:border-metallic-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-mpondo-gold-500 transition-colors text-neutral-900 dark:text-neutral-100 font-medium"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Margins */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Page Margins</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Top (mm)
                    </label>
                    <input
                      type="number"
                      value={template.pageMargins?.top || 20}
                      onChange={(e) => setTemplate({
                        ...template,
                        pageMargins: {
                          ...template.pageMargins,
                          top: parseInt(e.target.value) || 20,
                        },
                      })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                      min="10"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Bottom (mm)
                    </label>
                    <input
                      type="number"
                      value={template.pageMargins?.bottom || 20}
                      onChange={(e) => setTemplate({
                        ...template,
                        pageMargins: {
                          ...template.pageMargins,
                          bottom: parseInt(e.target.value) || 20,
                        },
                      })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                      min="10"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Left (mm)
                    </label>
                    <input
                      type="number"
                      value={template.pageMargins?.left || 20}
                      onChange={(e) => setTemplate({
                        ...template,
                        pageMargins: {
                          ...template.pageMargins,
                          left: parseInt(e.target.value) || 20,
                        },
                      })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                      min="10"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Right (mm)
                    </label>
                    <input
                      type="number"
                      value={template.pageMargins?.right || 20}
                      onChange={(e) => setTemplate({
                        ...template,
                        pageMargins: {
                          ...template.pageMargins,
                          right: parseInt(e.target.value) || 20,
                        },
                      })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                      min="10"
                      max="50"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Placement */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Logo Placement</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'left', label: 'Left Aligned', icon: '←' },
                    { value: 'center', label: 'Centered', icon: '↔' },
                    { value: 'right', label: 'Right Aligned', icon: '→' },
                    { value: 'watermark', label: 'Watermark', icon: '◈' },
                  ].map((placement) => (
                    <button
                      key={placement.value}
                      onClick={() => setTemplate({
                        ...template,
                        header: {
                          ...template.header,
                          logoPlacement: placement.value as any,
                        },
                      })}
                      className={`px-4 py-3 border-2 rounded-lg transition-colors font-medium ${
                        template.header.logoPlacement === placement.value
                          ? 'border-blue-500 dark:border-mpondo-gold-500 bg-blue-50 dark:bg-mpondo-gold-900/20 text-blue-700 dark:text-mpondo-gold-300'
                          : 'border-neutral-300 dark:border-metallic-gray-600 text-neutral-700 dark:text-neutral-300 hover:border-blue-400 dark:hover:border-mpondo-gold-600'
                      }`}
                    >
                      <span className="text-2xl mr-2">{placement.icon}</span>
                      {placement.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Opacity & Rotation */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Logo Effects</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Opacity: {Math.round((template.header.logoOpacity || 1) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={template.header.logoOpacity || 1}
                      onChange={(e) => setTemplate({
                        ...template,
                        header: {
                          ...template.header,
                          logoOpacity: parseFloat(e.target.value),
                        },
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Rotation: {template.header.logoRotation || 0}°
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="15"
                      value={template.header.logoRotation || 0}
                      onChange={(e) => setTemplate({
                        ...template,
                        header: {
                          ...template.header,
                          logoRotation: parseInt(e.target.value),
                        },
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Text Alignment & Positioning */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Text Alignment & Orientation</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Title Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['left', 'center', 'right'].map((align) => (
                        <button
                          key={align}
                          onClick={() => setTemplate({
                            ...template,
                            header: {
                              ...template.header,
                              titleStyle: {
                                ...template.header.titleStyle,
                                alignment: align as any,
                              },
                            },
                          })}
                          className={`px-3 py-2 border-2 rounded-lg transition-colors capitalize ${
                            template.header.titleStyle.alignment === align
                              ? 'border-blue-500 dark:border-mpondo-gold-500 bg-blue-50 dark:bg-mpondo-gold-900/20 text-blue-700 dark:text-mpondo-gold-300'
                              : 'border-neutral-300 dark:border-metallic-gray-600 text-neutral-700 dark:text-neutral-300 hover:border-blue-400'
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Title Orientation
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'horizontal', label: 'Horizontal →', desc: 'Normal text' },
                        { value: 'vertical', label: 'Vertical ↓', desc: 'Side text' },
                      ].map((orientation) => (
                        <button
                          key={orientation.value}
                          onClick={() => setTemplate({
                            ...template,
                            header: {
                              ...template.header,
                              titleOrientation: orientation.value as any,
                            },
                          })}
                          className={`p-3 border-2 rounded-lg transition-colors ${
                            (template.header as any).titleOrientation === orientation.value || 
                            (!((template.header as any).titleOrientation) && orientation.value === 'horizontal')
                              ? 'border-blue-500 dark:border-mpondo-gold-500 bg-blue-50 dark:bg-mpondo-gold-900/20 text-blue-700 dark:text-mpondo-gold-300'
                              : 'border-neutral-300 dark:border-metallic-gray-600 text-neutral-700 dark:text-neutral-300 hover:border-blue-400'
                          }`}
                        >
                          <div className="font-semibold">{orientation.label}</div>
                          <div className="text-xs mt-1">{orientation.desc}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      Vertical orientation places title on the side of the page
                    </p>
                  </div>
                </div>
              </div>

              {/* Border Styling */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Border & Frame</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={template.header.showBorder}
                        onChange={(e) => setTemplate({
                          ...template,
                          header: {
                            ...template.header,
                            showBorder: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Show Border</span>
                    </label>
                  </div>

                  {template.header.showBorder && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Border Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['solid', 'dashed', 'dotted'].map((style) => (
                            <button
                              key={style}
                              onClick={() => setTemplate({
                                ...template,
                                header: {
                                  ...template.header,
                                  borderStyle: style as any,
                                },
                              })}
                              className={`px-3 py-2 border-2 rounded-lg transition-colors capitalize ${
                                template.header.borderStyle === style
                                  ? 'border-blue-500 dark:border-mpondo-gold-500 bg-blue-50 dark:bg-mpondo-gold-900/20'
                                  : 'border-neutral-300 dark:border-metallic-gray-600 hover:border-blue-400'
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Border Width: {template.header.borderWidth || 1}px
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={template.header.borderWidth || 1}
                          onChange={(e) => setTemplate({
                            ...template,
                            header: {
                              ...template.header,
                              borderWidth: parseInt(e.target.value),
                            },
                          })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Border Color
                        </label>
                        <input
                          type="color"
                          value={template.header.borderColor || '#2962FF'}
                          onChange={(e) => setTemplate({
                            ...template,
                            header: {
                              ...template.header,
                              borderColor: e.target.value,
                            },
                          })}
                          className="w-full h-10 rounded border border-neutral-300 dark:border-metallic-gray-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Page Background Color */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Page Background</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                      Background Color Presets
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: 'White', color: '#FFFFFF' },
                        { name: 'Cream', color: '#FFFEF7' },
                        { name: 'Light Gray', color: '#F5F5F5' },
                        { name: 'Warm', color: '#FFF8F0' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => setTemplate({
                            ...template,
                            colorScheme: {
                              ...template.colorScheme,
                              background: preset.color,
                            },
                          })}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            template.colorScheme.background === preset.color
                              ? 'border-blue-500 dark:border-mpondo-gold-500 ring-2 ring-blue-200 dark:ring-mpondo-gold-200'
                              : 'border-neutral-300 dark:border-metallic-gray-600 hover:border-blue-400'
                          }`}
                          style={{ backgroundColor: preset.color }}
                        >
                          <div className="text-xs font-medium text-neutral-700">{preset.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Custom Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={template.colorScheme.background}
                        onChange={(e) => setTemplate({
                          ...template,
                          colorScheme: {
                            ...template.colorScheme,
                            background: e.target.value,
                          },
                        })}
                        className="w-16 h-10 rounded border border-neutral-300 dark:border-metallic-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={template.colorScheme.background}
                        onChange={(e) => setTemplate({
                          ...template,
                          colorScheme: {
                            ...template.colorScheme,
                            background: e.target.value,
                          },
                        })}
                        className="flex-1 px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-mono"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>

              </div>
              )}
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-6">
              <p className="text-neutral-600 dark:text-neutral-400">
                Customize the appearance of different sections in your PDF documents.
              </p>
              {Object.entries(template.sections).map(([key, section]) => (
                <div key={key} className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Title Font Size
                      </label>
                      <input
                        type="number"
                        value={section.titleStyle.fontSize}
                        onChange={(e) => setTemplate({
                          ...template,
                          sections: {
                            ...template.sections,
                            [key]: {
                              ...section,
                              titleStyle: {
                                ...section.titleStyle,
                                fontSize: parseInt(e.target.value),
                              },
                            },
                          },
                        })}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Title Color
                      </label>
                      <input
                        type="color"
                        value={section.titleStyle.color}
                        onChange={(e) => setTemplate({
                          ...template,
                          sections: {
                            ...template.sections,
                            [key]: {
                              ...section,
                              titleStyle: {
                                ...section.titleStyle,
                                color: e.target.value,
                              },
                            },
                          },
                        })}
                        className="w-full h-10 rounded border border-neutral-300 dark:border-metallic-gray-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'table' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Table Styling
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Customize table appearance, borders, and colors
                </p>
              </div>

              {/* Table Border Options */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Border Style</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={template.table.showBorders}
                        onChange={(e) => setTemplate({
                          ...template,
                          table: {
                            ...template.table,
                            showBorders: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Show Table Borders</span>
                    </label>
                  </div>

                  {template.table.showBorders && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Border Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['solid', 'dashed', 'dotted'].map((style) => (
                            <button
                              key={style}
                              onClick={() => setTemplate({
                                ...template,
                                table: {
                                  ...template.table,
                                  borderStyle: style as any,
                                },
                              })}
                              className={`px-3 py-2 border-2 rounded-lg transition-colors capitalize ${
                                template.table.borderStyle === style
                                  ? 'border-blue-500 dark:border-mpondo-gold-500 bg-blue-50 dark:bg-mpondo-gold-900/20'
                                  : 'border-neutral-300 dark:border-metallic-gray-600 hover:border-blue-400'
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Border Color
                        </label>
                        <input
                          type="color"
                          value={template.table.borderColor}
                          onChange={(e) => setTemplate({
                            ...template,
                            table: {
                              ...template.table,
                              borderColor: e.target.value,
                            },
                          })}
                          className="w-full h-10 rounded border border-neutral-300 dark:border-metallic-gray-600 cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Table Colors */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Table Colors</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Header Background
                    </label>
                    <input
                      type="color"
                      value={template.table.headerBackgroundColor}
                      onChange={(e) => setTemplate({
                        ...template,
                        table: {
                          ...template.table,
                          headerBackgroundColor: e.target.value,
                        },
                      })}
                      className="w-full h-10 rounded border border-neutral-300 dark:border-metallic-gray-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Header Text Color
                    </label>
                    <input
                      type="color"
                      value={template.table.headerTextColor}
                      onChange={(e) => setTemplate({
                        ...template,
                        table: {
                          ...template.table,
                          headerTextColor: e.target.value,
                        },
                      })}
                      className="w-full h-10 rounded border border-neutral-300 dark:border-metallic-gray-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Row Background
                    </label>
                    <input
                      type="color"
                      value={template.table.rowBackgroundColor}
                      onChange={(e) => setTemplate({
                        ...template,
                        table: {
                          ...template.table,
                          rowBackgroundColor: e.target.value,
                        },
                      })}
                      className="w-full h-10 rounded border border-neutral-300 dark:border-metallic-gray-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Alternate Row Color
                    </label>
                    <input
                      type="color"
                      value={template.table.alternateRowColor}
                      onChange={(e) => setTemplate({
                        ...template,
                        table: {
                          ...template.table,
                          alternateRowColor: e.target.value,
                        },
                      })}
                      className="w-full h-10 rounded border border-neutral-300 dark:border-metallic-gray-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Table Presets */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Table Style Presets</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { 
                      name: 'Bordered', 
                      desc: 'Traditional table with borders',
                      showBorders: true,
                      borderStyle: 'solid'
                    },
                    { 
                      name: 'Borderless', 
                      desc: 'Clean, modern look',
                      showBorders: false
                    },
                    { 
                      name: 'Minimal Lines', 
                      desc: 'Subtle horizontal lines',
                      showBorders: true,
                      borderStyle: 'solid'
                    },
                    { 
                      name: 'Dashed', 
                      desc: 'Dashed border style',
                      showBorders: true,
                      borderStyle: 'dashed'
                    },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setTemplate({
                        ...template,
                        table: {
                          ...template.table,
                          showBorders: preset.showBorders,
                          borderStyle: (preset.borderStyle as any) || template.table.borderStyle,
                        },
                      })}
                      className="p-3 border-2 border-neutral-300 dark:border-metallic-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-mpondo-gold-500 transition-colors text-left"
                    >
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{preset.name}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Footer Settings
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Customize footer content, terms & conditions, and payment details
                </p>
              </div>

              {/* Basic Footer Options */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Footer Display</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={template.footer.showFooter}
                        onChange={(e) => setTemplate({
                          ...template,
                          footer: {
                            ...template.footer,
                            showFooter: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Show Footer</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={template.footer.showPageNumbers}
                        onChange={(e) => setTemplate({
                          ...template,
                          footer: {
                            ...template.footer,
                            showPageNumbers: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Page Numbers</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={template.footer.showTimestamp}
                        onChange={(e) => setTemplate({
                          ...template,
                          footer: {
                            ...template.footer,
                            showTimestamp: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Timestamp</span>
                    </label>
                  </div>

                  {template.footer.showFooter && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Footer Text
                      </label>
                      <input
                        type="text"
                        value={template.footer.text}
                        onChange={(e) => setTemplate({
                          ...template,
                          footer: {
                            ...template.footer,
                            text: e.target.value,
                          },
                        })}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg"
                        placeholder="Thank you for your business"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Terms & Conditions</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={template.footer.showLegalDisclaimer || false}
                        onChange={(e) => setTemplate({
                          ...template,
                          footer: {
                            ...template.footer,
                            showLegalDisclaimer: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Always Show Terms & Conditions</span>
                    </label>
                  </div>

                  {template.footer.showLegalDisclaimer && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Terms & Conditions Text
                      </label>
                      <textarea
                        value={template.footer.disclaimerText || ''}
                        onChange={(e) => setTemplate({
                          ...template,
                          footer: {
                            ...template.footer,
                            disclaimerText: e.target.value,
                          },
                        })}
                        rows={4}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm"
                        placeholder="• Payment is due within 30 days&#10;• Late payments subject to interest&#10;• All work remains property of firm until paid"
                      />
                      <p className="text-xs text-neutral-500 mt-1">This will appear at the bottom of every invoice/quote</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thank You Note */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Thank You Note</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={template.footer.showThankYouNote || false}
                        onChange={(e) => setTemplate({
                          ...template,
                          footer: {
                            ...template.footer,
                            showThankYouNote: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Show Thank You Note</span>
                    </label>
                  </div>

                  {template.footer.showThankYouNote && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Thank You Message
                      </label>
                      <textarea
                        value={template.footer.thankYouText || ''}
                        onChange={(e) => setTemplate({
                          ...template,
                          footer: {
                            ...template.footer,
                            thankYouText: e.target.value,
                          },
                        })}
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm"
                        placeholder="Thank you for your business. We appreciate your trust in our services."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment/Bank Details */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Payment Details</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={template.footer.showBankDetails || false}
                        onChange={(e) => setTemplate({
                          ...template,
                          footer: {
                            ...template.footer,
                            showBankDetails: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Show Bank/Payment Details</span>
                    </label>
                  </div>

                  {template.footer.showBankDetails && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Account Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your Law Firm"
                          className="w-full px-2 py-1.5 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234567890"
                          className="w-full px-2 py-1.5 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          placeholder="Standard Bank"
                          className="w-full px-2 py-1.5 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Branch Code
                        </label>
                        <input
                          type="text"
                          placeholder="051001"
                          className="w-full px-2 py-1.5 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 sticky top-6">
        <div className="border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Live Preview
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            See how your PDF will look
          </p>
        </div>
        
        <div className="p-6">
          {/* Preview Container */}
          <div 
            className="rounded-lg shadow-lg border border-neutral-200 relative" 
            style={{ 
              minHeight: '600px',
              backgroundColor: template.colorScheme.background || '#FFFFFF',
              display: 'flex'
            }}
          >
            {/* Vertical Title (Full Height) */}
            {(template.header as any).titleOrientation === 'vertical' && (
              <div 
                className="flex items-center justify-center py-8"
                style={{ 
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  width: '100px',
                  flexShrink: 0
                }}
              >
                <h1 
                  style={{ 
                    fontFamily: template.header.titleStyle.fontFamily,
                    fontSize: `${template.header.titleStyle.fontSize * 1.5}px`,
                    fontWeight: template.header.titleStyle.fontWeight,
                    color: template.header.titleStyle.color,
                    margin: 0,
                    letterSpacing: '8px',
                    opacity: 0.3
                  }}
                >
                  {template.header.title}
                </h1>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 p-8">
            {/* Header Preview */}
            <div className="mb-6">
              {(template.header as any).titleOrientation === 'vertical' ? (
                /* Vertical Mode - Show logo and details at top */
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-600 mb-2">Invoice to</h3>
                      <div style={{ 
                        fontFamily: template.sections.toSection.contentStyle.fontFamily,
                        fontSize: `${template.sections.toSection.contentStyle.fontSize}px`,
                        color: template.sections.toSection.contentStyle.color,
                      }}>
                        <p className="font-semibold">Client Name</p>
                        <p>Studio Address</p>
                        <p>123 Anywhere St., Any City, ST 12345</p>
                        <p>client@email.com</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {template.header.showLogo && logoPreview && (
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          style={{ 
                            width: `${template.header.logoWidth}px`, 
                            height: `${template.header.logoHeight}px`,
                            objectFit: 'contain',
                            opacity: template.header.logoOpacity || 1,
                            marginBottom: '12px',
                            marginLeft: 'auto'
                          }} 
                        />
                      )}
                      <div style={{ 
                        fontFamily: template.sections.fromSection.contentStyle.fontFamily,
                        fontSize: `${template.sections.fromSection.contentStyle.fontSize}px`,
                        color: template.sections.fromSection.contentStyle.color,
                      }}>
                        <p className="font-semibold" style={{ color: template.colorScheme.primary }}>AVERY DAVIS</p>
                        <p>123 Anywhere St., Any City, ST 12345</p>
                        <p>hello@reallygreatsite.com</p>
                        <p>www.reallygreatsite.com</p>
                        <p>123-456-7890</p>
                      </div>
                    </div>
                  </div>
                  {template.header.showBorder && (
                    <div 
                      style={{ 
                        height: `${template.header.borderWidth || 1}px`,
                        backgroundColor: template.header.borderColor,
                        marginBottom: '24px'
                      }} 
                    />
                  )}
                </div>
              ) : template.header.logoPlacement === 'watermark' ? (
                /* Watermark Layout */
                <div className="relative">
                  {template.header.showLogo && logoPreview && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <img 
                        src={logoPreview} 
                        alt="Logo" 
                        style={{ 
                          width: '200px',
                          height: '200px',
                          objectFit: 'contain',
                          opacity: template.header.logoOpacity || 0.1,
                          transform: `rotate(${template.header.logoRotation || 0}deg)`
                        }} 
                      />
                    </div>
                  )}
                  <div className="relative z-10" style={{ textAlign: template.header.titleStyle.alignment || 'center' }}>
                    <h1 
                      style={{ 
                        fontFamily: template.header.titleStyle.fontFamily,
                        fontSize: `${template.header.titleStyle.fontSize}px`,
                        fontWeight: template.header.titleStyle.fontWeight,
                        color: template.header.titleStyle.color,
                      }}
                    >
                      {template.header.title}
                    </h1>
                    {template.header.subtitle && template.header.subtitleStyle && (
                      <p 
                        style={{ 
                          fontFamily: template.header.subtitleStyle.fontFamily,
                          fontSize: `${template.header.subtitleStyle.fontSize}px`,
                          color: template.header.subtitleStyle.color,
                          marginTop: '8px'
                        }}
                      >
                        {template.header.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ) : template.header.logoPlacement === 'left' ? (
                /* Left Layout */
                <div className="flex items-center gap-4 mb-4">
                  {template.header.showLogo && logoPreview && (
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      style={{ 
                        width: `${template.header.logoWidth}px`, 
                        height: `${template.header.logoHeight}px`,
                        objectFit: 'contain',
                        opacity: template.header.logoOpacity || 1,
                        transform: `rotate(${template.header.logoRotation || 0}deg)`
                      }} 
                    />
                  )}
                  <div className="flex-1" style={{ textAlign: template.header.titleStyle.alignment || 'left' }}>
                    <h1 
                      style={{ 
                        fontFamily: template.header.titleStyle.fontFamily,
                        fontSize: `${template.header.titleStyle.fontSize}px`,
                        fontWeight: template.header.titleStyle.fontWeight,
                        color: template.header.titleStyle.color,
                      }}
                    >
                      {template.header.title}
                    </h1>
                    {template.header.subtitle && template.header.subtitleStyle && (
                      <p 
                        style={{ 
                          fontFamily: template.header.subtitleStyle.fontFamily,
                          fontSize: `${template.header.subtitleStyle.fontSize}px`,
                          color: template.header.subtitleStyle.color,
                          marginTop: '4px'
                        }}
                      >
                        {template.header.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ) : template.header.logoPlacement === 'right' ? (
                /* Right Layout */
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1" style={{ textAlign: template.header.titleStyle.alignment || 'right' }}>
                    <h1 
                      style={{ 
                        fontFamily: template.header.titleStyle.fontFamily,
                        fontSize: `${template.header.titleStyle.fontSize}px`,
                        fontWeight: template.header.titleStyle.fontWeight,
                        color: template.header.titleStyle.color,
                      }}
                    >
                      {template.header.title}
                    </h1>
                    {template.header.subtitle && template.header.subtitleStyle && (
                      <p 
                        style={{ 
                          fontFamily: template.header.subtitleStyle.fontFamily,
                          fontSize: `${template.header.subtitleStyle.fontSize}px`,
                          color: template.header.subtitleStyle.color,
                          marginTop: '4px'
                        }}
                      >
                        {template.header.subtitle}
                      </p>
                    )}
                  </div>
                  {template.header.showLogo && logoPreview && (
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      style={{ 
                        width: `${template.header.logoWidth}px`, 
                        height: `${template.header.logoHeight}px`,
                        objectFit: 'contain',
                        opacity: template.header.logoOpacity || 1,
                        transform: `rotate(${template.header.logoRotation || 0}deg)`
                      }} 
                    />
                  )}
                </div>
              ) : (
                /* Center Layout (default) */
                <div style={{ textAlign: 'center' }}>
                  {template.header.showLogo && logoPreview && (
                    <div className="flex justify-center mb-4">
                      <img 
                        src={logoPreview} 
                        alt="Logo" 
                        style={{ 
                          width: `${template.header.logoWidth}px`, 
                          height: `${template.header.logoHeight}px`,
                          objectFit: 'contain',
                          opacity: template.header.logoOpacity || 1,
                          transform: `rotate(${template.header.logoRotation || 0}deg)`
                        }} 
                      />
                    </div>
                  )}
                  <h1 
                    style={{ 
                      fontFamily: template.header.titleStyle.fontFamily,
                      fontSize: `${template.header.titleStyle.fontSize}px`,
                      fontWeight: template.header.titleStyle.fontWeight,
                      color: template.header.titleStyle.color,
                    }}
                  >
                    {template.header.title}
                  </h1>
                  {template.header.subtitle && template.header.subtitleStyle && (
                    <p 
                      style={{ 
                        fontFamily: template.header.subtitleStyle.fontFamily,
                        fontSize: `${template.header.subtitleStyle.fontSize}px`,
                        color: template.header.subtitleStyle.color,
                        marginTop: '8px'
                      }}
                    >
                      {template.header.subtitle}
                    </p>
                  )}
                </div>
              )}
              
              {template.header.showBorder && (
                <div 
                  style={{ 
                    height: `${template.header.borderWidth || 2}px`,
                    backgroundColor: template.header.borderColor,
                    marginTop: '16px',
                    borderStyle: template.header.borderStyle || 'solid',
                    borderWidth: template.header.borderStyle === 'solid' ? 0 : `${template.header.borderWidth || 2}px`,
                    borderColor: template.header.borderStyle !== 'solid' ? template.header.borderColor : 'transparent'
                  }} 
                />
              )}
            </div>

            {/* Sample Content */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 
                  style={{ 
                    fontFamily: template.sections.fromSection.titleStyle.fontFamily,
                    fontSize: `${template.sections.fromSection.titleStyle.fontSize}px`,
                    fontWeight: template.sections.fromSection.titleStyle.fontWeight,
                    color: template.sections.fromSection.titleStyle.color,
                    marginBottom: '8px'
                  }}
                >
                  {template.sections.fromSection.title}
                </h3>
                <div 
                  style={{ 
                    fontFamily: template.sections.fromSection.contentStyle.fontFamily,
                    fontSize: `${template.sections.fromSection.contentStyle.fontSize}px`,
                    color: template.sections.fromSection.contentStyle.color,
                  }}
                >
                  <p>Your Law Firm</p>
                  <p>Practice Number: 12345</p>
                  <p>email@lawfirm.com</p>
                </div>
              </div>
              
              <div>
                <h3 
                  style={{ 
                    fontFamily: template.sections.toSection.titleStyle.fontFamily,
                    fontSize: `${template.sections.toSection.titleStyle.fontSize}px`,
                    fontWeight: template.sections.toSection.titleStyle.fontWeight,
                    color: template.sections.toSection.titleStyle.color,
                    marginBottom: '8px'
                  }}
                >
                  {template.sections.toSection.title}
                </h3>
                <div 
                  style={{ 
                    fontFamily: template.sections.toSection.contentStyle.fontFamily,
                    fontSize: `${template.sections.toSection.contentStyle.fontSize}px`,
                    color: template.sections.toSection.contentStyle.color,
                  }}
                >
                  <p>Client Name</p>
                  <p>client@email.com</p>
                </div>
              </div>
            </div>

            {/* Sample Table */}
            <div className="mb-6">
              <h3 
                style={{ 
                  fontFamily: template.sections.itemsSection.titleStyle.fontFamily,
                  fontSize: `${template.sections.itemsSection.titleStyle.fontSize}px`,
                  fontWeight: template.sections.itemsSection.titleStyle.fontWeight,
                  color: template.sections.itemsSection.titleStyle.color,
                  marginBottom: '12px'
                }}
              >
                {template.sections.itemsSection.title}
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: template.table.headerBackgroundColor }}>
                    <th 
                      className="text-left p-3"
                      style={{ 
                        color: template.table.headerTextColor,
                        fontFamily: template.table.headerStyle.fontFamily,
                        fontSize: `${template.table.headerStyle.fontSize}px`,
                        border: template.table.showBorders ? `1px ${template.table.borderStyle || 'solid'} ${template.table.borderColor}` : 'none'
                      }}
                    >
                      Service
                    </th>
                    <th 
                      className="text-right p-3"
                      style={{ 
                        color: template.table.headerTextColor,
                        fontFamily: template.table.headerStyle.fontFamily,
                        fontSize: `${template.table.headerStyle.fontSize}px`,
                        border: template.table.showBorders ? `1px ${template.table.borderStyle || 'solid'} ${template.table.borderColor}` : 'none'
                      }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: template.table.rowBackgroundColor }}>
                    <td 
                      className="p-3"
                      style={{ 
                        fontFamily: template.table.cellStyle.fontFamily,
                        fontSize: `${template.table.cellStyle.fontSize}px`,
                        color: template.table.cellStyle.color,
                        border: template.table.showBorders ? `1px ${template.table.borderStyle || 'solid'} ${template.table.borderColor}` : 'none',
                        borderTop: !template.table.showBorders ? `1px solid ${template.table.borderColor}` : undefined
                      }}
                    >
                      Legal Consultation
                    </td>
                    <td 
                      className="text-right p-3"
                      style={{ 
                        fontFamily: template.table.cellStyle.fontFamily,
                        fontSize: `${template.table.cellStyle.fontSize}px`,
                        color: template.table.cellStyle.color,
                        border: template.table.showBorders ? `1px ${template.table.borderStyle || 'solid'} ${template.table.borderColor}` : 'none',
                        borderTop: !template.table.showBorders ? `1px solid ${template.table.borderColor}` : undefined
                      }}
                    >
                      R 2,500.00
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: template.table.alternateRowColor }}>
                    <td 
                      className="p-3"
                      style={{ 
                        fontFamily: template.table.cellStyle.fontFamily,
                        fontSize: `${template.table.cellStyle.fontSize}px`,
                        color: template.table.cellStyle.color,
                        border: template.table.showBorders ? `1px ${template.table.borderStyle || 'solid'} ${template.table.borderColor}` : 'none',
                        borderTop: !template.table.showBorders ? `1px solid ${template.table.borderColor}` : undefined
                      }}
                    >
                      Document Review
                    </td>
                    <td 
                      className="text-right p-3"
                      style={{ 
                        fontFamily: template.table.cellStyle.fontFamily,
                        fontSize: `${template.table.cellStyle.fontSize}px`,
                        color: template.table.cellStyle.color,
                        border: template.table.showBorders ? `1px ${template.table.borderStyle || 'solid'} ${template.table.borderColor}` : 'none',
                        borderTop: !template.table.showBorders ? `1px solid ${template.table.borderColor}` : undefined
                      }}
                    >
                      R 1,800.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sample Total */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span style={{ 
                    fontFamily: template.sections.summarySection.contentStyle.fontFamily,
                    fontSize: `${template.sections.summarySection.contentStyle.fontSize}px`,
                  }}>
                    Subtotal:
                  </span>
                  <span style={{ 
                    fontFamily: template.sections.summarySection.contentStyle.fontFamily,
                    fontSize: `${template.sections.summarySection.contentStyle.fontSize}px`,
                  }}>
                    R 4,300.00
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span style={{ 
                    fontFamily: template.sections.summarySection.contentStyle.fontFamily,
                    fontSize: `${template.sections.summarySection.contentStyle.fontSize}px`,
                  }}>
                    VAT (15%):
                  </span>
                  <span style={{ 
                    fontFamily: template.sections.summarySection.contentStyle.fontFamily,
                    fontSize: `${template.sections.summarySection.contentStyle.fontSize}px`,
                  }}>
                    R 645.00
                  </span>
                </div>
                <div 
                  className="flex justify-between pt-2 border-t"
                  style={{ borderColor: template.sections.summarySection.borderColor }}
                >
                  <span style={{ 
                    fontFamily: template.sections.summarySection.titleStyle.fontFamily,
                    fontSize: `${template.sections.summarySection.titleStyle.fontSize}px`,
                    fontWeight: template.sections.summarySection.titleStyle.fontWeight,
                    color: template.sections.summarySection.titleStyle.color,
                  }}>
                    TOTAL:
                  </span>
                  <span style={{ 
                    fontFamily: template.sections.summarySection.titleStyle.fontFamily,
                    fontSize: `${template.sections.summarySection.titleStyle.fontSize}px`,
                    fontWeight: template.sections.summarySection.titleStyle.fontWeight,
                    color: template.colorScheme.primary,
                  }}>
                    R 4,945.00
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Preview */}
            <div className="mt-8 pt-6 border-t border-neutral-200">
              {/* Thank You Note */}
              {template.footer.showThankYouNote && template.footer.thankYouText && (
                <div className="mb-6 text-center">
                  <p 
                    style={{ 
                      fontFamily: template.footer.textStyle?.fontFamily || 'helvetica',
                      fontSize: `${(template.footer.textStyle?.fontSize || 10) + 2}px`,
                      color: template.footer.textStyle?.color || '#666666',
                      fontWeight: 'bold'
                    }}
                  >
                    {template.footer.thankYouText}
                  </p>
                </div>
              )}

              {/* Bank/Payment Details */}
              {template.footer.showBankDetails && (
                <div className="mb-6 p-4 bg-neutral-50 rounded">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">PAYMENT METHOD</h4>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <p><strong>Bank Transfer:</strong> Thynk Unlimited Bank</p>
                    <p><strong>Account Number:</strong> 123-456-7890</p>
                    <p><strong>Account Name:</strong> Your Law Firm</p>
                    <p><strong>Branch Code:</strong> 051001</p>
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              {template.footer.showLegalDisclaimer && template.footer.disclaimerText && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-2">TERMS & CONDITIONS</h4>
                  <div 
                    className="text-xs text-neutral-600 whitespace-pre-line"
                    style={{ 
                      fontFamily: template.footer.textStyle?.fontFamily || 'helvetica',
                      fontSize: `${(template.footer.textStyle?.fontSize || 8)}px`,
                    }}
                  >
                    {template.footer.disclaimerText}
                  </div>
                </div>
              )}

              {/* Standard Footer */}
              {template.footer.showFooter && (
                <div className="text-center">
                  {template.footer.text && template.footer.textStyle && (
                    <p 
                      style={{ 
                        fontFamily: template.footer.textStyle.fontFamily,
                        fontSize: `${template.footer.textStyle.fontSize}px`,
                        color: template.footer.textStyle.color,
                      }}
                    >
                      {template.footer.text}
                    </p>
                  )}
                  <div className="flex justify-center gap-4 text-xs text-neutral-400 mt-2">
                    {template.footer.showTimestamp && (
                      <span>Generated on {new Date().toLocaleDateString()}</span>
                    )}
                    {template.footer.showPageNumbers && (
                      <span>Page 1 of 1</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
};
