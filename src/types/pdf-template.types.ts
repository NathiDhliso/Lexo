export interface PDFColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  success: string;
  warning: string;
  error: string;
}

export interface PDFTextStyle {
  fontFamily: 'helvetica' | 'times' | 'courier';
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  alignment?: 'left' | 'center' | 'right';
}

export type LogoPlacement = 'left' | 'center' | 'right' | 'watermark';

export interface PDFHeaderConfig {
  showLogo: boolean;
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoPlacement: LogoPlacement;
  logoOpacity: number;
  logoRotation: number;
  secondaryBrandingUrl?: string;
  showQRCode: boolean;
  qrCodeContent?: string;
  title: string;
  titleStyle: PDFTextStyle;
  subtitle?: string;
  subtitleStyle?: PDFTextStyle;
  showBorder: boolean;
  borderColor?: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
}

export interface PDFFooterConfig {
  showFooter: boolean;
  text?: string;
  textStyle?: PDFTextStyle;
  showPageNumbers: boolean;
  showTimestamp: boolean;
  showBankDetails: boolean;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchCode: string;
    swiftCode?: string;
  };
  showDigitalSignature: boolean;
  signatureImageUrl?: string;
  showThankYouNote: boolean;
  thankYouText?: string;
  showLegalDisclaimer: boolean;
  disclaimerText?: string;
}

export interface PDFSectionConfig {
  id: string;
  title: string;
  titleStyle: PDFTextStyle;
  contentStyle: PDFTextStyle;
  backgroundColor?: string;
  showBorder: boolean;
  borderColor?: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  padding: number;
  order: number;
  isCollapsible: boolean;
  isVisible: boolean;
  customContent?: string;
}

export interface PDFTableConfig {
  headerBackgroundColor: string;
  headerTextColor: string;
  rowBackgroundColor: string;
  alternateRowColor?: string;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  showBorders: boolean;
  headerStyle: PDFTextStyle;
  cellStyle: PDFTextStyle;
  columnWidths?: number[];
  columnAlignments?: ('left' | 'center' | 'right')[];
  highlightOverdue: boolean;
  overdueColor: string;
}

export interface PDFTemplate {
  id: string;
  name: string;
  description?: string;
  colorScheme: PDFColorScheme;
  header: PDFHeaderConfig;
  footer: PDFFooterConfig;
  sections: {
    fromSection: PDFSectionConfig;
    toSection: PDFSectionConfig;
    detailsSection: PDFSectionConfig;
    itemsSection: PDFSectionConfig;
    summarySection: PDFSectionConfig;
    notesSection: PDFSectionConfig;
  };
  table: PDFTableConfig;
  pageMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  created_at?: string;
  updated_at?: string;
  is_default?: boolean;
}

export const DEFAULT_COLOR_SCHEMES: PDFColorScheme[] = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    primary: '#2962FF',
    secondary: '#1E88E5',
    accent: '#FFC107',
    text: '#212121',
    background: '#FFFFFF',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    primary: '#7C4DFF',
    secondary: '#651FFF',
    accent: '#FFD740',
    text: '#1A1A1A',
    background: '#FAFAFA',
    success: '#00C853',
    warning: '#FF6D00',
    error: '#D50000',
  },
  {
    id: 'modern-green',
    name: 'Modern Green',
    primary: '#00C853',
    secondary: '#00E676',
    accent: '#FFD600',
    text: '#263238',
    background: '#FFFFFF',
    success: '#4CAF50',
    warning: '#FFA726',
    error: '#EF5350',
  },
  {
    id: 'classic-black',
    name: 'Classic Black',
    primary: '#212121',
    secondary: '#424242',
    accent: '#FFC107',
    text: '#000000',
    background: '#FFFFFF',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
  },
  {
    id: 'gold-luxury',
    name: 'Gold Luxury',
    primary: '#C9A227',
    secondary: '#B8860B',
    accent: '#DAA520',
    text: '#1A1A1A',
    background: '#FFFEF7',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
];

