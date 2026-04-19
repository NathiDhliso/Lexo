import React from 'react';
import { PDFTemplate, PDFColorScheme } from '../../../types/pdf-template.types';
import { Upload, Eye, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';


export interface HeaderTabProps {
  template: PDFTemplate;
  setTemplate: (val: PDFTemplate | ((prev: PDFTemplate) => PDFTemplate)) => void;
  logoPreview?: string | null;
  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleColorSchemeSelect?: (scheme: PDFColorScheme) => void;
  applyLayoutPreset?: (presetName: string) => void;
  layoutMode?: 'presets' | 'advanced';
  setLayoutMode?: (val: 'presets' | 'advanced') => void;
}

export const HeaderTab: React.FC<HeaderTabProps> = ({ template, setTemplate, logoPreview, handleLogoUpload, handleColorSchemeSelect, applyLayoutPreset, layoutMode, setLayoutMode }) => {
  return (
    <>
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
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-blue-500"
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
          

    </>
  );
};
