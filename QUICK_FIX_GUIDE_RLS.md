# Quick Fix Guide - RLS Errors

## The Problem

You're seeing these errors in your console:
- ❌ `406 Not Acceptable` on `advocate_billing_preferences`
- ❌ `403 Forbidden` on `retainer_agreements`

## The Solution (30 seconds)

Run this command:

```powershell
.\apply-all-rls-fixes.ps1
```

That's it! The script will:
1. Load your Supabase credentials
2. Apply 3 database migrations
3. Fix all permission issues

## What Gets Fixed

### Before
```
❌ GET /advocate_billing_preferences → 406 Not Acceptable
❌ GET /retainer_agreements → 403 Forbidden
```

### After
```
✓ GET /advocate_billing_preferences → 200 OK
✓ GET /retainer_agreements → 200 OK
```

## Verification

1. Run the script
2. Refresh your app (Ctrl+Shift+R)
3. Check console - errors should be gone
4. Test invoice generation - should work now

## If It Doesn't Work

1. Check your `.env` file has:
   ```
   VITE_SUPABASE_URL=https://...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. Try manual application:
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Run each file in `supabase/migrations/` starting with `20251027`

## Files Created

- ✓ 3 SQL migration files (in `supabase/migrations/`)
- ✓ 3 PowerShell scripts (in root)
- ✓ This guide
- ✓ Detailed summary (`RLS_FIXES_SUMMARY.md`)

## Need More Details?

See `RLS_FIXES_SUMMARY.md` for:
- Technical explanation
- Manual application steps
- Troubleshooting guide
- Policy details
