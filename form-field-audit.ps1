# Form Field Input Audit Script
# Checking for industry-standard input handling

Write-Host "🔍 FORM FIELD INPUT AUDIT - Industry Standards Check" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$srcPath = "c:\Users\nathi\Downloads\LexoHub\src"

# Get all TSX files with forms
$formFiles = Get-ChildItem -Path $srcPath -Recurse -Filter "*.tsx" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    $content -match "(<input|<textarea|<select|onChange=|value=)"
}

Write-Host "📊 Found $($formFiles.Count) files with form inputs" -ForegroundColor Yellow
Write-Host ""

$problematicInputs = 0
$goodInputs = 0

foreach ($file in $formFiles) {
    $relativePath = $file.FullName.Replace("c:\Users\nathi\Downloads\LexoHub\", "")
    $content = Get-Content $file.FullName -Raw
    
    # Check for problematic patterns
    $hasOnInput = $content -match 'onInput\s*='
    $hasSingleCharValidation = $content -match 'maxLength\s*=\s*["\']?1["\']?'
    $hasNoDebounce = ($content -match 'onChange.*search' -or $content -match 'onChange.*filter') -and 
                     -not ($content -match 'debounce|setTimeout|useDebounce')
    
    # Check for good patterns
    $hasMinHeight = $content -match 'min-h-\[44px\]|minHeight.*44'
    $hasAccessiblePlaceholder = $content -match 'placeholder='
    $hasAriaLabels = $content -match 'aria-label|aria-describedby'
    
    if ($hasOnInput -or $hasSingleCharValidation -or $hasNoDebounce) {
        $problematicInputs++
        
        $fileIssues = @()
        if ($hasOnInput) {
            $fileIssues += "⚠️ Uses onInput instead of onChange"
        }
        if ($hasSingleCharValidation) {
            $fileIssues += "⚠️ Has maxLength=1 (single character input)"
        }
        if ($hasNoDebounce) {
            $fileIssues += "⚠️ Search/filter without debouncing"
        }
        
        $issues += [PSCustomObject]@{
            File = $relativePath
            Issues = $fileIssues -join '; '
        }
    } else {
        $goodInputs++
    }
}

Write-Host ""
Write-Host "📊 AUDIT RESULTS" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "  Files with Forms: $($formFiles.Count)" -ForegroundColor White
Write-Host "  Good Inputs: $goodInputs" -ForegroundColor Green
Write-Host "  Problematic: $problematicInputs" -ForegroundColor Yellow
Write-Host ""

if ($issues.Count -gt 0) {
    Write-Host "⚠️ ISSUES FOUND" -ForegroundColor Yellow
    Write-Host "===============" -ForegroundColor Yellow
    $issues | ForEach-Object {
        Write-Host "  📄 $($_.File)" -ForegroundColor Yellow
        Write-Host "     $($_.Issues)" -ForegroundColor White
    }
} else {
    Write-Host "✅ NO ISSUES FOUND - All inputs follow industry standards!" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ Audit Complete!" -ForegroundColor Green
