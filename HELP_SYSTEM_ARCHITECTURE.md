# Feature Density Mitigation - System Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         App Root                            │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │             HelpProvider (Context)                  │   │
│  │  • Global state management                          │   │
│  │  • Keyboard shortcuts (?)                           │   │
│  │  • Progress tracking                                │   │
│  │  • Feature discovery                                │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │          Main Application Layout             │  │   │
│  │  │                                               │  │   │
│  │  │  ┌──────────────────────────────────────┐   │  │   │
│  │  │  │      Dashboard / Pages               │   │  │   │
│  │  │  │                                       │   │  │   │
│  │  │  │  • ContextualTooltip components      │   │  │   │
│  │  │  │  • FeatureSpotlight overlays         │   │  │   │
│  │  │  │  • Feature tracking calls            │   │  │   │
│  │  │  └──────────────────────────────────────┘   │  │   │
│  │  │                                               │  │   │
│  │  │  ┌──────────────────────────────────────┐   │  │   │
│  │  │  │   Modals (rendered at root level)    │   │  │   │
│  │  │  │                                       │   │  │   │
│  │  │  │  • HelpCenter                        │   │  │   │
│  │  │  │  • EnhancedOnboardingWizard          │   │  │   │
│  │  │  │  • OnboardingChecklist               │   │  │   │
│  │  │  └──────────────────────────────────────┘   │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────────────┐
│   User Interaction   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    useHelp() Hook    │
│  • showTooltip()     │
│  • startTour()       │
│  • openHelpCenter()  │
│  • markDiscovered()  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    HelpContext       │
│  • State updates     │
│  • Event handlers    │
└──────────┬───────────┘
           │
           ├─────────────────────┐
           │                     │
           ▼                     ▼
┌──────────────────────┐  ┌─────────────────────┐
│  Feature Discovery   │  │   localStorage      │
│      Service         │  │  • Progress         │
│  • Track usage       │  │  • Dismissed items  │
│  • Suggest features  │  │  • Completed steps  │
│  • Calculate tier    │  └─────────────────────┘
└──────────────────────┘
```

## Feature Discovery Flow

```
User Action
    │
    ▼
Feature Used ────────────────────────────────┐
    │                                        │
    ▼                                        ▼
Mark as Discovered               Track Usage Count
    │                                        │
    ▼                                        │
Check Prerequisites Met                     │
    │                                        │
    ▼                                        │
Calculate Suggested Features ◄──────────────┘
    │
    ├─── Tier 1: Essential (show immediately)
    ├─── Tier 2: Core (after 1st matter)
    ├─── Tier 3: Advanced (after 5 matters or 2 weeks)
    └─── Tier 4: Power User (on-demand)
    │
    ▼
Display Suggestions (max 3)
```

## Onboarding Flow

```
First Login
    │
    ▼
Check localStorage
    │
    ├─── Has Dismissed? ──► Skip
    │
    └─── New User ────┐
                      │
                      ▼
            ┌─────────────────┐
            │    Phase 1      │
            │ Essential Setup │
            │    (5 min)      │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │    Phase 2      │
            │  Core Workflow  │
            │    (15 min)     │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │    Phase 3      │
            │    Advanced     │
            │  (20 min, opt)  │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │    Phase 4      │
            │   Power User    │
            │  (30 min, opt)  │
            └────────┬────────┘
                     │
                     ▼
               Complete! 🎉
```

## Help Access Points

```
User Needs Help
    │
    ├─── Press "?" Key ──────────────────► HelpCenter Modal
    │                                       • Search articles
    │                                       • Browse categories
    │                                       • Quick actions
    │
    ├─── Hover UI Element ──────────────► ContextualTooltip
    │                                       • Inline help
    │                                       • Show once option
    │
    ├─── Click "Help" Button ───────────► HelpCenter Modal
    │                                       • Specific article
    │                                       • Video tutorial
    │
    ├─── New Feature Discovered ────────► FeatureSpotlight
    │                                       • Animated highlight
    │                                       • Dismissible
    │
    └─── Suggested Feature Panel ───────► Feature Card
                                           • Reason shown
                                           • Start tour button
                                           • Dismiss option
