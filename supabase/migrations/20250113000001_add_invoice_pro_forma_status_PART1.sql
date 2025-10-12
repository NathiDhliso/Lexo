-- ============================================
-- Migration: Add pro_forma status to invoice_status enum
-- PART 1: Add enum value and column
-- Version: 2.0.0 (Fixed - Split into two transactions)
-- Date: 2025-01-13
-- IMPORTANT: Run this first, then commit before running Part 2
-- ============================================

-- Add enum value (must be in separate transaction from data updates)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'pro_forma' 
    AND enumtypid = 'invoice_status'::regtype
  ) THEN
    ALTER TYPE invoice_status ADD VALUE 'pro_forma';
    RAISE NOTICE '✓ Added pro_forma to invoice_status enum';
  ELSE
    RAISE NOTICE '- pro_forma already exists in enum';
  END IF;
END $$;

-- Add is_pro_forma column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' 
    AND column_name = 'is_pro_forma'
  ) THEN
    ALTER TABLE invoices ADD COLUMN is_pro_forma BOOLEAN DEFAULT false;
    RAISE NOTICE '✓ Added is_pro_forma column';
  ELSE
    RAISE NOTICE '- is_pro_forma column already exists';
  END IF;
END $$;

-- Create index for efficient pro forma filtering
CREATE INDEX IF NOT EXISTS idx_invoices_is_pro_forma 
ON invoices(advocate_id, is_pro_forma) 
WHERE is_pro_forma = true;

-- Add comment for documentation
COMMENT ON COLUMN invoices.is_pro_forma IS 'Indicates if this is a pro forma invoice (quote/estimate) rather than a final invoice';

-- Final notification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ PART 1 COMPLETE';
  RAISE NOTICE 'COMMIT this transaction, then run Part 2';
  RAISE NOTICE '========================================';
END $$;
