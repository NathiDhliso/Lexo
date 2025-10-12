# Dark Mode Issue Checker
# This script scans your codebase for common dark mode issues

Write-Host "🌙 Dark Mode Issue Checker" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host ""

# Function to count matches
function Count-Matches {
    param($pattern, $path)
    $matches = Select-String -Path $path -Pattern $pattern -AllMatches
    return ($matches | Measure-Object).Count
}

# Check for shadow utilities
Write-Host "🔍 Checking for shadow utilities..." -ForegroundColor Yellow
$shadowPattern = 'className="[^"]*shadow-(sm|md|lg|xl)[^"]*"'
$shadowFiles = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.jsx | Select-String -Pattern $shadowPattern | Select-Object -ExpandProperty Path -Unique
$shadowCount = ($shadowFiles | Measure-Object).Count
Write-Host "   Found in $shadowCount files" -ForegroundColor $(if ($shadowCount -gt 0) { "Red" } else { "Green" })
if ($shadowCount -gt 0) {
    $shadowFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
}
Write-Host ""

# Check for bg-white without dark variant
Write-Host "🔍 Checking for bg-white without dark variant..." -ForegroundColor Yellow
$bgWhitePattern = 'className="[^"]*\bbg-white\b(?![^"]*dark:)[^"]*"'
$bgWhiteFiles = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.jsx | Select-String -Pattern $bgWhitePattern | Select-Object -ExpandProperty Path -Unique
$bgWhiteCount = ($bgWhiteFiles | Measure-Object).Count
Write-Host "   Found in $bgWhiteCount files" -ForegroundColor $(if ($bgWhiteCount -gt 0) { "Red" } else { "Green" })
if ($bgWhiteCount -gt 0 -and $bgWhiteCount -le 10) {
    $bgWhiteFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
} elseif ($bgWhiteCount -gt 10) {
    $bgWhiteFiles | Select-Object -First 10 | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
    Write-Host "   ... and $($bgWhiteCount - 10) more files" -ForegroundColor Gray
}
Write-Host ""

# Check for border-gray without dark variant
Write-Host "🔍 Checking for border-gray-* without dark variant..." -ForegroundColor Yellow
$borderGrayPattern = 'className="[^"]*\bborder-gray-\d+\b(?![^"]*dark:)[^"]*"'
$borderGrayFiles = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.jsx | Select-String -Pattern $borderGrayPattern | Select-Object -ExpandProperty Path -Unique
$borderGrayCount = ($borderGrayFiles | Measure-Object).Count
Write-Host "   Found in $borderGrayCount files" -ForegroundColor $(if ($borderGrayCount -gt 0) { "Red" } else { "Green" })
if ($borderGrayCount -gt 0 -and $borderGrayCount -le 10) {
    $borderGrayFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
} elseif ($borderGrayCount -gt 10) {
    $borderGrayFiles | Select-Object -First 10 | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
    Write-Host "   ... and $($borderGrayCount - 10) more files" -ForegroundColor Gray
}
Write-Host ""

# Check for text-gray without dark variant
Write-Host "🔍 Checking for text-gray-* without dark variant..." -ForegroundColor Yellow
$textGrayPattern = 'className="[^"]*\btext-gray-\d+\b(?![^"]*dark:)[^"]*"'
$textGrayFiles = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.jsx | Select-String -Pattern $textGrayPattern | Select-Object -ExpandProperty Path -Unique
$textGrayCount = ($textGrayFiles | Measure-Object).Count
Write-Host "   Found in $textGrayCount files" -ForegroundColor $(if ($textGrayCount -gt 0) { "Red" } else { "Green" })
if ($textGrayCount -gt 0 -and $textGrayCount -le 10) {
    $textGrayFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
} elseif ($textGrayCount -gt 10) {
    $textGrayFiles | Select-Object -First 10 | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
    Write-Host "   ... and $($textGrayCount - 10) more files" -ForegroundColor Gray
}
Write-Host ""

# Check for inline backgroundColor styles
Write-Host "🔍 Checking for inline backgroundColor styles..." -ForegroundColor Yellow
$bgColorPattern = 'style=\{\{[^}]*backgroundColor[^}]*\}\}'
$bgColorFiles = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.jsx | Select-String -Pattern $bgColorPattern | Select-Object -ExpandProperty Path -Unique
$bgColorCount = ($bgColorFiles | Measure-Object).Count
Write-Host "   Found in $bgColorCount files" -ForegroundColor $(if ($bgColorCount -gt 0) { "Yellow" } else { "Green" })
if ($bgColorCount -gt 0) {
    $bgColorFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
}
Write-Host ""

# Summary
Write-Host "=" * 50
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "=" * 50
$totalIssues = $shadowCount + $bgWhiteCount + $borderGrayCount + $textGrayCount + $bgColorCount
Write-Host "Total files with potential dark mode issues: $totalIssues" -ForegroundColor $(if ($totalIssues -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Issue Breakdown:" -ForegroundColor White
Write-Host "  - Shadow utilities: $shadowCount files" -ForegroundColor $(if ($shadowCount -gt 0) { "Red" } else { "Green" })
Write-Host "  - bg-white without dark: $bgWhiteCount files" -ForegroundColor $(if ($bgWhiteCount -gt 0) { "Red" } else { "Green" })
Write-Host "  - border-gray without dark: $borderGrayCount files" -ForegroundColor $(if ($borderGrayCount -gt 0) { "Red" } else { "Green" })
Write-Host "  - text-gray without dark: $textGrayCount files" -ForegroundColor $(if ($textGrayCount -gt 0) { "Red" } else { "Green" })
Write-Host "  - Inline backgroundColor: $bgColorCount files" -ForegroundColor $(if ($bgColorCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

if ($totalIssues -eq 0) {
    Write-Host "✅ Great! No dark mode issues found!" -ForegroundColor Green
} else {
    Write-Host "💡 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Read START_DARK_MODE_FIX.md for guidance" -ForegroundColor White
    Write-Host "   2. Start with files that have the most issues" -ForegroundColor White
    Write-Host "   3. Use DARK_MODE_EXAMPLES.md for fix patterns" -ForegroundColor White
    Write-Host "   4. Test each fix by toggling dark mode" -ForegroundColor White
}
Write-Host ""
