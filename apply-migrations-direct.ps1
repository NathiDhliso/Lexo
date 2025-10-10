# Apply migrations directly to Supabase using psql
# This bypasses the Supabase CLI connection issues

$DB_HOST = "aws-1-eu-west-2.pooler.supabase.com"
$DB_PORT = "6543"
$DB_NAME = "postgres"
$DB_USER = "postgres.ecaamkrcsjrcjmcjshlu"
$DB_PASSWORD = "Magnox271991!"

$migrations = @(
    "20250111000000_add_engagement_agreements.sql",
    "20250111000001_add_scope_amendments.sql",
    "20250111000002_add_payment_disputes.sql",
    "20250111000003_extend_existing_tables.sql",
    "20250111000004_add_retainer_system.sql",
    "20250111000005_add_attorney_portal.sql"
)

Write-Host "Applying migrations directly to Supabase..." -ForegroundColor Green
Write-Host ""

$env:PGPASSWORD = $DB_PASSWORD

foreach ($migration in $migrations) {
    $filePath = "supabase\migrations\$migration"
    
    if (Test-Path $filePath) {
        Write-Host "Applying: $migration" -ForegroundColor Cyan
        
        # Use psql to apply migration
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $filePath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Success" -ForegroundColor Green
            
            # Mark migration as applied
            $version = $migration -replace '_.*', ''
            $name = $migration -replace '\.sql$', ''
            
            $sql = "INSERT INTO supabase_migrations.schema_migrations (version, statements, name) VALUES ('$version', ARRAY[]::text[], '$name') ON CONFLICT (version) DO NOTHING;"
            
            $sql | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
            
        } else {
            Write-Host "✗ Failed" -ForegroundColor Red
            break
        }
        
        Write-Host ""
    } else {
        Write-Host "File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "Migration complete!" -ForegroundColor Green
