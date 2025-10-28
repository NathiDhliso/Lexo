# Attorney Loading Debug Guide

## Issue
Attorneys are not showing up in the Quick Brief modal's AttorneySelectionField component.

## Added Debug Logging

I've added console.log statements to trace the issue:

1. **Component Load** - When useEffect triggers
2. **Query Execution** - When Supabase query runs
3. **Query Results** - What data comes back
4. **Render State** - Component state during render

## How to Debug

### Step 1: Open Browser Console
1. Open Quick Brief modal
2. Press `F12` or `Ctrl + Shift + I` to open DevTools
3. Go to "Console" tab
4. Look for messages starting with `[AttorneySelectionField]`

### Step 2: Check Console Output

You should see messages like:
```
[AttorneySelectionField] useEffect triggered, user: <user_id>, firmId: undefined
[AttorneySelectionField] Loading attorneys for user: <user_id>
[AttorneySelectionField] Query result: { data: [...], error: null, count: X }
[AttorneySelectionField] Transformed attorneys: [...]
[AttorneySelectionField] Render state: { mode: 'favorites', loading: false, attorneysCount: X, ... }
```

### Step 3: Diagnose Based on Output

#### Case A: No useEffect trigger
```
// Nothing appears in console
```
**Problem:** Component not mounting or user not authenticated
**Check:**
- Is user logged in?
- Is the modal actually open?
- Is component being rendered?

#### Case B: Query returns empty
```
[AttorneySelectionField] Query result: { data: [], error: null, count: 0 }
```
**Problem:** Database query returns no results
**Check:**
- Attorneys exist in database?
- Attorneys are linked to firms?
- Firms are linked to the current advocate?

#### Case C: Query error
```
[AttorneySelectionField] Query result: { data: null, error: {...} }
[AttorneySelectionField] Error loading attorneys: ...
```
**Problem:** Database schema or RLS policy issue
**Solutions:** See database checks below

#### Case D: Data loads but doesn't show
```
[AttorneySelectionField] Transformed attorneys: [{ id: 'x', attorney_name: 'John' ... }]
[AttorneySelectionField] Render state: { mode: 'favorites', attorneysCount: 2, favoritesCount: 0 }
```
**Problem:** UI rendering issue or mode mismatch
**Solution:**
- Click "Show All" to switch to manual mode
- Check if favorites are configured

---

## Database Verification Queries

Run these in Supabase SQL Editor to verify data structure:

### Query 1: Check Attorneys Exist
```sql
-- Replace YOUR_ADVOCATE_ID with your actual user ID
SELECT 
  a.id,
  a.attorney_name,
  a.email,
  a.firm_id,
  f.firm_name,
  f.advocate_id
FROM attorneys a
JOIN firms f ON f.id = a.firm_id
WHERE f.advocate_id = 'YOUR_ADVOCATE_ID'
ORDER BY a.attorney_name;
```

**Expected Result:** Should return 2 rows (your attorneys)

**If empty:**
- ✅ Attorneys exist in database? Check `SELECT * FROM attorneys;`
- ✅ Firms exist? Check `SELECT * FROM firms WHERE advocate_id = 'YOUR_ADVOCATE_ID';`
- ✅ Attorneys have correct `firm_id`? Check foreign key relationship

### Query 2: Check User Preferences
```sql
-- Check if favorites are configured
SELECT 
  advocate_id,
  favorite_attorneys
FROM user_preferences
WHERE advocate_id = 'YOUR_ADVOCATE_ID';
```

**Expected Result:** 
- If row doesn't exist: Normal (defaults to empty array)
- If `favorite_attorneys` is NULL or `[]`: No favorites configured (expected)

### Query 3: Test the Exact Query Used by Component
```sql
-- This is the exact query the component runs
SELECT 
  a.id,
  a.attorney_name,
  a.email,
  a.phone,
  a.firm_id,
  f.firm_name,
  f.advocate_id
FROM attorneys a
INNER JOIN firms f ON f.id = a.firm_id
WHERE f.advocate_id = 'YOUR_ADVOCATE_ID'
ORDER BY a.attorney_name;
```

