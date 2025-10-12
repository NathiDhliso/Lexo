/**
 * ColorSchemeSelector Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorSchemeSelector } from '../ColorSchemeSelector';
import { ColorScheme } from '../types';
import { COLOR_SCHEME_PRESETS } from '../utils/colorSchemes';

describe('ColorSchemeSelector', () => {
  const mockColorScheme: ColorScheme = {
    primary: '#D4AF37',
    secondary: '#1E3A8A',
    accent: '#059669',
    text: '#1F2937',
    background: '#FFFFFF',
    border: '#E5E7EB',
    headerBg: '#F3F4F6',
    headerText: '#111827',
    rowAlt: '#F9FAFB',
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders without crashing', () => {
    render(
      <ColorSchemeSelector
        value={mockColorScheme}
        onChange={mockOnChange}
        presets={COLOR_SCHEME_PRESETS}
      />
    );

    expect(screen.getByText('Color Scheme')).toBeInTheDocument();
  });

  it('displays all preset color schemes', () => {
    render(
      <ColorSchemeSelector
        value={mockColorScheme}
        onChange={mockOnChange}
        presets={COLOR_SCHEME_PRESETS}
      />
    );

    COLOR_SCHEME_PRESETS.forEach(preset => {
      expect(screen.getByText(preset.name)).toBeInTheDocument();
    });
  });

  it('calls onChange when a preset is selected', () => {
    render(
      <ColorSchemeSelector
        value={mockColorScheme}
        onChange={mockOnChange}
        presets={COLOR_SCHEME_PRESETS}
      />
    );

    const firstPreset = screen.getByText(COLOR_SCHEME_PRESETS[0].name);
    fireEvent.click(firstPreset.closest('button')!);

    expect(mockOnChange).toHaveBeenCalledWith(COLOR_SCHEME_PRESETS[0].colors);
  });

  it('toggles custom color picker visibility', () => {
    render(
      <ColorSchemeSelector
        value={mockColorScheme}
        onChange={mockOnChange}
        presets={COLOR_SCHEME_PRESETS}
      />
    );

    const toggleButton = screen.getByText(/Show Custom Color Picker/i);
    fireEvent.click(toggleButton);

    expect(screen.getByText('Custom Colors')).toBeInTheDocument();
  });

  it('displays color preview', () => {
    render(
      <ColorSchemeSelector
        value={mockColorScheme}
        onChange={mockOnChange}
        presets={COLOR_SCHEME_PRESETS}
      />
    );

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Table Header')).toBeInTheDocument();
  });

  it('handles custom color changes', () => {
    render(
      <ColorSchemeSelector
        value={mockColorScheme}
        onChange={mockOnChange}
        presets={COLOR_SCHEME_PRESETS}
      />
    );

    // Show custom picker
    const toggleButton = screen.getByText(/Show Custom Color Picker/i);
    fireEvent.click(toggleButton);

    // Find hex input for primary color
    const hexInputs = screen.getAllByPlaceholderText('#000000');
    const primaryHexInput = hexInputs[0];

    fireEvent.change(primaryHexInput, { target: { value: '#FF0000' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockColorScheme,
      primary: '#FF0000',
    });
  });
});
