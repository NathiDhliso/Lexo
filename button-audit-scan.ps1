# Complete Button & UI Flow Audit Script
# Phase 1: Complete Button Inventory

Write-Host "🔍 PHASE 1: COMPLETE BUTTON INVENTORY" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$srcPath = "c:\Users\nathi\Downloads\LexoHub\src"
$results = @()
$fileCount = 0
$buttonCount = 0

# Get all TSX files
$tsxFiles = Get-ChildItem -Path $srcPath -Recurse -Filter "*.tsx" | Where-Object { $_.FullName -notmatch "node_modules" }

Write-Host "📊 Found $($tsxFiles.Count) TSX files to scan..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $tsxFiles) {
    $fileCount++
    $relativePath = $file.FullName.Replace("c:\Users\nathi\Downloads\LexoHub\", "")
    
    # Show progress every 50 files
    if ($fileCount % 50 -eq 0) {
        Write-Host "  Processed $fileCount / $($tsxFiles.Count) files..." -ForegroundColor Gray
    }
    
    $content = Get-Content $file.FullName -Raw
    
    # Find all button patterns
    $patterns = @(
        '<button\s+[^>]*onClick\s*=\s*[{"]([^}"]+)[}"]',
        '<Button\s+[^>]*onClick\s*=\s*[{"]([^}"]+)[}"]',
        'onClick\s*=\s*\{([^\}]+)\}'
    )
    
    foreach ($pattern in $patterns) {
        $regexMatches = [regex]::Matches($content, $pattern)
        
        foreach ($match in $regexMatches) {
            $buttonCount++
            $handler = $match.Groups[1].Value
            
            # Extract surrounding context (50 chars before and after)
            $index = $match.Index
            $contextStart = [Math]::Max(0, $index - 50)
            $contextEnd = [Math]::Min($content.Length, $index + $match.Length + 50)
            $context = $content.Substring($contextStart, $contextEnd - $contextStart)
            
            $results += [PSCustomObject]@{
                File = $relativePath
                Handler = $handler.Trim()
                Context = $context.Replace("`n", " ").Replace("`r", " ") -replace '\s+', ' '
                LineNumber = ($content.Substring(0, $index) -split "`n").Count
            }
        }
    }
}

Write-Host ""
Write-Host "✅ Scan Complete!" -ForegroundColor Green
Write-Host "  Files Scanned: $fileCount" -ForegroundColor White
Write-Host "  Buttons Found: $buttonCount" -ForegroundColor White
Write-Host ""

# Group by file
Write-Host "📋 BUTTON INVENTORY BY FILE" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$groupedByFile = $results | Group-Object File | Sort-Object Count -Descending

foreach ($group in $groupedByFile) {
    Write-Host "📄 $($group.Name)" -ForegroundColor Yellow
    Write-Host "   Buttons: $($group.Count)" -ForegroundColor Gray
    
    $group.Group | ForEach-Object {
        Write-Host "   - Line $($_.LineNumber): onClick={$($_.Handler)}" -ForegroundColor White
    }
    Write-Host ""
}

# Export to JSON for further analysis
$outputPath = "c:\Users\nathi\Downloads\LexoHub\button-inventory.json"
$results | ConvertTo-Json -Depth 10 | Out-File $outputPath -Encoding UTF8

Write-Host ""
Write-Host "💾 Results saved to: button-inventory.json" -ForegroundColor Green
Write-Host ""

# Key Statistics
Write-Host "📊 KEY STATISTICS" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "  Total Files: $fileCount" -ForegroundColor White
Write-Host "  Total Buttons: $buttonCount" -ForegroundColor White
Write-Host "  Avg Buttons/File: $([Math]::Round($buttonCount / $fileCount, 2))" -ForegroundColor White
Write-Host ""

# Top files with most buttons
Write-Host "🔝 TOP 10 FILES WITH MOST BUTTONS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
$groupedByFile | Select-Object -First 10 | ForEach-Object {
    Write-Host "  $($_.Count) buttons - $($_.Name)" -ForegroundColor White
}
Write-Host ""

# Common handler patterns
Write-Host "🎯 COMMON HANDLER PATTERNS" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
$handlerPatterns = $results | Group-Object { 
    if ($_.Handler -match '^handle\w+') { 
        ($_.Handler -split '\(')[0] 
    } elseif ($_.Handler -match '^\(\)\s*=>\s*\w+') {
        "Arrow Function"
    } elseif ($_.Handler -match '^\w+$') {
        $_.Handler
    } else {
        "Complex Expression"
    }
} | Sort-Object Count -Descending | Select-Object -First 15

$handlerPatterns | ForEach-Object {
    Write-Host "  $($_.Count)x - $($_.Name)" -ForegroundColor White
}
Write-Host ""

Write-Host "✨ Phase 1 Complete! Ready for Phase 2: Flow Tracing" -ForegroundColor Green
