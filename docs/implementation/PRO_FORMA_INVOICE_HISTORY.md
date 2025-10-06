# Pro Forma Invoice History & Tracking

## Overview
This document describes the implementation of pro forma invoice generation and history tracking for requests submitted through the public pro forma request form.

## Problem
Previously, pro forma invoices generated from public requests were created as temporary mock objects that weren't saved to the database. This meant:
- No history or audit trail of generated pro formas
- No way to track which requests had invoices generated
- No ability to view or resend previously generated pro formas

## Solution

### 1. Database Schema Changes

#### Migration: `20251006000000_allow_null_matter_id_for_proforma.sql`
- Made `matter_id` nullable in the `invoices` table
- Added constraint to ensure either `matter_id` exists OR invoice is marked as pro forma
- Allows pro forma invoices to be saved without an associated matter

#### Migration: `20251006010000_add_proforma_invoice_views.sql`
- Created `pro_forma_invoices_with_requests` view
- Combines pro forma invoices with their originating request details
- Added indexes for faster querying

### 2. Service Layer Changes

#### `InvoiceService.generateProFormaForTempMatter()`
Now saves pro forma invoices to the database with:
- `matter_id`: `null` (no associated matter yet)
- `internal_notes`: `pro_forma_request:{requestId}` (links to original request)
- All standard invoice fields populated from request data
- Automatically marks the request as 'processed'

#### New Methods Added

**`InvoiceService.getProFormaInvoiceHistory(advocateId)`**
- Retrieves all pro forma invoices for an advocate
- Filters by `internal_notes LIKE 'pro_forma%'`
- Returns invoices sorted by creation date (newest first)

**`InvoiceService.getProFormaInvoicesByRequest(requestId)`**
- Retrieves all pro forma invoices for a specific request
- Useful for checking if a request already has an invoice
- Supports multiple invoices per request (if regenerated)

### 3. Data Flow

```
1. Attorney submits pro forma request via public form
   ↓
2. Request saved to `pro_forma_requests` table
   ↓
3. Advocate views pending requests in dashboard
   ↓
4. Advocate clicks "Generate Pro Forma"
   ↓
5. Invoice generated and saved to `invoices` table with:
   - matter_id = null
   - internal_notes = "pro_forma_request:{requestId}"
   ↓
6. Request status updated to 'processed'
   ↓
7. Invoice appears in advocate's invoice list
   ↓
8. Invoice can be viewed, downloaded, emailed, or converted to final invoice
```

### 4. Benefits

#### For Advocates
- **Complete History**: All generated pro formas are tracked
- **Audit Trail**: Can see when pro formas were generated and sent
- **Reusability**: Can resend or regenerate pro formas as needed
- **Conversion**: Can convert pro forma to final invoice when matter is accepted

#### For the System
- **Data Integrity**: All invoices stored in single table
- **Reporting**: Can generate reports on pro forma vs final invoices
- **Analytics**: Track conversion rates from pro forma to final invoice
- **Compliance**: Maintains proper records for accounting/auditing

### 5. Usage Examples

#### Retrieve Pro Forma History
```typescript
import { InvoiceService } from '@/services/api/invoices.service';

// Get all pro forma invoices for current advocate
const proFormas = await InvoiceService.getProFormaInvoiceHistory(user.id);

// Get pro formas for specific request
const requestInvoices = await InvoiceService.getProFormaInvoicesByRequest(requestId);
```

#### Check if Request Has Invoice
```typescript
const existingInvoices = await InvoiceService.getProFormaInvoicesByRequest(requestId);
if (existingInvoices.length > 0) {
  // Request already has a pro forma invoice
  console.log('Last generated:', existingInvoices[0].created_at);
}
```

#### Query Pro Forma View
```sql
-- Get all pro forma invoices with request details
SELECT * FROM pro_forma_invoices_with_requests
WHERE advocate_id = 'advocate-uuid'
ORDER BY created_at DESC;

-- Get pro formas for specific attorney firm
SELECT * FROM pro_forma_invoices_with_requests
WHERE instructing_attorney_firm = 'Smith & Associates'
ORDER BY created_at DESC;
```

### 6. Future Enhancements

1. **Convert to Final Invoice**: Add ability to convert pro forma to final invoice when matter is accepted
2. **Pro Forma Expiry**: Track expiry dates and mark expired pro formas
3. **Version Control**: Track multiple versions if pro forma is regenerated
4. **Email Integration**: Automatically email pro forma to instructing attorney
5. **Analytics Dashboard**: Show conversion rates and pro forma statistics

## Database Schema

### invoices Table (Updated)
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  matter_id UUID NULL,  -- Nullable for pro forma invoices
  advocate_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  internal_notes TEXT,  -- Format: "pro_forma_request:{uuid}" for pro formas
  -- ... other fields
  CONSTRAINT invoices_matter_or_proforma_check 
  CHECK (matter_id IS NOT NULL OR internal_notes LIKE 'pro_forma%')
);
```

### pro_forma_invoices_with_requests View
```sql
CREATE VIEW pro_forma_invoices_with_requests AS
SELECT 
  i.*,
  pfr.instructing_attorney_name,
  pfr.instructing_attorney_firm,
  pfr.matter_description
FROM invoices i
LEFT JOIN pro_forma_requests pfr ON 
  SUBSTRING(i.internal_notes FROM 'pro_forma_request:(.*)$')::UUID = pfr.id
WHERE i.internal_notes LIKE 'pro_forma%';
```

## Testing

### Manual Testing Steps
1. Submit a pro forma request via public form
2. View pending requests in advocate dashboard
3. Generate pro forma invoice
4. Verify invoice appears in invoice list
5. Verify request status is 'processed'
6. Check that invoice has `matter_id = null`
7. Verify `internal_notes` contains request ID
8. Query pro forma history and confirm invoice appears

### SQL Verification
```sql
-- Check pro forma invoices
SELECT id, invoice_number, matter_id, internal_notes, created_at
FROM invoices
WHERE internal_notes LIKE 'pro_forma%'
ORDER BY created_at DESC;

-- Check processed requests
SELECT id, matter_title, status, processed_at
FROM pro_forma_requests
WHERE status = 'processed'
ORDER BY processed_at DESC;
```

## Migration Instructions

1. Run migrations in order:
   ```bash
   # Make matter_id nullable
   supabase migration up 20251006000000_allow_null_matter_id_for_proforma
   
   # Create views and indexes
   supabase migration up 20251006010000_add_proforma_invoice_views
   ```

2. Deploy updated service code

3. Test with a sample pro forma request

4. Verify data appears correctly in database

## Notes
- Pro forma invoices are marked with `internal_notes` starting with "pro_forma"
- The format `pro_forma_request:{uuid}` links invoice to original request
- `matter_id` is null until/unless the pro forma is converted to a final invoice
- Request status is automatically updated to 'processed' when invoice is generated
