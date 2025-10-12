# ⚠️ STOP - READ THIS FIRST ⚠️

## 🚨 Your App is Broken Because Migrations Haven't Run Yet!

### The Errors You're Seeing:

```
❌ 406 - user_profiles access denied (RLS blocking)
❌ 400 - full_name column doesn't exist
❌ 500 - Internal server error
```

### Why This is Happening:

**The code has been updated to use `user_profiles`, but your database still has the old schema!**

The migrations that add the required columns and fix RLS policies **have NOT been applied yet**.

## ✅ THE FIX (Run This Now!)

### Step 1: Run the Migration Script
```powershell
.\fix-database-now.ps1
```

**This MUST be done first!** It will:
- Add `full_name` column to `user_profiles`
- Add `phone`, `practice_number`, and all other advocate columns
- Fix RLS policies to allow access
- Update foreign keys

### Step 2: Restart Dev Server
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

### Step 3: Clear Browser Cache
- Hard refresh: `Ctrl + Shift + R`

### Step 4: Test
- Login should now work
- Profile should load
- No more 406/400 errors

## 🔍 Optional: Check Database Status First

If you want to see what's missing:
```powershell
.\check-database-status.ps1
```

This will show you the current `user_profiles` table structure.

## ❌ DO NOT:

- ❌ Try to fix the code (it's already correct)
- ❌ Revert the code changes
- ❌ Try to debug the 406/400 errors

## ✅ DO:

- ✅ Run `.\fix-database-now.ps1`
- ✅ Wait for migrations to complete
- ✅ Restart dev server
- ✅ Test your app

## 📋 What the Migration Does:

1. **Adds columns to user_profiles:**
   - `full_name` ← This is why you're getting 400 error
   - `phone`
   - `practice_number`
   - `year_admitted`
   - `hourly_rate`
   - `chambers_address`
   - `postal_address`
   - `firm_name`
   - `firm_tagline`
   - `firm_logo_url`
   - `vat_number`
   - `bank_name`
   - `bank_account_number`
   - `bank_branch_code`
   - `is_active`
   - `user_role`
   - `initials`
   - `email`
   - `last_login_at`

2. **Fixes RLS policies:**
   - `user_profiles` - Allows authenticated users to access their profile
   - `subscriptions` - Allows authenticated users to access their subscription
   - `pdf_templates` - Allows authenticated users to access their templates
   - `invoices` - Allows authenticated users to access their invoices
   - `proforma_requests` - Allows authenticated users to access their requests
   - `matters` - Allows authenticated users to access their matters

3. **Updates foreign keys:**
   - All tables that reference `advocate_id` now point to `user_profiles.user_id`

## 🎯 Expected Timeline:

```
1. Run .\fix-database-now.ps1     → 30 seconds
2. Restart dev server              → 10 seconds
3. Clear browser cache             → 5 seconds
4. Test app                        → Works! ✅
```

## 🆘 If Migration Fails:

Check the error message. Common issues:
- Supabase CLI not installed
- Not logged in to Supabase
- Wrong project selected

Fix and re-run the script.

## 📞 After Migration Succeeds:

You should see:
```
✓ Deleted obsolete migrations
✓ Running migrations...
✓ Schema alignment complete
✓ RLS policies fixed
✓ Migration complete!
```

Then your app will work perfectly!

---

## 🎉 TL;DR

**Your code is fine. Your database needs updating.**

**Run this ONE command:**
```powershell
.\fix-database-now.ps1
```

**Then restart your dev server and test.**

That's it!
