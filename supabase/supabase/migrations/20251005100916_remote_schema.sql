
\restrict OIXCtAJP9oG0CPWtMkaJcU9RZ0CkhrCcZGYjkUhQFSeheCdhfnL4ESWxkRVntyR


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'LexoHub database schema - maintenance performed on 2025-09-30';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."analysis_type" AS ENUM (
    'brief',
    'contract',
    'opinion',
    'pleading',
    'general'
);


ALTER TYPE "public"."analysis_type" OWNER TO "postgres";


CREATE TYPE "public"."bar_association" AS ENUM (
    'johannesburg',
    'cape_town'
);


ALTER TYPE "public"."bar_association" OWNER TO "postgres";


CREATE TYPE "public"."brief_status" AS ENUM (
    'available',
    'reviewing',
    'accepted',
    'withdrawn'
);


ALTER TYPE "public"."brief_status" OWNER TO "postgres";


CREATE TYPE "public"."cash_flow_status" AS ENUM (
    'healthy',
    'adequate',
    'tight',
    'critical'
);


ALTER TYPE "public"."cash_flow_status" OWNER TO "postgres";


CREATE TYPE "public"."document_status" AS ENUM (
    'processing',
    'indexed',
    'analyzed',
    'error'
);


ALTER TYPE "public"."document_status" OWNER TO "postgres";


CREATE TYPE "public"."document_type" AS ENUM (
    'brief',
    'opinion',
    'contract',
    'correspondence',
    'court_document',
    'invoice',
    'receipt',
    'other'
);


ALTER TYPE "public"."document_type" OWNER TO "postgres";


CREATE TYPE "public"."factoring_status" AS ENUM (
    'available',
    'under_review',
    'approved',
    'funded',
    'repaid',
    'defaulted'
);


ALTER TYPE "public"."factoring_status" OWNER TO "postgres";


CREATE TYPE "public"."fee_optimization_model" AS ENUM (
    'standard',
    'premium_urgency',
    'volume_discount',
    'success_based',
    'hybrid'
);


ALTER TYPE "public"."fee_optimization_model" OWNER TO "postgres";


CREATE TYPE "public"."fee_structure" AS ENUM (
    'hourly',
    'fixed',
    'contingency',
    'success',
    'retainer',
    'hybrid'
);


ALTER TYPE "public"."fee_structure" OWNER TO "postgres";


CREATE TYPE "public"."fee_type" AS ENUM (
    'standard',
    'contingency',
    'success',
    'retainer',
    'pro_bono'
);


ALTER TYPE "public"."fee_type" OWNER TO "postgres";


CREATE TYPE "public"."invoice_status" AS ENUM (
    'draft',
    'sent',
    'viewed',
    'paid',
    'overdue',
    'disputed',
    'written_off',
    'pro_forma',
    'pro_forma_accepted',
    'pro_forma_declined',
    'awaiting_acceptance',
    'accepted',
    'declined',
    'expired',
    'converted_to_invoice'
);


ALTER TYPE "public"."invoice_status" OWNER TO "postgres";


CREATE TYPE "public"."matter_status" AS ENUM (
    'active',
    'pending',
    'settled',
    'closed',
    'on_hold'
);


ALTER TYPE "public"."matter_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_method" AS ENUM (
    'eft',
    'cheque',
    'cash',
    'card',
    'debit_order'
);


ALTER TYPE "public"."payment_method" OWNER TO "postgres";


CREATE TYPE "public"."precedent_type" AS ENUM (
    'pleadings',
    'notices',
    'affidavits',
    'heads_of_argument',
    'opinions',
    'contracts',
    'correspondence',
    'court_orders',
    'other'
);


ALTER TYPE "public"."precedent_type" OWNER TO "postgres";


CREATE TYPE "public"."pro_forma_action" AS ENUM (
    'matter',
    'pro_forma',
    'invoice'
);


ALTER TYPE "public"."pro_forma_action" OWNER TO "postgres";


CREATE TYPE "public"."pro_forma_status" AS ENUM (
    'pending',
    'submitted',
    'processed',
    'declined'
);


ALTER TYPE "public"."pro_forma_status" OWNER TO "postgres";


CREATE TYPE "public"."referral_status" AS ENUM (
    'pending',
    'accepted',
    'declined',
    'completed'
);


ALTER TYPE "public"."referral_status" OWNER TO "postgres";


CREATE TYPE "public"."risk_level" AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE "public"."risk_level" OWNER TO "postgres";


CREATE TYPE "public"."specialisation_category" AS ENUM (
    'administrative_law',
    'banking_finance',
    'commercial_litigation',
    'constitutional_law',
    'construction_law',
    'criminal_law',
    'employment_law',
    'environmental_law',
    'family_law',
    'insurance_law',
    'intellectual_property',
    'international_law',
    'medical_law',
    'mining_law',
    'property_law',
    'tax_law',
    'other'
);


ALTER TYPE "public"."specialisation_category" OWNER TO "postgres";


CREATE TYPE "public"."time_entry_method" AS ENUM (
    'manual',
    'voice',
    'timer',
    'ai_suggested'
);


ALTER TYPE "public"."time_entry_method" OWNER TO "postgres";


CREATE TYPE "public"."urgency_level" AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE "public"."urgency_level" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'junior_advocate',
    'senior_counsel',
    'chambers_admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."analyze_brief_document"("p_document_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  -- Add to analysis queue with high priority for briefs
  INSERT INTO document_analysis_queue (
    document_id,
    advocate_id,
    priority,
    analysis_type,
    requested_features
  )
  SELECT 
    p_document_id,
    d.advocate_id,
    9, -- High priority for briefs
    'brief',
    ARRAY['extract_parties', 'extract_dates', 'identify_issues', 'assess_complexity']
  FROM documents d
  WHERE d.id = p_document_id
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$;


