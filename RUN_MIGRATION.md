# Run Database Migration - Quick Guide

## Step 1: Apply the Migration

### Option A: Using Supabase CLI (Recommended)
```bash
cd supabase
supabase db push
```

### Option B: Using Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Copy contents of `supabase/migrations/20251010_add_public_tokens.sql`
5. Paste and run

### Option C: Direct SQL (If you have psql access)
```bash
psql -h your-db-host -U postgres -d your-database -f supabase/migrations/20251010_add_public_tokens.sql
```

---

## Step 2: Verify Migration

Run this query to check if columns were added:

```sql
-- Check proforma_requests table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'proforma_requests' 
AND column_name IN ('public_token', 'link_sent_at', 'link_sent_to');

-- Check engagement_agreements table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'engagement_agreements' 
AND column_name IN ('public_token', 'link_sent_at', 'link_sent_to');
```

**Expected Output:**
```
column_name    | data_type
---------------+-----------
public_token   | uuid
link_sent_at   | timestamp with time zone
link_sent_to   | text
```

---

## Step 3: Test Token Generation

### Test Pro Forma Token
```sql
-- Check if existing records have tokens
SELECT id, public_token, link_sent_at 
FROM proforma_requests 
LIMIT 5;
```

### Test Engagement Token
```sql
-- Check if existing records have tokens
SELECT id, public_token, link_sent_at 
FROM engagement_agreements 
LIMIT 5;
```

**All records should have a `public_token` value automatically generated.**

---

## Step 4: Test in Application

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Pro Forma list**

3. **Click "Generate Link" on any pro forma**

4. **Verify:**
   - Link is displayed
   - Link format: `http://localhost:5173/#/attorney/proforma/{uuid}`
   - Copy button works
   - Open in new tab works

5. **Test email tracking:**
   - Enter an email address
   - Click "Send"
   - Check database:
     ```sql
     SELECT id, link_sent_at, link_sent_to 
     FROM proforma_requests 
     WHERE link_sent_to IS NOT NULL;
     ```

---

## Troubleshooting

### Error: "column already exists"
**Solution:** Migration was already run. Skip to Step 2 to verify.

### Error: "relation does not exist"
**Solution:** Check that you're connected to the correct database.

### Tokens are NULL
**Solution:** Run this to generate tokens for existing records:
```sql
UPDATE proforma_requests 
SET public_token = gen_random_uuid() 
WHERE public_token IS NULL;

UPDATE engagement_agreements 
SET public_token = gen_random_uuid() 
WHERE public_token IS NULL;
```

### Link doesn't work
**Check:**
1. Token exists in database
2. URL format is correct: `/#/attorney/proforma/{token}`
3. Attorney portal pages are properly routed in `App.tsx`

---

## Rollback (If Needed)

If you need to undo the migration:

```sql
-- Remove columns from proforma_requests
ALTER TABLE proforma_requests 
DROP COLUMN IF EXISTS public_token,
DROP COLUMN IF EXISTS link_sent_at,
DROP COLUMN IF EXISTS link_sent_to;

-- Remove columns from engagement_agreements
ALTER TABLE engagement_agreements 
DROP COLUMN IF EXISTS public_token,
DROP COLUMN IF EXISTS link_sent_at,
DROP COLUMN IF EXISTS link_sent_to;

-- Drop function
DROP FUNCTION IF EXISTS regenerate_public_token;
```

---

## Success Indicators

✅ **Migration Successful When:**
- [ ] No errors during migration
- [ ] Columns exist in both tables
- [ ] Existing records have tokens
- [ ] New records auto-generate tokens
- [ ] Links work in browser
- [ ] Email tracking saves correctly

---

## Next Steps After Migration

1. ✅ Test Pro Forma link generation
2. ✅ Test Engagement Agreement link generation
3. ✅ Verify attorney portal pages load
4. ✅ Test email tracking
5. 🔄 Proceed to Phase 2: Partner Approval System

---

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Verify database connection
3. Ensure you have proper permissions
4. Review `PHASE1_LINK_GENERATION_SUMMARY.md` for details
