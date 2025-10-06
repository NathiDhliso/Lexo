# Cleanup Non-Core Migration Files
Write-Host "`n=== Cleaning up migration files ===" -ForegroundColor Cyan

# Remove migrations for deleted features
Write-Host "Removing non-core migration files..." -ForegroundColor Yellow

$nonCoreMigrations = @(
    "supabase/migrations/20250928080849_document_intelligence.sql",
    "supabase/migrations/20250928080850_practice_growth_features.sql",
    "supabase/migrations/20250928080851_strategic_finance.sql",
    "supabase/migrations/20250930130517_workflow_integrations.sql",
    "supabase/migrations/20251002180000_integration_data_tables_fixed.sql",
    "supabase/migrations/20251005000000_advanced_compliance_engine.sql",
    "supabase/migrations/20251006000000_matter_templates_system.sql",
    "supabase/migrations/20251006000001_add_firm_branding.sql",
    "supabase/migrations/20251006000003_api_integrations_system.sql",
    "supabase/migrations/20251006030000_create_academy_tables.sql",
    "supabase/migrations/20251006050000_add_user_roles_rbac.sql"
)

$removed = 0
foreach ($migration in $nonCoreMigrations) {
    if (Test-Path $migration) {
        Remove-Item $migration -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed: $(Split-Path $migration -Leaf)" -ForegroundColor Green
        $removed++
    }
}

Write-Host "`n=== Migration Cleanup Complete! ===" -ForegroundColor Green
Write-Host "Removed $removed non-core migration files" -ForegroundColor Cyan

Write-Host "`nRemaining migrations are for core features:" -ForegroundColor White
Write-Host "- Matters" -ForegroundColor Green
Write-Host "- Pro Forma" -ForegroundColor Green
Write-Host "- Invoices" -ForegroundColor Green
Write-Host "- Time Entries" -ForegroundColor Green
Write-Host "- Expenses" -ForegroundColor Green
Write-Host "- Services" -ForegroundColor Green
Write-Host "- Auth/Security" -ForegroundColor Green
