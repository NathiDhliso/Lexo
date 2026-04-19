import React from 'react';
import { PDFTemplate, PDFColorScheme } from '../../../types/pdf-template.types';
import { Upload, Eye, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';


export interface TableTabProps {
  template: PDFTemplate;
  setTemplate: (val: PDFTemplate | ((prev: PDFTemplate) => PDFTemplate)) => void;
  logoPreview?: string | null;
  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleColorSchemeSelect?: (scheme: PDFColorScheme) => void;
  applyLayoutPreset?: (presetName: string) => void;
  layoutMode?: 'presets' | 'advanced';
  setLayoutMode?: (val: 'presets' | 'advanced') => void;
}

export const TableTab: React.FC<TableTabProps> = ({ template, setTemplate, logoPreview, handleLogoUpload, handleColorSchemeSelect, applyLayoutPreset, layoutMode, setLayoutMode }) => {
  return (
    <>
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
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-blue-500"
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
          

    </>
  );
};
