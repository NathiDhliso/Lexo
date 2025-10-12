/**
 * ColorSchemeSelector Component
 * 
 * Allows users to select from preset color schemes or create custom colors
 * for PDF templates.
 */

import React, { useState } from 'react';
import { ColorScheme, ColorSchemeSelectorProps } from './types';
import { COLOR_SCHEME_PRESETS, isValidHexColor } from './utils/colorSchemes';

export const ColorSchemeSelector: React.FC<ColorSchemeSelectorProps> = ({
  value,
  onChange,
  presets = COLOR_SCHEME_PRESETS,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPresetId(presetId);
      onChange(preset.colors);
      setShowCustomPicker(false);
    }
  };

  const handleCustomColorChange = (key: keyof ColorScheme, color: string) => {
    if (isValidHexColor(color)) {
      onChange({
        ...value,
        [key]: color,
      });
      setSelectedPresetId(null); // Clear preset selection when customizing
    }
  };

  const colorFields: Array<{ key: keyof ColorScheme; label: string; description: string }> = [
    { key: 'primary', label: 'Primary Color', description: 'Main brand color' },
    { key: 'secondary', label: 'Secondary Color', description: 'Supporting color' },
    { key: 'accent', label: 'Accent Color', description: 'Highlight color' },
    { key: 'text', label: 'Text Color', description: 'Main text color' },
    { key: 'background', label: 'Background', description: 'Page background' },
    { key: 'border', label: 'Border Color', description: 'Border and dividers' },
    { key: 'headerBg', label: 'Header Background', description: 'Table header background' },
    { key: 'headerText', label: 'Header Text', description: 'Table header text' },
    { key: 'rowAlt', label: 'Alternate Row', description: 'Alternate table row color' },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Color Scheme
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Choose a preset or customize individual colors
        </p>
      </div>

      {/* Preset Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Preset Color Schemes
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${
                  selectedPresetId === preset.id
                    ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }
              `}
            >
              {/* Color Preview Circles */}
              <div className="flex gap-1 mb-2">
                <div
                  className="w-6 h-6 rounded-full border border-neutral-300"
                  style={{ backgroundColor: preset.colors.primary }}
                  title="Primary"
                />
                <div
                  className="w-6 h-6 rounded-full border border-neutral-300"
                  style={{ backgroundColor: preset.colors.secondary }}
                  title="Secondary"
                />
                <div
                  className="w-6 h-6 rounded-full border border-neutral-300"
                  style={{ backgroundColor: preset.colors.accent }}
                  title="Accent"
                />
              </div>

              {/* Preset Info */}
              <div className="text-left">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {preset.name}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {preset.description}
                </div>
              </div>

              {/* Selected Indicator */}
              {selectedPresetId === preset.id && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="w-5 h-5 text-mpondo-gold-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="flex items-center gap-2 text-sm font-medium text-mpondo-gold-600 dark:text-mpondo-gold-400 hover:text-mpondo-gold-700 dark:hover:text-mpondo-gold-300"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showCustomPicker ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {showCustomPicker ? 'Hide' : 'Show'} Custom Color Picker
        </button>
      </div>

      {/* Custom Color Picker */}
      {showCustomPicker && (
        <div className="space-y-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Custom Colors
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colorFields.map(field => (
              <div key={field.key} className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {field.label}
                </label>
                <div className="flex gap-2 items-center">
                  {/* Color Input */}
                  <input
                    type="color"
                    value={value[field.key]}
                    onChange={e => handleCustomColorChange(field.key, e.target.value)}
                    className="w-12 h-10 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
                  />
                  {/* Hex Input */}
                  <input
                    type="text"
                    value={value[field.key]}
                    onChange={e => handleCustomColorChange(field.key, e.target.value)}
                    placeholder="#000000"
                    maxLength={7}
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {field.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Preview */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Preview
        </div>
        <div className="space-y-2">
          {/* Header Preview */}
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: value.headerBg,
              color: value.headerText,
              borderBottom: `2px solid ${value.border}`,
            }}
          >
            <div className="font-semibold">Table Header</div>
          </div>
          {/* Row Preview */}
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: value.background,
              color: value.text,
            }}
          >
            <div>Regular Row Content</div>
          </div>
          {/* Alternate Row Preview */}
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: value.rowAlt,
              color: value.text,
            }}
          >
            <div>Alternate Row Content</div>
          </div>
          {/* Accent Elements */}
          <div className="flex gap-2 mt-3">
            <div
              className="px-3 py-1 rounded text-sm font-medium"
              style={{
                backgroundColor: value.primary,
                color: '#FFFFFF',
              }}
            >
              Primary
            </div>
            <div
              className="px-3 py-1 rounded text-sm font-medium"
              style={{
                backgroundColor: value.secondary,
                color: '#FFFFFF',
              }}
            >
              Secondary
            </div>
            <div
              className="px-3 py-1 rounded text-sm font-medium"
              style={{
                backgroundColor: value.accent,
                color: '#FFFFFF',
              }}
            >
              Accent
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
