# Help System - Quick Reference Card

## 🚀 5-Minute Setup

```bash
# No dependencies needed - pure React/TypeScript
# Optional: npm install react-joyride framer-motion
```

```tsx
// 1. Wrap app (AppRouter.tsx)
import { HelpProvider } from '@/contexts/HelpContext';

<HelpProvider>
  <YourApp />
</HelpProvider>

// 2. Add to layout
import { useHelp } from '@/hooks/useHelp';
import { HelpCenter } from '@/components/help';

const { isHelpCenterOpen, closeHelpCenter } = useHelp();

<HelpCenter isOpen={isHelpCenterOpen} onClose={closeHelpCenter} />

// 3. Show onboarding on first visit
import { EnhancedOnboardingWizard } from '@/components/onboarding';

<EnhancedOnboardingWizard isOpen={show} onClose={hide} onComplete={done} />
```

---

## 📚 Common Use Cases

### Open Help Center
```tsx
import { useHelp } from '@/hooks/useHelp';

const { openHelpCenter } = useHelp();

// General help
<Button onClick={() => openHelpCenter()}>Help</Button>

// With search query
<Button onClick={() => openHelpCenter('create invoice')}>
  How to create invoice?
</Button>
```

### Add Contextual Tooltip
```tsx
import { ContextualTooltip } from '@/components/help';

<ContextualTooltip
  id="unique-id"
  title="Quick Tip"
  content="This is helpful information"
  placement="right"
  trigger="hover"
>
  <Button>Action</Button>
</ContextualTooltip>
```

### Start Feature Tour
```tsx
import { useHelp } from '@/hooks/useHelp';

const { startTour } = useHelp();

<Button onClick={() => startTour('invoice-generation')}>
  Learn How
</Button>
```

### Track Feature Discovery
```tsx
import { featureDiscoveryService } from '@/services/feature-discovery.service';

// When feature is first seen
useEffect(() => {
  featureDiscoveryService.markFeatureDiscovered('wip-tracker');
}, []);

// When feature is used
const handleUse = () => {
  featureDiscoveryService.trackFeatureUsage('wip-tracker');
  // ... your logic
};
```

### Show Feature Spotlight
```tsx
import { FeatureSpotlight } from '@/components/help';

<FeatureSpotlight
  id="new-feature-v2"
  targetSelector="#new-button"
  title="New Feature!"
  description="Try our new WIP tracker"
/>
```

### Check Onboarding Status
```tsx
import { useHelp } from '@/hooks/useHelp';

const { isOnboardingComplete, onboardingPhase } = useHelp();

{!isOnboardingComplete && (
  <Alert>Complete setup to unlock all features</Alert>
)}
```

### Get Feature Suggestions
```tsx
import { featureDiscoveryService } from '@/services/feature-discovery.service';

const progress = featureDiscoveryService.getUserProgress();
const suggestions = featureDiscoveryService.getSuggestedFeatures(
  progress.discoveredFeatures
);

{suggestions.map(featureId => (
  <FeatureCard key={featureId} featureId={featureId} />
))}
```

---

## 🎯 Hook API Reference

```tsx
import { useHelp } from '@/hooks/useHelp';

const {
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
  setOnboardingPhase,
  isOnboardingComplete,
  completeOnboarding,
} = useHelp();
```

---

## 🎨 Component Props

### ContextualTooltip
```tsx
interface ContextualTooltipProps {
  id: string;                    // Unique identifier
  content: React.ReactNode;      // Tooltip content
  title?: string;                // Optional title
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';   // How to show
  showOnce?: boolean;            // Show only once
  children: React.ReactNode;     // Wrapped element
}
```

### HelpCenter
```tsx
interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearchQuery?: string;
}
```

### EnhancedOnboardingWizard
```tsx
interface EnhancedOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}
```

### FeatureSpotlight
```tsx
interface FeatureSpotlightProps {
  id: string;
  targetSelector: string;        // CSS selector
  title: string;
  description: string;
  onDismiss?: () => void;
}
```

---

## 🔧 Service Methods

### Feature Discovery Service
```typescript
import { featureDiscoveryService } from '@/services/feature-discovery.service';

// Mark feature as discovered
featureDiscoveryService.markFeatureDiscovered(featureId: string);

// Track feature usage
featureDiscoveryService.trackFeatureUsage(featureId: string);

// Get suggested features
featureDiscoveryService.getSuggestedFeatures(discovered: string[]);

// Dismiss suggestion
featureDiscoveryService.dismissFeatureSuggestion(featureId: string);

// Tour tracking
featureDiscoveryService.trackTourStarted(tourId: string);
featureDiscoveryService.trackTourCompleted(tourId: string);
featureDiscoveryService.trackTourSkipped(tourId: string);

// Get user progress
featureDiscoveryService.getUserProgress();

// Get feature info
featureDiscoveryService.getFeature(featureId: string);
featureDiscoveryService.getFeaturesByTier(tier: 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4');
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `?` | Open Help Center |
| `Esc` | Close any modal/tooltip |

---

## 📊 Feature Tiers

| Tier | Name | Show When | Examples |
|------|------|-----------|----------|
| 1 | Essential | Immediately | Dashboard, Create Matter, Log Services |
| 2 | Core | After 1st matter | Pro Forma, Attorney Connection, Documents |
| 3 | Advanced | After 5 matters or 2 weeks | Templates, Scope Amendments, WIP Tracker |
| 4 | Power User | On-demand | Custom Templates, Advanced Reports |

---

## 🗂️ localStorage Keys

```typescript
// Feature discovery
lexohub_discovered_features        // Array of feature IDs
lexohub_dismissed_suggestions      // Array of dismissed IDs
lexohub_feature_usage              // Map of usage counts

