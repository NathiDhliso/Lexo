# Quick Fix Guide - Matter Creation Errors

## TL;DR

Run this command to fix all matter creation issues:

```powershell
.\apply-matter-fixes.ps1
```

Or apply the SQL directly in Supabase dashboard (SQL Editor):

1. Run `supabase/migrations/20250127000004_add_urgency_column.sql`
2. Run `supabase/migrations/20250127000005_fix_matter_reference_trigger.sql`

## What This Fixes

✅ "Could not find the 'urgency' column" error  
✅ "relation 'advocates' does not exist" error  
✅ Quick Add Matter feature  
✅ Quick Brief Capture workflow  
✅ Matter Request submissions  

## What Gets Changed

### Database Changes
- Adds 7 new columns to `matters` table
- Fixes the matter reference number trigger
- No data loss - all existing matters remain unchanged

### New Columns
| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| urgency | enum | 'standard' | Urgency level (routine/standard/urgent/emergency) |
| practice_area | text | NULL | Legal specialty area |
| deadline_date | date | NULL | Matter deadline |
| creation_source | text | NULL | How matter was created |
| is_quick_create | boolean | false | Quick create flag |
| date_accepted | timestamptz | NULL | When matter was accepted |
| date_commenced | timestamptz | NULL | When work started |

## After Applying

Test these features to confirm everything works:

1. **Quick Add Matter** - Click "Quick Add" button on Matters page
2. **Quick Brief Capture** - Use the Quick Brief workflow
3. **Matter Requests** - Submit a request from attorney portal

All should work without errors.

## Troubleshooting

### "Supabase CLI not found"
Install from: https://supabase.com/docs/guides/cli

### "Not linked to project"
Run: `supabase link`

### "Permission denied"
Make sure you're logged in: `supabase login`

### Still getting errors?
Check `URGENCY_COLUMN_FIX.md` for detailed information.

## Files Created

- `supabase/migrations/20250127000004_add_urgency_column.sql`
- `supabase/migrations/20250127000005_fix_matter_reference_trigger.sql`
- `apply-matter-fixes.ps1`
- `URGENCY_COLUMN_FIX.md` (detailed docs)
- `QUICK_FIX_GUIDE.md` (this file)
