# Final Cleanup Guide - Remove ALL Non-Essential Files

## 🎯 What Will Be Removed

### Root Folders (7)
- `.kiro/` - Unknown tool
- `.trae/` - Unknown tool
- `.storybook/` - Storybook config (not needed)
- `storybook-static/` - Storybook build
- `aws/` - Old AWS experiments
- `dev-tools/` - Development tools
- `Systemprompts/` - Old prompts

### Documentation Files (12)
- All the old fix/audit MD files
- Migration verification docs
- Zoom/responsive design fixes
- Template setup guides
- etc.

### SQL Debug Files (11)
- All `check_*.sql` files
- All `debug_*.sql` files
- All `verify_*.sql` files

### Old Scripts (11)
- All old migration scripts
- All old fix scripts
- Previous cleanup scripts

### Implementation Docs (26)
- Old integration guides
- Old implementation summaries
- Duplicate workflow docs
- RBAC docs (simplified now)

### Doc Folders (4)
- `docs/architecture/`
- `docs/assets/`
- `docs/phases/`
- `docs/security/`

---

## ✅ What Will Be Kept

### Essential Root Files
- `README.md` - Project overview
- `CLEANUP_COMPLETE.md` - Cleanup summary
- `package.json` - Dependencies
- `vite.config.ts` - Build config
- `tailwind.config.js` - Styling
- `tsconfig.json` - TypeScript config
- `.env` - Environment variables
- `.gitignore` - Git config

### Essential Folders
- `src/` - Application code
- `types/` - TypeScript types
- `database/` - Schema files
- `supabase/` - Migrations
- `node_modules/` - Dependencies
- `dist/` - Build output

### Essential Docs (9)
- `docs/CORE_FEATURES_ONLY.md`
- `docs/CLEANUP_STATUS.md`
- `docs/implementation/README.md`
- `docs/implementation/AWS_SCALE_ARCHITECTURE.md`
- `docs/implementation/COMPLETE_IMPLEMENTATION_SUMMARY.md`
- `docs/implementation/FINANCIAL_WORKFLOW_ENHANCEMENT.md`
- `docs/implementation/PHASE1_FINAL_SUMMARY.md`
- `docs/implementation/WEEK3-10_IMPLEMENTATION_PLAN.md`
- `docs/implementation/end_to_end_billing_matter_workflow.md`
- `docs/database/` (schema docs)

---

## 🚀 How to Run

### One Command - Clean Everything
```powershell
.\MASTER-CLEANUP.ps1
```

This will:
1. Remove all non-essential folders
2. Remove all old documentation
3. Remove all debug SQL files
4. Remove all old scripts
5. Remove duplicate implementation docs
6. Show summary of what was removed
7. List what was kept

---

## 📊 Before vs After

### Before
- **Root files:** 40+
- **Root folders:** 15+
- **Implementation docs:** 34
- **Total clutter:** HIGH

### After
- **Root files:** 10 essential
- **Root folders:** 7 essential
- **Implementation docs:** 9 essential
- **Total clutter:** ZERO

---

## ✅ Run This Now

```powershell
cd c:\Users\nathi\Downloads\LexoHub
.\MASTER-CLEANUP.ps1
```

Then test:
```powershell
npm run dev
```

Then commit:
```bash
git add .
git commit -m "chore: final cleanup - streamline to core features only"
git push origin feature/streamline-core-features
```

---

## 🎉 Result

A clean, focused codebase with:
- Only core features (Matters, Pro Forma, Invoices)
- Only essential documentation
- No clutter, no confusion
- Ready for AWS migration
- Easy to maintain

**Ready to clean up?** Run `.\MASTER-CLEANUP.ps1` now! 🚀
