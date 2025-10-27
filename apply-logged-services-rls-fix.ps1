# Apply Logged Services RLS Fix
# This script fixes the 403 errors when accessing logged_services by matter_id

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Logged Services RLS Fix Applicator" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path ".\FIX_LOGGED_SERVICES_RLS.sql")) {
    Write-Host "ERROR: FIX_LOGGED_SERVICES_RLS.sql not found!" -ForegroundColor Red
    Write-Host "Please run this script from the LexoHub root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found SQL fix file ✓" -ForegroundColor Green
Write-Host ""

# Check for Supabase CLI
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue
if ($supabaseCli) {
    Write-Host "Supabase CLI detected ✓" -ForegroundColor Green
    Write-Host ""
    
    # Option 1: Apply via Supabase CLI
    Write-Host "Applying fix via Supabase CLI..." -ForegroundColor Yellow
    
    # Check if Supabase is linked
    $linkStatus = supabase status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Supabase project linked ✓" -ForegroundColor Green
        
        # Apply the fix
        Write-Host ""
        Write-Host "Executing SQL fix..." -ForegroundColor Yellow
        
        $result = Get-Content ".\FIX_LOGGED_SERVICES_RLS.sql" -Raw | supabase db execute 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "SUCCESS! RLS policies updated ✓" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Refresh your browser (Ctrl+Shift+R)" -ForegroundColor White
            Write-Host "2. Navigate to WIP Tracker" -ForegroundColor White
            Write-Host "3. Verify no 403 errors appear" -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "ERROR: Failed to apply fix" -ForegroundColor Red
            Write-Host "Details: $result" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Try applying manually via Supabase Dashboard:" -ForegroundColor Yellow
            Write-Host "1. Open Supabase Dashboard > SQL Editor" -ForegroundColor White
            Write-Host "2. Copy contents of FIX_LOGGED_SERVICES_RLS.sql" -ForegroundColor White
            Write-Host "3. Paste and click Run" -ForegroundColor White
        }
    } else {
        Write-Host "Supabase project not linked" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To apply via CLI:" -ForegroundColor Cyan
        Write-Host "1. Run: supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor White
        Write-Host "2. Then run this script again" -ForegroundColor White
        Write-Host ""
        Write-Host "OR apply manually via Dashboard:" -ForegroundColor Cyan
        Write-Host "1. Open Supabase Dashboard > SQL Editor" -ForegroundColor White
        Write-Host "2. Copy contents of FIX_LOGGED_SERVICES_RLS.sql" -ForegroundColor White
        Write-Host "3. Paste and click Run" -ForegroundColor White
    }
} else {
    # No Supabase CLI - show manual instructions
    Write-Host "Supabase CLI not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To apply this fix:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Via Supabase Dashboard (Recommended)" -ForegroundColor Yellow
    Write-Host "  1. Go to https://app.supabase.com" -ForegroundColor White
    Write-Host "  2. Open your project" -ForegroundColor White
    Write-Host "  3. Navigate to SQL Editor" -ForegroundColor White
    Write-Host "  4. Open FIX_LOGGED_SERVICES_RLS.sql" -ForegroundColor White
    Write-Host "  5. Copy entire contents" -ForegroundColor White
    Write-Host "  6. Paste into SQL Editor" -ForegroundColor White
    Write-Host "  7. Click 'Run'" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Install Supabase CLI" -ForegroundColor Yellow
    Write-Host "  Run: npm install -g supabase" -ForegroundColor White
    Write-Host "  Then run this script again" -ForegroundColor White
    Write-Host ""
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Prompt to open file for manual copying
$openFile = Read-Host "Open FIX_LOGGED_SERVICES_RLS.sql in notepad for manual copying? (y/n)"
if ($openFile -eq 'y' -or $openFile -eq 'Y') {
    notepad.exe ".\FIX_LOGGED_SERVICES_RLS.sql"
    Write-Host "File opened in Notepad" -ForegroundColor Green
}
