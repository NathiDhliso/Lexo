ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS bar bar_association,
ADD COLUMN IF NOT EXISTS reminders_sent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reminder_history JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_invoices_bar ON invoices(bar);
