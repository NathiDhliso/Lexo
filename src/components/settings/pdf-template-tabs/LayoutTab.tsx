import React from 'react';
import { PDFTemplate, PDFColorScheme } from '../../../types/pdf-template.types';
import { Upload, Eye, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';


export interface LayoutTabProps {
  template: PDFTemplate;
  setTemplate: (val: PDFTemplate | ((prev: PDFTemplate) => PDFTemplate)) => void;
  logoPreview?: string | null;
  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleColorSchemeSelect?: (scheme: PDFColorScheme) => void;
  applyLayoutPreset: (presetName: string) => void;
  layoutMode: 'presets' | 'advanced';
  setLayoutMode: (val: 'presets' | 'advanced') => void;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ template, setTemplate, logoPreview, handleLogoUpload, handleColorSchemeSelect, applyLayoutPreset, layoutMode, setLayoutMode }) => {
  return (
    <>
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
                        ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 theme-shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    onClick={() => setLayoutMode('advanced')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      layoutMode === 'advanced'
                        ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 theme-shadow-sm'
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
                        className="p-4 border-2 border-neutral-300 dark:border-metallic-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-mpondo-gold-500 hover:theme-shadow-md transition-all text-left group"
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

              {/* Section Layout */}
              <div className="p-4 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Section Layout</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Choose how FROM and BILL TO sections are arranged
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTemplate({ ...template, sectionLayout: 'horizontal' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      template.sectionLayout === 'horizontal' || !template.sectionLayout
                        ? 'border-blue-500 dark:border-mpondo-gold-500 bg-blue-50 dark:bg-mpondo-gold-900/20'
                        : 'border-neutral-300 dark:border-metallic-gray-600 hover:border-blue-400 dark:hover:border-mpondo-gold-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">↔️</div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">Horizontal</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Side by side</div>
                  </button>
                  <button
                    onClick={() => setTemplate({ ...template, sectionLayout: 'vertical' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      template.sectionLayout === 'vertical'
                        ? 'border-blue-500 dark:border-mpondo-gold-500 bg-blue-50 dark:bg-mpondo-gold-900/20'
                        : 'border-neutral-300 dark:border-metallic-gray-600 hover:border-blue-400 dark:hover:border-mpondo-gold-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">↕️</div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">Vertical</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Stacked</div>
                  </button>
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
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-blue-500"
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
          

    </>
  );
};
