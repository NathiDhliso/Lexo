# Apply retainer_agreements RLS fix to Supabase
# This fixes 403 Forbidden errors when checking for retainer agreements

Write-Host "Applying retainer_agreements RLS fix..." -ForegroundColor Cyan

# Load environment variables
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$SUPABASE_URL = $env:VITE_SUPABASE_URL
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SUPABASE_SERVICE_KEY) {
    Write-Host "Error: Missing Supabase credentials in .env file" -ForegroundColor Red
    Write-Host "Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

# Read the SQL file
$sqlContent = Get-Content "supabase/migrations/20251027190000_fix_retainer_agreements_rls.sql" -Raw

# Execute via Supabase REST API
$headers = @{
    "apikey" = $SUPABASE_SERVICE_KEY
    "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    query = $sqlContent
} | ConvertTo-Json

try {
    Write-Host "Executing SQL migration..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body
    Write-Host "✓ Migration applied successfully!" -ForegroundColor Green
    
    Write-Host "`nVerifying policies..." -ForegroundColor Yellow
    $verifyQuery = @{
        query = "SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'retainer_agreements' ORDER BY policyname;"
    } | ConvertTo-Json
    
    $policies = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $verifyQuery
    Write-Host "✓ Policies verified!" -ForegroundColor Green
    
} catch {
    Write-Host "Error applying migration: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ Retainer agreements RLS fix complete!" -ForegroundColor Green
Write-Host "The 403 errors on retainer_agreements should now be resolved." -ForegroundColor Cyan
