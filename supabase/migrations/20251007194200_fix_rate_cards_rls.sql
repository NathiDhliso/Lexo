-- ============================================================================
-- FIX RATE CARDS AND TEMPLATES RLS POLICIES
-- Migration to fix 403 Forbidden errors on rate_cards and standard_service_templates
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own rate cards" ON rate_cards;
DROP POLICY IF EXISTS "Users can create their own rate cards" ON rate_cards;
DROP POLICY IF EXISTS "Users can update their own rate cards" ON rate_cards;
DROP POLICY IF EXISTS "Users can delete their own rate cards" ON rate_cards;
DROP POLICY IF EXISTS "Anyone can view standard service templates" ON standard_service_templates;
DROP POLICY IF EXISTS "temp_select_rate_cards" ON rate_cards;
DROP POLICY IF EXISTS "temp_insert_rate_cards" ON rate_cards;
DROP POLICY IF EXISTS "temp_update_rate_cards" ON rate_cards;
DROP POLICY IF EXISTS "temp_delete_rate_cards" ON rate_cards;
DROP POLICY IF EXISTS "temp_select_templates" ON standard_service_templates;

ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_service_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_cards_select_policy" ON rate_cards
  FOR SELECT 
  TO authenticated
  USING (advocate_id = auth.uid());

CREATE POLICY "rate_cards_insert_policy" ON rate_cards
  FOR INSERT 
  TO authenticated
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "rate_cards_update_policy" ON rate_cards
  FOR UPDATE 
  TO authenticated
  USING (advocate_id = auth.uid());

CREATE POLICY "rate_cards_delete_policy" ON rate_cards
  FOR DELETE 
  TO authenticated
  USING (advocate_id = auth.uid());

CREATE POLICY "standard_service_templates_select_policy" ON standard_service_templates
  FOR SELECT 
  TO authenticated
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON rate_cards TO authenticated;
GRANT SELECT ON standard_service_templates TO authenticated;
