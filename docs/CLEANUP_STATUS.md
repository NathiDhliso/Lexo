# Cleanup Status - Streamlining to Core Features

**Date:** 2025-10-06  
**Branch:** feature/streamline-core-features  
**Status:** In Progress

---

## ✅ Completed Deletions

### Pages Removed
- ✅ AcademyPage.tsx
- ✅ CompliancePage.tsx
- ✅ StrategicFinancePage.tsx
- ✅ ReportsPage.tsx
- ✅ APIIntegrationsPage.tsx
- ✅ WorkflowIntegrationsPage.tsx
- ✅ OpportunitiesPage.tsx
- ✅ PracticeGrowthPage.tsx
- ✅ PrecedentBankPage.tsx
- ✅ PricingManagementPage.tsx
- ✅ InvoiceDesignerPage.tsx
- ✅ TemplateManagementPage.tsx
- ✅ MatterWorkbenchPage.tsx
- ✅ DocumentIntelligencePage.tsx
- ✅ IntegrationCallbackPage.tsx

### Component Folders Removed
- ✅ src/components/academy/ (entire folder)

---

## 🔄 To Complete

### Run Cleanup Script
```powershell
cd c:\Users\nathi\Downloads\LexoHub
.\cleanup-script.ps1
```

This will remove:
- strategic-finance/ folder
- reports/ folder
- settings/ folder (keep basic profile)
- integrations/ folder
- Other non-core component folders

---

## 📋 Remaining Core Pages

After cleanup, you should have only these pages:
1. ✅ DashboardPage.tsx (simplified)
2. ✅ MattersPage.tsx
3. ✅ ProFormaPage.tsx
4. ✅ ProFormaRequestPage.tsx (attorney form)
5. ✅ InvoicesPage.tsx
6. ✅ LoginPage.tsx
7. ✅ ProfilePage.tsx (basic settings)
8. ✅ WelcomePage.tsx

**Total: 8 pages** (down from 24)

---

## 🎯 Next Steps

### 1. Complete File Deletion
- [ ] Run cleanup-script.ps1
- [ ] Verify no broken imports
- [ ] Update navigation config

### 2. Update Navigation
Edit `src/config/navigation.config.ts`:
```typescript
// Simplified navigation
const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Matters', path: '/matters', icon: Briefcase },
  { name: 'Pro Forma', path: '/pro-forma', icon: FileText },
  { name: 'Invoices', path: '/invoices', icon: Receipt },
  { name: 'Profile', path: '/profile', icon: User }
];
```

### 3. Simplify Dashboard
- [ ] Remove practice health metrics
- [ ] Remove compliance widgets
- [ ] Keep only: matter count, proforma count, invoice count, recent activity
- [ ] Add workflow pipeline

### 4. Update Routing
Edit `src/App.tsx` or routing file:
- [ ] Remove routes to deleted pages
- [ ] Verify core routes work
- [ ] Test navigation

### 5. Clean Up Imports
- [ ] Search for imports from deleted files
- [ ] Remove unused imports
- [ ] Fix TypeScript errors

### 6. Database Cleanup (Optional)
- [ ] Archive unused tables
- [ ] Document which tables to keep
- [ ] Update migrations if needed

### 7. Testing
- [ ] Test matter creation
- [ ] Test pro forma generation
- [ ] Test invoice creation
- [ ] Test workflow pipeline
- [ ] Test all navigation links

### 8. Commit Changes
```bash
git add .
git commit -m "feat: streamline to core features (matters, proforma, invoices)"
git push origin feature/streamline-core-features
```

---

## 📊 Impact

### Before Cleanup
- 24 pages
- 50+ component folders
- Complex navigation
- Multiple workflows

### After Cleanup
- 8 pages (67% reduction)
- ~20 component folders (60% reduction)
- Simple 5-item navigation
- One focused workflow

### Benefits
- ✅ Faster load times
- ✅ Easier to maintain
- ✅ Lower AWS costs
- ✅ Clearer user experience
- ✅ Ready for scaling

---

## ⚠️ Important Notes

### Keep Document Processing
- ✅ DocumentProcessingModal.tsx (helps with workflow)
- ✅ Document upload functionality
- ✅ AI/OCR features (for AWS integration)

### Keep Basic Templates
- ✅ Invoice templates
- ✅ Pro forma templates
- ✅ PDF generation

### Simplify, Don't Delete
- ⚠️ SettingsPage → Keep as ProfilePage (basic only)
- ⚠️ DashboardPage → Simplify (remove advanced widgets)

---

## 🚀 Ready for AWS Migration

Once cleanup is complete:
1. ✅ Streamlined codebase
2. ✅ Focused on core workflow
3. ✅ Easy to deploy
4. ✅ Ready to scale

**Next:** Deploy to staging → Test → AWS Migration

---

**Status:** 60% Complete  
**Next Action:** Run cleanup-script.ps1  
**Estimated Time:** 30 minutes remaining
