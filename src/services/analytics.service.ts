/**
 * Analytics Service
 * 
 * Privacy-compliant analytics tracking for user interactions
 * Tracks button clicks, navigation, form submissions, and errors
 */

export interface AnalyticsEvent {
  category: 'button' | 'navigation' | 'form' | 'error' | 'user_flow';
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface UserPreferences {
  analyticsEnabled: boolean;
  performanceTracking: boolean;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userPreferences: UserPreferences = {
    analyticsEnabled: true,
    performanceTracking: true,
  };
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadUserPreferences();
  }

  /**
   * Initialize analytics with user ID
   */
  initialize(userId?: string) {
    this.userId = userId;
    this.trackEvent({
      category: 'user_flow',
      action: 'session_start',
      metadata: {
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Set user preferences for analytics
   */
  setUserPreferences(preferences: Partial<UserPreferences>) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    localStorage.setItem('analytics_preferences', JSON.stringify(this.userPreferences));
  }

  /**
   * Load user preferences from storage
   */
  private loadUserPreferences() {
    try {
      const stored = localStorage.getItem('analytics_preferences');
      if (stored) {
        this.userPreferences = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics preferences:', error);
    }
  }

  /**
   * Check if analytics is enabled
   */
  private isEnabled(): boolean {
    return this.userPreferences.analyticsEnabled;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track a generic event
   */
  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>) {
    if (!this.isEnabled()) {
      return;
    }

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(fullEvent);

    // In production, send to analytics backend
    if (process.env.NODE_ENV === 'production') {
      this.sendToBackend(fullEvent);
    } else {
      console.log('[Analytics]', fullEvent);
    }
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonLabel: string, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'button',
      action: 'click',
      label: buttonLabel,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Track navigation event
   */
  trackNavigation(from: string, to: string, method: 'click' | 'programmatic' = 'click') {
    this.trackEvent({
      category: 'navigation',
      action: 'navigate',
      label: `${from} -> ${to}`,
      metadata: {
        from,
        to,
        method,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmission(
    formName: string,
    success: boolean,
    metadata?: Record<string, any>
  ) {
    this.trackEvent({
      category: 'form',
      action: success ? 'submit_success' : 'submit_error',
      label: formName,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Track form field interaction
   */
  trackFormField(formName: string, fieldName: string, action: 'focus' | 'blur' | 'change') {
    this.trackEvent({
      category: 'form',
      action: `field_${action}`,
      label: `${formName}.${fieldName}`,
      metadata: {
        formName,
        fieldName,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Track error event
   */
  trackError(
    errorType: string,
    errorMessage: string,
    metadata?: Record<string, any>
  ) {
    this.trackEvent({
      category: 'error',
      action: errorType,
      label: errorMessage,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Track user flow milestone
   */
  trackUserFlow(flowName: string, step: string, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'user_flow',
      action: 'step_complete',
      label: `${flowName}:${step}`,
      metadata: {
        flowName,
        step,
        ...metadata,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'navigation',
      action: 'page_view',
      label: pageName,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Track search query
   */
  trackSearch(query: string, resultsCount: number, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'user_flow',
      action: 'search',
      label: query,
      value: resultsCount,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName: string, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'user_flow',
      action: 'feature_used',
      label: featureName,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName: string, value: number, metadata?: Record<string, any>) {
    if (!this.userPreferences.performanceTracking) {
      return;
    }

    this.trackEvent({
      category: 'user_flow',
      action: 'performance',
      label: metricName,
      value,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    });
  }

  /**
   * Get all tracked events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: AnalyticsEvent['category']): AnalyticsEvent[] {
    return this.events.filter((event) => event.category === category);
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Export events as JSON
   */
  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Send event to analytics backend
   */
  private async sendToBackend(event: AnalyticsEvent) {
    try {
      // In production, replace with actual analytics endpoint
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
      
      // For now, just log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics Backend]', event);
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  /**
   * End session
   */
  endSession() {
    this.trackEvent({
      category: 'user_flow',
      action: 'session_end',
      metadata: {
        sessionId: this.sessionId,
        userId: this.userId,
        eventCount: this.events.length,
      },
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export helper hooks for React components
export const useAnalytics = () => {
  return {
    trackButtonClick: analyticsService.trackButtonClick.bind(analyticsService),
    trackNavigation: analyticsService.trackNavigation.bind(analyticsService),
    trackFormSubmission: analyticsService.trackFormSubmission.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
    trackUserFlow: analyticsService.trackUserFlow.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackSearch: analyticsService.trackSearch.bind(analyticsService),
    trackFeatureUsage: analyticsService.trackFeatureUsage.bind(analyticsService),
  };
};
