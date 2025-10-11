# UI Components

This directory contains the core UI components for the LexoHub application, implementing the design system with Mpondo Gold and Judicial Blue theme colors.

## Button Component

The Button component is a comprehensive, accessible button implementation that follows the LexoHub design system.

### Features

- ✅ **Multiple Variants**: primary, secondary, ghost, danger, success
- ✅ **Three Sizes**: sm (36px), md (44px), lg (48px) - all meeting accessibility touch targets
- ✅ **Loading States**: Automatic spinner display with disabled interaction
- ✅ **Icon Support**: Icons can be positioned left or right
- ✅ **Full Accessibility**: ARIA attributes, keyboard navigation, screen reader support
- ✅ **Theme Colors**: Mpondo Gold (#D4AF37) and Judicial Blue (#1E3A8A)
- ✅ **Dark Mode**: Full dark mode support
- ✅ **Responsive**: Mobile-first design with proper touch targets

### Basic Usage

```tsx
import { Button } from '@/components/ui';

// Simple button
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

// Button with icon
<Button variant="secondary" icon={<PlusIcon />} iconPosition="left">
  Add Item
</Button>

// Loading state
<Button loading>
  Processing...
</Button>

// Disabled state
<Button disabled>
  Unavailable
</Button>
```

### Variants

#### Primary (Judicial Blue)
Used for primary actions like "Save", "Submit", "Create"
```tsx
<Button variant="primary">Save Changes</Button>
```

#### Secondary (Mpondo Gold)
Used for secondary actions like "Edit", "Update"
```tsx
<Button variant="secondary">Edit Profile</Button>
```

#### Ghost (Transparent with Border)
Used for tertiary actions like "Cancel", "Back"
```tsx
<Button variant="ghost">Cancel</Button>
```

#### Danger (Red)
Used for destructive actions like "Delete", "Remove"
```tsx
<Button variant="danger">Delete Item</Button>
```

#### Success (Green)
Used for positive confirmations like "Approve", "Confirm"
```tsx
<Button variant="success">Approve</Button>
```

### Sizes

```tsx
<Button size="sm">Small Button</Button>
<Button size="md">Medium Button</Button>  {/* Default */}
<Button size="lg">Large Button</Button>
```

### With Icons

```tsx
import { Save, Plus, Trash2 } from 'lucide-react';

// Icon on the left (default)
<Button icon={<Plus />} iconPosition="left">
  Add New
</Button>

// Icon on the right
<Button icon={<ArrowRight />} iconPosition="right">
  Continue
</Button>

// Icon-only button (remember to add aria-label!)
<Button 
  icon={<Save />} 
  ariaLabel="Save document"
  variant="ghost"
  size="sm"
>
  <span className="sr-only">Save</span>
</Button>
```

### Full Width

```tsx
<Button fullWidth>
  Full Width Button
</Button>
```

### Accessibility

The Button component includes comprehensive accessibility features:

```tsx
// Icon-only button with aria-label
<Button 
  icon={<MenuIcon />}
  ariaLabel="Open menu"
>
  <span className="sr-only">Menu</span>
</Button>

// Dropdown trigger
<Button 
  ariaHasPopup="menu"
  ariaExpanded={isOpen}
>
  Actions ▼
</Button>

// Loading state (automatically sets aria-busy)
<Button loading>
  Saving...
</Button>
```

## AsyncButton Component

The AsyncButton component extends Button with automatic async operation handling.

### Features

- ✅ **Automatic Loading States**: Shows spinner during async operations
- ✅ **Double-Click Prevention**: Prevents multiple submissions
- ✅ **Toast Notifications**: Automatic success/error feedback
- ✅ **Error Handling**: Built-in error catching and reporting

### Usage

```tsx
import { AsyncButton } from '@/components/ui';

<AsyncButton
  variant="primary"
  onAsyncClick={async () => {
    await saveData();
  }}
  successMessage="Data saved successfully!"
  errorMessage="Failed to save data"
>
  Save
</AsyncButton>
```

### With Callbacks

```tsx
<AsyncButton
  variant="danger"
  icon={<Trash2 />}
  onAsyncClick={async () => {
    await deleteItem(itemId);
  }}
  successMessage="Item deleted"
  onSuccess={() => {
    // Refresh list, close modal, etc.
    refreshList();
  }}
  onError={(error) => {
    // Custom error handling
    console.error('Delete failed:', error);
  }}
>
  Delete
</AsyncButton>
```

## Props Reference

### ButtonProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable button |
| `icon` | `React.ReactNode` | - | Icon element |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position |
| `fullWidth` | `boolean` | `false` | Make button full width |
| `ariaLabel` | `string` | - | Accessible label |
| `ariaExpanded` | `boolean` | - | ARIA expanded state |
| `ariaHasPopup` | `boolean \| 'menu' \| 'dialog' \| ...` | - | ARIA popup indicator |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `onClick` | `(e: React.MouseEvent) => void` | - | Click handler |
| `className` | `string` | - | Additional CSS classes |

### AsyncButtonProps

Extends `ButtonProps` (except `onClick` and `loading`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onAsyncClick` | `() => Promise<void>` | - | Async click handler |
| `successMessage` | `string` | - | Toast message on success |
| `errorMessage` | `string` | - | Toast message on error |
| `onSuccess` | `() => void` | - | Success callback |
| `onError` | `(error: Error) => void` | - | Error callback |

## Design System Colors

The buttons use the LexoHub theme colors:

- **Mpondo Gold**: `#D4AF37` - Secondary actions, accents
- **Judicial Blue**: `#1E3A8A` - Primary actions, main brand color
- **Metallic Gray**: Various shades for neutral elements
- **Status Colors**: Success (green), Warning (yellow), Error (red)

## Best Practices

### 1. Use Appropriate Variants

```tsx
// ✅ Good - Primary for main action
<Button variant="primary">Save</Button>
<Button variant="ghost">Cancel</Button>

// ❌ Bad - Multiple primary buttons
<Button variant="primary">Save</Button>
<Button variant="primary">Cancel</Button>
```

### 2. Always Provide Accessible Labels for Icon-Only Buttons

```tsx
// ✅ Good
<Button icon={<MenuIcon />} ariaLabel="Open menu">
  <span className="sr-only">Menu</span>
</Button>

// ❌ Bad - No accessible label
<Button icon={<MenuIcon />} />
```

### 3. Use AsyncButton for Async Operations

```tsx
// ✅ Good - Automatic loading state
<AsyncButton onAsyncClick={saveData}>
  Save
</AsyncButton>

// ❌ Bad - Manual loading state management
const [loading, setLoading] = useState(false);
<Button 
  loading={loading}
  onClick={async () => {
    setLoading(true);
    await saveData();
    setLoading(false);
  }}
>
  Save
</Button>
```

### 4. Maintain Minimum Touch Targets

All button sizes meet the minimum 44x44px touch target for accessibility:
- Small: 36px (use sparingly, mainly for desktop)
- Medium: 44px (default, recommended)
- Large: 48px (for prominent actions)

### 5. Use Loading States for Async Operations

```tsx
// ✅ Good - Shows loading state
<Button loading={isSubmitting}>
  Submit
</Button>

// ❌ Bad - No feedback during operation
<Button onClick={handleSubmit}>
  Submit
</Button>
```

## Examples

See `Button.examples.tsx` for comprehensive usage examples.

## Testing

When testing components using these buttons:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui';

test('button calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);
  
  fireEvent.click(screen.getByText('Click Me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('button is disabled when loading', () => {
  render(<Button loading>Loading</Button>);
  
  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
});
```

## Migration from Old Button Component

If you're migrating from the old design-system Button:

```tsx
// Old
import { Button } from '@/components/design-system/components';
<Button variant="primary">Save</Button>

// New
import { Button } from '@/components/ui';
<Button variant="primary">Save</Button>

// The API is mostly compatible, but check for:
// - 'destructive' variant is now 'danger'
// - 'outline' variant is now 'ghost'
```

## Support

For questions or issues with the Button component, please refer to:
- Design System Usage Guide: `DESIGN_SYSTEM_USAGE_GUIDE.md`
- Implementation Spec: `.kiro/specs/ui-ux-button-interactions/`


---

## Toast Notification System

The toast notification system provides a consistent way to display feedback messages to users throughout the application.

### Features

- ✅ **Multiple Types**: success, error, warning, info
- ✅ **Auto-Dismiss**: Configurable duration with auto-dismiss
- ✅ **Manual Dismiss**: Users can dismiss toasts manually
- ✅ **Promise Support**: Automatic loading/success/error states for async operations
- ✅ **Positioning**: 6 position options (top/bottom × left/center/right)
- ✅ **Theme Integration**: Matches LexoHub design system
- ✅ **Dark Mode**: Full dark mode support

### Setup

Add the ToastContainer to your app root (usually in App.tsx):

```tsx
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

### Basic Usage

```tsx
import { toastService } from '@/services/toast.service';

// Success toast
toastService.success('Success!', 'Your changes have been saved.');

// Error toast
toastService.error('Error!', 'Something went wrong.');

// Warning toast
toastService.warning('Warning!', 'This action cannot be undone.');

// Info toast
toastService.info('Info', 'Here is some helpful information.');
```

### Title-Only Toasts

```tsx
// Just a title, no message
toastService.success('Saved successfully!');
toastService.error('Failed to delete');
```

### Loading Toast

```tsx
// Show loading toast
const toastId = toastService.loading('Processing...', 'Please wait');

// Later, dismiss it
toastService.dismiss(toastId);

// And show success
toastService.success('Complete!');
```

### Promise-Based Toasts

Perfect for async operations:

```tsx
const saveData = async () => {
  // Your async operation
  await api.save(data);
};

toastService.promise(saveData(), {
  loading: 'Saving changes...',
  success: 'Changes saved successfully!',
  error: 'Failed to save changes',
});
```

### Custom Duration

```tsx
// Short toast (2 seconds)
toastService.success('Quick message', undefined, { duration: 2000 });

// Long toast (10 seconds)
toastService.error('Important error', 'Read this carefully', { duration: 10000 });
```

### Custom Position

```tsx
toastService.success('Message', undefined, { position: 'top-center' });
toastService.error('Error', undefined, { position: 'bottom-right' });
```

Available positions:
- `top-right` (default)
- `top-center`
- `top-left`
- `bottom-right`
- `bottom-center`
- `bottom-left`

### Dismiss Toasts

```tsx
// Dismiss a specific toast
const toastId = toastService.success('Message');
toastService.dismiss(toastId);

// Dismiss all toasts
toastService.dismissAll();
```

### Update Existing Toast

```tsx
const toastId = toastService.loading('Processing...');

// Later, update it
toastService.update(toastId, 'success', 'Complete!', 'Operation finished successfully');
```

## Real-World Examples

### Form Submission

```tsx
import { AsyncButton } from '@/components/ui';
import { toastService } from '@/services/toast.service';

<AsyncButton
  variant="primary"
  onAsyncClick={async () => {
    await saveMatter(matterData);
  }}
  successMessage="Matter saved successfully!"
  errorMessage="Failed to save matter"
>
  Save Matter
</AsyncButton>
```

### Manual Async Operation

```tsx
const handleSave = async () => {
  const savePromise = api.saveMatter(matterData);
  
  await toastService.promise(savePromise, {
    loading: 'Saving matter...',
    success: 'Matter saved successfully!',
    error: 'Failed to save matter',
  });
  
  // Continue with post-save logic
  navigate('/matters');
};
```

### Delete with Confirmation

```tsx
const handleDelete = async () => {
  // Show warning first
  toastService.warning('Deleting item...', 'This action cannot be undone');
  
  try {
    await api.deleteItem(itemId);
    toastService.success('Item deleted', 'The item has been permanently removed');
  } catch (error) {
    toastService.error('Delete failed', 'Unable to delete the item');
  }
};
```

### Validation Errors

```tsx
const handleSubmit = () => {
  if (!formData.name) {
    toastService.error('Validation Error', 'Please enter a name');
    return;
  }
  
  if (!formData.email) {
    toastService.error('Validation Error', 'Please enter an email address');
    return;
  }
  
  // Continue with submission
};
```

### Network Errors

```tsx
try {
  await api.fetchData();
} catch (error) {
  if (error.message === 'Network Error') {
    toastService.error(
      'Connection Error',
      'Unable to reach the server. Please check your internet connection.'
    );
  } else {
    toastService.error('Error', error.message);
  }
}
```

### Success with Additional Info

```tsx
const generateInvoice = async () => {
  const invoice = await api.generateInvoice(matterId);
  
  toastService.success(
    'Invoice Generated',
    `Invoice #${invoice.number} has been created and sent to the client`
  );
};
```

## Toast Service API

### Methods

#### `success(title: string, message?: string, options?: ToastOptions): string`
Display a success toast notification.

#### `error(title: string, message?: string, options?: ToastOptions): string`
Display an error toast notification (stays longer by default).

#### `warning(title: string, message?: string, options?: ToastOptions): string`
Display a warning toast notification.

#### `info(title: string, message?: string, options?: ToastOptions): string`
Display an info toast notification.

#### `loading(title: string, message?: string): string`
Display a loading toast (stays until dismissed).

#### `promise<T>(promise: Promise<T>, messages: PromiseMessages): Promise<T>`
Handle async operations with automatic loading/success/error toasts.

#### `update(toastId: string, type: ToastType, title: string, message?: string): void`
Update an existing toast.

#### `dismiss(id: string): void`
Dismiss a specific toast by ID.

#### `dismissAll(): void`
Dismiss all active toasts.

### Types

```typescript
interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

interface PromiseMessages {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: any) => string);
}
```

## Best Practices

### 1. Use Appropriate Toast Types

```tsx
// ✅ Good - Clear type for the message
toastService.success('Saved successfully!');
toastService.error('Failed to save');
toastService.warning('This action cannot be undone');
toastService.info('New feature available');

