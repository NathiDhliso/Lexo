/**
 * Advocate Service
 * Handles advocate-related database operations
 */

import { supabase } from '../../lib/supabase';
import type { Advocate } from '../../types';

export class AdvocateService {
  /**
   * Get advocate by ID
   */
  static async getAdvocateById(advocateId: string): Promise<Advocate | null> {
    try {
      // Try user_profiles first (new schema)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', advocateId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching advocate profile:', error);
        
        // If user_profiles doesn't have the record, try creating one
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === advocateId) {
          console.log('No advocate profile found, creating one...');
          return this.createAdvocate({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            initials: user.user_metadata?.initials || '',
            practice_number: user.user_metadata?.practice_number || '',
            bar: user.user_metadata?.bar || 'johannesburg',
            year_admitted: user.user_metadata?.year_admitted || new Date().getFullYear(),
          });
        }
        
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getAdvocateById:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated advocate
   */
  static async getCurrentAdvocate(): Promise<Advocate | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // The advocate ID should be the same as the auth user ID
      return this.getAdvocateById(user.id);
    } catch (error) {
      console.error('Error getting current advocate:', error);
      throw error;
    }
  }

  /**
   * Create a new advocate profile
   */
  static async createAdvocate(userData: {
    id: string; // Use auth user ID as advocate ID
    email: string;
    full_name: string;
    initials: string;
    practice_number: string;
    bar: 'johannesburg' | 'cape_town';
    year_admitted: number;
    hourly_rate?: number;
    phone_number?: string;
    chambers_address?: string;
    postal_address?: string;
  }): Promise<Advocate> {
    try {
      // Map to user_profiles schema
      const profileData = {
        user_id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        initials: userData.initials,
        practice_number: userData.practice_number,
        year_admitted: userData.year_admitted,
        hourly_rate: userData.hourly_rate || 0,
        phone: userData.phone_number,
        chambers_address: userData.chambers_address,
        postal_address: userData.postal_address,
        is_active: true,
        user_role: 'junior_advocate' as const,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating advocate profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createAdvocate:', error);
      throw error;
    }
  }

  /**
   * Update advocate profile
   */
  static async updateAdvocate(advocateId: string, updates: Partial<Advocate>): Promise<Advocate> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', advocateId)
        .select()
        .single();

      if (error) {
        console.error('Error updating advocate:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateAdvocate:', error);
      throw error;
    }
  }
}

export const advocateService = new AdvocateService();
