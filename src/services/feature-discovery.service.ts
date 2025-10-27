/**
 * Feature Discovery Service
 * Tracks feature usage, suggests next features, and manages user progress
 */

import type { 
  Feature, 
  FeatureDiscoveryEvent, 
  FeatureSuggestion,
  UserProgress 
} from '../types/help.types';

class FeatureDiscoveryService {
  private discoveredFeatures: Set<string> = new Set();
  private dismissedSuggestions: Set<string> = new Set();
  private featureUsageCount: Map<string, number> = new Map();
  private tourProgress: Map<string, { started: Date; completed?: Date; skipped?: boolean }> = new Map();

  // Define all features with their categorization
  private features: Feature[] = [
    // Tier 1: Essential Features
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Your central hub for all practice management activities',
      category: 'tier-1',
      tourId: 'dashboard-overview',
      keywords: ['home', 'overview', 'summary', 'start'],
    },
    {
      id: 'create-matter',
      name: 'Create Matter',
      description: 'Start a new legal matter with guided workflow',
      category: 'tier-1',
      tourId: 'matter-creation',
      keywords: ['new', 'case', 'client', 'matter', 'start'],
    },
    {
      id: 'log-services',
      name: 'Log Services',
      description: 'Track billable time and services',
      category: 'tier-1',
      tourId: 'time-tracking',
      keywords: ['time', 'billing', 'hours', 'services'],
    },
    {
      id: 'generate-invoice',
      name: 'Generate Invoice',
      description: 'Create and send professional invoices',
      category: 'tier-1',
      tourId: 'invoice-generation',
      prerequisites: ['create-matter', 'log-services'],
      keywords: ['bill', 'invoice', 'payment', 'charge'],
    },
    
    // Tier 2: Core Workflow
    {
      id: 'proforma-management',
      name: 'Pro Forma Management',
      description: 'Request and approve cost estimates',
      category: 'tier-2',
      tourId: 'proforma-workflow',
      prerequisites: ['create-matter'],
      keywords: ['estimate', 'quote', 'approval', 'proforma'],
    },
    {
      id: 'attorney-connection',
      name: 'Attorney Connection',
      description: 'Connect with attorneys and law firms',
      category: 'tier-2',
      tourId: 'attorney-network',
      keywords: ['attorney', 'lawyer', 'firm', 'network'],
    },
    {
      id: 'document-linking',
      name: 'Document Linking',
      description: 'Link cloud documents to matters',
      category: 'tier-2',
      tourId: 'document-management',
      prerequisites: ['create-matter'],
      keywords: ['documents', 'files', 'cloud', 'storage'],
    },
    {
      id: 'expense-tracking',
      name: 'Expense Tracking',
      description: 'Track disbursements and expenses',
      category: 'tier-2',
      tourId: 'expense-management',
      keywords: ['expenses', 'disbursements', 'costs'],
    },
    
    // Tier 3: Advanced Features
    {
      id: 'brief-fee-templates',
      name: 'Brief Fee Templates',
      description: 'Create reusable fee structures for common matters',
      category: 'tier-3',
      tourId: 'template-management',
      prerequisites: ['create-matter', 'generate-invoice'],
      keywords: ['template', 'fees', 'structure', 'reusable'],
    },
    {
      id: 'scope-amendments',
      name: 'Scope Amendments',
      description: 'Manage changes to matter scope',
      category: 'tier-3',
      tourId: 'scope-management',
      prerequisites: ['proforma-management'],
      keywords: ['scope', 'change', 'amendment', 'variation'],
    },
    {
      id: 'retainer-management',
      name: 'Retainer Management',
      description: 'Manage retainer agreements and draw-downs',
      category: 'tier-3',
      tourId: 'retainer-workflow',
      prerequisites: ['create-matter'],
      keywords: ['retainer', 'advance', 'deposit'],
    },
    {
      id: 'wip-tracker',
      name: 'WIP Tracker',
      description: 'Track work-in-progress across all matters',
      category: 'tier-3',
      tourId: 'wip-management',
      prerequisites: ['log-services'],
      keywords: ['wip', 'progress', 'unbilled', 'pipeline'],
    },
    
