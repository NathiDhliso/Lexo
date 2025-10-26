# Design Document: Pre-Launch Financial Features

## Overview

This design document outlines the technical architecture and implementation approach for five critical pre-launch features that address financial tracking, SARS compliance, and operational efficiency for South African legal practice management. These features build upon the existing invoice and matter management systems while introducing new capabilities for partial payments, disbursements, sequential invoice numbering, an enhanced dashboard, and comprehensive matter search/archiving.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Dashboard    │  Matters   │  Invoices  │  Settings        │
│  Components   │  Components│  Components│  Components      │
└────────┬──────────────┬──────────────┬──────────────┬──────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Payment      │  Disbursement │  Invoice   │  Matter       │
│  Service      │  Service      │  Service   │  Service      │
└────────┬──────────────┬──────────────┬──────────────┬──────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│  payments     │  disbursements│  invoices  │  matters      │
│  invoice_     │  invoice_     │  audit_log │  matter_      │
│  settings     │  numbering    │            │  search_index │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Partial Payments Flow**
   - User records payment → Payment Service validates → Create payment record → Update invoice balance → Recalculate status → Update reports

2. **Disbursements Flow**
   - User logs disbursement → Disbursement Service validates → Create disbursement record → Update matter WIP → Include in invoice generation

3. **Invoice Numbering Flow**
   - Generate invoice → Invoice Service requests next number → Sequence generator provides number → Mark as used → Create invoice with number

4. **Dashboard Flow**
   - User loads dashboard → Dashboard Service fetches metrics → Aggregate data from multiple sources → Cache results → Display with real-time updates

5. **Matter Search Flow**
   - User searches → Search Service queries indexed data → Filter and sort results → Return paginated matches → Update search analytics

## Components and Interfaces

### 1. Partial Payments System

#### Database Schema

```sql
-- Extend existing payments table (already exists)
-- Add new columns if not present:
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'full';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS allocated_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255);

-- Extend invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS outstanding_balance DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid';
-- payment_status: 'unpaid', 'partially_paid', 'paid', 'overpaid'

-- Create payment history view
CREATE OR REPLACE VIEW invoice_payment_history AS
SELECT 
  i.id as invoice_id,
  i.invoice_number,
  i.total_amount,
  i.amount_paid,
  i.outstanding_balance,
  i.payment_status,
  p.id as payment_id,
  p.amount as payment_amount,
  p.payment_date,
  p.payment_method,
  p.reference_number,
  p.notes
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
ORDER BY i.created_at DESC, p.payment_date DESC;
```

#### TypeScript Interfaces

```typescript
// Extend existing Invoice type
interface Invoice {
  // ... existing fields
  amount_paid: number;
  outstanding_balance: number;
  payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';
}

interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  created_by: string;
}

interface PaymentCreate {
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}

interface PaymentHistory {
  invoice_id: string;
  invoice_number: string;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  payments: Payment[];
}
```

#### Service Layer

```typescript
class PaymentService {
  // Record a new payment
  async recordPayment(data: PaymentCreate): Promise<Payment> {
    // 1. Validate payment amount
    // 2. Get current invoice
    // 3. Check outstanding balance
    // 4. Create payment record
    // 5. Update invoice amount_paid
    // 6. Recalculate outstanding_balance
    // 7. Update payment_status
    // 8. Create audit log entry
    // 9. Trigger notifications if fully paid
  }

  // Get payment history for an invoice
  async getPaymentHistory(invoiceId: string): Promise<PaymentHistory> {
    // Query invoice_payment_history view
  }

  // Edit a payment (with audit trail)
  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment> {
    // 1. Get existing payment
    // 2. Create audit log of changes
    // 3. Update payment
    // 4. Recalculate invoice balances
    // 5. Update payment_status
  }

  // Delete a payment (soft delete with audit)
  async deletePayment(paymentId: string, reason: string): Promise<void> {
    // 1. Mark payment as deleted
    // 2. Create audit log
    // 3. Recalculate invoice balances
    // 4. Update payment_status
  }
}
```

