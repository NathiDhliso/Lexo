# Apply search_matters database function fix
# This script applies the migration to restore the search_matters function

Write-Host "🔧 Applying search_matters database function..." -ForegroundColor Cyan
Write-Host ""

$migrationFile = "supabase\migrations\20251027154000_add_is_archived_column.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Migration file found: $migrationFile" -ForegroundColor Green
Write-Host ""
Write-Host "This migration will:" -ForegroundColor Yellow
Write-Host "  1. Add is_archived column to matters table" -ForegroundColor White
Write-Host "  2. Create search_matters() function" -ForegroundColor White
Write-Host "  3. Create count_search_matters() function" -ForegroundColor White
Write-Host "  4. Add necessary indexes" -ForegroundColor White
Write-Host ""

# Check if user wants to apply it
$response = Read-Host "Apply this migration to Supabase? (yes/no)"

if ($response -ne "yes") {
    Write-Host "❌ Migration cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 To apply this migration:" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPTION 1: Using Supabase CLI" -ForegroundColor Yellow
Write-Host "  npx supabase db push" -ForegroundColor White
Write-Host ""
Write-Host "OPTION 2: Manual SQL execution in Supabase Dashboard" -ForegroundColor Yellow
Write-Host "  1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql" -ForegroundColor White
Write-Host "  2. Copy the contents of: $migrationFile" -ForegroundColor White
Write-Host "  3. Paste and run in SQL Editor" -ForegroundColor White
Write-Host ""
Write-Host "OPTION 3: Run migration now (requires Supabase CLI)" -ForegroundColor Yellow

$runNow = Read-Host "Run migration now? (yes/no)"

if ($runNow -eq "yes") {
    Write-Host ""
    Write-Host "🔄 Running migration..." -ForegroundColor Cyan
    
    # Check if Supabase CLI is installed
    $supabaseCli = Get-Command npx -ErrorAction SilentlyContinue
    
    if (-not $supabaseCli) {
        Write-Host "❌ npx command not found. Please install Node.js and Supabase CLI" -ForegroundColor Red
        exit 1
    }
    
    # Run the migration
    npx supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 The search_matters() function is now available!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed. Check the error above." -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Try applying manually in Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host "   https://supabase.com/dashboard" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "📝 Migration prepared but not applied." -ForegroundColor Yellow
    Write-Host "   Run 'npx supabase db push' when ready." -ForegroundColor White
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
