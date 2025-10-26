# Apply all matter-related database fixes
# This script applies migrations to fix matter creation issues

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Applying Matter Creation Fixes" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCli) {
    Write-Host "Error: Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "Migrations to be applied:" -ForegroundColor Yellow
Write-Host "  1. 20250127000004_add_urgency_column.sql" -ForegroundColor White
Write-Host "     - Adds urgency, practice_area, deadline_date, and other missing columns" -ForegroundColor Gray
Write-Host "  2. 20250127000005_fix_matter_reference_trigger.sql" -ForegroundColor White
Write-Host "     - Fixes the matter reference trigger to work without advocates table" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Do you want to proceed? (Y/N)"
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Applying migrations..." -ForegroundColor Cyan
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  Migrations Applied Successfully!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Changes applied:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. New columns added to matters table:" -ForegroundColor Yellow
    Write-Host "   - urgency (enum: routine, standard, urgent, emergency)" -ForegroundColor White
    Write-Host "   - practice_area (text)" -ForegroundColor White
    Write-Host "   - deadline_date (date)" -ForegroundColor White
    Write-Host "   - creation_source (text)" -ForegroundColor White
    Write-Host "   - is_quick_create (boolean)" -ForegroundColor White
    Write-Host "   - date_accepted (timestamptz)" -ForegroundColor White
    Write-Host "   - date_commenced (timestamptz)" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Matter reference trigger fixed:" -ForegroundColor Yellow
    Write-Host "   - No longer depends on non-existent advocates table" -ForegroundColor White
    Write-Host "   - Uses JHB prefix by default" -ForegroundColor White
    Write-Host "   - Format: JHB/YYYY/NNN" -ForegroundColor White
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Cyan
    Write-Host "  - Use Quick Add Matter feature" -ForegroundColor White
    Write-Host "  - Create matters via Quick Brief Capture" -ForegroundColor White
    Write-Host "  - Submit matter requests from attorney portal" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "  Error Applying Migrations" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Cyan
    Write-Host "  - Not connected to Supabase project" -ForegroundColor White
    Write-Host "  - Database connection issues" -ForegroundColor White
    Write-Host "  - Migration conflicts" -ForegroundColor White
    Write-Host ""
    Write-Host "Try running: supabase link" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