ALTER FUNCTION "public"."analyze_brief_document"("p_document_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_assign_user_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  years_of_experience int;
BEGIN
  IF NEW.year_admitted IS NOT NULL THEN
    years_of_experience := EXTRACT(YEAR FROM CURRENT_DATE) - NEW.year_admitted;
    
    IF years_of_experience >= 10 THEN
      NEW.user_role := 'senior_counsel';
    ELSE
      NEW.user_role := 'junior_advocate';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_assign_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_compliance_score"("user_uuid" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    total_requirements INTEGER;
    met_requirements INTEGER;
    active_violations INTEGER;
    score INTEGER;
BEGIN
    -- Count total applicable requirements
    SELECT COUNT(*) INTO total_requirements
    FROM regulatory_requirements
    WHERE mandatory = true;
    
    -- Count met requirements (no active deadlines)
    SELECT COUNT(*) INTO met_requirements
    FROM compliance_deadlines cd
    JOIN regulatory_requirements rr ON cd.requirement_id = rr.id
    WHERE cd.user_id = user_uuid
    AND cd.status = 'completed'
    AND rr.mandatory = true;
    
    -- Count active violations
    SELECT COUNT(*) INTO active_violations
    FROM compliance_alerts
    WHERE user_id = user_uuid
    AND resolved = false
    AND severity IN ('high', 'critical');
    
    -- Calculate score
    IF total_requirements = 0 THEN
        score := 100;
    ELSE
        score := GREATEST(0, 
            (met_requirements * 100 / total_requirements) - (active_violations * 10)
        );
    END IF;
    
    RETURN LEAST(100, score);
END;
$$;


ALTER FUNCTION "public"."calculate_compliance_score"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_due_date"("invoice_date" "date", "bar" "public"."bar_association") RETURNS "date"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  CASE bar
    WHEN 'johannesburg' THEN
      RETURN invoice_date + INTERVAL '60 days';
    WHEN 'cape_town' THEN
      RETURN invoice_date + INTERVAL '90 days';
    ELSE
      RETURN invoice_date + INTERVAL '60 days';
  END CASE;
END;
$$;


ALTER FUNCTION "public"."calculate_due_date"("invoice_date" "date", "bar" "public"."bar_association") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_optimal_fee_structure"("p_matter_id" "uuid", "p_advocate_id" "uuid") RETURNS TABLE("model" "public"."fee_optimization_model", "recommended_rate" numeric, "potential_revenue" numeric, "confidence" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_matter_record RECORD;
  v_market_data RECORD;
  v_is_urgent BOOLEAN := FALSE;
BEGIN
  -- Get matter details
  SELECT * INTO v_matter_record FROM matters WHERE id = p_matter_id;
  
  -- If no matter found, return empty result
  IF v_matter_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Determine urgency based on available fields
  v_is_urgent := (v_matter_record.next_court_date IS NOT NULL AND 
                  v_matter_record.next_court_date <= CURRENT_DATE + INTERVAL '30 days') OR
                 (v_matter_record.prescription_date IS NOT NULL AND 
                  v_matter_record.prescription_date <= CURRENT_DATE + INTERVAL '60 days') OR
                 (v_matter_record.risk_level = 'high');
  
  -- Get market data (simplified - in production would use ML model)
  SELECT 
    COALESCE(AVG(hourly_rate), 2500) as avg_rate,
    COALESCE(STDDEV(hourly_rate), 500) as rate_stddev
  INTO v_market_data
  FROM advocates
  WHERE bar = v_matter_record.bar;
  
  -- Standard model
  RETURN QUERY
  SELECT 
    'standard'::fee_optimization_model,
    v_market_data.avg_rate,
    COALESCE(v_market_data.avg_rate * COALESCE(v_matter_record.estimated_fee, 10000) / 1000, 25000), -- Simplified calculation
    0.85::DECIMAL;
  
  -- Premium urgency model
  IF v_is_urgent THEN
    RETURN QUERY
    SELECT 
      'premium_urgency'::fee_optimization_model,
      v_market_data.avg_rate * 1.5,
      COALESCE(v_market_data.avg_rate * 1.5 * COALESCE(v_matter_record.estimated_fee, 10000) / 1000, 37500),
      0.75::DECIMAL;
  END IF;
  
  -- Success-based model for high-value matters
  IF COALESCE(v_matter_record.estimated_fee, 0) > 100000 THEN
    RETURN QUERY
    SELECT 
      'success_based'::fee_optimization_model,
      v_market_data.avg_rate * 0.7,
      COALESCE(v_matter_record.estimated_fee * 0.25, 25000), -- 25% success fee
      0.65::DECIMAL;
  END IF;
END;
$$;


ALTER FUNCTION "public"."calculate_optimal_fee_structure"("p_matter_id" "uuid", "p_advocate_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_view_overflow_brief"("p_advocate_id" "uuid", "p_brief_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_brief overflow_briefs%ROWTYPE;
BEGIN
  SELECT * INTO v_brief FROM overflow_briefs WHERE id = p_brief_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Own briefs always visible
  IF v_brief.posting_advocate_id = p_advocate_id THEN
    RETURN true;
  END IF;
  
  -- Check if hidden
  IF p_advocate_id = ANY(v_brief.hidden_from_advocates) THEN
    RETURN false;
  END IF;
  
  -- Check if public or specifically visible
  IF v_brief.is_public OR p_advocate_id = ANY(v_brief.visible_to_advocates) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;


ALTER FUNCTION "public"."can_view_overflow_brief"("p_advocate_id" "uuid", "p_brief_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_account_lockout"("p_email" "text") RETURNS TABLE("is_locked" boolean, "locked_until" timestamp with time zone, "attempts" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (l.locked_until > NOW()) as is_locked,
    l.locked_until,
    l.failed_attempts
  FROM account_lockouts l
  WHERE l.email = p_email;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TIMESTAMPTZ, 0;
  END IF;
END;
$$;


ALTER FUNCTION "public"."check_account_lockout"("p_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_conflict"("p_advocate_id" "uuid", "p_client_name" character varying, "p_opposing_party" character varying) RETURNS TABLE("has_conflict" boolean, "conflicting_matters" "uuid"[], "conflict_reason" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_conflicts UUID[];
BEGIN
  -- Check if advocate has represented opposing party before
  SELECT ARRAY_AGG(id) INTO v_conflicts
  FROM matters
  WHERE advocate_id = p_advocate_id
  AND deleted_at IS NULL
  AND (
    LOWER(client_name) = LOWER(p_opposing_party)
    OR LOWER(client_name) LIKE '%' || LOWER(p_opposing_party) || '%'
  );
  
  IF v_conflicts IS NOT NULL THEN
    RETURN QUERY 
    SELECT 
      true,
      v_conflicts,
      'Previously represented the opposing party';
    RETURN;
  END IF;
  
  -- Check if advocate has matters against this client
  SELECT ARRAY_AGG(id) INTO v_conflicts
  FROM matters
  WHERE advocate_id = p_advocate_id
  AND deleted_at IS NULL
  AND description ILIKE '%' || p_client_name || '%';
  
  IF v_conflicts IS NOT NULL THEN
    RETURN QUERY 
    SELECT 
      true,
      v_conflicts,
      'Potential conflict with existing matter';
    RETURN;
  END IF;
  
  -- No conflicts found
  RETURN QUERY 
  SELECT 
    false,
    NULL::UUID[],
    'No conflicts detected';
END;
$$;


ALTER FUNCTION "public"."check_conflict"("p_advocate_id" "uuid", "p_client_name" character varying, "p_opposing_party" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_data"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM active_sessions WHERE expires_at < NOW() OR last_activity < NOW() - INTERVAL '30 minutes';
  DELETE FROM account_lockouts WHERE locked_until < NOW();
  DELETE FROM auth_attempts WHERE created_at < NOW() - INTERVAL '30 days';
  DELETE FROM password_history WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_webhook_events"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM public.webhook_events
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;


ALTER FUNCTION "public"."cleanup_old_webhook_events"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."convert_opportunity_to_matter"("opportunity_uuid" "uuid", "matter_data" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_matter_id UUID;
  opportunity_record opportunities%ROWTYPE;
BEGIN
  -- Get the opportunity record
  SELECT * INTO opportunity_record FROM opportunities WHERE id = opportunity_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Opportunity not found';
  END IF;
  
  -- Verify ownership
  IF opportunity_record.advocate_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to opportunity';
  END IF;
  
  -- Create the matter (this would be called from the application layer)
  -- For now, just mark the opportunity as converted
  UPDATE opportunities 
  SET 
    status = 'converted',
    converted_at = NOW(),
    updated_at = NOW()
  WHERE id = opportunity_uuid;
  
  RETURN opportunity_uuid; -- Return opportunity ID for now
END;
$$;


ALTER FUNCTION "public"."convert_opportunity_to_matter"("opportunity_uuid" "uuid", "matter_data" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."convert_opportunity_to_matter"("opportunity_uuid" "uuid", "matter_data" "jsonb") IS 'Converts an opportunity to a formal matter with proper audit trail';



CREATE OR REPLACE FUNCTION "public"."create_audit_entry"("p_user_id" "uuid", "p_entity_type" character varying, "p_entity_id" "uuid", "p_action_type" character varying, "p_description" "text", "p_before_state" "jsonb" DEFAULT NULL::"jsonb", "p_after_state" "jsonb" DEFAULT NULL::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_entries (
        user_id, entity_type, entity_id, action_type, 
        description, before_state, after_state
    ) VALUES (
        p_user_id, p_entity_type, p_entity_id, p_action_type,
        p_description, p_before_state, p_after_state
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$;


ALTER FUNCTION "public"."create_audit_entry"("p_user_id" "uuid", "p_entity_type" character varying, "p_entity_id" "uuid", "p_action_type" character varying, "p_description" "text", "p_before_state" "jsonb", "p_after_state" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_session"("p_user_id" "uuid", "p_session_token" "text", "p_device_fingerprint" "text" DEFAULT NULL::"text", "p_ip_address" "text" DEFAULT NULL::"text", "p_user_agent" "text" DEFAULT NULL::"text", "p_duration_hours" integer DEFAULT 24) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_session_id UUID;
  v_expires_at TIMESTAMPTZ;
  v_max_sessions INTEGER := 5;
  v_session_count INTEGER;
BEGIN
  v_expires_at := NOW() + (p_duration_hours || ' hours')::INTERVAL;
  
  SELECT COUNT(*) INTO v_session_count
  FROM active_sessions
  WHERE user_id = p_user_id;
  
  IF v_session_count >= v_max_sessions THEN
    DELETE FROM active_sessions
    WHERE id IN (
      SELECT id FROM active_sessions
      WHERE user_id = p_user_id
      ORDER BY last_activity ASC
      LIMIT 1
    );
  END IF;
  
  INSERT INTO active_sessions (
    user_id, session_token, device_fingerprint, 
    ip_address, user_agent, expires_at
  )
  VALUES (
    p_user_id, p_session_token, p_device_fingerprint,
    p_ip_address, p_user_agent, v_expires_at
  )
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$;


ALTER FUNCTION "public"."create_session"("p_user_id" "uuid", "p_session_token" "text", "p_device_fingerprint" "text", "p_ip_address" "text", "p_user_agent" "text", "p_duration_hours" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_preferences"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO user_preferences (user_id, feature_discovery)
  VALUES (
    NEW.id,
    jsonb_build_object(
      'notification_shown', false,
      'notification_dismissed_at', null,
      'first_login_date', NOW()
    )
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_preferences"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_compliance_deadlines"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    req RECORD;
    user_rec RECORD;
    next_due_date TIMESTAMP WITH TIME ZONE;
BEGIN
    FOR req IN SELECT * FROM regulatory_requirements WHERE mandatory = true LOOP
        FOR user_rec IN SELECT id FROM auth.users LOOP
            -- Calculate next due date based on frequency
            CASE req.frequency
                WHEN 'annual' THEN
                    next_due_date := DATE_TRUNC('year', NOW()) + INTERVAL '1 year';
                WHEN 'quarterly' THEN
                    next_due_date := DATE_TRUNC('quarter', NOW()) + INTERVAL '3 months';
                WHEN 'monthly' THEN
                    next_due_date := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
                ELSE
                    next_due_date := NOW() + INTERVAL '1 year';
            END CASE;
            
            -- Insert deadline if not exists
            INSERT INTO compliance_deadlines (requirement_id, user_id, due_date, status)
            SELECT req.id, user_rec.id, next_due_date, 'pending'
            WHERE NOT EXISTS (
                SELECT 1 FROM compliance_deadlines
                WHERE requirement_id = req.id
                AND user_id = user_rec.id
                AND status = 'pending'
            );
        END LOOP;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."generate_compliance_deadlines"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_fee_narrative"("p_matter_id" "uuid", "p_time_entry_ids" "uuid"[], "p_template_id" "uuid" DEFAULT NULL::"uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_narrative TEXT;
  v_work_summary JSONB;
  v_total_hours DECIMAL;
  v_key_activities TEXT[];
BEGIN
  -- Aggregate time entries by category
  WITH time_summary AS (
    SELECT 
      CASE 
        WHEN description ILIKE '%draft%' THEN 'Drafting'
        WHEN description ILIKE '%research%' THEN 'Research'
        WHEN description ILIKE '%consult%' OR description ILIKE '%meeting%' THEN 'Consultation'
        WHEN description ILIKE '%court%' OR description ILIKE '%hearing%' THEN 'Court Appearance'
        WHEN description ILIKE '%review%' THEN 'Review'
        ELSE 'General Legal Services'
      END as category,
      SUM(duration_minutes) / 60.0 as hours,
      COUNT(*) as entries,
      AVG(rate) as avg_rate
    FROM time_entries
    WHERE id = ANY(p_time_entry_ids)
    GROUP BY 1
  )
  SELECT 
    jsonb_agg(jsonb_build_object(
      'category', category,
      'hours', hours,
      'entries', entries,
      'avg_rate', avg_rate
    )),
    SUM(hours)
  INTO v_work_summary, v_total_hours
  FROM time_summary;
  
  -- Extract key activities
  SELECT ARRAY_AGG(DISTINCT 
    CASE 
      WHEN description ILIKE '%draft%' THEN regexp_replace(description, '^.*?(draft\w*\s+\w+(?:\s+\w+)?)', '\1', 'i')
      WHEN description ILIKE '%review%' THEN regexp_replace(description, '^.*?(review\w*\s+\w+(?:\s+\w+)?)', '\1', 'i')
      ELSE left(description, 50)
    END
  )
  INTO v_key_activities
  FROM time_entries
  WHERE id = ANY(p_time_entry_ids)
  LIMIT 10;
  
  -- Build narrative (simplified version - in production, this would use AI)
  v_narrative := format(
    E'PROFESSIONAL SERVICES RENDERED\n\n' ||
    E'We have completed %s hours of professional legal services in this matter.\n\n' ||
    E'SUMMARY OF WORK:\n%s\n\n' ||
    E'KEY ACTIVITIES:\n%s\n\n' ||
    E'All services were rendered with professional care and diligence.',
    round(v_total_hours, 1),
    (
      SELECT string_agg(
        format('• %s: %s hours', 
          obj->>'category', 
          round((obj->>'hours')::numeric, 1)
        ), 
        E'\n'
      )
      FROM jsonb_array_elements(v_work_summary) obj
    ),
    (
      SELECT string_agg('• ' || activity, E'\n')
      FROM unnest(v_key_activities) activity
    )
  );
  
  RETURN v_narrative;
END;
$$;


ALTER FUNCTION "public"."generate_fee_narrative"("p_matter_id" "uuid", "p_time_entry_ids" "uuid"[], "p_template_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_advocate_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_current_advocate_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_judge_analytics"("p_judge_id" "uuid", "p_period_months" integer DEFAULT 6) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_analytics RECORD;
  v_recent_cases INTEGER;
  v_avg_postponement_rate DECIMAL(5,2);
BEGIN
  -- Get analytics for the specified period
  SELECT 
    AVG(total_cases_heard)::INTEGER as avg_cases_per_period,
    AVG(postponement_rate) as avg_postponement_rate,
    AVG(performance_score) as avg_performance_score,
    COUNT(*) as periods_analyzed
  INTO v_analytics
  FROM judge_analytics 
  WHERE judge_id = p_judge_id 
    AND period_start >= CURRENT_DATE - INTERVAL '1 month' * p_period_months;
  
  -- Get recent case count
  SELECT COUNT(*) INTO v_recent_cases
  FROM court_cases cc
  JOIN court_diary_entries cde ON cc.id = cde.court_case_id
  WHERE cc.allocated_judge_id = p_judge_id
    AND cde.hearing_date >= CURRENT_DATE - INTERVAL '1 month' * p_period_months;
  
  RETURN json_build_object(
    'judge_id', p_judge_id,
    'period_months', p_period_months,
    'recent_cases', v_recent_cases,
    'average_cases_per_period', COALESCE(v_analytics.avg_cases_per_period, 0),
    'average_postponement_rate', COALESCE(v_analytics.avg_postponement_rate, 0),
    'average_performance_score', COALESCE(v_analytics.avg_performance_score, 0),
    'periods_analyzed', COALESCE(v_analytics.periods_analyzed, 0)
  );
END;
$$;


ALTER FUNCTION "public"."get_judge_analytics"("p_judge_id" "uuid", "p_period_months" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_matters_with_health_indicators"("user_id" "uuid") RETURNS TABLE("matter_id" "uuid", "title" character varying, "client_name" character varying, "status" character varying, "wip_value" numeric, "last_time_entry_date" "date", "days_since_last_entry" integer, "is_high_wip_inactive" boolean, "prescription_date" "date", "days_to_prescription" integer, "is_prescription_warning" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as matter_id,
    m.title,
    m.client_name,
    m.status,
    m.wip_value,
    te.last_entry_date as last_time_entry_date,
    CASE 
      WHEN te.last_entry_date IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (CURRENT_DATE - te.last_entry_date))/86400
      ELSE 
        EXTRACT(EPOCH FROM (CURRENT_DATE - m.created_at::DATE))/86400
    END::INTEGER as days_since_last_entry,
    (m.wip_value > 5000 AND 
     COALESCE(EXTRACT(EPOCH FROM (CURRENT_DATE - te.last_entry_date))/86400, 
              EXTRACT(EPOCH FROM (CURRENT_DATE - m.created_at::DATE))/86400) > 30) as is_high_wip_inactive,
    m.prescription_date,
    CASE 
      WHEN m.prescription_date IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (m.prescription_date - CURRENT_DATE))/86400
      ELSE NULL 
    END::INTEGER as days_to_prescription,
    (m.prescription_date IS NOT NULL AND 
     m.prescription_date <= CURRENT_DATE + INTERVAL '90 days') as is_prescription_warning
  FROM matters m
  LEFT JOIN (
    SELECT 
      matter_id,
      MAX(date_worked) as last_entry_date
    FROM time_entries 
    GROUP BY matter_id
  ) te ON m.id = te.matter_id
  WHERE m.advocate_id = user_id
    AND m.deleted_at IS NULL
  ORDER BY m.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_matters_with_health_indicators"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_matters_with_health_indicators"("user_id" "uuid") IS 'Returns matters with health indicators for proactive management';



CREATE OR REPLACE FUNCTION "public"."get_opportunity_stats"("user_id" "uuid") RETURNS TABLE("total_opportunities" integer, "active_opportunities" integer, "converted_opportunities" integer, "lost_opportunities" integer, "total_estimated_value" numeric, "average_conversion_time_days" numeric, "conversion_rate_percentage" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_opportunities,
    COUNT(*) FILTER (WHERE status = 'active')::INTEGER as active_opportunities,
    COUNT(*) FILTER (WHERE status = 'converted')::INTEGER as converted_opportunities,
    COUNT(*) FILTER (WHERE status = 'lost')::INTEGER as lost_opportunities,
    COALESCE(SUM(estimated_value), 0) as total_estimated_value,
    COALESCE(AVG(EXTRACT(EPOCH FROM (converted_at - created_at))/86400), 0) as average_conversion_time_days,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'converted')::DECIMAL / COUNT(*)::DECIMAL * 100)
      ELSE 0 
    END as conversion_rate_percentage
  FROM opportunities 
  WHERE advocate_id = user_id;
END;
$$;


ALTER FUNCTION "public"."get_opportunity_stats"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_opportunity_stats"("user_id" "uuid") IS 'Provides comprehensive statistics for opportunity management';



CREATE OR REPLACE FUNCTION "public"."get_practice_health_metrics"("user_id" "uuid") RETURNS TABLE("total_wip" numeric, "wip_0_30_days" numeric, "wip_31_60_days" numeric, "wip_61_90_days" numeric, "wip_90_plus_days" numeric, "avg_time_to_first_invoice_days" numeric, "matters_with_prescription_warnings" integer, "high_wip_inactive_matters" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH matter_ages AS (
    SELECT 
      m.id,
      m.wip_value,
      EXTRACT(EPOCH FROM (CURRENT_DATE - m.created_at::DATE))/86400 as matter_age_days,
      COALESCE(
        EXTRACT(EPOCH FROM (i.first_invoice_date - m.created_at::DATE))/86400, 
        NULL
      ) as days_to_first_invoice,
      (m.prescription_date IS NOT NULL AND 
       m.prescription_date <= CURRENT_DATE + INTERVAL '90 days') as has_prescription_warning,
      (m.wip_value > 5000 AND 
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
    WHERE m.advocate_id = user_id
      AND m.deleted_at IS NULL
  )
  SELECT 
    COALESCE(SUM(wip_value), 0) as total_wip,
    COALESCE(SUM(CASE WHEN matter_age_days <= 30 THEN wip_value ELSE 0 END), 0) as wip_0_30_days,
    COALESCE(SUM(CASE WHEN matter_age_days > 30 AND matter_age_days <= 60 THEN wip_value ELSE 0 END), 0) as wip_31_60_days,
    COALESCE(SUM(CASE WHEN matter_age_days > 60 AND matter_age_days <= 90 THEN wip_value ELSE 0 END), 0) as wip_61_90_days,
    COALESCE(SUM(CASE WHEN matter_age_days > 90 THEN wip_value ELSE 0 END), 0) as wip_90_plus_days,
    COALESCE(AVG(days_to_first_invoice), 0) as avg_time_to_first_invoice_days,
    COUNT(*) FILTER (WHERE has_prescription_warning = true)::INTEGER as matters_with_prescription_warnings,
    COUNT(*) FILTER (WHERE is_high_wip_inactive = true)::INTEGER as high_wip_inactive_matters
  FROM matter_ages;
END;
$$;


ALTER FUNCTION "public"."get_practice_health_metrics"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_practice_health_metrics"("user_id" "uuid") IS 'Provides practice-wide health metrics for dashboard display';



CREATE OR REPLACE FUNCTION "public"."get_user_sessions"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "device_fingerprint" "text", "ip_address" "text", "user_agent" "text", "last_activity" timestamp with time zone, "expires_at" timestamp with time zone, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.device_fingerprint, s.ip_address, 
    s.user_agent, s.last_activity, s.expires_at, s.created_at
  FROM active_sessions s
  WHERE s.user_id = p_user_id
    AND s.expires_at > NOW()
  ORDER BY s.last_activity DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_sessions"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_templates"("user_id" "uuid") RETURNS TABLE("id" "uuid", "name" character varying, "description" "text", "category" character varying, "template_data" "jsonb", "is_default" boolean, "is_shared" boolean, "usage_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "is_owner" boolean, "shared_by_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mt.id,
    mt.name,
    mt.description,
    mt.category,
    mt.template_data,
    mt.is_default,
    mt.is_shared,
    mt.usage_count,
    mt.created_at,
    mt.updated_at,
    (mt.advocate_id = user_id) as is_owner,
    CASE 
      WHEN mt.advocate_id = user_id THEN NULL
      ELSE a.full_name
    END as shared_by_name
  FROM matter_templates mt
  LEFT JOIN advocates a ON mt.advocate_id = a.id
  WHERE 
    mt.advocate_id = user_id OR
    mt.is_shared = true OR
    mt.id IN (
      SELECT ts.template_id 
      FROM template_shares ts 
      WHERE ts.shared_with_advocate_id = user_id
    )
  ORDER BY mt.usage_count DESC, mt.updated_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_templates"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_template_usage"("template_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE matter_templates 
  SET usage_count = usage_count + 1 
  WHERE id = template_uuid;
END;
$$;


ALTER FUNCTION "public"."increment_template_usage"("template_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_role_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF OLD.user_role IS DISTINCT FROM NEW.user_role THEN
    INSERT INTO role_permissions_log (
      advocate_id,
      old_role,
      new_role,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.user_role,
      NEW.user_role,
      current_setting('app.current_user_id', true)::uuid
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_role_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."predict_cash_flow"("p_advocate_id" "uuid", "p_months_ahead" integer DEFAULT 3) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
  v_expected_collections DECIMAL;
  v_overdue_amount DECIMAL;
  v_seasonal_factor DECIMAL;
BEGIN
  v_period_start := DATE_TRUNC('month', CURRENT_DATE);
  
  FOR i IN 0..p_months_ahead-1 LOOP
    v_period_end := v_period_start + INTERVAL '1 month' - INTERVAL '1 day';
    
    -- Calculate expected collections
    SELECT 
      SUM(i.balance_due * 0.8) -- 80% collection probability
    INTO v_expected_collections
    FROM invoices i
    WHERE i.advocate_id = p_advocate_id
      AND i.status IN ('sent', 'viewed')
      AND i.due_date BETWEEN v_period_start AND v_period_end;
    
    -- Get overdue amount
    SELECT SUM(balance_due)
    INTO v_overdue_amount
    FROM invoices
    WHERE advocate_id = p_advocate_id
      AND status = 'overdue';
    
    -- Get seasonal factor
    SELECT COALESCE(historical_collection_rate, 1.0)
    INTO v_seasonal_factor
    FROM cash_flow_patterns
    WHERE advocate_id = p_advocate_id
      AND month = EXTRACT(MONTH FROM v_period_start);
    
    -- Insert prediction
    INSERT INTO cash_flow_predictions (
      advocate_id,
      prediction_date,
      period_start,
      period_end,
      expected_collections,
      expected_expenses,
      invoice_collections,
      collection_confidence,
      seasonal_adjustment,
      overdue_risk_amount,
      cash_flow_status
    ) VALUES (
      p_advocate_id,
      CURRENT_DATE,
      v_period_start,
      v_period_end,
      COALESCE(v_expected_collections, 0) * COALESCE(v_seasonal_factor, 1.0),
      50000, -- Placeholder for expenses
      COALESCE(v_expected_collections, 0),
      0.75,
      (COALESCE(v_seasonal_factor, 1.0) - 1.0) * 100,
      COALESCE(v_overdue_amount, 0),
      CASE 
        WHEN COALESCE(v_expected_collections, 0) > 100000 THEN 'healthy'
        WHEN COALESCE(v_expected_collections, 0) > 50000 THEN 'adequate'
        WHEN COALESCE(v_expected_collections, 0) > 20000 THEN 'tight'
        ELSE 'critical'
      END
    )
    ON CONFLICT (advocate_id, period_start, period_end) 
    DO UPDATE SET
      prediction_date = CURRENT_DATE,
      expected_collections = EXCLUDED.expected_collections,
      seasonal_adjustment = EXCLUDED.seasonal_adjustment,
      overdue_risk_amount = EXCLUDED.overdue_risk_amount;
    
    v_period_start := v_period_start + INTERVAL '1 month';
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."predict_cash_flow"("p_advocate_id" "uuid", "p_months_ahead" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_voice_query"("p_advocate_id" "uuid", "p_query_text" "text", "p_language_code" "text" DEFAULT 'en'::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_query_id UUID;
  v_intent TEXT;
  v_confidence DECIMAL(3,2);
  v_response TEXT;
  v_actions JSONB;
BEGIN
  -- Simple intent detection (in practice, this would use NLP/AI)
  IF p_query_text ILIKE '%diary%' OR p_query_text ILIKE '%court%' OR p_query_text ILIKE '%hearing%' THEN
    v_intent := 'court_diary';
    v_confidence := 0.85;
    v_response := 'Here are your upcoming court hearings...';
    v_actions := '{"action": "show_court_diary", "filter": "upcoming"}'::jsonb;
  ELSIF p_query_text ILIKE '%matter%' OR p_query_text ILIKE '%case%' THEN
    v_intent := 'matter_inquiry';
    v_confidence := 0.90;
    v_response := 'Here are your active matters...';
    v_actions := '{"action": "show_matters", "filter": "active"}'::jsonb;
  ELSIF p_query_text ILIKE '%invoice%' OR p_query_text ILIKE '%billing%' THEN
    v_intent := 'billing_inquiry';
    v_confidence := 0.88;
    v_response := 'Here is your billing information...';
    v_actions := '{"action": "show_invoices", "filter": "recent"}'::jsonb;
  ELSE
    v_intent := 'general_inquiry';
    v_confidence := 0.60;
    v_response := 'I can help you with court diary, matters, billing, and more. Please be more specific.';
    v_actions := '{"action": "show_help"}'::jsonb;
  END IF;
  
  -- Insert voice query record
  INSERT INTO voice_queries (
    advocate_id, query_text, query_language, intent, confidence_score,
    response_text, response_actions, processing_time_ms
  ) VALUES (
    p_advocate_id, p_query_text, p_language_code, v_intent, v_confidence,
    v_response, v_actions, 150
  ) RETURNING id INTO v_query_id;
  
  RETURN json_build_object(
    'query_id', v_query_id,
    'intent', v_intent,
    'confidence', v_confidence,
    'response', v_response,
    'actions', v_actions
  );
END;
$$;


ALTER FUNCTION "public"."process_voice_query"("p_advocate_id" "uuid", "p_query_text" "text", "p_language_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rate_precedent"("p_precedent_id" "uuid", "p_advocate_id" "uuid", "p_rating" integer, "p_review" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update or insert usage record
  INSERT INTO precedent_usage (
    precedent_id,
    advocate_id,
    rating,
    review
  ) VALUES (
    p_precedent_id,
    p_advocate_id,
    p_rating,
    p_review
  )
  ON CONFLICT (precedent_id, advocate_id) 
  DO UPDATE SET
    rating = p_rating,
    review = p_review,
    updated_at = NOW();
  
  -- Update precedent statistics
  UPDATE precedent_bank
  SET 
    rating_sum = rating_sum + p_rating,
    rating_count = rating_count + 1,
    updated_at = NOW()
  WHERE id = p_precedent_id;
END;
$$;


ALTER FUNCTION "public"."rate_precedent"("p_precedent_id" "uuid", "p_advocate_id" "uuid", "p_rating" integer, "p_review" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_auth_attempt"("p_email" "text", "p_attempt_type" "text", "p_success" boolean, "p_ip_address" "text" DEFAULT NULL::"text", "p_user_agent" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_failed_count INTEGER;
  v_lockout_until TIMESTAMPTZ;
  v_max_attempts INTEGER := 5;
  v_lockout_duration INTERVAL := '30 minutes';
BEGIN
  INSERT INTO auth_attempts (email, attempt_type, success, ip_address, user_agent)
  VALUES (p_email, p_attempt_type, p_success, p_ip_address, p_user_agent);
  
  IF NOT p_success THEN
    SELECT COUNT(*) INTO v_failed_count
    FROM auth_attempts
    WHERE email = p_email
      AND attempt_type = p_attempt_type
      AND success = false
      AND created_at > NOW() - INTERVAL '15 minutes';
    
    IF v_failed_count >= v_max_attempts THEN
      v_lockout_until := NOW() + v_lockout_duration;
      
      INSERT INTO account_lockouts (email, locked_until, failed_attempts)
      VALUES (p_email, v_lockout_until, v_failed_count)
      ON CONFLICT (email) 
      DO UPDATE SET 
        locked_until = v_lockout_until,
        failed_attempts = v_failed_count,
        updated_at = NOW();
      
      RETURN jsonb_build_object(
        'locked', true,
        'locked_until', v_lockout_until,
        'failed_attempts', v_failed_count
      );
    END IF;
  ELSE
    DELETE FROM account_lockouts WHERE email = p_email;
  END IF;
  
  RETURN jsonb_build_object('locked', false, 'failed_attempts', v_failed_count);
END;
$$;


ALTER FUNCTION "public"."record_auth_attempt"("p_email" "text", "p_attempt_type" "text", "p_success" boolean, "p_ip_address" "text", "p_user_agent" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."revoke_session"("p_session_token" "text", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM active_sessions
  WHERE session_token = p_session_token
    AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."revoke_session"("p_session_token" "text", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."suggest_templates_for_matter"("user_id" "uuid", "matter_type_input" "text" DEFAULT NULL::"text", "client_type_input" "text" DEFAULT NULL::"text", "description_input" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "name" character varying, "category" character varying, "confidence_score" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mt.id,
    mt.name,
    mt.category,
    CASE 
      WHEN mt.template_data->>'matterType' ILIKE '%' || COALESCE(matter_type_input, '') || '%' THEN 0.8
      WHEN mt.template_data->>'clientType' ILIKE '%' || COALESCE(client_type_input, '') || '%' THEN 0.6
      WHEN mt.template_data->>'description' ILIKE '%' || COALESCE(description_input, '') || '%' THEN 0.4
      ELSE 0.2
    END as confidence_score
  FROM matter_templates mt
  WHERE 
    (mt.advocate_id = user_id OR
     mt.is_shared = true OR
     mt.id IN (
       SELECT ts.template_id 
       FROM template_shares ts 
       WHERE ts.shared_with_advocate_id = user_id
     ))
    AND (
      matter_type_input IS NULL OR
      client_type_input IS NULL OR
      description_input IS NULL OR
      mt.template_data->>'matterType' ILIKE '%' || matter_type_input || '%' OR
      mt.template_data->>'clientType' ILIKE '%' || client_type_input || '%' OR
      mt.template_data->>'description' ILIKE '%' || description_input || '%'
    )
  ORDER BY confidence_score DESC, mt.usage_count DESC
  LIMIT 5;
END;
$$;


ALTER FUNCTION "public"."suggest_templates_for_matter"("user_id" "uuid", "matter_type_input" "text", "client_type_input" "text", "description_input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_court_diary"("p_court_registry_id" "uuid", "p_advocate_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_sync_log_id UUID;
  v_records_processed INTEGER := 0;
  v_records_updated INTEGER := 0;
  v_start_time TIMESTAMPTZ := NOW();
BEGIN
  -- Create sync log entry
  INSERT INTO court_integration_logs (court_registry_id, sync_type, status)
  VALUES (p_court_registry_id, 'diary_sync', 'started')
  RETURNING id INTO v_sync_log_id;
  
  -- Here would be the actual sync logic with external court system
  -- For now, we'll simulate some processing
  v_records_processed := 10;
  v_records_updated := 8;
  
  -- Update sync log
  UPDATE court_integration_logs 
  SET 
    status = 'completed',
    records_processed = v_records_processed,
    records_updated = v_records_updated,
    sync_duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_time)) * 1000
  WHERE id = v_sync_log_id;
  
  RETURN json_build_object(
    'success', true,
    'records_processed', v_records_processed,
    'records_updated', v_records_updated,
    'sync_log_id', v_sync_log_id
  );
EXCEPTION WHEN OTHERS THEN
  -- Update sync log with error
  UPDATE court_integration_logs 
  SET 
    status = 'failed',
    error_details = json_build_object('error', SQLERRM),
    sync_duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_time)) * 1000
  WHERE id = v_sync_log_id;
  
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;


ALTER FUNCTION "public"."sync_court_diary"("p_court_registry_id" "uuid", "p_advocate_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_expenses_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_expenses_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_referral_relationship"("p_referring_advocate_id" "uuid", "p_referred_to_advocate_id" "uuid", "p_referral_value" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_advocate_a UUID;
  v_advocate_b UUID;
  v_is_a_to_b BOOLEAN;
BEGIN
  -- Ensure consistent ordering
  IF p_referring_advocate_id < p_referred_to_advocate_id THEN
    v_advocate_a := p_referring_advocate_id;
    v_advocate_b := p_referred_to_advocate_id;
    v_is_a_to_b := true;
  ELSE
    v_advocate_a := p_referred_to_advocate_id;
    v_advocate_b := p_referring_advocate_id;
    v_is_a_to_b := false;
  END IF;
  
  -- Insert or update relationship
  INSERT INTO referral_relationships (
    advocate_a_id, advocate_b_id,
    referrals_a_to_b, referrals_b_to_a,
    total_value_a_to_b, total_value_b_to_a,
    last_referral_date
  ) VALUES (
    v_advocate_a, v_advocate_b,
    CASE WHEN v_is_a_to_b THEN 1 ELSE 0 END,
    CASE WHEN v_is_a_to_b THEN 0 ELSE 1 END,
    CASE WHEN v_is_a_to_b THEN p_referral_value ELSE 0 END,
    CASE WHEN v_is_a_to_b THEN 0 ELSE p_referral_value END,
    NOW()
  )
  ON CONFLICT (advocate_a_id, advocate_b_id) DO UPDATE SET
    referrals_a_to_b = referral_relationships.referrals_a_to_b + 
      CASE WHEN v_is_a_to_b THEN 1 ELSE 0 END,
    referrals_b_to_a = referral_relationships.referrals_b_to_a + 
      CASE WHEN v_is_a_to_b THEN 0 ELSE 1 END,
    total_value_a_to_b = referral_relationships.total_value_a_to_b + 
      CASE WHEN v_is_a_to_b THEN p_referral_value ELSE 0 END,
    total_value_b_to_a = referral_relationships.total_value_b_to_a + 
      CASE WHEN v_is_a_to_b THEN 0 ELSE p_referral_value END,
    last_referral_date = NOW(),
    updated_at = NOW();
END;
$$;


ALTER FUNCTION "public"."update_referral_relationship"("p_referring_advocate_id" "uuid", "p_referred_to_advocate_id" "uuid", "p_referral_value" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_session_activity"("p_session_token" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_idle_timeout INTERVAL := '30 minutes';
BEGIN
  UPDATE active_sessions
  SET last_activity = NOW()
  WHERE session_token = p_session_token
    AND expires_at > NOW();
  
  DELETE FROM active_sessions
  WHERE last_activity < NOW() - v_idle_timeout
    OR expires_at < NOW();
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."update_session_activity"("p_session_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_trust_account_balance"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update the running balance in trust_accounts table
    UPDATE trust_accounts 
    SET current_balance = NEW.running_balance,
        updated_at = NOW()
    WHERE id = NEW.trust_account_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_trust_account_balance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_preferences_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_preferences_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_password_strength"("p_password" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_length INTEGER;
  v_has_upper BOOLEAN;
  v_has_lower BOOLEAN;
  v_has_digit BOOLEAN;
  v_has_special BOOLEAN;
  v_strength INTEGER := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  v_length := length(p_password);
  v_has_upper := p_password ~ '[A-Z]';
  v_has_lower := p_password ~ '[a-z]';
  v_has_digit := p_password ~ '[0-9]';
  v_has_special := p_password ~ '[^A-Za-z0-9]';
  
  IF v_length < 12 THEN
    v_errors := array_append(v_errors, 'Password must be at least 12 characters long');
  END IF;
  
  IF NOT v_has_upper THEN
    v_errors := array_append(v_errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  IF NOT v_has_lower THEN
    v_errors := array_append(v_errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  IF NOT v_has_digit THEN
    v_errors := array_append(v_errors, 'Password must contain at least one number');
  END IF;
  
  IF NOT v_has_special THEN
    v_errors := array_append(v_errors, 'Password must contain at least one special character');
  END IF;
  
  IF v_length >= 12 THEN v_strength := v_strength + 1; END IF;
  IF v_has_upper THEN v_strength := v_strength + 1; END IF;
  IF v_has_lower THEN v_strength := v_strength + 1; END IF;
  IF v_has_digit THEN v_strength := v_strength + 1; END IF;
  IF v_has_special THEN v_strength := v_strength + 1; END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'strength', v_strength,
    'errors', v_errors
  );
END;
$$;


ALTER FUNCTION "public"."validate_password_strength"("p_password" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."account_lockouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "locked_until" timestamp with time zone NOT NULL,
    "failed_attempts" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."account_lockouts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."matters" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "reference_number" character varying(50) NOT NULL,
    "title" character varying(500) NOT NULL,
    "description" "text",
    "matter_type" character varying(100) NOT NULL,
    "court_case_number" character varying(100),
    "bar" "public"."bar_association" NOT NULL,
    "client_name" character varying(255) NOT NULL,
    "client_email" character varying(255),
    "client_phone" character varying(20),
    "client_address" "text",
    "client_type" character varying(50),
    "instructing_attorney" character varying(255) NOT NULL,
    "instructing_attorney_email" character varying(255),
    "instructing_attorney_phone" character varying(20),
    "instructing_firm" character varying(255),
    "instructing_firm_ref" character varying(100),
    "fee_type" "public"."fee_type" DEFAULT 'standard'::"public"."fee_type",
    "estimated_fee" numeric(12,2),
    "fee_cap" numeric(12,2),
    "actual_fee" numeric(12,2),
    "wip_value" numeric(12,2) DEFAULT 0,
    "trust_balance" numeric(12,2) DEFAULT 0,
    "disbursements" numeric(12,2) DEFAULT 0,
    "vat_exempt" boolean DEFAULT false,
    "status" "public"."matter_status" DEFAULT 'pending'::"public"."matter_status",
    "risk_level" "public"."risk_level" DEFAULT 'low'::"public"."risk_level",
    "settlement_probability" numeric(3,2),
    "expected_completion_date" "date",
    "conflict_check_completed" boolean DEFAULT false,
    "conflict_check_date" timestamp with time zone,
    "conflict_check_cleared" boolean,
    "conflict_notes" "text",
    "date_instructed" "date" DEFAULT CURRENT_DATE NOT NULL,
    "date_accepted" "date",
    "date_commenced" "date",
    "date_settled" "date",
    "date_closed" "date",
    "next_court_date" "date",
    "prescription_date" "date",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "days_active" integer DEFAULT 0,
    "is_overdue" boolean DEFAULT false,
    "template_id" "uuid",
    "manual_conflict_checks_performed" "text",
    "conflict_check_notes" "text",
    "conflict_override_reason" "text",
    "conflict_override_by" "uuid",
    "conflict_override_at" timestamp with time zone,
    "opportunity_id" "uuid",
    CONSTRAINT "matters_client_type_check" CHECK ((("client_type")::"text" = ANY ((ARRAY['individual'::character varying, 'company'::character varying, 'trust'::character varying, 'government'::character varying, 'ngo'::character varying])::"text"[]))),
    CONSTRAINT "matters_settlement_probability_check" CHECK ((("settlement_probability" >= (0)::numeric) AND ("settlement_probability" <= (1)::numeric)))
);


ALTER TABLE "public"."matters" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_matters" AS
 SELECT "id",
    "advocate_id",
    "reference_number",
    "title",
    "description",
    "matter_type",
    "court_case_number",
    "bar",
    "client_name",
    "client_email",
    "client_phone",
    "client_address",
    "client_type",
    "instructing_attorney",
    "instructing_attorney_email",
    "instructing_attorney_phone",
    "instructing_firm",
    "instructing_firm_ref",
    "fee_type",
    "estimated_fee",
    "fee_cap",
    "actual_fee",
    "wip_value",
    "trust_balance",
    "disbursements",
    "vat_exempt",
    "status",
    "risk_level",
    "settlement_probability",
    "expected_completion_date",
    "conflict_check_completed",
    "conflict_check_date",
    "conflict_check_cleared",
    "conflict_notes",
    "date_instructed",
    "date_accepted",
    "date_commenced",
    "date_settled",
    "date_closed",
    "next_court_date",
    "prescription_date",
    "tags",
    "created_at",
    "updated_at",
    "deleted_at",
    "days_active",
    "is_overdue"
   FROM "public"."matters"
  WHERE (("status" = ANY (ARRAY['active'::"public"."matter_status", 'pending'::"public"."matter_status"])) AND ("deleted_at" IS NULL));


ALTER VIEW "public"."active_matters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."active_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_token" "text" NOT NULL,
    "device_fingerprint" "text",
    "ip_address" "text",
    "user_agent" "text",
    "last_activity" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."active_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."advocate_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "professional_summary" "text",
    "areas_of_expertise" "text"[],
    "languages_spoken" "text"[],
    "accepting_referrals" boolean DEFAULT true,
    "accepting_overflow" boolean DEFAULT true,
    "typical_turnaround_days" integer,
    "preferred_matter_types" "text"[],
    "minimum_brief_value" numeric(12,2),
    "maximum_brief_value" numeric(12,2),
    "total_referrals_received" integer DEFAULT 0,
    "total_referrals_given" integer DEFAULT 0,
    "average_completion_days" numeric(5,2),
    "success_rate" numeric(3,2),
    "is_public" boolean DEFAULT true,
    "profile_views" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."advocate_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."advocates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "full_name" character varying(255) NOT NULL,
    "initials" character varying(10) NOT NULL,
    "practice_number" character varying(50) NOT NULL,
    "bar" "public"."bar_association" NOT NULL,
    "year_admitted" integer NOT NULL,
    "specialisations" "text"[] DEFAULT '{}'::"text"[],
    "hourly_rate" numeric(10,2) NOT NULL,
    "contingency_rate" numeric(3,2),
    "success_fee_rate" numeric(3,2),
    "phone_number" character varying(20),
    "chambers_address" "text",
    "postal_address" "text",
    "notification_preferences" "jsonb" DEFAULT '{"sms": false, "email": true, "whatsapp": false}'::"jsonb",
    "invoice_settings" "jsonb" DEFAULT '{"auto_remind": true, "reminder_days": [30, 45, 55]}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_login_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "deleted_at" timestamp with time zone,
    "total_outstanding" numeric(12,2) DEFAULT 0,
    "total_collected_ytd" numeric(12,2) DEFAULT 0,
    "matters_count" integer DEFAULT 0,
    "firm_name" "text",
    "firm_tagline" "text",
    "firm_logo_url" "text",
    "vat_number" "text",
    "banking_details" "jsonb" DEFAULT '{"bank_name": "Standard Bank", "swift_code": "", "branch_code": "", "account_name": "Legal Practice Trust Account", "account_number": ""}'::"jsonb",
    "user_role" "public"."user_role" DEFAULT 'junior_advocate'::"public"."user_role",
    "role_assigned_at" timestamp with time zone DEFAULT "now"(),
    "role_assigned_by" "uuid",
    CONSTRAINT "advocates_contingency_rate_check" CHECK ((("contingency_rate" >= (0)::numeric) AND ("contingency_rate" <= (1)::numeric))),
    CONSTRAINT "advocates_hourly_rate_check" CHECK (("hourly_rate" > (0)::numeric)),
    CONSTRAINT "advocates_success_fee_rate_check" CHECK ((("success_fee_rate" >= (0)::numeric) AND ("success_fee_rate" <= (1)::numeric))),
    CONSTRAINT "advocates_year_admitted_check" CHECK ((("year_admitted" >= 1900) AND (("year_admitted")::numeric <= EXTRACT(year FROM CURRENT_DATE))))
);


ALTER TABLE "public"."advocates" OWNER TO "postgres";


COMMENT ON COLUMN "public"."advocates"."firm_name" IS 'Law firm or chambers name for branding';



COMMENT ON COLUMN "public"."advocates"."firm_tagline" IS 'Firm tagline or slogan for invoices/documents';



COMMENT ON COLUMN "public"."advocates"."firm_logo_url" IS 'URL to firm logo image for PDF generation';



COMMENT ON COLUMN "public"."advocates"."vat_number" IS 'VAT registration number for invoices';



COMMENT ON COLUMN "public"."advocates"."banking_details" IS 'Banking information for invoice payments (JSON)';



COMMENT ON COLUMN "public"."advocates"."user_role" IS 'User role for RBAC: junior_advocate, senior_counsel, or chambers_admin';



CREATE TABLE IF NOT EXISTS "public"."referral_relationships" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_a_id" "uuid" NOT NULL,
    "advocate_b_id" "uuid" NOT NULL,
    "referrals_a_to_b" integer DEFAULT 0,
    "referrals_b_to_a" integer DEFAULT 0,
    "total_value_a_to_b" numeric(12,2) DEFAULT 0,
    "total_value_b_to_a" numeric(12,2) DEFAULT 0,
    "reciprocity_ratio" numeric(5,2) DEFAULT 1.0,
    "last_referral_date" timestamp with time zone,
    "relationship_quality" character varying(20) DEFAULT 'balanced'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "different_advocates" CHECK (("advocate_a_id" <> "advocate_b_id")),
    CONSTRAINT "ordered_advocates" CHECK (("advocate_a_id" < "advocate_b_id"))
);


ALTER TABLE "public"."referral_relationships" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."advocate_referral_stats" AS
 SELECT "a"."id" AS "advocate_id",
    "a"."full_name",
    COALESCE("given"."total_given", (0)::bigint) AS "referrals_given",
    COALESCE("received"."total_received", (0)::bigint) AS "referrals_received",
    COALESCE("given"."value_given", (0)::numeric) AS "value_given",
    COALESCE("received"."value_received", (0)::numeric) AS "value_received",
        CASE
            WHEN (COALESCE("given"."total_given", (0)::bigint) = 0) THEN NULL::numeric
            ELSE ((COALESCE("received"."total_received", (0)::bigint))::numeric / ("given"."total_given")::numeric)
        END AS "reciprocity_ratio"
   FROM (("public"."advocates" "a"
     LEFT JOIN ( SELECT "referral_relationships"."advocate_a_id" AS "advocate_id",
            "sum"("referral_relationships"."referrals_a_to_b") AS "total_given",
            "sum"("referral_relationships"."total_value_a_to_b") AS "value_given"
           FROM "public"."referral_relationships"
          GROUP BY "referral_relationships"."advocate_a_id"
        UNION ALL
         SELECT "referral_relationships"."advocate_b_id" AS "advocate_id",
            "sum"("referral_relationships"."referrals_b_to_a") AS "total_given",
            "sum"("referral_relationships"."total_value_b_to_a") AS "value_given"
           FROM "public"."referral_relationships"
          GROUP BY "referral_relationships"."advocate_b_id") "given" ON (("a"."id" = "given"."advocate_id")))
     LEFT JOIN ( SELECT "referral_relationships"."advocate_b_id" AS "advocate_id",
            "sum"("referral_relationships"."referrals_a_to_b") AS "total_received",
            "sum"("referral_relationships"."total_value_a_to_b") AS "value_received"
           FROM "public"."referral_relationships"
          GROUP BY "referral_relationships"."advocate_b_id"
        UNION ALL
         SELECT "referral_relationships"."advocate_a_id" AS "advocate_id",
            "sum"("referral_relationships"."referrals_b_to_a") AS "total_received",
            "sum"("referral_relationships"."total_value_b_to_a") AS "value_received"
           FROM "public"."referral_relationships"
          GROUP BY "referral_relationships"."advocate_a_id") "received" ON (("a"."id" = "received"."advocate_id")));


ALTER VIEW "public"."advocate_referral_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."advocate_specialisations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "category" "public"."specialisation_category" NOT NULL,
    "sub_speciality" character varying(255),
    "years_experience" integer,
    "notable_cases" "text",
    "certifications" "text"[],
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "advocate_specialisations_years_experience_check" CHECK (("years_experience" >= 0))
);


ALTER TABLE "public"."advocate_specialisations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_configurations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "api_key" "text" NOT NULL,
    "webhook_url" "text",
    "rate_limit" "text" DEFAULT '100'::"text" NOT NULL,
    "recent_activity" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."api_configurations" OWNER TO "postgres";


COMMENT ON TABLE "public"."api_configurations" IS 'Stores API keys and configuration for user integrations';



CREATE TABLE IF NOT EXISTS "public"."audit_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "entity_type" character varying(50) NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "action_type" character varying(50) NOT NULL,
    "description" "text" NOT NULL,
    "before_state" "jsonb",
    "after_state" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "inet",
    "user_agent" "text"
);


ALTER TABLE "public"."audit_entries" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_entries" IS 'Stores comprehensive audit trail for all compliance-related actions';



CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_id" "uuid",
    "table_name" character varying(50) NOT NULL,
    "record_id" "uuid" NOT NULL,
    "action" character varying(20) NOT NULL,
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audit_log_action_check" CHECK ((("action")::"text" = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying, 'VIEW'::character varying])::"text"[])))
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auth_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "attempt_type" "text" NOT NULL,
    "success" boolean DEFAULT false NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "auth_attempts_attempt_type_check" CHECK (("attempt_type" = ANY (ARRAY['login'::"text", 'signup'::"text", 'password_reset'::"text"])))
);


ALTER TABLE "public"."auth_attempts" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."available_overflow_briefs" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "posting_advocate_id",
    NULL::character varying(500) AS "title",
    NULL::"text" AS "description",
    NULL::"public"."specialisation_category" AS "category",
    NULL::character varying(100) AS "matter_type",
    NULL::"public"."bar_association" AS "bar",
    NULL::integer AS "required_experience_years",
    NULL::"text"[] AS "required_certifications",
    NULL::"text"[] AS "language_requirements",
    NULL::numeric(12,2) AS "estimated_fee_range_min",
    NULL::numeric(12,2) AS "estimated_fee_range_max",
    NULL::"public"."fee_type" AS "fee_type",
    NULL::numeric(3,2) AS "referral_percentage",
    NULL::"date" AS "deadline",
    NULL::integer AS "expected_duration_days",
    NULL::boolean AS "is_urgent",
    NULL::"public"."brief_status" AS "status",
    NULL::"uuid" AS "accepted_by_advocate_id",
    NULL::timestamp with time zone AS "accepted_at",
    NULL::timestamp with time zone AS "completed_at",
    NULL::boolean AS "is_public",
    NULL::"uuid"[] AS "visible_to_advocates",
    NULL::"uuid"[] AS "hidden_from_advocates",
    NULL::integer AS "view_count",
    NULL::integer AS "application_count",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::timestamp with time zone AS "expires_at",
    NULL::timestamp with time zone AS "deleted_at",
    NULL::character varying(255) AS "posting_advocate_name",
    NULL::"public"."bar_association" AS "posting_advocate_bar",
    NULL::bigint AS "current_applications";


ALTER VIEW "public"."available_overflow_briefs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brief_applications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "brief_id" "uuid" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "cover_message" "text" NOT NULL,
    "proposed_fee" numeric(12,2),
    "availability_date" "date",
    "relevant_experience" "text",
    "status" "public"."referral_status" DEFAULT 'pending'::"public"."referral_status",
    "reviewed_at" timestamp with time zone,
    "reviewer_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."brief_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "matter_id" "uuid",
    "external_id" "text",
    "title" "text" NOT NULL,
    "description" "text",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "location" "text",
    "all_day" boolean DEFAULT false,
    "sync_source" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."calendar_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."calendar_events" IS 'Stores calendar events synced from integrations';



CREATE TABLE IF NOT EXISTS "public"."cash_flow_predictions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "prediction_date" "date" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "expected_collections" numeric(12,2) NOT NULL,
    "expected_expenses" numeric(12,2) NOT NULL,
    "expected_net_cash_flow" numeric(12,2) GENERATED ALWAYS AS (("expected_collections" - "expected_expenses")) STORED,
    "invoice_collections" numeric(12,2),
    "new_matter_fees" numeric(12,2),
    "recurring_fees" numeric(12,2),
    "contingency_fees" numeric(12,2),
    "collection_confidence" numeric(3,2),
    "seasonal_adjustment" numeric(5,2),
    "overdue_risk_amount" numeric(12,2),
    "cash_flow_status" "public"."cash_flow_status",
    "minimum_balance_date" "date",
    "minimum_balance_amount" numeric(12,2),
    "recommended_actions" "text"[],
    "financing_needed" numeric(12,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cash_flow_predictions_collection_confidence_check" CHECK ((("collection_confidence" >= (0)::numeric) AND ("collection_confidence" <= (1)::numeric)))
);


ALTER TABLE "public"."cash_flow_predictions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."cash_flow_forecast" AS
 SELECT "cfp"."id",
    "cfp"."advocate_id",
    "cfp"."prediction_date",
    "cfp"."period_start",
    "cfp"."period_end",
    "cfp"."expected_collections",
    "cfp"."expected_expenses",
    "cfp"."expected_net_cash_flow",
    "cfp"."invoice_collections",
    "cfp"."new_matter_fees",
    "cfp"."recurring_fees",
    "cfp"."contingency_fees",
    "cfp"."collection_confidence",
    "cfp"."seasonal_adjustment",
    "cfp"."overdue_risk_amount",
    "cfp"."cash_flow_status",
    "cfp"."minimum_balance_date",
    "cfp"."minimum_balance_amount",
    "cfp"."recommended_actions",
    "cfp"."financing_needed",
    "cfp"."created_at",
    "a"."full_name" AS "advocate_name",
    "a"."bar",
        CASE
            WHEN ("cfp"."expected_net_cash_flow" < (0)::numeric) THEN 'deficit'::"text"
            WHEN ("cfp"."expected_net_cash_flow" < (10000)::numeric) THEN 'low'::"text"
            ELSE 'healthy'::"text"
        END AS "forecast_status"
   FROM ("public"."cash_flow_predictions" "cfp"
     JOIN "public"."advocates" "a" ON (("cfp"."advocate_id" = "a"."id")))
  WHERE ("cfp"."period_end" >= CURRENT_DATE)
  ORDER BY "cfp"."period_start";


ALTER VIEW "public"."cash_flow_forecast" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cash_flow_patterns" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "month" integer NOT NULL,
    "historical_collection_rate" numeric(3,2),
    "historical_payment_delay_days" integer,
    "historical_new_matters_ratio" numeric(3,2),
    "court_recess_impact" numeric(3,2),
    "holiday_impact" numeric(3,2),
    "typical_client_payment_behavior" "text",
    "sample_years" integer,
    "confidence_level" numeric(3,2),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cash_flow_patterns_month_check" CHECK ((("month" >= 1) AND ("month" <= 12)))
);


ALTER TABLE "public"."cash_flow_patterns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."communications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "matter_id" "uuid",
    "external_id" "text",
    "type" "text" NOT NULL,
    "subject" "text",
    "content" "text",
    "from_address" "text",
    "from_name" "text",
    "to_addresses" "text"[],
    "received_at" timestamp with time zone,
    "has_attachments" boolean DEFAULT false,
    "sync_source" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "communications_type_check" CHECK (("type" = ANY (ARRAY['email'::"text", 'message'::"text", 'call'::"text", 'meeting'::"text"])))
);


ALTER TABLE "public"."communications" OWNER TO "postgres";


COMMENT ON TABLE "public"."communications" IS 'Stores emails and messages synced from integrations';



CREATE TABLE IF NOT EXISTS "public"."compliance_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" character varying(50) NOT NULL,
    "severity" character varying(20) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "matter_id" "uuid",
    "resolved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "due_date" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "compliance_alerts_severity_check" CHECK ((("severity")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[]))),
    CONSTRAINT "compliance_alerts_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['trust_account'::character varying, 'billing'::character varying, 'regulatory'::character varying, 'ethics'::character varying, 'audit'::character varying])::"text"[])))
);


ALTER TABLE "public"."compliance_alerts" OWNER TO "postgres";


COMMENT ON TABLE "public"."compliance_alerts" IS 'Stores compliance alerts and notifications for users';



CREATE TABLE IF NOT EXISTS "public"."compliance_deadlines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requirement_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "due_date" timestamp with time zone NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "completed_at" timestamp with time zone,
    "completion_notes" "text",
    "reminder_schedule" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "compliance_deadlines_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'overdue'::character varying, 'waived'::character varying])::"text"[])))
);


ALTER TABLE "public"."compliance_deadlines" OWNER TO "postgres";


COMMENT ON TABLE "public"."compliance_deadlines" IS 'Stores user-specific compliance deadlines and completion status';



CREATE TABLE IF NOT EXISTS "public"."compliance_violations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "alert_id" "uuid" NOT NULL,
    "rule_id" character varying(100) NOT NULL,
    "category" character varying(50) NOT NULL,
    "recommendation" "text" NOT NULL,
    "requires_disclosure" boolean DEFAULT false,
    "can_proceed" boolean DEFAULT true,
    "affected_entities" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."compliance_violations" OWNER TO "postgres";


COMMENT ON TABLE "public"."compliance_violations" IS 'Stores specific ethics and compliance violations linked to alerts';



CREATE TABLE IF NOT EXISTS "public"."conflict_checks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "matter_id" "uuid",
    "client_name" character varying(255) NOT NULL,
    "opposing_parties" "text"[],
    "related_parties" "text"[],
    "has_conflict" boolean DEFAULT false,
    "conflict_type" character varying(50),
    "conflicting_matter_ids" "uuid"[],
    "conflict_details" "text",
    "waiver_obtained" boolean DEFAULT false,
    "waiver_details" "text",
    "check_approved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conflict_checks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "instructor" "text",
    "duration_hours" numeric(4,2),
    "level" "text",
    "rating" numeric(3,2),
    "student_count" integer DEFAULT 0,
    "cpd_credits" numeric(4,2),
    "category" "text",
    "thumbnail_url" "text",
    "content_url" "text",
    "is_published" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "courses_level_check" CHECK (("level" = ANY (ARRAY['beginner'::"text", 'intermediate'::"text", 'advanced'::"text"]))),
    CONSTRAINT "courses_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric)))
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


COMMENT ON TABLE "public"."courses" IS 'Stores available courses for the academy learning management system';



CREATE TABLE IF NOT EXISTS "public"."court_cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "matter_id" "uuid",
    "court_registry_id" "uuid",
    "case_number" "text" NOT NULL,
    "case_type" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "filing_date" "date",
    "allocated_judge_id" "uuid",
    "court_room" "text",
    "case_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "court_cases_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'postponed'::"text", 'finalized'::"text", 'struck_off'::"text"])))
);


ALTER TABLE "public"."court_cases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."court_diary_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "court_case_id" "uuid",
    "advocate_id" "uuid",
    "hearing_date" "date" NOT NULL,
    "hearing_time" time without time zone,
    "hearing_type" "text" NOT NULL,
    "description" "text",
    "outcome" "text",
    "next_hearing_date" "date",
    "notes" "text",
    "sync_status" "text" DEFAULT 'pending'::"text",
    "synced_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "court_diary_entries_sync_status_check" CHECK (("sync_status" = ANY (ARRAY['pending'::"text", 'synced'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."court_diary_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."court_integration_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "court_registry_id" "uuid",
    "sync_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "records_processed" integer DEFAULT 0,
    "records_updated" integer DEFAULT 0,
    "records_failed" integer DEFAULT 0,
    "error_details" "jsonb",
    "sync_duration_ms" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "court_integration_logs_status_check" CHECK (("status" = ANY (ARRAY['started'::"text", 'completed'::"text", 'failed'::"text", 'partial'::"text"]))),
    CONSTRAINT "court_integration_logs_sync_type_check" CHECK (("sync_type" = ANY (ARRAY['diary_sync'::"text", 'case_update'::"text", 'judge_info'::"text", 'full_sync'::"text"])))
);


ALTER TABLE "public"."court_integration_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."court_registries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "jurisdiction" "text" NOT NULL,
    "address" "text",
    "contact_details" "jsonb",
    "integration_status" "text" DEFAULT 'inactive'::"text",
    "api_endpoint" "text",
    "api_credentials_encrypted" "text",
    "last_sync_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "court_registries_integration_status_check" CHECK (("integration_status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'maintenance'::"text"])))
);


ALTER TABLE "public"."court_registries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cpd_tracking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "activity_type" "text",
    "activity_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "cpd_hours" numeric(4,2) NOT NULL,
    "activity_date" "date" NOT NULL,
    "verification_status" "text" DEFAULT 'pending'::"text",
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cpd_tracking_activity_type_check" CHECK (("activity_type" = ANY (ARRAY['course'::"text", 'event'::"text", 'shadowing'::"text", 'peer_review'::"text", 'self_study'::"text"]))),
    CONSTRAINT "cpd_tracking_cpd_hours_check" CHECK (("cpd_hours" > (0)::numeric)),
    CONSTRAINT "cpd_tracking_verification_status_check" CHECK (("verification_status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."cpd_tracking" OWNER TO "postgres";


COMMENT ON TABLE "public"."cpd_tracking" IS 'Tracks Continuing Professional Development hours and activities';



CREATE TABLE IF NOT EXISTS "public"."disbursements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "matter_id" "uuid",
    "external_id" "text",
    "description" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "date" "date" NOT NULL,
    "vendor_name" "text",
    "category" "text",
    "receipt_url" "text",
    "billable" boolean DEFAULT true,
    "sync_source" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."disbursements" OWNER TO "postgres";


COMMENT ON TABLE "public"."disbursements" IS 'Stores expenses and disbursements synced from accounting systems';



CREATE TABLE IF NOT EXISTS "public"."document_analysis_queue" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "priority" integer DEFAULT 5,
    "analysis_type" "public"."analysis_type" NOT NULL,
    "requested_features" "text"[],
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "attempts" integer DEFAULT 0,
    "last_attempt_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "result_id" "uuid",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "document_analysis_queue_priority_check" CHECK ((("priority" >= 1) AND ("priority" <= 10))),
    CONSTRAINT "document_analysis_queue_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::"text"[])))
);


ALTER TABLE "public"."document_analysis_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_intelligence" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "analysis_type" "public"."analysis_type",
    "extracted_entities" "jsonb",
    "key_issues" "text"[],
    "risk_factors" "jsonb",
    "suggested_actions" "text"[],
    "is_brief" boolean DEFAULT false,
    "brief_deadline" "date",
    "brief_court" character varying(255),
    "brief_judge" character varying(255),
    "opposing_counsel" character varying(255),
    "matter_value" numeric(12,2),
    "complexity_score" integer,
    "summary" "text",
    "key_dates" "date"[],
    "referenced_cases" "text"[],
    "applicable_laws" "text"[],
    "status" "public"."document_status" DEFAULT 'processing'::"public"."document_status",
    "processing_started_at" timestamp with time zone,
    "processing_completed_at" timestamp with time zone,
    "error_message" "text",
    "confidence_score" numeric(3,2),
    "processing_time_ms" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "document_intelligence_complexity_score_check" CHECK ((("complexity_score" >= 1) AND ("complexity_score" <= 10))),
    CONSTRAINT "document_intelligence_confidence_score_check" CHECK ((("confidence_score" >= (0)::numeric) AND ("confidence_score" <= (1)::numeric)))
);


ALTER TABLE "public"."document_intelligence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "filename" character varying(255) NOT NULL,
    "original_filename" character varying(255) NOT NULL,
    "document_type" "public"."document_type" NOT NULL,
    "mime_type" character varying(100) NOT NULL,
    "size_bytes" bigint NOT NULL,
    "storage_path" "text" NOT NULL,
    "version" integer DEFAULT 1,
    "parent_document_id" "uuid",
    "description" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "content_text" "text",
    "content_vector" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", COALESCE("content_text", ''::"text"))) STORED,
    "external_id" "text",
    "sync_source" "text"
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "registration_status" "text" DEFAULT 'registered'::"text",
    "attended" boolean DEFAULT false,
    "feedback_rating" integer,
    "feedback_comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "event_registrations_feedback_rating_check" CHECK ((("feedback_rating" >= 1) AND ("feedback_rating" <= 5))),
    CONSTRAINT "event_registrations_registration_status_check" CHECK (("registration_status" = ANY (ARRAY['registered'::"text", 'attended'::"text", 'cancelled'::"text", 'no_show'::"text"])))
);


ALTER TABLE "public"."event_registrations" OWNER TO "postgres";


COMMENT ON TABLE "public"."event_registrations" IS 'Tracks user registrations and attendance for learning events';



CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "date" "date" NOT NULL,
    "category" "text",
    "receipt_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "expenses_amount_check" CHECK (("amount" > (0)::numeric))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


COMMENT ON TABLE "public"."expenses" IS 'Stores expenses related to legal matters for tracking and invoicing purposes';



COMMENT ON COLUMN "public"."expenses"."matter_id" IS 'Foreign key reference to the associated matter';



COMMENT ON COLUMN "public"."expenses"."description" IS 'Description of the expense';



COMMENT ON COLUMN "public"."expenses"."amount" IS 'Amount of the expense in the practice currency';



COMMENT ON COLUMN "public"."expenses"."date" IS 'Date when the expense was incurred';



COMMENT ON COLUMN "public"."expenses"."category" IS 'Optional category for expense classification (e.g., travel, filing fees, expert fees)';



COMMENT ON COLUMN "public"."expenses"."receipt_url" IS 'Optional URL to the receipt or supporting documentation';



CREATE TABLE IF NOT EXISTS "public"."factoring_applications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "offer_id" "uuid" NOT NULL,
    "requested_amount" numeric(12,2) NOT NULL,
    "invoice_amount" numeric(12,2) NOT NULL,
    "invoice_age_days" integer NOT NULL,
    "status" "public"."factoring_status" DEFAULT 'available'::"public"."factoring_status",
    "submitted_at" timestamp with time zone,
    "reviewed_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "funded_at" timestamp with time zone,
    "approved_amount" numeric(12,2),
    "advance_rate" numeric(3,2),
    "discount_rate" numeric(4,2),
    "fees" numeric(12,2),
    "net_amount" numeric(12,2),
    "repayment_due_date" "date",
    "repayment_received_date" "date",
    "repayment_amount" numeric(12,2),
    "risk_score" numeric(3,2),
    "risk_factors" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."factoring_applications" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."factoring_marketplace" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::character varying(255) AS "provider_name",
    NULL::character varying(100) AS "provider_id",
    NULL::numeric(12,2) AS "min_invoice_amount",
    NULL::numeric(12,2) AS "max_invoice_amount",
    NULL::numeric(3,2) AS "advance_rate",
    NULL::numeric(4,2) AS "discount_rate",
    NULL::integer AS "minimum_invoice_age_days",
    NULL::integer AS "maximum_invoice_age_days",
    NULL::character varying(20) AS "recourse_type",
    NULL::integer AS "minimum_practice_age_months",
    NULL::numeric(12,2) AS "minimum_monthly_revenue",
    NULL::numeric(3,2) AS "required_collection_rate",
    NULL::boolean AS "is_active",
    NULL::numeric(12,2) AS "available_capital",
    NULL::numeric(3,2) AS "current_utilization",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::bigint AS "total_applications",
    NULL::bigint AS "funded_applications",
    NULL::numeric AS "average_funding";


ALTER VIEW "public"."factoring_marketplace" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."factoring_offers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "provider_name" character varying(255) NOT NULL,
    "provider_id" character varying(100) NOT NULL,
    "min_invoice_amount" numeric(12,2),
    "max_invoice_amount" numeric(12,2),
    "advance_rate" numeric(3,2),
    "discount_rate" numeric(4,2),
    "minimum_invoice_age_days" integer DEFAULT 0,
    "maximum_invoice_age_days" integer DEFAULT 90,
    "recourse_type" character varying(20),
    "minimum_practice_age_months" integer,
    "minimum_monthly_revenue" numeric(12,2),
    "required_collection_rate" numeric(3,2),
    "is_active" boolean DEFAULT true,
    "available_capital" numeric(12,2),
    "current_utilization" numeric(3,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "factoring_offers_advance_rate_check" CHECK ((("advance_rate" > (0)::numeric) AND ("advance_rate" <= (1)::numeric))),
    CONSTRAINT "factoring_offers_discount_rate_check" CHECK (("discount_rate" >= (0)::numeric)),
    CONSTRAINT "factoring_offers_recourse_type_check" CHECK ((("recourse_type")::"text" = ANY ((ARRAY['recourse'::character varying, 'non_recourse'::character varying, 'partial_recourse'::character varying])::"text"[])))
);


ALTER TABLE "public"."factoring_offers" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."fee_narrative_performance" AS
SELECT
    NULL::"uuid" AS "template_id",
    NULL::character varying(255) AS "template_name",
    NULL::character varying(100) AS "category",
    NULL::bigint AS "times_used",
    NULL::numeric AS "avg_clarity",
    NULL::numeric AS "avg_completeness",
    NULL::numeric AS "avg_professionalism",
    NULL::numeric AS "edit_rate",
    NULL::numeric AS "avg_user_rating";


ALTER VIEW "public"."fee_narrative_performance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fee_narrative_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_id" "uuid",
    "name" character varying(255) NOT NULL,
    "category" character varying(100) NOT NULL,
    "matter_type" character varying(100),
    "template_text" "text" NOT NULL,
    "variables" "jsonb",
    "usage_count" integer DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "success_rate" numeric(3,2),
    "is_public" boolean DEFAULT false,
    "is_community_approved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fee_narrative_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fee_optimization_recommendations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "matter_id" "uuid",
    "current_hourly_rate" numeric(10,2),
    "current_fee_structure" "public"."fee_structure",
    "current_estimated_fee" numeric(12,2),
    "market_average_rate" numeric(10,2),
    "market_percentile" integer,
    "similar_matters_analyzed" integer,
    "recommended_model" "public"."fee_optimization_model" NOT NULL,
    "recommended_hourly_rate" numeric(10,2),
    "recommended_fee_structure" "public"."fee_structure",
    "recommended_fixed_fee" numeric(12,2),
    "recommended_success_percentage" numeric(3,2),
    "optimization_factors" "jsonb",
    "potential_revenue_increase" numeric(12,2),
    "confidence_score" numeric(3,2),
    "accepted" boolean DEFAULT false,
    "accepted_at" timestamp with time zone,
    "actual_fee_achieved" numeric(12,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '30 days'::interval),
    CONSTRAINT "fee_optimization_recommendations_confidence_score_check" CHECK ((("confidence_score" >= (0)::numeric) AND ("confidence_score" <= (1)::numeric))),
    CONSTRAINT "fee_optimization_recommendations_market_percentile_check" CHECK ((("market_percentile" >= 0) AND ("market_percentile" <= 100)))
);


ALTER TABLE "public"."fee_optimization_recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."generated_fee_narratives" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invoice_id" "uuid",
    "matter_id" "uuid" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "template_id" "uuid",
    "time_entries_analyzed" integer,
    "narrative_text" "text" NOT NULL,
    "work_categories" "jsonb",
    "key_activities" "text"[],
    "value_propositions" "text"[],
    "suggested_improvements" "text"[],
    "missing_elements" "text"[],
    "clarity_score" numeric(3,2),
    "completeness_score" numeric(3,2),
    "professionalism_score" numeric(3,2),
    "was_edited" boolean DEFAULT false,
    "final_narrative" "text",
    "user_rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "generated_fee_narratives_user_rating_check" CHECK ((("user_rating" >= 1) AND ("user_rating" <= 5)))
);


ALTER TABLE "public"."generated_fee_narratives" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "integration_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "credentials" "jsonb",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."integration_configs" OWNER TO "postgres";


COMMENT ON TABLE "public"."integration_configs" IS 'Stores integration-specific settings and credentials';



CREATE TABLE IF NOT EXISTS "public"."integration_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "integration_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "total_requests" integer DEFAULT 0,
    "successful_requests" integer DEFAULT 0,
    "failed_requests" integer DEFAULT 0,
    "average_response_time" numeric(10,2) DEFAULT 0,
    "last_request_time" timestamp with time zone,
    "rate_limit_remaining" integer DEFAULT 100,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."integration_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."integration_metrics" IS 'Tracks usage metrics for integrations';



CREATE TABLE IF NOT EXISTS "public"."integrations" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'not_connected'::"text" NOT NULL,
    "category" "text" DEFAULT 'other'::"text" NOT NULL,
    "config_url" "text",
    "last_sync" timestamp with time zone,
    "connected_at" timestamp with time zone,
    "disconnected_at" timestamp with time zone,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "integrations_category_check" CHECK (("category" = ANY (ARRAY['accounting'::"text", 'documents'::"text", 'productivity'::"text", 'communication'::"text", 'legal'::"text", 'other'::"text"]))),
    CONSTRAINT "integrations_status_check" CHECK (("status" = ANY (ARRAY['connected'::"text", 'not_connected'::"text", 'error'::"text", 'pending'::"text"])))
);


ALTER TABLE "public"."integrations" OWNER TO "postgres";


COMMENT ON TABLE "public"."integrations" IS 'Stores third-party integration connections for users';



CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "invoice_number" character varying(50) NOT NULL,
    "invoice_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "due_date" "date" NOT NULL,
    "bar" "public"."bar_association" NOT NULL,
    "fees_amount" numeric(12,2) NOT NULL,
    "disbursements_amount" numeric(12,2) DEFAULT 0,
    "subtotal" numeric(12,2) GENERATED ALWAYS AS (("fees_amount" + "disbursements_amount")) STORED,
    "vat_rate" numeric(3,2) DEFAULT 0.15,
    "vat_amount" numeric(12,2) GENERATED ALWAYS AS ((("fees_amount" + "disbursements_amount") * "vat_rate")) STORED,
    "total_amount" numeric(12,2) GENERATED ALWAYS AS ((("fees_amount" + "disbursements_amount") * ((1)::numeric + "vat_rate"))) STORED,
    "status" "public"."invoice_status" DEFAULT 'draft'::"public"."invoice_status",
    "amount_paid" numeric(12,2) DEFAULT 0,
    "balance_due" numeric(12,2) GENERATED ALWAYS AS (((("fees_amount" + "disbursements_amount") * ((1)::numeric + "vat_rate")) - "amount_paid")) STORED,
    "date_paid" "date",
    "payment_method" "public"."payment_method",
    "payment_reference" character varying(100),
    "fee_narrative" "text" NOT NULL,
    "internal_notes" "text",
    "reminders_sent" integer DEFAULT 0,
    "last_reminder_date" "date",
    "next_reminder_date" "date",
    "reminder_history" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "sent_at" timestamp with time zone,
    "viewed_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "days_outstanding" integer DEFAULT 0,
    "is_overdue" boolean DEFAULT false,
    "is_pro_forma" boolean DEFAULT false,
    "converted_to_invoice_id" "uuid",
    "pro_forma_accepted_at" timestamp with time zone,
    "external_id" "text",
    "sync_source" "text",
    "pro_forma_declined_at" timestamp with time zone,
    CONSTRAINT "invoices_amount_paid_check" CHECK (("amount_paid" >= (0)::numeric)),
    CONSTRAINT "invoices_disbursements_amount_check" CHECK (("disbursements_amount" >= (0)::numeric)),
    CONSTRAINT "invoices_fees_amount_check" CHECK (("fees_amount" >= (0)::numeric))
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


COMMENT ON COLUMN "public"."invoices"."is_pro_forma" IS 'Flag to identify pro forma invoices (quotes) vs final invoices';



COMMENT ON COLUMN "public"."invoices"."converted_to_invoice_id" IS 'Reference to the final invoice created from this pro forma';



COMMENT ON COLUMN "public"."invoices"."pro_forma_accepted_at" IS 'Timestamp when the pro forma was accepted by the client';



COMMENT ON COLUMN "public"."invoices"."pro_forma_declined_at" IS 'Timestamp when the pro forma was declined by the client';



CREATE TABLE IF NOT EXISTS "public"."judge_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "judge_id" "uuid",
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "total_cases_heard" integer DEFAULT 0,
    "average_hearing_duration" interval,
    "postponement_rate" numeric(5,2),
    "judgment_delivery_time_avg" interval,
    "case_types_distribution" "jsonb",
    "ruling_patterns" "jsonb",
    "advocate_interactions" "jsonb",
    "performance_score" numeric(3,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."judge_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."judges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "title" "text",
    "court_registry_id" "uuid",
    "specializations" "text"[],
    "appointment_date" "date",
    "status" "text" DEFAULT 'active'::"text",
    "bio" "text",
    "photo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "judges_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'retired'::"text", 'transferred'::"text"])))
);


ALTER TABLE "public"."judges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."language_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "language_code" "text" NOT NULL,
    "translation" "text" NOT NULL,
    "context" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "language_translations_language_code_check" CHECK (("language_code" = ANY (ARRAY['en'::"text", 'af'::"text", 'zu'::"text", 'xh'::"text", 'st'::"text", 'tn'::"text", 'ss'::"text", 've'::"text", 'ts'::"text", 'nr'::"text", 'nd'::"text"])))
);


ALTER TABLE "public"."language_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."learning_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "event_type" "text",
    "event_date" timestamp with time zone NOT NULL,
    "duration_minutes" integer,
    "mentor" "text",
    "location" "text",
    "max_participants" integer,
    "current_participants" integer DEFAULT 0,
    "is_virtual" boolean DEFAULT true,
    "meeting_link" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "learning_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['virtual_shadowing'::"text", 'webinar'::"text", 'workshop'::"text", 'peer_review'::"text", 'mentorship'::"text"])))
);


ALTER TABLE "public"."learning_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."learning_events" IS 'Stores scheduled learning events such as webinars, shadowing sessions, and workshops';



CREATE TABLE IF NOT EXISTS "public"."matter_services" (
    "matter_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL
);


ALTER TABLE "public"."matter_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."matter_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100) DEFAULT 'General'::character varying NOT NULL,
    "template_data" "jsonb" NOT NULL,
    "is_default" boolean DEFAULT false,
    "is_shared" boolean DEFAULT false,
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."matter_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."meetings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "matter_id" "uuid",
    "external_id" "text",
    "title" "text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "duration" integer NOT NULL,
    "join_url" "text",
    "password" "text",
    "recording_url" "text",
    "sync_source" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."meetings" OWNER TO "postgres";


