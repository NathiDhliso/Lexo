/**
 * Color Scheme Definitions
 * 
 * Pre-defined professional color schemes for PDF templates
 */

import { ColorScheme, ColorSchemePreset } from '../types';

export const COLOR_SCHEME_PRESETS: ColorSchemePreset[] = [
  {
    id: 'professional-gold',
    name: 'Professional Gold',
    description: 'Classic gold and blue combination for legal documents',
    colors: {
      primary: '#D4AF37',
      secondary: '#1E3A8A',
      accent: '#059669',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB',
      headerBg: '#F3F4F6',
      headerText: '#111827',
      rowAlt: '#F9FAFB',
    },
  },
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean and modern blue tones',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#10B981',
      text: '#111827',
      background: '#FFFFFF',
      border: '#D1D5DB',
      headerBg: '#EFF6FF',
      headerText: '#1E40AF',
      rowAlt: '#F9FAFB',
    },
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    description: 'Sophisticated purple and gray palette',
    colors: {
      primary: '#9333EA',
      secondary: '#6B21A8',
      accent: '#EC4899',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB',
      headerBg: '#FAF5FF',
      headerText: '#6B21A8',
      rowAlt: '#FAFAFA',
    },
  },
  {
    id: 'corporate-gray',
    name: 'Corporate Gray',
    description: 'Professional grayscale theme',
    colors: {
      primary: '#4B5563',
      secondary: '#1F2937',
      accent: '#6B7280',
      text: '#111827',
      background: '#FFFFFF',
      border: '#D1D5DB',
      headerBg: '#F3F4F6',
      headerText: '#111827',
      rowAlt: '#F9FAFB',
    },
  },
  {
    id: 'warm-orange',
    name: 'Warm Orange',
    description: 'Energetic orange and brown tones',
    colors: {
      primary: '#F97316',
      secondary: '#C2410C',
      accent: '#FBBF24',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB',
      headerBg: '#FFF7ED',
      headerText: '#C2410C',
      rowAlt: '#FFFBEB',
    },
  },
];

/**
 * Get color scheme preset by ID
 */
export const getColorSchemePreset = (id: string): ColorSchemePreset | undefined => {
  return COLOR_SCHEME_PRESETS.find(preset => preset.id === id);
};

/**
 * Get default color scheme
 */
export const getDefaultColorScheme = (): ColorScheme => {
  return COLOR_SCHEME_PRESETS[0].colors;
};

/**
 * Validate color hex format
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

/**
 * Convert hex to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Lighten a color by percentage
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);

  return rgbToHex(
    Math.min(255, r + amount),
    Math.min(255, g + amount),
    Math.min(255, b + amount)
  );
};

/**
 * Darken a color by percentage
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);

  return rgbToHex(
    Math.max(0, r - amount),
    Math.max(0, g - amount),
    Math.max(0, b - amount)
  );
};

/**
 * Get contrasting text color (black or white) for a background color
 */
export const getContrastingTextColor = (bgHex: string): string => {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return '#000000';

  // Calculate relative luminance
  const { r, g, b } = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};
