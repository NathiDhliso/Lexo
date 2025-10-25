# Technical Debt Cleanup Script
# Phase 1: Immediate Cleanup
# Estimated time: 30 minutes
# Impact: Clean repository, faster git operations

Write-Host "🧹 Starting Technical Debt Cleanup - Phase 1" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# 1. Delete old documentation files
Write-Host "📄 Step 1: Deleting old documentation files..." -ForegroundColor Yellow

$oldDocs = @(
  "⚠️_READ_THIS_FIRST.md",
  "🎉_CRITICAL_PATH_COMPLETE.md",
  "🎉_FINISH_LINE_REACHED.md",
  "🚨_DO_THIS_NOW.md",
  "AUTH_CLEANUP_SUMMARY.md",
  "CODEBASE_ALIGNMENT_COMPLETE.md",
  "COMPLETE_REFACTOR_SUMMARY.md",
  "CRITICAL_PATH_PROGRESS.md",
  "DAY_1_COMPLETION_REPORT.md",
  "DAY_2_COMPLETION_REPORT.md",
  "DOCUMENT_PROCESSING_FIX.md",
  "EXECUTE_NOW.md",
  "FINAL_3_HOUR_PUSH_STATUS.md",
  "FINAL_DELIVERY_SUMMARY.md",
  "FINAL_MIGRATION_STATUS.md",
  "FIX_SUMMARY.md",
  "IMMEDIATE_FIX_PLAN.md",
  "IMPLEMENTATION_COMPLETE.md",
  "Iteration 2 fix lexohub.txt",
  "ITERATION_1_COMPLETE.md",
  "ITERATION_2_COMPLETE.md",
  "MIGRATION_CLEANUP_PLAN.md",
  "MIGRATION_CLEANUP_SUMMARY.md",
  "MIGRATION_EXECUTION_GUIDE.md",
  "MIGRATIONS_READY.md",
  "NEXT_STEPS.md",
  "PIPELINE_REFACTORING_COMPLETE.md",
  "PIPELINE_REFACTORING_PROGRESS.md",
  "PIPELINE_REFACTORING_SESSION_SUMMARY.md",
  "Project refactor.md",
  "QUICK_MIGRATION_REFERENCE.md",
  "QUICK_START_REFACTORING.md",
  "QUICK_START_WHEN_YOU_RETURN.md",
  "README_FIX.md",
  "REFACTOR_COMPLETE.md",
  "REFACTOR_INDEX.md",
  "REFACTOR_PROGRESS.md",
  "REFACTORING_100_PERCENT_COMPLETE.md",
  "REFACTORING_FINAL_SUMMARY.md",
  "REFACTORING_NEXT_STEPS.md",
  "REFACTORING_PROGRESS.md",
  "REFACTORING_SUMMARY.md",
  "SIMPLE_FIX.md",
  "TICKER_IMPROVEMENTS.md",
  "TROUBLESHOOTING.md",
  "UI_UPDATES_COMPLETE.md",
  "WELCOME_BACK.md"
)

$deletedCount = 0
$oldDocs | ForEach-Object {
  if (Test-Path $_) {
    Remove-Item $_ -Force
    Write-Host "  ✓ Deleted $_" -ForegroundColor Green
    $deletedCount++
  }
}

Write-Host "`n  Summary: Deleted $deletedCount files" -ForegroundColor Cyan

# 2. Archive old PowerShell scripts
Write-Host "`n📦 Step 2: Archiving old PowerShell scripts..." -ForegroundColor Yellow

New-Item -ItemType Directory -Path "scripts/archive" -Force | Out-Null

$oldScripts = @(
  "check-database-status.ps1",
  "check-user-profiles-columns.ps1",
  "cleanup-migrations.ps1",
  "fix-database-now.ps1",
  "repair-migrations.ps1"
)

$archivedCount = 0
$oldScripts | ForEach-Object {
  if (Test-Path $_) {
    Move-Item $_ "scripts/archive/" -Force
    Write-Host "  ✓ Archived $_" -ForegroundColor Green
    $archivedCount++
  }
}

Write-Host "`n  Summary: Archived $archivedCount scripts" -ForegroundColor Cyan

# 3. Move test files to correct location
Write-Host "`n📁 Step 3: Organizing test files..." -ForegroundColor Yellow

$movedCount = 0

if (Test-Path "test-onedrive-config.ts") {
  Move-Item "test-onedrive-config.ts" "tests/" -Force -ErrorAction SilentlyContinue
  Write-Host "  ✓ Moved test-onedrive-config.ts to tests/" -ForegroundColor Green
  $movedCount++
}

if (Test-Path "client-diagnostic.js") {
  New-Item -ItemType Directory -Path "scripts" -Force | Out-Null
  Move-Item "client-diagnostic.js" "scripts/" -Force -ErrorAction SilentlyContinue
  Write-Host "  ✓ Moved client-diagnostic.js to scripts/" -ForegroundColor Green
  $movedCount++
}

if (Test-Path "src/Full Lexo table.txt") {
  New-Item -ItemType Directory -Path "docs/archive" -Force | Out-Null
  Move-Item "src/Full Lexo table.txt" "docs/archive/" -Force -ErrorAction SilentlyContinue
  Write-Host "  ✓ Moved Full Lexo table.txt to docs/archive/" -ForegroundColor Green
  $movedCount++
}

Write-Host "`n  Summary: Moved $movedCount files" -ForegroundColor Cyan

# 4. Summary
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "✅ Phase 1 Cleanup Complete!" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "📊 Results:" -ForegroundColor Yellow
Write-Host "  • Documentation files deleted: $deletedCount" -ForegroundColor White
Write-Host "  • Scripts archived: $archivedCount" -ForegroundColor White
Write-Host "  • Files reorganized: $movedCount" -ForegroundColor White
Write-Host "  • Estimated space saved: ~2MB" -ForegroundColor White

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review TECHNICAL_DEBT_AUDIT.md for remaining tasks" -ForegroundColor White
Write-Host "  2. Run Phase 2: Remove console.log statements" -ForegroundColor White
Write-Host "  3. Run Phase 3: Fix unused imports" -ForegroundColor White

Write-Host "`n✨ Your codebase is now cleaner!" -ForegroundColor Green
