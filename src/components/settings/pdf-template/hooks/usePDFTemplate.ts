/**
 * usePDFTemplate Hook
 * 
 * Manages PDF template state and provides update functions
 */

import { useState, useCallback } from 'react';
import {
  PDFTemplate,
  ColorScheme,
  LayoutConfig,
  LogoConfig,
  TitleConfig,
  TableConfig,
  FooterConfig,
  LayoutPreset,
} from '../types';
import { applyLayoutPreset } from '../utils/layoutPresets';

export const usePDFTemplate = (initialTemplate: PDFTemplate) => {
  const [template, setTemplate] = useState<PDFTemplate>(initialTemplate);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateColors = useCallback((colors: Partial<ColorScheme>) => {
    setTemplate(prev => ({
      ...prev,
      colors: { ...prev.colors, ...colors },
    }));
    setIsDirty(true);
  }, []);

  const updateLayout = useCallback((layout: Partial<LayoutConfig>) => {
    setTemplate(prev => ({
      ...prev,
      layout: { ...prev.layout, ...layout },
    }));
    setIsDirty(true);
  }, []);

  const updateLogo = useCallback((logo: Partial<LogoConfig>) => {
    setTemplate(prev => ({
      ...prev,
      logo: { ...prev.logo, ...logo },
    }));
    setIsDirty(true);
  }, []);

  const updateTitle = useCallback((title: Partial<TitleConfig>) => {
    setTemplate(prev => ({
      ...prev,
      title: { ...prev.title, ...title },
    }));
    setIsDirty(true);
  }, []);

  const updateTable = useCallback((table: Partial<TableConfig>) => {
    setTemplate(prev => ({
      ...prev,
      table: { ...prev.table, ...table },
    }));
    setIsDirty(true);
  }, []);

  const updateFooter = useCallback((footer: Partial<FooterConfig>) => {
    setTemplate(prev => ({
      ...prev,
      footer: { ...prev.footer, ...footer },
    }));
    setIsDirty(true);
  }, []);

  const applyPreset = useCallback((presetId: LayoutPreset) => {
    setTemplate(prev => ({
      ...prev,
      layout: applyLayoutPreset(prev.layout, presetId),
    }));
    setIsDirty(true);
  }, []);

  const applyColorScheme = useCallback((colors: ColorScheme) => {
    setTemplate(prev => ({
      ...prev,
      colors,
    }));
    setIsDirty(true);
  }, []);

  const resetTemplate = useCallback(() => {
    setTemplate(initialTemplate);
    setIsDirty(false);
    setError(null);
  }, [initialTemplate]);

  const saveTemplate = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Save logic would go here
      // For now, just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [template]);

  return {
    template,
    isDirty,
    isSaving,
    error,
    updateColors,
    updateLayout,
    updateLogo,
    updateTitle,
    updateTable,
    updateFooter,
    applyPreset,
    applyColorScheme,
    resetTemplate,
    saveTemplate,
  };
};
