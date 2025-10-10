# Design System Usage Guide

Quick reference for using the enhanced design system components.

---

## 🎨 Button Component

### Variants
```tsx
import { Button } from '@/components/design-system/components';

<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline">View Details</Button>
<Button variant="ghost">Edit</Button>
<Button variant="destructive">Delete</Button>
```

### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

### Loading State
```tsx
<Button loading={isSubmitting}>
  Submit Invoice
</Button>
```

---

## 🃏 Card Component

### Variants
```tsx
import { Card, CardHeader, CardContent } from '@/components/design-system/components';

<Card variant="default">Standard card</Card>
<Card variant="elevated">Raised card with more shadow</Card>
<Card variant="outlined">Border emphasis</Card>
<Card variant="legal">Formal document style</Card>
```

### Hoverable
```tsx
<Card hoverable onClick={handleClick}>
  Clickable card with hover effect
</Card>
```

---

## 🏷️ Badge Component

### Variants
```tsx
import { Badge } from '@/components/design-system/components';

<Badge variant="default">Default</Badge>
<Badge variant="success">Paid</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Overdue</Badge>
<Badge variant="info">Sent</Badge>
<Badge variant="legal">Practice No: ABC123</Badge>
```

---

## 📭 Empty State Component

```tsx
import { EmptyState } from '@/components/design-system/components';
import { Briefcase } from 'lucide-react';

<EmptyState
  icon={Briefcase}
  title="No matters found"
  description="You haven't created any matters yet. Get started by creating your first matter."
  action={
    <Button variant="primary" onClick={handleCreate}>
      Create Matter
    </Button>
  }
/>
```

---

## ⏳ Skeleton Loaders

### Basic Skeleton
```tsx
import { Skeleton } from '@/components/design-system/components';

<Skeleton variant="text" width="60%" />
<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="rectangular" height={200} />
<Skeleton count={3} />
```

### Pre-built Skeletons
```tsx
import { SkeletonCard, SkeletonTable } from '@/components/design-system/components';

{isLoading ? <SkeletonCard /> : <MatterCard matter={matter} />}
{isLoading ? <SkeletonTable rows={5} /> : <DataTable data={data} />}
```

---

## 🇿🇦 SA Legal Utilities

### VAT Calculations
```tsx
import { calculateVAT, extractVATFromTotal } from '@/lib/sa-legal-utils';

const { subtotal, vat, total } = calculateVAT(10000);

console.log(subtotal); // 10000.00
console.log(vat);      // 1500.00
console.log(total);    // 11500.00

const breakdown = extractVATFromTotal(11500);
console.log(breakdown.subtotal); // 10000.00
```

### Date Formatting
```tsx
import { formatSADate } from '@/lib/sa-legal-utils';

const saDate = formatSADate(new Date());
console.log(saDate); // "10/10/2025"
```

### Practice Number
```tsx
import { formatPracticeNumber, validatePracticeNumber } from '@/lib/sa-legal-utils';

const formatted = formatPracticeNumber('abc 123');
console.log(formatted); // "ABC123"

const isValid = validatePracticeNumber('ABC1234');
console.log(isValid); // true
```

### Trust Account Check
```tsx
import { isTrustAccountMatter } from '@/lib/sa-legal-utils';

const isTrust = isTrustAccountMatter('conveyancing');
console.log(isTrust); // true
```

---

## 🎨 Design Tokens (CSS Variables)

### Spacing
```css
padding: var(--space-xs);   /* 0.25rem */
padding: var(--space-sm);   /* 0.5rem */
padding: var(--space-md);   /* 1rem */
padding: var(--space-lg);   /* 1.5rem */
padding: var(--space-xl);   /* 2rem */
padding: var(--space-2xl);  /* 3rem */
padding: var(--space-3xl);  /* 4rem */
```

### Typography
```css
font-size: var(--text-2xs);  /* 0.625rem */
font-size: var(--text-xs);   /* 0.75rem */
font-size: var(--text-sm);   /* 0.875rem */
font-size: var(--text-base); /* 1rem */
font-size: var(--text-lg);   /* 1.125rem */
font-size: var(--text-xl);   /* 1.25rem */
font-size: var(--text-2xl);  /* 1.5rem */
font-size: var(--text-3xl);  /* 1.875rem */
```

