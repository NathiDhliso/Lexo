# RLS Fixes Summary

## Issues Identified

Based on your console errors, there are two main database permission issues:

### 1. 406 Not Acceptable Error
```
GET .../advocate_billing_preferences?select=*&advocate_id=eq.dcea3d54... 406 (Not Acceptable)
```

**Cause**: The `advocate_billing_preferences` table may have incomplete permissions or missing grants for the authenticated role.

**Impact**: Users cannot fetch their billing preferences, which affects:
- Dashboard configuration
- Billing workflow selection
- User preferences

### 2. 403 Forbidden Error
```
GET .../retainer_agreements?select=id&matter_id=eq.4a3b9ac0... 403 (Forbidden)
```

**Cause**: The RLS policies on `retainer_agreements` were checking `advocate_id = auth.uid()` directly, but the table's `advocate_id` column references the `advocates` table, not `auth.users`. The correct approach is to check if the user owns the matter.

**Impact**: Users cannot check if matters have retainer agreements, which affects:
- Invoice generation workflow
- Matter detail views
- Financial tracking

## Solutions Provided

### Migration Files Created

1. **20251027180000_fix_advocate_billing_preferences_rls.sql**
   - Fixes RLS policies for billing preferences
   - Ensures users can only access their own preferences

2. **20251027191000_fix_advocate_billing_preferences_406.sql**
   - Adds explicit grants to authenticated role
   - Ensures proper table structure
   - Fixes content negotiation issues

3. **20251027190000_fix_retainer_agreements_rls.sql**
   - Fixes RLS policies to check matter ownership
   - Allows users to access retainer agreements for their matters
   - Adds proper CRUD policies

### PowerShell Scripts Created

1. **apply-all-rls-fixes.ps1** (RECOMMENDED)
   - Applies all three migrations in sequence
   - Provides detailed progress feedback
   - Handles errors gracefully

2. **apply-billing-preferences-rls-fix.ps1**
   - Applies only billing preferences fixes

3. **apply-retainer-rls-fix.ps1**
   - Applies only retainer agreements fix

## How to Apply Fixes

### Option 1: Apply All Fixes (Recommended)

```powershell
.\apply-all-rls-fixes.ps1
```

This will:
- Load your Supabase credentials from `.env`
- Apply all three migrations
- Provide a summary of results

### Option 2: Apply Individual Fixes

If you want to apply fixes one at a time:

```powershell
# Fix billing preferences
.\apply-billing-preferences-rls-fix.ps1

# Fix retainer agreements
.\apply-retainer-rls-fix.ps1
```

### Option 3: Manual Application via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file content
4. Execute them in order:
   - `20251027180000_fix_advocate_billing_preferences_rls.sql`
   - `20251027191000_fix_advocate_billing_preferences_406.sql`
   - `20251027190000_fix_retainer_agreements_rls.sql`

## Verification

After applying the fixes:

1. **Refresh your application** - Hard refresh (Ctrl+Shift+R)

2. **Check the console** - The errors should be gone:
   - ✓ No more 406 errors on `advocate_billing_preferences`
   - ✓ No more 403 errors on `retainer_agreements`

3. **Verify in Supabase Dashboard**:
   - Go to Authentication > Policies
   - Check that policies exist for both tables
   - Verify they use `auth.uid()` correctly

4. **Test functionality**:
   - Navigate to different pages
   - Check that billing preferences load
   - Verify invoice generation works
   - Confirm matter details display correctly

## Technical Details

### Billing Preferences RLS Policies

```sql
-- Users can only view their own preferences
CREATE POLICY "select_own_billing_preferences"
  ON advocate_billing_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = advocate_id);
```

### Retainer Agreements RLS Policies

```sql
-- Users can view retainer agreements for matters they own
CREATE POLICY "Users can view retainer agreements for their matters"
  ON retainer_agreements
  FOR SELECT
  TO authenticated
  USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );
```

## Screenshot Context

The screenshot you shared shows an "Open Invoice Generator" button, which is part of the billing workflow. The 403 error on `retainer_agreements` was likely preventing the system from checking if the matter has a retainer agreement before generating an invoice.

After applying these fixes, the invoice generation workflow should work smoothly without permission errors.

## Troubleshooting

If errors persist after applying fixes:

1. **Check your .env file** has correct credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Clear browser cache** and do a hard refresh

3. **Check Supabase logs**:
   - Go to Supabase Dashboard > Logs
   - Look for any RLS policy violations

4. **Verify user authentication**:
   - Ensure you're logged in
   - Check that `auth.uid()` returns your user ID

5. **Re-run migrations** if needed:
   ```powershell
   .\apply-all-rls-fixes.ps1
   ```

## Need Help?

If you continue to experience issues:
- Check the Supabase Dashboard for policy details
- Review the browser console for specific error messages
- Verify that migrations were applied successfully
