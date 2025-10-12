/**
 * PDF Helper Utilities
 * 
 * Utility functions for PDF generation and template application
 */

import { PDFTemplate, ColorScheme, LayoutConfig } from '../types';

/**
 * Apply template styles to PDF document
 */
export const applyTemplateStyles = (template: PDFTemplate): Record<string, any> => {
  return {
    colors: template.colors,
    layout: template.layout,
    fonts: {
      title: {
        size: template.title.fontSize,
        weight: template.title.fontWeight,
      },
    },
    spacing: template.layout.spacing,
    margins: template.layout.margins,
  };
};

/**
 * Calculate page dimensions based on page size and orientation
 */
export const getPageDimensions = (
  pageSize: 'A4' | 'Letter' | 'Legal',
  orientation: 'portrait' | 'landscape'
): { width: number; height: number } => {
  const dimensions = {
    A4: { width: 210, height: 297 }, // mm
    Letter: { width: 216, height: 279 }, // mm (8.5 x 11 inches)
    Legal: { width: 216, height: 356 }, // mm (8.5 x 14 inches)
  };

  const size = dimensions[pageSize];

  return orientation === 'portrait'
    ? { width: size.width, height: size.height }
    : { width: size.height, height: size.width };
};

/**
 * Calculate content area dimensions after margins
 */
export const getContentDimensions = (
  template: PDFTemplate
): { width: number; height: number } => {
  const pageDims = getPageDimensions(template.layout.pageSize, template.layout.orientation);
  const margins = template.layout.margins;

  return {
    width: pageDims.width - margins.left - margins.right,
    height: pageDims.height - margins.top - margins.bottom,
  };
};

/**
 * Format color for PDF generation
 */
export const formatColorForPDF = (hexColor: string): { r: number; g: number; b: number } => {
  const hex = hexColor.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255,
  };
};

/**
 * Generate CSS styles from template
 */
export const generateCSSFromTemplate = (template: PDFTemplate): string => {
  return `
    :root {
      --primary-color: ${template.colors.primary};
      --secondary-color: ${template.colors.secondary};
      --accent-color: ${template.colors.accent};
      --text-color: ${template.colors.text};
      --background-color: ${template.colors.background};
      --border-color: ${template.colors.border};
      --header-bg: ${template.colors.headerBg};
      --header-text: ${template.colors.headerText};
      --row-alt: ${template.colors.rowAlt};
      
      --margin-top: ${template.layout.margins.top}mm;
      --margin-right: ${template.layout.margins.right}mm;
      --margin-bottom: ${template.layout.margins.bottom}mm;
      --margin-left: ${template.layout.margins.left}mm;
      
      --section-gap: ${template.layout.spacing.sectionGap}mm;
      --line-height: ${template.layout.spacing.lineHeight};
      --paragraph-spacing: ${template.layout.spacing.paragraphSpacing}mm;
      
      --title-font-size: ${template.title.fontSize}px;
      --title-font-weight: ${template.title.fontWeight};
      
      --cell-padding: ${template.table.cellPadding}px;
    }
  `;
};

/**
 * Validate template configuration
 */
export const validateTemplate = (template: PDFTemplate): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate colors
  const colorKeys: (keyof ColorScheme)[] = [
    'primary',
    'secondary',
    'accent',
    'text',
    'background',
    'border',
    'headerBg',
    'headerText',
    'rowAlt',
  ];

  colorKeys.forEach(key => {
    if (!/^#[0-9A-F]{6}$/i.test(template.colors[key])) {
      errors.push(`Invalid color format for ${key}: ${template.colors[key]}`);
    }
  });

  // Validate margins
  if (
    template.layout.margins.top < 10 ||
    template.layout.margins.top > 50 ||
    template.layout.margins.right < 10 ||
    template.layout.margins.right > 50 ||
    template.layout.margins.bottom < 10 ||
    template.layout.margins.bottom > 50 ||
    template.layout.margins.left < 10 ||
    template.layout.margins.left > 50
  ) {
    errors.push('Margins must be between 10mm and 50mm');
  }

  // Validate spacing
  if (
    template.layout.spacing.sectionGap < 5 ||
    template.layout.spacing.sectionGap > 30 ||
    template.layout.spacing.lineHeight < 1.0 ||
    template.layout.spacing.lineHeight > 3.0 ||
    template.layout.spacing.paragraphSpacing < 4 ||
    template.layout.spacing.paragraphSpacing > 20
  ) {
    errors.push('Spacing values are out of valid range');
  }

  // Validate title
  if (template.title.fontSize < 12 || template.title.fontSize > 48) {
    errors.push('Title font size must be between 12px and 48px');
  }

  // Validate logo
  if (template.logo.url) {
    if (template.logo.width < 20 || template.logo.width > 300) {
      errors.push('Logo width must be between 20px and 300px');
    }
    if (template.logo.height < 20 || template.logo.height > 300) {
      errors.push('Logo height must be between 20px and 300px');
    }
    if (template.logo.opacity < 0 || template.logo.opacity > 1) {
      errors.push('Logo opacity must be between 0 and 1');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Clone template for editing
 */
export const cloneTemplate = (template: PDFTemplate): PDFTemplate => {
  return JSON.parse(JSON.stringify(template));
};

/**
 * Merge template with defaults
 */
export const mergeWithDefaults = (
  partial: Partial<PDFTemplate>,
  defaults: PDFTemplate
): PDFTemplate => {
  return {
    ...defaults,
    ...partial,
    colors: { ...defaults.colors, ...partial.colors },
    layout: { ...defaults.layout, ...partial.layout },
    logo: { ...defaults.logo, ...partial.logo },
    title: { ...defaults.title, ...partial.title },
    table: { ...defaults.table, ...partial.table },
    footer: { ...defaults.footer, ...partial.footer },
  };
};

/**
 * Export template as JSON
 */
export const exportTemplateAsJSON = (template: PDFTemplate): string => {
  return JSON.stringify(template, null, 2);
};

/**
 * Import template from JSON
 */
export const importTemplateFromJSON = (json: string): PDFTemplate | null => {
  try {
    const template = JSON.parse(json);
    const validation = validateTemplate(template);
    if (!validation.valid) {
      console.error('Invalid template:', validation.errors);
      return null;
    }
    return template;
  } catch (error) {
    console.error('Failed to parse template JSON:', error);
    return null;
  }
};
