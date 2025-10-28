/**
 * AttorneySelectionField Component
 * 
 * Displays attorney selection with two modes:
 * - Manual Selection: Dropdown menu with all attorneys
 * - Favorites Mode: Quick-access buttons for favorite attorneys
 * 
 * Favorites are configured in Settings and display:
 * - 5 attorneys on desktop
 * - 3 attorneys on mobile
 */

import React, { useState, useEffect } from 'react';
import { Star, User, ChevronDown } from 'lucide-react';
import { FormSelect } from '../ui/FormSelect';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

export interface Attorney {
  id: string;
  attorney_name: string;
  email: string;
  phone?: string;
  firm_id: string;
  firm_name?: string;
}

export interface AttorneySelectionFieldProps {
  value?: Attorney | null;
  onChange: (attorney: Attorney | null) => void;
  firmId?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export const AttorneySelectionField: React.FC<AttorneySelectionFieldProps> = ({
  value,
  onChange,
  firmId,
  label = 'Instructing Attorney',
  required = false,
  disabled = false
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'favorites' | 'manual'>('favorites');
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [favoriteAttorneys, setFavoriteAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadAttorneys = React.useCallback(async () => {
    if (!user?.id) {
      console.log('[AttorneySelectionField] No user ID, skipping load');
      return;
    }

    console.log('[AttorneySelectionField] Loading attorneys for user:', user.id);
    setLoading(true);
    try {
      let query = supabase
        .from('attorneys')
        .select(`
          id,
          attorney_name,
          email,
          phone,
          firm_id,
          firms!inner(firm_name, advocate_id)
        `)
        .eq('firms.advocate_id', user.id)
        .order('attorney_name');

      // Filter by firm if provided
      if (firmId) {
        query = query.eq('firm_id', firmId);
      }

      const { data, error } = await query;

      console.log('[AttorneySelectionField] Query result:', { data, error, count: data?.length });

      if (error) throw error;

      // Transform data to include firm_name
      const transformedData = (data || []).map(attorney => ({
        id: attorney.id,
        attorney_name: attorney.attorney_name,
        email: attorney.email,
        phone: attorney.phone,
        firm_id: attorney.firm_id,
        firm_name: (attorney.firms as any)?.firm_name
      }));

      console.log('[AttorneySelectionField] Transformed attorneys:', transformedData);
      setAttorneys(transformedData);
    } catch (error) {
      console.error('[AttorneySelectionField] Error loading attorneys:', error);
      toast.error('Failed to load attorneys');
    } finally {
      setLoading(false);
    }
  }, [user?.id, firmId]);

  const loadFavoriteAttorneys = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      // Load favorite attorney IDs from user preferences
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('favorite_attorneys')
        .eq('advocate_id', user.id)
        .single();

      if (prefError && prefError.code !== 'PGRST116') throw prefError;

      const favoriteIds = preferences?.favorite_attorneys || [];
      
      if (favoriteIds.length === 0) {
        setFavoriteAttorneys([]);
        return;
      }

      // Load the favorite attorneys with their details
      const { data: favorites, error } = await supabase
        .from('attorneys')
        .select(`
          id,
          attorney_name,
          email,
          phone,
          firm_id,
          firms!inner(firm_name)
        `)
        .in('id', favoriteIds)
        .order('attorney_name');

      if (error) throw error;

      // Transform and limit based on screen size
      const transformed = (favorites || []).map(attorney => ({
        id: attorney.id,
        attorney_name: attorney.attorney_name,
        email: attorney.email,
        phone: attorney.phone,
        firm_id: attorney.firm_id,
        firm_name: (attorney.firms as any)?.firm_name
      }));

      // Limit to 5 on desktop, 3 on mobile
      const limit = isMobile ? 3 : 5;
      setFavoriteAttorneys(transformed.slice(0, limit));
    } catch (error) {
      console.error('Error loading favorite attorneys:', error);
    }
  }, [user?.id, isMobile]);

  // Load attorneys and favorites
  useEffect(() => {
    console.log('[AttorneySelectionField] useEffect triggered, user:', user?.id, 'firmId:', firmId);
    if (user?.id) {
      loadAttorneys();
      loadFavoriteAttorneys();
    }
  }, [user?.id, firmId, loadAttorneys, loadFavoriteAttorneys]);

  const handleFavoriteSelect = (attorney: Attorney) => {
    onChange(attorney);
  };

  const handleManualSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const attorneyId = e.target.value;
    if (!attorneyId) {
      onChange(null);
      return;
    }

    const selected = attorneys.find(a => a.id === attorneyId);
    if (selected) {
      onChange(selected);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'favorites' ? 'manual' : 'favorites');
  };

  // Debug render
  console.log('[AttorneySelectionField] Render state:', {
    mode,
    loading,
    attorneysCount: attorneys.length,
    favoritesCount: favoriteAttorneys.length,
    hasValue: !!value
  });

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleMode}
          disabled={disabled}
          className="flex items-center gap-2 text-xs"
        >
          {mode === 'favorites' ? (
            <>
              <ChevronDown className="w-3 h-3" />
              Show All
            </>
          ) : (
            <>
              <Star className="w-3 h-3" />
              Show Favorites
            </>
          )}
        </Button>
      </div>

      {/* Favorites Mode */}
      {mode === 'favorites' && (
        <div className="space-y-3">
          {favoriteAttorneys.length === 0 ? (
            <div className="text-center py-8 px-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border-2 border-dashed border-neutral-300 dark:border-metallic-gray-600">
              <Star className="w-8 h-8 mx-auto mb-2 text-neutral-400 dark:text-neutral-500" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                No favorite attorneys configured
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleMode}
              >
                Select from all attorneys
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {favoriteAttorneys.map((attorney) => (
                <button
                  key={attorney.id}
                  type="button"
                  onClick={() => handleFavoriteSelect(attorney)}
                  disabled={disabled}
                  className={`
                    w-full px-4 py-3 text-left rounded-lg border-2 transition-all
                    ${value?.id === attorney.id
                      ? 'border-judicial-blue-500 bg-judicial-blue-50 dark:bg-judicial-blue-900/20'
                      : 'border-neutral-200 dark:border-metallic-gray-600 hover:border-judicial-blue-300 dark:hover:border-judicial-blue-700 bg-white dark:bg-metallic-gray-800'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <User className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {attorney.attorney_name}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                        {attorney.firm_name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-500 truncate mt-1">
                        {attorney.email}
                      </div>
                    </div>
                    {value?.id === attorney.id && (
                      <div className="mt-1">
                        <div className="w-5 h-5 rounded-full bg-judicial-blue-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Selection Mode */}
      {mode === 'manual' && (
        <FormSelect
          value={value?.id || ''}
          onChange={handleManualSelect}
          disabled={disabled || loading}
          required={required}
        >
          <option value="">
            {loading ? 'Loading attorneys...' : 'Select an attorney'}
          </option>
          {attorneys.map((attorney) => (
            <option key={attorney.id} value={attorney.id}>
              {attorney.attorney_name} - {attorney.firm_name}
            </option>
          ))}
        </FormSelect>
      )}

      {/* Selected Attorney Details (when in manual mode) */}
      {mode === 'manual' && value && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
            Selected Attorney
          </p>
          <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
            <p><strong>Name:</strong> {value.attorney_name}</p>
            <p><strong>Firm:</strong> {value.firm_name}</p>
            <p><strong>Email:</strong> {value.email}</p>
            {value.phone && <p><strong>Phone:</strong> {value.phone}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
