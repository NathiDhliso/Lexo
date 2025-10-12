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
}

export const attorneyService = new AttorneyService();
