/**
 * Bulk Import Service — Section 9.15
 * CSV/Excel import for matters, clients, time entries.
 */
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export type ImportType = 'matters' | 'clients' | 'attorneys' | 'time_entries' | 'invoices';
export type ImportStatus = 'pending' | 'validating' | 'validated' | 'importing' | 'completed' | 'failed';

export interface BulkImport {
  id: string;
  advocate_id: string;
  import_type: ImportType;
  filename: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  imported_rows: number;
  status: ImportStatus;
  errors: { row: number; field: string; message: string }[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ImportFieldMapping {
  source_column: string;
  target_field: string;
  transform?: (value: string) => any;
}

const IMPORT_SCHEMAS: Record<ImportType, { required: string[]; optional: string[] }> = {
  matters: {
    required: ['title', 'client_name', 'matter_type'],
    optional: ['description', 'instructing_attorney', 'court', 'case_number', 'referral_source'],
  },
  clients: {
    required: ['name', 'email'],
    optional: ['phone', 'company', 'address'],
  },
  attorneys: {
    required: ['firm_name', 'contact_person', 'email'],
    optional: ['phone', 'address', 'registration_number'],
  },
  time_entries: {
    required: ['date', 'matter_reference', 'description', 'hours', 'rate'],
    optional: ['activity_type', 'billable'],
  },
  invoices: {
    required: ['invoice_number', 'matter_reference', 'amount', 'date'],
    optional: ['status', 'due_date', 'vat_amount'],
  },
};

class BulkImportService {
  getSchema(type: ImportType) {
    return IMPORT_SCHEMAS[type];
  }

  async validateCSV(file: File, type: ImportType): Promise<{
    valid: boolean; totalRows: number; validRows: number;
    errors: { row: number; field: string; message: string }[];
    preview: Record<string, string>[];
  }> {
    const text = await file.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) return { valid: false, totalRows: 0, validRows: 0, errors: [{ row: 0, field: '', message: 'File is empty or has no data rows' }], preview: [] };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, '_'));
    const schema = IMPORT_SCHEMAS[type];
    const errors: { row: number; field: string; message: string }[] = [];

    // Check required columns
    for (const req of schema.required) {
      if (!headers.includes(req)) {
        errors.push({ row: 0, field: req, message: `Required column "${req}" is missing` });
      }
    }

    const dataRows = lines.slice(1).filter(l => l.trim().length > 0);
    let validRows = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const values = dataRows[i].split(',').map(v => v.trim());
      let rowValid = true;

      for (const req of schema.required) {
        const idx = headers.indexOf(req);
        if (idx === -1 || !values[idx] || values[idx].length === 0) {
          errors.push({ row: i + 2, field: req, message: `Required field "${req}" is empty` });
          rowValid = false;
        }
      }

      if (rowValid) validRows++;
    }

    // Preview first 5 rows
    const preview = dataRows.slice(0, 5).map(row => {
      const values = row.split(',').map(v => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
      return obj;
    });

    return {
      valid: errors.filter(e => e.row === 0).length === 0,
      totalRows: dataRows.length,
      validRows, errors, preview,
    };
  }

  async startImport(file: File, type: ImportType): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const validation = await this.validateCSV(file, type);
    if (!validation.valid) {
      toast.error('File has validation errors — fix them before importing');
      return null;
    }

    const { data, error } = await supabase
      .from('bulk_imports')
      .insert({
        advocate_id: user.id,
        import_type: type,
        filename: file.name,
        total_rows: validation.totalRows,
        valid_rows: validation.validRows,
        error_rows: validation.errors.length,
        status: 'validated',
        errors: validation.errors,
      }).select().single();

    if (error) { toast.error('Failed to create import'); return null; }
    toast.success(`Import validated: ${validation.validRows}/${validation.totalRows} rows ready`);
    return data?.id ?? null;
  }

  async getImports(): Promise<BulkImport[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from('bulk_imports').select('*')
      .eq('advocate_id', user.id).order('created_at', { ascending: false });
    return data ?? [];
  }

  generateTemplate(type: ImportType): string {
    const schema = IMPORT_SCHEMAS[type];
    const headers = [...schema.required, ...schema.optional];
    return headers.join(',') + '\n';
  }

  downloadTemplate(type: ImportType): void {
    const csv = this.generateTemplate(type);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lexohub_${type}_import_template.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  }
}

export const bulkImportService = new BulkImportService();