**Expected Result:** 2 attorneys with all fields populated

---

## Common Issues & Solutions

### Issue 1: RLS Policy Blocking Query
**Symptom:** Query error: "permission denied" or "row level security"

**Check RLS Policies:**
```sql
-- Check attorneys table RLS
SELECT * FROM pg_policies WHERE tablename = 'attorneys';

-- Check firms table RLS
SELECT * FROM pg_policies WHERE tablename = 'firms';
```

**Fix:** Ensure SELECT policies allow advocates to read their attorneys:
```sql
-- Example policy for attorneys
CREATE POLICY "Advocates can view their attorneys"
ON attorneys FOR SELECT
USING (
  firm_id IN (
    SELECT id FROM firms WHERE advocate_id = auth.uid()
  )
);

-- Example policy for firms
CREATE POLICY "Advocates can view their firms"
ON firms FOR SELECT
USING (advocate_id = auth.uid());
```

### Issue 2: Missing Foreign Key Relationship
**Symptom:** Attorneys exist but firm_name is NULL

**Check:**
```sql
-- Verify foreign key constraint
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  a.attname AS column_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE conrelid = 'attorneys'::regclass AND contype = 'f';
```

**Fix:** If missing, add foreign key:
```sql
ALTER TABLE attorneys
ADD CONSTRAINT attorneys_firm_id_fkey
FOREIGN KEY (firm_id) REFERENCES firms(id);
```

### Issue 3: Attorneys Not Linked to Firms
**Symptom:** Attorneys exist but have NULL firm_id

**Check:**
```sql
-- Find orphaned attorneys
SELECT * FROM attorneys WHERE firm_id IS NULL;
```

**Fix:** Update attorneys to link to firms:
```sql
-- Find firm ID for advocate
SELECT id, firm_name FROM firms WHERE advocate_id = 'YOUR_ADVOCATE_ID';

-- Update attorney firm_id
UPDATE attorneys 
SET firm_id = '<FIRM_ID_FROM_ABOVE>'
WHERE id = '<ATTORNEY_ID>';
```

### Issue 4: Component in Favorites Mode with No Favorites
**Symptom:** Empty state showing "No favorite attorneys configured"

**Solution:** Click "Show All" button to switch to manual selection mode, or configure favorites

---

## Quick Fix Actions

### Option 1: Test with Manual Mode
1. Open Quick Brief modal
2. Look for "Show All" or "Show Favorites" toggle button
3. Click to switch to manual mode
4. Check if attorneys appear in dropdown

### Option 2: Temporarily Bypass Favorites
Add this to your browser console:
```javascript
// Force component to manual mode
localStorage.setItem('attorney_selection_mode', 'manual');
// Refresh page
location.reload();
```

### Option 3: Add Test Favorites
Run in Supabase SQL:
```sql
-- Get your attorney IDs
SELECT id, attorney_name FROM attorneys 
WHERE firm_id IN (SELECT id FROM firms WHERE advocate_id = 'YOUR_ADVOCATE_ID');

-- Add to favorites (replace IDs with actual values)
INSERT INTO user_preferences (advocate_id, favorite_attorneys)
VALUES ('YOUR_ADVOCATE_ID', ARRAY['ATTORNEY_ID_1', 'ATTORNEY_ID_2'])
ON CONFLICT (advocate_id) 
DO UPDATE SET favorite_attorneys = ARRAY['ATTORNEY_ID_1', 'ATTORNEY_ID_2'];
```

---

## Next Steps

1. **Open browser console** and look for debug messages
2. **Run database queries** to verify data exists
3. **Share console output** with me for further diagnosis
4. **Try switching modes** (favorites ↔ manual)

Let me know what you see in the console and I can provide a specific fix!
