/**
 * Layout Preset Definitions
 * 
 * Pre-defined professional layout presets for PDF templates
 */

import { LayoutPresetDefinition, LayoutConfig } from '../types';

export const LAYOUT_PRESETS: LayoutPresetDefinition[] = [
  {
    id: 'formal',
    name: 'Formal',
    description: 'Traditional formal layout with generous margins',
    config: {
      preset: 'formal',
      orientation: 'portrait',
      margins: { top: 25, right: 25, bottom: 25, left: 25 },
      spacing: { sectionGap: 15, lineHeight: 1.8, paragraphSpacing: 12 },
      pageSize: 'A4',
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean modern layout with balanced spacing',
    config: {
      preset: 'modern',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      spacing: { sectionGap: 12, lineHeight: 1.6, paragraphSpacing: 10 },
      pageSize: 'A4',
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Minimal design with maximum white space',
    config: {
      preset: 'minimalist',
      orientation: 'portrait',
      margins: { top: 30, right: 30, bottom: 30, left: 30 },
      spacing: { sectionGap: 20, lineHeight: 2.0, paragraphSpacing: 15 },
      pageSize: 'A4',
    },
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless classic layout',
    config: {
      preset: 'classic',
      orientation: 'portrait',
      margins: { top: 22, right: 22, bottom: 22, left: 22 },
      spacing: { sectionGap: 12, lineHeight: 1.7, paragraphSpacing: 10 },
      pageSize: 'A4',
    },
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Professional executive style',
    config: {
      preset: 'executive',
      orientation: 'portrait',
      margins: { top: 20, right: 25, bottom: 20, left: 25 },
      spacing: { sectionGap: 14, lineHeight: 1.75, paragraphSpacing: 11 },
      pageSize: 'A4',
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Refined elegant layout',
    config: {
      preset: 'elegant',
      orientation: 'portrait',
      margins: { top: 28, right: 24, bottom: 28, left: 24 },
      spacing: { sectionGap: 16, lineHeight: 1.85, paragraphSpacing: 13 },
      pageSize: 'A4',
    },
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Space-efficient compact layout',
    config: {
      preset: 'compact',
      orientation: 'portrait',
      margins: { top: 15, right: 15, bottom: 15, left: 15 },
      spacing: { sectionGap: 8, lineHeight: 1.4, paragraphSpacing: 6 },
      pageSize: 'A4',
    },
  },
  {
    id: 'spacious',
    name: 'Spacious',
    description: 'Generous spacing for easy reading',
    config: {
      preset: 'spacious',
      orientation: 'portrait',
      margins: { top: 35, right: 35, bottom: 35, left: 35 },
      spacing: { sectionGap: 18, lineHeight: 2.2, paragraphSpacing: 16 },
      pageSize: 'A4',
    },
  },
];

/**
 * Get layout preset by ID
 */
export const getLayoutPreset = (id: string): LayoutPresetDefinition | undefined => {
  return LAYOUT_PRESETS.find(preset => preset.id === id);
};

/**
 * Get default layout preset
 */
export const getDefaultLayoutPreset = (): LayoutPresetDefinition => {
  return LAYOUT_PRESETS[1]; // Modern preset
};

/**
 * Apply layout preset to existing config
 */
export const applyLayoutPreset = (
  currentConfig: LayoutConfig,
  presetId: string
): LayoutConfig => {
  const preset = getLayoutPreset(presetId);
  if (!preset || !preset.config) return currentConfig;

  return {
    ...currentConfig,
    ...preset.config,
  };
};

/**
 * Validate margins
 */
export const validateMargins = (margins: {
  top: number;
  right: number;
  bottom: number;
  left: number;
}): boolean => {
  const { top, right, bottom, left } = margins;
  return (
    top >= 10 &&
    top <= 50 &&
    right >= 10 &&
    right <= 50 &&
    bottom >= 10 &&
    bottom <= 50 &&
    left >= 10 &&
    left <= 50
  );
};

/**
 * Validate spacing
 */
export const validateSpacing = (spacing: {
  sectionGap: number;
  lineHeight: number;
  paragraphSpacing: number;
}): boolean => {
  const { sectionGap, lineHeight, paragraphSpacing } = spacing;
  return (
    sectionGap >= 5 &&
    sectionGap <= 30 &&
    lineHeight >= 1.0 &&
    lineHeight <= 3.0 &&
    paragraphSpacing >= 4 &&
    paragraphSpacing <= 20
  );
};
