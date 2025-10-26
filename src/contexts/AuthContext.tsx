/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import React from 'react';
import { authService, type ExtendedUser, type UserMetadata } from '../services/auth.service';
import { advocateService } from '../services/advocate.service';
import type { AuthError } from '@supabase/supabase-js';

export interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  operationLoading: {
    signIn: boolean;
    signUp: boolean;
    signOut: boolean;
    updateProfile: boolean;
  };
  sessionError: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string, metadata: UserMetadata) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserMetadata>) => Promise<{ error: AuthError | Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
  refreshSession: () => Promise<{ error: AuthError | Error | null }>;
  rehydrate: () => Promise<void>;
  clearCache: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState({
    signIn: false,
    signUp: false,
    signOut: false,
    updateProfile: false,
  });
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth with retry logic
  const initializeAuth = useCallback(async () => {
    let mounted = true;

    try {
      const currentUser = await authService.getCurrentUser();
      if (mounted) {
        setUser(currentUser);
        setSessionError(null);
      }
    } catch (error) {
      // Silent fail - no session is expected when user is not logged in
      if (mounted) {
        setUser(null);
        setSessionError(null);
      }
    }
    
    if (mounted) {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Rehydrate auth state
  const rehydrate = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setSessionError(null);
    } catch (error) {
      setSessionError(error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ensure advocate profile exists
  const ensureAdvocateProfile = useCallback(async (user: ExtendedUser) => {
    try {
      await advocateService.ensureAdvocateProfile(user);
    } catch (error) {
      console.error('Failed to ensure advocate profile:', error);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    setUser(null);
    setSessionError(null);
    setOperationLoading({
      signIn: false,
      signUp: false,
      signOut: false,
      updateProfile: false,
    });
  }, []);

  // Session refresh
  const refreshSession = useCallback(async () => {
    try {
      const { error } = await authService.refreshSession();
      if (error) {
        setSessionError(error);
      } else {
        setSessionError(null);
      }
      return { error };
    } catch (error) {
      const err = error as Error;
      setSessionError(err);
      return { error: err };
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    let isInitialized = false;

    const initialize = async () => {
      try {
        setIsInitializing(true);
        const cleanup = await initializeAuth();
        
        if (mounted) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          if (currentUser) {
            // Ensure advocate profile exists for current user
            await ensureAdvocateProfile(currentUser);
          }
          isInitialized = true;
          setLoading(false);
          setIsInitializing(false);
          
          unsubscribe = authService.onAuthStateChange(async (user) => {
            if (mounted) {
              setUser(user);
              if (user) {
                // Ensure advocate profile exists for authenticated users
                await ensureAdvocateProfile(user);
              }
              if (isInitialized) {
                setLoading(false);
              }
            }
          });
        }

        return cleanup;
      } catch (error) {
        // Silent fail - no session is expected when user is not logged in
        if (mounted) {
          setLoading(false);
          setIsInitializing(false);
          setUser(null);
          setSessionError(null);
        }
      }
    };

    initialize();

    const refreshInterval = setInterval(async () => {
      if (mounted && isInitialized) {
        try {
          await refreshSession();
        } catch (error) {
          console.error('Session refresh failed:', error);
        }
      }
    }, 15 * 60 * 1000);

    return () => {
      mounted = false;
      unsubscribe?.();
      clearInterval(refreshInterval);
    };
  }, [initializeAuth, refreshSession, ensureAdvocateProfile]);

  const signIn = async (email: string, password: string) => {
    setOperationLoading(prev => ({ ...prev, signIn: true }));
    try {
      await authService.signIn(email, password);
      return { error: null };
    } catch (error) {
      return { error: error as AuthError | Error };
    } finally {
      setOperationLoading(prev => ({ ...prev, signIn: false }));
    }
  };

  const signInWithMagicLink = async (email: string) => {
    setOperationLoading(prev => ({ ...prev, signIn: true }));
    try {
      const result = await authService.signInWithMagicLink(email);
      return result;
    } catch (error) {
      return { error: error as AuthError | Error };
    } finally {
      setOperationLoading(prev => ({ ...prev, signIn: false }));
    }
  };

  const signUp = async (email: string, password: string, metadata: UserMetadata) => {
    setOperationLoading(prev => ({ ...prev, signUp: true }));
    try {
      await authService.signUp(email, password, metadata);
      return { error: null };
    } catch (error) {
      return { error: error as AuthError | Error };
    } finally {
      setOperationLoading(prev => ({ ...prev, signUp: false }));
    }
  };

  const signOut = async () => {
    setOperationLoading(prev => ({ ...prev, signOut: true }));
    try {
      await authService.signOut();
    } finally {
      setOperationLoading(prev => ({ ...prev, signOut: false }));
    }
  };

  const updateProfile = async (updates: Partial<UserMetadata>) => {
    const previousUser = user;
    
    setUser(current => current ? { ...current, ...updates } : null);
    
    setOperationLoading(prev => ({ ...prev, updateProfile: true }));
    try {
      const { error } = await authService.updateAdvocateProfile(updates);
      
      if (error) {
        setUser(previousUser);
      }
      
      return { error };
    } finally {
      setOperationLoading(prev => ({ ...prev, updateProfile: false }));
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await authService.resetPassword(email);
    return { error };
  };

  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission);
  };

  const value: AuthContextType = {
    user,
    loading,
    isLoading: loading || operationLoading.signIn || operationLoading.signUp || operationLoading.signOut || operationLoading.updateProfile,
    isInitializing,
    operationLoading,
    sessionError,
    signIn,
    signInWithMagicLink,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    refreshSession,
    rehydrate,
    clearCache,
    isAuthenticated: user !== null,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export components and context for Fast Refresh compatibility
export { AuthProvider, AuthContext };
