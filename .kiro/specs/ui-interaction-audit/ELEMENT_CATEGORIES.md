# UI Element Categorization Guide

This document defines the categorization system used during the audit.

## Status Categories

### ✅ Functional
- Element has proper handler implementation
- Handler includes error handling
- Loading states are present where appropriate
- User feedback is provided (toast, modal, navigation)
- Element is accessible (keyboard, ARIA)
- No bugs or issues detected

### 🔨 Needs Implementation
- Element exists but has no handler
- Handler is a placeholder (empty function, console.log)
- Element is marked with TODO/FIXME
- Functionality is partially complete
- Missing critical features (validation, error handling, loading states)

### 🐛 Needs Fix
- Element has handler but it's broken
- Handler calls non-existent functions
- Broken service integration
- Missing error handling causing crashes
- Incorrect behavior or logic errors
- Accessibility issues

### 🗑️ Should Remove
- Element serves no purpose
- Duplicate functionality
- Deprecated feature
- Placeholder for future feature that won't be implemented
- Confuses users with no action
- Part of removed/deprecated workflow

## Priority Levels

### 🔴 Critical
- Core functionality (matter creation, invoice generation)
- Security-related actions (authentication, authorization)
- Payment/financial actions
- Data loss prevention (save, submit)
- Actions that could corrupt data

### 🟠 High
- Primary user workflows (matter management, time tracking)
- Navigation to key features
- Form submissions
- Modal triggers for important actions
- Bulk operations on important data

### 🟡 Medium
- Secondary features (reports, exports)
- Bulk actions on non-critical data
- Filter/search functionality
- Settings and configuration
- Nice-to-have features

### 🟢 Low
- Cosmetic improvements
- Rarely used functionality
- Deprecated features pending removal
- Minor UX enhancements
- Non-essential tooltips or helpers

## Element Types

### Button
- `<button>` elements
- `<Button>` components
- `<AsyncButton>` components
- Action buttons in cards, tables, modals
- Icon buttons

### Tab
- Tab navigation buttons
- Tab panels/content
- Tab switching logic
- Tab state management

### Link
- `<a>` elements with href
- `<Link>` components (React Router)
- Navigation links
- Breadcrumb links
- In-text links

### Form Action
- Form submit buttons
- Form reset buttons
- Form cancel buttons
- Input change handlers
- Form validation triggers

### Modal Trigger
- Buttons that open modals
- Links that open modals
- Card clicks that open modals
- Context menu items that open modals

### Other
- Dropdown menu items
- Context menu actions
- Keyboard shortcuts
- Drag and drop handlers
- Custom interactive elements

## Verification Checklist

When auditing an element, check:

- [ ] Has event handler (onClick, onSubmit, href, etc.)
- [ ] Handler calls valid function/service
- [ ] Includes error handling (try/catch, error states)
- [ ] Shows loading state during async operations
- [ ] Provides user feedback (toast, modal, navigation)
- [ ] Handles edge cases (empty data, network errors)
- [ ] Is accessible (keyboard navigation, ARIA labels)
- [ ] Has appropriate disabled states
- [ ] Follows existing patterns in codebase
- [ ] Is documented (comments, prop types)

## Example Categorizations

### Example 1: Functional Button
```tsx
<AsyncButton
  onClick={handleSaveMatter}
  loading={isSaving}
  disabled={!isValid}
>
  Save Matter
</AsyncButton>
```
**Status:** ✅ Functional  
**Priority:** 🔴 Critical  
**Type:** Button  
**Notes:** Properly implemented with loading state, validation, and async handling

### Example 2: Needs Implementation
```tsx
<Button onClick={() => console.log('Export clicked')}>
  Export Data
</Button>
```
**Status:** 🔨 Needs Implementation  
**Priority:** 🟡 Medium  
**Type:** Button  
**Notes:** Placeholder handler, needs actual export logic

### Example 3: Needs Fix
```tsx
<Button onClick={() => deleteMatter(matter.id)}>
  Delete
</Button>
```
**Status:** 🐛 Needs Fix  
**Priority:** 🔴 Critical  
**Type:** Button  
**Notes:** Missing confirmation dialog, no error handling, no loading state

### Example 4: Should Remove
```tsx
<Button onClick={() => {}}>
  Coming Soon
</Button>
```
**Status:** 🗑️ Should Remove  
**Priority:** 🟢 Low  
**Type:** Button  
**Notes:** Placeholder for feature that won't be implemented, confuses users