#### UI Components

**RecordPaymentModal.tsx**
```typescript
interface RecordPaymentModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Features:
// - Display invoice details and outstanding balance
// - Payment amount input with validation
// - Payment date picker (defaults to today)
// - Payment method dropdown
// - Optional reference number
// - Optional notes
// - Real-time calculation of remaining balance
// - Warning if amount exceeds outstanding balance
```

**PaymentHistoryTable.tsx**
```typescript
interface PaymentHistoryTableProps {
  invoiceId: string;
}

// Features:
// - Display all payments for an invoice
// - Show date, amount, method, reference
// - Running balance calculation
// - Edit/delete actions with confirmation
// - Export to CSV
```

### 2. Disbursements System

#### Database Schema

```sql
-- Create disbursements table
CREATE TABLE IF NOT EXISTS disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  advocate_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date_incurred DATE NOT NULL,
  vat_applicable BOOLEAN DEFAULT true,
  vat_amount DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN vat_applicable THEN amount * 0.15 ELSE 0 END
  ) STORED,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (
    amount + CASE WHEN vat_applicable THEN amount * 0.15 ELSE 0 END
  ) STORED,
  receipt_link TEXT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  is_billed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_disbursements_matter ON disbursements(matter_id);
CREATE INDEX idx_disbursements_invoice ON disbursements(invoice_id);
CREATE INDEX idx_disbursements_unbilled ON disbursements(is_billed) WHERE is_billed = false;

-- Update matter WIP calculation to include disbursements
CREATE OR REPLACE FUNCTION calculate_matter_wip_with_disbursements(matter_id_param UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(
    (SELECT SUM(amount) FROM logged_services WHERE matter_id = matter_id_param AND invoice_id IS NULL),
    0
  ) + COALESCE(
    (SELECT SUM(total_amount) FROM disbursements WHERE matter_id = matter_id_param AND is_billed = false),
    0
  );
$$ LANGUAGE SQL;
```

#### TypeScript Interfaces

```typescript
interface Disbursement {
  id: string;
  matter_id: string;
  advocate_id: string;
  description: string;
  amount: number;
  date_incurred: string;
  vat_applicable: boolean;
  vat_amount: number;
  total_amount: number;
  receipt_link?: string;
  invoice_id?: string;
  is_billed: boolean;
  created_at: string;
  updated_at: string;
}

interface DisbursementCreate {
  matter_id: string;
  description: string;
  amount: number;
  date_incurred: string;
  vat_applicable?: boolean;
  receipt_link?: string;
}

interface DisbursementSummary {
  matter_id: string;
  total_disbursements: number;
  unbilled_disbursements: number;
  billed_disbursements: number;
  count: number;
}
```

#### Service Layer

```typescript
class DisbursementService {
  async createDisbursement(data: DisbursementCreate): Promise<Disbursement> {
    // 1. Validate data
    // 2. Create disbursement record
    // 3. Update matter WIP value
    // 4. Create audit log
  }

  async getDisbursementsByMatter(matterId: string): Promise<Disbursement[]> {
    // Get all disbursements for a matter
  }

  async getUnbilledDisbursements(matterId: string): Promise<Disbursement[]> {
    // Get disbursements not yet included in an invoice
  }

  async updateDisbursement(id: string, updates: Partial<Disbursement>): Promise<Disbursement> {
    // Update with audit trail
  }

  async deleteDisbursement(id: string): Promise<void> {
    // Soft delete with audit trail
  }

  async markAsBilled(disbursementIds: string[], invoiceId: string): Promise<void> {
    // Mark disbursements as billed when included in invoice
  }
}
```

#### UI Components

