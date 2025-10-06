# PowerShell script to run the consolidated ProForma migration
Write-Host "Running consolidated ProForma migration..." -ForegroundColor Green

# Read the migration file content
$migrationContent = Get-Content -Path "database\migrations\consolidated_proforma_migration.sql" -Raw

# Create a temporary file with the migration content
$tempFile = "temp_migration.sql"
$migrationContent | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "Migration file prepared. Please run the following command manually:" -ForegroundColor Yellow
Write-Host "supabase db push" -ForegroundColor Cyan

Write-Host "`nAlternatively, copy the contents of database\migrations\consolidated_proforma_migration.sql" -ForegroundColor Yellow
Write-Host "and paste it into your Supabase SQL Editor at:" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard/project/ecaamkrcsjrcjmcjshlu/sql" -ForegroundColor Cyan

# Clean up
if (Test-Path $tempFile) {
    Remove-Item $tempFile
}

Write-Host "`nMigration script completed!" -ForegroundColor Green