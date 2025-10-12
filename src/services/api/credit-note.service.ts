/**
 * Credit Note Service
 * Handles credit note operations
 */

import { supabase } from '../../lib/supabase';
import { BaseApiService } from './base-api.service';
import type { CreditNote, CreditNoteCreate } from '../../types/financial.types';
import { toast } from 'react-hot-toast';

export class CreditNoteService extends BaseApiService<CreditNote> {
  constructor() {
    super('credit_notes');
  }

  /**
   * Create a new credit note
   */
  async createCreditNote(data: CreditNoteCreate): Promise<CreditNote | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const creditNoteNumber = await this.generateCreditNoteNumber();

      const { data: creditNote, error } = await supabase
        .from('credit_notes')
        .insert({
          ...data,
          credit_note_number: creditNoteNumber,
          advocate_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Credit note created successfully');
      return creditNote;
    } catch (error) {
      console.error('Error creating credit note:', error);
      toast.error('Failed to create credit note');
      return null;
    }
  }

  /**
   * Issue a credit note (change status to issued)
   */
  async issueCreditNote(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('credit_notes')
        .update({
          status: 'issued',
          issued_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Credit note issued successfully');
      return true;
    } catch (error) {
      console.error('Error issuing credit note:', error);
      toast.error('Failed to issue credit note');
      return false;
    }
  }

  /**
   * Apply credit note to invoice
   */
  async applyCreditNote(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('credit_notes')
        .update({
          status: 'applied',
          applied_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Credit note applied successfully');
      return true;
    } catch (error) {
      console.error('Error applying credit note:', error);
      toast.error('Failed to apply credit note');
      return false;
    }
  }

  private async generateCreditNoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('credit_notes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01`);

    const sequence = (count || 0) + 1;
    return `CN-${year}-${sequence.toString().padStart(4, '0')}`;
  }
}

export const creditNoteService = new CreditNoteService();
