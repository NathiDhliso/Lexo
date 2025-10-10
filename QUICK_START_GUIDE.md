# LexoHub UI/UX Enhancement - Quick Start Guide

**Last Updated:** January 10, 2025

---

## 🚀 Quick Reference

### **New Components Available**

```tsx
import {
  Button,
  Badge,
  Card,
  EmptyState,
  SkeletonCard,
  SkeletonTable
} from '@/components/design-system/components';

import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { formatRand } from '@/lib/currency';
import { formatSADate, calculateVAT } from '@/lib/sa-legal-utils';
```

---

## 🎨 Common Patterns

### **1. Loading States**
```tsx
{isLoading ? (
  <div className="grid gap-4">
    <SkeletonCard />
    <SkeletonCard />
  </div>
) : (
  <YourContent />
)}
```

### **2. Empty States**
```tsx
{items.length === 0 && (
  <EmptyState
    icon={Briefcase}
    title="No items found"
    description="Get started by creating your first item."
    action={<Button variant="primary">Create Item</Button>}
  />
)}
```

### **3. VAT Display**
```tsx
const { subtotal, vat, total } = calculateVAT(amount);

<div className="p-3 bg-mpondo-gold-50 rounded-lg">
  <div>Subtotal (excl. VAT): {formatRand(subtotal / 1.15)}</div>
  <div>VAT (15%): {formatRand(amount * 0.15 / 1.15)}</div>
  <div>Total (incl. VAT): {formatRand(amount)}</div>
</div>
```

### **4. SA Date Format**
```tsx
<span>{formatSADate(new Date())}</span>
// Output: 10/01/2025
```

### **5. Buttons**
```tsx
<Button variant="primary" size="md" loading={isSubmitting}>
  Submit
</Button>

<Button variant="secondary">Cancel</Button>
<Button variant="outline">View</Button>
<Button variant="destructive">Delete</Button>
```

### **6. Badges**
```tsx
<Badge variant="success">Paid</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Overdue</Badge>
<Badge variant="info">Trust Account</Badge>
<Badge variant="legal">Practice No: ABC123</Badge>
```

### **7. Breadcrumbs**
```tsx
<Breadcrumb
  items={[
    { label: 'Dashboard', onClick: () => navigate('dashboard') },
    { label: 'Matters', onClick: () => navigate('matters') },
    { label: 'Current Matter' }
  ]}
/>
```

---

## 🎯 Brand Colors

### **Primary Actions**
- Use `variant="primary"` → Mpondo Gold (#D4AF37)

### **Secondary Actions**
- Use `variant="secondary"` → Judicial Blue (#1E3A8A)

### **Destructive Actions**
- Use `variant="destructive"` → Error Red

---

## 📱 Mobile Best Practices

### **Touch Targets**
```tsx
<Button size="md" className="min-h-[44px]">
  Tap Me
</Button>
```

### **Responsive Grids**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>
```

### **Flex Wrapping**
```tsx
<div className="flex flex-wrap items-center gap-3">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

---

## 🌓 Dark Mode

All components automatically support dark mode:

```tsx
<div className="bg-white dark:bg-metallic-gray-800">
  <p className="text-neutral-900 dark:text-neutral-100">
    Auto-adapts to theme
  </p>
</div>
```

---

## ✅ Checklist for New Features

- [ ] Use `Button` component with proper variants
- [ ] Add `loading` prop to async buttons
- [ ] Show `SkeletonCard` during data fetch
- [ ] Display `EmptyState` when no data
- [ ] Use `Badge` for status indicators
- [ ] Format amounts with `formatRand()`
- [ ] Format dates with `formatSADate()`
- [ ] Show VAT breakdown on invoices
- [ ] Ensure 44px minimum touch targets
- [ ] Test dark mode appearance
- [ ] Verify responsive behavior

---

## 🔗 Documentation Links

- **Full Implementation**: `UI_UX_IMPLEMENTATION_SUMMARY.md`
- **Usage Guide**: `DESIGN_SYSTEM_USAGE_GUIDE.md`
- **Before/After**: `UI_BEFORE_AFTER_COMPARISON.md`
- **Phase 2 Summary**: `PHASE_2_COMPLETION_SUMMARY.md`

---

## 🆘 Common Issues

### **Issue: Button not using brand colors**
**Solution:** Use `variant="primary"` instead of hardcoded classes

### **Issue: Date showing ISO format**
**Solution:** Use `formatSADate()` instead of `.toLocaleDateString()`

### **Issue: No VAT breakdown**
**Solution:** Use `calculateVAT()` utility and display breakdown

### **Issue: Touch targets too small**
**Solution:** Add `size="md"` and `min-h-[44px]`

---

## 📞 Quick Help

**Need a component?** Check `src/components/design-system/components/`  
**Need a utility?** Check `src/lib/`  
**Need an example?** Check `src/pages/ProFormaRequestsPage.tsx`

---

**Status:** ✅ Production Ready  
**Version:** 2.0  
**Last Updated:** January 10, 2025
