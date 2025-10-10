# Set database password as environment variable
# This avoids having to type it every time

$env:PGPASSWORD = "Magnox271991!"

Write-Host "Database password set for this session." -ForegroundColor Green
Write-Host "You can now run: supabase db push --include-all" -ForegroundColor Cyan
