import React from 'react';
import { PDFTemplate, PDFColorScheme } from '../../../types/pdf-template.types';
import { Upload, Eye, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';


export interface SectionsTabProps {
  template: PDFTemplate;
  setTemplate: (val: PDFTemplate | ((prev: PDFTemplate) => PDFTemplate)) => void;
  logoPreview?: string | null;
  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleColorSchemeSelect?: (scheme: PDFColorScheme) => void;
  applyLayoutPreset?: (presetName: string) => void;
  layoutMode?: 'presets' | 'advanced';
  setLayoutMode?: (val: 'presets' | 'advanced') => void;
}

export const SectionsTab: React.FC<SectionsTabProps> = ({ template, setTemplate, logoPreview, handleLogoUpload, handleColorSchemeSelect, applyLayoutPreset, layoutMode, setLayoutMode }) => {
  return (
    <>
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
          

    </>
  );
};
