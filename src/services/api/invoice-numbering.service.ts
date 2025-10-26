/**
 * Invoice Numbering Service
 * Handles invoice settings, sequential numbering, and VAT compliance
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.9
 */

import { supabase } from '../../lib/supabase';
import {
  InvoiceSettings,
  InvoiceSettingsCreate,
  InvoiceSettingsUpdate,
  InvoiceNumberingAudit,
  VATRateHistoryEntry
} from '../../types/invoice-settings.types';

export class InvoiceNumberingService {
  /**
   * Get invoice settings for the current user
   * Returns default settings if none exist
   * Requirement: 3.1
   */
  async getSettings(): Promise<InvoiceSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('invoice_settings')
      .select('*')
      .eq('advocate_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch invoice settings: ${error.message}`);
    }

    // Return defaults if no settings exist
    if (!data) {
      return this.getDefaultSettings(user.id);
    }

    return data as InvoiceSettings;
  }

  /**
   * Get default settings for a new user
   */
  private getDefaultSettings(userId: string): InvoiceSettings {
    const currentYear = new Date().getFullYear();
    return {
      id: '',
      advocate_id: userId,
      invoice_number_format: 'INV-YYYY-NNN',
      invoice_sequence_current: 0,
      invoice_sequence_year: currentYear,
      credit_note_format: 'CN-YYYY-NNN',
      credit_note_sequence_current: 0,
      credit_note_sequence_year: currentYear,
      vat_registered: false,
      vat_rate: 0.15,
      vat_rate_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Update invoice settings with validation
   * Requirement: 3.1, 3.8
   */
  async updateSettings(updates: InvoiceSettingsUpdate): Promise<InvoiceSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate settings
    this.validateSettings(updates);

    // Check if settings exist
    const { data: existing } = await supabase
      .from('invoice_settings')
      .select('id')
      .eq('advocate_id', user.id)
      .single();

    let result;

    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from('invoice_settings')
        .update(updates)
        .eq('advocate_id', user.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update invoice settings: ${error.message}`);
      result = data;
    } else {
      // Create new settings
      const createData: InvoiceSettingsCreate = {
        advocate_id: user.id,
        ...updates
      };

      const { data, error } = await supabase
        .from('invoice_settings')
        .insert(createData)
        .select()
        .single();

      if (error) throw new Error(`Failed to create invoice settings: ${error.message}`);
      result = data;
    }

    return result as InvoiceSettings;
  }

  /**
   * Validate invoice settings
   */
  private validateSettings(settings: InvoiceSettingsUpdate): void {
    // Validate VAT number if VAT registered
    if (settings.vat_registered && !settings.vat_number) {
      throw new Error('VAT number is required when VAT registered');
    }

    // Validate VAT rate
    if (settings.vat_rate !== undefined) {
      if (settings.vat_rate < 0 || settings.vat_rate > 1) {
        throw new Error('VAT rate must be between 0 and 1');
      }
    }

    // Validate invoice number format
    if (settings.invoice_number_format) {
      this.validateNumberFormat(settings.invoice_number_format);
    }

    // Validate credit note format
    if (settings.credit_note_format) {
      this.validateNumberFormat(settings.credit_note_format);
    }
  }

  /**
   * Validate number format contains required placeholders
   */
  private validateNumberFormat(format: string): void {
    if (!format || format.trim().length === 0) {
      throw new Error('Number format cannot be empty');
    }

    // Must contain at least one sequence placeholder
    const hasSequence = /N{2,4}/.test(format);
    if (!hasSequence) {
      throw new Error('Number format must contain sequence placeholder (NN, NNN, or NNNN)');
    }
  }

  /**
   * Generate next invoice number using database function
   * Requirement: 3.2, 3.3
   */
  async generateNextInvoiceNumber(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('generate_next_invoice_number', {
      advocate_id_param: user.id
    });

    if (error) {
      throw new Error(`Failed to generate invoice number: ${error.message}`);
    }

    return data as string;
  }

  /**
   * Generate next credit note number using database function
   * Requirement: 3.2
   */
  async generateNextCreditNoteNumber(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('generate_next_credit_note_number', {
      advocate_id_param: user.id
    });

    if (error) {
      throw new Error(`Failed to generate credit note number: ${error.message}`);
    }

    return data as string;
  }

  /**
   * Void an invoice number with reason
   * Requirement: 3.3, 3.4
   */
  async voidInvoiceNumber(invoiceNumber: string, reason: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (!reason || reason.trim().length === 0) {
      throw new Error('Void reason is required');
    }

    const { error } = await supabase.rpc('void_invoice_number', {
      invoice_number_param: invoiceNumber,
      advocate_id_param: user.id,
      void_reason_param: reason
    });

    if (error) {
      throw new Error(`Failed to void invoice number: ${error.message}`);
    }
  }

  /**
   * Get numbering audit log with optional filters
   * Requirement: 3.4, 3.9
   */
  async getNumberingAudit(
    startDate?: string,
    endDate?: string,
    numberType?: 'invoice' | 'credit_note',
    status?: 'used' | 'voided'
  ): Promise<InvoiceNumberingAudit[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('invoice_numbering_audit')
      .select('*')
      .eq('advocate_id', user.id)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (numberType) {
      query = query.eq('number_type', numberType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch numbering audit: ${error.message}`);
    }

    return data as InvoiceNumberingAudit[];
  }

  /**
   * Get VAT rate for a specific date
   * Requirement: 3.8, 3.9
   */
  async getVATRateForDate(invoiceDate: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('get_vat_rate_for_date', {
      advocate_id_param: user.id,
      invoice_date_param: invoiceDate
    });

    if (error) {
      throw new Error(`Failed to get VAT rate: ${error.message}`);
    }

    return data as number;
  }

  /**
   * Add a future VAT rate change
   * Requirement: 3.8, 3.9
   */
  async addVATRateChange(rate: number, effectiveDate: string, notes?: string): Promise<void> {
    const settings = await this.getSettings();
    
    const newEntry: VATRateHistoryEntry = {
      rate,
      effective_date: effectiveDate,
      notes
    };

    const updatedHistory = [...settings.vat_rate_history, newEntry]
      .sort((a, b) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime());

    await this.updateSettings({
      vat_rate_history: updatedHistory
    });
  }

  /**
   * Preview next invoice number without generating it
   * Requirement: 3.1
   */
  async previewNextInvoiceNumber(): Promise<string> {
    const settings = await this.getSettings();
    const currentYear = new Date().getFullYear();
    
    let nextSequence = settings.invoice_sequence_current + 1;
    
    // Reset if year changed
    if (settings.invoice_sequence_year !== currentYear) {
      nextSequence = 1;
    }

    return this.formatNumber(settings.invoice_number_format, currentYear, nextSequence);
  }

  /**
   * Preview next credit note number without generating it
   */
  async previewNextCreditNoteNumber(): Promise<string> {
    const settings = await this.getSettings();
    const currentYear = new Date().getFullYear();
    
    let nextSequence = settings.credit_note_sequence_current + 1;
    
    // Reset if year changed
    if (settings.credit_note_sequence_year !== currentYear) {
      nextSequence = 1;
    }

    return this.formatNumber(settings.credit_note_format, currentYear, nextSequence);
  }

  /**
   * Format a number based on format string
   */
  private formatNumber(format: string, year: number, sequence: number): string {
    let result = format;
    result = result.replace('YYYY', year.toString());
    result = result.replace('YY', year.toString().slice(-2));
    result = result.replace('NNNN', sequence.toString().padStart(4, '0'));
    result = result.replace('NNN', sequence.toString().padStart(3, '0'));
    result = result.replace('NN', sequence.toString().padStart(2, '0'));
    return result;
  }

  /**
   * Update audit record with invoice ID after successful creation
   * Requirement: 3.3
   */
  async updateAuditRecordWithInvoiceId(invoiceNumber: string, invoiceId: string): Promise<void> {
    const { error } = await supabase.rpc('update_invoice_audit_record', {
      invoice_number_param: invoiceNumber,
      invoice_id_param: invoiceId
    });

    if (error) {
      console.error('Failed to update audit record:', error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Export audit log to CSV for SARS compliance
   * Requirement: 3.9
   */
  async exportAuditToCSV(startDate?: string, endDate?: string): Promise<string> {
    const auditRecords = await this.getNumberingAudit(startDate, endDate);

    const headers = [
      'Invoice Number',
      'Type',
      'Status',
      'Date Created',
      'Invoice ID',
      'Void Reason'
    ];

    const rows = auditRecords.map(record => [
      record.invoice_number,
      record.number_type,
      record.status,
      new Date(record.created_at).toLocaleString(),
      record.invoice_id || '',
      record.void_reason || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

export const invoiceNumberingService = new InvoiceNumberingService();
