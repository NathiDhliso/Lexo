# Dual-Path Matter Workflow Specification

## Overview

Advocates now have **TWO workflow options** when receiving a new matter request:

### **Path A: Detailed Pro Forma Work** (Existing)
For complex matters requiring detailed estimates and tracking

### **Path B: Traditional Brief Fee Work** (NEW)
For simple brief work with flat fees (court appearances, consultations, opinions)

---

## Path A: Detailed Pro Forma Work (Existing) ✅

### Flow:
```
"New Request" 
  ↓
Send Pro Forma → "Awaiting Approval"
  ↓
  ├→ Attorney Approves → "Active" → WIP Tracking → Invoice
  └→ Attorney Declines → "Declined" (archived)
```

### When to Use:
- Complex litigation matters
- Long-term engagements
- Matters requiring detailed time tracking
- Uncertain scope requiring estimate approval

### Steps:
1. Review new request
2. Click "Send Pro Forma"
3. Build detailed estimate with services
4. Send to attorney for approval
5. Wait for approval
6. Track WIP (time, expenses, services)
7. Generate final invoice

---

## Path B: Traditional Brief Fee Work (NEW) 🆕

### Flow:
```
"New Request"
  ↓
Accept Brief → "Active" (immediately)
  ↓
Do the work
  ↓
Simple Fee Entry → Generate Fee Note → Done
```

### When to Use:
- Court appearances
- Consultations
- Legal opinions
- Brief reviews
- Simple advisory work
- Fixed-fee matters

### Steps:
1. Review new request
2. Click "Accept Brief" (skips pro forma entirely)
3. Matter status → "Active" immediately
4. Do the work
5. Click "Simple Fee Entry"
6. Enter: "Brief fee: R15,000" or "Consultation: R5,000"
7. Add disbursements if any
8. Generate fee note
9. Send to attorney
10. Done!

---

## UI Changes Required

### 1. NewRequestCard Component

**Add "Accept Brief" Button:**
```tsx
<div className="flex gap-2">
  {/* Path A: Detailed Work */}
  <Button
    variant="primary"
    onClick={() => onSendProForma?.(matter)}
    className="flex-1"
  >
    Send Pro Forma
  </Button>
  
  {/* Path B: Simple Brief Work - NEW */}
  <Button
    variant="success"
    onClick={() => onAcceptBrief?.(matter)}
    className="flex-1"
  >
    Accept Brief
  </Button>
</div>
```

### 2. New Modal: AcceptBriefModal

**Purpose:** Confirm immediate acceptance without pro forma

```tsx
interface AcceptBriefModalProps {
  isOpen: boolean;
  matter: Matter | null;
  onConfirm: (matterId: string) => void;
  onClose: () => void;
}
```

**Content:**
- Explain this skips pro forma
- Confirm advocate will do work immediately
- Set matter to "Active" status
- Show "Simple Fee Entry" will be available

### 3. MatterWorkbenchPage Enhancement

**Add "Simple Fee Entry" Button:**

When matter is in "Active" status and has no WIP entries:

```tsx
<Button
  variant="primary"
  onClick={() => setShowSimpleFeeModal(true)}
>
  Simple Fee Entry
</Button>
```

### 4. New Modal: SimpleFeeEntryModal

**Purpose:** Quick fee entry without detailed WIP tracking

**Fields:**
- Fee Description (e.g., "Brief fee", "Consultation", "Opinion")
- Amount (R)
- Disbursements (optional)
  - Description
  - Amount
- Notes (optional)

**Action:**
- Creates single WIP entry with fee
- Marks matter as "Ready for Invoicing"
- Generates fee note PDF

---

## Database Changes

### No Schema Changes Required! ✅

The existing schema supports both paths:

**Path A:** Uses detailed WIP entries (time_entries, expenses, logged_services)
**Path B:** Uses single WIP entry with total fee

### Matter Status Flow:

```sql
-- Path A
NEW_REQUEST → AWAITING_APPROVAL → ACTIVE → READY_FOR_INVOICING → INVOICED

-- Path B (NEW)
NEW_REQUEST → ACTIVE → READY_FOR_INVOICING → INVOICED
```

---

## API Changes Required

### 1. New Endpoint: Accept Brief

