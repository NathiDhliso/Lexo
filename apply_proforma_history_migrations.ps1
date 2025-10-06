# Apply Pro Forma Invoice History Migrations
# This script applies the database migrations to enable pro forma invoice tracking

Write-Host "Applying Pro Forma Invoice History Migrations..." -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is available
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Supabase CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "Install with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Change to the project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Step 1: Making matter_id nullable in invoices table..." -ForegroundColor Yellow
$migration1 = "supabase\migrations\20251006000000_allow_null_matter_id_for_proforma.sql"
if (Test-Path $migration1) {
    Write-Host "  Found: $migration1" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Migration file not found: $migration1" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Creating pro forma invoice views and indexes..." -ForegroundColor Yellow
$migration2 = "supabase\migrations\20251006010000_add_proforma_invoice_views.sql"
if (Test-Path $migration2) {
    Write-Host "  Found: $migration2" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Migration file not found: $migration2" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Ready to apply migrations. This will:" -ForegroundColor Cyan
Write-Host "  1. Make matter_id nullable in invoices table" -ForegroundColor White
Write-Host "  2. Add constraint for pro forma invoices" -ForegroundColor White
Write-Host "  3. Create pro_forma_invoices_with_requests view" -ForegroundColor White
Write-Host "  4. Add indexes for better query performance" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Applying migrations..." -ForegroundColor Cyan

# Apply migrations using supabase CLI
try {
    # Check if supabase is linked
    Write-Host "Checking Supabase connection..." -ForegroundColor Yellow
    supabase status
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Supabase not linked. Starting local instance..." -ForegroundColor Yellow
        supabase start
    }
    
    Write-Host ""
    Write-Host "Running migrations..." -ForegroundColor Yellow
    supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCESS! Migrations applied successfully." -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Restart your development server" -ForegroundColor White
        Write-Host "  2. Test pro forma generation from pending requests" -ForegroundColor White
        Write-Host "  3. Verify invoices are saved to database" -ForegroundColor White
        Write-Host "  4. Check pro forma history in invoice list" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "ERROR: Migration failed. Check the error messages above." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "For manual verification, you can run:" -ForegroundColor Cyan
Write-Host "  SELECT * FROM pro_forma_invoices_with_requests;" -ForegroundColor White
Write-Host ""
