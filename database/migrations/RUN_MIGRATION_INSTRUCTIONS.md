# How to Run the Pro Forma Prepopulation Migration

## Quick Start

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to: **SQL Editor** (left sidebar)

2. **Create New Query**
   - Click "+ New query" button

3. **Copy Migration SQL**
   - Open: `database/migrations/consolidated_proforma_migration.sql`
   - Copy the entire contents

4. **Paste and Execute**
   - Paste into the SQL Editor
   - Click **RUN** button (or press Ctrl+Enter)

5. **Verify Results**
   - Check that the output shows "COMMIT" at the end
   - Review the column list at the bottom
   - Ensure no errors are displayed

## Expected Output

You should see:
```
BEGIN
CREATE TYPE (or "type already exists")
CREATE TYPE (or "type already exists")
CREATE TABLE (or "table already exists")
ALTER TABLE (multiple times)
CREATE INDEX (multiple times)
ALTER TABLE (enable RLS)
DROP POLICY (multiple times)
CREATE POLICY (multiple times)
COMMIT

column_name | data_type | is_nullable | column_default
------------|-----------|-------------|---------------
id          | uuid      | NO          | uuid_generate_v4()
advocate_id | uuid      | NO          | 
token       | text      | NO          | extensions.uuid_generate_v4()::text
status      | USER-DEFINED | NO       | 'pending'::pro_forma_request_status
...
(all columns listed)
```

## Troubleshooting

### Error: "relation 'advocates' does not exist"
**Solution:** The advocates table must exist first. Check your database schema.

### Error: "type already exists"
**This is OK!** The migration is idempotent and will skip existing types.

### Error: "permission denied"
**Solution:** Ensure you're logged in as the database owner or have sufficient privileges.

### Error: "syntax error"
**Solution:** Ensure you copied the entire SQL file without truncation.

## Verification Steps

After running the migration, verify the schema:

```sql
-- Check all columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'pro_forma_requests' 
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'pro_forma_requests';

-- Check RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'pro_forma_requests';
```

## Alternative: Command Line (if psql is configured)

If you have direct database access configured:

```bash
# Set password as environment variable
$env:PGPASSWORD='Magnox271991!'

# Run migration
psql -h <your-supabase-host> -p 6543 -d postgres -U <your-user> -f database/migrations/consolidated_proforma_migration.sql
```

**Note:** Replace `<your-supabase-host>` and `<your-user>` with your actual Supabase connection details.

## Post-Migration Testing

1. **Test Request Creation:**
   ```sql
   INSERT INTO pro_forma_requests (
       advocate_id, 
       matter_title, 
       client_name, 
       instructing_attorney_name
   ) VALUES (
       '<your-advocate-id>', 
       'Test Matter', 
       'Test Client', 
       'Test Attorney'
   );
   ```

2. **Test Request Retrieval:**
   ```sql
   SELECT * FROM pro_forma_requests 
   WHERE advocate_id = '<your-advocate-id>';
   ```

3. **Clean Up Test Data:**
   ```sql
   DELETE FROM pro_forma_requests 
   WHERE matter_title = 'Test Matter';
   ```

## Rollback (if needed)

If you need to rollback the migration:

```sql
-- WARNING: This will remove all new columns and data
BEGIN;

ALTER TABLE pro_forma_requests 
DROP COLUMN IF EXISTS fee_narrative,
DROP COLUMN IF EXISTS total_amount,
DROP COLUMN IF EXISTS valid_until,
DROP COLUMN IF EXISTS quote_date,
DROP COLUMN IF EXISTS expires_at,
DROP COLUMN IF EXISTS instructing_attorney_email,
DROP COLUMN IF EXISTS instructing_attorney_phone,
DROP COLUMN IF EXISTS client_email,
DROP COLUMN IF EXISTS client_phone,
DROP COLUMN IF EXISTS matter_title,
DROP COLUMN IF EXISTS urgency_level;

COMMIT;
```

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Review the error message carefully
3. Ensure your database user has sufficient permissions
4. Contact your database administrator if needed