export const createDefaultTemplate = (): PDFTemplate => ({
  id: 'default',
  name: 'Default Template',
  description: 'Professional default template',
  colorScheme: DEFAULT_COLOR_SCHEMES[0],
  header: {
    showLogo: true,
    logoWidth: 50,
    logoHeight: 50,
    logoPlacement: 'center',
    logoOpacity: 1,
    logoRotation: 0,
    secondaryBrandingUrl: undefined,
    showQRCode: false,
    qrCodeContent: undefined,
    title: 'INVOICE',
    titleStyle: {
      fontFamily: 'helvetica',
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2962FF',
      alignment: 'center',
    },
    subtitle: 'Professional Legal Services',
    subtitleStyle: {
      fontFamily: 'helvetica',
      fontSize: 10,
      fontWeight: 'normal',
      color: '#666666',
      alignment: 'center',
    },
    showBorder: true,
    borderColor: '#2962FF',
    borderStyle: 'solid',
    borderWidth: 2,
  },
  footer: {
    showFooter: true,
    text: 'Thank you for your business',
    textStyle: {
      fontFamily: 'helvetica',
      fontSize: 8,
      fontWeight: 'normal',
      color: '#999999',
      alignment: 'center',
    },
    showPageNumbers: true,
    showTimestamp: true,
  },
  sections: {
    fromSection: {
      title: 'FROM:',
      titleStyle: {
        fontFamily: 'helvetica',
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000000',
      },
      contentStyle: {
        fontFamily: 'helvetica',
        fontSize: 10,
        fontWeight: 'normal',
        color: '#333333',
      },
      showBorder: false,
      padding: 5,
    },
    toSection: {
      title: 'BILL TO:',
      titleStyle: {
        fontFamily: 'helvetica',
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000000',
      },
      contentStyle: {
        fontFamily: 'helvetica',
        fontSize: 10,
        fontWeight: 'normal',
        color: '#333333',
      },
      showBorder: false,
      padding: 5,
    },
    detailsSection: {
      title: 'Invoice Details',
      titleStyle: {
        fontFamily: 'helvetica',
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000000',
      },
      contentStyle: {
        fontFamily: 'helvetica',
        fontSize: 10,
        fontWeight: 'normal',
        color: '#333333',
      },
      backgroundColor: '#F5F5F5',
      showBorder: true,
      borderColor: '#E0E0E0',
      padding: 10,
    },
    itemsSection: {
      title: 'Items & Services',
      titleStyle: {
        fontFamily: 'helvetica',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2962FF',
      },
      contentStyle: {
        fontFamily: 'helvetica',
        fontSize: 10,
        fontWeight: 'normal',
        color: '#333333',
      },
      showBorder: false,
      padding: 5,
    },
    summarySection: {
      title: 'Summary',
      titleStyle: {
        fontFamily: 'helvetica',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
      },
      contentStyle: {
        fontFamily: 'helvetica',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333333',
      },
      showBorder: true,
      borderColor: '#E0E0E0',
      padding: 10,
    },
    notesSection: {
      title: 'Important Notes',
      titleStyle: {
        fontFamily: 'helvetica',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000000',
      },
      contentStyle: {
        fontFamily: 'helvetica',
        fontSize: 9,
        fontWeight: 'normal',
        color: '#666666',
      },
      backgroundColor: '#F5F7FA',
      showBorder: true,
      borderColor: '#E0E0E0',
      padding: 10,
    },
  },
  table: {
    headerBackgroundColor: '#2962FF',
    headerTextColor: '#FFFFFF',
    rowBackgroundColor: '#FFFFFF',
    alternateRowColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    showBorders: true,
    headerStyle: {
      fontFamily: 'helvetica',
      fontSize: 10,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    cellStyle: {
      fontFamily: 'helvetica',
      fontSize: 9,
      fontWeight: 'normal',
      color: '#333333',
    },
  },
  pageMargins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  is_default: true,
});
