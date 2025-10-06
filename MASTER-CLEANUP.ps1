# MASTER CLEANUP SCRIPT - Remove ALL non-essential files
# Run this to clean up the entire codebase

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   LexoHub Master Cleanup Script       ║" -ForegroundColor Cyan
Write-Host "║   Streamline to Core Features Only    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

$totalRemoved = 0

# ============================================
# 1. NON-ESSENTIAL ROOT FOLDERS
# ============================================
Write-Host "1. Removing non-essential root folders..." -ForegroundColor Yellow
$folders = @(".kiro", ".trae", ".storybook", "storybook-static", "aws", "dev-tools", "Systemprompts")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Remove-Item $folder -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed: $folder" -ForegroundColor Green
        $totalRemoved++
    }
}

# ============================================
# 2. OLD DOCUMENTATION FILES
# ============================================
Write-Host "`n2. Removing old documentation files..." -ForegroundColor Yellow
$oldDocs = @(
    "COMPREHENSIVE_RESPONSIVE_DESIGN_AUDIT.md",
    "FINAL_ZOOM_FIX.md",
    "FIX_PRO_FORMA_403_ERROR.md",
    "MIGRATION_VERIFICATION.md",
    "RESPONSIVE_DESIGN_FIXES.md",
    "SUPABASE_AUTH_FIX_SUMMARY.md",
    "SYSTEM_PROMPT.md",
    "TEMPLATES_SETUP_GUIDE.md",
    "ZOOM_SCALE_FIXES.md",
    "PRODUCTION_DEPLOYMENT_GUIDE.md",
    "ORPHANED_FILES_TO_DELETE.md",
    "NEXT_STEPS.md"
)
foreach ($doc in $oldDocs) {
    if (Test-Path $doc) {
        Remove-Item $doc -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed: $doc" -ForegroundColor Green
        $totalRemoved++
    }
}

# ============================================
# 3. DEBUG SQL FILES
# ============================================
Write-Host "`n3. Removing debug SQL files..." -ForegroundColor Yellow
$sqlFiles = @(
    "check_all_enums.sql",
    "check_generated_columns.sql",
    "check_generated_proformas.sql",
    "check_matter_status_enum.sql",
    "check_matters.sql",
    "check_my_requests.sql",
    "check_pro_forma_submissions.sql",
    "check_specific_requests.sql",
    "debug_proforma_requests.sql",
    "diagnose_pro_forma_table.sql",
    "verify_proforma_schema.sql"
)
foreach ($sql in $sqlFiles) {
    if (Test-Path $sql) {
        Remove-Item $sql -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed: $sql" -ForegroundColor Green
        $totalRemoved++
    }
}

# ============================================
# 4. OLD MIGRATION/FIX SCRIPTS
# ============================================
Write-Host "`n4. Removing old scripts..." -ForegroundColor Yellow
$scripts = @(
    "apply_proforma_history_migrations.ps1",
    "apply_templates_migration.sql",
    "fix_advocates_sync.sql",
    "fix_pro_forma_complete.sql",
    "fix_pro_forma_rls.sql",
    "fix_supabase_auth.ps1",
    "run_consolidated_migration.ps1",
    "cleanup-script.ps1",
    "cleanup-orphaned-files.ps1",
    "cleanup-docs.ps1",
    "final-cleanup.ps1"
)
foreach ($script in $scripts) {
    if (Test-Path $script) {
        Remove-Item $script -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed: $script" -ForegroundColor Green
        $totalRemoved++
    }
}

# ============================================
# 5. TEST/LINT FILES
# ============================================
Write-Host "`n5. Removing test/lint files..." -ForegroundColor Yellow
$testFiles = @(
    "test-templates.html",
    "lint-doc-ocr.json",
    "lint-output.json",
    "typecheck.log"
)
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed: $file" -ForegroundColor Green
        $totalRemoved++
    }
}

