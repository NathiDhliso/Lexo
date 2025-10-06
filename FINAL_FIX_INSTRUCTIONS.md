# Final Fix Instructions - Remove All Template Code

## Current Status

✅ Fixed: App.tsx - removed deleted page imports  
✅ Fixed: src/pages/index.ts - cleaned up exports  
⚠️ Needs Fix: NewMatterModal.tsx - has template code scattered throughout

## Option 1: Use the Backup (RECOMMENDED)

The NewMatterModal has too many template references. Easiest solution:

1. **Restore from backup and use NewMatterMultiStep instead:**
```powershell
# The backup is at: src/components/matters/NewMatterModal.tsx.backup
# We created a better multi-step version: src/components/matters/NewMatterMultiStep.tsx

# Just update MattersPage to use the new multi-step form
```

2. **Or comment out template code temporarily:**
```typescript
// In NewMatterModal.tsx, wrap all template code in /* */ comments
```

## Option 2: Manual Cleanup (If you want to keep NewMatterModal)

### Lines to Delete in NewMatterModal.tsx:

**1. Remove template handler functions (lines 400-490):**
- handleTemplateSelect
- handleSaveAsTemplate  
- convertFormDataToTemplateData
- handleApplyTemplateSuggestion

**2. Remove template buttons (around line 1200-1220):**
```typescript
// Delete the "Templates" button
// Delete the "Save Template" button
```

**3. Remove template modals (lines 1330-1356):**
```typescript
// Delete <TemplateLibraryModal ... />
// Delete <SaveTemplateModal ... />
```

**4. Fix type errors:**
```typescript
// Line 225: Change to
const [serviceCategories, setServiceCategories] = useState<any[]>([]);

// Line 226: Change to  
const [services, setServices] = useState<any[]>([]);
```

## Option 3: Use Our New Components (BEST)

We already created better components:
- ✅ MultiStepForm.tsx
- ✅ NewMatterMultiStep.tsx  
- ✅ AutoPopulationService

These don't have template dependencies!

## Quick Test

After fixing, test with:
```powershell
npm run dev
```

If you still see errors, commit what you have and push:
```bash
git add .
git commit -m "wip: cleaning up template references"
git push --set-upstream origin feature/streamline-core-features
```

Then we can continue fixing in the next session.

## Summary

**Easiest path forward:**
1. Comment out the template code in NewMatterModal for now
2. Test the app
3. Commit and push
4. Later, switch to using NewMatterMultiStep.tsx (which we already created!)

The app should work even with some template code commented out, as long as the imports are fixed (which they are).
