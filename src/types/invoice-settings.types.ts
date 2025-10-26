/**
 * Invoice Settings Types
 * Types for invoice numbering and VAT compliance system
 */

export interface InvoiceSettings {
  id: string;
  advocate_id: string;
  invoice_number_format: string;
  invoice_sequence_current: number;
  invoice_sequence_year: number;
  credit_note_format: string;
  credit_note_sequence_current: number;
  credit_note_sequence_year: number;
  vat_registered: boolean;
  vat_number?: string;
  vat_rate: number;
  vat_rate_history: VATRateHistoryEntry[];
  advocate_full_name?: string;
  advocate_address?: string;
  advocate_phone?: string;
  advocate_email?: string;
  created_at: string;
  updated_at: string;
}

export interface VATRateHistoryEntry {
  rate: number;
  effective_date: string;
  notes?: string;
}

export interface InvoiceSettingsCreate {
  advocate_id: string;
  invoice_number_format?: string;
  credit_note_format?: string;
  vat_registered?: boolean;
  vat_number?: string;
  vat_rate?: number;
  advocate_full_name?: string;
  advocate_address?: string;
  advocate_phone?: string;
  advocate_email?: string;
}

export interface InvoiceSettingsUpdate {
  invoice_number_format?: string;
  credit_note_format?: string;
  vat_registered?: boolean;
  vat_number?: string;
  vat_rate?: number;
  vat_rate_history?: VATRateHistoryEntry[];
  advocate_full_name?: string;
  advocate_address?: string;
  advocate_phone?: string;
  advocate_email?: string;
}

export interface InvoiceNumberingAudit {
  id: string;
  advocate_id: string;
  invoice_number: string;
  number_type: 'invoice' | 'credit_note';
  status: 'used' | 'voided';
  invoice_id?: string;
  void_reason?: string;
  created_at: string;
}

export interface VATInvoiceData {
  invoice_number: string;
  invoice_date: string;
  supplier_name: string;
  supplier_vat_number: string;
  supplier_address: string;
  supplier_contact: string;
  customer_name: string;
  customer_address?: string;
  customer_vat_number?: string;
  line_items: Array<{
    description: string;
    amount: number;
  }>;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
}

export interface InvoiceNumberFormatPreset {
  label: string;
  format: string;
  example: string;
  description: string;
}

export const INVOICE_NUMBER_FORMAT_PRESETS: InvoiceNumberFormatPreset[] = [
  {
    label: 'INV-YYYY-NNN',
    format: 'INV-YYYY-NNN',
    example: 'INV-2025-001',
    description: 'Invoice with year and 3-digit sequence'
  },
  {
    label: 'INV-YYYY-NNNN',
    format: 'INV-YYYY-NNNN',
    example: 'INV-2025-0001',
    description: 'Invoice with year and 4-digit sequence'
  },
  {
    label: 'INV-YY-NNN',
    format: 'INV-YY-NNN',
    example: 'INV-25-001',
    description: 'Invoice with 2-digit year and 3-digit sequence'
  },
  {
    label: 'YYYY-NNN',
    format: 'YYYY-NNN',
    example: '2025-001',
    description: 'Year and 3-digit sequence only'
  },
  {
    label: 'INV-NNN',
    format: 'INV-NNN',
    example: 'INV-001',
    description: 'Simple invoice with 3-digit sequence (no year reset)'
  }
];

export const CREDIT_NOTE_FORMAT_PRESETS: InvoiceNumberFormatPreset[] = [
  {
    label: 'CN-YYYY-NNN',
    format: 'CN-YYYY-NNN',
    example: 'CN-2025-001',
    description: 'Credit note with year and 3-digit sequence'
  },
  {
    label: 'CN-YYYY-NNNN',
    format: 'CN-YYYY-NNNN',
    example: 'CN-2025-0001',
    description: 'Credit note with year and 4-digit sequence'
  },
  {
    label: 'CN-YY-NNN',
    format: 'CN-YY-NNN',
    example: 'CN-25-001',
    description: 'Credit note with 2-digit year and 3-digit sequence'
  },
  {
    label: 'CR-YYYY-NNN',
    format: 'CR-YYYY-NNN',
    example: 'CR-2025-001',
    description: 'Credit with year and 3-digit sequence'
  }
];
