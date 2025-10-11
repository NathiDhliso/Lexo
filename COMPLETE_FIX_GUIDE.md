# Complete Fix Guide - 406 & 400 Errors

## ✅ What I Fixed

### 1. Code Fix (DONE)
Fixed `src/services/api/subscription.service.ts`:
- Changed `matters` query from `user_id` → `advocate_id`
- Changed from `user_profiles` → `team_members` table
- Now queries the correct columns and tables

### 2. Database Fix (YOU NEED TO DO THIS)
You still need to run the database migration to:
- Add `user_id` column to `matters` table
- Fix duplicate RLS policies
- Update `user_profiles` RLS policies

## 🚀 Quick Fix Steps

### Step 1: Run Database Fix
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to SQL Editor
3. Copy ALL contents of `fix-schema-errors.sql`
4. Paste and click "Run"

### Step 2: Restart Your App
```powershell
# Stop your dev server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 3: Hard Refresh Browser
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

## 🔍 What Each Fix Does

### Code Fix (Already Applied)
```typescript
// Before:
.from('matters').eq('user_id', user.id)           // ❌ Wrong column
.from('user_profiles').eq('organization_id', ...)  // ❌ Wrong table

// After:
.from('matters').eq('advocate_id', user.id)        // ✅ Correct
.from('team_members').eq('organization_id', ...)   // ✅ Correct
```

### Database Fix (You Need to Run)
- Adds `user_id` column to `matters` (synced with `advocate_id`)
- Removes 8 duplicate RLS policies → Creates 4 clean ones
- Fixes `user_profiles` RLS to allow proper queries
- Adds team member access support

## 📋 Verification Checklist

After applying both fixes:

- [ ] Database migration ran successfully
- [ ] Dev server restarted
- [ ] Browser hard refreshed
- [ ] No 406 errors in console
- [ ] No 400 errors in console
- [ ] Dashboard loads correctly
- [ ] Matters page loads correctly
- [ ] Subscription page loads correctly

## 🐛 Troubleshooting

### Still seeing errors?
1. **Check database**: Verify migration ran in Supabase Dashboard → Database → Migrations
2. **Clear cache**: Try incognito/private browsing mode
3. **Check auth**: Make sure you're logged in
4. **Check logs**: Look at Supabase Dashboard → Logs for detailed errors

### Errors in different places?
If you see errors on other pages, they might have similar issues. Look for:
- Queries using `user_id` on `matters` table (should be `advocate_id`)
- Queries using `organization_id` on `user_profiles` (should use `team_members`)

## 📝 Summary

**Root Cause**: Mismatch between code assumptions and actual database schema

**Code Issues**:
- ✅ FIXED: Wrong column names in subscription service

**Database Issues**:
- ⏳ TODO: Run `fix-schema-errors.sql` to add missing columns and fix policies

**Time to Fix**: ~2 minutes total
- Code: Already done
- Database: 30 seconds to run SQL
- Testing: 1 minute

## 🎯 Expected Result

After both fixes:
- ✅ No more 406 (Not Acceptable) errors
- ✅ No more 400 (Bad Request) errors
- ✅ Subscription metrics load correctly
- ✅ Team member counts work properly
- ✅ All pages load without console errors
