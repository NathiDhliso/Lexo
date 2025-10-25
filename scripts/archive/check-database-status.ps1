# Check Database Status
# Verifies if migrations have been applied

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking user_profiles table structure..." -ForegroundColor Yellow
Write-Host ""

# Check if user_profiles has the required columns
$query = @"
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;
"@

Write-Host "Running query..." -ForegroundColor Gray
supabase db remote exec "$query"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Expected columns:" -ForegroundColor Yellow
Write-Host "  - user_id" -ForegroundColor White
Write-Host "  - full_name" -ForegroundColor White
Write-Host "  - email" -ForegroundColor White
Write-Host "  - phone" -ForegroundColor White
Write-Host "  - practice_number" -ForegroundColor White
Write-Host "  - year_admitted" -ForegroundColor White
Write-Host "  - hourly_rate" -ForegroundColor White
Write-Host "  - chambers_address" -ForegroundColor White
Write-Host "  - postal_address" -ForegroundColor White
Write-Host "  - is_active" -ForegroundColor White
Write-Host "  - user_role" -ForegroundColor White
Write-Host "  - initials" -ForegroundColor White
Write-Host ""

Write-Host "If columns are missing, run:" -ForegroundColor Yellow
Write-Host "  .\fix-database-now.ps1" -ForegroundColor White
Write-Host ""
