/**
 * Help System Types
 * Type definitions for the contextual help and feature discovery system
 */

// Feature Tour Step
export interface TourStep {
  target: string; // CSS selector or element ID
  content: React.ReactNode | string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
  styles?: Record<string, any>;
}

// Feature Tour Configuration
export interface FeatureTour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  category: 'essential' | 'workflow' | 'advanced' | 'power-user';
  prerequisites?: string[]; // IDs of tours that should be completed first
  estimatedDuration?: number; // in minutes
}

// Tooltip Configuration
export interface TooltipConfig {
  id: string;
  target: string;
  content: string | React.ReactNode;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  showOnce?: boolean;
  feature?: string; // Associated feature ID
}

// Feature Definition
export interface Feature {
  id: string;
  name: string;
  description: string;
  category: 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4';
  icon?: string;
  videoUrl?: string;
  documentationUrl?: string;
  tourId?: string;
  prerequisites?: string[];
  keywords?: string[];
}

// Feature Discovery Event
export interface FeatureDiscoveryEvent {
  featureId: string;
  timestamp: Date;
  eventType: 'discovered' | 'used' | 'completed';
  context?: Record<string, any>;
}

// Help Article
export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  videoUrl?: string;
  relatedArticles?: string[];
  lastUpdated: Date;
  popularity?: number;
}

// Help Search Result
export interface HelpSearchResult {
  article: HelpArticle;
  relevanceScore: number;
  matchedKeywords: string[];
}

// Onboarding Phase
export interface OnboardingPhase {
  phase: number;
  name: string;
  description: string;
  steps: OnboardingStep[];
  estimatedDuration: number;
  isOptional: boolean;
}

// Onboarding Step
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action?: () => void | Promise<void>;
  tourId?: string;
  isCompleted: boolean;
  isOptional?: boolean;
}

// Feature Suggestion
export interface FeatureSuggestion {
  featureId: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  dismissed?: boolean;
}

// User Progress
export interface UserProgress {
  discoveredFeatures: string[];
  completedTours: string[];
  onboardingPhase: number;
  isOnboardingComplete: boolean;
  lastActiveDate: Date;
  totalFeatureUsage: number;
}

// Keyboard Shortcut
export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: string;
  action: () => void;
}

export type HelpContentType = 'article' | 'video' | 'tour' | 'tooltip';

export type FeatureTier = 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4';
