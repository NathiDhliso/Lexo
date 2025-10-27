# 🔍 Quick Error Check Script
# Run this anytime to check for errors in your app

Write-Host ""
Write-Host "🔍 LEXOHUB ERROR CHECKER" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check 1: TypeScript Compilation
Write-Host "1️⃣  Checking TypeScript..." -ForegroundColor Yellow
try {
    $tscOutput = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ No TypeScript errors!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ TypeScript errors found:" -ForegroundColor Red
        Write-Host $tscOutput -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Could not run TypeScript check" -ForegroundColor Yellow
}

Write-Host ""

# Check 2: ESLint
Write-Host "2️⃣  Checking ESLint..." -ForegroundColor Yellow
try {
    $eslintOutput = npm run lint --silent 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ No ESLint errors!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  ESLint warnings found (check output)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not run ESLint check" -ForegroundColor Yellow
}

Write-Host ""

# Check 3: Build Test
Write-Host "3️⃣  Testing production build..." -ForegroundColor Yellow
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Build failed:" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Could not run build check" -ForegroundColor Yellow
}

Write-Host ""

# Check 4: Database Migration Status
Write-Host "4️⃣  Checking database migrations..." -ForegroundColor Yellow
$migrationFile = "supabase\migrations\20251027154000_add_is_archived_column.sql"
if (Test-Path $migrationFile) {
    Write-Host "   ✅ Migration file exists" -ForegroundColor Green
    Write-Host "   💡 To apply: .\apply-search-matters-fix.ps1" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️  Migration file not found" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "========================" -ForegroundColor Cyan
Write-Host "📊 ERROR CHECK COMPLETE" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Full reports available:" -ForegroundColor Yellow
Write-Host "   - ERROR_SCAN_REPORT.md (detailed)" -ForegroundColor White
Write-Host "   - ERRORS_FIXED_SUMMARY.md (quick reference)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Fix any errors shown above" -ForegroundColor White
Write-Host "   2. Run: .\apply-search-matters-fix.ps1" -ForegroundColor White
Write-Host "   3. Run: npm run dev" -ForegroundColor White
Write-Host "   4. Test in browser (F12 for console)" -ForegroundColor White
Write-Host ""
