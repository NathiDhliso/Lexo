/**
 * Write-Off Service — Section 9.11
 * Formal write-off workflow for irrecoverable fees with VAT impact tracking.
 */
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export type WriteOffReasonCode = 'irrecoverable' | 'goodwill' | 'disputed_settled' | 'legal_aid' | 'other';
export type WriteOffStatus = 'pending' | 'approved' | 'rejected';

export interface WriteOff {
  id: string;
  invoice_id: string;
  advocate_id: string;
  amount: number;
  reason_code: WriteOffReasonCode;
  notes?: string;
  vat_impact: number;
  status: WriteOffStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

class WriteOffService {
  async getAll(): Promise<WriteOff[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('write_offs').select('*')
      .eq('advocate_id', user.id).order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data ?? [];
  }

  async create(invoiceId: string, amount: number, reasonCode: WriteOffReasonCode, notes?: string): Promise<WriteOff | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Calculate VAT impact (15% in SA)
    const vatImpact = amount * 0.15 / 1.15; // VAT component of inclusive amount

    const { data, error } = await supabase
      .from('write_offs')
      .insert({
        invoice_id: invoiceId,
        advocate_id: user.id,
        amount, reason_code: reasonCode,
        notes, vat_impact: Math.round(vatImpact * 100) / 100,
        status: 'pending',
      }).select().single();

    if (error) { toast.error('Failed to create write-off request'); return null; }
    toast.success('Write-off request submitted for approval');
    return data;
  }

  async approve(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('write_offs')
      .update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
      .eq('id', id);
    if (error) toast.error('Failed to approve write-off');
    else toast.success('Write-off approved — invoice balance adjusted');
  }

  async reject(id: string): Promise<void> {
    const { error } = await supabase.from('write_offs')
      .update({ status: 'rejected' }).eq('id', id);
    if (error) toast.error('Failed to reject write-off');
    else toast.success('Write-off rejected');
  }

  getReasonLabel(code: WriteOffReasonCode): string {
    const labels: Record<WriteOffReasonCode, string> = {
      irrecoverable: 'Irrecoverable Debt', goodwill: 'Goodwill Discount',
      disputed_settled: 'Dispute Settlement', legal_aid: 'Legal Aid Matter', other: 'Other',
    };
    return labels[code];
  }
}

export const writeOffService = new WriteOffService();
