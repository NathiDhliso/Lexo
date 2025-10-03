# Template Management Setup Guide

## Issue
The Template Management page shows "Loading templates..." indefinitely because the database migration for the matter templates system hasn't been applied to your Supabase database yet.

## Solution

### Step 1: Apply the Database Migration

1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/ecaamkrcsjrcjmcjshlu
2. Navigate to the **SQL Editor** (left sidebar)
3. Open the file `apply_templates_migration.sql` from your project root
4. Copy the entire contents of that file
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

This will create:
- `template_categories` table with 11 default categories
- `matter_templates` table for storing templates
- `template_shares` table for sharing templates between advocates
- Three RPC functions:
  - `get_user_templates()` - Retrieves all templates accessible to a user
  - `increment_template_usage()` - Tracks template usage
  - `suggest_templates_for_matter()` - AI-powered template suggestions
- Row Level Security (RLS) policies for data protection

### Step 2: Verify the Migration

After running the migration, you should see a verification query result showing:
```
template_categories | 11
matter_templates    | 0
template_shares     | 0
```

### Step 3: Test the Templates Feature

1. Navigate to the Template Management page in your app
2. You should now see an empty state with "No templates found"
3. Click "New Template" to create your first template
4. Templates can be:
   - Created from scratch
   - Saved from existing matters
   - Shared with other advocates
   - Used to quickly create new matters

## Features

### Template Categories
- Commercial Litigation
- Contract Law
- Employment Law
- Family Law
- Criminal Law
- Property Law
- Intellectual Property
- Tax Law
- Constitutional Law
- Administrative Law
- General

### Template Capabilities
- **Create & Save**: Save matter configurations as reusable templates
- **Share**: Share templates with other advocates in your organization
- **Search & Filter**: Find templates by name, category, or description
- **Usage Tracking**: See which templates are most popular
- **Smart Suggestions**: Get AI-powered template recommendations when creating matters

## Error Handling

The app now includes better error handling:
- If the migration hasn't been applied, you'll see a clear error message
- Error messages include hints on how to fix the issue
- All API responses are properly validated

## Files Modified

1. `src/pages/TemplateManagementPage.tsx` - Fixed error handling and removed unused imports
2. `src/services/api/matter-templates.service.ts` - Added migration detection and better error messages
3. `src/services/api/base-api.service.ts` - Made `generateRequestId()` protected for child classes
4. `apply_templates_migration.sql` - Complete migration script (NEW FILE)

## Next Steps

After applying the migration:
1. Create a few test templates
2. Try sharing a template with another advocate
3. Use a template to create a new matter
4. Check the usage statistics

## Troubleshooting

### "function get_user_templates does not exist"
- The migration hasn't been applied yet
- Follow Step 1 above to apply the migration

### "Templates feature not yet configured"
- Same as above - run the migration script

### Templates not showing after migration
- Check browser console for errors
- Verify you're logged in
- Try refreshing the page
- Check Supabase logs for RLS policy issues

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify the migration was applied successfully in Supabase
3. Check that RLS policies are enabled and configured correctly
