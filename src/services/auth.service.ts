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
  private normalizeAuthBaseUrl(value?: string): string | null {
    const raw = value?.trim();
    if (!raw) return null;

    try {
      const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      return new URL(withProtocol).origin;
    } catch {
      return null;
    }
  }

  private getAuthRedirectBase(): string {
    const currentOrigin = window.location.origin;
    const envBase = this.normalizeAuthBaseUrl(import.meta.env.VITE_APP_URL);

    if (!envBase) return currentOrigin;

    const currentHost = window.location.hostname;
    const envHost = new URL(envBase).hostname;
    const isLocal = (host: string) => host === 'localhost' || host === '127.0.0.1';

    // Ignore localhost env misconfiguration in production browser context.
    if (isLocal(envHost) && !isLocal(currentHost)) {
      return currentOrigin;
    }

    return envBase;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string, metadata: UserMetadata) {
    const redirectUrl = this.getAuthRedirectBase();
    
    console.log('[Auth] Sign up redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${redirectUrl}/?confirmed=true`,
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
    const redirectUrl = this.getAuthRedirectBase();
    
    console.log('[Auth] Magic link redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectUrl}/`,
      },
    });
    return { error };
  }

  async resetPassword(email: string) {
    const redirectUrl = this.getAuthRedirectBase();
    
    console.log('[Auth] Reset password redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}/`,
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
