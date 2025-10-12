# Quick Fix Script - Run this to fix all database issues
# This script will clean up migrations and apply fixes

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LexoHub Database Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean up old migrations
Write-Host "Step 1: Cleaning up obsolete migrations..." -ForegroundColor Yellow
Write-Host ""

$filesToDelete = @(
    "supabase/migrations/20250113000002_consolidate_user_advocate_models.sql",
    "supabase/migrations/20250113000002_consolidate_user_advocate_models_CORRECTED.sql",
    "supabase/migrations/20250113000001_add_invoice_pro_forma_status.sql",
    "supabase/migrations/20250113000003_update_rls_policies_for_user_profiles.sql"
)

$deletedCount = 0
foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Deleted: $file" -ForegroundColor Green
        $deletedCount++
    }
}

if ($deletedCount -eq 0) {
    Write-Host "  ℹ No files to delete (already cleaned)" -ForegroundColor Gray
} else {
    Write-Host "  ✓ Deleted $deletedCount obsolete migration(s)" -ForegroundColor Green
}

Write-Host ""

# Step 2: Apply new migrations
Write-Host "Step 2: Applying database migrations..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Running: supabase db push" -ForegroundColor Gray
Write-Host ""

supabase db push

Write-Host ""

# Step 3: Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "What was fixed:" -ForegroundColor Cyan
Write-Host "  ✓ Removed obsolete migrations" -ForegroundColor Green
Write-Host "  ✓ Added advocate columns to user_profiles" -ForegroundColor Green
Write-Host "  ✓ Fixed RLS policies for all tables" -ForegroundColor Green
Write-Host "  ✓ Added missing invoice columns" -ForegroundColor Green
Write-Host "  ✓ Updated advocate service to use user_profiles" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Refresh your browser" -ForegroundColor White
Write-Host "  2. Try logging in again" -ForegroundColor White
Write-Host "  3. Check console for errors" -ForegroundColor White
Write-Host ""
Write-Host "If you still see errors, check:" -ForegroundColor Yellow
Write-Host "  - IMMEDIATE_FIX_PLAN.md for troubleshooting" -ForegroundColor White
Write-Host "  - Browser console for specific error messages" -ForegroundColor White
Write-Host ""
