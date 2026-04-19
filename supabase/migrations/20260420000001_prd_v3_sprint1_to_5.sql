-- LexoHub PRD v3.0 — Sprint 1 Database Migration
-- RBAC expansion, notifications, conflict checks, onboarding tracking

-- ─── 1. RBAC Role Type ───────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE system_role AS ENUM (
    'super_admin', 'support_agent', 'counsel', 'practice_admin',
    'instructing_attorney', 'finance', 'auditor', 'guest'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add role column to advocates (backward compatible)
ALTER TABLE advocates ADD COLUMN IF NOT EXISTS role system_role DEFAULT 'counsel';
ALTER TABLE advocates ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE advocates ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;
ALTER TABLE advocates ADD COLUMN IF NOT EXISTS onboarding_data jsonb DEFAULT '{}';

-- ─── 2. PA Delegations Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pa_delegations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pa_id uuid NOT NULL REFERENCES auth.users(id),
  counsel_id uuid NOT NULL REFERENCES auth.users(id),
  modules text[] NOT NULL DEFAULT '{}',
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  granted_by uuid NOT NULL REFERENCES auth.users(id),
  is_active boolean NOT NULL DEFAULT true,
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pa_delegations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own delegations" ON pa_delegations
  FOR SELECT USING (auth.uid() = pa_id OR auth.uid() = counsel_id);

CREATE POLICY "Counsel can manage their PA delegations" ON pa_delegations
  FOR ALL USING (auth.uid() = counsel_id);

-- ─── 3. Role Change Audit Log ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  old_role text NOT NULL,
  new_role text NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  reason text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view role change log" ON role_change_log
  FOR SELECT USING (true);

-- ─── 4. Notifications Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  matter_id uuid,
  matter_title text,
  data jsonb DEFAULT '{}',
  is_read boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_advocate ON notifications(advocate_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(advocate_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (auth.uid() = advocate_id);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = advocate_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ─── 5. Notification Preferences ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL,
  in_app boolean NOT NULL DEFAULT true,
  email boolean NOT NULL DEFAULT true,
  whatsapp boolean NOT NULL DEFAULT false,
  push boolean NOT NULL DEFAULT false,
  UNIQUE(advocate_id, type)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification prefs" ON notification_preferences
  FOR ALL USING (auth.uid() = advocate_id);

-- ─── 6. Conflict Check Log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conflict_check_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid,
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  checked_names text[] NOT NULL DEFAULT '{}',
  result text NOT NULL CHECK (result IN ('clear', 'possible_conflict', 'confirmed_conflict')),
  match_count integer NOT NULL DEFAULT 0,
  override_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conflict_log_matter ON conflict_check_log(matter_id);
CREATE INDEX IF NOT EXISTS idx_conflict_log_advocate ON conflict_check_log(advocate_id);

ALTER TABLE conflict_check_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own conflict checks" ON conflict_check_log
  FOR SELECT USING (auth.uid() = advocate_id);

CREATE POLICY "Users create own conflict checks" ON conflict_check_log
  FOR INSERT WITH CHECK (auth.uid() = advocate_id);

-- ─── 7. Fee Agreements Table (Section 9.3) ──────────────────────────
CREATE TABLE IF NOT EXISTS fee_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL,
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  template_name text,
  scope_of_work text NOT NULL,
  rate_structure text NOT NULL CHECK (rate_structure IN ('hourly', 'fixed', 'success', 'hybrid')),
  hourly_rate numeric,
  fixed_fee numeric,
  success_percentage numeric,
  estimated_disbursements numeric,
  payment_terms text,
  trust_deposit_required numeric,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'acknowledged', 'expired')),
  sent_at timestamptz,
  sent_via text CHECK (sent_via IN ('whatsapp', 'email', 'portal')),
  acknowledged_at timestamptz,
  acknowledged_by text,
  document_url text,
  override_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fee_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own fee agreements" ON fee_agreements
  FOR ALL USING (auth.uid() = advocate_id);

-- ─── 8. Matter Documents Vault (Section 9.4) ────────────────────────
CREATE TABLE IF NOT EXISTS matter_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL,
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  filename text NOT NULL,
  original_filename text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN (
    'brief', 'pleading', 'correspondence', 'court_order',
    'invoice', 'fee_agreement', 'receipt', 'other'
  )),
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  storage_path text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  parent_document_id uuid,
  tags text[] DEFAULT '{}',
  is_shared boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_matter_docs_matter ON matter_documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_docs_advocate ON matter_documents(advocate_id);

