# ============================================================================
# Apply Attorneys Table Migration
# This script provides instructions for applying the migration to Supabase
# ============================================================================

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "ATTORNEYS TABLE MIGRATION - INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Copy Migration File" -ForegroundColor Yellow
Write-Host "  File: supabase\migrations\20250128000001_create_attorneys_table.sql" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Open Supabase Dashboard" -ForegroundColor Yellow
Write-Host "  URL: https://ecaamkrcsjrcjmcjshlu.supabase.co" -ForegroundColor White
Write-Host "  Navigate to: SQL Editor" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Paste and Run Migration" -ForegroundColor Yellow
Write-Host "  1. Click 'New Query'" -ForegroundColor White
Write-Host "  2. Paste the contents of the migration file" -ForegroundColor White
Write-Host "  3. Click 'Run' or press Ctrl+Enter" -ForegroundColor White
Write-Host ""

Write-Host "Step 4: Set Advocate ID for Existing Firms" -ForegroundColor Yellow
Write-Host "  File: supabase\migrations\20250128000002_set_firms_advocate_id.sql" -ForegroundColor White
Write-Host "  1. Open a new query tab" -ForegroundColor White
Write-Host "  2. Paste the contents" -ForegroundColor White
Write-Host "  3. Run the query" -ForegroundColor White
Write-Host ""

Write-Host "Step 5: Refresh Your Application" -ForegroundColor Yellow
Write-Host "  Hard refresh the browser: Ctrl+Shift+R" -ForegroundColor White
Write-Host ""

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "What this migration does:" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  ✓ Creates 'attorneys' table (normalized structure)" -ForegroundColor Green
Write-Host "  ✓ Adds 'advocate_id' column to 'firms' table" -ForegroundColor Green
Write-Host "  ✓ Adds 'favorite_attorneys' column to 'user_preferences'" -ForegroundColor Green
Write-Host "  ✓ Migrates existing attorney data from firms table" -ForegroundColor Green
Write-Host "  ✓ Sets up proper RLS policies" -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to open the migration file in VS Code..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open the migration file
code "supabase\migrations\20250128000001_create_attorneys_table.sql"
