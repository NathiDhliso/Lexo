/**
 * Attorney User Service
 * Handles attorney portal operations
 */

import { supabase } from '../../lib/supabase';
import { BaseApiService } from './base-api.service';
import type { AttorneyUser, AttorneyUserCreate, AttorneyUserUpdate, AttorneyMatterAccess } from '../../types/attorney.types';
import { toast } from 'react-hot-toast';

export class AttorneyService extends BaseApiService<AttorneyUser> {
  constructor() {
    super('attorney_users');
  }

  /**
   * Register a new attorney user
   */
  async registerAttorney(data: AttorneyUserCreate): Promise<AttorneyUser | null> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            user_type: 'attorney',
            firm_name: data.firm_name,
            attorney_name: data.attorney_name
          }
        }
      });

      if (authError) throw authError;

      // Create attorney profile
      const { data: attorney, error: profileError } = await supabase
        .from('attorney_users')
        .insert({
          email: data.email,
          firm_name: data.firm_name,
          attorney_name: data.attorney_name,
          practice_number: data.practice_number,
          phone_number: data.phone_number,
          status: 'active'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      toast.success('Attorney registered successfully');
      return attorney;
    } catch (error) {
      console.error('Error registering attorney:', error);
      toast.error('Failed to register attorney');
      return null;
    }
  }

  /**
   * Get attorney by ID
   */
  async getAttorneyById(id: string): Promise<AttorneyUser | null> {
    try {
      const { data, error } = await supabase
        .from('attorney_users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching attorney:', error);
      return null;
    }
  }

  /**
   * Update attorney profile
   */
  async updateAttorney(id: string, updates: AttorneyUserUpdate): Promise<AttorneyUser | null> {
    try {
      const { data, error } = await supabase
        .from('attorney_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Profile updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating attorney:', error);
      toast.error('Failed to update profile');
      return null;
    }
  }

  /**
   * Get matters accessible to attorney
   */
  async getAttorneyMatters(attorneyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('attorney_matter_access')
        .select(`
          *,
          matter:matters(*)
        `)
        .eq('attorney_user_id', attorneyId)
        .is('revoked_at', null);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching attorney matters:', error);
      return [];
    }
  }

  /**
   * Grant matter access to attorney
   */
  async grantMatterAccess(
    attorneyId: string,
    matterId: string,
    accessLevel: AttorneyMatterAccess['access_level']
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('attorney_matter_access')
        .insert({
          attorney_user_id: attorneyId,
          matter_id: matterId,
          access_level: accessLevel,
          granted_by: user.id
        });

      if (error) throw error;

      toast.success('Access granted successfully');
      return true;
    } catch (error) {
      console.error('Error granting access:', error);
      toast.error('Failed to grant access');
      return false;
    }
  }

  /**
   * Revoke matter access from attorney
   */
  async revokeMatterAccess(accessId: string, reason?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('attorney_matter_access')
        .update({
          revoked_at: new Date().toISOString(),
          revoked_by: user.id,
          revoked_reason: reason
        })
        .eq('id', accessId);

      if (error) throw error;

      toast.success('Access revoked successfully');
      return true;
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error('Failed to revoke access');
      return false;
    }
  }

  /**
   * Generate invitation token for a firm
   */
  static async generateInvitationToken(firmId: string): Promise<import('../../types/financial.types').InvitationTokenResponse> {
    try {
      // Generate cryptographically secure token
      const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
      
      // Calculate expiration (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Update firm with token
      const { data, error } = await supabase
        .from('firms')
        .update({
          invitation_token: token,
          invitation_token_expires_at: expiresAt.toISOString(),
          invitation_token_used_at: null // Reset if re-inviting
        })
        .eq('id', firmId)
        .select()
        .single();
      
      if (error) {
        console.error('Error generating invitation token:', error);
        toast.error('Failed to generate invitation link');
        throw error;
      }
      
      // Construct invitation link
      const invitationLink = `${window.location.origin}/register-firm?firm_id=${firmId}&token=${token}`;
      
      return {
        token,
        expires_at: expiresAt.toISOString(),
        invitation_link: invitationLink
      };
    } catch (error) {
      console.error('Error in generateInvitationToken:', error);
      throw error;
    }
  }

  /**
   * Verify invitation token
   */
  static async verifyInvitationToken(firmId: string, token: string): Promise<import('../../types/financial.types').Firm> {
    const { data: firm, error } = await supabase
      .from('firms')
      .select('*')
      .eq('id', firmId)
      .eq('invitation_token', token)
      .single();
    
    if (error || !firm) {
      throw new Error('Invalid invitation link');
    }
    
    // Check expiration
    if (firm.invitation_token_expires_at) {
      const expiresAt = new Date(firm.invitation_token_expires_at);
      if (expiresAt < new Date()) {
        throw new Error('This invitation link has expired');
      }
    }
    
    // Check if already used
    if (firm.invitation_token_used_at) {
      throw new Error('This invitation has already been used');
    }
    
    return firm;
  }

  /**
   * Register attorney via invitation
   */
  static async registerViaInvitation(data: import('../../types/financial.types').AttorneyRegistrationData): Promise<void> {
    try {
      // Verify token again (security double-check)
      await this.verifyInvitationToken(data.firm_id, data.token);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            attorney_name: data.attorney_name,
            phone_number: data.phone_number,
            firm_id: data.firm_id,
            user_type: 'attorney'
          }
        }
      });
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('An account with this email already exists');
        } else if (authError.message.includes('weak password')) {
          toast.error('Password is too weak. Use at least 8 characters');
        } else {
          toast.error('Registration failed. Please try again');
        }
        throw authError;
      }
      
      // Update firm record
      await supabase
        .from('firms')
        .update({
          attorney_name: data.attorney_name,
          phone_number: data.phone_number,
          email: data.email,
          invitation_token_used_at: new Date().toISOString(),
          onboarded_at: new Date().toISOString(),
          status: 'active'
        })
        .eq('id', data.firm_id);
      
      toast.success('Registration successful!');
    } catch (error) {
      console.error('Error in registerViaInvitation:', error);
      throw error;
    }
  }
}

export const attorneyService = new AttorneyService();
