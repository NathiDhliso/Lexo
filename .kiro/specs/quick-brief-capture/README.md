# Quick Brief Capture Feature Spec

## Overview

The Quick Brief Capture feature enhances the existing QuickAddMatterModal to provide advocates with a streamlined, phone-optimized interface for capturing matter details when attorneys call them. This addresses the "Path B" workflow where advocates need to quickly accept and document briefs without requiring the attorney to use the portal.

## Problem Statement

When attorneys call advocates to brief them on matters, advocates need a fast way to capture essential details while on the phone. The current QuickAddMatterModal is a simple form that requires typing all information, which is slow and error-prone during a phone conversation.

## Solution

Transform the QuickAddMatterModal into an intelligent, multi-step questionnaire with:
- **Preconfigured answer buttons** for quick selection
- **Custom template management** that learns from advocate's usage patterns
- **6-step guided flow** optimized for phone conversations
- **Mobile-first design** with large touch targets
- **Auto-save functionality** to prevent data loss
- **Immediate matter activation** (Path B - no pro forma needed)

## Key Features

### 1. Multi-Step Questionnaire (6 Steps)
1. **Attorney & Firm**: Select from existing contacts or quick add new
2. **Matter Title**: Use templates or enter custom title
3. **Type of Work**: Opinion, Court Appearance, Drafting, etc.
4. **Practice Area**: Labour Law, Commercial, Tax, etc.
5. **Urgency/Deadline**: Auto-calculate deadline based on urgency
6. **Brief Summary**: Use issue templates with editable text

### 2. Preconfigured Answer Buttons
- Large, touch-friendly buttons (min 44x44px)
- Visual selection indicators (checkmarks)
- Usage frequency tracking (⭐ for most used)
- Custom answer support with auto-save

### 3. Template Management
- Store custom templates per advocate
- Merge with system defaults
- Sort by usage frequency
- Import/export functionality
- Edit/delete in settings

### 4. Mobile Optimization
- Responsive layout for all screen sizes
- Vertical scrolling when needed
- Keyboard-aware positioning
- Safe area insets for notched devices

### 5. Accessibility
- Full keyboard navigation
- Screen reader support
- ARIA labels and descriptions
- Visible focus indicators

## Technical Architecture

### Database Schema
- **New Table**: `advocate_quick_templates`
  - Stores custom templates per advocate
  - Tracks usage count and last used date
  - Categorized by template type

### Services
- **QuickBriefTemplateService**: Template CRUD operations
- **Enhanced MatterApiService**: `createFromQuickBrief()` method

### Components
- **QuickBriefCaptureModal**: Main modal with multi-step navigation
- **ProgressIndicator**: Visual step progress
- **AnswerButtonGrid**: Reusable button grid with custom input
- **6 Step Components**: Specialized components for each question

## User Flow

```
1. Advocate clicks "Quick Brief Entry" button
2. Modal opens with Step 1 (Attorney & Firm)
3. Advocate selects firm from dropdown
4. Attorney details auto-populate
5. Advocate clicks "Next"
6. Step 2 displays (Matter Title)
7. Advocate clicks template button or types custom
8. Advocate clicks "Next"
9. Steps 3-5 repeat pattern
10. Step 6 displays (Brief Summary)
11. Advocate clicks issue template, edits text
12. Advocate clicks "Save & Accept Brief"
13. Matter created with status "Active"
14. Navigate to Matter Workbench
```

## Success Criteria

✅ Advocate can capture a brief in under 2 minutes while on the phone  
✅ Custom answers are saved and reappear next time  
✅ Matter is immediately active (no approval needed - this is Path B)  
✅ Works seamlessly on desktop and mobile  
✅ Integrates with existing MattersPage without breaking anything  
✅ Code follows existing patterns (reuses components/hooks)  

## Implementation Status

- [x] Requirements documented
- [x] Design completed
- [x] Tasks defined
- [ ] Implementation in progress
- [ ] Testing
- [ ] Deployment

## Related Documents

- [Requirements](./requirements.md) - Detailed user stories and acceptance criteria
- [Design](./design.md) - Technical design and architecture
- [Tasks](./tasks.md) - Implementation task list

## Dependencies

- Existing QuickAddMatterModal component
- MatterApiService
- Firms table and data
- Modal, Button, FormInput UI components
- useModalState, useForm hooks

## Timeline

**Estimated Duration**: 3-4 weeks

- Week 1: Database setup, service layer, core components
- Week 2: Step components, modal integration
- Week 3: Settings page, mobile optimization, accessibility
- Week 4: Testing, documentation, deployment

## Notes

- This feature is designed for SPEED - every click should be fast
- The advocate is on the phone with an attorney - UI must be intuitive
- Reuse existing components wherever possible
- Follow LexoHub design system (judicial-blue, mpondo-gold colors)
- Ensure dark mode support throughout

## Questions or Issues?

Contact the development team or refer to the detailed design document for technical specifications.
