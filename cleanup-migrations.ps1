# Migration Cleanup Script
# Removes obsolete and conflicting migration files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Files to delete
$filesToDelete = @(
    "supabase/migrations/20250113000002_consolidate_user_advocate_models.sql",
    "supabase/migrations/20250113000002_consolidate_user_advocate_models_CORRECTED.sql",
    "supabase/migrations/20250113000001_add_invoice_pro_forma_status.sql",
    "supabase/migrations/20250113000003_update_rls_policies_for_user_profiles.sql"
)

$deletedCount = 0
$notFoundCount = 0

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Write-Host "Deleting: $file" -ForegroundColor Yellow
        Remove-Item $file -Force
        $deletedCount++
        Write-Host "  ✓ Deleted" -ForegroundColor Green
    } else {
        Write-Host "Not found: $file" -ForegroundColor Gray
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files deleted: $deletedCount" -ForegroundColor Green
Write-Host "Files not found: $notFoundCount" -ForegroundColor Gray
Write-Host ""

if ($deletedCount -gt 0) {
    Write-Host "✓ Cleanup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review the new migration: supabase/migrations/20250113000004_align_schema_with_database.sql"
    Write-Host "2. Run: supabase db push"
    Write-Host "3. Verify the migration succeeded"
} else {
    Write-Host "No files were deleted. They may have already been removed." -ForegroundColor Yellow
}

Write-Host ""
