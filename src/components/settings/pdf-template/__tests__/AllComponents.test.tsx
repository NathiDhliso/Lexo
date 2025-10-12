/**
 * Comprehensive Tests for All PDF Template Components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayoutPresetSelector } from '../LayoutPresetSelector';
import { LogoUploadSection } from '../LogoUploadSection';
import { TitleStyleSection } from '../TitleStyleSection';
import { TableStyleSection } from '../TableStyleSection';
import { FooterCustomization } from '../FooterCustomization';
import {
  LayoutConfig,
  LogoConfig,
  TitleConfig,
  TableConfig,
  FooterConfig,
  DEFAULT_MARGINS,
  DEFAULT_SPACING,
  DEFAULT_LOGO_CONFIG,
  DEFAULT_TITLE_CONFIG,
  DEFAULT_TABLE_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from '../types';
import { LAYOUT_PRESETS } from '../utils/layoutPresets';

describe('LayoutPresetSelector', () => {
  const mockLayout: LayoutConfig = {
    preset: 'modern',
    orientation: 'portrait',
    margins: DEFAULT_MARGINS,
    spacing: DEFAULT_SPACING,
    pageSize: 'A4',
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all layout presets', () => {
    render(
      <LayoutPresetSelector
        value={mockLayout}
        onChange={mockOnChange}
        presets={LAYOUT_PRESETS}
      />
    );

    LAYOUT_PRESETS.forEach(preset => {
      expect(screen.getByText(preset.name)).toBeInTheDocument();
    });
  });

  it('calls onChange when preset is selected', () => {
    render(
      <LayoutPresetSelector
        value={mockLayout}
        onChange={mockOnChange}
        presets={LAYOUT_PRESETS}
      />
    );

    const formalPreset = screen.getByText('Formal');
    fireEvent.click(formalPreset.closest('button')!);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('displays current settings', () => {
    render(
      <LayoutPresetSelector
        value={mockLayout}
        onChange={mockOnChange}
        presets={LAYOUT_PRESETS}
      />
    );

    expect(screen.getByText('Current Layout Settings')).toBeInTheDocument();
  });
});

describe('LogoUploadSection', () => {
  const mockLogo: LogoConfig = DEFAULT_LOGO_CONFIG;
  const mockOnChange = vi.fn();
  const mockOnUpload = vi.fn().mockResolvedValue('https://example.com/logo.png');

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnUpload.mockClear();
  });

  it('renders upload area when no logo', () => {
    render(
      <LogoUploadSection value={mockLogo} onChange={mockOnChange} onUpload={mockOnUpload} />
    );

    expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
  });

  it('displays logo preview when logo exists', () => {
    const logoWithUrl = { ...mockLogo, url: 'https://example.com/logo.png' };
    render(
      <LogoUploadSection value={logoWithUrl} onChange={mockOnChange} onUpload={mockOnUpload} />
    );

    expect(screen.getByText('Logo Uploaded')).toBeInTheDocument();
    expect(screen.getByAltText('Logo preview')).toBeInTheDocument();
  });

  it('shows position controls when logo exists', () => {
    const logoWithUrl = { ...mockLogo, url: 'https://example.com/logo.png' };
    render(
      <LogoUploadSection value={logoWithUrl} onChange={mockOnChange} onUpload={mockOnUpload} />
    );

    expect(screen.getByText('Logo Position')).toBeInTheDocument();
    expect(screen.getByText('Top Left')).toBeInTheDocument();
  });

  it('handles logo removal', () => {
    const logoWithUrl = { ...mockLogo, url: 'https://example.com/logo.png' };
    render(
      <LogoUploadSection value={logoWithUrl} onChange={mockOnChange} onUpload={mockOnUpload} />
    );

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...logoWithUrl,
      url: null,
    });
  });
});

describe('TitleStyleSection', () => {
  const mockTitle: TitleConfig = DEFAULT_TITLE_CONFIG;
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all alignment options', () => {
    render(<TitleStyleSection value={mockTitle} onChange={mockOnChange} />);

    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Center')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('renders orientation options', () => {
    render(<TitleStyleSection value={mockTitle} onChange={mockOnChange} />);

    expect(screen.getByText('Horizontal')).toBeInTheDocument();
    expect(screen.getByText('Vertical')).toBeInTheDocument();
  });

  it('displays font size slider', () => {
    render(<TitleStyleSection value={mockTitle} onChange={mockOnChange} />);

    expect(screen.getByText(/Font Size:/)).toBeInTheDocument();
  });

  it('shows border controls when border style is not none', () => {
    const titleWithBorder = { ...mockTitle, borderStyle: 'solid' as const };
    render(<TitleStyleSection value={titleWithBorder} onChange={mockOnChange} />);

    expect(screen.getByText(/Border Width:/)).toBeInTheDocument();
    expect(screen.getByText('Border Color')).toBeInTheDocument();
  });

  it('displays preview', () => {
    render(<TitleStyleSection value={mockTitle} onChange={mockOnChange} />);

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('INVOICE')).toBeInTheDocument();
  });
});

describe('TableStyleSection', () => {
  const mockTable: TableConfig = DEFAULT_TABLE_CONFIG;
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders borderless toggle', () => {
    render(<TableStyleSection value={mockTable} onChange={mockOnChange} />);

    expect(screen.getByText('Borderless Table')).toBeInTheDocument();
  });

  it('shows border controls when not borderless', () => {
    render(<TableStyleSection value={mockTable} onChange={mockOnChange} />);

    expect(screen.getByText('Border Style')).toBeInTheDocument();
    expect(screen.getByText(/Border Width:/)).toBeInTheDocument();
  });

  it('hides border controls when borderless', () => {
    const borderlessTable = { ...mockTable, borderless: true };
    render(<TableStyleSection value={borderlessTable} onChange={mockOnChange} />);

    expect(screen.queryByText('Border Style')).not.toBeInTheDocument();
  });

  it('displays color controls', () => {
    render(<TableStyleSection value={mockTable} onChange={mockOnChange} />);

    expect(screen.getByText('Header Background Color')).toBeInTheDocument();
    expect(screen.getByText('Header Text Color')).toBeInTheDocument();
    expect(screen.getByText('Alternate Row Background')).toBeInTheDocument();
  });

  it('displays table preview', () => {
    render(<TableStyleSection value={mockTable} onChange={mockOnChange} />);

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Legal Services')).toBeInTheDocument();
  });
});

describe('FooterCustomization', () => {
  const mockFooter: FooterConfig = DEFAULT_FOOTER_CONFIG;
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all toggle options', () => {
    render(<FooterCustomization value={mockFooter} onChange={mockOnChange} />);

    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
    expect(screen.getByText('Thank You Message')).toBeInTheDocument();
    expect(screen.getByText('Bank Details')).toBeInTheDocument();
    expect(screen.getByText('Show Page Numbers')).toBeInTheDocument();
    expect(screen.getByText('Show Timestamp')).toBeInTheDocument();
  });

  it('shows terms textarea when enabled', () => {
    render(<FooterCustomization value={mockFooter} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText('Enter terms and conditions...')).toBeInTheDocument();
  });

  it('shows bank details form when enabled', () => {
    render(<FooterCustomization value={mockFooter} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText('e.g., Standard Bank')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., John Doe Attorneys')).toBeInTheDocument();
  });

  it('displays footer preview', () => {
    render(<FooterCustomization value={mockFooter} onChange={mockOnChange} />);

    expect(screen.getByText('Footer Preview')).toBeInTheDocument();
  });

  it('handles toggle changes', () => {
    render(<FooterCustomization value={mockFooter} onChange={mockOnChange} />);

    // Find the toggle button for terms (first toggle)
    const toggleButtons = screen.getAllByRole('button');
    const termsToggle = toggleButtons.find(btn => 
      btn.closest('div')?.textContent?.includes('Terms & Conditions')
    );

    if (termsToggle) {
      fireEvent.click(termsToggle);
      expect(mockOnChange).toHaveBeenCalled();
    }
  });
});
