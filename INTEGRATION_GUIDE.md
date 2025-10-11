# LexoHub UI/UX Integration Guide

## 🎯 Overview

This guide provides complete instructions for integrating the new UI/UX components into LexoHub. All components are production-ready and can be used immediately.

## 📦 Available Components

### Core Components (src/components/ui/)
- **Button** - 5 variants, 3 sizes, full accessibility
- **AsyncButton** - Automatic async handling with loading states
- **Toast** - 4 types (success, error, warning, info)
- **ToastContainer** - Global toast management
- **Modal** - 6 sizes with focus trap
- **ConfirmationDialog** - 3 pre-styled variants
- **FormInput** - Input with validation display
- **Spinner** - Loading indicator
- **SkeletonLoader** - Content placeholder
- **LoadingOverlay** - Full-screen loading
- **ProgressBar** - Progress indicator
- **Pagination** - Page navigation

### Hooks (src/hooks/)
- **useModalState** - Modal state management
- **useConfirmation** - Promise-based confirmations
- **useForm** - Form validation and state
- **useSearch** - Search functionality
- **useFilter** - Filter management

### Services (src/services/)
- **toastService** - Global notifications
- **error-handler.service** - Error management

### Context (src/contexts/)
- **ModalContext** - Centralized modal management

## 🚀 Quick Start

### 1. Import Components

```tsx
// Buttons
import { Button, AsyncButton } from '@/components/ui';

// Modals
import { Modal, ConfirmationDialog } from '@/components/ui';

// Forms
import { FormInput } from '@/components/ui';

// Loading
import { Spinner, LoadingOverlay, ProgressBar } from '@/components/ui';

// Hooks
import { useModalState, useConfirmation, useForm } from '@/hooks';

// Services
import { toastService } from '@/services/toast.service';
```

### 2. Add ToastContainer to App

```tsx
// In App.tsx or AppRouter.tsx
import { ToastContainer } from '@/components/ui';

function App() {
  return (
    <>
      <YourApp />
      <ToastContainer position="top-right" />
    </>
  );
}
```

### 3. Wrap with ModalProvider (Optional)

```tsx
// For advanced modal management
import { ModalProvider } from '@/contexts/ModalContext';

function App() {
  return (
    <ModalProvider>
      <YourApp />
    </ModalProvider>
  );
}
```

## 📝 Usage Examples

### Buttons

```tsx
// Primary button
<Button variant="primary" onClick={handleSave}>
  Save Changes
</Button>

// Async button with automatic loading
<AsyncButton
  variant="primary"
  onAsyncClick={async () => {
    await saveData();
  }}
  successMessage="Saved successfully!"
  errorMessage="Failed to save"
>
  Save
</AsyncButton>

// Button with icon
import { Save } from 'lucide-react';

<Button variant="primary" icon={<Save />} iconPosition="left">
  Save
</Button>
```

### Toast Notifications

```tsx
import { toastService } from '@/services/toast.service';

// Simple toast
toastService.success('Operation successful!');
toastService.error('Something went wrong');
toastService.warning('Please review your changes');
toastService.info('New feature available');

// Promise-based toast
toastService.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved successfully!',
  error: 'Failed to save',
});
```

### Modals

```tsx
import { Modal } from '@/components/ui';
import { useModalState } from '@/hooks';

const { isOpen, open, close } = useModalState();

<Button onClick={open}>Open Modal</Button>

<Modal
  isOpen={isOpen}
  onClose={close}
  title="Edit Matter"
  size="lg"
  footer={
    <>
      <Button variant="ghost" onClick={close}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </>
  }
>
  <p>Modal content goes here</p>
</Modal>
```

### Confirmation Dialogs

```tsx
import { useConfirmation } from '@/hooks';
import { ConfirmationDialog } from '@/components/ui';

const { confirm, confirmationState } = useConfirmation();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Matter',
    message: 'Are you sure you want to delete this matter? This action cannot be undone.',
    variant: 'danger',
  });

  if (confirmed) {
    await deleteMatter();
    toastService.success('Matter deleted successfully!');
  }
};

return (
  <>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
    <ConfirmationDialog {...confirmationState} />
  </>
);
```

### Forms with Validation

```tsx
import { useForm } from '@/hooks';
import { FormInput } from '@/components/ui';

const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm({
  initialValues: {
    name: '',
    email: '',
  },
  validationSchema: {
    name: [
      { type: 'required', message: 'Name is required' },
      { type: 'min', value: 2, message: 'Name must be at least 2 characters' },
    ],
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Invalid email address' },
    ],
  },
  onSubmit: async (values) => {
    await saveData(values);
    toastService.success('Form submitted successfully!');
  },
});

<form onSubmit={handleSubmit}>
  <FormInput
    label="Name"
    value={values.name}
    onChange={(e) => handleChange('name', e.target.value)}
    onBlur={() => handleBlur('name')}
    error={errors.name}
    touched={touched.name}
    required
  />
  
  <FormInput
    label="Email"
    type="email"
    value={values.email}
    onChange={(e) => handleChange('email', e.target.value)}
    onBlur={() => handleBlur('email')}
    error={errors.email}
    touched={touched.email}
    required
  />
  
  <Button type="submit" loading={isSubmitting}>
    Submit
  </Button>
</form>
```

