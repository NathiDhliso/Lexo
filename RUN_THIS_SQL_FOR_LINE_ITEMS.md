# Fix Pro Forma Line Items - Quick Guide

## 🔴 Problem
Pro forma shows "No line items available" even though total is correct (R14,030).

## ✅ Solution
Run the SQL migration to create the `invoice_line_items` table.

---

## 📋 Step-by-Step Instructions

### **Step 1: Run SQL Migration**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/xfmvvxhvjqwpqpxqvkqp
2. **Navigate to**: SQL Editor (left sidebar)
3. **Click**: "New Query"
4. **Open file**: `supabase/migrations/20251010000000_add_invoice_line_items.sql`
5. **Copy all contents** and paste into SQL Editor
6. **Click**: "Run" or press `Ctrl+Enter`

### **Step 2: Verify Installation**

Run this query to verify the table was created:

```sql
SELECT COUNT(*) FROM invoice_line_items;
```

You should see: `0` (table exists but is empty)

---

## 📊 What This Fixes

### **Before:**
- ❌ No line items table
- ❌ Services stored as text in `fee_narrative`
- ❌ PDF shows "No line items available"
- ✅ Total amount works (R14,030)

### **After:**
- ✅ Line items table created
- ✅ Structured data storage
- ✅ PDF will show itemized services
- ✅ Total amount works (R14,030)

---

## 🎯 What Gets Created

### **Table: `invoice_line_items`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| invoice_id | UUID | Links to invoice/proforma |
| description | TEXT | Service name |
| quantity | DECIMAL | Hours or quantity |
| unit_price | DECIMAL | Rate per hour/unit |
| amount | DECIMAL | Total (quantity × unit_price) |
| service_category | VARCHAR | Category (consultation, research, etc.) |
| rate_card_id | UUID | Reference to rate card |
| sort_order | INTEGER | Display order |

### **Example Data:**

```
description: "Cape Bar - Commercial Advisory"
quantity: 2.0
unit_price: 4000.00
amount: 8000.00
service_category: "consultation"
```

---

## 🔧 Future Enhancement Needed

After running the SQL, the system needs one more update:

### **Update ProFormaCreationModal to create line items**

When attorney selects services, the system should:
1. Generate fee narrative (already works)
2. **Create line items** (needs to be added)
3. Store total amount (already works)

This requires updating the `handleSubmit` function to include line items in the submission.

---

## ✅ Current Status

### **Working:**
- ✅ Attorney sees only YOUR 3 active rate cards
- ✅ Service selection works
- ✅ Total calculation correct (R14,030)
- ✅ Fee narrative generated

### **Fixed by SQL:**
- ✅ Line items table created
- ✅ RLS policies configured
- ✅ Indexes for performance

### **Still Needs:**
- ⏳ Frontend to create line items when proforma generated
- ⏳ PDF to display line items from table

---

## 🚀 Quick Test

After running the SQL:

1. Attorney selects services
2. Creates proforma
3. Check database:
```sql
SELECT * FROM invoice_line_items 
WHERE invoice_id = 'your-invoice-id';
```

You should see line items for each selected service.

---

## 📞 Support

If you encounter any issues:
1. Check Supabase logs for errors
2. Verify RLS policies are enabled
3. Confirm advocate is authenticated

---

*Priority: High - Needed for proper PDF display*
*Estimated Time: 2 minutes to run SQL*