    // Tier 4: Power User Features
    {
      id: 'custom-templates',
      name: 'Custom Templates',
      description: 'Create advanced custom templates',
      category: 'tier-4',
      tourId: 'advanced-templates',
      prerequisites: ['brief-fee-templates'],
      keywords: ['custom', 'advanced', 'template'],
    },
    {
      id: 'advanced-reports',
      name: 'Advanced Reports',
      description: 'Generate detailed analytics and reports',
      category: 'tier-4',
      tourId: 'reporting-analytics',
      prerequisites: ['dashboard'],
      keywords: ['reports', 'analytics', 'insights', 'data'],
    },
  ];

  constructor() {
    this.loadPersistedData();
  }

  // Load persisted data from localStorage
  private loadPersistedData(): void {
    try {
      const discovered = localStorage.getItem('lexohub_discovered_features');
      if (discovered) {
        this.discoveredFeatures = new Set(JSON.parse(discovered));
      }

      const dismissed = localStorage.getItem('lexohub_dismissed_suggestions');
      if (dismissed) {
        this.dismissedSuggestions = new Set(JSON.parse(dismissed));
      }

      const usage = localStorage.getItem('lexohub_feature_usage');
      if (usage) {
        this.featureUsageCount = new Map(JSON.parse(usage));
      }
    } catch (error) {
      console.error('Error loading feature discovery data:', error);
    }
  }

  // Persist data to localStorage
  private persistData(): void {
    try {
      localStorage.setItem('lexohub_discovered_features', JSON.stringify([...this.discoveredFeatures]));
      localStorage.setItem('lexohub_dismissed_suggestions', JSON.stringify([...this.dismissedSuggestions]));
      localStorage.setItem('lexohub_feature_usage', JSON.stringify([...this.featureUsageCount]));
    } catch (error) {
      console.error('Error persisting feature discovery data:', error);
    }
  }

  // Mark a feature as discovered
  markFeatureDiscovered(featureId: string): void {
    this.discoveredFeatures.add(featureId);
    this.recordEvent({
      featureId,
      timestamp: new Date(),
      eventType: 'discovered',
    });
    this.persistData();
  }

  // Track feature usage
  trackFeatureUsage(featureId: string): void {
    const currentCount = this.featureUsageCount.get(featureId) || 0;
    this.featureUsageCount.set(featureId, currentCount + 1);
    this.recordEvent({
      featureId,
      timestamp: new Date(),
      eventType: 'used',
    });
    this.persistData();
  }

  // Get suggested features based on discovered features and prerequisites
  getSuggestedFeatures(discoveredFeatureIds: string[]): string[] {
    const discovered = new Set(discoveredFeatureIds);
    const suggestions: FeatureSuggestion[] = [];

    for (const feature of this.features) {
      // Skip if already discovered or dismissed
      if (discovered.has(feature.id) || this.dismissedSuggestions.has(feature.id)) {
        continue;
      }

      // Check if prerequisites are met
      const prerequisitesMet = !feature.prerequisites || 
        feature.prerequisites.every(prereq => discovered.has(prereq));

      if (prerequisitesMet) {
        // Calculate priority based on category
        let priority: 'high' | 'medium' | 'low';
        switch (feature.category) {
          case 'tier-1':
            priority = 'high';
            break;
          case 'tier-2':
            priority = 'high';
            break;
          case 'tier-3':
            priority = 'medium';
            break;
          case 'tier-4':
            priority = 'low';
            break;
        }

        suggestions.push({
          featureId: feature.id,
          reason: this.generateSuggestionReason(feature, discovered),
          priority,
        });
      }
    }

    // Sort by priority and return top 3
    return suggestions
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 3)
      .map(s => s.featureId);
  }

  // Generate contextual reason for suggesting a feature
  private generateSuggestionReason(feature: Feature, _discovered: Set<string>): string {
    if (feature.prerequisites && feature.prerequisites.length > 0) {
      const prerequisiteNames = feature.prerequisites
        .map(id => this.features.find(f => f.id === id)?.name)
        .filter(Boolean)
        .join(' and ');
      return `You've mastered ${prerequisiteNames}. Try ${feature.name} next!`;
    }
    return `Enhance your workflow with ${feature.name}`;
  }

  // Dismiss a feature suggestion
  dismissFeatureSuggestion(featureId: string): void {
    this.dismissedSuggestions.add(featureId);
    this.persistData();
  }

  // Tour tracking
  trackTourStarted(tourId: string): void {
    this.tourProgress.set(tourId, { started: new Date() });
  }

  trackTourCompleted(tourId: string): void {
    const progress = this.tourProgress.get(tourId);
    if (progress) {
      progress.completed = new Date();
    }
  }

  trackTourPaused(_tourId: string): void {
    // Can add pause tracking if needed
  }

  trackTourResumed(_tourId: string): void {
    // Can add resume tracking if needed
  }

  trackTourSkipped(tourId: string): void {
    const progress = this.tourProgress.get(tourId);
    if (progress) {
      progress.skipped = true;
    }
  }

  trackHelpCenterOpened(): void {
    this.trackFeatureUsage('help-center');
  }

  trackOnboardingCompleted(): void {
    localStorage.setItem('lexohub_onboarding_completed_at', new Date().toISOString());
  }

  // Record feature discovery event (can be sent to analytics)
  private recordEvent(event: FeatureDiscoveryEvent): void {
    // In production, send to analytics service
    console.log('Feature Discovery Event:', event);
  }

  // Get user progress summary
  getUserProgress(): UserProgress {
    return {
      discoveredFeatures: [...this.discoveredFeatures],
      completedTours: [...this.tourProgress.entries()]
        .filter(([_, progress]) => progress.completed)
        .map(([tourId, _]) => tourId),
      onboardingPhase: parseInt(localStorage.getItem('lexohub_onboarding_phase') || '1', 10),
      isOnboardingComplete: localStorage.getItem('lexohub_onboarding_complete') === 'true',
      lastActiveDate: new Date(),
      totalFeatureUsage: [...this.featureUsageCount.values()].reduce((sum, count) => sum + count, 0),
    };
  }

  // Get feature by ID
  getFeature(featureId: string): Feature | undefined {
    return this.features.find(f => f.id === featureId);
  }

  // Get all features by tier
  getFeaturesByTier(tier: 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4'): Feature[] {
    return this.features.filter(f => f.category === tier);
  }
}

export const featureDiscoveryService = new FeatureDiscoveryService();
