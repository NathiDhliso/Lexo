/**
 * Color Contrast Utilities
 * 
 * Helper functions for verifying WCAG color contrast compliance.
 * WCAG AA requires:
 * - Normal text (< 18px): 4.5:1 contrast ratio
 * - Large text (≥ 18px or ≥ 14px bold): 3:1 contrast ratio
 * - UI components: 3:1 contrast ratio
 * 
 * WCAG AAA requires:
 * - Normal text: 7:1 contrast ratio
 * - Large text: 4.5:1 contrast ratio
 */

/**
 * Convert hex color to RGB
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
 * Calculate relative luminance of a color
 * Based on WCAG formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio from 1:1 (no contrast) to 21:1 (maximum contrast)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (lightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if color combination meets WCAG AA standards
 */
export const meetsWCAG_AA = (
  foreground: string,
  background: string,
  isLargeText = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const minimumRatio = isLargeText ? 3 : 4.5;
  return ratio >= minimumRatio;
};

/**
 * Check if color combination meets WCAG AAA standards
 */
export const meetsWCAG_AAA = (
  foreground: string,
  background: string,
  isLargeText = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const minimumRatio = isLargeText ? 4.5 : 7;
  return ratio >= minimumRatio;
};

/**
 * Get compliance level for a color combination
 */
export const getComplianceLevel = (
  foreground: string,
  background: string,
  isLargeText = false
): 'AAA' | 'AA' | 'Fail' => {
  if (meetsWCAG_AAA(foreground, background, isLargeText)) return 'AAA';
  if (meetsWCAG_AA(foreground, background, isLargeText)) return 'AA';
  return 'Fail';
};

/**
 * Design System Color Palette with Contrast Verification
 * 
 * This object contains all colors from the design system with their
 * intended use cases and contrast verification against common backgrounds.
 */
export const designSystemColors = {
  // Primary Colors
  judicialBlue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // Primary brand color
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  mpondoGold: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Accent color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Status Colors
  statusSuccess: {
    50: '#f0fdf4',
    600: '#22c55e', // Success indicator
    700: '#16a34a',
  },
  statusError: {
    50: '#fef2f2',
    600: '#dc2626', // Error indicator
    700: '#b91c1c',
  },
  statusWarning: {
    50: '#fffbeb',
    600: '#f59e0b', // Warning indicator
    700: '#d97706',
  },
  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  metallicGray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
};

/**
 * Verify contrast for common color combinations in the design system
 */
export const verifyDesignSystemContrast = () => {
  const results: Array<{
    name: string;
    foreground: string;
    background: string;
    ratio: number;
    aa: boolean;
    aaa: boolean;
    level: string;
  }> = [];

  // Test primary text colors on white background
  const textOnWhite = [
    { name: 'Judicial Blue 600 on White', fg: '#2563eb', bg: '#ffffff' },
    { name: 'Mpondo Gold 500 on White', fg: '#f59e0b', bg: '#ffffff' },
    { name: 'Neutral 900 on White', fg: '#171717', bg: '#ffffff' },
    { name: 'Neutral 700 on White', fg: '#404040', bg: '#ffffff' },
    { name: 'Neutral 600 on White', fg: '#525252', bg: '#ffffff' },
  ];

  // Test primary text colors on dark background
  const textOnDark = [
    { name: 'White on Judicial Blue 600', fg: '#ffffff', bg: '#2563eb' },
    { name: 'White on Metallic Gray 900', fg: '#ffffff', bg: '#111827' },
    { name: 'Neutral 100 on Metallic Gray 900', fg: '#f5f5f5', bg: '#111827' },
  ];

  // Test status colors
  const statusColors = [
    { name: 'Success 600 on White', fg: '#22c55e', bg: '#ffffff' },
    { name: 'Error 600 on White', fg: '#dc2626', bg: '#ffffff' },
    { name: 'Warning 600 on White', fg: '#f59e0b', bg: '#ffffff' },
    { name: 'Success on Dark', fg: '#22c55e', bg: '#111827' },
    { name: 'Error on Dark', fg: '#dc2626', bg: '#111827' },
  ];

  [...textOnWhite, ...textOnDark, ...statusColors].forEach((test) => {
    const ratio = getContrastRatio(test.fg, test.bg);
    const aa = meetsWCAG_AA(test.fg, test.bg);
    const aaa = meetsWCAG_AAA(test.fg, test.bg);
    const level = getComplianceLevel(test.fg, test.bg);

    results.push({
      name: test.name,
      foreground: test.fg,
      background: test.bg,
      ratio: Math.round(ratio * 100) / 100,
      aa,
      aaa,
      level,
    });
  });

  return results;
};

/**
 * Console log design system contrast verification
 * Use this in development to verify all color combinations
 */
export const logContrastVerification = () => {
  console.group('🎨 Design System Contrast Verification');
  
  const results = verifyDesignSystemContrast();
  
  results.forEach((result) => {
    const emoji = result.level === 'AAA' ? '✅' : result.level === 'AA' ? '✔️' : '❌';
    console.log(
      `${emoji} ${result.name}: ${result.ratio}:1 (${result.level})`
    );
  });

  console.groupEnd();
  
  return results;
};
