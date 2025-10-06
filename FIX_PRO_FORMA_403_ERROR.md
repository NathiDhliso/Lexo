# Fix for Pro Forma 403 & 409 Errors

## Problems
1. **403 Error**: Incorrect RLS (Row Level Security) policies prevent advocates from inserting records
2. **409 Error (Foreign Key)**: User exists in `auth.users` but not in `advocates` table
3. **409 Error (Column)**: Missing `requested_action` column causes insert conflicts
4. **400 Error (Schema)**: Missing `instructing_attorney_*` and other fields from ProFormaRequestPage

## Root Cause
The INSERT policy in migration `20251002020000_fix_pro_forma_insert_policy.sql` has flawed logic:

```sql
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM advocates WHERE id = advocate_id
  )
)
```

This circular logic always fails. It should simply be:
```sql
WITH CHECK (auth.uid() = advocate_id)
```

## Solution

### Option 1: Apply Complete Fix via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (ecaamkrcsjrcjmcjshlu)
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `fix_pro_forma_complete.sql` (includes all fixes)
5. Click **Run**

### Option 2: Apply via Supabase CLI

```powershell
cd c:\Users\nathi\Downloads\LexoHub
supabase db push --db-url "postgresql://postgres:[YOUR_PASSWORD]@ecaamkrcsjrcjmcjshlu.supabase.co:5432/postgres"
```

Replace `[YOUR_PASSWORD]` with your database password.

### Option 3: Manual SQL Execution

Connect to your database using any PostgreSQL client and run:

```sql
DROP POLICY IF EXISTS "Advocates can insert pro_forma_requests" ON pro_forma_requests;
DROP POLICY IF EXISTS "Advocates can view their own pro_forma_requests" ON pro_forma_requests;
DROP POLICY IF EXISTS "Advocates can update their own pro_forma_requests" ON pro_forma_requests;
DROP POLICY IF EXISTS "Advocates can delete their own pro_forma_requests" ON pro_forma_requests;
DROP POLICY IF EXISTS "Public can view pro_forma_requests by token" ON pro_forma_requests;
DROP POLICY IF EXISTS "Public can submit pending pro_forma_requests" ON pro_forma_requests;

CREATE POLICY "Advocates can insert pro_forma_requests"
ON pro_forma_requests FOR INSERT
WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "Advocates can view their own pro_forma_requests"
ON pro_forma_requests FOR SELECT
USING (auth.uid() = advocate_id);

CREATE POLICY "Advocates can update their own pro_forma_requests"
ON pro_forma_requests FOR UPDATE
USING (auth.uid() = advocate_id);

CREATE POLICY "Advocates can delete their own pro_forma_requests"
ON pro_forma_requests FOR DELETE
USING (auth.uid() = advocate_id);

CREATE POLICY "Public can view pro_forma_requests by token"
ON pro_forma_requests FOR SELECT
USING (expires_at > NOW());

CREATE POLICY "Public can submit pending pro_forma_requests"
ON pro_forma_requests FOR UPDATE
USING (status = 'pending' AND expires_at > NOW())
WITH CHECK (
  (status = 'submitted' AND expires_at > NOW()) OR
  (status = 'pending' AND expires_at > NOW())
);
```

## Additional Fixes for 409 Conflict Error

The 409 error has three causes:

### 0. Missing Advocate Records (CRITICAL)
Users exist in `auth.users` but not in `advocates` table, causing foreign key violations. Fixed by:
```sql
-- Sync existing users to advocates table
INSERT INTO advocates (id, email, full_name, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    created_at,
    updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM advocates)
ON CONFLICT (id) DO NOTHING;

-- Create trigger for future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.advocates (id, email, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### 1. Incorrect Token Default
The `token` column uses `extensions.uuid_generate_v4()` which may not exist. Fixed by:
```sql
ALTER TABLE pro_forma_requests 
ALTER COLUMN token DROP DEFAULT;

ALTER TABLE pro_forma_requests 
ALTER COLUMN token SET DEFAULT gen_random_uuid()::text;
```

### 2. Missing `requested_action` Column
Migration `20251001100000_fix_pro_forma_schema.sql` dropped the table and recreated it without the `requested_action` column. Fixed by:
```sql
ALTER TABLE pro_forma_requests 
ADD COLUMN IF NOT EXISTS requested_action pro_forma_action;
```

**All fixes are included in `fix_pro_forma_complete.sql`**

## Verification

After applying the fix, test by:
1. Opening the Pro Forma Link Modal
2. Filling out the form
3. Clicking "Generate Link"
4. Check the console for detailed error information
5. Verify the link is generated successfully

## Files Created
- **`fix_pro_forma_complete.sql`** - Complete fix (all issues) - **USE THIS**
- `fix_advocates_sync.sql` - Sync advocates table with auth.users
- `fix_pro_forma_rls.sql` - RLS policies only
- `supabase/migrations/20251005000000_fix_pro_forma_insert_policy.sql` - RLS policy fix
- `supabase/migrations/20251005010000_fix_token_default.sql` - Token default fix
- `supabase/migrations/20251005020000_add_requested_action_column.sql` - Add missing column
- `supabase/migrations/20251005030000_safe_add_requested_action.sql` - Safe column addition
- `supabase/migrations/20251005040000_sync_advocates_with_auth.sql` - Advocates sync migration
- `supabase/migrations/20251005050000_add_missing_pro_forma_fields.sql` - Add instructing attorney fields
- `diagnose_pro_forma_table.sql` - Diagnostic queries
