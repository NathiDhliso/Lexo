# Dark Mode Fix Examples

## Before and After Examples

### Example 1: Card Component with Shadow

**Before (Not Dark Mode Compatible):**
```tsx
<div className="bg-white rounded-lg shadow-lg p-6">
  <h2 className="text-gray-900">Card Title</h2>
  <p className="text-gray-600">Card content</p>
</div>
```

**After (Dark Mode Compatible):**
```tsx
<div className="bg-white dark:bg-metallic-gray-800 rounded-lg theme-shadow-lg p-6">
  <h2 className="text-gray-900 dark:text-neutral-100">Card Title</h2>
  <p className="text-gray-600 dark:text-neutral-400">Card content</p>
</div>
```

### Example 2: Form Input

**Before:**
```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
  placeholder="Enter text"
/>
```

**After:**
```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-900 text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
  placeholder="Enter text"
/>
```

**Or use theme class:**
```tsx
<input
  type="text"
  className="theme-input"
  placeholder="Enter text"
/>
```

### Example 3: Button with Shadow

**Before:**
```tsx
<button className="px-6 py-3 bg-white text-gray-900 rounded-lg shadow-md hover:shadow-lg">
  Click Me
</button>
```

**After:**
```tsx
<button className="px-6 py-3 bg-white dark:bg-metallic-gray-800 text-gray-900 dark:text-neutral-100 rounded-lg theme-shadow-md hover:theme-shadow-lg transition-shadow">
  Click Me
</button>
```

### Example 4: Dropdown Menu

**Before:**
```tsx
<div className="absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
  <button className="w-full px-4 py-2 text-left hover:bg-gray-50">
    Option 1
  </button>
</div>
```

**After:**
```tsx
<div className="absolute mt-2 w-48 bg-white dark:bg-metallic-gray-800 rounded-lg theme-shadow-lg border border-gray-200 dark:border-metallic-gray-700">
  <button className="w-full px-4 py-2 text-left text-gray-900 dark:text-neutral-100 hover:bg-gray-50 dark:hover:bg-metallic-gray-700">
    Option 1
  </button>
</div>
```

**Or use theme class:**
```tsx
<div className="theme-dropdown absolute mt-2 w-48">
  <button className="theme-dropdown-item w-full text-left">
    Option 1
  </button>
</div>
```

### Example 5: Table

**Before:**
```tsx
<table className="w-full">
  <thead>
    <tr className="bg-gray-50 border-b border-gray-200">
      <th className="px-4 py-2 text-left text-gray-700">Name</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-2 text-gray-900">John Doe</td>
    </tr>
  </tbody>
</table>
```

**After:**
```tsx
<table className="w-full">
  <thead>
    <tr className="bg-gray-50 dark:bg-metallic-gray-800 border-b border-gray-200 dark:border-metallic-gray-700">
      <th className="px-4 py-2 text-left text-gray-700 dark:text-neutral-300">Name</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-200 dark:border-metallic-gray-700 hover:bg-gray-50 dark:hover:bg-metallic-gray-800/50">
      <td className="px-4 py-2 text-gray-900 dark:text-neutral-100">John Doe</td>
    </tr>
  </tbody>
</table>
```

**Or use theme class:**
```tsx
<table className="theme-table">
  <thead>
    <tr>
      <th>Name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
    </tr>
  </tbody>
</table>
```

### Example 6: Modal

**Before:**
```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
  <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Modal Title</h2>
    <p className="text-gray-600">Modal content</p>
  </div>
</div>
```

**After:**
```tsx
<div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center">
  <div className="bg-white dark:bg-metallic-gray-800 rounded-lg theme-shadow-xl p-6 max-w-md border border-gray-200 dark:border-metallic-gray-700">
    <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100 mb-4">Modal Title</h2>
    <p className="text-gray-600 dark:text-neutral-400">Modal content</p>
  </div>
</div>
```

**Or use theme classes:**
```tsx
<div className="theme-modal-overlay fixed inset-0 flex items-center justify-center">
  <div className="theme-modal p-6 max-w-md">
    <h2 className="text-xl font-bold theme-text-primary mb-4">Modal Title</h2>
    <p className="theme-text-secondary">Modal content</p>
  </div>
</div>
```

### Example 7: Badge/Pill

**Before:**
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
  Active
</span>
```

**After:**
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
  Active
</span>
```

**Or use theme class:**
```tsx
<span className="theme-badge theme-badge-success">
  Active
</span>
```

### Example 8: Tooltip

**Before:**
```tsx
<div className="absolute bottom-full mb-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-lg">
  <div className="text-sm text-gray-900">Tooltip text</div>
</div>
```

