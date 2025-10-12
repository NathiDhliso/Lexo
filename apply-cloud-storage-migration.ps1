#!/usr/bin/env pwsh
# Apply cloud storage migration

Write-Host "Applying cloud storage migration..." -ForegroundColor Cyan

# Check if Supabase CLI is available
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Supabase CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Apply the migration
Write-Host "Running migration: 20250111000040_cloud_storage_providers.sql" -ForegroundColor Yellow
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Cloud storage migration applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The following tables have been created:" -ForegroundColor Cyan
    Write-Host "  - cloud_storage_connections" -ForegroundColor White
    Write-Host "  - cloud_storage_sync_log" -ForegroundColor White
    Write-Host "  - document_cloud_storage" -ForegroundColor White
} else {
    Write-Host "✗ Migration failed. Check the error above." -ForegroundColor Red
    exit 1
}
