import { supabase } from '../lib/supabase';
import type { ExtendedUser } from './auth.service';

export interface AdvocateProfile {
  id: string;
  email: string;
  full_name: string;
  initials: string;
  practice_number: string;
  bar: 'johannesburg' | 'cape_town';
  year_admitted: number;
  hourly_rate: number;
  phone_number?: string;
  chambers_address?: string;
  postal_address?: string;
  user_role: 'junior_advocate' | 'senior_advocate' | 'chambers_admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class AdvocateService {
  /**
   * Get advocate profile by user ID
   */
  async getAdvocateProfile(userId: string): Promise<AdvocateProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - advocate doesn't exist
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching advocate profile:', error);
      return null;
    }
  }

  /**
   * Create advocate profile from user data
   */
  async createAdvocateProfile(user: ExtendedUser): Promise<AdvocateProfile | null> {
    try {
      const metadata = user.user_metadata || {};
      
      // Generate practice number if not provided
      const practiceNumber = metadata.practice_number || 
        `TEMP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      // Generate initials from full name
      const fullName = metadata.full_name || user.email?.split('@')[0] || 'New User';
      const nameParts = fullName.split(' ');
      const initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : `${nameParts[0][0]}A`.toUpperCase();

      const advocateData = {
        user_id: user.id,
        email: user.email!,
        full_name: fullName,
        initials,
        practice_number: practiceNumber,
        year_admitted: (metadata as any).year_admitted || new Date().getFullYear(),
        hourly_rate: (metadata as any).hourly_rate || 1500.00,
        phone: (metadata as any).phone_number || null,
        chambers_address: (metadata as any).chambers_address || null,
        postal_address: (metadata as any).postal_address || null,
        user_role: ((metadata as any).user_type === 'senior' ? 'senior_advocate' : 'junior_advocate') as 'junior_advocate' | 'senior_advocate',
        is_active: true
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(advocateData)
        .select()
        .single();

      if (error) {
        console.error('Error creating advocate profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating advocate profile:', error);
      return null;
    }
  }

  /**
   * Ensure advocate profile exists for user
   */
  async ensureAdvocateProfile(user: ExtendedUser): Promise<AdvocateProfile | null> {
    try {
      // First, try to get existing profile
      let profile = await this.getAdvocateProfile(user.id);
      
      // If no profile exists, create one
      if (!profile) {
        console.log('No advocate profile found, creating one...');
        profile = await this.createAdvocateProfile(user);
      }

      return profile;
    } catch (error) {
      console.error('Error ensuring advocate profile:', error);
      return null;
    }
  }

  /**
   * Update advocate profile
   */
  async updateAdvocateProfile(userId: string, updates: Partial<AdvocateProfile>): Promise<AdvocateProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating advocate profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating advocate profile:', error);
      return null;
    }
  }
}

export const advocateService = new AdvocateService();