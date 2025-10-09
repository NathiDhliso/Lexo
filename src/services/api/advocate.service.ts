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
      const { data, error } = await supabase
        .from('advocates')
        .select('*')
        .eq('id', advocateId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching advocate:', error);
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
      const { data, error } = await supabase
        .from('advocates')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error creating advocate:', error);
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
        .from('advocates')
        .update(updates)
        .eq('id', advocateId)
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
