# Pro Forma Line Items Fix

## 🔴 Problem Identified

The proforma shows **"No line items available"** and **Total: R14,030** because:

1. **No line items table exists** in the database
2. **Services are stored as text** in `fee_narrative` field
3. **PDF expects structured line items** but finds none
4. **Total amount is calculated** but not broken down

---

## ✅ What's Working

1. ✅ **Attorney sees only YOUR 3 active rate cards** (fixed)
2. ✅ **Service selection works** - attorney can select services
3. ✅ **Total calculation works** - R14,030 is correct
4. ✅ **Fee narrative generated** - text description created

---

## 🔧 What Needs to Be Fixed

### **Option 1: Create Line Items Table** (Recommended)

**Pros:**
- Structured data
- Can itemize on PDF
- Can track individual services
- Better reporting

**Implementation:**
```sql
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  service_category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Then update proforma service to create line items when services are selected.**

### **Option 2: Parse Fee Narrative** (Quick Fix)

**Pros:**
- No database changes
- Works with existing data
- Quick to implement

**Implementation:**
- Parse the `fee_narrative` text
- Extract service names and amounts
- Display as line items on PDF

---

## 🎯 Recommended Solution

**Use Option 1** - Create proper line items table because:
- Better data structure
- Easier to maintain
- Supports future features (time tracking, adjustments)
- Professional invoicing standard

---

## 📋 Implementation Steps

1. **Create migration** for `invoice_line_items` table
2. **Update proforma service** to create line items when services selected
3. **Update PDF service** to use line items
4. **Test** with attorney service selection

---

## 💡 Quick Workaround (Immediate)

For now, the PDF can parse the fee_narrative:

```typescript
// In PDF service
const parseLineItems = (feeNarrative: string) => {
  const lines = feeNarrative.split('\n');
  const items = [];
  
  lines.forEach(line => {
    // Match pattern: • Service Name (R1,200/hr × 2h = R2,400)
    const match = line.match(/• (.+?) \(R([\d,]+).*?= R([\d,]+)\)/);
    if (match) {
      items.push({
        description: match[1],
        amount: parseFloat(match[3].replace(/,/g, ''))
      });
    }
  });
  
  return items;
};
```

This will display line items on the PDF even without a database table.

---

## 🚀 Status

- ✅ **Attorney rate card selection** - FIXED
- ⏳ **Line items display** - NEEDS FIX
- ✅ **Total calculation** - WORKING
- ✅ **Fee narrative** - WORKING

---

*Priority: Medium - Proforma works but needs better presentation*
