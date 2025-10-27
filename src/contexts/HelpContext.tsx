/**
 * HelpContext - Provides contextual help and feature discovery throughout the app
 * 
 * Features:
 * - Tooltip management
 * - Feature tours
 * - Help center modal
 * - Feature discovery tracking
 * - Progress persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { featureDiscoveryService } from '../services/feature-discovery.service';
import type { FeatureTour, TooltipConfig } from '../types/help.types';

interface HelpContextValue {
  // Tooltip Management
  activeTooltip: string | null;
  showTooltip: (tooltipId: string) => void;
  hideTooltip: () => void;
  
  // Feature Tours
  activeTour: string | null;
  startTour: (tourId: string) => void;
  endTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  skipTour: () => void;
  
  // Help Center
  isHelpCenterOpen: boolean;
  openHelpCenter: (searchQuery?: string) => void;
  closeHelpCenter: () => void;
  
  // Feature Discovery
  discoveredFeatures: Set<string>;
  markFeatureDiscovered: (featureId: string) => void;
  suggestedFeatures: string[];
  dismissFeatureSuggestion: (featureId: string) => void;
  
  // Progress Tracking
  onboardingPhase: number;
  setOnboardingPhase: (phase: number) => void;
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
}

const HelpContext = createContext<HelpContextValue | undefined>(undefined);

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Management
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [_helpSearchQuery, setHelpSearchQuery] = useState('');
  const [discoveredFeatures, setDiscoveredFeatures] = useState<Set<string>>(new Set());
  const [suggestedFeatures, setSuggestedFeatures] = useState<string[]>([]);
  const [onboardingPhase, setOnboardingPhase] = useState(1);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        const discovered = localStorage.getItem('lexohub_discovered_features');
        if (discovered) {
          setDiscoveredFeatures(new Set(JSON.parse(discovered)));
        }

        const phase = localStorage.getItem('lexohub_onboarding_phase');
        if (phase) {
          setOnboardingPhase(parseInt(phase, 10));
        }

        const complete = localStorage.getItem('lexohub_onboarding_complete');
        if (complete === 'true') {
          setIsOnboardingComplete(true);
        }
      } catch (error) {
        console.error('Error loading help state:', error);
      }
    };

    loadPersistedState();
  }, []);

  // Persist discovered features
  useEffect(() => {
    if (discoveredFeatures.size > 0) {
      localStorage.setItem('lexohub_discovered_features', JSON.stringify([...discoveredFeatures]));
    }
  }, [discoveredFeatures]);

  // Tooltip Management
  const showTooltip = useCallback((tooltipId: string) => {
    setActiveTooltip(tooltipId);
  }, []);

  const hideTooltip = useCallback(() => {
    setActiveTooltip(null);
  }, []);

  // Feature Tours
  const startTour = useCallback((tourId: string) => {
    setActiveTour(tourId);
    featureDiscoveryService.trackTourStarted(tourId);
  }, []);

  const endTour = useCallback(() => {
    if (activeTour) {
      featureDiscoveryService.trackTourCompleted(activeTour);
    }
    setActiveTour(null);
  }, [activeTour]);

  const pauseTour = useCallback(() => {
    if (activeTour) {
      featureDiscoveryService.trackTourPaused(activeTour);
    }
  }, [activeTour]);

  const resumeTour = useCallback(() => {
    if (activeTour) {
      featureDiscoveryService.trackTourResumed(activeTour);
    }
  }, [activeTour]);

  const skipTour = useCallback(() => {
    if (activeTour) {
      featureDiscoveryService.trackTourSkipped(activeTour);
    }
    setActiveTour(null);
  }, [activeTour]);

  // Help Center
  const openHelpCenter = useCallback((searchQuery?: string) => {
    setIsHelpCenterOpen(true);
    if (searchQuery) {
      setHelpSearchQuery(searchQuery);
    }
    featureDiscoveryService.trackHelpCenterOpened();
  }, []);

  const closeHelpCenter = useCallback(() => {
    setIsHelpCenterOpen(false);
    setHelpSearchQuery('');
  }, []);

  // Feature Discovery
  const markFeatureDiscovered = useCallback((featureId: string) => {
    setDiscoveredFeatures(prev => {
      const newSet = new Set(prev);
      newSet.add(featureId);
      return newSet;
    });
    featureDiscoveryService.markFeatureDiscovered(featureId);
  }, []);

  const dismissFeatureSuggestion = useCallback((featureId: string) => {
    setSuggestedFeatures(prev => prev.filter(id => id !== featureId));
    featureDiscoveryService.dismissFeatureSuggestion(featureId);
  }, []);

  // Update suggested features based on discovered features
  useEffect(() => {
    const suggestions = featureDiscoveryService.getSuggestedFeatures([...discoveredFeatures]);
    setSuggestedFeatures(suggestions);
  }, [discoveredFeatures]);

  // Onboarding Progress
  const handleSetOnboardingPhase = useCallback((phase: number) => {
    setOnboardingPhase(phase);
    localStorage.setItem('lexohub_onboarding_phase', phase.toString());
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsOnboardingComplete(true);
    localStorage.setItem('lexohub_onboarding_complete', 'true');
    featureDiscoveryService.trackOnboardingCompleted();
  }, []);

  // Keyboard Shortcut: ? for help
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Open help center on '?' key (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        openHelpCenter();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [openHelpCenter]);

  const value: HelpContextValue = {
    // Tooltips
    activeTooltip,
    showTooltip,
    hideTooltip,
    
    // Tours
    activeTour,
    startTour,
    endTour,
    pauseTour,
    resumeTour,
    skipTour,
    
    // Help Center
    isHelpCenterOpen,
    openHelpCenter,
    closeHelpCenter,
    
    // Feature Discovery
    discoveredFeatures,
    markFeatureDiscovered,
    suggestedFeatures,
    dismissFeatureSuggestion,
    
    // Onboarding
    onboardingPhase,
    setOnboardingPhase: handleSetOnboardingPhase,
    isOnboardingComplete,
    completeOnboarding,
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
};

// Export the useHelp hook
export function useHelp(): HelpContextValue {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within HelpProvider');
  }
  return context;
}
