import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../../../types/database';

type Matter = Database['public']['Tables']['matters']['Row'];

export interface SubmitForApprovalRequest {
  matterId: string;
  billingNotes?: string;
}

export interface ApprovalDecisionRequest {
  matterId: string;
  approved: boolean;
  notes?: string;
}

export interface PendingApproval extends Matter {
  unbilled_time_entries?: number;
  unbilled_expenses?: number;
  total_unbilled?: number;
}

export class PartnerApprovalService {
  static async submitForApproval(request: SubmitForApprovalRequest): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select('completion_status')
        .eq('id', request.matterId)
        .single();

      if (matterError || !matter) {
        throw new Error('Matter not found');
      }

      if (matter.completion_status !== 'ready_to_bill') {
        throw new Error('Matter must be marked as ready to bill before submitting for approval');
      }

      const { error } = await supabase
        .from('matters')
        .update({
          completion_status: 'review',
          billing_review_notes: request.billingNotes,
          billing_ready_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.matterId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Matter submitted for partner approval');
    } catch (error) {
      console.error('Error submitting for approval:', error);
      const message = error instanceof Error ? error.message : 'Failed to submit for approval';
      toast.error(message);
      throw error;
    }
  }

  static async approveBilling(request: ApprovalDecisionRequest): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('matters')
        .update({
          completion_status: 'ready_to_bill',
          partner_approved_by: user.id,
          partner_approved_at: new Date().toISOString(),
          partner_approval_notes: request.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.matterId);

      if (error) throw error;

      toast.success('Billing approved - ready to generate invoice');
    } catch (error) {
      console.error('Error approving billing:', error);
      const message = error instanceof Error ? error.message : 'Failed to approve billing';
      toast.error(message);
      throw error;
    }
  }

  static async rejectBilling(request: ApprovalDecisionRequest): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      if (!request.notes) {
        throw new Error('Rejection reason is required');
      }

      const { error } = await supabase
        .from('matters')
        .update({
          completion_status: 'in_progress',
          partner_approved_by: user.id,
          partner_approved_at: new Date().toISOString(),
          partner_approval_notes: `REJECTED: ${request.notes}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.matterId);

      if (error) throw error;

      toast.success('Billing rejected - returned to advocate');
    } catch (error) {
      console.error('Error rejecting billing:', error);
      const message = error instanceof Error ? error.message : 'Failed to reject billing';
      toast.error(message);
      throw error;
    }
  }

  static async getPendingApprovals(): Promise<PendingApproval[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('matters')
        .select(`
          *,
          time_entries!left (
            id,
            hours,
            hourly_rate,
            is_billed
          ),
          expenses!left (
            id,
            amount,
            is_billed
          )
        `)
        .eq('advocate_id', user.id)
        .eq('completion_status', 'review')
        .is('deleted_at', null)
        .order('billing_ready_at', { ascending: true });

      if (error) throw error;

      const mattersWithTotals = (data || []).map(matter => {
        const unbilledTimeEntries = (matter.time_entries || [])
          .filter((te: any) => !te.is_billed)
          .reduce((sum: number, te: any) => sum + (te.hours * te.hourly_rate), 0);

        const unbilledExpenses = (matter.expenses || [])
          .filter((exp: any) => !exp.is_billed)
          .reduce((sum: number, exp: any) => sum + exp.amount, 0);

        return {
          ...matter,
          unbilled_time_entries: unbilledTimeEntries,
          unbilled_expenses: unbilledExpenses,
          total_unbilled: unbilledTimeEntries + unbilledExpenses
        };
      });

      return mattersWithTotals;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  static async getApprovalHistory(matterId: string): Promise<{
    approvedBy: string | null;
    approvedAt: string | null;
    notes: string | null;
    status: string;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: matter, error } = await supabase
        .from('matters')
        .select(`
          partner_approved_by,
          partner_approved_at,
          partner_approval_notes,
          completion_status,
          advocates!matters_partner_approved_by_fkey (
            full_name
          )
        `)
        .eq('id', matterId)
        .single();

      if (error) throw error;

      return {
        approvedBy: matter.advocates?.full_name || null,
        approvedAt: matter.partner_approved_at,
        notes: matter.partner_approval_notes,
        status: matter.completion_status
      };
    } catch (error) {
      console.error('Error fetching approval history:', error);
      throw error;
    }
  }

  static async getApprovalStats(): Promise<{
    pendingCount: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
    averageApprovalTime: number;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: pending, error: pendingError } = await supabase
        .from('matters')
        .select('id', { count: 'exact', head: true })
        .eq('advocate_id', user.id)
        .eq('completion_status', 'review')
        .is('deleted_at', null);

      const { data: approved, error: approvedError } = await supabase
        .from('matters')
        .select('id', { count: 'exact', head: true })
        .eq('advocate_id', user.id)
        .eq('completion_status', 'ready_to_bill')
        .gte('partner_approved_at', startOfMonth.toISOString())
        .is('deleted_at', null);

      const { data: rejected, error: rejectedError } = await supabase
        .from('matters')
        .select('id', { count: 'exact', head: true })
        .eq('advocate_id', user.id)
        .eq('completion_status', 'in_progress')
        .like('partner_approval_notes', 'REJECTED:%')
        .gte('partner_approved_at', startOfMonth.toISOString())
        .is('deleted_at', null);

      return {
        pendingCount: pending?.length || 0,
        approvedThisMonth: approved?.length || 0,
        rejectedThisMonth: rejected?.length || 0,
        averageApprovalTime: 0
      };
    } catch (error) {
      console.error('Error fetching approval stats:', error);
      return {
        pendingCount: 0,
        approvedThisMonth: 0,
        rejectedThisMonth: 0,
        averageApprovalTime: 0
      };
    }
  }
}

export const partnerApprovalService = new PartnerApprovalService();
