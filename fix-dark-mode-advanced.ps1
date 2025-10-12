# Advanced Dark Mode Fix Script
# Handles more complex patterns including template literals and multi-line classNames

Write-Host "🌙 Starting Advanced Dark Mode Fix..." -ForegroundColor Cyan
Write-Host ""

$filesFixed = 0

# Get all TSX and JSX files
$files = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.jsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix shadow utilities in template literals and complex patterns
    # Match className={`...shadow-...`} patterns
    $content = $content -replace '(className=\{`[^`]*)\bshadow-sm\b', '$1theme-shadow-sm'
    $content = $content -replace '(className=\{`[^`]*)\bshadow-md\b', '$1theme-shadow-md'
    $content = $content -replace '(className=\{`[^`]*)\bshadow-lg\b', '$1theme-shadow-lg'
    $content = $content -replace '(className=\{`[^`]*)\bshadow-xl\b', '$1theme-shadow-xl'
    
    # Fix hover:shadow in template literals
    $content = $content -replace '(className=\{`[^`]*)hover:shadow-sm\b', '$1hover:theme-shadow-sm transition-shadow'
    $content = $content -replace '(className=\{`[^`]*)hover:shadow-md\b', '$1hover:theme-shadow-md transition-shadow'
    $content = $content -replace '(className=\{`[^`]*)hover:shadow-lg\b', '$1hover:theme-shadow-lg transition-shadow'
    
    # Fix remaining border-gray patterns
    $content = $content -replace 'className="([^"]*)\bborder-gray-400\b(?![^"]*dark:border-)', 'className="$1border-gray-400 dark:border-metallic-gray-500'
    $content = $content -replace 'className="([^"]*)\bborder-gray-500\b(?![^"]*dark:border-)', 'className="$1border-gray-500 dark:border-metallic-gray-400'
    
    # Fix text-gray-400
    $content = $content -replace 'className="([^"]*)\btext-gray-400\b(?![^"]*dark:text-)', 'className="$1text-gray-400 dark:text-neutral-500'
    
    # Fix text-gray-300
    $content = $content -replace 'className="([^"]*)\btext-gray-300\b(?![^"]*dark:text-)', 'className="$1text-gray-300 dark:text-neutral-600'
    
    # Fix text-gray-200
    $content = $content -replace 'className="([^"]*)\btext-gray-200\b(?![^"]*dark:text-)', 'className="$1text-gray-200 dark:text-neutral-700'
    
    # Fix bg-gray-200
    $content = $content -replace 'className="([^"]*)\bbg-gray-200\b(?![^"]*dark:bg-)', 'className="$1bg-gray-200 dark:bg-metallic-gray-700'
    
    # Fix bg-gray-800
    $content = $content -replace 'className="([^"]*)\bbg-gray-800\b(?![^"]*dark:bg-)', 'className="$1bg-gray-800 dark:bg-metallic-gray-200'
    
    # Fix bg-gray-900
    $content = $content -replace 'className="([^"]*)\bbg-gray-900\b(?![^"]*dark:bg-)', 'className="$1bg-gray-900 dark:bg-metallic-gray-100'
    
    # Check if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesFixed++
        Write-Host "✓ Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=" * 50
Write-Host "📊 Advanced Fix Complete!" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host "Files processed: $($files.Count)" -ForegroundColor White
Write-Host "Files fixed: $filesFixed" -ForegroundColor Green
Write-Host ""
