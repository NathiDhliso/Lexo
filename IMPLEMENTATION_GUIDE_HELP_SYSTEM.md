# Implementation Guide: Feature Density Mitigation System

## Overview
This guide explains how to integrate the feature density mitigation system into your LexoHub application.

## Quick Start

### 1. Add Dependencies

```bash
npm install framer-motion react-joyride
```

### 2. Wrap App with HelpProvider

```tsx
// src/AppRouter.tsx or src/main.tsx
import { HelpProvider } from './contexts/HelpContext';

function App() {
  return (
    <HelpProvider>
      <AuthProvider>
        <ThemeProvider>
          {/* Your app content */}
        </ThemeProvider>
      </AuthProvider>
    </HelpProvider>
  );
}
```

### 3. Add Help Center to Your Layout

```tsx
// src/components/layout/MainLayout.tsx
import { useHelp } from '@/hooks/useHelp';
import { HelpCenter } from '@/components/help';

export function MainLayout() {
  const { isHelpCenterOpen, closeHelpCenter } = useHelp();

  return (
    <div>
      {/* Your layout content */}
      
      {/* Help Center Modal */}
      <HelpCenter
        isOpen={isHelpCenterOpen}
        onClose={closeHelpCenter}
      />
    </div>
  );
}
```

### 4. Add Onboarding Wizard to Dashboard

```tsx
// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { EnhancedOnboardingWizard } from '@/components/onboarding';
import { useHelp } from '@/hooks/useHelp';

export function DashboardPage() {
  const { isOnboardingComplete } = useHelp();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding for new users
    const hasSeenOnboarding = localStorage.getItem('lexohub_onboarding_dismissed');
    if (!isOnboardingComplete && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [isOnboardingComplete]);

  return (
    <div>
      {/* Your dashboard content */}

      {/* Enhanced Onboarding Wizard */}
      <EnhancedOnboardingWizard
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          localStorage.setItem('lexohub_onboarding_dismissed', 'true');
        }}
        onComplete={() => {
          setShowOnboarding(false);
          // Show success toast
        }}
      />
    </div>
  );
}
```

## Usage Examples

### Adding Contextual Tooltips

```tsx
import { ContextualTooltip } from '@/components/help';

function MyFeature() {
  return (
    <div>
      <ContextualTooltip
        id="matter-creation-tip"
        title="Quick Tip"
        content="Use templates to speed up matter creation"
        placement="right"
      >
        <Button>Create Matter</Button>
      </ContextualTooltip>
    </div>
  );
}
```

### Starting a Feature Tour

```tsx
import { useHelp } from '@/hooks/useHelp';

function MyComponent() {
  const { startTour } = useHelp();

  return (
    <Button onClick={() => startTour('invoice-generation')}>
      Learn How to Generate Invoices
    </Button>
  );
}
```

### Opening Help Center with Search

```tsx
import { useHelp } from '@/hooks/useHelp';

function MyComponent() {
  const { openHelpCenter } = useHelp();

  return (
    <Button onClick={() => openHelpCenter('how to create invoice')}>
      Get Help
    </Button>
  );
}
```

### Showing Feature Spotlights

```tsx
import { FeatureSpotlight } from '@/components/help';

function MyPage() {
  return (
    <div>
      {/* Your page content */}

      <FeatureSpotlight
        id="new-wip-tracker"
        targetSelector="#wip-tracker-button"
        title="New: WIP Tracker"
        description="Track your work-in-progress across all matters in one place"
        onDismiss={() => console.log('Spotlight dismissed')}
      />
    </div>
  );
}
```

### Tracking Feature Discovery

```tsx
import { featureDiscoveryService } from '@/services/feature-discovery.service';

function MyFeature() {
  useEffect(() => {
    // Mark feature as discovered when user visits
    featureDiscoveryService.markFeatureDiscovered('wip-tracker');
  }, []);

  const handleFeatureUse = () => {
    // Track when user actually uses the feature
    featureDiscoveryService.trackFeatureUsage('wip-tracker');
  };

  return (
    <Button onClick={handleFeatureUse}>
      Use WIP Tracker
    </Button>
  );
}
```

## Advanced Configuration

### Customizing Onboarding Phases

Edit `src/components/onboarding/EnhancedOnboardingWizard.tsx` to customize:
- Phase names and descriptions
- Steps in each phase
- Optional vs required steps
- Estimated duration

### Adding New Features to Discovery

Edit `src/services/feature-discovery.service.ts`:

```typescript
{
  id: 'my-new-feature',
  name: 'My New Feature',
  description: 'Description of the feature',
  category: 'tier-2', // tier-1, tier-2, tier-3, or tier-4
  tourId: 'my-feature-tour',
  prerequisites: ['create-matter'], // Optional
  keywords: ['keyword1', 'keyword2'],
}
```

### Adding Help Articles

Edit `src/components/help/HelpCenter.tsx` and add to the `helpArticles` array:

```typescript
{
  id: 'my-article',
  title: 'How to Use My Feature',
  content: 'Detailed content here...',
  category: 'My Category',
  tags: ['tag1', 'tag2'],
  videoUrl: 'https://youtube.com/watch?v=example', // Optional
  relatedArticles: ['related-id-1'], // Optional
  lastUpdated: new Date(),
  popularity: 0,
}
```

## Best Practices

### 1. Progressive Disclosure
- Show Tier 1 features immediately
- Introduce Tier 2 features after first matter created
- Unlock Tier 3 features after user demonstrates proficiency
- Offer Tier 4 features on-demand

### 2. Contextual Help
- Add tooltips to complex UI elements
- Use feature spotlights sparingly (max 1 per session)
- Make help searchable with good keywords
- Include video tutorials for complex workflows

### 3. Onboarding
- Keep Phase 1 under 5 minutes
- Make advanced phases optional and skippable
- Offer sample data for exploration
- Allow users to resume later

### 4. Feature Discovery
- Track feature usage to improve suggestions
- Show achievement milestones
- Celebrate user progress
- Don't overwhelm with suggestions (max 3 at a time)

## Keyboard Shortcuts

The following keyboard shortcuts are automatically available:

- `?` - Open Help Center
- `Esc` - Close any modal/tooltip
- `Ctrl+K` - Command bar (if implemented)

## Analytics & Tracking

The system automatically tracks:
- Features discovered
- Features used
- Tours started/completed/skipped
- Help center searches
- Onboarding progress

Access this data via:

```typescript
import { featureDiscoveryService } from '@/services/feature-discovery.service';

const progress = featureDiscoveryService.getUserProgress();
console.log(progress);
```

## Troubleshooting

### Onboarding not showing
- Check localStorage for `lexohub_onboarding_dismissed`
- Verify HelpProvider is wrapping the app
- Check console for errors

### Tooltips not positioning correctly
- Ensure target element has stable position
- Check for CSS transforms on parent elements
- Verify z-index hierarchy

### Feature tours not working
- Install `react-joyride` dependency
- Verify tour IDs match in service and component
- Check target selectors are valid

## Next Steps

1. **Add Video Tutorials**: Record and embed video tutorials in help articles
2. **Implement Feature Tours**: Use react-joyride for interactive walkthroughs
3. **A/B Test Onboarding**: Test different onboarding flows
4. **Collect Feedback**: Add feedback forms in help center
5. **Localization**: Translate help content for international users

## Support

For questions or issues:
- Check help documentation: `/docs/help-system/`
- Open an issue on GitHub
- Contact: dev@lexohub.com

---

**Last Updated**: January 2025
**Version**: 1.0.0
