import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../../../types/database';

type ScopeAmendment = Database['public']['Tables']['scope_amendments']['Row'];
type ScopeAmendmentInsert = Database['public']['Tables']['scope_amendments']['Insert'];

export interface CreateScopeAmendmentRequest {
  matterId: string;
  amendmentType: 'scope_increase' | 'scope_decrease' | 'fee_adjustment' | 'timeline_change' | 'other';
  reason: string;
  description?: string;
  originalEstimate?: number;
  newEstimate?: number;
  originalTimelineDays?: number;
  newTimelineDays?: number;
}

export class ScopeAmendmentService {
  static async create(request: CreateScopeAmendmentRequest): Promise<ScopeAmendment> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select('engagement_agreement_id, estimated_total')
        .eq('id', request.matterId)
        .single();

      if (matterError || !matter) {
        throw new Error('Matter not found');
      }

      const amendmentData: ScopeAmendmentInsert = {
        matter_id: request.matterId,
        engagement_agreement_id: matter.engagement_agreement_id,
        advocate_id: user.id,
        amendment_type: request.amendmentType,
        reason: request.reason,
        description: request.description,
        original_estimate: request.originalEstimate || matter.estimated_total,
        new_estimate: request.newEstimate,
        original_timeline_days: request.originalTimelineDays,
        new_timeline_days: request.newTimelineDays,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('scope_amendments')
        .insert(amendmentData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Scope amendment created');
      return data;
    } catch (error) {
      console.error('Error creating scope amendment:', error);
      const message = error instanceof Error ? error.message : 'Failed to create scope amendment';
      toast.error(message);
      throw error;
    }
  }

  static async approve(amendmentId: string, notes?: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: amendment, error: fetchError } = await supabase
        .from('scope_amendments')
        .select('*, matters(id, estimated_total)')
        .eq('id', amendmentId)
        .single();

      if (fetchError || !amendment) {
        throw new Error('Scope amendment not found');
      }

      const { error } = await supabase
        .from('scope_amendments')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', amendmentId);

      if (error) throw error;

      if (amendment.new_estimate && amendment.matters) {
        await supabase
          .from('matters')
          .update({ 
            estimated_total: amendment.new_estimate,
            updated_at: new Date().toISOString()
          })
          .eq('id', amendment.matter_id);
      }

      toast.success('Scope amendment approved');
    } catch (error) {
      console.error('Error approving scope amendment:', error);
      const message = error instanceof Error ? error.message : 'Failed to approve scope amendment';
      toast.error(message);
      throw error;
    }
  }

  static async reject(amendmentId: string, reason: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('scope_amendments')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', amendmentId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Scope amendment rejected');
    } catch (error) {
      console.error('Error rejecting scope amendment:', error);
      const message = error instanceof Error ? error.message : 'Failed to reject scope amendment';
      toast.error(message);
      throw error;
    }
  }

  static async notifyClient(amendmentId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('scope_amendments')
        .update({
          client_notified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', amendmentId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Client notified of scope amendment');
    } catch (error) {
      console.error('Error notifying client:', error);
      const message = error instanceof Error ? error.message : 'Failed to notify client';
      toast.error(message);
      throw error;
    }
  }

  static async recordClientApproval(amendmentId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('scope_amendments')
        .update({
          client_approved_at: new Date().toISOString(),
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', amendmentId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Client approval recorded');
    } catch (error) {
      console.error('Error recording client approval:', error);
      const message = error instanceof Error ? error.message : 'Failed to record client approval';
      toast.error(message);
      throw error;
    }
  }

  static async getByMatterId(matterId: string): Promise<ScopeAmendment[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('scope_amendments')
        .select('*')
        .eq('matter_id', matterId)
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching scope amendments:', error);
      throw error;
    }
  }

  static async getPendingAmendments(): Promise<ScopeAmendment[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('scope_amendments')
        .select('*, matters(title, client_name)')
        .eq('advocate_id', user.id)
        .eq('status', 'pending')
        .is('deleted_at', null)
        .order('requested_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending amendments:', error);
      throw error;
    }
  }

  static calculateVariance(original: number, newAmount: number): {
    variance: number;
    percentage: number;
    isIncrease: boolean;
  } {
    const variance = newAmount - original;
    const percentage = original > 0 ? (variance / original) * 100 : 0;
    
    return {
      variance,
      percentage,
      isIncrease: variance > 0
    };
  }
}

export const scopeAmendmentService = new ScopeAmendmentService();
