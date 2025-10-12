/**
 * LayoutPresetSelector Component
 * 
 * Allows users to select from preset layout configurations
 * for PDF templates with visual previews.
 */

import React, { useState } from 'react';
import { LayoutConfig, LayoutPresetSelectorProps, LayoutPreset } from './types';
import { LAYOUT_PRESETS, applyLayoutPreset } from './utils/layoutPresets';

export const LayoutPresetSelector: React.FC<LayoutPresetSelectorProps> = ({
  value,
  onChange,
  presets = LAYOUT_PRESETS,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<LayoutPreset | null>(value.preset);

  const handlePresetSelect = (presetId: string) => {
    const newConfig = applyLayoutPreset(value, presetId);
    setSelectedPreset(newConfig.preset);
    onChange(newConfig);
  };

  const getPresetIcon = (presetId: LayoutPreset): string => {
    const icons: Record<LayoutPreset, string> = {
      formal: '📋',
      modern: '✨',
      minimalist: '⚪',
      classic: '📜',
      executive: '💼',
      elegant: '👔',
      compact: '📦',
      spacious: '🌟',
    };
    return icons[presetId] || '📄';
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Layout Preset
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Choose a professional layout style
        </p>
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {presets.map(preset => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetSelect(preset.id)}
            className={`
              relative p-4 rounded-lg border-2 transition-all text-left
              ${
                selectedPreset === preset.id
                  ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20 shadow-md'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm'
              }
            `}
          >
            {/* Icon */}
            <div className="text-3xl mb-2">{getPresetIcon(preset.id)}</div>

            {/* Preset Name */}
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              {preset.name}
            </div>

            {/* Description */}
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
              {preset.description}
            </div>

            {/* Layout Preview */}
            {preset.config && (
              <div className="space-y-1 text-2xs text-neutral-500 dark:text-neutral-500">
                <div className="flex justify-between">
                  <span>Margins:</span>
                  <span className="font-mono">{preset.config.margins?.top}mm</span>
                </div>
                <div className="flex justify-between">
                  <span>Line Height:</span>
                  <span className="font-mono">{preset.config.spacing?.lineHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span>Section Gap:</span>
                  <span className="font-mono">{preset.config.spacing?.sectionGap}mm</span>
                </div>
              </div>
            )}

            {/* Selected Indicator */}
            {selectedPreset === preset.id && (
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

      {/* Current Settings Display */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Current Layout Settings
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Margins */}
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Margins</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Top:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {value.margins.top}mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Right:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {value.margins.right}mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Bottom:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {value.margins.bottom}mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Left:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {value.margins.left}mm
                </span>
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Spacing</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Section:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {value.spacing.sectionGap}mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Line:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {value.spacing.lineHeight}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Paragraph:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {value.spacing.paragraphSpacing}mm
                </span>
              </div>
            </div>
          </div>

          {/* Page Settings */}
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Page</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Size:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {value.pageSize}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Orient:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100 capitalize">
                  {value.orientation}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Preview */}
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Preview</div>
            <div className="relative w-full h-24 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-600 rounded">
              {/* Page margins visualization */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Layout presets provide professionally balanced spacing and margins.
          You can fine-tune individual values in the Advanced Layout Controls section.
        </div>
      </div>
    </div>
  );
};