COMMENT ON TABLE "public"."meetings" IS 'Stores video conference meetings from Zoom and similar platforms';



CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "is_internal" boolean DEFAULT true,
    "is_important" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."opportunities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "notes" "text",
    "client_name" character varying(255),
    "client_email" character varying(255),
    "client_phone" character varying(50),
    "instructing_attorney" character varying(255),
    "instructing_firm" character varying(255),
    "estimated_value" numeric(15,2),
    "probability_percentage" integer,
    "expected_instruction_date" "date",
    "source" character varying(100),
    "status" character varying(50) DEFAULT 'active'::character varying,
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "converted_to_matter_id" "uuid",
    "converted_at" timestamp with time zone,
    CONSTRAINT "opportunities_probability_percentage_check" CHECK ((("probability_percentage" >= 0) AND ("probability_percentage" <= 100))),
    CONSTRAINT "opportunities_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'converted'::character varying, 'lost'::character varying, 'on_hold'::character varying])::"text"[])))
);


ALTER TABLE "public"."opportunities" OWNER TO "postgres";


COMMENT ON TABLE "public"."opportunities" IS 'Pre-matter opportunities for tracking potential legal work before formal instruction';



CREATE OR REPLACE VIEW "public"."overdue_invoices" AS
 SELECT "id",
    "matter_id",
    "advocate_id",
    "invoice_number",
    "invoice_date",
    "due_date",
    "bar",
    "fees_amount",
    "disbursements_amount",
    "subtotal",
    "vat_rate",
    "vat_amount",
    "total_amount",
    "status",
    "amount_paid",
    "balance_due",
    "date_paid",
    "payment_method",
    "payment_reference",
    "fee_narrative",
    "internal_notes",
    "reminders_sent",
    "last_reminder_date",
    "next_reminder_date",
    "reminder_history",
    "created_at",
    "updated_at",
    "sent_at",
    "viewed_at",
    "deleted_at",
    "days_outstanding",
    "is_overdue"
   FROM "public"."invoices"
  WHERE (("is_overdue" = true) AND ("status" <> ALL (ARRAY['paid'::"public"."invoice_status", 'written_off'::"public"."invoice_status"])) AND ("deleted_at" IS NULL));


