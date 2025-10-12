/**
 * Integration Tests for PDF Template System
 * 
 * Tests the complete workflow of using all components together
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePDFTemplate } from '../hooks/usePDFTemplate';
import { useColorScheme } from '../hooks/useColorScheme';
import { usePreview } from '../hooks/usePreview';
import {
  PDFTemplate,
  DEFAULT_COLOR_SCHEME,
  DEFAULT_MARGINS,
  DEFAULT_SPACING,
  DEFAULT_LOGO_CONFIG,
  DEFAULT_TITLE_CONFIG,
  DEFAULT_TABLE_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from '../types';
import { validateTemplate } from '../utils/pdfHelpers';

describe('PDF Template System Integration', () => {
  const mockTemplate: PDFTemplate = {
    id: 'test-template',
    advocate_id: 'test-advocate',
    name: 'Test Template',
    is_default: false,
    colors: DEFAULT_COLOR_SCHEME,
    layout: {
      preset: 'modern',
      orientation: 'portrait',
      margins: DEFAULT_MARGINS,
      spacing: DEFAULT_SPACING,
      pageSize: 'A4',
    },
    logo: DEFAULT_LOGO_CONFIG,
    title: DEFAULT_TITLE_CONFIG,
    table: DEFAULT_TABLE_CONFIG,
    footer: DEFAULT_FOOTER_CONFIG,
  };

  describe('usePDFTemplate Hook', () => {
    it('initializes with provided template', () => {
      const { result } = renderHook(() => usePDFTemplate(mockTemplate));

      expect(result.current.template).toEqual(mockTemplate);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    it('updates colors and marks as dirty', () => {
      const { result } = renderHook(() => usePDFTemplate(mockTemplate));

      act(() => {
        result.current.updateColors({ primary: '#FF0000' });
      });

      expect(result.current.template.colors.primary).toBe('#FF0000');
      expect(result.current.isDirty).toBe(true);
    });

    it('updates layout and marks as dirty', () => {
      const { result } = renderHook(() => usePDFTemplate(mockTemplate));

      act(() => {
        result.current.updateLayout({ orientation: 'landscape' });
      });

      expect(result.current.template.layout.orientation).toBe('landscape');
      expect(result.current.isDirty).toBe(true);
    });

    it('resets template to initial state', () => {
      const { result } = renderHook(() => usePDFTemplate(mockTemplate));

      act(() => {
        result.current.updateColors({ primary: '#FF0000' });
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.resetTemplate();
      });

      expect(result.current.template).toEqual(mockTemplate);
      expect(result.current.isDirty).toBe(false);
    });

    it('applies layout preset', () => {
      const { result } = renderHook(() => usePDFTemplate(mockTemplate));

      act(() => {
        result.current.applyPreset('formal');
      });

      expect(result.current.template.layout.preset).toBe('formal');
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('useColorScheme Hook', () => {
    it('initializes with provided scheme', () => {
      const { result } = renderHook(() => useColorScheme(DEFAULT_COLOR_SCHEME));

      expect(result.current.colorScheme).toEqual(DEFAULT_COLOR_SCHEME);
    });

    it('applies preset and tracks selection', () => {
      const { result } = renderHook(() => useColorScheme(DEFAULT_COLOR_SCHEME));

      act(() => {
        result.current.applyPreset('modern-blue');
      });

      expect(result.current.selectedPresetId).toBe('modern-blue');
    });

    it('updates individual color', () => {
      const { result } = renderHook(() => useColorScheme(DEFAULT_COLOR_SCHEME));

      act(() => {
        result.current.updateColor('primary', '#FF0000');
      });

      expect(result.current.colorScheme.primary).toBe('#FF0000');
      expect(result.current.selectedPresetId).toBeNull();
    });

    it('lightens color', () => {
      const { result } = renderHook(() => useColorScheme(DEFAULT_COLOR_SCHEME));

      act(() => {
        result.current.lighten('primary', 20);
      });

      expect(result.current.colorScheme.primary).not.toBe(DEFAULT_COLOR_SCHEME.primary);
    });
  });

  describe('usePreview Hook', () => {
    it('initializes with default zoom', () => {
      const { result } = renderHook(() => usePreview());

      expect(result.current.zoom).toBe(100);
      expect(result.current.isGenerating).toBe(false);
    });

    it('zooms in correctly', () => {
      const { result } = renderHook(() => usePreview());

      act(() => {
        result.current.zoomIn();
      });

      expect(result.current.zoom).toBe(125);
    });

    it('zooms out correctly', () => {
      const { result } = renderHook(() => usePreview());

      act(() => {
        result.current.zoomOut();
      });

      expect(result.current.zoom).toBe(75);
    });

    it('respects zoom limits', () => {
      const { result } = renderHook(() => usePreview());

      act(() => {
        result.current.setCustomZoom(300);
      });

      expect(result.current.zoom).toBe(200); // Max limit

      act(() => {
        result.current.setCustomZoom(10);
      });

      expect(result.current.zoom).toBe(50); // Min limit
    });

    it('resets zoom to 100%', () => {
      const { result } = renderHook(() => usePreview());

      act(() => {
        result.current.zoomIn();
        result.current.zoomIn();
      });

      expect(result.current.zoom).toBe(150);

      act(() => {
        result.current.resetZoom();
      });

      expect(result.current.zoom).toBe(100);
    });
  });

  describe('Template Validation', () => {
    it('validates correct template', () => {
      const validation = validateTemplate(mockTemplate);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('detects invalid color format', () => {
      const invalidTemplate = {
        ...mockTemplate,
        colors: {
          ...mockTemplate.colors,
          primary: 'invalid-color',
        },
      };

      const validation = validateTemplate(invalidTemplate);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('detects invalid margins', () => {
      const invalidTemplate = {
        ...mockTemplate,
        layout: {
          ...mockTemplate.layout,
          margins: { top: 5, right: 20, bottom: 20, left: 20 },
        },
      };

      const validation = validateTemplate(invalidTemplate);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Margins must be between 10mm and 50mm');
    });

    it('detects invalid font size', () => {
      const invalidTemplate = {
        ...mockTemplate,
        title: {
          ...mockTemplate.title,
          fontSize: 100,
        },
      };

      const validation = validateTemplate(invalidTemplate);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Title font size must be between 12px and 48px');
    });
  });

  describe('Complete Workflow', () => {
    it('supports full customization workflow', () => {
      const { result } = renderHook(() => usePDFTemplate(mockTemplate));

      // Step 1: Apply color scheme
      act(() => {
        result.current.applyColorScheme({
          ...DEFAULT_COLOR_SCHEME,
          primary: '#FF0000',
        });
      });

      expect(result.current.template.colors.primary).toBe('#FF0000');

      // Step 2: Apply layout preset
      act(() => {
        result.current.applyPreset('formal');
      });

      expect(result.current.template.layout.preset).toBe('formal');

      // Step 3: Update logo
      act(() => {
        result.current.updateLogo({ url: 'https://example.com/logo.png' });
      });

      expect(result.current.template.logo.url).toBe('https://example.com/logo.png');

      // Step 4: Update title
      act(() => {
        result.current.updateTitle({ fontSize: 32 });
      });

      expect(result.current.template.title.fontSize).toBe(32);

      // Step 5: Update table
      act(() => {
        result.current.updateTable({ borderless: true });
      });

      expect(result.current.template.table.borderless).toBe(true);

      // Step 6: Update footer
      act(() => {
        result.current.updateFooter({ showPageNumbers: false });
      });

      expect(result.current.template.footer.showPageNumbers).toBe(false);

      // Verify template is dirty
      expect(result.current.isDirty).toBe(true);

      // Validate final template
      const validation = validateTemplate(result.current.template);
      expect(validation.valid).toBe(true);
    });
  });
});
