# Apply expenses and disbursements fix migration
# This script applies the migration to fix schema issues

Write-Host "Applying expenses and disbursements fix migration..." -ForegroundColor Cyan

# Check if supabase CLI is available
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Supabase CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Apply the migration
Write-Host "`nApplying migration 20250127000006_fix_expenses_and_disbursements.sql..." -ForegroundColor Yellow
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Migration applied successfully!" -ForegroundColor Green
    Write-Host "`nThe following issues have been fixed:" -ForegroundColor Cyan
    Write-Host "  1. Created disbursements table with proper schema" -ForegroundColor White
    Write-Host "  2. Added missing columns to expenses table:" -ForegroundColor White
    Write-Host "     - payment_date (for ExpenseList component)" -ForegroundColor Gray
    Write-Host "     - date (for ExpensesService)" -ForegroundColor Gray
    Write-Host "     - disbursement_type" -ForegroundColor Gray
    Write-Host "     - receipt_number" -ForegroundColor Gray
    Write-Host "     - vendor_name" -ForegroundColor Gray
    Write-Host "     - is_billable" -ForegroundColor Gray
    Write-Host "  3. Fixed RLS policies for logged_services table" -ForegroundColor White
    Write-Host "  4. Created helper functions for disbursements" -ForegroundColor White
    Write-Host "  5. Added date column synchronization triggers" -ForegroundColor White
    Write-Host "`nYou can now:" -ForegroundColor Cyan
    Write-Host "  - View and manage disbursements in the Workbench" -ForegroundColor White
    Write-Host "  - Log expenses without errors" -ForegroundColor White
    Write-Host "  - View logged services properly" -ForegroundColor White
} else {
    Write-Host "`n✗ Migration failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    exit 1
}