ALTER VIEW "public"."overdue_invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."overflow_briefs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "posting_advocate_id" "uuid" NOT NULL,
    "title" character varying(500) NOT NULL,
    "description" "text" NOT NULL,
    "category" "public"."specialisation_category" NOT NULL,
    "matter_type" character varying(100) NOT NULL,
    "bar" "public"."bar_association" NOT NULL,
    "required_experience_years" integer DEFAULT 0,
    "required_certifications" "text"[],
    "language_requirements" "text"[],
    "estimated_fee_range_min" numeric(12,2),
    "estimated_fee_range_max" numeric(12,2),
    "fee_type" "public"."fee_type" DEFAULT 'standard'::"public"."fee_type",
    "referral_percentage" numeric(3,2),
    "deadline" "date",
    "expected_duration_days" integer,
    "is_urgent" boolean DEFAULT false,
    "status" "public"."brief_status" DEFAULT 'available'::"public"."brief_status",
    "accepted_by_advocate_id" "uuid",
    "accepted_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "is_public" boolean DEFAULT true,
    "visible_to_advocates" "uuid"[] DEFAULT '{}'::"uuid"[],
    "hidden_from_advocates" "uuid"[] DEFAULT '{}'::"uuid"[],
    "view_count" integer DEFAULT 0,
    "application_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '30 days'::interval),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "overflow_briefs_referral_percentage_check" CHECK ((("referral_percentage" >= (0)::numeric) AND ("referral_percentage" <= 0.5)))
);


ALTER TABLE "public"."overflow_briefs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."password_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "password_hash" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."password_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invoice_id" "uuid",
    "advocate_id" "uuid" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "payment_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "payment_method" "public"."payment_method" NOT NULL,
    "reference" character varying(100),
    "bank_reference" character varying(100),
    "reconciled" boolean DEFAULT false,
    "reconciled_date" "date",
    "is_trust_deposit" boolean DEFAULT false,
    "trust_transfer_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "external_id" "text",
    "sync_source" "text",
    CONSTRAINT "payments_amount_check" CHECK (("amount" > (0)::numeric))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."popular_precedents" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "contributor_id",
    NULL::character varying(500) AS "title",
    NULL::"text" AS "description",
    NULL::"public"."precedent_type" AS "precedent_type",
    NULL::character varying(100) AS "category",
    NULL::character varying(100) AS "subcategory",
    NULL::"uuid" AS "document_id",
    NULL::"text" AS "template_content",
    NULL::"public"."bar_association" AS "bar",
    NULL::character varying(50) AS "court_level",
    NULL::"text"[] AS "applicable_laws",
    NULL::integer AS "year_created",
    NULL::numeric(3,2) AS "quality_score",
    NULL::integer AS "download_count",
    NULL::integer AS "usage_count",
    NULL::integer AS "rating_sum",
    NULL::integer AS "rating_count",
    NULL::numeric(3,2) AS "average_rating",
    NULL::"text"[] AS "tags",
    NULL::boolean AS "is_verified",
    NULL::"uuid" AS "verified_by",
    NULL::timestamp with time zone AS "verification_date",
    NULL::integer AS "version",
    NULL::"uuid" AS "parent_precedent_id",
    NULL::"text" AS "change_notes",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::timestamp with time zone AS "deleted_at",
    NULL::bigint AS "unique_users",
    NULL::bigint AS "total_uses",
    NULL::numeric AS "usage_rating";


