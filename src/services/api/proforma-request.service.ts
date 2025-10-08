import { supabase } from '../../lib/supabase';
import { Database } from '../../../types/database';
import { toast } from 'react-hot-toast';

type ProFormaRequest = Database['public']['Tables']['proforma_requests']['Row'];
type ProFormaRequestInsert = Database['public']['Tables']['proforma_requests']['Insert'];
type ProFormaRequestUpdate = Database['public']['Tables']['proforma_requests']['Update'];
type ProFormaRequestStatus = Database['public']['Enums']['proforma_request_status'];

export class ProFormaRequestService {
  private static instance: ProFormaRequestService;

  public static getInstance(): ProFormaRequestService {
    if (!ProFormaRequestService.instance) {
      ProFormaRequestService.instance = new ProFormaRequestService();
    }
    return ProFormaRequestService.instance;
  }

  async create(data: ProFormaRequestInsert): Promise<ProFormaRequest> {
    try {
      const { data: request, error } = await supabase
        .from('proforma_requests')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      toast.success('Pro forma request created successfully');
      return request;
    } catch (error) {
      console.error('Error creating pro forma request:', error);
      const message = error instanceof Error ? error.message : 'Failed to create pro forma request';
      toast.error(message);
      throw error;
    }
  }

  async getById(id: string): Promise<ProFormaRequest | null> {
    try {
      const { data, error } = await supabase
        .from('proforma_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching pro forma request:', error);
      return null;
    }
  }

  async list(filters?: {
    status?: ProFormaRequestStatus[];
    advocateId?: string;
  }): Promise<ProFormaRequest[]> {
    try {
      let query = supabase
        .from('proforma_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.advocateId) {
        query = query.eq('advocate_id', filters.advocateId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pro forma requests:', error);
      return [];
    }
  }

  async update(
    id: string,
    updates: ProFormaRequestUpdate
  ): Promise<ProFormaRequest> {
    try {
      const { data, error } = await supabase
        .from('proforma_requests')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Pro forma request updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating pro forma request:', error);
      const message = error instanceof Error ? error.message : 'Failed to update pro forma request';
      toast.error(message);
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: ProFormaRequestStatus
  ): Promise<ProFormaRequest> {
    try {
      const updates: ProFormaRequestUpdate = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'sent') {
        updates.sent_at = new Date().toISOString();
        updates.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (status === 'accepted' || status === 'declined') {
        updates.responded_at = new Date().toISOString();
      }

      return this.update(id, updates);
    } catch (error) {
      console.error('Error updating pro forma status:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('proforma_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Pro forma request deleted successfully');
    } catch (error) {
      console.error('Error deleting pro forma request:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete pro forma request';
      toast.error(message);
      throw error;
    }
  }

  async getCounts(advocateId: string): Promise<{
    draft: number;
    sent: number;
    accepted: number;
    total: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('proforma_requests')
        .select('status')
        .eq('advocate_id', advocateId);

      if (error) throw error;

      const counts = {
        draft: 0,
        sent: 0,
        accepted: 0,
        total: data?.length || 0,
      };

      data?.forEach((request) => {
        if (request.status === 'draft') counts.draft++;
        if (request.status === 'sent') counts.sent++;
        if (request.status === 'accepted') counts.accepted++;
      });

      return counts;
    } catch (error) {
      console.error('Error fetching pro forma counts:', error);
      return { draft: 0, sent: 0, accepted: 0, total: 0 };
    }
  }

  async checkExpired(): Promise<void> {
    try {
      const { error } = await supabase
        .from('proforma_requests')
        .update({ status: 'expired' })
        .lt('expires_at', new Date().toISOString())
        .neq('status', 'expired');

      if (error) throw error;
    } catch (error) {
      console.error('Error checking expired requests:', error);
    }
  }

  async generateToken(id: string): Promise<{ token: string; expiresAt: string }> {
    try {
      // Generate a secure token and set 7-day expiry
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('proforma_requests')
        .update({ 
          token,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('token, expires_at')
        .single();

      if (error) throw error;

      toast.success('Shareable link generated successfully');
      return {
        token: data.token,
        expiresAt: data.expires_at
      };
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error('Failed to generate shareable link');
      throw error;
    }
  }

  async getByToken(token: string): Promise<ProFormaRequest | null> {
    try {
      const { data, error } = await supabase
        .from('proforma_requests')
        .select('*')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No matching record found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching request by token:', error);
      return null;
    }
  }

  async submitByToken(token: string, submissionData: {
    instructing_attorney_name: string;
    instructing_attorney_email: string;
    instructing_attorney_phone?: string;
    instructing_firm?: string;
    work_description?: string;
  }): Promise<ProFormaRequest> {
    try {
      const { data, error } = await supabase
        .from('proforma_requests')
        .update({
          ...submissionData,
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .select()
        .single();

      if (error) throw error;

      toast.success('Pro forma request submitted successfully');
      return data;
    } catch (error) {
      console.error('Error submitting request by token:', error);
      toast.error('Failed to submit request');
      throw error;
    }
  }
}

export const proformaRequestService = ProFormaRequestService.getInstance();
