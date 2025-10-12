# Repair Migration History
# Fixes the mismatch between local and remote migrations

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration History Repair" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Marking remote-only migrations as reverted..." -ForegroundColor Yellow
Write-Host ""

# Mark migrations that exist in remote but not locally as reverted
$revertedMigrations = @(
    "20250107000002",
    "20250107000004",
    "20251007051658",
    "20251007074419",
    "20251007080000",
    "20251007090000",
    "20251007194200",
    "20251007200000",
    "20251009000000"
)

foreach ($migration in $revertedMigrations) {
    Write-Host "  Marking $migration as reverted..." -ForegroundColor Gray
    supabase migration repair --status reverted $migration
}

Write-Host ""
Write-Host "Step 2: Pulling current database schema..." -ForegroundColor Yellow
Write-Host ""

# Pull the current schema to see what we have
supabase db pull

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Repair Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check the pulled schema in supabase/migrations" -ForegroundColor White
Write-Host "  2. Run: .\fix-database-now.ps1" -ForegroundColor White
Write-Host ""
