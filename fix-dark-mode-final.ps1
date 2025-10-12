# Final Dark Mode Fix Script
# Handles all remaining edge cases

Write-Host "🌙 Final Dark Mode Fix Pass..." -ForegroundColor Cyan
Write-Host ""

$filesFixed = 0

# Target specific files with remaining issues
$targetFiles = @(
    "src/components/settings/CloudStorageSettings.tsx",
    "src/components/settings/ProfileSettings.tsx",
    "src/components/settings/RateCardManagement.tsx",
    "src/components/settings/TeamManagement.tsx",
    "src/pages/SettingsPage.tsx",
    "src/pages/ProFormaRequestPage.tsx",
    "src/components/settings/PDFTemplateEditor.tsx"
)

foreach ($filePath in $targetFiles) {
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        # Fix text-gray-400 in all contexts
        $content = $content -replace '(\btext-gray-400\b)(?![^<>]*dark:text-)', '$1 dark:text-neutral-500'
        
        # Fix text-gray-300
        $content = $content -replace '(\btext-gray-300\b)(?![^<>]*dark:text-)', '$1 dark:text-neutral-600'
        
        # Fix border-gray in all contexts
        $content = $content -replace '(\bborder-gray-100\b)(?![^<>]*dark:border-)', '$1 dark:border-metallic-gray-800'
        $content = $content -replace '(\bborder-gray-400\b)(?![^<>]*dark:border-)', '$1 dark:border-metallic-gray-500'
        $content = $content -replace '(\bborder-gray-500\b)(?![^<>]*dark:border-)', '$1 dark:border-metallic-gray-400'
        
        # Fix bg-gray in all contexts
        $content = $content -replace '(\bbg-gray-200\b)(?![^<>]*dark:bg-)', '$1 dark:bg-metallic-gray-700'
        $content = $content -replace '(\bbg-gray-300\b)(?![^<>]*dark:bg-)', '$1 dark:bg-metallic-gray-600'
        $content = $content -replace '(\bbg-gray-400\b)(?![^<>]*dark:bg-)', '$1 dark:bg-metallic-gray-500'
        $content = $content -replace '(\bbg-gray-600\b)(?![^<>]*dark:bg-)', '$1 dark:bg-metallic-gray-400'
        $content = $content -replace '(\bbg-gray-700\b)(?![^<>]*dark:bg-)', '$1 dark:bg-metallic-gray-300'
        $content = $content -replace '(\bbg-gray-800\b)(?![^<>]*dark:bg-)', '$1 dark:bg-metallic-gray-200'
        $content = $content -replace '(\bbg-gray-900\b)(?![^<>]*dark:bg-)', '$1 dark:bg-metallic-gray-100'
        
        # Check if content changed
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -NoNewline
            $filesFixed++
            Write-Host "✓ Fixed: $filePath" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "=" * 50
Write-Host "📊 Final Fix Complete!" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host "Files fixed: $filesFixed" -ForegroundColor Green
Write-Host ""
Write-Host "Running checker to verify..." -ForegroundColor Yellow
Write-Host ""
