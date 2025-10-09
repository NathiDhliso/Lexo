# Apply Rate Cards Migration

## Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard/project/ecaamkrcsjrcjmcjshlu
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

## Step 2: Copy and Run the Migration

Copy the **ENTIRE** contents of the file below and paste into the SQL Editor:

`supabase/migrations/20250107000005_add_rate_cards_tables.sql`

Then click "Run" or press Ctrl+Enter.

## Step 3: Verify Tables Were Created

Run this query to verify:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rate_cards', 'standard_service_templates');

-- Check template count (should be 21)
SELECT COUNT(*) as template_count FROM standard_service_templates;

-- View some templates
SELECT template_name, service_category, default_hourly_rate 
FROM standard_service_templates 
LIMIT 5;
```

## Step 4: Verify RLS Policies

Run this to check policies:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('rate_cards', 'standard_service_templates');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('rate_cards', 'standard_service_templates');
```

## Step 5: Regenerate TypeScript Types

After the migration is applied, run in your terminal:

```bash
supabase gen types typescript --project-id ecaamkrcsjrcjmcjshlu > types/database.ts
```

## Troubleshooting

If you get "type already exists" errors, it means the migration was partially applied. Run this cleanup first:

```sql
-- Cleanup if needed
DROP TABLE IF EXISTS rate_cards CASCADE;
DROP TABLE IF EXISTS standard_service_templates CASCADE;
DROP TYPE IF EXISTS service_category CASCADE;
DROP TYPE IF EXISTS pricing_type CASCADE;
```

Then run the full migration again.
