import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserMetadata {
  user_type: 'junior' | 'senior';
  full_name?: string;
  practice_number?: string;
  chambers?: string;
  experience_years?: number;
  phone_number?: string;
  chambers_address?: string;
  specialisations?: string[];
  year_admitted?: number;
}

export interface AdvocateProfile {
  full_name?: string;
  practice_number?: string;
  specialisations?: string[];
}

export interface ExtendedUser extends User {
  user_metadata: UserMetadata;
  advocate_profile?: AdvocateProfile;
}

class AuthService {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string, metadata: UserMetadata) {
    // Use current origin for development, production URL for production
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUrl = isDevelopment ? window.location.origin : (import.meta.env.VITE_APP_URL || window.location.origin);
    
    console.log('[Auth] Sign up redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${redirectUrl}/#/login?confirmed=true`,
      },
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<ExtendedUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user as ExtendedUser | null;
  }

  async updateProfile(updates: Partial<UserMetadata>) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw error;
    return data;
  }

  async updateAdvocateProfile(updates: Partial<UserMetadata>) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    return { error };
  }

  async refreshSession() {
    const { error } = await supabase.auth.refreshSession();
    return { error };
  }

  async signInWithMagicLink(email: string) {
    // Use current origin for development, production URL for production
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUrl = isDevelopment ? window.location.origin : (import.meta.env.VITE_APP_URL || window.location.origin);
    
    console.log('[Auth] Magic link redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectUrl}/#/login`,
      },
    });
    return { error };
  }

  async resetPassword(email: string) {
    // Use current origin for development, production URL for production
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUrl = isDevelopment ? window.location.origin : (import.meta.env.VITE_APP_URL || window.location.origin);
    
    console.log('[Auth] Reset password redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}/#/reset-password`,
    });
    return { error };
  }

  hasPermission(permission: string): boolean {
    // Basic permission check - can be expanded based on user roles
    return true;
  }

  onAuthStateChange(callback: (user: ExtendedUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = session?.user as ExtendedUser | null;
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }
}

export const authService = new AuthService();
