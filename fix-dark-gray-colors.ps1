# Fix dark:border-gray and dark:bg-gray to use metallic-gray instead
Write-Host "🌙 Fixing dark gray colors..." -ForegroundColor Cyan
Write-Host ""

$filesFixed = 0
$files = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.jsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix dark:border-gray-* to dark:border-metallic-gray-*
    $content = $content -replace 'dark:border-gray-100\b', 'dark:border-metallic-gray-800'
    $content = $content -replace 'dark:border-gray-200\b', 'dark:border-metallic-gray-700'
    $content = $content -replace 'dark:border-gray-300\b', 'dark:border-metallic-gray-600'
    $content = $content -replace 'dark:border-gray-400\b', 'dark:border-metallic-gray-500'
    $content = $content -replace 'dark:border-gray-500\b', 'dark:border-metallic-gray-400'
    $content = $content -replace 'dark:border-gray-600\b', 'dark:border-metallic-gray-400'
    $content = $content -replace 'dark:border-gray-700\b', 'dark:border-metallic-gray-700'
    $content = $content -replace 'dark:border-gray-800\b', 'dark:border-metallic-gray-200'
    
    # Fix dark:bg-gray-* to dark:bg-metallic-gray-*
    $content = $content -replace 'dark:bg-gray-50\b', 'dark:bg-metallic-gray-900'
    $content = $content -replace 'dark:bg-gray-100\b', 'dark:bg-metallic-gray-800'
    $content = $content -replace 'dark:bg-gray-200\b', 'dark:bg-metallic-gray-700'
    $content = $content -replace 'dark:bg-gray-300\b', 'dark:bg-metallic-gray-600'
    $content = $content -replace 'dark:bg-gray-400\b', 'dark:bg-metallic-gray-500'
    $content = $content -replace 'dark:bg-gray-500\b', 'dark:bg-metallic-gray-400'
    $content = $content -replace 'dark:bg-gray-600\b', 'dark:bg-metallic-gray-400'
    $content = $content -replace 'dark:bg-gray-700\b', 'dark:bg-metallic-gray-300'
    $content = $content -replace 'dark:bg-gray-800\b', 'dark:bg-metallic-gray-800'
    $content = $content -replace 'dark:bg-gray-900\b', 'dark:bg-metallic-gray-950'
    
    # Fix dark:text-gray-* to dark:text-neutral-*
    $content = $content -replace 'dark:text-gray-100\b', 'dark:text-neutral-100'
    $content = $content -replace 'dark:text-gray-200\b', 'dark:text-neutral-200'
    $content = $content -replace 'dark:text-gray-300\b', 'dark:text-neutral-300'
    $content = $content -replace 'dark:text-gray-400\b', 'dark:text-neutral-400'
    $content = $content -replace 'dark:text-gray-500\b', 'dark:text-neutral-500'
    $content = $content -replace 'dark:text-gray-600\b', 'dark:text-neutral-600'
    $content = $content -replace 'dark:text-gray-700\b', 'dark:text-neutral-700'
    $content = $content -replace 'dark:text-gray-800\b', 'dark:text-neutral-800'
    $content = $content -replace 'dark:text-gray-900\b', 'dark:text-neutral-900'
    
    # Check if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesFixed++
        Write-Host "✓ Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Files fixed: $filesFixed" -ForegroundColor Green
Write-Host ""