**LogDisbursementModal.tsx**
```typescript
interface LogDisbursementModalProps {
  matterId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Features:
// - Description input (required)
// - Amount input (required, positive numbers only)
// - Date picker (defaults to today)
// - VAT applicable toggle (defaults to Yes)
// - Real-time VAT calculation display
// - Receipt link input (optional)
// - Save and add another option
```

**DisbursementsTable.tsx**
```typescript
interface DisbursementsTableProps {
  matterId: string;
  showBilled?: boolean;
}

// Features:
// - List all disbursements for a matter
// - Filter by billed/unbilled
// - Show description, amount, VAT, total
// - Edit/delete actions
// - Bulk select for invoice generation
// - Export to CSV
```

### 3. Invoice Numbering & VAT Compliance

#### Database Schema

```sql
-- Create invoice settings table
CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL UNIQUE REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  invoice_number_format VARCHAR(50) DEFAULT 'INV-YYYY-NNN',
  invoice_sequence_current INTEGER DEFAULT 0,
  invoice_sequence_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  credit_note_format VARCHAR(50) DEFAULT 'CN-YYYY-NNN',
  credit_note_sequence_current INTEGER DEFAULT 0,
  credit_note_sequence_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  vat_registered BOOLEAN DEFAULT false,
  vat_number VARCHAR(50),
  vat_rate DECIMAL(5,4) DEFAULT 0.15,
  advocate_full_name VARCHAR(255),
  advocate_address TEXT,
  advocate_phone VARCHAR(50),
  advocate_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create invoice numbering audit table
CREATE TABLE IF NOT EXISTS invoice_numbering_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  number_type VARCHAR(20) NOT NULL, -- 'invoice' or 'credit_note'
  status VARCHAR(20) NOT NULL, -- 'used', 'voided'
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  void_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoice_numbering_audit_advocate ON invoice_numbering_audit(advocate_id);
CREATE INDEX idx_invoice_numbering_audit_number ON invoice_numbering_audit(invoice_number);

-- Create function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_next_invoice_number(advocate_id_param UUID)
RETURNS VARCHAR AS $$
DECLARE
  settings RECORD;
  current_year INTEGER;
  next_sequence INTEGER;
  invoice_number VARCHAR(50);
BEGIN
  -- Get settings
  SELECT * INTO settings FROM invoice_settings WHERE advocate_id = advocate_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice settings not found for advocate';
  END IF;
  
  current_year := EXTRACT(YEAR FROM NOW());
  
  -- Reset sequence if year changed
  IF settings.invoice_sequence_year != current_year THEN
    UPDATE invoice_settings 
    SET invoice_sequence_current = 0,
        invoice_sequence_year = current_year
    WHERE advocate_id = advocate_id_param;
    next_sequence := 1;
  ELSE
    next_sequence := settings.invoice_sequence_current + 1;
  END IF;
  
  -- Generate number based on format
  invoice_number := REPLACE(settings.invoice_number_format, 'YYYY', current_year::TEXT);
  invoice_number := REPLACE(invoice_number, 'NNN', LPAD(next_sequence::TEXT, 3, '0'));
  
  -- Update sequence
  UPDATE invoice_settings 
  SET invoice_sequence_current = next_sequence,
      updated_at = NOW()
  WHERE advocate_id = advocate_id_param;
  
  -- Log in audit table
  INSERT INTO invoice_numbering_audit (advocate_id, invoice_number, number_type, status)
  VALUES (advocate_id_param, invoice_number, 'invoice', 'used');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;
```

#### TypeScript Interfaces