**After:**
```tsx
<div className="absolute bottom-full mb-2 px-3 py-2 bg-white dark:bg-metallic-gray-800 border border-gray-200 dark:border-metallic-gray-700 rounded-lg theme-shadow-lg">
  <div className="text-sm text-gray-900 dark:text-neutral-100">Tooltip text</div>
</div>
```

**Or use theme class:**
```tsx
<div className="theme-tooltip absolute bottom-full mb-2">
  Tooltip text
</div>
```

### Example 9: Search Input with Icon

**Before:**
```tsx
<div className="relative">
  <input
    type="search"
    className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-lg"
    placeholder="Search..."
  />
  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
</div>
```

**After:**
```tsx
<div className="relative">
  <input
    type="search"
    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-900 text-gray-900 dark:text-neutral-100 rounded-lg"
    placeholder="Search..."
  />
  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-neutral-500" />
</div>
```

### Example 10: Inline Style with backgroundColor

**Before:**
```tsx
<div style={{ backgroundColor: '#FFFFFF' }}>
  Content
</div>
```

**After (Option 1 - CSS Variable):**
```tsx
<div style={{ backgroundColor: 'var(--theme-card-bg)' }}>
  Content
</div>
```

**After (Option 2 - Conditional):**
```tsx
const isDark = document.documentElement.classList.contains('dark');
<div style={{ backgroundColor: isDark ? '#212529' : '#FFFFFF' }}>
  Content
</div>
```

**After (Option 3 - Use className instead):**
```tsx
<div className="bg-white dark:bg-metallic-gray-800">
  Content
</div>
```

## Quick Fix Patterns

### Pattern 1: Container/Card
```tsx
// Add these classes to any container
className="bg-white dark:bg-metallic-gray-800 border border-gray-200 dark:border-metallic-gray-700"
```

### Pattern 2: Text
```tsx
// Headings
className="text-gray-900 dark:text-neutral-100"

// Body text
className="text-gray-700 dark:text-neutral-300"

// Muted text
className="text-gray-600 dark:text-neutral-400"

// Very muted text
className="text-gray-500 dark:text-neutral-500"
```

### Pattern 3: Borders
```tsx
// Light border
className="border-gray-200 dark:border-metallic-gray-700"

// Medium border
className="border-gray-300 dark:border-metallic-gray-600"

// Dark border
className="border-gray-400 dark:border-metallic-gray-500"
```

### Pattern 4: Backgrounds
```tsx
// Primary background
className="bg-white dark:bg-metallic-gray-800"

// Secondary background
className="bg-gray-50 dark:bg-metallic-gray-900"

// Tertiary background
className="bg-gray-100 dark:bg-metallic-gray-800"

// Hover background
className="hover:bg-gray-50 dark:hover:bg-metallic-gray-800"
```

### Pattern 5: Shadows
```tsx
// Replace Tailwind shadows with theme shadows
shadow-sm → theme-shadow-sm
shadow-md → theme-shadow-md
shadow-lg → theme-shadow-lg
shadow-xl → theme-shadow-xl

// With hover
hover:shadow-md → hover:theme-shadow-md transition-shadow
```

## Testing Your Fixes

After making changes, test with this checklist:

1. **Toggle Dark Mode**: Use your app's dark mode toggle
2. **Check Contrast**: Ensure text is readable on backgrounds
3. **Verify Borders**: Make sure borders are visible
4. **Test Shadows**: Shadows should be visible but not overwhelming
5. **Check Hover States**: Interactive elements should have visible hover effects
6. **Test Forms**: Inputs should be clearly visible and usable
7. **Verify Modals**: Overlays should have proper contrast
8. **Check Icons**: Icon colors should match the theme

## Common Mistakes to Avoid

1. **Forgetting the `dark:` prefix**: Always add dark mode variants
2. **Using hardcoded colors**: Use theme variables or Tailwind classes
3. **Inconsistent color choices**: Stick to your theme's color palette
4. **Missing text colors**: Don't forget to update text colors
5. **Ignoring hover states**: Add dark mode variants for hover states too
6. **Forgetting borders**: Borders often disappear in dark mode
7. **Shadow overload**: Dark mode shadows should be subtle

## Pro Tips

1. **Use theme classes when possible**: They're already dark mode compatible
2. **Group related changes**: Fix all instances in a component at once
3. **Test as you go**: Don't wait until the end to test dark mode
4. **Use CSS variables**: They automatically adapt to theme changes
5. **Be consistent**: Use the same color mappings throughout your app
6. **Document patterns**: Create a style guide for your team
