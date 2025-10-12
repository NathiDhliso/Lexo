/**
 * LivePreviewPanel Component
 * 
 * Displays a live preview of the PDF template with zoom controls
 * and download functionality.
 */

import React, { useState } from 'react';
import { LivePreviewPanelProps } from './types';

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  template,
  sampleData,
  onDownload,
}) => {
  const [zoom, setZoom] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 25));
  };

  const handleReset = () => {
    setZoom(100);
  };

  const handleDownload = async () => {
    if (!onDownload) return;

    setIsGenerating(true);
    try {
      await onDownload();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Live Preview
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            See how your PDF will look
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 min-w-[4rem] text-center">
            {zoom}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            title="Reset Zoom"
          >
            Reset
          </button>

          {onDownload && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-white bg-mpondo-gold-500 rounded-lg hover:bg-mpondo-gold-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Preview Container */}
      <div className="border-2 border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-4 overflow-auto max-h-[600px]">
        <div
          className="mx-auto bg-white dark:bg-neutral-800 shadow-lg"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: template.layout.orientation === 'portrait' ? '210mm' : '297mm',
            minHeight: template.layout.orientation === 'portrait' ? '297mm' : '210mm',
            padding: `${template.layout.margins.top}mm ${template.layout.margins.right}mm ${template.layout.margins.bottom}mm ${template.layout.margins.left}mm`,
          }}
        >
          {/* Logo */}
          {template.logo.url && (
            <div
              className={`mb-4 ${
                template.logo.position === 'top-center'
                  ? 'text-center'
                  : template.logo.position === 'top-right'
                  ? 'text-right'
                  : 'text-left'
              }`}
            >
              <img
                src={template.logo.url}
                alt="Logo"
                style={{
                  width: `${template.logo.width}px`,
                  height: `${template.logo.height}px`,
                  opacity: template.logo.opacity,
                  transform: `rotate(${template.logo.rotation}deg)`,
                  display: 'inline-block',
                }}
              />
            </div>
          )}

          {/* Title */}
          <div
            style={{
              textAlign: template.title.alignment,
              marginBottom: `${template.layout.spacing.sectionGap}mm`,
            }}
          >
            <h1
              style={{
                fontSize: `${template.title.fontSize}px`,
                fontWeight: template.title.fontWeight,
                borderBottom:
                  template.title.borderStyle !== 'none'
                    ? `${template.title.borderWidth}px ${template.title.borderStyle} ${template.title.borderColor}`
                    : 'none',
                display: 'inline-block',
                writingMode:
                  template.title.orientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
                color: template.colors.text,
              }}
            >
              INVOICE
            </h1>
          </div>

          {/* Sample Content */}
          <div
            style={{
              marginBottom: `${template.layout.spacing.sectionGap}mm`,
              lineHeight: template.layout.spacing.lineHeight,
            }}
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="font-semibold" style={{ color: template.colors.text }}>
                  FROM:
                </div>
                <div style={{ color: template.colors.text }}>
                  {sampleData?.from || 'Your Law Firm'}
                  <br />
                  123 Legal Street
                  <br />
                  Johannesburg, 2000
                </div>
              </div>
              <div>
                <div className="font-semibold" style={{ color: template.colors.text }}>
                  BILL TO:
                </div>
                <div style={{ color: template.colors.text }}>
                  {sampleData?.to || 'Client Name'}
                  <br />
                  456 Client Avenue
                  <br />
                  Cape Town, 8000
                </div>
              </div>
            </div>

            {/* Table */}
            <table className="w-full" style={{ marginBottom: `${template.layout.spacing.sectionGap}mm` }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: template.colors.headerBg,
                    color: template.colors.headerText,
                  }}
                >
                  <th
                    className="text-left font-semibold"
                    style={{
                      padding: `${template.table.cellPadding}px`,
                      border: !template.table.borderless
                        ? `${template.table.borderWidth}px ${template.table.borderStyle} ${template.table.borderColor}`
                        : 'none',
                    }}
                  >
                    Description
                  </th>
                  <th
                    className="text-right font-semibold"
                    style={{
                      padding: `${template.table.cellPadding}px`,
                      border: !template.table.borderless
                        ? `${template.table.borderWidth}px ${template.table.borderStyle} ${template.table.borderColor}`
                        : 'none',
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: template.colors.background }}>
                  <td
                    style={{
                      padding: `${template.table.cellPadding}px`,
                      border: !template.table.borderless
                        ? `${template.table.borderWidth}px ${template.table.borderStyle} ${template.table.borderColor}`
                        : 'none',
                      color: template.colors.text,
                    }}
                  >
                    Legal Services
                  </td>
                  <td
                    className="text-right"
                    style={{
                      padding: `${template.table.cellPadding}px`,
                      border: !template.table.borderless
                        ? `${template.table.borderWidth}px ${template.table.borderStyle} ${template.table.borderColor}`
                        : 'none',
                      color: template.colors.text,
                    }}
                  >
                    R 5,000.00
                  </td>
                </tr>
                <tr style={{ backgroundColor: template.colors.rowAlt }}>
                  <td
                    style={{
                      padding: `${template.table.cellPadding}px`,
                      border: !template.table.borderless
                        ? `${template.table.borderWidth}px ${template.table.borderStyle} ${template.table.borderColor}`
                        : 'none',
                      color: template.colors.text,
                    }}
                  >
                    Consultation
                  </td>
                  <td
                    className="text-right"
                    style={{
                      padding: `${template.table.cellPadding}px`,
                      border: !template.table.borderless
                        ? `${template.table.borderWidth}px ${template.table.borderStyle} ${template.table.borderColor}`
                        : 'none',
                      color: template.colors.text,
                    }}
                  >
                    R 2,500.00
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <div
              className="text-sm border-t-2 pt-4"
              style={{
                borderColor: template.colors.border,
                color: template.colors.text,
              }}
            >
              {template.footer.showTerms && (
                <div className="mb-2">
                  <strong>Terms:</strong> {template.footer.termsText}
                </div>
              )}
              {template.footer.showThankYou && (
                <div className="mb-2 italic">{template.footer.thankYouText}</div>
              )}
              {template.footer.showBankDetails && template.footer.bankDetails.bankName && (
                <div className="mb-2">
                  <strong>Banking Details:</strong> {template.footer.bankDetails.bankName} |{' '}
                  {template.footer.bankDetails.accountName} | Acc:{' '}
                  {template.footer.bankDetails.accountNumber}
                </div>
              )}
              <div className="flex justify-between text-xs mt-4">
                {template.footer.showPageNumbers && <span>Page 1 of 1</span>}
                {template.footer.showTimestamp && (
                  <span>Generated: {new Date().toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          This is a live preview of your PDF template. Changes you make to colors, layout, and
          styling will be reflected here in real-time.
        </div>
      </div>
    </div>
  );
};
