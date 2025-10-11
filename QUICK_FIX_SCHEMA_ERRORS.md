# Quick Fix: Schema Errors (406 & 400)

## The Problem
Your app is getting 406 and 400 errors when querying `user_profiles` and `matters` tables.
You also have **duplicate RLS policies** causing conflicts.

## The Quick Fix

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar

### Step 2: Run the Fix
1. Open the file `fix-schema-errors.sql` in this project
2. Copy ALL the contents
3. Paste into Supabase SQL Editor
4. Click "Run" button

### Step 3: Refresh Your App
1. **Hard refresh** your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Or close the tab and open a new one
3. Navigate to your app
4. The errors should be gone!

## What This Does
- Removes duplicate RLS policies on `matters` table
- Adds `user_id` column to `matters` table (synced with `advocate_id`)
- Creates clean, consolidated RLS policies
- Fixes `user_profiles` policies to allow proper queries
- Maintains all security and data integrity

## Expected Result
After running the fix, you should have:
- **4 policies on matters**: SELECT, INSERT, UPDATE, DELETE
- **4 policies on user_profiles**: SELECT, INSERT, UPDATE, and team access
- No more 406 or 400 errors

## That's It!
The fix takes about 30 seconds to apply and requires no code changes.
