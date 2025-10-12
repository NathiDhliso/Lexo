# Dark Mode Quick Reference Card

## 🎯 The Problem
Components using Tailwind utilities without `dark:` variants don't adapt to dark mode.

## 🔧 The Solution
Add dark mode variants to all color-related classes.

---

## 📋 Copy-Paste Fixes

### Containers & Cards
```tsx
// ❌ Before
className="bg-white border border-gray-200 shadow-lg"

// ✅ After
className="bg-white dark:bg-metallic-gray-800 border border-gray-200 dark:border-metallic-gray-700 theme-shadow-lg"
```

### Text Colors
```tsx
// Headings
text-gray-900 → text-gray-900 dark:text-neutral-100

// Body text
text-gray-700 → text-gray-700 dark:text-neutral-300

// Muted text
text-gray-600 → text-gray-600 dark:text-neutral-400

// Very muted
text-gray-500 → text-gray-500 dark:text-neutral-500
```

### Borders
```tsx
// Light border
border-gray-200 → border-gray-200 dark:border-metallic-gray-700

// Medium border
border-gray-300 → border-gray-300 dark:border-metallic-gray-600

// Dark border
border-gray-400 → border-gray-400 dark:border-metallic-gray-500
```

### Backgrounds
```tsx
// Primary
bg-white → bg-white dark:bg-metallic-gray-800

// Secondary
bg-gray-50 → bg-gray-50 dark:bg-metallic-gray-900

// Tertiary
bg-gray-100 → bg-gray-100 dark:bg-metallic-gray-800

// Hover
hover:bg-gray-50 → hover:bg-gray-50 dark:hover:bg-metallic-gray-800
```

### Shadows
```tsx
// Replace Tailwind shadows with theme shadows
shadow-sm → theme-shadow-sm
shadow-md → theme-shadow-md
shadow-lg → theme-shadow-lg
shadow-xl → theme-shadow-xl

// With hover
hover:shadow-md → hover:theme-shadow-md transition-shadow
```

### Form Inputs
```tsx
// ❌ Before
className="border border-gray-300 bg-white text-gray-900"

// ✅ After
className="border border-gray-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-900 text-gray-900 dark:text-neutral-100"
```

### Buttons
```tsx
// ❌ Before
className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"

// ✅ After
className="bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100 border border-gray-300 dark:border-metallic-gray-600 hover:bg-gray-50 dark:hover:bg-metallic-gray-700"
```

### Dropdowns
```tsx
// ❌ Before
className="bg-white border border-gray-200 shadow-lg"

// ✅ After
className="bg-white dark:bg-metallic-gray-800 border border-gray-200 dark:border-metallic-gray-700 theme-shadow-lg"
```

### Modals
```tsx
// Overlay
className="bg-black/50" → className="bg-black/50 dark:bg-black/80"

// Modal container
className="bg-white shadow-xl" → className="bg-white dark:bg-metallic-gray-800 theme-shadow-xl"
```

### Tooltips
```tsx
// ❌ Before
className="bg-white border border-gray-200 shadow-lg text-gray-900"

// ✅ After
className="bg-white dark:bg-metallic-gray-800 border border-gray-200 dark:border-metallic-gray-700 theme-shadow-lg text-gray-900 dark:text-neutral-100"
```

### Tables
```tsx
// Header
className="bg-gray-50 text-gray-700" → className="bg-gray-50 dark:bg-metallic-gray-800 text-gray-700 dark:text-neutral-300"

// Row
className="border-b border-gray-200 hover:bg-gray-50" → className="border-b border-gray-200 dark:border-metallic-gray-700 hover:bg-gray-50 dark:hover:bg-metallic-gray-800/50"

// Cell
className="text-gray-900" → className="text-gray-900 dark:text-neutral-100"
```

---

## 🎨 Theme Classes (Already Dark Mode Compatible)

Use these instead of Tailwind utilities:

```tsx
// Cards
<div className="theme-card">...</div>

// Buttons
<button className="theme-button-primary">...</button>
<button className="theme-button-secondary">...</button>

// Inputs
<input className="theme-input" />

// Dropdowns
<div className="theme-dropdown">
  <button className="theme-dropdown-item">...</button>
</div>

// Badges
<span className="theme-badge theme-badge-success">...</span>
<span className="theme-badge theme-badge-warning">...</span>
<span className="theme-badge theme-badge-error">...</span>

// Text
<p className="theme-text-primary">...</p>
<p className="theme-text-secondary">...</p>
<p className="theme-text-tertiary">...</p>

// Shadows
<div className="theme-shadow-lg">...</div>
<div className="hover:theme-shadow-md transition-shadow">...</div>

// Tables
<table className="theme-table">...</table>

// Tooltips
<div className="theme-tooltip">...</div>
```

---

## 🔍 Find Issues

```powershell
# Run the checker
.\check-dark-mode.ps1

# Find specific issues
rg "shadow-(sm|md|lg|xl)" src/
rg 'bg-white(?!.*dark:)' src/
rg 'border-gray-\d+(?!.*dark:)' src/
rg 'text-gray-\d+(?!.*dark:)' src/
```

---

## ✅ Testing Checklist

After each fix:
- [ ] Toggle dark mode
- [ ] Check text readability
- [ ] Verify borders are visible
- [ ] Confirm shadows look good
- [ ] Test hover states
- [ ] Check form inputs
- [ ] Verify modals/overlays

---

## 📚 Full Documentation

- `START_DARK_MODE_FIX.md` - Quick start guide
- `DARK_MODE_EXAMPLES.md` - Detailed examples
- `DARK_MODE_FIX_GUIDE.md` - Complete strategy
- `DARK_MODE_ANALYSIS_SUMMARY.md` - Full analysis

---

## 🚀 Quick Start

1. Read `START_DARK_MODE_FIX.md`
2. Run `.\check-dark-mode.ps1`
3. Fix `SubscriptionCallbackPage.tsx` first
4. Test by toggling dark mode
5. Continue with priority files

---

## 💡 Pro Tips

1. **Use Find & Replace** for repetitive fixes
2. **Fix one pattern at a time** (all shadows, then all backgrounds)
3. **Test frequently** - don't wait until the end
4. **Use theme classes** when possible
5. **Be consistent** with color mappings

---

## 🎯 Current Status

**128 files** need dark mode fixes:
- 47 files: Shadow utilities
- 21 files: bg-white without dark
- 23 files: border-gray without dark
- 36 files: text-gray without dark
- 1 file: Inline backgroundColor

**Estimated time**: 7 hours

---

## 🏆 Success Criteria

- ✅ All text readable in dark mode
- ✅ All borders visible
- ✅ Shadows appropriate for dark mode
- ✅ Forms usable in dark mode
- ✅ Consistent dark mode experience
- ✅ No contrast issues

---

**Print this page and keep it handy while fixing dark mode issues!**
