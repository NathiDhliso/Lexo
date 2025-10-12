/**
 * useColorScheme Hook
 * 
 * Manages color scheme state and provides color manipulation utilities
 */

import { useState, useCallback } from 'react';
import { ColorScheme } from '../types';
import {
  COLOR_SCHEME_PRESETS,
  lightenColor,
  darkenColor,
  getContrastingTextColor,
  isValidHexColor,
} from '../utils/colorSchemes';

export const useColorScheme = (initialScheme: ColorScheme) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(initialScheme);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const applyPreset = useCallback((presetId: string) => {
    const preset = COLOR_SCHEME_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setColorScheme(preset.colors);
      setSelectedPresetId(presetId);
    }
  }, []);

  const updateColor = useCallback((key: keyof ColorScheme, value: string) => {
    if (isValidHexColor(value)) {
      setColorScheme(prev => ({
        ...prev,
        [key]: value,
      }));
      setSelectedPresetId(null); // Clear preset when customizing
    }
  }, []);

  const lighten = useCallback((key: keyof ColorScheme, percent: number) => {
    setColorScheme(prev => ({
      ...prev,
      [key]: lightenColor(prev[key], percent),
    }));
    setSelectedPresetId(null);
  }, []);

  const darken = useCallback((key: keyof ColorScheme, percent: number) => {
    setColorScheme(prev => ({
      ...prev,
      [key]: darkenColor(prev[key], percent),
    }));
    setSelectedPresetId(null);
  }, []);

  const getContrast = useCallback((bgKey: keyof ColorScheme): string => {
    return getContrastingTextColor(colorScheme[bgKey]);
  }, [colorScheme]);

  const reset = useCallback(() => {
    setColorScheme(initialScheme);
    setSelectedPresetId(null);
  }, [initialScheme]);

  return {
    colorScheme,
    selectedPresetId,
    applyPreset,
    updateColor,
    lighten,
    darken,
    getContrast,
    reset,
  };
};
