import React from 'react';
import { PDFTemplate, PDFColorScheme } from '../../../types/pdf-template.types';
import { Upload, Eye, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';


export interface PreviewPanelProps {
  template: PDFTemplate;
  setTemplate: (val: PDFTemplate | ((prev: PDFTemplate) => PDFTemplate)) => void;
  logoPreview?: string | null;
  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleColorSchemeSelect?: (scheme: PDFColorScheme) => void;
  applyLayoutPreset?: (presetName: string) => void;
  layoutMode?: 'presets' | 'advanced';
  setLayoutMode?: (val: 'presets' | 'advanced') => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ template, setTemplate, logoPreview, handleLogoUpload, handleColorSchemeSelect, applyLayoutPreset, layoutMode, setLayoutMode }) => {
  return (
    <>
            {/* Live Preview Panel */}
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 lg:sticky lg:top-6">
        <div className="border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Live Preview
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            See how your PDF will look
          </p>
        </div>
        
        <div className="p-4 md:p-6 bg-neutral-100 dark:bg-metallic-gray-900 rounded-lg">
          {/* Preview Container */}
          <div 
            className="rounded-lg theme-shadow-lg border border-neutral-300 dark:border-metallic-gray-600 relative overflow-hidden" 
            style={{ 
              minHeight: '400px',
              backgroundColor: template.colorScheme.background || '#FFFFFF',
              display: 'flex'
            }}
          >
            {/* Vertical Title (Full Height) */}
            {(template.header as any).titleOrientation === 'vertical' && (
              <div 
                className="hidden md:flex items-center justify-center py-8"
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
            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {/* Header Preview */}
            <div className="mb-6">
              {(template.header as any).titleOrientation === 'vertical' ? (
                /* Vertical Mode - Show logo and details at top */
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs md:text-sm font-semibold text-neutral-600 mb-2">Invoice to</h3>
                      <div style={{ 
                        fontFamily: template.sections.toSection.contentStyle.fontFamily,
                        fontSize: `${Math.max(8, template.sections.toSection.contentStyle.fontSize * 0.8)}px`,
                        color: template.sections.toSection.contentStyle.color,
                      }} className="text-xs md:text-sm">
                        <p className="font-semibold truncate">Client Name</p>
                        <p className="truncate">Studio Address</p>
                        <p className="truncate">123 Anywhere St., Any City, ST 12345</p>
                        <p className="truncate">client@email.com</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      {template.header.showLogo && logoPreview && (
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          style={{ 
                            width: `${Math.min(60, template.header.logoWidth || 100)}px`, 
                            height: `${Math.min(60, template.header.logoHeight || 100)}px`,
                            objectFit: 'contain',
                            opacity: template.header.logoOpacity || 1,
                            marginBottom: '8px',
                            marginLeft: 'auto'
                          }} 
                          className="md:w-auto md:h-auto"
                        />
                      )}
                      <div style={{ 
                        fontFamily: template.sections.fromSection.contentStyle.fontFamily,
                        fontSize: `${Math.max(8, template.sections.fromSection.contentStyle.fontSize * 0.8)}px`,
                        color: template.sections.fromSection.contentStyle.color,
                      }} className="text-xs md:text-sm">
                        <p className="font-semibold truncate" style={{ color: template.colorScheme.primary }}>Client</p>
                        <p className="truncate">client@email.com</p>
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
    </>
  );
};
