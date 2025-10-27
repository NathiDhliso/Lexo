# Phase 2: Test Each Button Flow
# Comprehensive flow analysis for all button handlers

Write-Host "🔍 PHASE 2: BUTTON FLOW ANALYSIS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$srcPath = "c:\Users\nathi\Downloads\LexoHub\src"
$buttonData = Get-Content "c:\Users\nathi\Downloads\LexoHub\button-inventory.json" | ConvertFrom-Json

# Analysis results
$issues = @()
$flows = @()

# Common patterns to check
$problemPatterns = @{
    'EmptyHandler' = '^\s*$'
    'ConsoleLog' = 'console\.(log|warn|error)'
    'TodoComment' = 'TODO|FIXME|HACK'
    'DirectNavigation' = 'window\.location|navigate\('
    'NoErrorHandling' = '(?!.*try.*catch).*fetch|await'
    'StateUpdate' = 'setState|set[A-Z]\w+\('
    'ServiceCall' = '(Service|API)\.\w+\('
}

Write-Host "🔎 Analyzing $($buttonData.Count) button handlers..." -ForegroundColor Yellow
Write-Host ""

$analyzed = 0
$withIssues = 0

foreach ($button in $buttonData) {
    $analyzed++
    
    if ($analyzed % 100 -eq 0) {
        Write-Host "  Analyzed $analyzed / $($buttonData.Count) buttons..." -ForegroundColor Gray
    }
    
    $file = Join-Path "c:\Users\nathi\Downloads\LexoHub" $button.File
    
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Extract handler function content
        $handler = $button.Handler
        $handlerName = if ($handler -match '^(\w+)') { $matches[1] } else { "anonymous" }
        
        $buttonIssues = @()
        
        # Check for common issues
        if ($handler -match $problemPatterns['EmptyHandler']) {
            $buttonIssues += "⚠️ Empty handler"
        }
        
        if ($content -match "const\s+$handlerName\s*=.*?console\.(log|warn)") {
            $buttonIssues += "⚠️ Console logging in handler"
        }
        
        # Check if handler exists in file
        $handlerPattern = "(const|function)\s+$handlerName|$handlerName\s*=\s*(async\s*)?\("
        if (-not ($content -match $handlerPattern) -and $handlerName -ne "anonymous") {
            $buttonIssues += "❌ Handler '$handlerName' not found in file"
        }
        
        # Check for service calls
        $hasServiceCall = $content -match "${handlerName}[\s\S]{0,500}(Service|API)\.\w+\("
        $hasErrorHandling = $content -match "${handlerName}[\s\S]{0,500}(try|catch|\.catch\()"
        $hasLoadingState = $content -match "${handlerName}[\s\S]{0,500}(setLoading|setIsLoading|loading\s*=)"
        
        # Check for refresh/callback
        $hasRefresh = $content -match "${handlerName}[\s\S]{0,500}(refetch|refresh|reload|invalidate)"
        
        # Build flow analysis
        $flow = [PSCustomObject]@{
            File = $button.File
            Line = $button.LineNumber
            Handler = $handlerName
            HasServiceCall = $hasServiceCall
            HasErrorHandling = $hasErrorHandling
            HasLoadingState = $hasLoadingState
            HasRefreshCallback = $hasRefresh
            Issues = $buttonIssues
        }
        
        $flows += $flow
        
        if ($buttonIssues.Count -gt 0) {
            $withIssues++
            $issues += $flow
        }
    }
}

Write-Host ""
Write-Host "✅ Flow Analysis Complete!" -ForegroundColor Green
Write-Host "  Buttons Analyzed: $analyzed" -ForegroundColor White
Write-Host "  Buttons with Issues: $withIssues" -ForegroundColor Yellow
Write-Host ""

# Export full flow analysis
$flows | ConvertTo-Json -Depth 10 | Out-File "c:\Users\nathi\Downloads\LexoHub\flow-analysis.json" -Encoding UTF8

# Critical Issues Report
Write-Host "🚨 CRITICAL ISSUES FOUND" -ForegroundColor Red
Write-Host "=========================" -ForegroundColor Red
Write-Host ""

$criticalIssues = $issues | Where-Object { $_.Issues -match "❌" }
Write-Host "❌ Missing Handlers: $($criticalIssues.Count)" -ForegroundColor Red

$criticalIssues | Group-Object File | ForEach-Object {
    Write-Host "  📄 $($_.Name)" -ForegroundColor Yellow
    $_.Group | ForEach-Object {
        Write-Host "     Line $($_.Line): $($_.Handler) - $($_.Issues -join ', ')" -ForegroundColor White
    }
}

Write-Host ""

# Missing Error Handling
Write-Host "⚠️ MISSING ERROR HANDLING" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
$noErrorHandling = $flows | Where-Object { $_.HasServiceCall -and -not $_.HasErrorHandling }
Write-Host "  Buttons with service calls but no error handling: $($noErrorHandling.Count)" -ForegroundColor White
Write-Host ""

# Missing Loading States
Write-Host "⏳ MISSING LOADING STATES" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
$noLoadingState = $flows | Where-Object { $_.HasServiceCall -and -not $_.HasLoadingState }
Write-Host "  Buttons with service calls but no loading state: $($noLoadingState.Count)" -ForegroundColor White
Write-Host ""

# Missing Refresh Callbacks
Write-Host "🔄 MISSING REFRESH CALLBACKS" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
$noRefresh = $flows | Where-Object { $_.HasServiceCall -and -not $_.HasRefreshCallback }
Write-Host "  Buttons with service calls but no refresh: $($noRefresh.Count)" -ForegroundColor White
Write-Host ""

# Good Patterns
Write-Host "✅ WELL-IMPLEMENTED BUTTONS" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
$goodButtons = $flows | Where-Object { 
    $_.HasServiceCall -and 
    $_.HasErrorHandling -and 
    $_.HasLoadingState 
}
Write-Host "  Buttons with proper patterns: $($goodButtons.Count)" -ForegroundColor White
Write-Host ""

# Top files needing attention
Write-Host "🎯 TOP FILES NEEDING ATTENTION" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
$filesNeedingWork = $issues | Group-Object File | Sort-Object Count -Descending | Select-Object -First 10
$filesNeedingWork | ForEach-Object {
    Write-Host "  $($_.Count) issues - $($_.Name)" -ForegroundColor White
}
Write-Host ""

Write-Host "💾 Full analysis saved to: flow-analysis.json" -ForegroundColor Green
Write-Host ""
Write-Host "✨ Phase 2 Complete! Ready for Phase 3: Issue Identification" -ForegroundColor Green
