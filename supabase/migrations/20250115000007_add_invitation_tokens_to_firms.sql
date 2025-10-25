-- Add invitation token columns to firms table
-- Enables secure attorney invitation workflow

ALTER TABLE firms
ADD COLUMN IF NOT EXISTS invitation_token TEXT,
ADD COLUMN IF NOT EXISTS invitation_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invitation_token_used_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_firms_invitation_token ON firms(invitation_token) 
WHERE invitation_token IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN firms.invitation_token IS 'Secure token for attorney invitation links (single-use)';
COMMENT ON COLUMN firms.invitation_token_expires_at IS 'Expiration timestamp for invitation token (default 7 days)';
COMMENT ON COLUMN firms.invitation_token_used_at IS 'Timestamp when token was used for registration';
COMMENT ON COLUMN firms.onboarded_at IS 'Timestamp when attorney completed registration and onboarding';