ALTER VIEW "public"."popular_precedents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."practice_financial_health" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "calculation_date" "date" NOT NULL,
    "cash_runway_days" integer,
    "collection_rate_30d" numeric(3,2),
    "collection_rate_90d" numeric(3,2),
    "average_collection_days" numeric(5,2),
    "monthly_recurring_revenue" numeric(12,2),
    "revenue_growth_rate" numeric(5,2),
    "revenue_concentration" numeric(3,2),
    "realization_rate" numeric(3,2),
    "utilization_rate" numeric(3,2),
    "write_off_rate" numeric(3,2),
    "current_ratio" numeric(5,2),
    "quick_ratio" numeric(5,2),
    "wip_turnover_days" numeric(5,2),
    "overall_health_score" integer,
    "health_trend" character varying(20),
    "risk_alerts" "text"[],
    "opportunities" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "practice_financial_health_health_trend_check" CHECK ((("health_trend")::"text" = ANY ((ARRAY['improving'::character varying, 'stable'::character varying, 'declining'::character varying])::"text"[]))),
    CONSTRAINT "practice_financial_health_overall_health_score_check" CHECK ((("overall_health_score" >= 0) AND ("overall_health_score" <= 100)))
);


ALTER TABLE "public"."practice_financial_health" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."precedent_bank" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "contributor_id" "uuid" NOT NULL,
    "title" character varying(500) NOT NULL,
    "description" "text",
    "precedent_type" "public"."precedent_type" NOT NULL,
    "category" character varying(100) NOT NULL,
    "subcategory" character varying(100),
    "document_id" "uuid",
    "template_content" "text",
    "bar" "public"."bar_association",
    "court_level" character varying(50),
    "applicable_laws" "text"[],
    "year_created" integer,
    "quality_score" numeric(3,2) DEFAULT 0,
    "download_count" integer DEFAULT 0,
    "usage_count" integer DEFAULT 0,
    "rating_sum" integer DEFAULT 0,
    "rating_count" integer DEFAULT 0,
    "average_rating" numeric(3,2) GENERATED ALWAYS AS (
CASE
    WHEN ("rating_count" > 0) THEN (("rating_sum")::numeric / ("rating_count")::numeric)
    ELSE (0)::numeric
END) STORED,
    "tags" "text"[],
    "is_verified" boolean DEFAULT false,
    "verified_by" "uuid",
    "verification_date" timestamp with time zone,
    "version" integer DEFAULT 1,
    "parent_precedent_id" "uuid",
    "change_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."precedent_bank" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."precedent_usage" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "precedent_id" "uuid" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "matter_id" "uuid",
    "download_date" timestamp with time zone DEFAULT "now"(),
    "usage_date" timestamp with time zone,
    "modifications_made" boolean DEFAULT false,
    "was_successful" boolean,
    "outcome_notes" "text",
    "rating" integer,
    "review" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "precedent_usage_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."precedent_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pro_forma_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "token" "text" DEFAULT ("extensions"."uuid_generate_v4"())::"text" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "client_name" "text" NOT NULL,
    "client_email" "text" NOT NULL,
    "client_phone" "text",
    "matter_description" "text" NOT NULL,
    "matter_type" "text" DEFAULT 'general'::"text" NOT NULL,
    "urgency_level" "public"."urgency_level" DEFAULT 'medium'::"public"."urgency_level" NOT NULL,
    "estimated_value" numeric(15,2),
    "preferred_contact_method" "text" DEFAULT 'email'::"text",
    "additional_notes" "text",
    "status" "public"."pro_forma_status" DEFAULT 'pending'::"public"."pro_forma_status" NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone,
    "processed_by" "uuid",
    "action_taken" "public"."pro_forma_action",
    "rejection_reason" "text",
    "fee_narrative" "text",
    "total_amount" numeric(10,2),
    "valid_until" "date",
    "quote_date" "date"
);


ALTER TABLE "public"."pro_forma_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reconciliations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trust_account_id" "uuid" NOT NULL,
    "performed_by" "uuid" NOT NULL,
    "opening_balance" numeric(15,2) NOT NULL,
    "closing_balance" numeric(15,2) NOT NULL,
    "total_deposits" numeric(15,2) DEFAULT 0.00,
    "total_withdrawals" numeric(15,2) DEFAULT 0.00,
    "discrepancy_count" integer DEFAULT 0,
    "notes" "text",
    "reconciliation_date" timestamp with time zone DEFAULT "now"(),
    "bank_statement_data" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reconciliations" OWNER TO "postgres";


COMMENT ON TABLE "public"."reconciliations" IS 'Stores trust account reconciliation records';



CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "referring_advocate_id" "uuid",
    "referred_to_advocate_id" "uuid",
    "referring_firm" character varying(255),
    "referral_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "referral_fee_percentage" numeric(3,2),
    "referral_fee_amount" numeric(12,2),
    "referral_fee_paid" boolean DEFAULT false,
    "referral_fee_paid_date" "date",
    "reciprocal_expected" boolean DEFAULT false,
    "reciprocal_completed" boolean DEFAULT false,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "referrals_referral_fee_percentage_check" CHECK ((("referral_fee_percentage" >= (0)::numeric) AND ("referral_fee_percentage" <= (1)::numeric)))
);


ALTER TABLE "public"."referrals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."regulatory_requirements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requirement_code" character varying(50) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "frequency" character varying(20) NOT NULL,
    "days_notice" integer DEFAULT 30,
    "bar_council" character varying(50) NOT NULL,
    "mandatory" boolean DEFAULT true,
    "compliance_criteria" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "regulatory_requirements_bar_council_check" CHECK ((("bar_council")::"text" = ANY ((ARRAY['national'::character varying, 'johannesburg'::character varying, 'cape_town'::character varying, 'durban'::character varying, 'pretoria'::character varying])::"text"[]))),
    CONSTRAINT "regulatory_requirements_frequency_check" CHECK ((("frequency")::"text" = ANY ((ARRAY['annual'::character varying, 'quarterly'::character varying, 'monthly'::character varying, 'weekly'::character varying, 'daily'::character varying, 'once_off'::character varying])::"text"[])))
);


ALTER TABLE "public"."regulatory_requirements" OWNER TO "postgres";


COMMENT ON TABLE "public"."regulatory_requirements" IS 'Stores regulatory requirements and deadlines for legal practice';



CREATE TABLE IF NOT EXISTS "public"."role_permissions_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "old_role" "public"."user_role",
    "new_role" "public"."user_role" NOT NULL,
    "changed_by" "uuid",
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."role_permissions_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."role_permissions_log" IS 'Audit log for role changes';



CREATE TABLE IF NOT EXISTS "public"."service_categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."service_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."success_fee_scenarios" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "scenario_name" character varying(255) NOT NULL,
    "description" "text",
    "success_definition" "text" NOT NULL,
    "success_probability" numeric(3,2),
    "base_fee" numeric(12,2) DEFAULT 0,
    "success_fee_percentage" numeric(3,2),
    "success_fee_cap" numeric(12,2),
    "minimum_recovery" numeric(12,2),
    "expected_recovery" numeric(12,2),
    "maximum_recovery" numeric(12,2),
    "minimum_total_fee" numeric(12,2) DEFAULT 0,
    "expected_total_fee" numeric(12,2) DEFAULT 0,
    "maximum_total_fee" numeric(12,2) DEFAULT 0,
    "risk_adjusted_fee" numeric(12,2) DEFAULT 0,
    "breakeven_probability" numeric(3,2),
    "presented_to_client" boolean DEFAULT false,
    "client_approved" boolean,
    "approval_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "success_fee_scenarios_success_fee_percentage_check" CHECK ((("success_fee_percentage" >= (0)::numeric) AND ("success_fee_percentage" <= 0.5))),
    CONSTRAINT "success_fee_scenarios_success_probability_check" CHECK ((("success_probability" >= (0)::numeric) AND ("success_probability" <= (1)::numeric)))
);


ALTER TABLE "public"."success_fee_scenarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."template_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "color_code" character varying(7) DEFAULT '#3B82F6'::character varying,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."template_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."template_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_id" "uuid" NOT NULL,
    "shared_by_advocate_id" "uuid" NOT NULL,
    "shared_with_advocate_id" "uuid" NOT NULL,
    "permissions" character varying(20) DEFAULT 'read'::character varying,
    "shared_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "template_shares_permissions_check" CHECK ((("permissions")::"text" = ANY ((ARRAY['read'::character varying, 'copy'::character varying])::"text"[])))
);


ALTER TABLE "public"."template_shares" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."time_entries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "advocate_id" "uuid" NOT NULL,
    "invoice_id" "uuid",
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "duration_minutes" integer NOT NULL,
    "description" "text" NOT NULL,
    "billable" boolean DEFAULT true,
    "rate" numeric(10,2) NOT NULL,
    "amount" numeric(12,2) GENERATED ALWAYS AS (((("duration_minutes")::numeric / 60.0) * "rate")) STORED,
    "recording_method" "public"."time_entry_method" DEFAULT 'manual'::"public"."time_entry_method",
    "voice_transcription" "text",
    "voice_recording_url" "text",
    "billed" boolean DEFAULT false,
    "write_off" boolean DEFAULT false,
    "write_off_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "external_id" "text",
    "sync_source" "text",
    CONSTRAINT "time_entries_duration_minutes_check" CHECK (("duration_minutes" > 0))
);


ALTER TABLE "public"."time_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trust_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "account_number" character varying(50) NOT NULL,
    "bank_name" character varying(100) NOT NULL,
    "current_balance" numeric(15,2) DEFAULT 0.00,
    "reconciled_balance" numeric(15,2) DEFAULT 0.00,
    "last_reconciliation" timestamp with time zone,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "account_details" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trust_accounts_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying])::"text"[])))
);


ALTER TABLE "public"."trust_accounts" OWNER TO "postgres";


COMMENT ON TABLE "public"."trust_accounts" IS 'Stores trust account information for legal practitioners';



CREATE TABLE IF NOT EXISTS "public"."trust_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trust_account_id" "uuid" NOT NULL,
    "matter_id" "uuid",
    "transaction_type" character varying(20) NOT NULL,
    "amount" numeric(15,2) NOT NULL,
    "running_balance" numeric(15,2) NOT NULL,
    "description" "text" NOT NULL,
    "reference_number" character varying(100),
    "transaction_date" timestamp with time zone DEFAULT "now"(),
    "status" character varying(20) DEFAULT 'completed'::character varying,
    "bank_details" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trust_transactions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'reversed'::character varying])::"text"[]))),
    CONSTRAINT "trust_transactions_transaction_type_check" CHECK ((("transaction_type")::"text" = ANY ((ARRAY['deposit'::character varying, 'withdrawal'::character varying, 'transfer'::character varying, 'interest'::character varying])::"text"[])))
);


ALTER TABLE "public"."trust_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."trust_transactions" IS 'Stores all trust account transactions with audit trail';



CREATE OR REPLACE VIEW "public"."unbilled_time" AS
 SELECT "te"."id",
    "te"."matter_id",
    "te"."advocate_id",
    "te"."invoice_id",
    "te"."date",
    "te"."start_time",
    "te"."end_time",
    "te"."duration_minutes",
    "te"."description",
    "te"."billable",
    "te"."rate",
    "te"."amount",
    "te"."recording_method",
    "te"."voice_transcription",
    "te"."voice_recording_url",
    "te"."billed",
    "te"."write_off",
    "te"."write_off_reason",
    "te"."created_at",
    "te"."updated_at",
    "te"."deleted_at",
    "m"."title" AS "matter_title",
    "m"."client_name"
   FROM ("public"."time_entries" "te"
     JOIN "public"."matters" "m" ON (("te"."matter_id" = "m"."id")))
  WHERE (("te"."billed" = false) AND ("te"."deleted_at" IS NULL) AND ("m"."deleted_at" IS NULL));


ALTER VIEW "public"."unbilled_time" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "advanced_features" "jsonb" DEFAULT '{"financial_growth_tools": false, "ai_document_intelligence": false, "professional_development": false}'::"jsonb" NOT NULL,
    "feature_discovery" "jsonb" DEFAULT '{"first_login_date": null, "notification_shown": false, "notification_dismissed_at": null}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_preferences" IS 'Stores user preferences for advanced features and feature discovery settings';



COMMENT ON COLUMN "public"."user_preferences"."advanced_features" IS 'JSON object containing boolean flags for each advanced feature category';



COMMENT ON COLUMN "public"."user_preferences"."feature_discovery" IS 'JSON object containing feature discovery notification state and timestamps';



CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "progress_percentage" integer DEFAULT 0,
    "completed" boolean DEFAULT false,
    "completed_at" timestamp with time zone,
    "last_accessed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_progress_progress_percentage_check" CHECK ((("progress_percentage" >= 0) AND ("progress_percentage" <= 100)))
);


ALTER TABLE "public"."user_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_progress" IS 'Tracks user progress through courses';



CREATE TABLE IF NOT EXISTS "public"."voice_queries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "advocate_id" "uuid",
    "query_text" "text" NOT NULL,
    "query_language" "text" DEFAULT 'en'::"text",
    "intent" "text",
    "confidence_score" numeric(3,2),
    "extracted_entities" "jsonb",
    "response_text" "text",
    "response_actions" "jsonb",
    "processing_time_ms" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."voice_queries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "attempts" integer DEFAULT 0,
    "last_attempt_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "webhook_events_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'delivered'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."webhook_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."webhook_events" IS 'Logs webhook events for audit and retry purposes';



ALTER TABLE ONLY "public"."account_lockouts"
    ADD CONSTRAINT "account_lockouts_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."account_lockouts"
    ADD CONSTRAINT "account_lockouts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."active_sessions"
    ADD CONSTRAINT "active_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."active_sessions"
    ADD CONSTRAINT "active_sessions_session_token_key" UNIQUE ("session_token");



ALTER TABLE ONLY "public"."advocate_profiles"
    ADD CONSTRAINT "advocate_profiles_advocate_id_key" UNIQUE ("advocate_id");



ALTER TABLE ONLY "public"."advocate_profiles"
    ADD CONSTRAINT "advocate_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."advocate_specialisations"
    ADD CONSTRAINT "advocate_specialisations_advocate_id_category_sub_specialit_key" UNIQUE ("advocate_id", "category", "sub_speciality");



ALTER TABLE ONLY "public"."advocate_specialisations"
    ADD CONSTRAINT "advocate_specialisations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."advocates"
    ADD CONSTRAINT "advocates_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."advocates"
    ADD CONSTRAINT "advocates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."advocates"
    ADD CONSTRAINT "advocates_practice_number_key" UNIQUE ("practice_number");



ALTER TABLE ONLY "public"."api_configurations"
    ADD CONSTRAINT "api_configurations_api_key_key" UNIQUE ("api_key");



ALTER TABLE ONLY "public"."api_configurations"
    ADD CONSTRAINT "api_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_configurations"
    ADD CONSTRAINT "api_configurations_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."audit_entries"
    ADD CONSTRAINT "audit_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_attempts"
    ADD CONSTRAINT "auth_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brief_applications"
    ADD CONSTRAINT "brief_applications_brief_id_advocate_id_key" UNIQUE ("brief_id", "advocate_id");



ALTER TABLE ONLY "public"."brief_applications"
    ADD CONSTRAINT "brief_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cash_flow_patterns"
    ADD CONSTRAINT "cash_flow_patterns_advocate_id_month_key" UNIQUE ("advocate_id", "month");



ALTER TABLE ONLY "public"."cash_flow_patterns"
    ADD CONSTRAINT "cash_flow_patterns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cash_flow_predictions"
    ADD CONSTRAINT "cash_flow_predictions_advocate_id_period_start_period_end_key" UNIQUE ("advocate_id", "period_start", "period_end");



ALTER TABLE ONLY "public"."cash_flow_predictions"
    ADD CONSTRAINT "cash_flow_predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communications"
    ADD CONSTRAINT "communications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_alerts"
    ADD CONSTRAINT "compliance_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_deadlines"
    ADD CONSTRAINT "compliance_deadlines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_violations"
    ADD CONSTRAINT "compliance_violations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conflict_checks"
    ADD CONSTRAINT "conflict_checks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."court_cases"
    ADD CONSTRAINT "court_cases_court_registry_id_case_number_key" UNIQUE ("court_registry_id", "case_number");



ALTER TABLE ONLY "public"."court_cases"
    ADD CONSTRAINT "court_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."court_diary_entries"
    ADD CONSTRAINT "court_diary_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."court_integration_logs"
    ADD CONSTRAINT "court_integration_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."court_registries"
    ADD CONSTRAINT "court_registries_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."court_registries"
    ADD CONSTRAINT "court_registries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cpd_tracking"
    ADD CONSTRAINT "cpd_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."disbursements"
    ADD CONSTRAINT "disbursements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_analysis_queue"
    ADD CONSTRAINT "document_analysis_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_intelligence"
    ADD CONSTRAINT "document_intelligence_document_id_key" UNIQUE ("document_id");