// ❌ Bad - Wrong type for the message
toastService.success('Error occurred'); // Should be error
toastService.error('Success!'); // Should be success
```

### 2. Provide Clear, Actionable Messages

```tsx
// ✅ Good - Clear and actionable
toastService.error('Connection Error', 'Please check your internet connection and try again');

// ❌ Bad - Vague and unhelpful
toastService.error('Error', 'Something went wrong');
```

### 3. Use Promise Toasts for Async Operations

```tsx
// ✅ Good - Automatic state management
toastService.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save',
});

// ❌ Bad - Manual state management
const toastId = toastService.loading('Saving...');
try {
  await saveData();
  toastService.dismiss(toastId);
  toastService.success('Saved!');
} catch (error) {
  toastService.dismiss(toastId);
  toastService.error('Failed to save');
}
```

### 4. Don't Overuse Toasts

```tsx
// ✅ Good - Important feedback only
toastService.success('Matter saved successfully!');

// ❌ Bad - Too many toasts
toastService.info('Validating form...');
toastService.info('Sending request...');
toastService.info('Processing response...');
toastService.success('Matter saved successfully!');
```

### 5. Use Appropriate Durations

```tsx
// ✅ Good - Longer duration for important errors
toastService.error('Payment Failed', 'Your card was declined', { duration: 7000 });

