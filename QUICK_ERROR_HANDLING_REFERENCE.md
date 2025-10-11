# Quick Error & Success Handling Reference Card

## 🚀 Quick Start

### Basic Pattern
```typescript
import { toast } from 'react-hot-toast';

const handleOperation = async () => {
  const loadingToast = toast.loading('Processing...');
  
  try {
    await performOperation();
    toast.success('Success!', { id: loadingToast, duration: 3000 });
  } catch (error) {
    toast.error('Failed. Please try again.', { id: loadingToast, duration: 5000 });
    console.error('Operation failed:', error);
  }
};
```

---

## 📋 Common Patterns

### 1. Simple Success/Error
```typescript
try {
  await saveData();
  toast.success('Saved successfully');
} catch (error) {
  toast.error('Failed to save');
}
```

### 2. With Loading State
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await saveData();
    toast.success('Saved');
  } catch (error) {
    toast.error('Failed');
  } finally {
    setIsLoading(false);
  }
};
```

### 3. With Context
```typescript
try {
  await deleteItem(itemName);
  toast.success(`"${itemName}" deleted successfully`);
} catch (error) {
  toast.error(`Failed to delete "${itemName}"`);
}
```

### 4. Update Loading Toast
```typescript
const toastId = toast.loading('Saving...');

try {
  await saveData();
  toast.success('Saved!', { id: toastId });
} catch (error) {
  toast.error('Failed', { id: toastId });
}
```

---

## 🎨 Toast Types

```typescript
// Success (3s duration)
toast.success('Operation completed');

// Error (5s duration)
toast.error('Operation failed');

// Warning (4s duration)
toast('Warning message', { icon: '⚠️' });

// Info (4s duration)
toast('Info message', { icon: 'ℹ️' });

// Loading (indefinite)
const id = toast.loading('Processing...');
```

---

## ⏱️ Duration Guidelines

| Type | Duration | Use Case |
|------|----------|----------|
| Success | 3000ms | Quick confirmations |
| Error | 5000ms | Error messages (need more time to read) |
| Warning | 4000ms | Important notices |
| Info | 4000ms | General information |
| Loading | Indefinite | Until operation completes |

---

## 🛠️ Using Error Utilities

### Simple Wrapper
```typescript
import { withErrorHandling } from '@/utils/error-handling.utils';

const { data, error } = await withErrorHandling(
  () => fetchData(),
  {
    loadingMessage: 'Loading...',
    successMessage: 'Loaded',
    errorMessage: 'Failed to load'
  }
);
```

### With Retry
```typescript
import { retryOperation } from '@/utils/error-handling.utils';

await retryOperation(
  () => fetchData(),
  { maxRetries: 3, initialDelay: 1000 }
);
```

### Handle API Error
```typescript
import { handleApiError } from '@/utils/error-handling.utils';

try {
  await apiCall();
} catch (error) {
  handleApiError(error, {
    message: 'Failed to load data',
    context: 'DataLoader'
  });
}
```

---

## ✅ Checklist for New Operations

- [ ] Add loading state
- [ ] Show loading toast
- [ ] Handle success case
- [ ] Handle error case
- [ ] Update loading toast (don't create new one)
- [ ] Include context in messages
- [ ] Log errors to console
- [ ] Set appropriate durations
- [ ] Test both success and error paths

---

## 🎯 Best Practices

### DO ✅
```typescript
// Specific messages
toast.success('Invoice #123 sent successfully');

// Include context
toast.error('Failed to save matter. Please try again.');

// Update loading toasts
const id = toast.loading('Saving...');
toast.success('Saved', { id });

// Log errors
console.error('Save failed:', error);
```

### DON'T ❌
```typescript
// Generic messages
toast.error('Error');

// Create multiple toasts
toast.loading('Saving...');
toast.success('Saved'); // Creates 2 toasts!

// Ignore errors
try { await save(); } catch {} // Silent failure

// No loading state
await save(); // User sees nothing
```

---

## 📱 Component Examples

### Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const loadingToast = toast.loading('Submitting...');
  setIsSubmitting(true);
  
  try {
    await submitForm(formData);
    toast.success('Form submitted successfully', { id: loadingToast });
    onClose();
  } catch (error) {
    toast.error('Failed to submit form', { id: loadingToast });
  } finally {
    setIsSubmitting(false);
  }
};
```

### Delete Operation
```typescript
const handleDelete = async (id: string, name: string) => {
  if (!confirm(`Delete "${name}"?`)) return;
  
  const loadingToast = toast.loading('Deleting...');
  
  try {
    await deleteItem(id);
    toast.success(`"${name}" deleted`, { id: loadingToast });
    refreshList();
  } catch (error) {
    toast.error('Failed to delete', { id: loadingToast });
  }
};
```

### Data Fetch
```typescript
const loadData = async () => {
  setLoading(true);
  
  try {
    const data = await fetchData();
    setData(data);
    toast.success(`Loaded ${data.length} items`, { duration: 2000 });
  } catch (error) {
    toast.error('Failed to load data. Please refresh.');
    console.error('Load error:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## 🔧 Troubleshooting

### Multiple Toasts Appearing
**Problem:** Creating new toast instead of updating existing one
```typescript
// ❌ Wrong
toast.loading('Saving...');
toast.success('Saved');

// ✅ Correct
const id = toast.loading('Saving...');
toast.success('Saved', { id });
```

### Toast Not Dismissing
**Problem:** Not using toast ID
```typescript
// ✅ Correct
const id = toast.loading('Processing...');
// ... later
toast.dismiss(id);
```

### Error Not Showing
**Problem:** Error caught but not displayed
```typescript
// ❌ Wrong
try { await save(); } catch {}

// ✅ Correct
try {
  await save();
} catch (error) {
  toast.error('Failed to save');
  console.error(error);
}
```

---

## 📚 Resources

- **Full Guide:** `ERROR_SUCCESS_HANDLING_GUIDE.md`
- **Implementation Summary:** `ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md`
- **Utilities:** `src/utils/error-handling.utils.ts`
- **Toast Service:** `src/services/toast.service.ts`

---

## 🎓 Quick Tips

1. **Always** provide user feedback for async operations
2. **Use** loading toasts for operations > 500ms
3. **Include** context in messages (names, IDs, etc.)
4. **Log** errors to console for debugging
5. **Test** both success and error paths
6. **Update** loading toasts instead of creating new ones
7. **Set** appropriate durations (3s success, 5s error)
8. **Handle** edge cases (network errors, auth errors)

---

**Remember:** Good error handling = Happy users! 🎉