ALTER TABLE ONLY "public"."document_intelligence"
    ADD CONSTRAINT "document_intelligence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_registrations"
    ADD CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_registrations"
    ADD CONSTRAINT "event_registrations_user_id_event_id_key" UNIQUE ("user_id", "event_id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."factoring_applications"
    ADD CONSTRAINT "factoring_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."factoring_offers"
    ADD CONSTRAINT "factoring_offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fee_narrative_templates"
    ADD CONSTRAINT "fee_narrative_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fee_optimization_recommendations"
    ADD CONSTRAINT "fee_optimization_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."generated_fee_narratives"
    ADD CONSTRAINT "generated_fee_narratives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integration_configs"
    ADD CONSTRAINT "integration_configs_integration_id_user_id_key" UNIQUE ("integration_id", "user_id");



ALTER TABLE ONLY "public"."integration_configs"
    ADD CONSTRAINT "integration_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integration_metrics"
    ADD CONSTRAINT "integration_metrics_integration_id_user_id_key" UNIQUE ("integration_id", "user_id");



ALTER TABLE ONLY "public"."integration_metrics"
    ADD CONSTRAINT "integration_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."judge_analytics"
    ADD CONSTRAINT "judge_analytics_judge_id_period_start_period_end_key" UNIQUE ("judge_id", "period_start", "period_end");



ALTER TABLE ONLY "public"."judge_analytics"
    ADD CONSTRAINT "judge_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."judges"
    ADD CONSTRAINT "judges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."language_translations"
    ADD CONSTRAINT "language_translations_key_language_code_key" UNIQUE ("key", "language_code");



ALTER TABLE ONLY "public"."language_translations"
    ADD CONSTRAINT "language_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."learning_events"
    ADD CONSTRAINT "learning_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matter_services"
    ADD CONSTRAINT "matter_services_pkey" PRIMARY KEY ("matter_id", "service_id");



ALTER TABLE ONLY "public"."matter_templates"
    ADD CONSTRAINT "matter_templates_name_advocate_unique" UNIQUE ("name", "advocate_id");



ALTER TABLE ONLY "public"."matter_templates"
    ADD CONSTRAINT "matter_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matters"
    ADD CONSTRAINT "matters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matters"
    ADD CONSTRAINT "matters_reference_number_key" UNIQUE ("reference_number");



ALTER TABLE ONLY "public"."meetings"
    ADD CONSTRAINT "meetings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."overflow_briefs"
    ADD CONSTRAINT "overflow_briefs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_history"
    ADD CONSTRAINT "password_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."practice_financial_health"
    ADD CONSTRAINT "practice_financial_health_advocate_id_calculation_date_key" UNIQUE ("advocate_id", "calculation_date");



ALTER TABLE ONLY "public"."practice_financial_health"
    ADD CONSTRAINT "practice_financial_health_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."precedent_bank"
    ADD CONSTRAINT "precedent_bank_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."precedent_usage"
    ADD CONSTRAINT "precedent_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pro_forma_requests"
    ADD CONSTRAINT "pro_forma_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pro_forma_requests"
    ADD CONSTRAINT "pro_forma_requests_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."reconciliations"
    ADD CONSTRAINT "reconciliations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_relationships"
    ADD CONSTRAINT "referral_relationships_advocate_a_id_advocate_b_id_key" UNIQUE ("advocate_a_id", "advocate_b_id");



ALTER TABLE ONLY "public"."referral_relationships"
    ADD CONSTRAINT "referral_relationships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."regulatory_requirements"
    ADD CONSTRAINT "regulatory_requirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."regulatory_requirements"
    ADD CONSTRAINT "regulatory_requirements_requirement_code_key" UNIQUE ("requirement_code");



ALTER TABLE ONLY "public"."role_permissions_log"
    ADD CONSTRAINT "role_permissions_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_categories"
    ADD CONSTRAINT "service_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."service_categories"
    ADD CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."success_fee_scenarios"
    ADD CONSTRAINT "success_fee_scenarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."template_categories"
    ADD CONSTRAINT "template_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."template_categories"
    ADD CONSTRAINT "template_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."template_shares"
    ADD CONSTRAINT "template_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."template_shares"
    ADD CONSTRAINT "template_shares_unique" UNIQUE ("template_id", "shared_with_advocate_id");



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trust_accounts"
    ADD CONSTRAINT "trust_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trust_transactions"
    ADD CONSTRAINT "trust_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_course_id_key" UNIQUE ("user_id", "course_id");



ALTER TABLE ONLY "public"."voice_queries"
    ADD CONSTRAINT "voice_queries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_account_lockouts_email" ON "public"."account_lockouts" USING "btree" ("email");



CREATE INDEX "idx_account_lockouts_locked_until" ON "public"."account_lockouts" USING "btree" ("locked_until");



CREATE INDEX "idx_active_sessions_last_activity" ON "public"."active_sessions" USING "btree" ("last_activity");



CREATE INDEX "idx_active_sessions_token" ON "public"."active_sessions" USING "btree" ("session_token");



CREATE INDEX "idx_active_sessions_user_id" ON "public"."active_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_advocate_specialisations_advocate" ON "public"."advocate_specialisations" USING "btree" ("advocate_id");



CREATE INDEX "idx_advocate_specialisations_category" ON "public"."advocate_specialisations" USING "btree" ("category");



CREATE INDEX "idx_advocates_firm_logo" ON "public"."advocates" USING "btree" ("firm_logo_url") WHERE ("firm_logo_url" IS NOT NULL);



CREATE INDEX "idx_advocates_user_role" ON "public"."advocates" USING "btree" ("user_role");



CREATE INDEX "idx_analysis_queue_status" ON "public"."document_analysis_queue" USING "btree" ("status", "priority" DESC);



CREATE INDEX "idx_api_configurations_api_key" ON "public"."api_configurations" USING "btree" ("api_key");



CREATE INDEX "idx_api_configurations_user_id" ON "public"."api_configurations" USING "btree" ("user_id");



CREATE INDEX "idx_audit_entries_action_type" ON "public"."audit_entries" USING "btree" ("action_type");



CREATE INDEX "idx_audit_entries_created_at" ON "public"."audit_entries" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_entries_entity" ON "public"."audit_entries" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_audit_entries_user_id" ON "public"."audit_entries" USING "btree" ("user_id");



CREATE INDEX "idx_audit_log_advocate" ON "public"."audit_log" USING "btree" ("advocate_id", "created_at" DESC);



CREATE INDEX "idx_auth_attempts_email_created" ON "public"."auth_attempts" USING "btree" ("email", "created_at" DESC);



CREATE INDEX "idx_auth_attempts_type" ON "public"."auth_attempts" USING "btree" ("attempt_type");



CREATE INDEX "idx_brief_applications_advocate" ON "public"."brief_applications" USING "btree" ("advocate_id");



CREATE INDEX "idx_brief_applications_brief" ON "public"."brief_applications" USING "btree" ("brief_id");



CREATE INDEX "idx_calendar_events_external_id" ON "public"."calendar_events" USING "btree" ("external_id");



CREATE INDEX "idx_calendar_events_matter_id" ON "public"."calendar_events" USING "btree" ("matter_id");



CREATE INDEX "idx_calendar_events_start_time" ON "public"."calendar_events" USING "btree" ("start_time");



CREATE INDEX "idx_calendar_events_user_id" ON "public"."calendar_events" USING "btree" ("user_id");



CREATE INDEX "idx_cash_flow_patterns_advocate" ON "public"."cash_flow_patterns" USING "btree" ("advocate_id", "month");



CREATE INDEX "idx_cash_flow_predictions_advocate" ON "public"."cash_flow_predictions" USING "btree" ("advocate_id", "period_start");



CREATE INDEX "idx_communications_external_id" ON "public"."communications" USING "btree" ("external_id");



CREATE INDEX "idx_communications_matter_id" ON "public"."communications" USING "btree" ("matter_id");



CREATE INDEX "idx_communications_sync_source" ON "public"."communications" USING "btree" ("sync_source");



CREATE INDEX "idx_communications_user_id" ON "public"."communications" USING "btree" ("user_id");



CREATE INDEX "idx_compliance_alerts_due_date" ON "public"."compliance_alerts" USING "btree" ("due_date");



CREATE INDEX "idx_compliance_alerts_resolved" ON "public"."compliance_alerts" USING "btree" ("resolved");



CREATE INDEX "idx_compliance_alerts_severity" ON "public"."compliance_alerts" USING "btree" ("severity");



CREATE INDEX "idx_compliance_alerts_type" ON "public"."compliance_alerts" USING "btree" ("type");



CREATE INDEX "idx_compliance_alerts_user_id" ON "public"."compliance_alerts" USING "btree" ("user_id");



CREATE INDEX "idx_compliance_deadlines_due_date" ON "public"."compliance_deadlines" USING "btree" ("due_date");



CREATE INDEX "idx_compliance_deadlines_requirement_id" ON "public"."compliance_deadlines" USING "btree" ("requirement_id");



CREATE INDEX "idx_compliance_deadlines_status" ON "public"."compliance_deadlines" USING "btree" ("status");



CREATE INDEX "idx_compliance_deadlines_user_id" ON "public"."compliance_deadlines" USING "btree" ("user_id");



CREATE INDEX "idx_compliance_violations_alert_id" ON "public"."compliance_violations" USING "btree" ("alert_id");



CREATE INDEX "idx_compliance_violations_category" ON "public"."compliance_violations" USING "btree" ("category");



CREATE INDEX "idx_compliance_violations_rule_id" ON "public"."compliance_violations" USING "btree" ("rule_id");



CREATE INDEX "idx_conflict_checks_advocate" ON "public"."conflict_checks" USING "btree" ("advocate_id");



CREATE INDEX "idx_courses_category" ON "public"."courses" USING "btree" ("category");



CREATE INDEX "idx_courses_level" ON "public"."courses" USING "btree" ("level");



CREATE INDEX "idx_courses_published" ON "public"."courses" USING "btree" ("is_published");



CREATE INDEX "idx_court_cases_case_number" ON "public"."court_cases" USING "btree" ("case_number");



CREATE INDEX "idx_court_cases_matter_id" ON "public"."court_cases" USING "btree" ("matter_id");



CREATE INDEX "idx_court_diary_advocate_id" ON "public"."court_diary_entries" USING "btree" ("advocate_id");



CREATE INDEX "idx_court_diary_hearing_date" ON "public"."court_diary_entries" USING "btree" ("hearing_date");



CREATE INDEX "idx_cpd_tracking_date" ON "public"."cpd_tracking" USING "btree" ("activity_date" DESC);



CREATE INDEX "idx_cpd_tracking_user_id" ON "public"."cpd_tracking" USING "btree" ("user_id");



CREATE INDEX "idx_disbursements_date" ON "public"."disbursements" USING "btree" ("date");



CREATE INDEX "idx_disbursements_external_id" ON "public"."disbursements" USING "btree" ("external_id");



CREATE INDEX "idx_disbursements_matter_id" ON "public"."disbursements" USING "btree" ("matter_id");



CREATE INDEX "idx_disbursements_user_id" ON "public"."disbursements" USING "btree" ("user_id");



CREATE INDEX "idx_document_intelligence_brief" ON "public"."document_intelligence" USING "btree" ("is_brief") WHERE ("is_brief" = true);



CREATE INDEX "idx_document_intelligence_document" ON "public"."document_intelligence" USING "btree" ("document_id");



CREATE INDEX "idx_document_intelligence_status" ON "public"."document_intelligence" USING "btree" ("status");



CREATE INDEX "idx_documents_advocate" ON "public"."documents" USING "btree" ("advocate_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_documents_matter" ON "public"."documents" USING "btree" ("matter_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_documents_search" ON "public"."documents" USING "gin" ("content_vector");



CREATE INDEX "idx_documents_tags" ON "public"."documents" USING "gin" ("tags");



CREATE INDEX "idx_documents_type" ON "public"."documents" USING "btree" ("document_type") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_event_registrations_event_id" ON "public"."event_registrations" USING "btree" ("event_id");



CREATE INDEX "idx_event_registrations_user_id" ON "public"."event_registrations" USING "btree" ("user_id");



CREATE INDEX "idx_expenses_category" ON "public"."expenses" USING "btree" ("category") WHERE ("category" IS NOT NULL);



CREATE INDEX "idx_expenses_date" ON "public"."expenses" USING "btree" ("date" DESC);



CREATE INDEX "idx_expenses_matter_id" ON "public"."expenses" USING "btree" ("matter_id");



CREATE INDEX "idx_factoring_applications_invoice" ON "public"."factoring_applications" USING "btree" ("invoice_id");



CREATE INDEX "idx_factoring_applications_status" ON "public"."factoring_applications" USING "btree" ("status");



CREATE INDEX "idx_factoring_offers_active" ON "public"."factoring_offers" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_fee_narrative_templates_advocate" ON "public"."fee_narrative_templates" USING "btree" ("advocate_id");



CREATE INDEX "idx_fee_narrative_templates_public" ON "public"."fee_narrative_templates" USING "btree" ("is_public") WHERE ("is_public" = true);



CREATE INDEX "idx_fee_optimization_advocate" ON "public"."fee_optimization_recommendations" USING "btree" ("advocate_id");



CREATE INDEX "idx_fee_optimization_matter" ON "public"."fee_optimization_recommendations" USING "btree" ("matter_id");



CREATE INDEX "idx_financial_health_advocate" ON "public"."practice_financial_health" USING "btree" ("advocate_id", "calculation_date" DESC);



CREATE INDEX "idx_generated_narratives_invoice" ON "public"."generated_fee_narratives" USING "btree" ("invoice_id");



CREATE INDEX "idx_generated_narratives_matter" ON "public"."generated_fee_narratives" USING "btree" ("matter_id");



CREATE INDEX "idx_integration_configs_integration_id" ON "public"."integration_configs" USING "btree" ("integration_id");



CREATE INDEX "idx_integration_configs_user_id" ON "public"."integration_configs" USING "btree" ("user_id");



CREATE INDEX "idx_integration_metrics_user_id" ON "public"."integration_metrics" USING "btree" ("user_id");



CREATE INDEX "idx_integrations_status" ON "public"."integrations" USING "btree" ("status");



CREATE INDEX "idx_integrations_user_id" ON "public"."integrations" USING "btree" ("user_id");



CREATE INDEX "idx_invoices_advocate_status" ON "public"."invoices" USING "btree" ("advocate_id", "status");



CREATE INDEX "idx_invoices_converted_to_invoice_id" ON "public"."invoices" USING "btree" ("converted_to_invoice_id") WHERE ("converted_to_invoice_id" IS NOT NULL);



CREATE INDEX "idx_invoices_due_date" ON "public"."invoices" USING "btree" ("due_date") WHERE (("deleted_at" IS NULL) AND ("status" <> ALL (ARRAY['paid'::"public"."invoice_status", 'written_off'::"public"."invoice_status"])));



CREATE INDEX "idx_invoices_is_pro_forma" ON "public"."invoices" USING "btree" ("is_pro_forma") WHERE ("is_pro_forma" = true);



CREATE INDEX "idx_invoices_matter" ON "public"."invoices" USING "btree" ("matter_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_invoices_status" ON "public"."invoices" USING "btree" ("status") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_judge_analytics_judge_period" ON "public"."judge_analytics" USING "btree" ("judge_id", "period_start", "period_end");



CREATE INDEX "idx_judges_court_registry" ON "public"."judges" USING "btree" ("court_registry_id");



CREATE INDEX "idx_language_translations_key_lang" ON "public"."language_translations" USING "btree" ("key", "language_code");



CREATE INDEX "idx_learning_events_date" ON "public"."learning_events" USING "btree" ("event_date");



CREATE INDEX "idx_learning_events_type" ON "public"."learning_events" USING "btree" ("event_type");



CREATE INDEX "idx_matter_services_matter_id" ON "public"."matter_services" USING "btree" ("matter_id");



CREATE INDEX "idx_matter_services_service_id" ON "public"."matter_services" USING "btree" ("service_id");



CREATE INDEX "idx_matter_templates_advocate_id" ON "public"."matter_templates" USING "btree" ("advocate_id");



CREATE INDEX "idx_matter_templates_category" ON "public"."matter_templates" USING "btree" ("category");



CREATE INDEX "idx_matter_templates_is_default" ON "public"."matter_templates" USING "btree" ("is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_matter_templates_is_shared" ON "public"."matter_templates" USING "btree" ("is_shared") WHERE ("is_shared" = true);



CREATE INDEX "idx_matter_templates_usage_count" ON "public"."matter_templates" USING "btree" ("usage_count" DESC);



CREATE INDEX "idx_matters_advocate" ON "public"."matters" USING "btree" ("advocate_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_matters_client_name" ON "public"."matters" USING "btree" ("client_name");



CREATE INDEX "idx_matters_dates" ON "public"."matters" USING "btree" ("date_instructed", "date_closed") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_matters_opportunity_id" ON "public"."matters" USING "btree" ("opportunity_id");



CREATE INDEX "idx_matters_status" ON "public"."matters" USING "btree" ("status") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_meetings_external_id" ON "public"."meetings" USING "btree" ("external_id");



CREATE INDEX "idx_meetings_matter_id" ON "public"."meetings" USING "btree" ("matter_id");



CREATE INDEX "idx_meetings_start_time" ON "public"."meetings" USING "btree" ("start_time");



CREATE INDEX "idx_meetings_user_id" ON "public"."meetings" USING "btree" ("user_id");



CREATE INDEX "idx_opportunities_advocate_id" ON "public"."opportunities" USING "btree" ("advocate_id");



CREATE INDEX "idx_opportunities_converted_to_matter" ON "public"."opportunities" USING "btree" ("converted_to_matter_id");



CREATE INDEX "idx_opportunities_created_at" ON "public"."opportunities" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_opportunities_expected_instruction_date" ON "public"."opportunities" USING "btree" ("expected_instruction_date");



CREATE INDEX "idx_opportunities_status" ON "public"."opportunities" USING "btree" ("status");



CREATE INDEX "idx_overflow_briefs_bar" ON "public"."overflow_briefs" USING "btree" ("bar") WHERE ("status" = 'available'::"public"."brief_status");



CREATE INDEX "idx_overflow_briefs_category" ON "public"."overflow_briefs" USING "btree" ("category") WHERE ("status" = 'available'::"public"."brief_status");



CREATE INDEX "idx_overflow_briefs_status" ON "public"."overflow_briefs" USING "btree" ("status") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_password_history_user_id" ON "public"."password_history" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_payments_invoice" ON "public"."payments" USING "btree" ("invoice_id");



CREATE INDEX "idx_precedent_bank_category" ON "public"."precedent_bank" USING "btree" ("category");



CREATE INDEX "idx_precedent_bank_search" ON "public"."precedent_bank" USING "gin" ("to_tsvector"('"english"'::"regconfig", ((("title")::"text" || ' '::"text") || COALESCE("description", ''::"text"))));



CREATE INDEX "idx_precedent_bank_type" ON "public"."precedent_bank" USING "btree" ("precedent_type");



CREATE INDEX "idx_precedent_bank_verified" ON "public"."precedent_bank" USING "btree" ("is_verified") WHERE ("is_verified" = true);



CREATE INDEX "idx_precedent_usage_advocate" ON "public"."precedent_usage" USING "btree" ("advocate_id");



CREATE INDEX "idx_precedent_usage_precedent" ON "public"."precedent_usage" USING "btree" ("precedent_id");



CREATE INDEX "idx_pro_forma_requests_advocate_id_status" ON "public"."pro_forma_requests" USING "btree" ("advocate_id", "status");



CREATE INDEX "idx_pro_forma_requests_expires_at" ON "public"."pro_forma_requests" USING "btree" ("expires_at");



CREATE INDEX "idx_pro_forma_requests_status" ON "public"."pro_forma_requests" USING "btree" ("status");



CREATE INDEX "idx_pro_forma_requests_token" ON "public"."pro_forma_requests" USING "btree" ("token");



CREATE INDEX "idx_reconciliations_account_id" ON "public"."reconciliations" USING "btree" ("trust_account_id");



CREATE INDEX "idx_reconciliations_date" ON "public"."reconciliations" USING "btree" ("reconciliation_date" DESC);



CREATE INDEX "idx_reconciliations_performed_by" ON "public"."reconciliations" USING "btree" ("performed_by");



CREATE INDEX "idx_referral_relationships_advocates" ON "public"."referral_relationships" USING "btree" ("advocate_a_id", "advocate_b_id");



CREATE INDEX "idx_regulatory_requirements_bar_council" ON "public"."regulatory_requirements" USING "btree" ("bar_council");



CREATE INDEX "idx_regulatory_requirements_code" ON "public"."regulatory_requirements" USING "btree" ("requirement_code");



CREATE INDEX "idx_regulatory_requirements_frequency" ON "public"."regulatory_requirements" USING "btree" ("frequency");



CREATE INDEX "idx_regulatory_requirements_mandatory" ON "public"."regulatory_requirements" USING "btree" ("mandatory");



CREATE INDEX "idx_role_permissions_log_advocate" ON "public"."role_permissions_log" USING "btree" ("advocate_id");



CREATE INDEX "idx_role_permissions_log_created_at" ON "public"."role_permissions_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_services_category_id" ON "public"."services" USING "btree" ("category_id");



CREATE INDEX "idx_success_fee_scenarios_matter" ON "public"."success_fee_scenarios" USING "btree" ("matter_id");



CREATE INDEX "idx_template_categories_sort_order" ON "public"."template_categories" USING "btree" ("sort_order");



CREATE INDEX "idx_template_shares_shared_with" ON "public"."template_shares" USING "btree" ("shared_with_advocate_id");



CREATE INDEX "idx_template_shares_template_id" ON "public"."template_shares" USING "btree" ("template_id");



CREATE INDEX "idx_time_entries_matter" ON "public"."time_entries" USING "btree" ("matter_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_time_entries_unbilled" ON "public"."time_entries" USING "btree" ("matter_id") WHERE (("billed" = false) AND ("deleted_at" IS NULL));



CREATE INDEX "idx_trust_accounts_account_number" ON "public"."trust_accounts" USING "btree" ("account_number");



CREATE INDEX "idx_trust_accounts_status" ON "public"."trust_accounts" USING "btree" ("status");



CREATE INDEX "idx_trust_accounts_user_id" ON "public"."trust_accounts" USING "btree" ("user_id");



CREATE INDEX "idx_trust_transactions_account_id" ON "public"."trust_transactions" USING "btree" ("trust_account_id");



CREATE INDEX "idx_trust_transactions_date" ON "public"."trust_transactions" USING "btree" ("transaction_date" DESC);



CREATE INDEX "idx_trust_transactions_matter_id" ON "public"."trust_transactions" USING "btree" ("matter_id");



CREATE INDEX "idx_trust_transactions_status" ON "public"."trust_transactions" USING "btree" ("status");



CREATE INDEX "idx_trust_transactions_type" ON "public"."trust_transactions" USING "btree" ("transaction_type");



CREATE INDEX "idx_user_preferences_advanced_features" ON "public"."user_preferences" USING "gin" ("advanced_features");



CREATE INDEX "idx_user_preferences_feature_discovery" ON "public"."user_preferences" USING "gin" ("feature_discovery");



CREATE INDEX "idx_user_preferences_user_id" ON "public"."user_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_user_progress_course_id" ON "public"."user_progress" USING "btree" ("course_id");



CREATE INDEX "idx_user_progress_user_id" ON "public"."user_progress" USING "btree" ("user_id");



CREATE INDEX "idx_voice_queries_advocate_created" ON "public"."voice_queries" USING "btree" ("advocate_id", "created_at");



CREATE INDEX "idx_webhook_events_created_at" ON "public"."webhook_events" USING "btree" ("created_at");



CREATE INDEX "idx_webhook_events_status" ON "public"."webhook_events" USING "btree" ("status");



CREATE INDEX "idx_webhook_events_user_id" ON "public"."webhook_events" USING "btree" ("user_id");



CREATE OR REPLACE VIEW "public"."available_overflow_briefs" AS
 SELECT "ob"."id",
    "ob"."posting_advocate_id",
    "ob"."title",
    "ob"."description",
    "ob"."category",
    "ob"."matter_type",
    "ob"."bar",
    "ob"."required_experience_years",
    "ob"."required_certifications",
    "ob"."language_requirements",
    "ob"."estimated_fee_range_min",
    "ob"."estimated_fee_range_max",
    "ob"."fee_type",
    "ob"."referral_percentage",
    "ob"."deadline",
    "ob"."expected_duration_days",
    "ob"."is_urgent",
    "ob"."status",
    "ob"."accepted_by_advocate_id",
    "ob"."accepted_at",
    "ob"."completed_at",
    "ob"."is_public",
    "ob"."visible_to_advocates",
    "ob"."hidden_from_advocates",
    "ob"."view_count",
    "ob"."application_count",
    "ob"."created_at",
    "ob"."updated_at",
    "ob"."expires_at",
    "ob"."deleted_at",
    "a"."full_name" AS "posting_advocate_name",
    "a"."bar" AS "posting_advocate_bar",
    "count"("ba"."id") AS "current_applications"
   FROM (("public"."overflow_briefs" "ob"
     JOIN "public"."advocates" "a" ON (("ob"."posting_advocate_id" = "a"."id")))
     LEFT JOIN "public"."brief_applications" "ba" ON (("ob"."id" = "ba"."brief_id")))
  WHERE (("ob"."status" = 'available'::"public"."brief_status") AND ("ob"."deleted_at" IS NULL) AND ("ob"."expires_at" > "now"()))
  GROUP BY "ob"."id", "a"."id";



CREATE OR REPLACE VIEW "public"."factoring_marketplace" AS
 SELECT "fo"."id",
    "fo"."provider_name",
    "fo"."provider_id",
    "fo"."min_invoice_amount",
    "fo"."max_invoice_amount",
    "fo"."advance_rate",
    "fo"."discount_rate",
    "fo"."minimum_invoice_age_days",
    "fo"."maximum_invoice_age_days",
    "fo"."recourse_type",
    "fo"."minimum_practice_age_months",
    "fo"."minimum_monthly_revenue",
    "fo"."required_collection_rate",
    "fo"."is_active",
    "fo"."available_capital",
    "fo"."current_utilization",
    "fo"."created_at",
    "fo"."updated_at",
    "count"("fa"."id") AS "total_applications",
    "sum"(
        CASE
            WHEN ("fa"."status" = 'funded'::"public"."factoring_status") THEN 1
            ELSE 0
        END) AS "funded_applications",
    "avg"("fa"."approved_amount") AS "average_funding"
   FROM ("public"."factoring_offers" "fo"
     LEFT JOIN "public"."factoring_applications" "fa" ON (("fo"."id" = "fa"."offer_id")))
  WHERE ("fo"."is_active" = true)
  GROUP BY "fo"."id"
  ORDER BY "fo"."advance_rate" DESC, "fo"."discount_rate";



CREATE OR REPLACE VIEW "public"."fee_narrative_performance" AS
 SELECT "t"."id" AS "template_id",
    "t"."name" AS "template_name",
    "t"."category",
    "count"(DISTINCT "g"."id") AS "times_used",
    "avg"("g"."clarity_score") AS "avg_clarity",
    "avg"("g"."completeness_score") AS "avg_completeness",
    "avg"("g"."professionalism_score") AS "avg_professionalism",
    (("sum"(
        CASE
            WHEN "g"."was_edited" THEN 1
            ELSE 0
        END))::numeric / ("count"("g"."id"))::numeric) AS "edit_rate",
    "avg"("g"."user_rating") AS "avg_user_rating"
   FROM ("public"."fee_narrative_templates" "t"
     JOIN "public"."generated_fee_narratives" "g" ON (("t"."id" = "g"."template_id")))
  GROUP BY "t"."id";



CREATE OR REPLACE VIEW "public"."popular_precedents" AS
 SELECT "p"."id",
    "p"."contributor_id",
    "p"."title",
    "p"."description",
    "p"."precedent_type",
    "p"."category",
    "p"."subcategory",
    "p"."document_id",
    "p"."template_content",
    "p"."bar",
    "p"."court_level",
    "p"."applicable_laws",
    "p"."year_created",
    "p"."quality_score",
    "p"."download_count",
    "p"."usage_count",
    "p"."rating_sum",
    "p"."rating_count",
    "p"."average_rating",
    "p"."tags",
    "p"."is_verified",
    "p"."verified_by",
    "p"."verification_date",
    "p"."version",
    "p"."parent_precedent_id",
    "p"."change_notes",
    "p"."created_at",
    "p"."updated_at",
    "p"."deleted_at",
    "count"(DISTINCT "u"."advocate_id") AS "unique_users",
    "count"("u"."id") AS "total_uses",
    "avg"("u"."rating") AS "usage_rating"
   FROM ("public"."precedent_bank" "p"
     LEFT JOIN "public"."precedent_usage" "u" ON (("p"."id" = "u"."precedent_id")))
  WHERE ("p"."deleted_at" IS NULL)
  GROUP BY "p"."id"
  ORDER BY "p"."download_count" DESC, "p"."average_rating" DESC;



CREATE OR REPLACE TRIGGER "courses_updated_at_trigger" BEFORE UPDATE ON "public"."courses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "cpd_tracking_updated_at_trigger" BEFORE UPDATE ON "public"."cpd_tracking" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "event_registrations_updated_at_trigger" BEFORE UPDATE ON "public"."event_registrations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "expenses_updated_at_trigger" BEFORE UPDATE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."update_expenses_updated_at"();



CREATE OR REPLACE TRIGGER "learning_events_updated_at_trigger" BEFORE UPDATE ON "public"."learning_events" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_auto_assign_user_role" BEFORE INSERT ON "public"."advocates" FOR EACH ROW EXECUTE FUNCTION "public"."auto_assign_user_role"();



CREATE OR REPLACE TRIGGER "trigger_log_role_change" AFTER UPDATE ON "public"."advocates" FOR EACH ROW WHEN (("old"."user_role" IS DISTINCT FROM "new"."user_role")) EXECUTE FUNCTION "public"."log_role_change"();



CREATE OR REPLACE TRIGGER "trigger_update_trust_account_balance" AFTER INSERT OR UPDATE ON "public"."trust_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_trust_account_balance"();



CREATE OR REPLACE TRIGGER "update_advocates_updated_at" BEFORE UPDATE ON "public"."advocates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_api_configurations_updated_at" BEFORE UPDATE ON "public"."api_configurations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_integration_configs_updated_at" BEFORE UPDATE ON "public"."integration_configs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_integration_metrics_updated_at" BEFORE UPDATE ON "public"."integration_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_integrations_updated_at" BEFORE UPDATE ON "public"."integrations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_invoices_updated_at" BEFORE UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_matter_templates_updated_at" BEFORE UPDATE ON "public"."matter_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_matters_updated_at" BEFORE UPDATE ON "public"."matters" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_opportunities_updated_at" BEFORE UPDATE ON "public"."opportunities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pro_forma_requests_updated_at" BEFORE UPDATE ON "public"."pro_forma_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_preferences_updated_at_trigger" BEFORE UPDATE ON "public"."user_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_preferences_updated_at"();



CREATE OR REPLACE TRIGGER "user_progress_updated_at_trigger" BEFORE UPDATE ON "public"."user_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."active_sessions"
    ADD CONSTRAINT "active_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advocate_profiles"
    ADD CONSTRAINT "advocate_profiles_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advocate_specialisations"
    ADD CONSTRAINT "advocate_specialisations_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advocates"
    ADD CONSTRAINT "advocates_role_assigned_by_fkey" FOREIGN KEY ("role_assigned_by") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."api_configurations"
    ADD CONSTRAINT "api_configurations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_entries"
    ADD CONSTRAINT "audit_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."brief_applications"
    ADD CONSTRAINT "brief_applications_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."brief_applications"
    ADD CONSTRAINT "brief_applications_brief_id_fkey" FOREIGN KEY ("brief_id") REFERENCES "public"."overflow_briefs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cash_flow_patterns"
    ADD CONSTRAINT "cash_flow_patterns_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."cash_flow_predictions"
    ADD CONSTRAINT "cash_flow_predictions_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."communications"
    ADD CONSTRAINT "communications_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."communications"
    ADD CONSTRAINT "communications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_alerts"
    ADD CONSTRAINT "compliance_alerts_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."compliance_alerts"
    ADD CONSTRAINT "compliance_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_deadlines"
    ADD CONSTRAINT "compliance_deadlines_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "public"."regulatory_requirements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_deadlines"
    ADD CONSTRAINT "compliance_deadlines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_violations"
    ADD CONSTRAINT "compliance_violations_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "public"."compliance_alerts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conflict_checks"
    ADD CONSTRAINT "conflict_checks_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."conflict_checks"
    ADD CONSTRAINT "conflict_checks_check_approved_by_fkey" FOREIGN KEY ("check_approved_by") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."conflict_checks"
    ADD CONSTRAINT "conflict_checks_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id");



ALTER TABLE ONLY "public"."court_cases"
    ADD CONSTRAINT "court_cases_court_registry_id_fkey" FOREIGN KEY ("court_registry_id") REFERENCES "public"."court_registries"("id");



ALTER TABLE ONLY "public"."court_cases"
    ADD CONSTRAINT "court_cases_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."court_diary_entries"
    ADD CONSTRAINT "court_diary_entries_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."court_diary_entries"
    ADD CONSTRAINT "court_diary_entries_court_case_id_fkey" FOREIGN KEY ("court_case_id") REFERENCES "public"."court_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."court_integration_logs"
    ADD CONSTRAINT "court_integration_logs_court_registry_id_fkey" FOREIGN KEY ("court_registry_id") REFERENCES "public"."court_registries"("id");



ALTER TABLE ONLY "public"."cpd_tracking"
    ADD CONSTRAINT "cpd_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cpd_tracking"
    ADD CONSTRAINT "cpd_tracking_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."disbursements"
    ADD CONSTRAINT "disbursements_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."disbursements"
    ADD CONSTRAINT "disbursements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_analysis_queue"
    ADD CONSTRAINT "document_analysis_queue_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."document_analysis_queue"
    ADD CONSTRAINT "document_analysis_queue_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id");



ALTER TABLE ONLY "public"."document_analysis_queue"
    ADD CONSTRAINT "document_analysis_queue_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "public"."document_intelligence"("id");



ALTER TABLE ONLY "public"."document_intelligence"
    ADD CONSTRAINT "document_intelligence_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_parent_document_id_fkey" FOREIGN KEY ("parent_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."event_registrations"
    ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."learning_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_registrations"
    ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."factoring_applications"
    ADD CONSTRAINT "factoring_applications_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."factoring_applications"
    ADD CONSTRAINT "factoring_applications_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id");



ALTER TABLE ONLY "public"."factoring_applications"
    ADD CONSTRAINT "factoring_applications_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "public"."factoring_offers"("id");



ALTER TABLE ONLY "public"."fee_narrative_templates"
    ADD CONSTRAINT "fee_narrative_templates_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."fee_optimization_recommendations"
    ADD CONSTRAINT "fee_optimization_recommendations_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."fee_optimization_recommendations"
    ADD CONSTRAINT "fee_optimization_recommendations_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id");



ALTER TABLE ONLY "public"."generated_fee_narratives"
    ADD CONSTRAINT "generated_fee_narratives_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."generated_fee_narratives"
    ADD CONSTRAINT "generated_fee_narratives_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."generated_fee_narratives"
    ADD CONSTRAINT "generated_fee_narratives_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id");



ALTER TABLE ONLY "public"."generated_fee_narratives"
    ADD CONSTRAINT "generated_fee_narratives_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."fee_narrative_templates"("id");



ALTER TABLE ONLY "public"."integration_configs"
    ADD CONSTRAINT "integration_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."integration_metrics"
    ADD CONSTRAINT "integration_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_converted_to_invoice_id_fkey" FOREIGN KEY ("converted_to_invoice_id") REFERENCES "public"."invoices"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."judge_analytics"
    ADD CONSTRAINT "judge_analytics_judge_id_fkey" FOREIGN KEY ("judge_id") REFERENCES "public"."judges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."judges"
    ADD CONSTRAINT "judges_court_registry_id_fkey" FOREIGN KEY ("court_registry_id") REFERENCES "public"."court_registries"("id");



ALTER TABLE ONLY "public"."matter_services"
    ADD CONSTRAINT "matter_services_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matter_services"
    ADD CONSTRAINT "matter_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matter_templates"
    ADD CONSTRAINT "matter_templates_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matters"
    ADD CONSTRAINT "matters_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matters"
    ADD CONSTRAINT "matters_conflict_override_by_fkey" FOREIGN KEY ("conflict_override_by") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."matters"
    ADD CONSTRAINT "matters_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matters"
    ADD CONSTRAINT "matters_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."matter_templates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."meetings"
    ADD CONSTRAINT "meetings_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."meetings"
    ADD CONSTRAINT "meetings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_converted_to_matter_id_fkey" FOREIGN KEY ("converted_to_matter_id") REFERENCES "public"."matters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."overflow_briefs"
    ADD CONSTRAINT "overflow_briefs_accepted_by_advocate_id_fkey" FOREIGN KEY ("accepted_by_advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."overflow_briefs"
    ADD CONSTRAINT "overflow_briefs_posting_advocate_id_fkey" FOREIGN KEY ("posting_advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."password_history"
    ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."practice_financial_health"
    ADD CONSTRAINT "practice_financial_health_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."precedent_bank"
    ADD CONSTRAINT "precedent_bank_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."precedent_bank"
    ADD CONSTRAINT "precedent_bank_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id");



ALTER TABLE ONLY "public"."precedent_bank"
    ADD CONSTRAINT "precedent_bank_parent_precedent_id_fkey" FOREIGN KEY ("parent_precedent_id") REFERENCES "public"."precedent_bank"("id");



ALTER TABLE ONLY "public"."precedent_bank"
    ADD CONSTRAINT "precedent_bank_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."precedent_usage"
    ADD CONSTRAINT "precedent_usage_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."precedent_usage"
    ADD CONSTRAINT "precedent_usage_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id");



ALTER TABLE ONLY "public"."precedent_usage"
    ADD CONSTRAINT "precedent_usage_precedent_id_fkey" FOREIGN KEY ("precedent_id") REFERENCES "public"."precedent_bank"("id");



ALTER TABLE ONLY "public"."pro_forma_requests"
    ADD CONSTRAINT "pro_forma_requests_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pro_forma_requests"
    ADD CONSTRAINT "pro_forma_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."reconciliations"
    ADD CONSTRAINT "reconciliations_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reconciliations"
    ADD CONSTRAINT "reconciliations_trust_account_id_fkey" FOREIGN KEY ("trust_account_id") REFERENCES "public"."trust_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referral_relationships"
    ADD CONSTRAINT "referral_relationships_advocate_a_id_fkey" FOREIGN KEY ("advocate_a_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."referral_relationships"
    ADD CONSTRAINT "referral_relationships_advocate_b_id_fkey" FOREIGN KEY ("advocate_b_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referred_to_advocate_id_fkey" FOREIGN KEY ("referred_to_advocate_id") REFERENCES "public"."advocates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referring_advocate_id_fkey" FOREIGN KEY ("referring_advocate_id") REFERENCES "public"."advocates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."role_permissions_log"
    ADD CONSTRAINT "role_permissions_log_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions_log"
    ADD CONSTRAINT "role_permissions_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."success_fee_scenarios"
    ADD CONSTRAINT "success_fee_scenarios_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."success_fee_scenarios"
    ADD CONSTRAINT "success_fee_scenarios_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id");



ALTER TABLE ONLY "public"."template_shares"
    ADD CONSTRAINT "template_shares_shared_by_advocate_id_fkey" FOREIGN KEY ("shared_by_advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."template_shares"
    ADD CONSTRAINT "template_shares_shared_with_advocate_id_fkey" FOREIGN KEY ("shared_with_advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."template_shares"
    ADD CONSTRAINT "template_shares_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."matter_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trust_accounts"
    ADD CONSTRAINT "trust_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trust_transactions"
    ADD CONSTRAINT "trust_transactions_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trust_transactions"
    ADD CONSTRAINT "trust_transactions_trust_account_id_fkey" FOREIGN KEY ("trust_account_id") REFERENCES "public"."trust_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."voice_queries"
    ADD CONSTRAINT "voice_queries_advocate_id_fkey" FOREIGN KEY ("advocate_id") REFERENCES "public"."advocates"("id");



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage courses" ON "public"."courses" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Advocates can delete their matter expenses" ON "public"."expenses" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."matters"
  WHERE (("matters"."id" = "expenses"."matter_id") AND ("matters"."advocate_id" = "auth"."uid"())))));



CREATE POLICY "Advocates can delete their own pro_forma_requests" ON "public"."pro_forma_requests" FOR DELETE USING (("advocate_id" IN ( SELECT "advocates"."id"
   FROM "public"."advocates"
  WHERE ("advocates"."id" = "auth"."uid"()))));



CREATE POLICY "Advocates can delete their own profile" ON "public"."advocates" FOR DELETE USING ((("auth"."uid"())::"text" = ("id")::"text"));



CREATE POLICY "Advocates can insert expenses for their matters" ON "public"."expenses" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."matters"
  WHERE (("matters"."id" = "expenses"."matter_id") AND ("matters"."advocate_id" = "auth"."uid"())))));