// ✅ Good - Shorter duration for simple success
toastService.success('Copied!', undefined, { duration: 2000 });

// ❌ Bad - Too short for important information
toastService.error('Critical Error', 'Data loss may occur', { duration: 1000 });
```

## Accessibility

The toast system is built with accessibility in mind:

- Uses `role="alert"` for screen reader announcements
- Uses `aria-live="polite"` for non-intrusive announcements
- Provides dismiss buttons with proper `aria-label`
- Supports keyboard navigation
- Maintains focus management

## Examples

See `Toast.examples.tsx` for comprehensive usage examples.


---

## Modal System

The modal system provides a comprehensive solution for displaying dialog windows with full accessibility and UX features.

### Features

- ✅ **Multiple Sizes**: sm, md, lg, xl, 2xl, full
- ✅ **Focus Trap**: Keeps focus within modal
- ✅ **Escape Key**: Close modal with Escape key (configurable)
- ✅ **Overlay Click**: Close modal by clicking outside (configurable)
- ✅ **Body Scroll Lock**: Prevents background scrolling
- ✅ **Focus Management**: Restores focus on close
- ✅ **Smooth Animations**: Fade in/out with slide up
- ✅ **Accessibility**: Full ARIA attributes and keyboard navigation
- ✅ **Theme Integration**: Matches LexoHub design system
- ✅ **Dark Mode**: Full dark mode support

### Basic Usage

```tsx
import { Modal } from '@/components/ui';
import { useModalState } from '@/hooks/useModalState';

