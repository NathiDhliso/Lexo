# Cloud Storage Tables Fix

## Problem
The cloud storage tables don't exist in your database, causing 404 errors when trying to access the Cloud Storage Settings page.

## Quick Fix (Recommended)

### Option 1: Run SQL Script in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire contents of `fix-cloud-storage-now.sql`
6. Click "Run" or press Ctrl+Enter
7. You should see a success message with table counts

### Option 2: Fix Migration File and Push

The original migration had a syntax error. I've fixed it:

1. The fixed migration is already updated in: `supabase/migrations/20250111000040_cloud_storage_providers.sql`
2. A new fix migration was created: `supabase/migrations/20250111000041_fix_cloud_storage_constraint.sql`

However, since there are migration history conflicts, Option 1 (SQL Editor) is faster.

## What Gets Created

The fix creates three tables:

1. **cloud_storage_connections** - Stores OAuth connections to cloud providers
   - OneDrive, Google Drive, Dropbox, iCloud, Box
   - Access tokens, refresh tokens
   - Primary provider designation

2. **cloud_storage_sync_log** - Tracks all sync operations
   - Upload, download, delete, update operations
   - Status tracking and error logging
   - Performance metrics

3. **document_cloud_storage** - Maps local documents to cloud files
   - Provider file IDs and paths
   - Sync status
   - Direct links for viewing/downloading

## Verification

After running the fix, refresh your app and navigate to Settings > Cloud Storage. The 404 error should be gone and you should see the cloud storage connection interface.

## What Was Wrong

The original migration tried to use an inline partial unique constraint:
```sql
CONSTRAINT unique_primary_per_advocate UNIQUE (advocate_id, is_primary) WHERE is_primary = true
```

This syntax isn't supported. The fix uses a partial unique index instead:
```sql
CREATE UNIQUE INDEX idx_cloud_storage_connections_unique_primary 
  ON cloud_storage_connections(advocate_id) 
  WHERE is_primary = true;
```

## Next Steps

Once the tables are created:
1. The Cloud Storage Settings page will load without errors
2. Users can connect their cloud storage accounts
3. Documents can be synced to cloud providers
4. You can delete all the documentation MD files as requested
