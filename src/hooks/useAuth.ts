/**
 * Authentication Hooks
 * Separated from AuthContext for Fast Refresh compatibility
 */
import { useContext, useEffect } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

// Export hooks as arrow functions for Fast Refresh compatibility
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [user, loading]);

  return { user, loading };
};