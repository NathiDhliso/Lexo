# Run Pro Forma Migration - Quick Guide

## What This Does
Adds `matter_type` column to the `proforma_requests` table so that matter types are properly saved and can pre-populate the advocate's quote creation modal.

## Run the Migration

### Option 1: Using Supabase CLI (Recommended)
```bash
supabase migration up
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of:
   `supabase/migrations/20250112000000_add_matter_type_to_proforma_requests.sql`
4. Click **Run**

### Option 3: Direct SQL
Run this SQL in your database:

```sql
-- Add matter_type column to proforma_requests table
ALTER TABLE proforma_requests
ADD COLUMN IF NOT EXISTS matter_type TEXT;

-- Add comment
COMMENT ON COLUMN proforma_requests.matter_type IS 'Type of legal matter (civil_litigation, commercial_law, etc.)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_proforma_requests_matter_type ON proforma_requests(matter_type);
```

## Verify Migration

Run this query to verify the column was added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'proforma_requests' 
AND column_name = 'matter_type';
```

Expected result:
```
column_name  | data_type
-------------|----------
matter_type  | text
```

## Test the Fix

1. **As Attorney:**
   - Go to pro forma request page
   - Fill in all fields including "Matter Type"
   - Submit the request

2. **As Advocate:**
   - Go to Pro Forma Requests page
   - Find the submitted request (should show "Attorney Responded" badge)
   - Click "Review & Quote"
   - Click "Create Pro Forma Quote"
   - **Verify:** Matter Type dropdown should be pre-selected ✅
   - **Verify:** Rate cards should filter by the selected matter type ✅

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Remove the column
ALTER TABLE proforma_requests DROP COLUMN IF EXISTS matter_type;

-- Remove the index
DROP INDEX IF EXISTS idx_proforma_requests_matter_type;
```

## What's Fixed

✅ Matter type now saves to database  
✅ Matter type pre-populates in advocate's modal  
✅ Rate cards automatically filter by matter type  
✅ Case title and urgency also save properly  
✅ Complete data flow from attorney → advocate  

## Need Help?

If you encounter any issues:
1. Check Supabase logs for errors
2. Verify you have the latest code changes
3. Ensure all TypeScript files compiled without errors
4. Check browser console for any runtime errors