```typescript
interface InvoiceSettings {
  id: string;
  advocate_id: string;
  invoice_number_format: string;
  invoice_sequence_current: number;
  invoice_sequence_year: number;
  credit_note_format: string;
  credit_note_sequence_current: number;
  credit_note_sequence_year: number;
  vat_registered: boolean;
  vat_number?: string;
  vat_rate: number;
  advocate_full_name?: string;
  advocate_address?: string;
  advocate_phone?: string;
  advocate_email?: string;
  created_at: string;
  updated_at: string;
}

interface InvoiceNumberingAudit {
  id: string;
  advocate_id: string;
  invoice_number: string;
  number_type: 'invoice' | 'credit_note';
  status: 'used' | 'voided';
  invoice_id?: string;
  void_reason?: string;
  created_at: string;
}

interface VATInvoiceData {
  // Required for SARS compliance
  invoice_number: string;
  invoice_date: string;
  supplier_name: string;
  supplier_vat_number: string;
  supplier_address: string;
  supplier_contact: string;
  customer_name: string;
  customer_address?: string;
  customer_vat_number?: string;
  line_items: Array<{
    description: string;
    amount: number;
  }>;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
}
```

#### Service Layer

```typescript
class InvoiceNumberingService {
  async getSettings(advocateId: string): Promise<InvoiceSettings> {
    // Get or create default settings
  }

  async updateSettings(advocateId: string, updates: Partial<InvoiceSettings>): Promise<InvoiceSettings> {
    // Update settings with validation
  }

  async generateNextInvoiceNumber(advocateId: string): Promise<string> {
    // Call database function to generate next number
  }

  async voidInvoiceNumber(invoiceNumber: string, reason: string): Promise<void> {
    // Mark number as voided in audit log
  }

  async getNumberingAudit(advocateId: string): Promise<InvoiceNumberingAudit[]> {
    // Get audit trail for compliance
  }

  async validateVATCompliance(invoice: Invoice): Promise<{valid: boolean; errors: string[]}> {
    // Validate invoice meets SARS requirements
  }
}
```

#### UI Components

**InvoiceSettingsForm.tsx**
```typescript
interface InvoiceSettingsFormProps {
  advocateId: string;
}

// Features:
// - Invoice number format selector
// - Credit note format selector
// - Current sequence display (read-only)
// - VAT registration toggle
// - VAT number input (if registered)
// - VAT rate input (defaults to 15%)
// - Advocate details for tax invoices
// - Preview of next invoice number
// - Audit log viewer
```

### 4. Enhanced Dashboard

#### Data Aggregation Strategy

```typescript
interface DashboardMetrics {
  urgent_attention: {
    deadlines_today: Matter[];
    overdue_invoices_45plus: Invoice[];
    pending_proforma_5plus: ProFormaRequest[];
  };
  this_week_deadlines: Matter[];
  financial_snapshot: {
    outstanding_fees: number;
    outstanding_fees_count: number;
    wip_value: number;
    wip_matters_count: number;
    month_invoiced: number;
  };
  active_matters: Array<{
    matter: Matter;
    completion_percentage: number;
    last_activity: string;
    is_stale: boolean;
  }>;
  pending_actions: {
    new_requests: number;
    proforma_approvals: number;
    scope_amendments: number;
    ready_to_invoice: number;
  };
  quick_stats: {
    matters_completed_30d: number;
    invoiced_30d: number;
    payments_received_30d: number;
    avg_time_to_invoice: number;
  };
}
```

#### Service Layer

```typescript
class DashboardService {
  async getMetrics(advocateId: string): Promise<DashboardMetrics> {
    // Aggregate data from multiple sources
    // Cache results for 5 minutes
  }

  async getUrgentAttention(advocateId: string): Promise<DashboardMetrics['urgent_attention']> {
    // Get items requiring immediate attention
  }

  async getFinancialSnapshot(advocateId: string): Promise<DashboardMetrics['financial_snapshot']> {
    // Calculate financial metrics
  }

  async getActiveMattersWithProgress(advocateId: string): Promise<DashboardMetrics['active_matters']> {
    // Get active matters with completion calculations
  }

  async getPendingActions(advocateId: string): Promise<DashboardMetrics['pending_actions']> {
    // Count pending actions across system
  }

  async getQuickStats(advocateId: string): Promise<DashboardMetrics['quick_stats']> {
    // Calculate 30-day statistics
  }
}
```

