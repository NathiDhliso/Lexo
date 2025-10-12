# Batch Dark Mode Fix Script
# This script automatically fixes common dark mode issues across all TypeScript/TSX files

Write-Host "🌙 Starting Batch Dark Mode Fix..." -ForegroundColor Cyan
Write-Host ""

$filesFixed = 0
$totalReplacements = 0

# Get all TSX and JSX files
$files = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.jsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    # Fix 1: Replace shadow utilities with theme shadows
    $content = $content -replace 'className="([^"]*)\bshadow-sm\b', 'className="$1theme-shadow-sm'
    $content = $content -replace 'className="([^"]*)\bshadow-md\b', 'className="$1theme-shadow-md'
    $content = $content -replace 'className="([^"]*)\bshadow-lg\b', 'className="$1theme-shadow-lg'
    $content = $content -replace 'className="([^"]*)\bshadow-xl\b', 'className="$1theme-shadow-xl'
    
    # Fix 2: Add dark mode to hover:shadow utilities
    $content = $content -replace 'hover:shadow-sm(?!\s)', 'hover:theme-shadow-sm transition-shadow'
    $content = $content -replace 'hover:shadow-md(?!\s)', 'hover:theme-shadow-md transition-shadow'
    $content = $content -replace 'hover:shadow-lg(?!\s)', 'hover:theme-shadow-lg transition-shadow'
    
    # Fix 3: Add dark mode to bg-white (only if dark: not already present in the same className)
    $content = $content -replace 'className="([^"]*)\bbg-white\b(?![^"]*dark:bg-)', 'className="$1bg-white dark:bg-metallic-gray-800'
    
    # Fix 4: Add dark mode to bg-gray-50
    $content = $content -replace 'className="([^"]*)\bbg-gray-50\b(?![^"]*dark:bg-)', 'className="$1bg-gray-50 dark:bg-metallic-gray-900'
    
    # Fix 5: Add dark mode to bg-gray-100
    $content = $content -replace 'className="([^"]*)\bbg-gray-100\b(?![^"]*dark:bg-)', 'className="$1bg-gray-100 dark:bg-metallic-gray-800'
    
    # Fix 6: Add dark mode to border-gray-200
    $content = $content -replace 'className="([^"]*)\bborder-gray-200\b(?![^"]*dark:border-)', 'className="$1border-gray-200 dark:border-metallic-gray-700'
    
    # Fix 7: Add dark mode to border-gray-300
    $content = $content -replace 'className="([^"]*)\bborder-gray-300\b(?![^"]*dark:border-)', 'className="$1border-gray-300 dark:border-metallic-gray-600'
    
    # Fix 8: Add dark mode to text-gray-900
    $content = $content -replace 'className="([^"]*)\btext-gray-900\b(?![^"]*dark:text-)', 'className="$1text-gray-900 dark:text-neutral-100'
    
    # Fix 9: Add dark mode to text-gray-800
    $content = $content -replace 'className="([^"]*)\btext-gray-800\b(?![^"]*dark:text-)', 'className="$1text-gray-800 dark:text-neutral-200'
    
    # Fix 10: Add dark mode to text-gray-700
    $content = $content -replace 'className="([^"]*)\btext-gray-700\b(?![^"]*dark:text-)', 'className="$1text-gray-700 dark:text-neutral-300'
    
    # Fix 11: Add dark mode to text-gray-600
    $content = $content -replace 'className="([^"]*)\btext-gray-600\b(?![^"]*dark:text-)', 'className="$1text-gray-600 dark:text-neutral-400'
    
    # Fix 12: Add dark mode to text-gray-500
    $content = $content -replace 'className="([^"]*)\btext-gray-500\b(?![^"]*dark:text-)', 'className="$1text-gray-500 dark:text-neutral-500'
    
    # Check if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesFixed++
        $changes = ($content.Length - $originalContent.Length)
        Write-Host "✓ Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=" * 50
Write-Host "📊 Batch Fix Complete!" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host "Files processed: $($files.Count)" -ForegroundColor White
Write-Host "Files fixed: $filesFixed" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run .\check-dark-mode.ps1 to verify fixes" -ForegroundColor White
Write-Host "   2. Test dark mode toggle in your app" -ForegroundColor White
Write-Host "   3. Check for any remaining issues" -ForegroundColor White
Write-Host ""