ALTER TABLE matter_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own matter documents" ON matter_documents
  FOR ALL USING (auth.uid() = advocate_id);

-- ─── 9. Court Diary Entries (Section 9.5) ────────────────────────────
CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL,
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  entry_type text NOT NULL CHECK (entry_type IN (
    'appearance', 'consultation', 'filing_deadline',
    'prescription_date', 'general_task'
  )),
  title text NOT NULL,
  description text,
  entry_date date NOT NULL,
  entry_time time,
  end_time time,
  location text,
  reminder_days integer[] DEFAULT '{60, 30, 7}',
  is_all_day boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diary_entries_matter ON diary_entries(matter_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_advocate ON diary_entries(advocate_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries(entry_date);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own diary entries" ON diary_entries
  FOR ALL USING (auth.uid() = advocate_id);

-- ─── 10. Communication Log (Section 9.7) ────────────────────────────
CREATE TABLE IF NOT EXISTS communication_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL,
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  comm_type text NOT NULL CHECK (comm_type IN (
    'whatsapp', 'email', 'phone_call', 'meeting', 'letter', 'other'
  )),
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  participants text[] DEFAULT '{}',
  subject text,
  summary text NOT NULL,
  is_shared boolean NOT NULL DEFAULT false,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1
);

ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own communication log" ON communication_log
  FOR ALL USING (auth.uid() = advocate_id);

-- ─── 11. Write-offs (Section 9.11) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS write_offs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric NOT NULL,
  reason_code text NOT NULL CHECK (reason_code IN (
    'irrecoverable', 'goodwill', 'disputed_settled', 'legal_aid', 'other'
  )),
  notes text,
  vat_impact numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE write_offs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own write-offs" ON write_offs
  FOR ALL USING (auth.uid() = advocate_id);

-- ─── 12. Statement of Account (Section 9.6) ─────────────────────────
CREATE TABLE IF NOT EXISTS statement_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  attorney_id uuid,
  schedule_type text NOT NULL CHECK (schedule_type IN (
    'none', 'weekly', 'monthly', 'on_invoice'
  )),
  day_of_week integer,
  day_of_month integer,
  delivery_channels text[] DEFAULT '{email}',
  is_active boolean DEFAULT true,
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE statement_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own statement schedules" ON statement_schedules
  FOR ALL USING (auth.uid() = advocate_id);

-- ─── 13. Referral Source Tracking (Section 9.14) ────────────────────
ALTER TABLE matters ADD COLUMN IF NOT EXISTS referral_source text
  CHECK (referral_source IS NULL OR referral_source IN (
    'instructing_attorney', 'direct_client', 'colleague',
    'bar_referral', 'online', 'other'
  ));

-- ─── 14. Matter Close Checklist (Section 9.13) ──────────────────────
ALTER TABLE matters ADD COLUMN IF NOT EXISTS close_outcome text
  CHECK (close_outcome IS NULL OR close_outcome IN (
    'won', 'lost', 'settled', 'withdrawn', 'other'
  ));
ALTER TABLE matters ADD COLUMN IF NOT EXISTS close_notes text;
ALTER TABLE matters ADD COLUMN IF NOT EXISTS close_checklist jsonb DEFAULT '{}';

-- ─── 15. Enhanced Rate Cards (Section 9.9) ──────────────────────────
ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS court_level text;
ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS practice_area text;
ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS currency text DEFAULT 'ZAR';

-- Rate card version history
CREATE TABLE IF NOT EXISTS rate_card_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_card_id uuid NOT NULL,
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  changes jsonb NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rate_card_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own rate card history" ON rate_card_history
  FOR ALL USING (auth.uid() = advocate_id);

-- GCB Tariff Reference (read-only lookup)
CREATE TABLE IF NOT EXISTS gcb_tariff_reference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_level text NOT NULL,
  service_description text NOT NULL,
  recommended_rate numeric NOT NULL,
  unit text NOT NULL DEFAULT 'per_hour',
  effective_date date NOT NULL,
  bar_association text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gcb_tariff_reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read GCB tariffs" ON gcb_tariff_reference
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Seed GCB tariff data
INSERT INTO gcb_tariff_reference (court_level, service_description, recommended_rate, unit, effective_date, notes) VALUES
  ('High Court', 'Consultation (per hour)', 3500, 'per_hour', '2025-04-01', 'GCB recommended minimum'),
  ('High Court', 'Court appearance (per day)', 25000, 'per_day', '2025-04-01', 'Full day appearance'),
  ('High Court', 'Court appearance (half day)', 15000, 'per_half_day', '2025-04-01', 'Half day appearance'),
  ('High Court', 'Preparation of heads of argument', 4000, 'per_hour', '2025-04-01', 'Research and drafting'),
  ('High Court', 'Opinion / advice', 3500, 'per_hour', '2025-04-01', 'Written legal opinion'),
  ('Magistrate Court', 'Consultation (per hour)', 2500, 'per_hour', '2025-04-01', 'GCB recommended minimum'),
  ('Magistrate Court', 'Court appearance (per day)', 15000, 'per_day', '2025-04-01', 'Full day appearance'),
  ('Magistrate Court', 'Court appearance (half day)', 9000, 'per_half_day', '2025-04-01', 'Half day appearance'),
  ('CCMA', 'Arbitration (per day)', 18000, 'per_day', '2025-04-01', 'Full day arbitration'),
  ('CCMA', 'Conciliation (per day)', 12000, 'per_day', '2025-04-01', 'Full day conciliation'),
  ('Supreme Court of Appeal', 'Court appearance (per day)', 40000, 'per_day', '2025-04-01', 'SCA appearance'),
  ('Supreme Court of Appeal', 'Preparation of heads', 5000, 'per_hour', '2025-04-01', 'SCA heads of argument'),
  ('Constitutional Court', 'Court appearance (per day)', 50000, 'per_day', '2025-04-01', 'ConCourt appearance'),
  ('Labour Court', 'Court appearance (per day)', 20000, 'per_day', '2025-04-01', 'Labour Court full day'),
  ('Labour Court', 'Consultation (per hour)', 3000, 'per_hour', '2025-04-01', 'Labour Court consultation')
ON CONFLICT DO NOTHING;

-- ─── 16. Admin Portal Tables ─────────────────────────────────────────
-- Support Tickets (Section 10.5)
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid,
  assigned_agent_id uuid REFERENCES auth.users(id),
  priority text NOT NULL DEFAULT 'p3' CHECK (priority IN ('p1', 'p2', 'p3', 'p4')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  subject text NOT NULL,
  description text NOT NULL,
  internal_notes text,
  resolution text,
  resolved_at timestamptz,
  escalated_at timestamptz,
  first_response_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Agents see all tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM advocates WHERE id = auth.uid() AND role IN ('super_admin', 'support_agent'))
  );

