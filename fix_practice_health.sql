-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_practice_health_metrics(UUID);
DROP FUNCTION IF EXISTS get_practice_health_metrics();

-- Create new function without parameters that gets user from auth context
CREATE OR REPLACE FUNCTION get_practice_health_metrics()
RETURNS TABLE (
  overall_health_score INTEGER,
  health_trend TEXT,
  wip_aging_0_30 INTEGER,
  wip_aging_31_60 INTEGER,
  wip_aging_61_90 INTEGER,
  wip_aging_90_plus INTEGER,
  high_wip_inactive_matters INTEGER,
  avg_time_to_first_invoice_days DECIMAL(10,2),
  matters_with_prescription_warnings INTEGER,
  total_wip_value DECIMAL(15,2),
  total_active_matters INTEGER,
  billing_efficiency_score INTEGER,
  risk_score INTEGER
) AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- If no authenticated user, return default values
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT 
      0::INTEGER, 'stable'::TEXT, 0::INTEGER, 0::INTEGER, 0::INTEGER, 0::INTEGER, 
      0::INTEGER, 0::DECIMAL(10,2), 0::INTEGER, 0::DECIMAL(15,2), 0::INTEGER, 
      0::INTEGER, 0::INTEGER;
    RETURN;
  END IF;

  RETURN QUERY
  WITH matter_stats AS (
    SELECT 
      m.id,
      COALESCE(m.wip_value, 0) as wip_value,
      EXTRACT(EPOCH FROM (CURRENT_DATE - m.created_at::DATE))/86400 as matter_age_days,
      COALESCE(
        EXTRACT(EPOCH FROM (i.first_invoice_date - m.created_at::DATE))/86400, 
        NULL
      ) as days_to_first_invoice,
      (m.prescription_date IS NOT NULL AND 
       m.prescription_date <= CURRENT_DATE + INTERVAL '90 days') as has_prescription_warning,
      (COALESCE(m.wip_value, 0) > 5000 AND 
       COALESCE(EXTRACT(EPOCH FROM (CURRENT_DATE - te.last_entry_date))/86400, 
                EXTRACT(EPOCH FROM (CURRENT_DATE - m.created_at::DATE))/86400) > 30) as is_high_wip_inactive
    FROM matters m
    LEFT JOIN (
      SELECT 
        matter_id,
        MIN(created_at::DATE) as first_invoice_date
      FROM invoices 
      GROUP BY matter_id
    ) i ON m.id = i.matter_id
    LEFT JOIN (
      SELECT 
        matter_id,
        MAX(date_worked) as last_entry_date
      FROM time_entries 
      GROUP BY matter_id
    ) te ON m.id = te.matter_id
    WHERE m.advocate_id = current_user_id
      AND (m.deleted_at IS NULL OR m.deleted_at > CURRENT_TIMESTAMP)
  ),
  aggregated_stats AS (
    SELECT 
      COALESCE(SUM(wip_value), 0) as total_wip,
      COUNT(*) as total_matters,
      COUNT(*) FILTER (WHERE matter_age_days <= 30) as matters_0_30,
      COUNT(*) FILTER (WHERE matter_age_days > 30 AND matter_age_days <= 60) as matters_31_60,
      COUNT(*) FILTER (WHERE matter_age_days > 60 AND matter_age_days <= 90) as matters_61_90,
      COUNT(*) FILTER (WHERE matter_age_days > 90) as matters_90_plus,
      COALESCE(AVG(days_to_first_invoice), 0) as avg_days_to_invoice,
      COUNT(*) FILTER (WHERE has_prescription_warning = true) as prescription_warnings,
      COUNT(*) FILTER (WHERE is_high_wip_inactive = true) as high_wip_inactive
    FROM matter_stats
  )
  SELECT 
    -- Calculate overall health score based on various factors
    CASE 
      WHEN s.total_matters = 0 THEN 75
      ELSE GREATEST(0, LEAST(100, 
        85 - 
        (s.prescription_warnings * 15) - 
        (s.high_wip_inactive * 10) - 
        (CASE WHEN s.avg_days_to_invoice > 30 THEN 10 ELSE 0 END) -
        (CASE WHEN s.matters_90_plus::DECIMAL / NULLIF(s.total_matters, 0) > 0.2 THEN 15 ELSE 0 END)
      ))
    END::INTEGER as overall_health_score,
    
    -- Simple health trend calculation
    CASE 
      WHEN s.prescription_warnings > 0 OR s.high_wip_inactive > 2 THEN 'declining'
      WHEN s.avg_days_to_invoice < 15 AND s.matters_90_plus = 0 THEN 'improving'
      ELSE 'stable'
    END::TEXT as health_trend,
    
    s.matters_0_30::INTEGER as wip_aging_0_30,
    s.matters_31_60::INTEGER as wip_aging_31_60,
    s.matters_61_90::INTEGER as wip_aging_61_90,
    s.matters_90_plus::INTEGER as wip_aging_90_plus,
    s.high_wip_inactive::INTEGER as high_wip_inactive_matters,
    s.avg_days_to_invoice as avg_time_to_first_invoice_days,
    s.prescription_warnings::INTEGER as matters_with_prescription_warnings,
    s.total_wip as total_wip_value,
    s.total_matters::INTEGER as total_active_matters,
    
    -- Calculate billing efficiency (simplified)
    CASE 
      WHEN s.total_matters = 0 THEN 80
      ELSE GREATEST(0, LEAST(100, 
        100 - (s.matters_90_plus::DECIMAL / NULLIF(s.total_matters, 0) * 50) - 
        (CASE WHEN s.avg_days_to_invoice > 30 THEN 20 ELSE 0 END)
      ))
    END::INTEGER as billing_efficiency_score,
    
    -- Calculate risk score
    CASE 
      WHEN s.total_matters = 0 THEN 10
      ELSE LEAST(100, 
        (s.prescription_warnings * 25) + 
        (s.high_wip_inactive * 15) + 
        (s.matters_90_plus::DECIMAL / NULLIF(s.total_matters, 0) * 30)
      )
    END::INTEGER as risk_score
    
  FROM aggregated_stats s;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_practice_health_metrics() TO authenticated;