#### UI Components

**DashboardPage.tsx** (Enhanced)
```typescript
// Sections:
// 1. Urgent Attention (red/orange alerts)
// 2. This Week's Deadlines
// 3. Financial Snapshot (3 cards)
// 4. Active Matters (top 5 with progress bars)
// 5. Pending Actions (4 counts with links)
// 6. Quick Stats (30-day metrics)
```

### 5. Matter Search & Archiving

#### Database Schema

```sql
-- Add search and archive columns to matters
ALTER TABLE matters ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE matters ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE matters ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE matters ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES user_profiles(user_id);

-- Create full-text search index
CREATE INDEX idx_matters_search ON matters USING GIN(search_vector);
CREATE INDEX idx_matters_archived ON matters(is_archived);

-- Create trigger to update search vector
CREATE OR REPLACE FUNCTION update_matter_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.client_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.instructing_attorney, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.matter_description, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER matter_search_vector_update
BEFORE INSERT OR UPDATE ON matters
FOR EACH ROW EXECUTE FUNCTION update_matter_search_vector();

-- Create matter search function
CREATE OR REPLACE FUNCTION search_matters(
  advocate_id_param UUID,
  search_query TEXT,
  include_archived BOOLEAN DEFAULT false,
  practice_area_filter TEXT DEFAULT NULL,
  status_filter TEXT[] DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  client_name TEXT,
  status VARCHAR,
  wip_value DECIMAL,
  created_at TIMESTAMP,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.client_name,
    m.status,
    m.wip_value,
    m.created_at,
    ts_rank(m.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM matters m
  WHERE m.advocate_id = advocate_id_param
    AND (include_archived OR m.is_archived = false)
    AND (search_query IS NULL OR m.search_vector @@ plainto_tsquery('english', search_query))
    AND (practice_area_filter IS NULL OR m.practice_area = practice_area_filter)
    AND (status_filter IS NULL OR m.status = ANY(status_filter))
    AND (date_from IS NULL OR m.created_at >= date_from)
    AND (date_to IS NULL OR m.created_at <= date_to)
  ORDER BY rank DESC, m.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

#### TypeScript Interfaces

```typescript
interface MatterSearchParams {
  query?: string;
  include_archived?: boolean;
  practice_area?: string;
  matter_type?: string;
  status?: MatterStatus[];
  date_from?: string;
  date_to?: string;
  fee_min?: number;
  fee_max?: number;
  attorney_firm?: string;
  sort_by?: 'deadline' | 'created_at' | 'total_fee' | 'last_activity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

interface MatterSearchResult {
  matters: Matter[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface MatterArchiveAction {
  matter_id: string;
  reason?: string;
}
```

#### Service Layer

```typescript
class MatterSearchService {
  async search(advocateId: string, params: MatterSearchParams): Promise<MatterSearchResult> {
    // Execute search with filters
    // Apply pagination
    // Return results with metadata
  }

  async archiveMatter(matterId: string, advocateId: string, reason?: string): Promise<void> {
    // Set is_archived = true
    // Set archived_at = now
    // Set archived_by = advocateId
    // Create audit log
  }

  async unarchiveMatter(matterId: string): Promise<void> {
    // Set is_archived = false
    // Clear archived_at and archived_by
    // Create audit log
  }

  async getArchivedMatters(advocateId: string): Promise<Matter[]> {
    // Get all archived matters
  }
}
```

#### UI Components

**MatterSearchBar.tsx**
```typescript
interface MatterSearchBarProps {
  onSearch: (query: string) => void;
  onAdvancedFilters: () => void;
}

// Features:
// - Real-time search as you type
// - Search icon and clear button
// - Advanced filters button
```

**AdvancedFiltersModal.tsx**
```typescript
interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: MatterSearchParams) => void;
  currentFilters: MatterSearchParams;
}

// Features:
// - Practice area dropdown
// - Matter type dropdown
// - Status multi-select
// - Date range picker
// - Attorney firm dropdown
// - Fee range inputs
// - Sort options
// - Include archived checkbox
// - Clear all filters button
```

## Error Handling

### Validation Errors
- Payment amount validation (positive, not exceeding outstanding balance)
- Disbursement amount validation (positive numbers only)
- Invoice number format validation
- Search query sanitization

### Business Logic Errors
- Prevent duplicate invoice numbers
- Prevent payment deletion if invoice is closed
- Prevent archiving matters with active work
- Prevent VAT number changes if invoices exist

### User Feedback
- Toast notifications for success/error
- Inline validation messages
- Confirmation dialogs for destructive actions
- Loading states for async operations

## Testing Strategy

### Unit Tests
- Payment calculation logic
- Invoice number generation
- Search query parsing
- VAT compliance validation

### Integration Tests
- Payment recording flow
- Disbursement to invoice flow
- Invoice generation with sequential numbering
- Dashboard metrics aggregation
- Matter search with filters

### E2E Tests
- Record partial payment and verify balance update
- Log disbursement and include in invoice
- Generate invoice with correct sequential number
- Search matters and apply filters
- Archive matter and verify it's hidden from default view

## Performance Considerations

### Database Optimization
- Index on invoice payment_status for quick filtering
- Index on disbursements is_billed for WIP calculations
- Full-text search index on matters
- Materialized view for dashboard metrics (refresh every 5 minutes)

### Caching Strategy
- Cache dashboard metrics for 5 minutes
- Cache invoice settings per user session
- Cache search results for 1 minute

### Query Optimization
- Use database functions for complex calculations
- Batch queries where possible
- Implement pagination for large result sets
- Use SELECT only required columns

## Security Considerations

### Access Control
- Verify user owns invoice before recording payment
- Verify user owns matter before logging disbursement
- Verify user owns matter before archiving
- RLS policies on all new tables

### Audit Trail
- Log all payment modifications
- Log all disbursement changes
- Log invoice number generation
- Log matter archive/unarchive actions

### Data Validation
- Sanitize search queries to prevent SQL injection
- Validate payment amounts server-side
- Validate VAT numbers format
- Validate invoice number format

## Migration Strategy

### Phase 1: Database Changes
1. Create new tables (disbursements, invoice_settings, invoice_numbering_audit)
2. Add new columns to existing tables
3. Create indexes and functions
4. Migrate existing data if needed

### Phase 2: Service Layer
1. Implement PaymentService
2. Implement DisbursementService
3. Implement InvoiceNumberingService
4. Implement DashboardService enhancements
5. Implement MatterSearchService

### Phase 3: UI Components
1. Build payment recording UI
2. Build disbursement logging UI
3. Build invoice settings UI
4. Enhance dashboard UI
5. Build advanced search UI

### Phase 4: Testing & Rollout
1. Unit and integration tests
2. E2E tests
3. User acceptance testing
4. Gradual rollout with feature flags
5. Monitor and fix issues

## Deployment Checklist

- [ ] Database migrations tested on staging
- [ ] All services have unit tests
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] User training materials prepared
- [ ] Rollback plan documented
- [ ] Monitoring and alerts configured
- [ ] SARS compliance verified

## Success Metrics

- Partial payments: 90%+ of invoices with multiple payments tracked accurately
- Disbursements: 100% of disbursements included in invoices
- Invoice numbering: 0 gaps in sequence, 100% SARS compliant
- Dashboard: <2 second load time, 95%+ user satisfaction
- Search: <1 second response time, 90%+ relevant results

## Future Enhancements

- Automated payment reminders based on aging
- Bulk disbursement import from CSV
- Custom invoice number formats per client
- Dashboard widgets customization
- Saved search filters
- Matter templates for common case types
- Integration with accounting software (Xero, Sage)
- Mobile app for on-the-go updates
