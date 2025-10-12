/**
 * AdvancedLayoutControls Component
 * 
 * Fine-grained controls for PDF layout including margins,
 * spacing, orientation, and page size.
 */

import React from 'react';
import { AdvancedLayoutControlsProps, PageSize } from './types';

export const AdvancedLayoutControls: React.FC<AdvancedLayoutControlsProps> = ({
  value,
  onChange,
}) => {
  const handleMarginChange = (side: 'top' | 'right' | 'bottom' | 'left', newValue: number) => {
    onChange({
      ...value,
      margins: {
        ...value.margins,
        [side]: Math.max(10, Math.min(50, newValue)),
      },
    });
  };

  const handleSpacingChange = (
    key: 'sectionGap' | 'lineHeight' | 'paragraphSpacing',
    newValue: number
  ) => {
    onChange({
      ...value,
      spacing: {
        ...value.spacing,
        [key]: newValue,
      },
    });
  };

  const handleOrientationChange = (orientation: 'portrait' | 'landscape') => {
    onChange({
      ...value,
      orientation,
    });
  };

  const handlePageSizeChange = (pageSize: PageSize) => {
    onChange({
      ...value,
      pageSize,
    });
  };

  const pageSizes: Array<{ value: PageSize; label: string; dimensions: string }> = [
    { value: 'A4', label: 'A4', dimensions: '210 × 297 mm' },
    { value: 'Letter', label: 'Letter', dimensions: '8.5 × 11 in' },
    { value: 'Legal', label: 'Legal', dimensions: '8.5 × 14 in' },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Advanced Layout Controls
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Fine-tune margins, spacing, and page settings
        </p>
      </div>

      {/* Page Size */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Page Size
        </label>
        <div className="grid grid-cols-3 gap-3">
          {pageSizes.map(size => (
            <button
              key={size.value}
              type="button"
              onClick={() => handlePageSizeChange(size.value)}
              className={`
                p-3 rounded-lg border-2 transition-all text-center
                ${
                  value.pageSize === size.value
                    ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }
              `}
            >
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {size.label}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                {size.dimensions}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Page Orientation
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOrientationChange('portrait')}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${
                value.orientation === 'portrait'
                  ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }
            `}
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-16 border-2 border-current rounded" />
            </div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Portrait
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleOrientationChange('landscape')}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${
                value.orientation === 'landscape'
                  ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }
            `}
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-16 h-12 border-2 border-current rounded" />
            </div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Landscape
            </div>
          </button>
        </div>
      </div>

      {/* Margins */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Page Margins (mm)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              Top: {value.margins.top}mm
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={value.margins.top}
              onChange={e => handleMarginChange('top', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              Right: {value.margins.right}mm
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={value.margins.right}
              onChange={e => handleMarginChange('right', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              Bottom: {value.margins.bottom}mm
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={value.margins.bottom}
              onChange={e => handleMarginChange('bottom', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              Left: {value.margins.left}mm
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={value.margins.left}
              onChange={e => handleMarginChange('left', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
            />
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Content Spacing
        </label>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              Section Gap: {value.spacing.sectionGap}mm
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={value.spacing.sectionGap}
              onChange={e => handleSpacingChange('sectionGap', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              Line Height: {value.spacing.lineHeight}
            </label>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={value.spacing.lineHeight}
              onChange={e => handleSpacingChange('lineHeight', parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              Paragraph Spacing: {value.spacing.paragraphSpacing}mm
            </label>
            <input
              type="range"
              min="4"
              max="20"
              value={value.spacing.paragraphSpacing}
              onChange={e => handleSpacingChange('paragraphSpacing', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
            />
          </div>
        </div>
      </div>

      {/* Visual Preview */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Layout Preview
        </div>
        <div
          className={`
            relative bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-600 rounded mx-auto
            ${value.orientation === 'portrait' ? 'w-32 h-44' : 'w-44 h-32'}
          `}
        >
          {/* Margin visualization */}
          <div
            className="absolute bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 border border-mpondo-gold-300 dark:border-mpondo-gold-700"
            style={{
              top: `${(value.margins.top / 50) * 100}%`,
              right: `${(value.margins.right / 50) * 100}%`,
              bottom: `${(value.margins.bottom / 50) * 100}%`,
              left: `${(value.margins.left / 50) * 100}%`,
            }}
          >
            {/* Content lines */}
            <div className="space-y-1 p-1">
              <div className="h-0.5 bg-neutral-400 dark:bg-neutral-600 rounded" />
              <div className="h-0.5 bg-neutral-400 dark:bg-neutral-600 rounded w-3/4" />
              <div className="h-0.5 bg-neutral-400 dark:bg-neutral-600 rounded w-5/6" />
            </div>
          </div>
          {/* Page size label */}
          <div className="absolute bottom-1 right-1 text-2xs text-neutral-500 dark:text-neutral-400">
            {value.pageSize}
          </div>
        </div>
      </div>
    </div>
  );
};