CREATE POLICY "Advocates can insert pro_forma_requests" ON "public"."pro_forma_requests" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "advocates"."id"
   FROM "public"."advocates"
  WHERE ("advocates"."id" = "pro_forma_requests"."advocate_id"))));



CREATE POLICY "Advocates can read own advocates data" ON "public"."advocates" FOR SELECT USING (true);



CREATE POLICY "Advocates can select their own profile" ON "public"."advocates" FOR SELECT USING ((("auth"."uid"())::"text" = ("id")::"text"));



CREATE POLICY "Advocates can update their matter expenses" ON "public"."expenses" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."matters"
  WHERE (("matters"."id" = "expenses"."matter_id") AND ("matters"."advocate_id" = "auth"."uid"())))));



CREATE POLICY "Advocates can update their own pro_forma_requests" ON "public"."pro_forma_requests" FOR UPDATE USING (("advocate_id" IN ( SELECT "advocates"."id"
   FROM "public"."advocates"
  WHERE ("advocates"."id" = "auth"."uid"()))));



CREATE POLICY "Advocates can update their own profile" ON "public"."advocates" FOR UPDATE USING ((("auth"."uid"())::"text" = ("id")::"text")) WITH CHECK ((("auth"."uid"())::"text" = ("id")::"text"));



CREATE POLICY "Advocates can view their own matter expenses" ON "public"."expenses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."matters"
  WHERE (("matters"."id" = "expenses"."matter_id") AND ("matters"."advocate_id" = "auth"."uid"())))));



CREATE POLICY "Advocates can view their own pro_forma_requests" ON "public"."pro_forma_requests" FOR SELECT USING (("advocate_id" IN ( SELECT "advocates"."id"
   FROM "public"."advocates"
  WHERE ("advocates"."id" = "auth"."uid"()))));



CREATE POLICY "Advocates manage own applications" ON "public"."brief_applications" USING ((("auth"."uid"())::"text" = ("advocate_id")::"text"));



CREATE POLICY "Advocates manage own briefs" ON "public"."overflow_briefs" FOR INSERT WITH CHECK ((("auth"."uid"())::"text" = ("posting_advocate_id")::"text"));



CREATE POLICY "Advocates manage own factoring applications" ON "public"."factoring_applications" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Advocates manage own fee templates" ON "public"."fee_narrative_templates" USING ((("advocate_id" = "auth"."uid"()) OR ("is_public" = true)));



CREATE POLICY "Advocates manage own patterns" ON "public"."cash_flow_patterns" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Advocates manage own precedents" ON "public"."precedent_bank" FOR INSERT WITH CHECK (("contributor_id" = "auth"."uid"()));



CREATE POLICY "Advocates manage own profile" ON "public"."advocate_profiles" USING ((("auth"."uid"())::"text" = ("advocate_id")::"text"));



CREATE POLICY "Advocates manage own specialisations" ON "public"."advocate_specialisations" USING ((("auth"."uid"())::"text" = ("advocate_id")::"text"));



CREATE POLICY "Advocates manage own success fee scenarios" ON "public"."success_fee_scenarios" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Advocates see own analysis queue" ON "public"."document_analysis_queue" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Advocates see own cash flow" ON "public"."cash_flow_predictions" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Advocates see own document intelligence" ON "public"."document_intelligence" USING (("document_id" IN ( SELECT "documents"."id"
   FROM "public"."documents"
  WHERE ("documents"."advocate_id" = "auth"."uid"()))));



CREATE POLICY "Advocates see own fee optimizations" ON "public"."fee_optimization_recommendations" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Advocates see own financial health" ON "public"."practice_financial_health" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Advocates see own generated narratives" ON "public"."generated_fee_narratives" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Advocates track own usage" ON "public"."precedent_usage" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Advocates update own briefs" ON "public"."overflow_briefs" FOR UPDATE USING ((("auth"."uid"())::"text" = ("posting_advocate_id")::"text"));



CREATE POLICY "Advocates update own precedents" ON "public"."precedent_bank" FOR UPDATE USING (("contributor_id" = "auth"."uid"()));



CREATE POLICY "Advocates view available briefs" ON "public"."overflow_briefs" FOR SELECT USING ("public"."can_view_overflow_brief"("auth"."uid"(), "id"));



CREATE POLICY "Advocates view own conflict checks" ON "public"."conflict_checks" USING ((("auth"."uid"())::"text" = ("advocate_id")::"text"));



CREATE POLICY "Advocates view own referral relationships" ON "public"."referral_relationships" FOR SELECT USING (((("auth"."uid"())::"text" = ("advocate_a_id")::"text") OR (("auth"."uid"())::"text" = ("advocate_b_id")::"text")));



CREATE POLICY "All can view active factoring offers" ON "public"."factoring_offers" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view learning events" ON "public"."learning_events" FOR SELECT USING (true);



CREATE POLICY "Anyone can view published courses" ON "public"."courses" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Authenticated users can manage categories" ON "public"."template_categories" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Brief owners view applications" ON "public"."brief_applications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."overflow_briefs"
  WHERE (("overflow_briefs"."id" = "brief_applications"."brief_id") AND ("overflow_briefs"."posting_advocate_id" = "auth"."uid"())))));



CREATE POLICY "Court cases visible to matter advocates" ON "public"."court_cases" USING ((EXISTS ( SELECT 1
   FROM "public"."matters" "m"
  WHERE (("m"."id" = "court_cases"."matter_id") AND ("m"."advocate_id" = "auth"."uid"())))));



CREATE POLICY "Court diary visible to assigned advocate" ON "public"."court_diary_entries" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Court integration logs visible to authenticated users" ON "public"."court_integration_logs" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Court registries are visible to authenticated users" ON "public"."court_registries" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable full access for authenticated users" ON "public"."advocates" USING (("auth"."uid"() = "id"));



CREATE POLICY "Enable full access for own documents" ON "public"."documents" USING ((("auth"."uid"() IN ( SELECT "matters"."advocate_id"
   FROM "public"."matters"
  WHERE ("matters"."id" = "documents"."matter_id"))) OR ("auth"."uid"() = "advocate_id")));



CREATE POLICY "Enable full access for own invoices" ON "public"."invoices" USING ((("auth"."uid"() IN ( SELECT "matters"."advocate_id"
   FROM "public"."matters"
  WHERE ("matters"."id" = "invoices"."matter_id"))) OR ("auth"."uid"() = "advocate_id")));



CREATE POLICY "Enable full access for own matters" ON "public"."matters" USING (("auth"."uid"() = "advocate_id"));



CREATE POLICY "Enable full access for own notes" ON "public"."notes" USING ((("auth"."uid"() IN ( SELECT "matters"."advocate_id"
   FROM "public"."matters"
  WHERE ("matters"."id" = "notes"."matter_id"))) OR ("auth"."uid"() = "advocate_id")));



CREATE POLICY "Enable full access for own payments" ON "public"."payments" USING ((("auth"."uid"() IN ( SELECT "m"."advocate_id"
   FROM ("public"."invoices" "i"
     JOIN "public"."matters" "m" ON (("i"."matter_id" = "m"."id")))
  WHERE ("i"."id" = "payments"."invoice_id"))) OR ("auth"."uid"() = "advocate_id")));



CREATE POLICY "Enable full access for own time entries" ON "public"."time_entries" USING ((("auth"."uid"() IN ( SELECT "matters"."advocate_id"
   FROM "public"."matters"
  WHERE ("matters"."id" = "time_entries"."matter_id"))) OR ("auth"."uid"() = "advocate_id")));



CREATE POLICY "Enable insert for authenticated users" ON "public"."advocates" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Enable insert for own invoices" ON "public"."invoices" FOR INSERT WITH CHECK ((("auth"."uid"() IN ( SELECT "matters"."advocate_id"
   FROM "public"."matters"
  WHERE ("matters"."id" = "invoices"."matter_id"))) OR ("auth"."uid"() = "advocate_id")));



CREATE POLICY "Enable insert for own matters" ON "public"."matters" FOR INSERT WITH CHECK (("auth"."uid"() = "advocate_id"));



CREATE POLICY "Enable insert for own time entries" ON "public"."time_entries" FOR INSERT WITH CHECK ((("auth"."uid"() IN ( SELECT "matters"."advocate_id"
   FROM "public"."matters"
  WHERE ("matters"."id" = "time_entries"."matter_id"))) OR ("auth"."uid"() = "advocate_id")));



CREATE POLICY "Everyone can read template categories" ON "public"."template_categories" FOR SELECT USING (true);



CREATE POLICY "Judge analytics visible to authenticated users" ON "public"."judge_analytics" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Judges are visible to authenticated users" ON "public"."judges" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Language translations visible to authenticated users" ON "public"."language_translations" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Public can submit pending pro_forma_requests" ON "public"."pro_forma_requests" FOR UPDATE USING ((("status" = 'pending'::"public"."pro_forma_status") AND ("expires_at" > "now"()))) WITH CHECK (((("status" = 'submitted'::"public"."pro_forma_status") AND ("expires_at" > "now"())) OR (("status" = 'pending'::"public"."pro_forma_status") AND ("expires_at" > "now"()))));



CREATE POLICY "Public can view pro_forma_requests by token" ON "public"."pro_forma_requests" FOR SELECT USING (("expires_at" > "now"()));



CREATE POLICY "Public precedents viewable by all" ON "public"."precedent_bank" FOR SELECT USING (true);



