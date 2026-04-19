import React from 'react';
import { PDFTemplate, PDFColorScheme } from '../../../types/pdf-template.types';
import { Upload, Eye, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_COLOR_SCHEMES } from '../../../types/pdf-template.types';

export interface ColorsTabProps {
  template: PDFTemplate;
  setTemplate: (val: PDFTemplate | ((prev: PDFTemplate) => PDFTemplate)) => void;
  logoPreview?: string | null;
  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleColorSchemeSelect: (scheme: PDFColorScheme) => void;
  applyLayoutPreset?: (presetName: string) => void;
  layoutMode?: 'presets' | 'advanced';
  setLayoutMode?: (val: 'presets' | 'advanced') => void;
}

export const ColorsTab: React.FC<ColorsTabProps> = ({ template, setTemplate, logoPreview, handleLogoUpload, handleColorSchemeSelect, applyLayoutPreset, layoutMode, setLayoutMode }) => {
  return (
    <>
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
          

    </>
  );
};
