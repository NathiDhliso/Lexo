/**
 * TableStyleSection Component
 * 
 * Controls for PDF table styling including borders, headers,
 * rows, and cell padding.
 */

import React from 'react';
import { TableStyleSectionProps } from './types';

export const TableStyleSection: React.FC<TableStyleSectionProps> = ({ value, onChange }) => {
  const handleChange = <K extends keyof typeof value>(key: K, newValue: typeof value[K]) => {
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  const borderStyles: Array<{ value: 'solid' | 'dashed' | 'dotted'; label: string }> = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Table Style
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Customize the appearance of tables in your PDF documents
        </p>
      </div>

      {/* Borderless Toggle */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div>
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Borderless Table
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Remove all table borders for a clean look
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleChange('borderless', !value.borderless)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${value.borderless ? 'bg-mpondo-gold-500' : 'bg-neutral-300 dark:bg-neutral-600'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${value.borderless ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Border Controls (only if not borderless) */}
      {!value.borderless && (
        <>
          {/* Border Style */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Border Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {borderStyles.map(style => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => handleChange('borderStyle', style.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-center
                    ${
                      value.borderStyle === style.value
                        ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }
                  `}
                >
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {style.label}
                  </div>
                  <div
                    className="mt-2 h-0.5 w-full"
                    style={{
                      borderTop: `2px ${style.value} currentColor`,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Border Width */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Border Width: {value.borderWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={value.borderWidth}
              onChange={e => handleChange('borderWidth', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
            />
          </div>

          {/* Border Color */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Border Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={value.borderColor}
                onChange={e => handleChange('borderColor', e.target.value)}
                className="w-12 h-10 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
              />
              <input
                type="text"
                value={value.borderColor}
                onChange={e => handleChange('borderColor', e.target.value)}
                placeholder="#000000"
                maxLength={7}
                className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
              />
            </div>
          </div>
        </>
      )}

      {/* Header Background Color */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Header Background Color
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={value.headerBg}
            onChange={e => handleChange('headerBg', e.target.value)}
            className="w-12 h-10 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
          />
          <input
            type="text"
            value={value.headerBg}
            onChange={e => handleChange('headerBg', e.target.value)}
            placeholder="#000000"
            maxLength={7}
            className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Header Text Color */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Header Text Color
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={value.headerText}
            onChange={e => handleChange('headerText', e.target.value)}
            className="w-12 h-10 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
          />
          <input
            type="text"
            value={value.headerText}
            onChange={e => handleChange('headerText', e.target.value)}
            placeholder="#000000"
            maxLength={7}
            className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Alternate Row Background Color */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Alternate Row Background
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={value.rowAltBg}
            onChange={e => handleChange('rowAltBg', e.target.value)}
            className="w-12 h-10 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
          />
          <input
            type="text"
            value={value.rowAltBg}
            onChange={e => handleChange('rowAltBg', e.target.value)}
            placeholder="#000000"
            maxLength={7}
            className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Cell Padding */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Cell Padding: {value.cellPadding}px
        </label>
        <input
          type="range"
          min="4"
          max="20"
          value={value.cellPadding}
          onChange={e => handleChange('cellPadding', parseInt(e.target.value))}
          className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
        />
        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          <span>Compact (4px)</span>
          <span>Spacious (20px)</span>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Preview
        </div>
        <div className="overflow-hidden rounded">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  backgroundColor: value.headerBg,
                  color: value.headerText,
                }}
              >
                <th
                  className="text-left text-sm font-semibold"
                  style={{
                    padding: `${value.cellPadding}px`,
                    border: !value.borderless
                      ? `${value.borderWidth}px ${value.borderStyle} ${value.borderColor}`
                      : 'none',
                  }}
                >
                  Description
                </th>
                <th
                  className="text-right text-sm font-semibold"
                  style={{
                    padding: `${value.cellPadding}px`,
                    border: !value.borderless
                      ? `${value.borderWidth}px ${value.borderStyle} ${value.borderColor}`
                      : 'none',
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white dark:bg-neutral-900">
                <td
                  className="text-sm"
                  style={{
                    padding: `${value.cellPadding}px`,
                    border: !value.borderless
                      ? `${value.borderWidth}px ${value.borderStyle} ${value.borderColor}`
                      : 'none',
                  }}
                >
                  Legal Services
                </td>
                <td
                  className="text-sm text-right"
                  style={{
                    padding: `${value.cellPadding}px`,
                    border: !value.borderless
                      ? `${value.borderWidth}px ${value.borderStyle} ${value.borderColor}`
                      : 'none',
                  }}
                >
                  R 5,000.00
                </td>
              </tr>
              <tr
                style={{
                  backgroundColor: value.rowAltBg,
                }}
              >
                <td
                  className="text-sm"
                  style={{
                    padding: `${value.cellPadding}px`,
                    border: !value.borderless
                      ? `${value.borderWidth}px ${value.borderStyle} ${value.borderColor}`
                      : 'none',
                  }}
                >
                  Consultation
                </td>
                <td
                  className="text-sm text-right"
                  style={{
                    padding: `${value.cellPadding}px`,
                    border: !value.borderless
                      ? `${value.borderWidth}px ${value.borderStyle} ${value.borderColor}`
                      : 'none',
                  }}
                >
                  R 2,500.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