### Elevation
```css
box-shadow: var(--elevation-0);  /* none */
box-shadow: var(--elevation-1);  /* subtle */
box-shadow: var(--elevation-2);  /* light */
box-shadow: var(--elevation-4);  /* medium */
box-shadow: var(--elevation-6);  /* raised */
box-shadow: var(--elevation-8);  /* elevated */
box-shadow: var(--elevation-12); /* high */
box-shadow: var(--elevation-24); /* dramatic */
```

### Legal Colors
```css
color: var(--legal-urgent);     /* #dc2626 - red */
color: var(--legal-priority);   /* #f59e0b - orange */
color: var(--legal-routine);    /* #6c757d - gray */
color: var(--legal-trust);      /* #0891b2 - cyan */
color: var(--legal-compliance); /* #059669 - green */
```

---

## 🎨 Tailwind Legal Colors

```tsx
<div className="text-legal-urgent">Urgent deadline</div>
<div className="bg-legal-priority">Priority matter</div>
<div className="border-legal-trust">Trust account</div>
<div className="text-legal-compliance">Compliant</div>
```

---

## 📱 Responsive Breakpoints

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {/* Mobile: 1 col, Small: 2 cols, Medium: 3 cols, Large: 4 cols */}
</div>

<Button className="min-h-[44px] min-w-[44px]">
  {/* Ensures 44px touch target on mobile */}
</Button>
```

---

## 🌓 Dark Mode Support

All components automatically support dark mode:

```tsx
<div className="bg-white dark:bg-metallic-gray-800">
  <p className="text-neutral-900 dark:text-neutral-100">
    Automatically adapts to theme
  </p>
</div>
```

---

## ✅ Best Practices

### Touch Targets
Always ensure interactive elements are at least 44x44px:
```tsx
<Button size="md" className="min-h-[44px]">Click Me</Button>
```

### Loading States
Show skeleton loaders during data fetching:
```tsx
{isLoading ? (
  <SkeletonCard />
) : (
  <InvoiceCard invoice={invoice} />
)}
```

### Empty States
Replace "No data" text with EmptyState component:
```tsx
{matters.length === 0 ? (
  <EmptyState
    icon={Briefcase}
    title="No matters found"
    action={<Button>Create Matter</Button>}
  />
) : (
  <MatterList matters={matters} />
)}
```

### VAT Display
Always show VAT breakdown on invoices:
```tsx
const { subtotal, vat, total } = calculateVAT(amount);

<div>
  <div>Subtotal: {formatRand(subtotal)}</div>
  <div>VAT (15%): {formatRand(vat)}</div>
  <div>Total: {formatRand(total)}</div>
</div>
```

### SA Date Format
Use formatSADate for all user-facing dates:
```tsx
<span>{formatSADate(invoice.dateIssued)}</span>
```

---

## 🚀 Quick Start Checklist

- [ ] Use `Button` component with proper variants
- [ ] Add `loading` prop to async buttons
- [ ] Use `Badge` for status indicators
- [ ] Show `EmptyState` when no data
- [ ] Use `Skeleton` loaders during fetch
- [ ] Display VAT breakdown on invoices
- [ ] Format dates with `formatSADate`
- [ ] Ensure 44px minimum touch targets
- [ ] Test dark mode appearance
- [ ] Verify responsive behavior

---

## 📚 Component Reference

| Component | Import Path | Key Props |
|-----------|-------------|-----------|
| Button | `@/components/design-system/components` | variant, size, loading |
| Card | `@/components/design-system/components` | variant, hoverable |
| Badge | `@/components/design-system/components` | variant |
| EmptyState | `@/components/design-system/components` | icon, title, description, action |
| Skeleton | `@/components/design-system/components` | variant, width, height, count |
| SkeletonCard | `@/components/design-system/components` | className |
| SkeletonTable | `@/components/design-system/components` | rows, className |

---

For detailed implementation examples, see `UI_UX_IMPLEMENTATION_SUMMARY.md`.
