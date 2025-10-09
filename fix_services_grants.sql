-- Fix services tables grants
GRANT SELECT ON service_categories TO authenticated;
GRANT SELECT ON services TO authenticated;
GRANT SELECT, INSERT, DELETE ON matter_services TO authenticated;