```typescript
// POST /api/matters/:id/accept-brief
async acceptBrief(matterId: string): Promise<Matter> {
  // Update matter status to ACTIVE
  // Skip pro forma stage
  // Notify attorney of acceptance
  // Return updated matter
}
```

### 2. New Endpoint: Simple Fee Entry

```typescript
// POST /api/matters/:id/simple-fee
interface SimpleFeeRequest {
  description: string;
  amount: number;
  disbursements?: Array<{
    description: string;
    amount: number;
  }>;
  notes?: string;
}

async createSimpleFee(
  matterId: string, 
  data: SimpleFeeRequest
): Promise<Matter> {
  // Create single WIP entry
  // Mark matter as READY_FOR_INVOICING
  // Generate fee note PDF
  // Return updated matter
}
```

---

## User Experience

### Advocate's Decision Point

When viewing a new request, advocate sees:

```
┌─────────────────────────────────────────────┐
│ 🆕 Contract Dispute - Acme Corp            │
│ From: Wilson & Partners • Sarah Wilson     │
├─────────────────────────────────────────────┤
│ Description: Need opinion on contract...   │
├─────────────────────────────────────────────┤
│ Choose your workflow:                       │
│                                             │
│ ┌──────────────┐  ┌──────────────┐        │
│ │ Send Pro     │  │ Accept Brief │        │
│ │ Forma        │  │              │        │
│ │              │  │ Skip estimate│        │
│ │ For detailed │  │ Quick start  │        │
│ │ work         │  │              │        │
│ └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────┘
```

### Path B: Simple Fee Entry Screen

```
┌─────────────────────────────────────────────┐
│ Simple Fee Entry                            │
├─────────────────────────────────────────────┤
│ Matter: Contract Dispute - Acme Corp        │
│                                             │
│ Fee Description: *                          │
│ [Brief fee for court appearance          ] │
│                                             │
│ Amount: *                                   │
│ [R 15,000                                 ] │
│                                             │
│ Disbursements (Optional):                  │
│ ┌─────────────────────────────────────────┐│
│ │ + Add Disbursement                      ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Notes:                                      │
│ [Additional notes...                      ] │
│                                             │
│ [Cancel]  [Generate Fee Note]              │
└─────────────────────────────────────────────┘
```

---

## Benefits

### For Advocates:
- ✅ Flexibility to choose workflow based on matter type
- ✅ Faster turnaround for simple brief work
- ✅ No unnecessary pro forma for fixed-fee work
- ✅ Still have detailed tracking option when needed

### For Attorneys:
- ✅ Faster acceptance for urgent brief work
- ✅ Clear fee notes for simple matters
- ✅ Detailed estimates when complexity requires it

---

## Implementation Priority

### Phase 1: Core Functionality (2-3 hours)
1. Add "Accept Brief" button to NewRequestCard
2. Create AcceptBriefModal component
3. Implement acceptBrief API endpoint
4. Update matter status flow

### Phase 2: Simple Fee Entry (2-3 hours)
5. Add "Simple Fee Entry" button to MatterWorkbenchPage
6. Create SimpleFeeEntryModal component
7. Implement createSimpleFee API endpoint
8. Generate fee note PDF

### Phase 3: Polish (1-2 hours)
9. Add tooltips explaining each path
10. Update documentation
11. Add analytics tracking
12. Test both workflows end-to-end

**Total Estimated Time: 5-8 hours**

---

## Success Metrics

- ✅ Advocates can accept briefs in < 30 seconds
- ✅ Simple fee entry takes < 2 minutes
- ✅ 40%+ of matters use Path B (brief work)
- ✅ 60%+ of matters use Path A (detailed work)
- ✅ Zero confusion about which path to use

---

## Documentation Updates

### User Guide Section:
**"Choosing Your Workflow: Pro Forma vs. Brief Fee"**

**When to Send Pro Forma (Path A):**
- Complex litigation
- Uncertain scope
- Long-term matters
- Need attorney approval before starting

**When to Accept Brief (Path B):**
- Court appearances
- Consultations
- Legal opinions
- Fixed-fee work
- Urgent matters

---

**Status:** Ready for Implementation
**Priority:** HIGH (improves advocate workflow significantly)
**Complexity:** MEDIUM (straightforward additions to existing system)
