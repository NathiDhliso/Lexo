$env:PGPASSWORD = "Nathi@2019"
$connectionString = "postgresql://postgres.ecaamkrcsjrcjmcjshlu@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

$sql = @"
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS bar bar_association,
ADD COLUMN IF NOT EXISTS reminders_sent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reminder_history JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_invoices_bar ON invoices(bar);
"@

Write-Host "Applying migration to add bar, reminders_sent, and reminder_history columns to invoices table..."
$sql | psql $connectionString

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration applied successfully!" -ForegroundColor Green
} else {
    Write-Host "Migration failed!" -ForegroundColor Red
}
