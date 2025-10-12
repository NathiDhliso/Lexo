/**
 * Unified User Service
 * Replaces advocate.service.ts - queries user_profiles instead of advocates table
 */

import { supabase } from '../../lib/supabase';
import { BaseApiService } from './base-api.service';
import type { UserProfile, UserProfileUpdate, UserProfileCreate } from '../../types/user.types';
import { toast } from 'react-hot-toast';

export class UserService extends BaseApiService<UserProfile> {
  constructor() {
    super('user_profiles');
  }

  /**
   * Get user profile by user_id (auth.users.id)
   */
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }

  /**
   * Get current authenticated user's profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return await this.getUserById(user.id);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user profile by practice number
   */
  async getUserByPracticeNumber(practiceNumber: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('practice_number', practiceNumber)
        .single();

      if (error) {
        console.error('Error fetching user by practice number:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserByPracticeNumber:', error);
      return null;
    }
  }

  /**
   * Get user profile by email
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching user by email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return null;
    }
  }

  /**
   * Create a new user profile
   * Called by handle_new_user trigger or during onboarding
   */
  async createUserProfile(userData: UserProfileCreate): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          ...userData,
          is_active: true,
          notification_preferences: userData.notification_preferences || {
            email: true,
            whatsapp: false,
            sms: false
          },
          invoice_settings: userData.invoice_settings || {
            auto_remind: true,
            reminder_days: [30, 45, 55]
          },
          hourly_rate: userData.hourly_rate || 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        toast.error('Failed to create user profile');
        return null;
      }

      toast.success('User profile created successfully');
      return data;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      toast.error('An error occurred while creating user profile');
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile | null> {
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
        console.error('Error updating user profile:', error);
        toast.error('Failed to update profile');
        return null;
      }

      toast.success('Profile updated successfully');
      return data;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      toast.error('An error occurred while updating profile');
      return null;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error deactivating user:', error);
        toast.error('Failed to deactivate user');
        return false;
      }

      toast.success('User deactivated successfully');
      return true;
    } catch (error) {
      console.error('Error in deactivateUser:', error);
      return false;
    }
  }

  /**
   * Reactivate user
   */
  async reactivateUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error reactivating user:', error);
        toast.error('Failed to reactivate user');
        return false;
      }

      toast.success('User reactivated successfully');
      return true;
    } catch (error) {
      console.error('Error in reactivateUser:', error);
      return false;
    }
  }

  /**
   * Get all active users (for admin/chambers management)
   */
  async getActiveUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveUsers:', error);
      return [];
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  }
}

// Export singleton instance
export const userService = new UserService();

// Backward compatibility: export as advocateService
export const advocateService = userService;
