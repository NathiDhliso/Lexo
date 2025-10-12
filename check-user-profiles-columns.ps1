# Check user_profiles Table Columns
# Shows what columns actually exist in the database

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Checking user_profiles Table" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Fetching column list from database..." -ForegroundColor Yellow
Write-Host ""

$query = @"
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;
"@

supabase db remote exec "$query"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Checking RLS Policies..." -ForegroundColor Yellow
Write-Host ""

$policyQuery = @"
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_profiles';
"@

supabase db remote exec "$policyQuery"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
