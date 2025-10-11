# 🚨 IMPORTANT: Run Database Migrations

## The Error You're Seeing

```
Could not find the table 'public.subscriptions' in the schema cache
Could not find the table 'public.team_members' in the schema cache
Could not find the table 'public.user_profiles' in the schema cache
```

This means the database tables haven't been created yet!

## ✅ Quick Fix - Run These Migrations

You have 2 migration files that need to be run:

### Option 1: Using Supabase CLI (Recommended)

```bash
# Run both migrations
supabase db push
```

### Option 2: Manual SQL Execution

Go to your Supabase Dashboard → SQL Editor and run these files in order:

1. **First**: `supabase/migrations/20250110_subscription_system.sql`
   - Creates: `subscriptions`, `payment_transactions`, `subscription_history` tables
   - This is for your subscription & billing feature

2. **Second**: `supabase/migrations/20250110_team_members.sql`
   - Creates: `team_members`, `user_profiles` tables
   - This is for team management and profile settings

## 📋 Step-by-Step Manual Process

### Step 1: Run Subscription Migration

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/20250110_subscription_system.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for "Success" message

### Step 2: Run Team Members Migration

1. Still in SQL Editor
2. Click **New Query** again
3. Copy the entire contents of `supabase/migrations/20250110_team_members.sql`
4. Paste into the SQL editor
5. Click **Run**
6. Wait for "Success" message

### Step 3: Verify Tables Were Created

In SQL Editor, run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'team_members', 'user_profiles', 'payment_transactions');
```

You should see all 4 tables listed.

### Step 4: Refresh Your App

1. Go back to your browser
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. The errors should be gone!

## 🎯 What Each Table Does

### `subscriptions`
- Stores user subscription tiers (Admission, Advocate, Senior Counsel)
- Tracks billing periods and payment gateway info
- Used in Settings → Subscription & Billing tab

### `team_members`
- Stores team member invitations
- Tracks roles (admin, advocate, secretary)
- Used in Settings → Team Members tab

### `user_profiles`
- Stores extended user information
- Practice details, address, phone, etc.
- Used in Settings → Profile tab

### `payment_transactions`
- Records all payment attempts
- Links to Paystack/PayFast transactions
- Used for billing history

## ⚠️ Common Issues

### "Permission denied"
- Make sure you're logged into the correct Supabase project
- Check you have admin access

### "Syntax error"
- Make sure you copied the ENTIRE file contents
- Don't miss the beginning or end of the SQL file

### "Table already exists"
- That's okay! It means the table was created previously
- The migration will skip creating it again

## ✅ After Running Migrations

Your Settings page will work properly with:
- ✅ Profile management
- ✅ Subscription & billing
- ✅ Team member management
- ✅ Rate cards (already working)
- ✅ PDF templates (already working)

---

**Run the migrations now and refresh your app!** 🚀
