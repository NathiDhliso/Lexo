# Apply the urgency column migration to Supabase
# This script applies the migration that adds missing columns to the matters table

Write-Host "Applying urgency column migration..." -ForegroundColor Cyan

# Check if Supabase CLI is installed
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCli) {
    Write-Host "Error: Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Apply the migration
Write-Host "Running migration: 20250127000004_add_urgency_column.sql" -ForegroundColor Yellow
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nMigration applied successfully!" -ForegroundColor Green
    Write-Host "`nThe following columns have been added to the matters table:" -ForegroundColor Cyan
    Write-Host "  - urgency (enum: routine, standard, urgent, emergency)" -ForegroundColor White
    Write-Host "  - practice_area (text)" -ForegroundColor White
    Write-Host "  - deadline_date (date)" -ForegroundColor White
    Write-Host "  - creation_source (text)" -ForegroundColor White
    Write-Host "  - is_quick_create (boolean)" -ForegroundColor White
    Write-Host "  - date_accepted (timestamptz)" -ForegroundColor White
    Write-Host "  - date_commenced (timestamptz)" -ForegroundColor White
} else {
    Write-Host "`nError applying migration. Please check the error messages above." -ForegroundColor Red
    exit 1
}
