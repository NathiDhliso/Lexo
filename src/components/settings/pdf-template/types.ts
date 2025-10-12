/**
 * PDF Template Type Definitions
 * 
 * This file contains all TypeScript type definitions for the PDF template system.
 * Extracted from PDFTemplateEditor.tsx for better maintainability.
 */

export interface PDFTemplate {
  id: string;
  advocate_id: string;
  name: string;
  is_default: boolean;
  colors: ColorScheme;
  layout: LayoutConfig;
  logo: LogoConfig;
  title: TitleConfig;
  table: TableConfig;
  footer: FooterConfig;
  created_at?: string;
  updated_at?: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  border: string;
  headerBg: string;
  headerText: string;
  rowAlt: string;
}

export interface LayoutConfig {
  preset: LayoutPreset;
  orientation: 'portrait' | 'landscape';
  margins: Margins;
  spacing: Spacing;
  pageSize: PageSize;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Spacing {
  sectionGap: number;
  lineHeight: number;
  paragraphSpacing: number;
}

export interface LogoConfig {
  url: string | null;
  position: LogoPosition;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
}

export interface TitleConfig {
  alignment: 'left' | 'center' | 'right';
  orientation: 'horizontal' | 'vertical';
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  borderStyle: BorderStyle;
  borderWidth: number;
  borderColor: string;
}

export interface TableConfig {
  borderless: boolean;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  borderColor: string;
  headerBg: string;
  headerText: string;
  rowAltBg: string;
  cellPadding: number;
}

export interface FooterConfig {
  showTerms: boolean;
  termsText: string;
  showThankYou: boolean;
  thankYouText: string;
  showBankDetails: boolean;
  bankDetails: BankDetails;
  showPageNumbers: boolean;
  showTimestamp: boolean;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
}

export type LayoutPreset = 
  | 'formal'
  | 'modern'
  | 'minimalist'
  | 'classic'
  | 'executive'
  | 'elegant'
  | 'compact'
  | 'spacious';

export type LogoPosition = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'watermark';

export type PageSize = 'A4' | 'Letter' | 'Legal';

export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double';

/**
 * Color Scheme Presets
 */
export interface ColorSchemePreset {
  id: string;
  name: string;
  description: string;
  colors: ColorScheme;
}

/**
 * Layout Preset Definition
 */
export interface LayoutPresetDefinition {
  id: LayoutPreset;
  name: string;
  description: string;
  thumbnail?: string;
  config: Partial<LayoutConfig>;
}

/**
 * PDF Template Editor State
 */
export interface PDFTemplateEditorState {
  template: PDFTemplate;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  previewData: any;
}

/**
 * PDF Template Editor Actions
 */
export interface PDFTemplateEditorActions {
  updateColors: (colors: Partial<ColorScheme>) => void;
  updateLayout: (layout: Partial<LayoutConfig>) => void;
  updateLogo: (logo: Partial<LogoConfig>) => void;
  updateTitle: (title: Partial<TitleConfig>) => void;
  updateTable: (table: Partial<TableConfig>) => void;
  updateFooter: (footer: Partial<FooterConfig>) => void;
  saveTemplate: () => Promise<void>;
  resetTemplate: () => void;
  applyPreset: (preset: LayoutPreset) => void;
  applyColorScheme: (scheme: ColorScheme) => void;
}

/**
 * Component Props Types
 */
export interface ColorSchemeSelectorProps {
  value: ColorScheme;
  onChange: (scheme: ColorScheme) => void;
  presets: ColorSchemePreset[];
}

export interface LayoutPresetSelectorProps {
  value: LayoutConfig;
  onChange: (layout: LayoutConfig) => void;
  presets: LayoutPresetDefinition[];
}

export interface LogoUploadSectionProps {
  value: LogoConfig;
  onChange: (logo: LogoConfig) => void;
  onUpload: (file: File) => Promise<string>;
}

export interface TitleStyleSectionProps {
  value: TitleConfig;
  onChange: (title: TitleConfig) => void;
}

export interface TableStyleSectionProps {
  value: TableConfig;
  onChange: (table: TableConfig) => void;
}

export interface FooterCustomizationProps {
  value: FooterConfig;
  onChange: (footer: FooterConfig) => void;
}

export interface AdvancedLayoutControlsProps {
  value: LayoutConfig;
  onChange: (layout: LayoutConfig) => void;
}

export interface LivePreviewPanelProps {
  template: PDFTemplate;
  sampleData: any;
  onDownload?: () => void;
}

/**
 * Utility Types
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PDFTemplateUpdate = DeepPartial<PDFTemplate>;

/**
 * Default Values
 */
export const DEFAULT_COLOR_SCHEME: ColorScheme = {
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

export const DEFAULT_MARGINS: Margins = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

export const DEFAULT_SPACING: Spacing = {
  sectionGap: 10,
  lineHeight: 1.5,
  paragraphSpacing: 8,
};

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  url: null,
  position: 'top-left',
  width: 100,
  height: 50,
  opacity: 1,
  rotation: 0,
};

export const DEFAULT_TITLE_CONFIG: TitleConfig = {
  alignment: 'center',
  orientation: 'horizontal',
  fontSize: 24,
  fontWeight: 'bold',
  borderStyle: 'none',
  borderWidth: 1,
  borderColor: '#E5E7EB',
};

export const DEFAULT_TABLE_CONFIG: TableConfig = {
  borderless: false,
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  headerBg: '#F3F4F6',
  headerText: '#111827',
  rowAltBg: '#F9FAFB',
  cellPadding: 8,
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  showTerms: true,
  termsText: 'Payment is due within 30 days of invoice date.',
  showThankYou: true,
  thankYouText: 'Thank you for your business.',
  showBankDetails: true,
  bankDetails: {
    bankName: '',
    accountName: '',
    accountNumber: '',
    branchCode: '',
    accountType: 'Current',
  },
  showPageNumbers: true,
  showTimestamp: true,
};