```

## State Management

```
┌─────────────────────────────────────────────────────────┐
│                    HelpContext State                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tooltips:                                              │
│  • activeTooltip: string | null                         │
│                                                         │
│  Tours:                                                 │
│  • activeTour: string | null                            │
│  • tourProgress: Map<tourId, status>                    │
│                                                         │
│  Help Center:                                           │
│  • isHelpCenterOpen: boolean                            │
│  • searchQuery: string                                  │
│                                                         │
│  Feature Discovery:                                     │
│  • discoveredFeatures: Set<featureId>                   │
│  • suggestedFeatures: string[]                          │
│  • dismissedSuggestions: Set<featureId>                 │
│                                                         │
│  Onboarding:                                            │
│  • onboardingPhase: number (1-4)                        │
│  • completedSteps: Set<stepId>                          │
│  • isOnboardingComplete: boolean                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Persisted to
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    localStorage                          │
├─────────────────────────────────────────────────────────┤
│  • lexohub_discovered_features                          │
│  • lexohub_onboarding_phase                             │
│  • lexohub_onboarding_complete                          │
│  • lexohub_completed_onboarding_steps                   │
│  • lexohub_dismissed_suggestions                        │
│  • lexohub_tooltip_shown_{id}                           │
│  • lexohub_spotlight_dismissed_{id}                     │
└─────────────────────────────────────────────────────────┘
```

## Feature Tier System

```
┌─────────────────────────────────────────────────────────┐
│                    All 200+ Features                    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Tier 1  │  │  Tier 2  │  │  Tier 3  │  │  Tier 4  │
│Essential │  │   Core   │  │ Advanced │  │  Power   │
│  5 feat  │  │  8 feat  │  │ 10 feat  │  │  Rest    │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │
     │             │             │             │
     ▼             │             │             │
Show Immediately   │             │             │
     │             │             │             │
     │             ▼             │             │
     │      After 1st Matter    │             │
     │      OR                   │             │
     │      Prerequisites Met    │             │
     │             │             │             │
     │             │             ▼             │
     │             │      After 5 Matters     │
     │             │      OR                   │
     │             │      2 Weeks Active       │
     │             │             │             │
     │             │             │             ▼
     │             │             │      On-Demand
     │             │             │      Discovery
     │             │             │             │
     └─────────────┴─────────────┴─────────────┘
                          │
                          ▼
                  User Dashboard
                  • All discovered features visible
                  • Suggestions for next features
                  • Search to find any feature
```

## Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                  Existing LexoHub App                   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ AppRouter│  │  Layout  │  │  Pages   │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     │             │             │
     │ Wrap with   │ Add Help    │ Add Tooltips
     │ Provider    │ Center      │ & Tracking
     │             │             │
     ▼             ▼             ▼
┌──────────────────────────────────────────────────────────┐
│                  New Help System                         │
│  • HelpProvider wraps entire app                         │
│  • HelpCenter modal in layout                            │
│  • ContextualTooltip on complex UI                       │
│  • FeatureSpotlight for announcements                    │
│  • EnhancedOnboardingWizard on first visit               │
│  • featureDiscoveryService tracks all usage              │
└──────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── contexts/
│   └── HelpContext.tsx                    (State management)
│
├── hooks/
│   └── useHelp.ts                         (Custom hook)
│
├── services/
│   └── feature-discovery.service.ts       (Feature tracking)
│
├── types/
│   └── help.types.ts                      (TypeScript types)
│
└── components/
    ├── help/
    │   ├── HelpCenter.tsx                 (Main help UI)
    │   ├── ContextualTooltip.tsx          (Inline help)
    │   └── index.ts                       (Barrel export)
    │
    └── onboarding/
        ├── EnhancedOnboardingWizard.tsx   (4-phase wizard)
        └── OnboardingChecklist.tsx        (Existing)
```

---

**Legend**:
- `─` Flow direction
- `│` Vertical connection
- `┌┐└┘` Boxes/containers
- `▼` Process flow
- `►` Decision outcome
- `•` List items

---

This architecture provides:
✅ **Separation of concerns** - Each component has a single responsibility
✅ **Reusability** - Components can be used independently
✅ **Scalability** - Easy to add new features/help content
✅ **Performance** - Lazy loading and efficient state management
✅ **Maintainability** - Clear structure and documented code
