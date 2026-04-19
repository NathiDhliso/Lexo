import React from 'react';
import { PDFTemplate, PDFColorScheme } from '../../../types/pdf-template.types';
import { Upload, Eye, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';


export interface FooterTabProps {
  template: PDFTemplate;
  setTemplate: (val: PDFTemplate | ((prev: PDFTemplate) => PDFTemplate)) => void;
  logoPreview?: string | null;
  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleColorSchemeSelect?: (scheme: PDFColorScheme) => void;
  applyLayoutPreset?: (presetName: string) => void;
  layoutMode?: 'presets' | 'advanced';
  setLayoutMode?: (val: 'presets' | 'advanced') => void;
}

export const FooterTab: React.FC<FooterTabProps> = ({ template, setTemplate, logoPreview, handleLogoUpload, handleColorSchemeSelect, applyLayoutPreset, layoutMode, setLayoutMode }) => {
  return (
    <>
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
                        className="w-4 h-4 text-neutral-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-neutral-500"
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
                        className="w-4 h-4 text-neutral-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-neutral-500"
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
                        className="w-4 h-4 text-neutral-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-neutral-500"
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
                        className="w-4 h-4 text-neutral-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-neutral-500"
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
                        className="w-4 h-4 text-neutral-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-neutral-500"
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
                        className="w-4 h-4 text-neutral-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-neutral-500"
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
    </>
  );
};