-- Impersonation Log (Section 10.4)
CREATE TABLE IF NOT EXISTS impersonation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES auth.users(id),
  target_user_id uuid NOT NULL REFERENCES auth.users(id),
  ticket_reference text NOT NULL,
  reason text,
  is_write_mode boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  actions_taken jsonb DEFAULT '[]'
);

ALTER TABLE impersonation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see impersonation log" ON impersonation_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM advocates WHERE id = auth.uid() AND role IN ('super_admin', 'support_agent'))
  );

-- Feature Flags (Section 10.7)
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_enabled boolean NOT NULL DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_tenants uuid[] DEFAULT '{}',
  target_users uuid[] DEFAULT '{}',
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can read feature flags" ON feature_flags
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage feature flags" ON feature_flags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM advocates WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Broadcast Log (Section 10.10)
CREATE TABLE IF NOT EXISTS broadcast_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_by uuid NOT NULL REFERENCES auth.users(id),
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  target_scope text NOT NULL CHECK (target_scope IN ('all', 'tenant', 'role', 'custom')),
  target_filter jsonb DEFAULT '{}',
  channels text[] DEFAULT '{in_app}',
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  read_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE broadcast_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage broadcasts" ON broadcast_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM advocates WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ─── 17. Bulk Import Tracking (Section 9.15) ────────────────────────
CREATE TABLE IF NOT EXISTS bulk_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advocate_id uuid NOT NULL REFERENCES auth.users(id),
  import_type text NOT NULL CHECK (import_type IN (
    'matters', 'clients', 'attorneys', 'time_entries', 'invoices'
  )),
  filename text NOT NULL,
  total_rows integer NOT NULL DEFAULT 0,
  valid_rows integer NOT NULL DEFAULT 0,
  error_rows integer NOT NULL DEFAULT 0,
  imported_rows integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'validating', 'validated', 'importing', 'completed', 'failed'
  )),
  errors jsonb DEFAULT '[]',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bulk_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own imports" ON bulk_imports
  FOR ALL USING (auth.uid() = advocate_id);
