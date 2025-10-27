import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { DisbursementVATService } from './disbursement-vat.service';

/**
 * Disbursement Service
 * Handles logging and managing disbursements (expenses) for matters
 * Requirements: 2.1, 2.2, 2.9, 2.10
 */

export interface Disbursement {
  id: string;
  matter_id: string;
  advocate_id: string;
  description: string;
  amount: number;
  date_incurred: string;
  vat_applicable: boolean;
  vat_amount: number;
  total_amount: number;
  receipt_link?: string;
  invoice_id?: string;
  is_billed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DisbursementCreate {
  matter_id: string;
  description: string;
  amount: number;
  date_incurred: string;
  vat_applicable?: boolean;
  receipt_link?: string;
  disbursement_type_id?: string; // For VAT integration
}

export interface DisbursementSummary {
  matter_id: string;
  matter_title: string;
  client_name: string;
  disbursement_count: number;
  total_amount_excl_vat: number;
  total_vat_amount: number;
  total_amount_incl_vat: number;
  billed_amount: number;
  unbilled_amount: number;
  earliest_disbursement: string;
  latest_disbursement: string;
}

export class DisbursementService {
  /**
   * Create a new disbursement
   * Requirements: 2.1, 2.2
   */
  static async createDisbursement(data: DisbursementCreate): Promise<Disbursement> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Validate data
      if (!data.description.trim()) {
        throw new Error('Description is required');
      }

      if (data.amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }

      // Verify user owns the matter
      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select('id, advocate_id')
        .eq('id', data.matter_id)
        .single();

      if (matterError || !matter) {
        throw new Error('Matter not found');
      }

      if (matter.advocate_id !== user.id) {
        throw new Error('Unauthorized: You can only add disbursements to your own matters');
      }

      // Calculate VAT if disbursement type is provided
      let vatSuggestion: any = null;
      if (data.disbursement_type_id) {
        try {
          vatSuggestion = await DisbursementVATService.suggestVAT(data.disbursement_type_id, data.amount);
        } catch (error) {
          console.warn('VAT suggestion failed:', error);
        }
      }

      // Create disbursement record
      const { data: disbursement, error: disbursementError } = await supabase
        .from('disbursements')
        .insert({
          matter_id: data.matter_id,
          advocate_id: user.id,
          description: data.description.trim(),
          amount: data.amount,
          date_incurred: data.date_incurred,
          vat_applicable: vatSuggestion ? vatSuggestion.suggested_treatment === 'vat_inclusive' : (data.vat_applicable ?? true),
          vat_amount: vatSuggestion ? vatSuggestion.vat_amount : 0,
          receipt_link: data.receipt_link?.trim() || null,
          disbursement_type_id: data.disbursement_type_id || null
        })
        .select()
        .single();

      if (disbursementError) {
        console.error('Disbursement creation error:', disbursementError);
        throw new Error(`Failed to create disbursement: ${disbursementError.message}`);
      }

      // Trigger will automatically update matter WIP value
      
      // Create audit log entry
      await supabase.from('audit_log').insert({
        user_id: user.id,
        user_type: 'advocate',
        user_email: user.email,
        entity_type: 'disbursement',
        entity_id: disbursement.id,
        action: 'create',
        changes: {
          matter_id: data.matter_id,
          description: data.description,
          amount: data.amount,
          date_incurred: data.date_incurred,
          vat_applicable: data.vat_applicable
        }
      });

