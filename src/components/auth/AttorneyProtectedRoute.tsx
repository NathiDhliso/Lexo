/**
 * Attorney Protected Route Component
 * Wraps attorney portal components that require authentication
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../design-system/components';

interface AttorneyProtectedRouteProps {
  children: ReactNode;
}

export const AttorneyProtectedRoute: React.FC<AttorneyProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAttorney, setIsAttorney] = useState(false);

  useEffect(() => {
    checkAttorneyAuth();
  }, []);

  const checkAttorneyAuth = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate('/attorney/login');
        return;
      }

      // Check if user is an attorney
      const { data: attorneyData, error: attorneyError } = await supabase
        .from('attorney_users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (attorneyError || !attorneyData) {
        // Not an attorney - redirect to attorney login
        await supabase.auth.signOut();
        navigate('/attorney/login');
        return;
      }

      setIsAttorney(true);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/attorney/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAttorney) {
    return null;
  }

  return <>{children}</>;
};
