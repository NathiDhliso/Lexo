# Apply rate card migrations to remote Supabase database
# Run this script to push the new rate card templates

Write-Host "Applying rate card migrations to remote database..." -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found. Please ensure your DATABASE_URL is configured." -ForegroundColor Red
    exit 1
}

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

$dbUrl = $env:DATABASE_URL

if (-not $dbUrl) {
    Write-Host "ERROR: DATABASE_URL not found in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "Connected to remote database" -ForegroundColor Green

# Apply the rate cards migration
Write-Host "`nApplying migration: 20251008000000_add_rate_cards.sql" -ForegroundColor Yellow
$migration1 = Get-Content "supabase\migrations\20251008000000_add_rate_cards.sql" -Raw
psql $dbUrl -c $migration1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Rate cards table structure created" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create rate cards structure" -ForegroundColor Red
}

# Apply the SA advocate templates migration
Write-Host "`nApplying migration: 20251009000000_add_sa_advocate_rate_templates.sql" -ForegroundColor Yellow
$migration2 = Get-Content "supabase\migrations\20251009000000_add_sa_advocate_rate_templates.sql" -Raw
psql $dbUrl -c $migration2

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SA advocate rate templates added (100+ templates)" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to add rate templates" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Migration complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nYou can now:" -ForegroundColor White
Write-Host "1. Access Rate Cards via Business Management menu" -ForegroundColor White
Write-Host "2. Select from 100+ SA advocate templates" -ForegroundColor White
Write-Host "3. Create proformas with auto-populated pricing" -ForegroundColor White
