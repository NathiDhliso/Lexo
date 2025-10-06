# Supabase Authentication Fix Script
# This script resolves the local/remote Supabase configuration mismatch

Write-Host "🔧 Supabase Authentication Fix" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host "`n📋 Current Issue:" -ForegroundColor Yellow
Write-Host "- Your .env file points to REMOTE Supabase (ecaamkrcsjrcjmcjshlu.supabase.co)"
Write-Host "- But you have LOCAL Supabase running (127.0.0.1:54321)"
Write-Host "- This causes 400 authentication errors"

Write-Host "`n🎯 Choose your preferred setup:" -ForegroundColor Green

Write-Host "`n1️⃣  Use LOCAL Supabase (Recommended for development)"
Write-Host "   - Faster development"
Write-Host "   - All migrations already applied"
Write-Host "   - No network dependencies"

Write-Host "`n2️⃣  Use REMOTE Supabase (Production-like)"
Write-Host "   - Matches production environment"
Write-Host "   - Requires network connection"
Write-Host "   - May need migration sync"

$choice = Read-Host "`nEnter your choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host "`n🔄 Switching to LOCAL Supabase..." -ForegroundColor Green
    
    # Backup current .env
    Copy-Item .env .env.backup -ErrorAction SilentlyContinue
    
    # Update .env for local Supabase
    $envContent = Get-Content .env
    $envContent = $envContent -replace "VITE_SUPABASE_URL=.*", "VITE_SUPABASE_URL=http://127.0.0.1:54321"
    $envContent = $envContent -replace "VITE_SUPABASE_ANON_KEY=.*", "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    $envContent | Set-Content .env
    
    Write-Host "✅ Updated .env for local Supabase" -ForegroundColor Green
    Write-Host "📁 Backup saved as .env.backup" -ForegroundColor Blue
    
} elseif ($choice -eq "2") {
    Write-Host "`n🔄 Using REMOTE Supabase..." -ForegroundColor Green
    Write-Host "⚠️  Stopping local Supabase to avoid conflicts..." -ForegroundColor Yellow
    
    # Stop local Supabase
    supabase stop
    
    Write-Host "✅ Local Supabase stopped" -ForegroundColor Green
    Write-Host "🌐 Using remote Supabase configuration" -ForegroundColor Blue
    
} else {
    Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your dev server: npm run dev"
Write-Host "2. Clear browser cache/localStorage"
Write-Host "3. Try logging in again"

Write-Host "`n💡 If you still have issues:" -ForegroundColor Yellow
Write-Host "- Check browser console for detailed errors"
Write-Host "- Verify user accounts exist in your chosen Supabase instance"
Write-Host "- Run: supabase db reset (for local) or check remote dashboard"

Write-Host "`n✨ Authentication should now work correctly!" -ForegroundColor Green