      toast.success('Disbursement logged successfully');
      return disbursement as Disbursement;

    } catch (error) {
      console.error('Error creating disbursement:', error);
      const message = error instanceof Error ? error.message : 'Failed to create disbursement';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Get all disbursements for a matter
   * Requirements: 2.4
   */
  static async getDisbursementsByMatter(matterId: string): Promise<Disbursement[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Verify user owns the matter
      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select('id, advocate_id')
        .eq('id', matterId)
        .single();

      if (matterError || !matter) {
        throw new Error('Matter not found');
      }

      if (matter.advocate_id !== user.id) {
        throw new Error('Unauthorized');
      }

      // Get disbursements
      const { data: disbursements, error: disbursementsError } = await supabase
        .from('disbursements')
        .select('*')
        .eq('matter_id', matterId)
        .is('deleted_at', null)
        .order('date_incurred', { ascending: false })
        .order('created_at', { ascending: false });

      if (disbursementsError) {
        throw new Error(`Failed to fetch disbursements: ${disbursementsError.message}`);
      }

      return (disbursements || []) as Disbursement[];

    } catch (error) {
      console.error('Error fetching disbursements:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch disbursements';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Get unbilled disbursements for a matter
   * Requirements: 2.8
   */
  static async getUnbilledDisbursements(matterId: string): Promise<Disbursement[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Use the database function for consistency
      const { data: disbursements, error: disbursementsError } = await supabase
        .rpc('get_unbilled_disbursements', { matter_id_param: matterId });

      if (disbursementsError) {
        throw new Error(`Failed to fetch unbilled disbursements: ${disbursementsError.message}`);
      }

      return (disbursements || []) as Disbursement[];

    } catch (error) {
      console.error('Error fetching unbilled disbursements:', error);
      throw error;
    }
  }

  /**
   * Update an existing disbursement
   * Requirements: 2.9
   */
  static async updateDisbursement(id: string, updates: Partial<DisbursementCreate>): Promise<Disbursement> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get existing disbursement
      const { data: existingDisbursement, error: fetchError } = await supabase
        .from('disbursements')
        .select('*, matters!inner(advocate_id)')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (fetchError || !existingDisbursement) {
        throw new Error('Disbursement not found');
      }

      // Verify user owns this disbursement's matter
      if ((existingDisbursement.matters as any).advocate_id !== user.id) {
        throw new Error('Unauthorized');
      }

      // Check if disbursement is already billed
      if (existingDisbursement.is_billed) {
        throw new Error('Cannot modify disbursement that has already been billed');
      }

      // Validate updates
      if (updates.amount !== undefined && updates.amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }

      if (updates.description !== undefined && !updates.description.trim()) {
        throw new Error('Description cannot be empty');
      }

      // Update disbursement
      const { data: updatedDisbursement, error: updateError } = await supabase
        .from('disbursements')
        .update({
          ...updates,
          description: updates.description?.trim(),
          receipt_link: updates.receipt_link?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update disbursement: ${updateError.message}`);
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        user_type: 'advocate',
        user_email: user.email,
        entity_type: 'disbursement',
        entity_id: id,
        action: 'update',
        changes: {
          before: existingDisbursement,
          after: updates
        }
      });

      toast.success('Disbursement updated successfully');
      return updatedDisbursement as Disbursement;

    } catch (error) {
      console.error('Error updating disbursement:', error);
      const message = error instanceof Error ? error.message : 'Failed to update disbursement';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Delete a disbursement (soft delete)
   * Requirements: 2.9
   */
  static async deleteDisbursement(id: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get existing disbursement
      const { data: existingDisbursement, error: fetchError } = await supabase
        .from('disbursements')
        .select('*, matters!inner(advocate_id)')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (fetchError || !existingDisbursement) {
        throw new Error('Disbursement not found');
      }

      // Verify user owns this disbursement's matter
      if ((existingDisbursement.matters as any).advocate_id !== user.id) {
        throw new Error('Unauthorized');
      }

      // Check if disbursement is already billed
      if (existingDisbursement.is_billed) {
        throw new Error('Cannot delete disbursement that has already been billed');
      }

      // Soft delete disbursement
      const { error: deleteError } = await supabase
        .from('disbursements')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (deleteError) {
        throw new Error(`Failed to delete disbursement: ${deleteError.message}`);
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        user_type: 'advocate',
        user_email: user.email,
        entity_type: 'disbursement',
        entity_id: id,
        action: 'delete',
        changes: {
          deleted_disbursement: existingDisbursement
        }
      });

      toast.success('Disbursement deleted successfully');

    } catch (error) {
      console.error('Error deleting disbursement:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete disbursement';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Mark disbursements as billed (used during invoice generation)
   * Requirements: 2.10
   */
  static async markAsBilled(disbursementIds: string[], invoiceId: string): Promise<number> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Use the database function for atomic operation
      const { data: updatedCount, error: updateError } = await supabase
        .rpc('mark_disbursements_as_billed', {
          disbursement_ids: disbursementIds,
          invoice_id_param: invoiceId
        });

      if (updateError) {
        throw new Error(`Failed to mark disbursements as billed: ${updateError.message}`);
      }

      // Create audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        user_type: 'advocate',
        user_email: user.email,
        entity_type: 'disbursement',
        entity_id: null,
        action: 'bulk_update',
        changes: {
          action: 'mark_as_billed',
          disbursement_ids: disbursementIds,
          invoice_id: invoiceId,
          updated_count: updatedCount
        }
      });

      return updatedCount || 0;

    } catch (error) {
      console.error('Error marking disbursements as billed:', error);
      throw error;
    }
  }

  /**
   * Get disbursement summary for reporting
   */
  static async getDisbursementSummary(advocateId?: string): Promise<DisbursementSummary[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const targetAdvocateId = advocateId || user.id;

      // Get disbursement summary from view
      const { data: summary, error: summaryError } = await supabase
        .from('disbursement_summary')
        .select('*')
        .eq('advocate_id', targetAdvocateId)
        .order('latest_disbursement', { ascending: false });

      if (summaryError) {
        throw new Error(`Failed to fetch disbursement summary: ${summaryError.message}`);
      }

      return (summary || []) as DisbursementSummary[];

    } catch (error) {
      console.error('Error fetching disbursement summary:', error);
      throw error;
    }
  }

  /**
   * Calculate VAT for a disbursement using VAT service
   * Integration point with DisbursementVATService
   */
  static async calculateVAT(disbursementTypeId: string, amount: number) {
    try {
      return await DisbursementVATService.suggestVAT(disbursementTypeId, amount);
    } catch (error) {
      console.error('Error calculating VAT:', error);
      throw error;
    }
  }

  /**
   * Get disbursement types for VAT calculation
   * Delegates to DisbursementVATService
   */
  static async getDisbursementTypes() {
    try {
      return await DisbursementVATService.getDisbursementTypes();
    } catch (error) {
      console.error('Error fetching disbursement types:', error);
      throw error;
    }
  }

  /**
   * Correct VAT treatment on a disbursement
   * Delegates to DisbursementVATService
   */
  static async correctVATTreatment(expenseId: string, newVATTreatment: 'vat_inclusive' | 'vat_exempt', reason: string, regenerateInvoice?: boolean) {
    try {
      return await DisbursementVATService.correctVATTreatment({
        expenseId,
        newVATTreatment,
        reason,
        regenerateInvoice
      });
    } catch (error) {
      console.error('Error correcting VAT treatment:', error);
      throw error;
    }
  }

  /**
   * Get all disbursements for the current user with pagination
   */
  static async getDisbursements(options: {
    page?: number;
    pageSize?: number;
    matterId?: string;
    billedOnly?: boolean;
    unbilledOnly?: boolean;
  } = {}): Promise<{ data: Disbursement[]; total: number }> {
    try {
      const { page = 1, pageSize = 50, matterId, billedOnly, unbilledOnly } = options;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('disbursements')
        .select('*', { count: 'exact' })
        .eq('advocate_id', user.id)
        .is('deleted_at', null);

      if (matterId) {
        query = query.eq('matter_id', matterId);
      }

      if (billedOnly) {
        query = query.eq('is_billed', true);
      } else if (unbilledOnly) {
        query = query.eq('is_billed', false);
      }

      query = query
        .order('date_incurred', { ascending: false })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const { data: disbursements, error: disbursementsError, count } = await query;

      if (disbursementsError) {
        throw new Error(`Failed to fetch disbursements: ${disbursementsError.message}`);
      }

      return {
        data: (disbursements || []) as Disbursement[],
        total: count || 0
      };

    } catch (error) {
      console.error('Error fetching disbursements:', error);
      throw error;
    }
  }
}
