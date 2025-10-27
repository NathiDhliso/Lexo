/**
 * Attorney Service
 * Enhanced with usage tracking and portal invitation features
 * Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import { supabase } from '../../lib/supabase';
import { toastService } from '../toast.service';

export interface AttorneyUsageStats {
  attorney_id: string;
  attorney_name: string;
  email: string;
  phone?: string;
  firm_id: string;
  firm_name: string;
  matter_count: number;
  last_worked_with: string;
  first_worked_with: string;
  days_since_last_worked: number;
  is_registered: boolean;
  portal_invitation_sent: boolean;
  portal_invitation_accepted: boolean;
}

export interface CreateAttorneyRequest {
  attorney_name: string;
  email: string;
  phone?: string;
  firm_id?: string;
  firm_name?: string;
  send_portal_invitation?: boolean;
  advocate_id: string;
}

export class AttorneyService {
  /**
   * Get recurring attorneys for an advocate (top 10 by usage)
   */
  static async getRecurringAttorneys(advocateId: string): Promise<AttorneyUsageStats[]> {
    try {
      const { data, error } = await supabase
        .from('recurring_attorneys_view')
        .select('*')
        .eq('advocate_id', advocateId)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching recurring attorneys:', error);
      toastService.error('Failed to load recurring attorneys');
      return [];
    }
  }

  /**
   * Create attorney with optional portal invitation
   * Requirement 8.1, 8.2
   */
  static async createAttorney(request: CreateAttorneyRequest): Promise<any> {
    try {
      // 1. Create or get firm
      let firmId = request.firm_id;
      
      if (!firmId && request.firm_name) {
        const { data: firm, error: firmError } = await supabase
          .from('firms')
          .insert({
            firm_name: request.firm_name,
            advocate_id: request.advocate_id
          })
          .select()
          .single();

        if (firmError) throw firmError;
        firmId = firm.id;
      }

      // 2. Create attorney record
      const { data: attorney, error: attorneyError } = await supabase
        .from('attorneys')
        .insert({
          attorney_name: request.attorney_name,
          email: request.email,
          phone: request.phone || null,
          firm_id: firmId,
          portal_invitation_sent: request.send_portal_invitation || false,
          portal_invitation_sent_at: request.send_portal_invitation ? new Date().toISOString() : null,
          is_registered: false
        })
        .select()
        .single();

      if (attorneyError) throw attorneyError;

      // 3. Send portal invitation if requested
      if (request.send_portal_invitation) {
        await this.sendPortalInvitation(attorney.id, request.email);
      }

      toastService.success('Attorney added successfully');
      return attorney;
    } catch (error: any) {
      console.error('Error creating attorney:', error);
      toastService.error(error.message || 'Failed to create attorney');
      throw error;
    }
  }

  /**
   * Send portal invitation email
   * Requirement 8.2, 8.6
   */
  static async sendPortalInvitation(attorneyId: string, email: string): Promise<void> {
    try {
      // TODO: Integrate with email service (SendGrid, etc.)
      // For now, create invitation token and log
      
      const invitationToken = crypto.randomUUID();
      const invitationUrl = `${window.location.origin}/attorney/register?token=${invitationToken}&attorney_id=${attorneyId}`;

      console.log('Sending portal invitation:', {
        to: email,
        url: invitationUrl,
        attorneyId
      });

      // Store invitation token
      await supabase
        .from('attorney_invitation_tokens')
        .insert({
          attorney_id: attorneyId,
          token: invitationToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });

      toastService.success(`Portal invitation sent to ${email}`);
    } catch (error: any) {
      console.error('Error sending portal invitation:', error);
      toastService.error('Failed to send portal invitation');
    }
  }

  /**
   * Link attorney account to historical matters when they register
   * Requirement 8.7
   */
  static async linkHistoricalMatters(attorneyEmail: string, userId: string): Promise<number> {
    try {
      // 1. Update attorney record with user_id
      const { error: attorneyError } = await supabase
        .from('attorneys')
        .update({
          user_id: userId,
          is_registered: true,
          portal_invitation_accepted: true,
          portal_invitation_accepted_at: new Date().toISOString()
        })
        .eq('email', attorneyEmail);

      if (attorneyError) throw attorneyError;

      // 2. Find all matters with this attorney's email
      const { data: matters, error: mattersError } = await supabase
        .from('matters')
        .select('id')
        .eq('instructing_attorney_email', attorneyEmail);

      if (mattersError) throw mattersError;

      // 3. Create attorney_matter_access records
      if (matters && matters.length > 0) {
        const accessRecords = matters.map(matter => ({
          attorney_user_id: userId,
          matter_id: matter.id,
          granted_at: new Date().toISOString()
        }));

        const { error: accessError } = await supabase
          .from('attorney_matter_access')
          .insert(accessRecords);

        if (accessError) throw accessError;

        toastService.success(`${matters.length} historical matter(s) linked to your account`);
        return matters.length;
      }

      return 0;
    } catch (error: any) {
      console.error('Error linking historical matters:', error);
      toastService.error('Failed to link historical matters');
      return 0;
    }
  }

  /**
   * Get attorney usage statistics
   * Requirement 8.3, 8.4
   */
  static async getAttorneyStats(advocateId: string, attorneyId: string): Promise<AttorneyUsageStats | null> {
    try {
      const { data, error } = await supabase
        .from('recurring_attorneys_view')
        .select('*')
        .eq('advocate_id', advocateId)
        .eq('attorney_id', attorneyId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching attorney stats:', error);
      return null;
    }
  }

  /**
   * Check if attorney is registered
   * Used for invoice delivery decisions (Requirement 8.6)
   */
  static async isAttorneyRegistered(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('attorneys')
        .select('is_registered')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data?.is_registered || false;
    } catch (_error) {
      return false;
    }
  }
}

export const attorneyService = new AttorneyService();