// Onboarding
lexohub_onboarding_phase           // Current phase (1-4)
lexohub_onboarding_complete        // 'true' if done
lexohub_completed_onboarding_steps // Array of step IDs
lexohub_onboarding_dismissed       // 'true' if dismissed

// Tooltips & Spotlights
lexohub_tooltip_shown_{id}         // 'true' if shown
lexohub_spotlight_dismissed_{id}   // 'true' if dismissed
```

---

## 🎬 Example: Complete Feature Implementation

```tsx
import { useEffect } from 'react';
import { useHelp } from '@/hooks/useHelp';
import { ContextualTooltip, FeatureSpotlight } from '@/components/help';
import { featureDiscoveryService } from '@/services/feature-discovery.service';

function WIPTrackerPage() {
  const { startTour } = useHelp();

  // Mark as discovered when user visits
  useEffect(() => {
    featureDiscoveryService.markFeatureDiscovered('wip-tracker');
  }, []);

  const handleViewDetails = (matterId: string) => {
    // Track usage
    featureDiscoveryService.trackFeatureUsage('wip-tracker');
    
    // Your logic
    viewMatter(matterId);
  };

  return (
    <div>
      <h1>WIP Tracker</h1>
      
      {/* Contextual help */}
      <ContextualTooltip
        id="wip-filter-tip"
        content="Filter by matter status, date range, or value"
        placement="bottom"
      >
        <FilterButton />
      </ContextualTooltip>

      {/* Tour button */}
      <Button onClick={() => startTour('wip-management')}>
        Take a Tour
      </Button>

      {/* Feature spotlight for new users */}
      <FeatureSpotlight
        id="wip-tracker-v2"
        targetSelector="#wip-summary-card"
        title="Track Unbilled Work"
        description="See all your work-in-progress in one place"
      />

      {/* Your content */}
      <WIPList onViewDetails={handleViewDetails} />
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Onboarding not showing
```tsx
// Check localStorage
localStorage.getItem('lexohub_onboarding_complete'); // Should be null
localStorage.getItem('lexohub_onboarding_dismissed'); // Should be null

// Force show
localStorage.removeItem('lexohub_onboarding_complete');
localStorage.removeItem('lexohub_onboarding_dismissed');
```

### Help center not opening with `?`
```tsx
// Check HelpProvider is wrapping app
// Check no input is focused when pressing ?
// Check browser console for errors
```

### Tooltips not positioning correctly
```tsx
// Ensure target has stable position
// Check CSS transforms on parents
// Verify z-index hierarchy
// Try different placement prop
```

---

## 📝 Adding New Content

### Add Help Article
```tsx
// In HelpCenter.tsx, add to helpArticles array
{
  id: 'my-article',
  title: 'How to Do Something',
  content: 'Step-by-step instructions...',
  category: 'Category Name',
  tags: ['tag1', 'tag2'],
  videoUrl: 'https://youtube.com/...', // Optional
  relatedArticles: ['other-id'],
  lastUpdated: new Date(),
  popularity: 0,
}
```

### Add Feature to Discovery
```tsx
// In feature-discovery.service.ts, add to features array
{
  id: 'my-feature',
  name: 'My Feature',
  description: 'What it does',
  category: 'tier-2',
  tourId: 'my-feature-tour', // Optional
  prerequisites: ['other-feature'], // Optional
  keywords: ['keyword1', 'keyword2'],
}
```

### Add Onboarding Step
```tsx
// In EnhancedOnboardingWizard.tsx, add to phase steps
{
  id: 'my-step',
  title: 'Do This Thing',
  description: 'Why it matters',
  action: () => {
    // Navigate or show modal
  },
  tourId: 'my-tour', // Optional
  isOptional: true, // Optional
}
```

---

## 🔗 Related Files

- `FEATURE_DENSITY_MITIGATION_PLAN.md` - Strategy overview
- `IMPLEMENTATION_GUIDE_HELP_SYSTEM.md` - Detailed integration guide
- `FEATURE_DENSITY_SOLUTION_COMPLETE.md` - Complete summary
- `HELP_SYSTEM_ARCHITECTURE.md` - Visual diagrams

---

**Print this and keep it handy! 📌**

**Last Updated**: January 2025
