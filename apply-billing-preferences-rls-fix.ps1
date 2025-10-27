# Apply advocate_billing_preferences RLS fix
Write-Host "Applying advocate_billing_preferences RLS fix..." -ForegroundColor Cyan

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
    exit 1
}

# Read the migration file
$migrationPath = "supabase/migrations/20251027180000_fix_advocate_billing_preferences_rls.sql"
if (-not (Test-Path $migrationPath)) {
    Write-Host "Error: Migration file not found at $migrationPath" -ForegroundColor Red
    exit 1
}

$sql = Get-Content $migrationPath -Raw

Write-Host "Executing migration..." -ForegroundColor Yellow

# Execute the migration
$body = @{
    query = $sql
} | ConvertTo-Json

$headers = @{
    "apikey" = $SUPABASE_SERVICE_KEY
    "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "Migration applied successfully!" -ForegroundColor Green
} catch {
    # Try alternative method using PostgREST
    Write-Host "Trying alternative execution method..." -ForegroundColor Yellow
    
    # Split SQL into individual statements and execute them
    $statements = $sql -split ';' | Where-Object { $_.Trim() -ne '' }
    
    foreach ($statement in $statements) {
        $trimmedStatement = $statement.Trim()
        if ($trimmedStatement -ne '') {
            try {
                $stmtBody = @{ query = $trimmedStatement } | ConvertTo-Json
                Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $stmtBody -ErrorAction Stop
            } catch {
                Write-Host "Warning: Could not execute statement: $($trimmedStatement.Substring(0, [Math]::Min(50, $trimmedStatement.Length)))..." -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "Migration completed with warnings. Please verify in Supabase dashboard." -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Verify the policies in Supabase Dashboard > Authentication > Policies" -ForegroundColor White
Write-Host "2. Test the billing preferences fetch in your app" -ForegroundColor White
Write-Host "3. The 403 error should now be resolved" -ForegroundColor White