function MyComponent() {
  const { isOpen, open, close } = useModalState();

  return (
    <>
      <Button onClick={open}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={close} title="My Modal">
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

### Modal Sizes

```tsx
// Small modal
<Modal size="sm" isOpen={isOpen} onClose={close}>
  Content
</Modal>

// Medium modal (default)
<Modal size="md" isOpen={isOpen} onClose={close}>
  Content
</Modal>

// Large modal
<Modal size="lg" isOpen={isOpen} onClose={close}>
  Content
</Modal>

// Extra large modal
<Modal size="xl" isOpen={isOpen} onClose={close}>
  Content
</Modal>

// 2X large modal
<Modal size="2xl" isOpen={isOpen} onClose={close}>
  Content
</Modal>

// Full width modal
<Modal size="full" isOpen={isOpen} onClose={close}>
  Content
</Modal>
```

### Modal with Footer

```tsx
<Modal
  isOpen={isOpen}
  onClose={close}
  title="Edit Matter"
  footer={
    <>
      <Button variant="ghost" onClick={close}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Save Changes
      </Button>
    </>
  }
>
  <p>Modal content</p>
</Modal>
```

### Modal Options

```tsx
// No close button in header
<Modal
  isOpen={isOpen}
  onClose={close}
  showCloseButton={false}
>
  Content
</Modal>

// Don't close on overlay click
<Modal
  isOpen={isOpen}
  onClose={close}
  closeOnOverlayClick={false}
>
  Content
</Modal>

// Don't close on Escape key
<Modal
  isOpen={isOpen}
  onClose={close}
  closeOnEscape={false}
>
  Content
</Modal>
```

### Using Modal Subcomponents

For more control over modal structure:

```tsx
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalDescription,
} from '@/components/ui';

<Modal isOpen={isOpen} onClose={close} title="Custom Modal">
  <ModalBody>
    <ModalDescription>
      This is a description of what the modal does.
    </ModalDescription>
    <div className="mt-4">
      {/* Your content */}
    </div>
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={close}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSave}>
      Save
    </Button>
  </ModalFooter>
</Modal>
```

### useModalState Hook

The `useModalState` hook provides a clean API for managing modal state:

```tsx
import { useModalState } from '@/hooks/useModalState';

const { isOpen, open, close, toggle, setIsOpen } = useModalState();

// Open modal
<Button onClick={open}>Open</Button>

// Close modal
<Button onClick={close}>Close</Button>

// Toggle modal
<Button onClick={toggle}>Toggle</Button>

// Set specific state
<Button onClick={() => setIsOpen(true)}>Open</Button>
```

### Modal Context (Advanced)

For complex applications with multiple modals, use the Modal Context:

```tsx
import { ModalProvider, useModal } from '@/contexts/ModalContext';

// Wrap your app with ModalProvider
function App() {
  return (
    <ModalProvider>
      <YourApp />
    </ModalProvider>
  );
}

// Use in any component
function MyComponent() {
  const { openModal, closeModal, isModalOpen } = useModal();

  const handleOpen = () => {
    openModal('my-modal', { data: 'some data' });
  };

  return (
    <>
      <Button onClick={handleOpen}>Open Modal</Button>
      <Modal
        isOpen={isModalOpen('my-modal')}
        onClose={() => closeModal('my-modal')}
      >
        Content
      </Modal>
    </>
  );
}
```

## Real-World Examples

### Confirmation Dialog

```tsx
const { isOpen, open, close } = useModalState();

const handleDelete = () => {
  // Perform delete
  close();
};

<Button variant="danger" onClick={open}>
  Delete Item
</Button>

<Modal
  isOpen={isOpen}
  onClose={close}
  title="Confirm Deletion"
  size="sm"
  footer={
    <>
      <Button variant="ghost" onClick={close}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </>
  }
>
  <div className="space-y-3">
    <div className="flex items-center gap-3 text-status-error-600">
      <AlertTriangle className="w-6 h-6" />
      <p className="font-semibold">This action cannot be undone</p>
    </div>
    <ModalDescription>
      Are you sure you want to delete this item?
    </ModalDescription>
  </div>
</Modal>
```

### Form Modal

```tsx
const { isOpen, open, close } = useModalState();
const [formData, setFormData] = useState({ name: '', email: '' });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await saveData(formData);
  close();
};

<Button onClick={open}>Create New</Button>

<Modal
  isOpen={isOpen}
  onClose={close}
  title="Create New Item"
  footer={
    <>
      <Button variant="ghost" onClick={close}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit}>
        Create
      </Button>
    </>
  }
>
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Name</label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Email</label>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>
  </form>
</Modal>
```

### Edit Modal

```tsx
const { isOpen, open, close } = useModalState();
const [matter, setMatter] = useState(initialMatter);

const handleSave = async () => {
  await updateMatter(matter);
  toastService.success('Matter updated successfully!');
  close();
};

<Button variant="secondary" onClick={open}>
  Edit Matter
</Button>

<Modal
  isOpen={isOpen}
  onClose={close}
  title="Edit Matter"
  size="lg"
  footer={
    <>
      <Button variant="ghost" onClick={close}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Save Changes
      </Button>
    </>
  }
>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Matter Name</label>
      <input
        type="text"
        value={matter.name}
        onChange={(e) => setMatter({ ...matter, name: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Client</label>
      <input
        type="text"
        value={matter.client}
        onChange={(e) => setMatter({ ...matter, client: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>
  </div>
</Modal>
```

### Information Modal

```tsx
const { isOpen, open, close } = useModalState();

<Button variant="ghost" onClick={open}>
  View Details
</Button>

<Modal
  isOpen={isOpen}
  onClose={close}
  title="Matter Details"
  size="md"
>
  <div className="space-y-3">
    <div>
      <p className="text-sm font-medium text-neutral-600">Matter Number</p>
      <p className="font-semibold">MAT-2024-001</p>
    </div>
    <div>
      <p className="text-sm font-medium text-neutral-600">Client</p>
      <p className="font-semibold">John Smith</p>
    </div>
    <div>
      <p className="text-sm font-medium text-neutral-600">Status</p>
      <p className="font-semibold">Active</p>
    </div>
  </div>
</Modal>
```

## Modal Props Reference

### ModalProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Whether the modal is open |
| `onClose` | `() => void` | - | Function to call when modal should close |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'full'` | `'md'` | Modal size |
| `title` | `string` | - | Modal title (optional) |
| `showCloseButton` | `boolean` | `true` | Show close button in header |
| `closeOnOverlayClick` | `boolean` | `true` | Close modal when clicking overlay |
| `closeOnEscape` | `boolean` | `true` | Close modal when pressing Escape |
| `className` | `string` | - | Additional CSS classes for modal content |
| `overlayClassName` | `string` | - | Additional CSS classes for overlay |
| `footer` | `React.ReactNode` | - | Footer content (usually buttons) |
| `children` | `React.ReactNode` | - | Modal body content |

### useModalState Return

| Property | Type | Description |
|----------|------|-------------|
| `isOpen` | `boolean` | Current open state |
| `open` | `() => void` | Open the modal |
| `close` | `() => void` | Close the modal |
| `toggle` | `() => void` | Toggle modal state |
| `setIsOpen` | `(value: boolean) => void` | Set specific state |

## Best Practices

### 1. Use Appropriate Sizes

```tsx
// ✅ Good - Small for confirmations
<Modal size="sm" title="Confirm">
  Are you sure?
</Modal>

// ✅ Good - Large for forms
<Modal size="lg" title="Edit Matter">
  <ComplexForm />
</Modal>

// ❌ Bad - Too large for simple confirmation
<Modal size="2xl" title="Confirm">
  Are you sure?
</Modal>
```

### 2. Always Provide a Way to Close

```tsx
// ✅ Good - Multiple ways to close
<Modal
  isOpen={isOpen}
  onClose={close}
  footer={
    <Button onClick={close}>Close</Button>
  }
>
  Content
</Modal>

// ❌ Bad - No way to close
<Modal
  isOpen={isOpen}
  onClose={close}
  showCloseButton={false}
  closeOnOverlayClick={false}
  closeOnEscape={false}
>
  Content
</Modal>
```

### 3. Use Confirmation for Destructive Actions

```tsx
// ✅ Good - Confirmation for delete
const handleDelete = () => {
  openConfirmModal();
};

// ❌ Bad - Direct delete without confirmation
const handleDelete = () => {
  deleteItem();
};
```

### 4. Provide Clear Action Buttons

```tsx
// ✅ Good - Clear action buttons
<Modal
  footer={
    <>
      <Button variant="ghost" onClick={close}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save Changes</Button>
    </>
  }
>
  Content
</Modal>

// ❌ Bad - Unclear buttons
<Modal
  footer={
    <>
      <Button onClick={close}>No</Button>
      <Button onClick={handleSave}>Yes</Button>
    </>
  }
>
  Content
</Modal>
```

### 5. Use Loading States in Modals

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await saveData();
    close();
  } finally {
    setIsLoading(false);
  }
};

<Modal
  footer={
    <>
      <Button variant="ghost" onClick={close} disabled={isLoading}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave} loading={isLoading}>
        Save
      </Button>
    </>
  }
>
  Content
</Modal>
```

## Accessibility

The modal system is built with accessibility in mind:

- Uses `role="dialog"` and `aria-modal="true"`
- Provides `aria-labelledby` for title
- Implements focus trap to keep focus within modal
- Restores focus to trigger element on close
- Supports keyboard navigation (Tab, Shift+Tab, Escape)
- Provides proper ARIA labels for close buttons
- Locks body scroll to prevent confusion
- Announces modal opening to screen readers

## Examples

See `Modal.examples.tsx` for comprehensive usage examples.


---

## Confirmation Dialog

The ConfirmationDialog component is a specialized modal for confirmation dialogs with preset variants for common use cases.

### Features

- ✅ **3 Variants**: info, warning, danger
- ✅ **Async Support**: Handles async operations with loading states
- ✅ **Auto-styling**: Pre-styled for each variant
- ✅ **Icon Support**: Built-in icons or custom icons
- ✅ **Customizable Text**: Custom confirm/cancel button text
- ✅ **Theme Integration**: Matches LexoHub design system
- ✅ **Dark Mode**: Full dark mode support

### Basic Usage

```tsx
import { ConfirmationDialog } from '@/components/ui';
import { useModalState } from '@/hooks/useModalState';

const { isOpen, open, close } = useModalState();

<Button variant="danger" onClick={open}>Delete</Button>

<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={() => {
    deleteItem();
  }}
  variant="danger"
  title="Delete Item"
  message="Are you sure you want to delete this item? This action cannot be undone."
/>
```

### Variants

#### Info Variant
For informational confirmations:

```tsx
<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleConfirm}
  variant="info"
  title="Send Invoice"
  message="This will send the invoice to the client. Do you want to proceed?"
/>
```

#### Warning Variant
For actions that may have consequences:

```tsx
<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleConfirm}
  variant="warning"
  title="Archive Matter"
  message="This will move the matter to the archive. You can restore it later if needed."
/>
```

#### Danger Variant
For destructive actions:

```tsx
<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleConfirm}
  variant="danger"
  title="Delete Matter"
  message="Are you sure you want to delete this matter? This action cannot be undone."
/>
```

### With Async Actions

The dialog automatically handles async operations with loading states:

```tsx
<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={async () => {
    await deleteMatter(matterId);
    toastService.success('Matter deleted successfully!');
  }}
  variant="danger"
  title="Delete Matter"
  message="Are you sure?"
/>
```

### Custom Button Text

```tsx
<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleConfirm}
  variant="warning"
  title="Proceed with Action"
  message="This action will affect multiple items."
  confirmText="Yes, Proceed"
  cancelText="No, Go Back"
/>
```

### Custom Icon

```tsx
import { FileText } from 'lucide-react';

<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleConfirm}
  variant="info"
  title="Export Data"
  message="This will export all data to a CSV file."
  icon={<FileText className="w-6 h-6" />}
/>
```

### Without Icon

```tsx
<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleConfirm}
  variant="info"
  title="Confirm Action"
  message="Do you want to proceed?"
  showIcon={false}
/>
```

## useConfirmation Hook

For a more streamlined approach, use the `useConfirmation` hook:

```tsx
import { useConfirmation } from '@/hooks/useConfirmation';

const { confirm, confirmationState } = useConfirmation();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    variant: 'danger',
  });

  if (confirmed) {
    await deleteItem();
    toastService.success('Item deleted!');
  }
};

return (
  <>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
    <ConfirmationDialog {...confirmationState} />
  </>
);
```

### Hook with Custom Options

```tsx
const handleAction = async () => {
  const confirmed = await confirm({
    title: 'Custom Confirmation',
    message: 'Do you want to proceed with this action?',
    variant: 'warning',
    confirmText: 'Yes, Proceed',
    cancelText: 'No, Cancel',
  });

  if (confirmed) {
    // Perform action
  }
};
```

## Real-World Examples

### Delete Confirmation

```tsx
const { isOpen, open, close } = useModalState();

const handleDelete = async () => {
  await api.deleteMatter(matterId);
  toastService.success('Matter deleted successfully!');
  navigate('/matters');
};

<Button variant="danger" icon={<Trash2 />} onClick={open}>
  Delete Matter
</Button>

<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleDelete}
  variant="danger"
  title="Delete Matter"
  message="Are you sure you want to delete 'Smith vs. Johnson'? All time entries, documents, and invoices will be permanently removed."
  confirmText="Delete Permanently"
/>
```

### Discard Changes

```tsx
const { isOpen, open, close } = useModalState();

const handleDiscard = () => {
  resetForm();
  navigate('/matters');
};

<Button variant="ghost" onClick={open}>
  Discard Changes
</Button>

<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleDiscard}
  variant="warning"
  title="Discard Changes"
  message="You have unsaved changes. Are you sure you want to discard them?"
  confirmText="Discard"
  cancelText="Keep Editing"
/>
```

### Send Invoice

```tsx
const { isOpen, open, close } = useModalState();

const handleSend = async () => {
  await api.sendInvoice(invoiceId);
  toastService.success('Invoice sent to client!');
};

<Button variant="primary" icon={<FileText />} onClick={open}>
  Send Invoice
</Button>

<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleSend}
  variant="info"
  title="Send Invoice"
  message="This will send invoice #INV-2024-001 to the client via email."
  confirmText="Send Invoice"
/>
```

### Archive Matter

```tsx
const { isOpen, open, close } = useModalState();

const handleArchive = async () => {
  await api.archiveMatter(matterId);
  toastService.success('Matter archived successfully!');
};

<Button variant="secondary" onClick={open}>
  Archive Matter
</Button>

<ConfirmationDialog
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleArchive}
  variant="warning"
  title="Archive Matter"
  message="This will move the matter to the archive. You can restore it later if needed."
  confirmText="Archive"
/>
```

## ConfirmationDialog Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Whether the dialog is open |
| `onClose` | `() => void` | - | Function to call when dialog should close |
| `onConfirm` | `() => void \| Promise<void>` | - | Function to call when confirmed |
| `variant` | `'info' \| 'warning' \| 'danger'` | `'info'` | Dialog variant |
| `title` | `string` | - | Dialog title |
| `message` | `string` | - | Dialog message |
| `confirmText` | `string` | Variant default | Custom confirm button text |
| `cancelText` | `string` | `'Cancel'` | Custom cancel button text |
| `icon` | `React.ReactNode` | Variant default | Custom icon |
| `showIcon` | `boolean` | `true` | Show/hide icon |
| `loading` | `boolean` | Auto-managed | External loading state |

### Default Confirm Text by Variant

- **info**: "Confirm"
- **warning**: "Continue"
- **danger**: "Delete"

## useConfirmation Hook

### Return Value

```typescript
{
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  confirmationState: ConfirmationState;
  closeConfirmation: () => void;
}
```

### ConfirmationOptions

```typescript
interface ConfirmationOptions {
  title: string;
  message: string;
  variant?: 'info' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
}
```

## Best Practices

### 1. Use Appropriate Variants

```tsx
// ✅ Good - Danger for destructive actions
<ConfirmationDialog variant="danger" title="Delete Item" />

// ✅ Good - Warning for actions with consequences
<ConfirmationDialog variant="warning" title="Archive Item" />

// ✅ Good - Info for informational confirmations
<ConfirmationDialog variant="info" title="Send Email" />

// ❌ Bad - Wrong variant for action type
<ConfirmationDialog variant="info" title="Delete Item" />
```

### 2. Provide Clear Messages

```tsx
// ✅ Good - Clear and specific
<ConfirmationDialog
  title="Delete Matter"
  message="Are you sure you want to delete 'Smith vs. Johnson'? All associated data will be permanently removed."
/>

// ❌ Bad - Vague message
<ConfirmationDialog
  title="Delete"
  message="Are you sure?"
/>
```

### 3. Use Async Handlers

```tsx
// ✅ Good - Async handler with loading state
<ConfirmationDialog
  onConfirm={async () => {
    await deleteItem();
  }}
/>

// ❌ Bad - Sync handler for async operation
<ConfirmationDialog
  onConfirm={() => {
    deleteItem(); // No await, no loading state
  }}
/>
```

### 4. Provide Feedback After Confirmation

```tsx
// ✅ Good - Shows success toast
<ConfirmationDialog
  onConfirm={async () => {
    await deleteItem();
    toastService.success('Item deleted!');
  }}
/>

// ❌ Bad - No feedback
<ConfirmationDialog
  onConfirm={async () => {
    await deleteItem();
  }}
/>
```

### 5. Use useConfirmation for Multiple Confirmations

```tsx
// ✅ Good - Single hook for multiple confirmations
const { confirm, confirmationState } = useConfirmation();

const handleDelete = async () => {
  if (await confirm({ title: 'Delete?', message: '...', variant: 'danger' })) {
    await deleteItem();
  }
};

const handleArchive = async () => {
  if (await confirm({ title: 'Archive?', message: '...', variant: 'warning' })) {
    await archiveItem();
  }
};

return (
  <>
    <Button onClick={handleDelete}>Delete</Button>
    <Button onClick={handleArchive}>Archive</Button>
    <ConfirmationDialog {...confirmationState} />
  </>
);

// ❌ Bad - Multiple modal states
const deleteModal = useModalState();
const archiveModal = useModalState();
// ... lots of duplicate code
```

## Accessibility

The ConfirmationDialog inherits all accessibility features from the Modal component:

- Uses `role="dialog"` and `aria-modal="true"`
- Provides `aria-labelledby` for title
- Implements focus trap
- Supports keyboard navigation
- Provides proper ARIA labels
- Announces to screen readers

## Examples

See `ConfirmationDialog.examples.tsx` for comprehensive usage examples.
