/**
 * Fee Agreement Service — Section 9.3
 * Manage fee agreements / mandates per matter.
 */
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export type FeeRateStructure = 'hourly' | 'fixed' | 'success' | 'hybrid';
export type FeeAgreementStatus = 'draft' | 'sent' | 'acknowledged' | 'expired';

export interface FeeAgreement {
  id: string;
  matter_id: string;
  advocate_id: string;
  template_name?: string;
  scope_of_work: string;
  rate_structure: FeeRateStructure;
  hourly_rate?: number;
  fixed_fee?: number;
  success_percentage?: number;
  estimated_disbursements?: number;
  payment_terms?: string;
  trust_deposit_required?: number;
  status: FeeAgreementStatus;
  sent_at?: string;
  sent_via?: 'whatsapp' | 'email' | 'portal';
  acknowledged_at?: string;
  acknowledged_by?: string;
  document_url?: string;
  override_reason?: string;
  created_at: string;
  updated_at: string;
}

class FeeAgreementService {
  async getByMatter(matterId: string): Promise<FeeAgreement[]> {
    const { data, error } = await supabase
      .from('fee_agreements').select('*')
      .eq('matter_id', matterId).order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data ?? [];
  }

  async create(agreement: Omit<FeeAgreement, 'id' | 'created_at' | 'updated_at'>): Promise<FeeAgreement | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('fee_agreements')
      .insert({ ...agreement, advocate_id: user.id })
      .select().single();

    if (error) { toast.error('Failed to create fee agreement'); return null; }
    toast.success('Fee agreement created');
    return data;
  }

  async update(id: string, updates: Partial<FeeAgreement>): Promise<FeeAgreement | null> {
    const { data, error } = await supabase
      .from('fee_agreements')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();

    if (error) { toast.error('Failed to update fee agreement'); return null; }
    toast.success('Fee agreement updated');
    return data;
  }

  async markSent(id: string, via: 'whatsapp' | 'email' | 'portal'): Promise<void> {
    await this.update(id, { status: 'sent', sent_at: new Date().toISOString(), sent_via: via });
  }

  async markAcknowledged(id: string, acknowledgedBy: string): Promise<void> {
    await this.update(id, { status: 'acknowledged', acknowledged_at: new Date().toISOString(), acknowledged_by: acknowledgedBy });
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('fee_agreements').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else toast.success('Fee agreement deleted');
  }
}

export const feeAgreementService = new FeeAgreementService();
