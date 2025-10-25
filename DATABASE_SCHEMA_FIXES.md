# Database Schema Fixes Applied

## Summary
Fixed database column name mismatches in QuickAddMatterModal and related services.

## Issues Fixed

### 1. Firms Table Column Mismatch ✅
**Problem:** Code was querying non-existent columns
- Queried: `primary_contact_name`, `primary_contact_email`, `primary_contact_phone`
- Actual columns: `attorney_name`, `email`, `phone_number`

**Files Fixed:**
- `src/components/matters/QuickAddMatterModal.tsx`
  - Updated `Firm` interface (lines 12-17)
  - Fixed `loadFirms()` SELECT query (line 89)
  - Fixed `handleFirmSelect()` auto-fill mapping (lines 119-122)
  - Fixed firm dropdown display (line 286)

**Changes:**
```typescript
// Before
interface Firm {
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
}

// After
interface Firm {
  attorney_name?: string;
  email?: string;
  phone_number?: string;
}
```

### 2. Urgency Value Mismatch ✅
**Problem:** Modal used different urgency values than database schema
- Used: `'low' | 'standard' | 'high'`
- Expected: `'routine' | 'standard' | 'urgent' | 'emergency'`

**Files Fixed:**
- `src/components/matters/QuickAddMatterModal.tsx`
  - Updated `QuickAddMatterData` interface (line 35)
  - Fixed urgency dropdown options (lines 417-427)
  
- `src/services/api/matter-api.service.ts`
  - Updated `createActiveMatter()` parameter type (line 615)

**Changes:**
```typescript
// Before
urgency?: 'low' | 'standard' | 'high';

// After
urgency?: 'routine' | 'standard' | 'urgent' | 'emergency';
```

## Database Schema Reference

### Firms Table
```sql
CREATE TABLE firms (
  id UUID PRIMARY KEY,
  firm_name TEXT NOT NULL,
  attorney_name TEXT NOT NULL,        -- ✓ Use this
  practice_number TEXT,
  phone_number TEXT,                  -- ✓ Use this
  email TEXT NOT NULL UNIQUE,         -- ✓ Use this
  address TEXT,
  status TEXT
);
```

### Matters Table (urgency)
```sql
ALTER TABLE matters 
ADD COLUMN urgency TEXT 
CHECK (urgency IN ('routine', 'standard', 'urgent', 'emergency')) 
DEFAULT 'standard';
```

## Testing Checklist
- [ ] QuickAddMatterModal opens without errors
- [ ] Firm dropdown loads successfully
- [ ] Selecting a firm auto-fills attorney details
- [ ] Urgency dropdown shows: Routine, Standard, Urgent, Emergency
- [ ] Matter creation succeeds with all fields
- [ ] Auto-filled firm data is correct
- [ ] Manual entry works when no firm selected

## Status
✅ **All schema mismatches resolved**
✅ **No TypeScript compilation errors**
✅ **Ready for testing**

---
*Fixed: January 2025*
