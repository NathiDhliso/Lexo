/**
 * Disbursement VAT Service
 * Smart VAT suggestion and management for disbursements
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

// Type definitions
export type VATTreatment = 'always_vat' | 'never_vat' | 'suggest_vat' | 'suggest_no_vat';
export type DisbursementCategory = 'court_fees' | 'travel' | 'accommodation' | 'document_fees' | 'expert_fees' | 'other';

export interface DisbursementType {
  id: string;
  advocate_id: string | null;
  type_name: string;
  description: string | null;
  vat_treatment: VATTreatment;
  vat_rate: number;
  category: DisbursementCategory;
  is_system_default: boolean;
  sars_code: string | null;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisbursementVATAudit {
  id: string;
  expense_id: string;
  advocate_id: string;
  action_type: 'created' | 'vat_changed' | 'corrected' | 'overridden';
  old_vat_treatment: string | null;
  new_vat_treatment: string | null;
  old_vat_amount: number | null;
  new_vat_amount: number | null;
  reason: string;
  changed_by: string | null;
  invoice_id: string | null;
  invoice_regenerated: boolean;
  created_at: string;
}

export interface VATSuggestion {
  suggested_treatment: 'vat_inclusive' | 'vat_exempt';
  vat_amount: number;
  explanation: string;
  can_override: boolean;
  confidence: 'high' | 'medium' | 'low';
}

export interface CreateDisbursementTypeRequest {
  typeName: string;
  description?: string;
  vatTreatment: VATTreatment;
  vatRate?: number;
  category: DisbursementCategory;
  sarsCode?: string;
}

export interface UpdateDisbursementTypeRequest {
  typeName?: string;
  description?: string;
  vatTreatment?: VATTreatment;
  vatRate?: number;
  category?: DisbursementCategory;
  sarsCode?: string;
}

export interface CorrectVATRequest {
  expenseId: string;
  newVATTreatment: 'vat_inclusive' | 'vat_exempt';
  reason: string;
  regenerateInvoice?: boolean;
}

export class DisbursementVATService {
  /**
   * Get all disbursement types (system defaults + custom)
   * Requirement: 6.1, 6.4
   */
  static async getDisbursementTypes(): Promise<DisbursementType[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('disbursement_types')
        .select('*')
        .or(`is_system_default.eq.true,advocate_id.eq.${user?.id || 'null'}`)
        .order('is_system_default', { ascending: false })
        .order('usage_count', { ascending: false });

      if (error) throw error;

      return data as DisbursementType[];
    } catch (error) {
      console.error('Error fetching disbursement types:', error);
      throw error;
    }
  }

  /**
   * Get disbursement types by category
   * Requirement: 6.1
   */
  static async getDisbursementTypesByCategory(category: DisbursementCategory): Promise<DisbursementType[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('disbursement_types')
        .select('*')
        .eq('category', category)
        .or(`is_system_default.eq.true,advocate_id.eq.${user?.id || 'null'}`)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      return data as DisbursementType[];
    } catch (error) {
      console.error('Error fetching disbursement types by category:', error);
      throw error;
    }
  }

  /**
   * Suggest VAT treatment for a disbursement
   * Requirements: 6.1, 6.2, 6.3
   */
  static async suggestVAT(
    disbursementTypeId: string,
    amount: number
  ): Promise<VATSuggestion> {
    try {
      const { data: type, error } = await supabase
        .from('disbursement_types')
        .select('*')
        .eq('id', disbursementTypeId)
        .single();

      if (error) throw error;

      const disbursementType = type as DisbursementType;
      let suggested_treatment: 'vat_inclusive' | 'vat_exempt';
      let vat_amount = 0;
      let explanation = '';
      let can_override = true;
      let confidence: 'high' | 'medium' | 'low' = 'high';

      switch (disbursementType.vat_treatment) {
        case 'always_vat':
          suggested_treatment = 'vat_inclusive';
          vat_amount = amount * disbursementType.vat_rate / (1 + disbursementType.vat_rate);
          explanation = `${disbursementType.type_name} always includes VAT per SARS regulations`;
          can_override = false;
          confidence = 'high';
          break;

        case 'never_vat':
          suggested_treatment = 'vat_exempt';
          vat_amount = 0;
          explanation = `${disbursementType.type_name} is VAT-exempt (e.g., court fees, government charges)`;
          can_override = false;
          confidence = 'high';
          break;

        case 'suggest_vat':
          suggested_treatment = 'vat_inclusive';
          vat_amount = amount * disbursementType.vat_rate / (1 + disbursementType.vat_rate);
          explanation = `${disbursementType.type_name} typically includes VAT. You can override if needed.`;
          can_override = true;
          confidence = 'medium';
          break;

        case 'suggest_no_vat':
          suggested_treatment = 'vat_exempt';
          vat_amount = 0;
          explanation = `${disbursementType.type_name} is usually VAT-exempt. You can override if needed.`;
          can_override = true;
          confidence = 'medium';
          break;

        default:
          suggested_treatment = 'vat_exempt';
          vat_amount = 0;
          explanation = 'No VAT rule defined for this disbursement type';
          can_override = true;
          confidence = 'low';
      }

      return {
        suggested_treatment,
        vat_amount,
        explanation,
        can_override,
        confidence,
      };
    } catch (error) {
      console.error('Error suggesting VAT:', error);
      throw error;
    }
  }

  /**
   * Create custom disbursement type
   * Requirement: 6.4
   */
  static async createDisbursementType(
    request: CreateDisbursementTypeRequest
  ): Promise<DisbursementType> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const typeData = {
        advocate_id: user.id,
        type_name: request.typeName,
        description: request.description || null,
        vat_treatment: request.vatTreatment,
        vat_rate: request.vatRate || 0.15,
        category: request.category,
        sars_code: request.sarsCode || null,
        is_system_default: false,
      };

      const { data, error } = await supabase
        .from('disbursement_types')
        .insert(typeData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Disbursement type "${request.typeName}" created`);
      return data as DisbursementType;
    } catch (error) {
      console.error('Error creating disbursement type:', error);
      const message = error instanceof Error ? error.message : 'Failed to create disbursement type';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Update custom disbursement type
   * Requirement: 6.4
   */
  static async updateDisbursementType(
    typeId: string,
    request: UpdateDisbursementTypeRequest
  ): Promise<DisbursementType> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const updateData: any = {};
      if (request.typeName) updateData.type_name = request.typeName;
      if (request.description !== undefined) updateData.description = request.description;
      if (request.vatTreatment) updateData.vat_treatment = request.vatTreatment;
      if (request.vatRate !== undefined) updateData.vat_rate = request.vatRate;
      if (request.category) updateData.category = request.category;
      if (request.sarsCode !== undefined) updateData.sars_code = request.sarsCode;

      const { data, error } = await supabase
        .from('disbursement_types')
        .update(updateData)
        .eq('id', typeId)
        .eq('advocate_id', user.id) // Only update own types
        .eq('is_system_default', false) // Can't update system defaults
        .select()
        .single();

      if (error) throw error;

      toast.success('Disbursement type updated');
      return data as DisbursementType;
    } catch (error) {
      console.error('Error updating disbursement type:', error);
      const message = error instanceof Error ? error.message : 'Failed to update disbursement type';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Delete custom disbursement type
   * Requirement: 6.4
   */
  static async deleteDisbursementType(typeId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('disbursement_types')
        .delete()
        .eq('id', typeId)
        .eq('advocate_id', user.id)
        .eq('is_system_default', false);

      if (error) throw error;

      toast.success('Disbursement type deleted');
    } catch (error) {
      console.error('Error deleting disbursement type:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete disbursement type';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Correct VAT treatment on an expense with audit trail
   * Requirements: 6.5, 6.6
   */
  static async correctVATTreatment(request: CorrectVATRequest): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get current expense details
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', request.expenseId)
        .single();

      if (expenseError) throw expenseError;

      // Calculate new VAT amount
      let newVATAmount = 0;
      if (request.newVATTreatment === 'vat_inclusive') {
        // Assuming VAT rate of 15%
        newVATAmount = expense.amount * 0.15 / 1.15;
      }

      // Update expense
      const { error: updateError } = await supabase
        .from('expenses')
        .update({
          vat_treatment: request.newVATTreatment,
          vat_amount: newVATAmount,
          vat_overridden: true,
          vat_override_reason: request.reason,
        })
        .eq('id', request.expenseId);

      if (updateError) throw updateError;

      // Audit trail is automatically created by trigger

      // Regenerate invoice if requested and invoice exists
      if (request.regenerateInvoice && expense.invoice_id) {
        await supabase
          .from('disbursement_vat_audit')
          .update({ invoice_regenerated: true })
          .eq('expense_id', request.expenseId)
          .order('created_at', { ascending: false })
          .limit(1);

        toast.success('VAT corrected and invoice marked for regeneration');
      } else {
        toast.success('VAT treatment corrected');
      }
    } catch (error) {
      console.error('Error correcting VAT:', error);
      const message = error instanceof Error ? error.message : 'Failed to correct VAT';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Get VAT audit log for an expense
   * Requirement: 6.5
   */
  static async getVATAuditLog(expenseId: string): Promise<DisbursementVATAudit[]> {
    try {
      const { data, error } = await supabase
        .from('disbursement_vat_audit')
        .select('*')
        .eq('expense_id', expenseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as DisbursementVATAudit[];
    } catch (error) {
      console.error('Error fetching VAT audit log:', error);
      throw error;
    }
  }

  /**
   * Get VAT audit log for advocate (for SARS compliance)
   * Requirement: 6.6, 6.7
   */
  static async getAdvocateVATAuditLog(
    startDate?: string,
    endDate?: string
  ): Promise<DisbursementVATAudit[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('disbursement_vat_audit')
        .select('*')
        .eq('advocate_id', user.id)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as DisbursementVATAudit[];
    } catch (error) {
      console.error('Error fetching advocate VAT audit log:', error);
      throw error;
    }
  }

  /**
   * Get disbursement statistics (for reports)
   * Requirement: 6.6, 6.7
   */
  static async getDisbursementStatistics(
    startDate: string,
    endDate: string
  ): Promise<{
    total_disbursements: number;
    vat_inclusive_total: number;
    vat_exempt_total: number;
    total_vat_amount: number;
    by_category: Record<string, { count: number; total: number; vat: number }>;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*, disbursement_types(*)')
        .eq('advocate_id', user.id)
        .gte('expense_date', startDate)
        .lte('expense_date', endDate);

      if (error) throw error;

      const stats = {
        total_disbursements: expenses?.length || 0,
        vat_inclusive_total: 0,
        vat_exempt_total: 0,
        total_vat_amount: 0,
        by_category: {} as Record<string, { count: number; total: number; vat: number }>,
      };

      expenses?.forEach((expense: any) => {
        if (expense.vat_treatment === 'vat_inclusive') {
          stats.vat_inclusive_total += expense.amount;
          stats.total_vat_amount += expense.vat_amount || 0;
        } else {
          stats.vat_exempt_total += expense.amount;
        }

        const category = expense.disbursement_types?.category || 'other';
        if (!stats.by_category[category]) {
          stats.by_category[category] = { count: 0, total: 0, vat: 0 };
        }
        stats.by_category[category].count++;
        stats.by_category[category].total += expense.amount;
        stats.by_category[category].vat += expense.vat_amount || 0;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching disbursement statistics:', error);
      throw error;
    }
  }
}

export const disbursementVATService = DisbursementVATService;
