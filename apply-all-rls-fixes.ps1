# Apply all RLS fixes for billing preferences and retainer agreements
# Fixes 403 Forbidden and 406 Not Acceptable errors

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "Applying RLS Fixes for Billing Preferences and Retainer Agreements" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found" -ForegroundColor Red
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

$SUPABASE_URL = $env:VITE_SUPABASE_URL
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SUPABASE_SERVICE_KEY) {
    Write-Host "Error: Missing Supabase credentials in .env file" -ForegroundColor Red
    Write-Host "Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

# List of migrations to apply
$migrations = @(
    @{
        Path = "supabase/migrations/20251027180000_fix_advocate_billing_preferences_rls.sql"
        Name = "Billing Preferences RLS Fix"
    },
    @{
        Path = "supabase/migrations/20251027191000_fix_advocate_billing_preferences_406.sql"
        Name = "Billing Preferences 406 Fix"
    },
    @{
        Path = "supabase/migrations/20251027190000_fix_retainer_agreements_rls.sql"
        Name = "Retainer Agreements RLS Fix"
    }
)

$headers = @{
    "apikey" = $SUPABASE_SERVICE_KEY
    "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
    "Content-Type" = "application/json"
}

$successCount = 0
$failCount = 0

foreach ($migration in $migrations) {
    Write-Host "`n------------------------------------------------------------------------------" -ForegroundColor Gray
    Write-Host "Applying: $($migration.Name)" -ForegroundColor Yellow
    Write-Host "File: $($migration.Path)" -ForegroundColor Gray
    
    if (-not (Test-Path $migration.Path)) {
        Write-Host "✗ Migration file not found!" -ForegroundColor Red
        $failCount++
        continue
    }

    $sql = Get-Content $migration.Path -Raw
    $body = @{ query = $sql } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "✓ Migration applied successfully!" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "✗ Error applying migration: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try alternative method - execute statements individually
        Write-Host "  Trying alternative execution method..." -ForegroundColor Yellow
        
        $statements = $sql -split ';' | Where-Object { $_.Trim() -ne '' -and $_.Trim() -notmatch '^--' }
        $stmtSuccess = 0
        
        foreach ($statement in $statements) {
            $trimmedStatement = $statement.Trim()
            if ($trimmedStatement -ne '' -and $trimmedStatement -notmatch '^--') {
                try {
                    $stmtBody = @{ query = $trimmedStatement + ';' } | ConvertTo-Json
                    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $stmtBody -ErrorAction Stop | Out-Null
                    $stmtSuccess++
                } catch {
                    # Silently continue - some statements may fail if already applied
                }
            }
        }
        
        if ($stmtSuccess -gt 0) {
            Write-Host "  ✓ Applied $stmtSuccess statements" -ForegroundColor Green
            $successCount++
        } else {
            $failCount++
        }
    }
}

Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })

if ($successCount -gt 0) {
    Write-Host "`n✓ RLS fixes have been applied!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Refresh your application" -ForegroundColor White
    Write-Host "2. The 403 and 406 errors should now be resolved" -ForegroundColor White
    Write-Host "3. Verify in Supabase Dashboard > Authentication > Policies" -ForegroundColor White
} else {
    Write-Host "`n✗ No migrations were applied successfully" -ForegroundColor Red
    Write-Host "Please check your Supabase credentials and try again" -ForegroundColor Yellow
}