CREATE POLICY "Public profiles viewable" ON "public"."advocate_profiles" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Service role can manage account_lockouts" ON "public"."account_lockouts" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage auth_attempts" ON "public"."auth_attempts" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage password_history" ON "public"."password_history" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "System can insert audit entries" ON "public"."audit_entries" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create their own CPD records" ON "public"."cpd_tracking" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own calendar events" ON "public"."calendar_events" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own communications" ON "public"."communications" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own disbursements" ON "public"."disbursements" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own integration configs" ON "public"."integration_configs" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own integrations" ON "public"."integrations" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own meetings" ON "public"."meetings" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own sessions" ON "public"."active_sessions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own preferences" ON "public"."user_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert reconciliations for their accounts" ON "public"."reconciliations" FOR INSERT WITH CHECK (("trust_account_id" IN ( SELECT "trust_accounts"."id"
   FROM "public"."trust_accounts"
  WHERE ("trust_accounts"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert their own API config" ON "public"."api_configurations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own calendar events" ON "public"."calendar_events" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own communications" ON "public"."communications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own compliance alerts" ON "public"."compliance_alerts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own compliance deadlines" ON "public"."compliance_deadlines" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own disbursements" ON "public"."disbursements" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own integration configs" ON "public"."integration_configs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own integration metrics" ON "public"."integration_metrics" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own integrations" ON "public"."integrations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own meetings" ON "public"."meetings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own webhook events" ON "public"."webhook_events" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert trust transactions for their accounts" ON "public"."trust_transactions" FOR INSERT WITH CHECK (("trust_account_id" IN ( SELECT "trust_accounts"."id"
   FROM "public"."trust_accounts"
  WHERE ("trust_accounts"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert violations for their alerts" ON "public"."compliance_violations" FOR INSERT WITH CHECK (("alert_id" IN ( SELECT "compliance_alerts"."id"
   FROM "public"."compliance_alerts"
  WHERE ("compliance_alerts"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage own opportunities" ON "public"."opportunities" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own template shares" ON "public"."template_shares" USING (("shared_by_advocate_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own templates" ON "public"."matter_templates" USING (("advocate_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own trust accounts" ON "public"."trust_accounts" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can register for events" ON "public"."event_registrations" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own preferences" ON "public"."user_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own API config" ON "public"."api_configurations" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own CPD records" ON "public"."cpd_tracking" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own calendar events" ON "public"."calendar_events" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own communications" ON "public"."communications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own compliance alerts" ON "public"."compliance_alerts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own compliance deadlines" ON "public"."compliance_deadlines" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own disbursements" ON "public"."disbursements" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own integration configs" ON "public"."integration_configs" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own integration metrics" ON "public"."integration_metrics" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own integrations" ON "public"."integrations" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own meetings" ON "public"."meetings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own progress" ON "public"."user_progress" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own progress records" ON "public"."user_progress" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own registrations" ON "public"."event_registrations" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update trust transactions for their accounts" ON "public"."trust_transactions" FOR UPDATE USING (("trust_account_id" IN ( SELECT "trust_accounts"."id"
   FROM "public"."trust_accounts"
  WHERE ("trust_accounts"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view own preferences" ON "public"."user_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view received shares" ON "public"."template_shares" FOR SELECT USING (("shared_with_advocate_id" = "auth"."uid"()));



CREATE POLICY "Users can view reconciliations for their accounts" ON "public"."reconciliations" FOR SELECT USING (("trust_account_id" IN ( SELECT "trust_accounts"."id"
   FROM "public"."trust_accounts"
  WHERE ("trust_accounts"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view shared templates" ON "public"."matter_templates" FOR SELECT USING ((("is_shared" = true) OR ("advocate_id" = "auth"."uid"()) OR ("id" IN ( SELECT "template_shares"."template_id"
   FROM "public"."template_shares"
  WHERE ("template_shares"."shared_with_advocate_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own API config" ON "public"."api_configurations" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own CPD records" ON "public"."cpd_tracking" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own audit entries" ON "public"."audit_entries" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own calendar events" ON "public"."calendar_events" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own communications" ON "public"."communications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own compliance alerts" ON "public"."compliance_alerts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own compliance deadlines" ON "public"."compliance_deadlines" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own disbursements" ON "public"."disbursements" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own integration configs" ON "public"."integration_configs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own integration metrics" ON "public"."integration_metrics" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own integrations" ON "public"."integrations" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own meetings" ON "public"."meetings" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own progress" ON "public"."user_progress" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own registrations" ON "public"."event_registrations" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own sessions" ON "public"."active_sessions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own webhook events" ON "public"."webhook_events" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view trust transactions for their accounts" ON "public"."trust_transactions" FOR SELECT USING (("trust_account_id" IN ( SELECT "trust_accounts"."id"
   FROM "public"."trust_accounts"
  WHERE ("trust_accounts"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view violations for their alerts" ON "public"."compliance_violations" FOR SELECT USING (("alert_id" IN ( SELECT "compliance_alerts"."id"
   FROM "public"."compliance_alerts"
  WHERE ("compliance_alerts"."user_id" = "auth"."uid"()))));



CREATE POLICY "Voice queries belong to advocate" ON "public"."voice_queries" USING (("advocate_id" = "auth"."uid"()));



ALTER TABLE "public"."account_lockouts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."active_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."advocate_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."advocate_specialisations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."advocates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brief_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calendar_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cash_flow_patterns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cash_flow_predictions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."communications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_deadlines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_violations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conflict_checks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."court_cases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."court_diary_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."court_integration_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."court_registries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpd_tracking" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."disbursements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_analysis_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_intelligence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."factoring_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."factoring_offers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fee_narrative_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fee_optimization_recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."generated_fee_narratives" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integration_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integration_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."judge_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."judges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."language_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."learning_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matter_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."meetings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."opportunities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."overflow_briefs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."password_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."practice_financial_health" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."precedent_bank" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."precedent_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pro_forma_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reconciliations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referral_relationships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."success_fee_scenarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."template_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."template_shares" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trust_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trust_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."voice_queries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_events" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."analyze_brief_document"("p_document_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."analyze_brief_document"("p_document_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."analyze_brief_document"("p_document_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_assign_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_assign_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_assign_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_compliance_score"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_compliance_score"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_compliance_score"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_due_date"("invoice_date" "date", "bar" "public"."bar_association") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_due_date"("invoice_date" "date", "bar" "public"."bar_association") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_due_date"("invoice_date" "date", "bar" "public"."bar_association") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_optimal_fee_structure"("p_matter_id" "uuid", "p_advocate_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_optimal_fee_structure"("p_matter_id" "uuid", "p_advocate_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_optimal_fee_structure"("p_matter_id" "uuid", "p_advocate_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_view_overflow_brief"("p_advocate_id" "uuid", "p_brief_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_view_overflow_brief"("p_advocate_id" "uuid", "p_brief_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_view_overflow_brief"("p_advocate_id" "uuid", "p_brief_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_account_lockout"("p_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_account_lockout"("p_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_account_lockout"("p_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_conflict"("p_advocate_id" "uuid", "p_client_name" character varying, "p_opposing_party" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."check_conflict"("p_advocate_id" "uuid", "p_client_name" character varying, "p_opposing_party" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_conflict"("p_advocate_id" "uuid", "p_client_name" character varying, "p_opposing_party" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_webhook_events"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_webhook_events"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_webhook_events"() TO "service_role";



GRANT ALL ON FUNCTION "public"."convert_opportunity_to_matter"("opportunity_uuid" "uuid", "matter_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."convert_opportunity_to_matter"("opportunity_uuid" "uuid", "matter_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."convert_opportunity_to_matter"("opportunity_uuid" "uuid", "matter_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_audit_entry"("p_user_id" "uuid", "p_entity_type" character varying, "p_entity_id" "uuid", "p_action_type" character varying, "p_description" "text", "p_before_state" "jsonb", "p_after_state" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_audit_entry"("p_user_id" "uuid", "p_entity_type" character varying, "p_entity_id" "uuid", "p_action_type" character varying, "p_description" "text", "p_before_state" "jsonb", "p_after_state" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_audit_entry"("p_user_id" "uuid", "p_entity_type" character varying, "p_entity_id" "uuid", "p_action_type" character varying, "p_description" "text", "p_before_state" "jsonb", "p_after_state" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_session"("p_user_id" "uuid", "p_session_token" "text", "p_device_fingerprint" "text", "p_ip_address" "text", "p_user_agent" "text", "p_duration_hours" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_session"("p_user_id" "uuid", "p_session_token" "text", "p_device_fingerprint" "text", "p_ip_address" "text", "p_user_agent" "text", "p_duration_hours" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_session"("p_user_id" "uuid", "p_session_token" "text", "p_device_fingerprint" "text", "p_ip_address" "text", "p_user_agent" "text", "p_duration_hours" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_preferences"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_preferences"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_preferences"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_compliance_deadlines"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_compliance_deadlines"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_compliance_deadlines"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_fee_narrative"("p_matter_id" "uuid", "p_time_entry_ids" "uuid"[], "p_template_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_fee_narrative"("p_matter_id" "uuid", "p_time_entry_ids" "uuid"[], "p_template_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_fee_narrative"("p_matter_id" "uuid", "p_time_entry_ids" "uuid"[], "p_template_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_advocate_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_advocate_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_advocate_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_judge_analytics"("p_judge_id" "uuid", "p_period_months" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_judge_analytics"("p_judge_id" "uuid", "p_period_months" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_judge_analytics"("p_judge_id" "uuid", "p_period_months" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_matters_with_health_indicators"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_matters_with_health_indicators"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_matters_with_health_indicators"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_opportunity_stats"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_opportunity_stats"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_opportunity_stats"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_practice_health_metrics"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_practice_health_metrics"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_practice_health_metrics"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_sessions"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_sessions"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_sessions"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_templates"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_templates"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_templates"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_template_usage"("template_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_template_usage"("template_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_template_usage"("template_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_role_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_role_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_role_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."predict_cash_flow"("p_advocate_id" "uuid", "p_months_ahead" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."predict_cash_flow"("p_advocate_id" "uuid", "p_months_ahead" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."predict_cash_flow"("p_advocate_id" "uuid", "p_months_ahead" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."process_voice_query"("p_advocate_id" "uuid", "p_query_text" "text", "p_language_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."process_voice_query"("p_advocate_id" "uuid", "p_query_text" "text", "p_language_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_voice_query"("p_advocate_id" "uuid", "p_query_text" "text", "p_language_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rate_precedent"("p_precedent_id" "uuid", "p_advocate_id" "uuid", "p_rating" integer, "p_review" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rate_precedent"("p_precedent_id" "uuid", "p_advocate_id" "uuid", "p_rating" integer, "p_review" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rate_precedent"("p_precedent_id" "uuid", "p_advocate_id" "uuid", "p_rating" integer, "p_review" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."record_auth_attempt"("p_email" "text", "p_attempt_type" "text", "p_success" boolean, "p_ip_address" "text", "p_user_agent" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."record_auth_attempt"("p_email" "text", "p_attempt_type" "text", "p_success" boolean, "p_ip_address" "text", "p_user_agent" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_auth_attempt"("p_email" "text", "p_attempt_type" "text", "p_success" boolean, "p_ip_address" "text", "p_user_agent" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."revoke_session"("p_session_token" "text", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."revoke_session"("p_session_token" "text", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."revoke_session"("p_session_token" "text", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."suggest_templates_for_matter"("user_id" "uuid", "matter_type_input" "text", "client_type_input" "text", "description_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."suggest_templates_for_matter"("user_id" "uuid", "matter_type_input" "text", "client_type_input" "text", "description_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."suggest_templates_for_matter"("user_id" "uuid", "matter_type_input" "text", "client_type_input" "text", "description_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_court_diary"("p_court_registry_id" "uuid", "p_advocate_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."sync_court_diary"("p_court_registry_id" "uuid", "p_advocate_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_court_diary"("p_court_registry_id" "uuid", "p_advocate_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_expenses_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_expenses_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_expenses_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_referral_relationship"("p_referring_advocate_id" "uuid", "p_referred_to_advocate_id" "uuid", "p_referral_value" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_referral_relationship"("p_referring_advocate_id" "uuid", "p_referred_to_advocate_id" "uuid", "p_referral_value" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_referral_relationship"("p_referring_advocate_id" "uuid", "p_referred_to_advocate_id" "uuid", "p_referral_value" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_session_activity"("p_session_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_session_activity"("p_session_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_session_activity"("p_session_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_trust_account_balance"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_trust_account_balance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_trust_account_balance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_preferences_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_preferences_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_preferences_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_password_strength"("p_password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_password_strength"("p_password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_password_strength"("p_password" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."account_lockouts" TO "anon";
GRANT ALL ON TABLE "public"."account_lockouts" TO "authenticated";
GRANT ALL ON TABLE "public"."account_lockouts" TO "service_role";



GRANT ALL ON TABLE "public"."matters" TO "anon";
GRANT ALL ON TABLE "public"."matters" TO "authenticated";
GRANT ALL ON TABLE "public"."matters" TO "service_role";



GRANT ALL ON TABLE "public"."active_matters" TO "anon";
GRANT ALL ON TABLE "public"."active_matters" TO "authenticated";
GRANT ALL ON TABLE "public"."active_matters" TO "service_role";



GRANT ALL ON TABLE "public"."active_sessions" TO "anon";
GRANT ALL ON TABLE "public"."active_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."active_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."advocate_profiles" TO "anon";
GRANT ALL ON TABLE "public"."advocate_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."advocate_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."advocates" TO "anon";
GRANT ALL ON TABLE "public"."advocates" TO "authenticated";
GRANT ALL ON TABLE "public"."advocates" TO "service_role";



GRANT ALL ON TABLE "public"."referral_relationships" TO "anon";
GRANT ALL ON TABLE "public"."referral_relationships" TO "authenticated";
GRANT ALL ON TABLE "public"."referral_relationships" TO "service_role";



GRANT ALL ON TABLE "public"."advocate_referral_stats" TO "anon";
GRANT ALL ON TABLE "public"."advocate_referral_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."advocate_referral_stats" TO "service_role";



GRANT ALL ON TABLE "public"."advocate_specialisations" TO "anon";
GRANT ALL ON TABLE "public"."advocate_specialisations" TO "authenticated";
GRANT ALL ON TABLE "public"."advocate_specialisations" TO "service_role";



GRANT ALL ON TABLE "public"."api_configurations" TO "anon";
GRANT ALL ON TABLE "public"."api_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."api_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."audit_entries" TO "anon";
GRANT ALL ON TABLE "public"."audit_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_entries" TO "service_role";



GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."auth_attempts" TO "anon";
GRANT ALL ON TABLE "public"."auth_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."available_overflow_briefs" TO "anon";
GRANT ALL ON TABLE "public"."available_overflow_briefs" TO "authenticated";
GRANT ALL ON TABLE "public"."available_overflow_briefs" TO "service_role";



GRANT ALL ON TABLE "public"."brief_applications" TO "anon";
GRANT ALL ON TABLE "public"."brief_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."brief_applications" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_events" TO "anon";
GRANT ALL ON TABLE "public"."calendar_events" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_events" TO "service_role";



GRANT ALL ON TABLE "public"."cash_flow_predictions" TO "anon";
GRANT ALL ON TABLE "public"."cash_flow_predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."cash_flow_predictions" TO "service_role";



GRANT ALL ON TABLE "public"."cash_flow_forecast" TO "anon";
GRANT ALL ON TABLE "public"."cash_flow_forecast" TO "authenticated";
GRANT ALL ON TABLE "public"."cash_flow_forecast" TO "service_role";



GRANT ALL ON TABLE "public"."cash_flow_patterns" TO "anon";
GRANT ALL ON TABLE "public"."cash_flow_patterns" TO "authenticated";
GRANT ALL ON TABLE "public"."cash_flow_patterns" TO "service_role";



GRANT ALL ON TABLE "public"."communications" TO "anon";
GRANT ALL ON TABLE "public"."communications" TO "authenticated";
GRANT ALL ON TABLE "public"."communications" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_alerts" TO "anon";
GRANT ALL ON TABLE "public"."compliance_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_deadlines" TO "anon";
GRANT ALL ON TABLE "public"."compliance_deadlines" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_deadlines" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_violations" TO "anon";
GRANT ALL ON TABLE "public"."compliance_violations" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_violations" TO "service_role";



GRANT ALL ON TABLE "public"."conflict_checks" TO "anon";
GRANT ALL ON TABLE "public"."conflict_checks" TO "authenticated";
GRANT ALL ON TABLE "public"."conflict_checks" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."court_cases" TO "anon";
GRANT ALL ON TABLE "public"."court_cases" TO "authenticated";
GRANT ALL ON TABLE "public"."court_cases" TO "service_role";



GRANT ALL ON TABLE "public"."court_diary_entries" TO "anon";
GRANT ALL ON TABLE "public"."court_diary_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."court_diary_entries" TO "service_role";



GRANT ALL ON TABLE "public"."court_integration_logs" TO "anon";
GRANT ALL ON TABLE "public"."court_integration_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."court_integration_logs" TO "service_role";



GRANT ALL ON TABLE "public"."court_registries" TO "anon";
GRANT ALL ON TABLE "public"."court_registries" TO "authenticated";
GRANT ALL ON TABLE "public"."court_registries" TO "service_role";



GRANT ALL ON TABLE "public"."cpd_tracking" TO "anon";
GRANT ALL ON TABLE "public"."cpd_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."cpd_tracking" TO "service_role";



GRANT ALL ON TABLE "public"."disbursements" TO "anon";
GRANT ALL ON TABLE "public"."disbursements" TO "authenticated";
GRANT ALL ON TABLE "public"."disbursements" TO "service_role";



GRANT ALL ON TABLE "public"."document_analysis_queue" TO "anon";
GRANT ALL ON TABLE "public"."document_analysis_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."document_analysis_queue" TO "service_role";



GRANT ALL ON TABLE "public"."document_intelligence" TO "anon";
GRANT ALL ON TABLE "public"."document_intelligence" TO "authenticated";
GRANT ALL ON TABLE "public"."document_intelligence" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."event_registrations" TO "anon";
GRANT ALL ON TABLE "public"."event_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."event_registrations" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."factoring_applications" TO "anon";
GRANT ALL ON TABLE "public"."factoring_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."factoring_applications" TO "service_role";



GRANT ALL ON TABLE "public"."factoring_marketplace" TO "anon";
GRANT ALL ON TABLE "public"."factoring_marketplace" TO "authenticated";
GRANT ALL ON TABLE "public"."factoring_marketplace" TO "service_role";



GRANT ALL ON TABLE "public"."factoring_offers" TO "anon";
GRANT ALL ON TABLE "public"."factoring_offers" TO "authenticated";
GRANT ALL ON TABLE "public"."factoring_offers" TO "service_role";



GRANT ALL ON TABLE "public"."fee_narrative_performance" TO "anon";
GRANT ALL ON TABLE "public"."fee_narrative_performance" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_narrative_performance" TO "service_role";



GRANT ALL ON TABLE "public"."fee_narrative_templates" TO "anon";
GRANT ALL ON TABLE "public"."fee_narrative_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_narrative_templates" TO "service_role";



GRANT ALL ON TABLE "public"."fee_optimization_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."fee_optimization_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_optimization_recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."generated_fee_narratives" TO "anon";
GRANT ALL ON TABLE "public"."generated_fee_narratives" TO "authenticated";
GRANT ALL ON TABLE "public"."generated_fee_narratives" TO "service_role";



GRANT ALL ON TABLE "public"."integration_configs" TO "anon";
GRANT ALL ON TABLE "public"."integration_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_configs" TO "service_role";



GRANT ALL ON TABLE "public"."integration_metrics" TO "anon";
GRANT ALL ON TABLE "public"."integration_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."integrations" TO "anon";
GRANT ALL ON TABLE "public"."integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."integrations" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."judge_analytics" TO "anon";
GRANT ALL ON TABLE "public"."judge_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."judge_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."judges" TO "anon";
GRANT ALL ON TABLE "public"."judges" TO "authenticated";
GRANT ALL ON TABLE "public"."judges" TO "service_role";



GRANT ALL ON TABLE "public"."language_translations" TO "anon";
GRANT ALL ON TABLE "public"."language_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."language_translations" TO "service_role";



GRANT ALL ON TABLE "public"."learning_events" TO "anon";
GRANT ALL ON TABLE "public"."learning_events" TO "authenticated";
GRANT ALL ON TABLE "public"."learning_events" TO "service_role";



GRANT ALL ON TABLE "public"."matter_services" TO "anon";
GRANT ALL ON TABLE "public"."matter_services" TO "authenticated";
GRANT ALL ON TABLE "public"."matter_services" TO "service_role";



GRANT ALL ON TABLE "public"."matter_templates" TO "anon";
GRANT ALL ON TABLE "public"."matter_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."matter_templates" TO "service_role";



GRANT ALL ON TABLE "public"."meetings" TO "anon";
GRANT ALL ON TABLE "public"."meetings" TO "authenticated";
GRANT ALL ON TABLE "public"."meetings" TO "service_role";



GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";



GRANT ALL ON TABLE "public"."opportunities" TO "anon";
GRANT ALL ON TABLE "public"."opportunities" TO "authenticated";
GRANT ALL ON TABLE "public"."opportunities" TO "service_role";



GRANT ALL ON TABLE "public"."overdue_invoices" TO "anon";
GRANT ALL ON TABLE "public"."overdue_invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."overdue_invoices" TO "service_role";



GRANT ALL ON TABLE "public"."overflow_briefs" TO "anon";
GRANT ALL ON TABLE "public"."overflow_briefs" TO "authenticated";
GRANT ALL ON TABLE "public"."overflow_briefs" TO "service_role";



GRANT ALL ON TABLE "public"."password_history" TO "anon";
GRANT ALL ON TABLE "public"."password_history" TO "authenticated";
GRANT ALL ON TABLE "public"."password_history" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."popular_precedents" TO "anon";
GRANT ALL ON TABLE "public"."popular_precedents" TO "authenticated";
GRANT ALL ON TABLE "public"."popular_precedents" TO "service_role";



GRANT ALL ON TABLE "public"."practice_financial_health" TO "anon";
GRANT ALL ON TABLE "public"."practice_financial_health" TO "authenticated";
GRANT ALL ON TABLE "public"."practice_financial_health" TO "service_role";



GRANT ALL ON TABLE "public"."precedent_bank" TO "anon";
GRANT ALL ON TABLE "public"."precedent_bank" TO "authenticated";
GRANT ALL ON TABLE "public"."precedent_bank" TO "service_role";



GRANT ALL ON TABLE "public"."precedent_usage" TO "anon";
GRANT ALL ON TABLE "public"."precedent_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."precedent_usage" TO "service_role";



GRANT ALL ON TABLE "public"."pro_forma_requests" TO "anon";
GRANT ALL ON TABLE "public"."pro_forma_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."pro_forma_requests" TO "service_role";



GRANT ALL ON TABLE "public"."reconciliations" TO "anon";
GRANT ALL ON TABLE "public"."reconciliations" TO "authenticated";
GRANT ALL ON TABLE "public"."reconciliations" TO "service_role";



GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";



GRANT ALL ON TABLE "public"."regulatory_requirements" TO "anon";
GRANT ALL ON TABLE "public"."regulatory_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."regulatory_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions_log" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions_log" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions_log" TO "service_role";



GRANT ALL ON TABLE "public"."service_categories" TO "anon";
GRANT ALL ON TABLE "public"."service_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."service_categories" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."success_fee_scenarios" TO "anon";
GRANT ALL ON TABLE "public"."success_fee_scenarios" TO "authenticated";
GRANT ALL ON TABLE "public"."success_fee_scenarios" TO "service_role";



GRANT ALL ON TABLE "public"."template_categories" TO "anon";
GRANT ALL ON TABLE "public"."template_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."template_categories" TO "service_role";



GRANT ALL ON TABLE "public"."template_shares" TO "anon";
GRANT ALL ON TABLE "public"."template_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."template_shares" TO "service_role";



GRANT ALL ON TABLE "public"."time_entries" TO "anon";
GRANT ALL ON TABLE "public"."time_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."time_entries" TO "service_role";



GRANT ALL ON TABLE "public"."trust_accounts" TO "anon";
GRANT ALL ON TABLE "public"."trust_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."trust_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."trust_transactions" TO "anon";
GRANT ALL ON TABLE "public"."trust_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."trust_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."unbilled_time" TO "anon";
GRANT ALL ON TABLE "public"."unbilled_time" TO "authenticated";
GRANT ALL ON TABLE "public"."unbilled_time" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_progress" TO "service_role";



GRANT ALL ON TABLE "public"."voice_queries" TO "anon";
GRANT ALL ON TABLE "public"."voice_queries" TO "authenticated";
GRANT ALL ON TABLE "public"."voice_queries" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_events" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























\unrestrict OIXCtAJP9oG0CPWtMkaJcU9RZ0CkhrCcZGYjkUhQFSeheCdhfnL4ESWxkRVntyR

RESET ALL;