# ============================================
# 6. OLD IMPLEMENTATION DOCS
# ============================================
Write-Host "`n6. Removing old implementation docs..." -ForegroundColor Yellow
$implDocs = @(
    "docs/implementation/API_INTEGRATIONS_GUIDE.md",
    "docs/implementation/ICON_FIX_SUMMARY.md",
    "docs/implementation/IMPLEMENTATION_PROGRESS.md",
    "docs/implementation/IMPLEMENTATION_SUMMARY.md",
    "docs/implementation/INTEGRATIONS_IMPLEMENTATION_SUMMARY.md",
    "docs/implementation/INTEGRATION_COMPLETION_REPORT.md",
    "docs/implementation/INTEGRATION_QUICK_REFERENCE.md",
    "docs/implementation/INTEGRATION_SETUP_CHECKLIST.md",
    "docs/implementation/INVOICE_DESIGNER_IMPLEMENTATION.md",
    "docs/implementation/INVOICE_PREVIEW_IMPLEMENTATION.md",
    "docs/implementation/LIVE_PREVIEW_IMPLEMENTATION.md",
    "docs/implementation/MOCK_DATA_REMOVAL_PLAN.md",
    "docs/implementation/MOCK_DATA_REMOVAL_SUMMARY.md",
    "docs/implementation/MOCK_DATA_REMOVAL_TRACKER.md",
    "docs/implementation/PHASE1_COMPLETION_SUMMARY.md",
    "docs/implementation/PROFORMA_IMPLEMENTATION_SUMMARY.md",
    "docs/implementation/PROFORMA_PREPOPULATION_IMPLEMENTATION.md",
    "docs/implementation/PROFORMA_UX_AUDIT.md",
    "docs/implementation/PROFORMA_UX_IMPROVEMENTS.md",
    "docs/implementation/PRO_FORMA_INVOICE_HISTORY.md",
    "docs/implementation/RBAC_IMPLEMENTATION.md",
    "docs/implementation/RBAC_QUICK_START.md",
    "docs/implementation/SETTINGS_INVOICE_DESIGNER_LINK.md",
    "docs/implementation/SETTINGS_TEMPLATES_IMPLEMENTATION.md",
    "docs/implementation/WORKFLOW_ENHANCEMENT_SUMMARY.md",
    "docs/implementation/WORKFLOW_IMPLEMENTATION_PROGRESS.md",
    "docs/implementation/WORKFLOW_VISUAL_GUIDE.md"
)
foreach ($doc in $implDocs) {
    if (Test-Path $doc) {
        Remove-Item $doc -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed: $(Split-Path $doc -Leaf)" -ForegroundColor Green
        $totalRemoved++
    }
}

# ============================================
# 7. NON-ESSENTIAL DOC FOLDERS
# ============================================
Write-Host "`n7. Removing non-essential doc folders..." -ForegroundColor Yellow
$docFolders = @("docs/architecture", "docs/assets", "docs/phases", "docs/security")
foreach ($folder in $docFolders) {
    if (Test-Path $folder) {
        Remove-Item $folder -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed: $folder" -ForegroundColor Green
        $totalRemoved++
    }
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   CLEANUP COMPLETE!                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Total items removed: $totalRemoved" -ForegroundColor Cyan

Write-Host "`n✓ Essential files kept:" -ForegroundColor Green
Write-Host "  - README.md" -ForegroundColor White
Write-Host "  - CLEANUP_COMPLETE.md" -ForegroundColor White
Write-Host "  - docs/CORE_FEATURES_ONLY.md" -ForegroundColor White
Write-Host "  - docs/implementation/ (9 essential docs)" -ForegroundColor White
Write-Host "  - docs/database/ (schema docs)" -ForegroundColor White
Write-Host "  - database/ (migrations)" -ForegroundColor White
Write-Host "  - supabase/ (migrations)" -ForegroundColor White
Write-Host "  - src/ (application code)" -ForegroundColor White
Write-Host "  - types/ (TypeScript types)" -ForegroundColor White

Write-Host "`n✓ Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review remaining files" -ForegroundColor White
Write-Host "  2. Run 'npm run dev' to test" -ForegroundColor White
Write-Host "  3. Commit changes: git add . && git commit -m 'chore: final cleanup'" -ForegroundColor White
Write-Host "  4. Ready for AWS migration!" -ForegroundColor White

Write-Host "`n"