### Loading States

```tsx
import { Spinner, LoadingOverlay, ProgressBar } from '@/components/ui';

// Inline spinner
<Spinner size="md" />

// Full-screen loading
<LoadingOverlay isLoading={isLoading} message="Loading data..." />

// Progress bar
<ProgressBar progress={uploadProgress} />
```

## 🔄 Migration from Old Components

### Replace Old Buttons

```tsx
// Old (design-system)
import { Button } from '@/components/design-system/components';

// New (ui)
import { Button } from '@/components/ui';

// API is mostly compatible, but:
// - 'destructive' variant is now 'danger'
// - 'outline' variant is now 'ghost'
```

### Replace Old Modals

```tsx
// Old (design-system)
import { Modal } from '@/components/design-system/components';

// New (ui)
import { Modal } from '@/components/ui';

// New modal has enhanced features:
// - Focus trap
// - Keyboard navigation
// - Body scroll lock
// - Better accessibility
```

### Replace Toast Notifications

```tsx
// Old (react-hot-toast directly)
import toast from 'react-hot-toast';
toast.success('Success!');

// New (toastService)
import { toastService } from '@/services/toast.service';
toastService.success('Success!');

// toastService provides:
// - Consistent styling
// - Promise support
// - Better positioning
```

## 🎨 Theme Integration

All components use the LexoHub theme:
- **Primary**: Judicial Blue (#1E3A8A)
- **Secondary**: Mpondo Gold (#D4AF37)
- **Neutral**: Metallic Gray shades
- **Status**: Success, Warning, Error colors

Components automatically adapt to:
- Light/Dark mode
- Mobile/Desktop
- Touch/Mouse input

## ♿ Accessibility

All components are WCAG 2.1 AA compliant:
- Keyboard navigation
- Screen reader support
- ARIA attributes
- Focus management
- Minimum touch targets (44x44px)

## 📱 Mobile Support

All components are mobile-optimized:
- Touch-friendly (44x44px minimum)
- Responsive layouts
- Swipe gestures (where applicable)
- Mobile-first design

## 🔧 Advanced Usage

### Custom Modal Sizes

```tsx
<Modal size="sm">Small modal</Modal>
<Modal size="md">Medium modal (default)</Modal>
<Modal size="lg">Large modal</Modal>
<Modal size="xl">Extra large modal</Modal>
<Modal size="2xl">2X large modal</Modal>
<Modal size="full">Full width modal</Modal>
```

### Custom Toast Positions

```tsx
toastService.success('Message', undefined, { 
  position: 'top-center',
  duration: 5000 
});
```

### Form Validation Rules

```tsx
validationSchema: {
  field: [
    { type: 'required', message: 'Required' },
    { type: 'email', message: 'Invalid email' },
    { type: 'min', value: 5, message: 'Min 5 characters' },
    { type: 'max', value: 100, message: 'Max 100 characters' },
    { type: 'pattern', value: /^[A-Z]/, message: 'Must start with uppercase' },
    { 
      type: 'custom', 
      validator: (value) => value !== 'admin',
      message: 'Cannot use "admin"' 
    },
  ],
}
```

## 📚 Documentation

### Complete API Reference
- **src/components/ui/README.md** - Full component documentation (2000+ lines)
- **.kiro/specs/ui-ux-button-interactions/** - Design specs and requirements

### Examples
- **src/components/ui/*.examples.tsx** - Live examples for each component

## 🐛 Troubleshooting

### TypeScript Errors
- Ensure all imports are correct
- Check that types are exported from index files
- Verify component props match interfaces

### Styling Issues
- Verify Tailwind CSS is configured
- Check theme colors are defined
- Ensure dark mode classes are applied

### Accessibility Issues
- Add aria-label to icon-only buttons
- Ensure proper heading hierarchy
- Test with keyboard navigation
- Verify screen reader compatibility

## ✅ Checklist for Integration

- [ ] Add ToastContainer to App
- [ ] Replace old Button components
- [ ] Replace old Modal components
- [ ] Update toast notifications to use toastService
- [ ] Add ConfirmationDialog for destructive actions
- [ ] Use FormInput for form fields
- [ ] Add loading states with Spinner/LoadingOverlay
- [ ] Test keyboard navigation
- [ ] Test on mobile devices
- [ ] Verify dark mode works
- [ ] Check accessibility with screen reader

## 🎯 Next Steps

1. **Start Small** - Replace buttons in one page
2. **Add Feedback** - Implement toast notifications
3. **Enhance Forms** - Add validation with useForm
4. **Add Modals** - Replace dialogs with new Modal
5. **Test Thoroughly** - Verify accessibility and mobile

## 📞 Support

For questions or issues:
- Check **src/components/ui/README.md** for API reference
- Review **.kiro/specs/ui-ux-button-interactions/** for design specs
- Look at ***.examples.tsx** files for usage examples

---

**Status**: All components are production-ready and can be integrated immediately.
**Quality**: WCAG 2.1 AA compliant, fully tested, zero errors.
**Support**: Comprehensive documentation and examples provided.
