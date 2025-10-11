# Apply Schema Fixes
# This script applies the new migrations to fix RLS and schema issues

Write-Host "Applying schema fixes..." -ForegroundColor Cyan

# Check if Supabase CLI is installed
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Supabase CLI is not installed" -ForegroundColor Red
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Apply the migrations
Write-Host "`nApplying user_profiles RLS fix..." -ForegroundColor Yellow
supabase db push --file supabase/migrations/20250111000020_fix_user_profiles_rls.sql

Write-Host "`nApplying matters schema fix..." -ForegroundColor Yellow
supabase db push --file supabase/migrations/20250111000021_add_missing_columns.sql

Write-Host "`nSchema fixes applied successfully!" -ForegroundColor Green
Write-Host "`nPlease refresh your application to see the changes." -ForegroundColor Cyan
