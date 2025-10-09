# Invoice Page Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  INVOICES                                                       │
│  Manage your invoices and payment tracking                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┬────────────┬──────────────┬─────────────────┐   │
│  │ Invoices │ Pro Forma  │ Time Entries │ Payment Tracking│   │
│  └──────────┴────────────┴──────────────┴─────────────────┘   │
│                                                                 │
│  [Active Tab Content Displayed Here]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Tab 1: Invoices

```
┌─────────────────────────────────────────────────────────────────┐
│  [+ Generate Invoice]                                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │ Total Value  │ Paid Amount  │   Overdue    │                │
│  │  R 150,000   │  R 100,000   │  3 invoices  │                │
│  └──────────────┴──────────────┴──────────────┘                │
├─────────────────────────────────────────────────────────────────┤
│  Search: [___________]  Status: [All ▼] Bar: [All ▼]           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ INV-2025-001          [Paid]           R 25,000.00      │   │
│  │ Smith vs ABC Insurance                                  │   │
│  │ Date: 15 Jan 2025 • Due: 15 Mar 2025                   │   │
│  │ [View] [Download] [Send]                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ INV-2025-002          [Sent]           R 18,500.00      │   │
│  │ Johnson Property Dispute                                │   │
│  │ Date: 20 Jan 2025 • Due: 20 Mar 2025                   │   │
│  │ [View] [Download] [Record Payment]                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Tab 2: Pro Forma (NEW)

```
┌─────────────────────────────────────────────────────────────────┐
│  [+ New Pro Forma Request]                                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐  │
│  │Total Requests│     Sent     │   Accepted   │Total Value  │  │
│  │      12      │       8      │       5      │  R 450,000  │  │
│  └──────────────┴──────────────┴──────────────┴─────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Filter: [All] [Draft] [Sent] [Accepted] [Declined]            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Accepted]                              R 35,000.00     │   │
│  │ John Doe • Smith & Associates                           │   │
│  │ Motor vehicle accident claim                            │   │
│  │ Created: 10 Jan 2025 • Sent: 12 Jan 2025               │   │
│  │ [Convert to Matter →] [View Details]                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Sent]                                  R 28,000.00     │   │
│  │ Jane Smith • Legal Partners Inc                         │   │
│  │ Contract dispute matter                                 │   │
│  │ Created: 15 Jan 2025 • Expires: 22 Jan 2025            │   │
│  │ [View Details]                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Tab 3: Time Entries (NEW)

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │Unbilled Hours│Unbilled Amt  │Matters w/Time│                │
│  │    45.5      │  R 91,000    │      8       │                │
│  └──────────────┴──────────────┴──────────────┘                │
├─────────────────────────────────────────────────────────────────┤
│  Search: [___________]  Filter: [Unbilled] [Billed] [All]      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Smith vs ABC Insurance                  R 25,000.00     │   │
│  │ John Smith                                              │   │
│  │ 12.5 hours • 8 entries                                  │   │
│  │ [Generate Invoice →]                                    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ○ 15 Jan 2025 • 2.5 hours              R 5,000.00      │   │
│  │   Client consultation and case review                   │   │
│  │   @ R 2,000/hr                                          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ○ 18 Jan 2025 • 3.0 hours              R 6,000.00      │   │
│  │   Document preparation and filing                       │   │
│  │   @ R 2,000/hr                                          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ✓ 20 Jan 2025 • 4.0 hours   [Billed]   R 8,000.00     │   │
│  │   Court appearance                                      │   │
│  │   @ R 2,000/hr                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Johnson Property Dispute                R 18,500.00     │   │
│  │ Sarah Johnson                                           │   │
│  │ 9.25 hours • 5 entries                                  │   │
│  │ [Generate Invoice →]                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Invoice Generation Wizard (Launched from any tab)

```
┌─────────────────────────────────────────────────────────────────┐
│  Generate Invoice                                         [×]   │
│  Smith vs ABC Insurance • John Smith                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ● Select Items → ○ Configure → ○ Review                  │ │
│  └───────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1: SELECT ITEMS                                           │
│                                                                 │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │ Time Entries │   Expenses   │ Rate Cards   │                │
│  │  8 selected  │  2 selected  │   Enabled    │                │
│  └──────────────┴──────────────┴──────────────┘                │
│                                                                 │
│  Billable Time Entries          Search: [_______]              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ 15 Jan 2025 • 2.5 hours              R 5,000.00      │   │
│  │   Client consultation and case review                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ 18 Jan 2025 • 3.0 hours              R 6,000.00      │   │
│  │   Document preparation                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Expenses & Disbursements       [+ Add Expense]                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ Court filing fee                     R 500.00        │   │
│  │   Court Fees • 15 Jan 2025                              │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Step 1 of 3                    [Previous] [Next →]            │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow Diagrams

### Pro Forma to Invoice Flow

```
┌──────────────┐
│ Create Pro   │
│ Forma        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Generate     │
│ Link         │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Send to      │
│ Attorney     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Attorney     │
│ Accepts      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Convert to   │
│ Matter       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Add Time     │
│ Entries      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Generate     │
│ Invoice      │
└──────────────┘
```

### Time Entry to Invoice Flow

```
┌──────────────┐
│ Add Time     │
│ Entries      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ View in      │
│ Time Entries │
│ Tab          │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Group by     │
│ Matter       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Click        │
│ Generate     │
│ Invoice      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Wizard Opens │
│ with Matter  │
│ & Time       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Configure &  │
│ Generate     │
└──────────────┘
```

### Traditional Invoice Flow

```
┌──────────────┐
│ Click        │
│ Generate     │
│ Invoice      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Select       │
│ Matter       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Select Time  │
│ Entries      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Add          │
│ Expenses     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Configure    │
│ Settings     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Review &     │
│ Generate     │
└──────────────┘
```

## Navigation Map

```
                    ┌─────────────────┐
                    │  Invoices Page  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼─────┐      ┌─────▼──────┐     ┌─────▼──────┐
    │ Invoices │      │ Pro Forma  │     │Time Entries│
    │   Tab    │      │    Tab     │     │    Tab     │
    └────┬─────┘      └─────┬──────┘     └─────┬──────┘
         │                  │                   │
         │                  │                   │
         └──────────────────┼───────────────────┘
                            │
                     ┌──────▼───────┐
                     │   Invoice    │
                     │  Generation  │
                     │   Wizard     │
                     └──────────────┘
```

## Color Coding

### Status Colors

**Invoices:**
- 🟦 Draft (Blue)
- 🟨 Sent (Yellow)
- 🟩 Paid (Green)
- 🟥 Overdue (Red)

**Pro Forma:**
- ⚪ Draft (Gray)
- 🟦 Sent (Blue)
- 🟩 Accepted (Green)
- 🟥 Declined (Red)
- 🟧 Expired (Orange)

**Time Entries:**
- ⚪ Unbilled (White/Default)
- 🟩 Billed (Green with indicator)

## Quick Actions Summary

### From Invoices Tab:
- Generate new invoice
- View invoice details
- Download PDF
- Send to client
- Record payment
- Update status

### From Pro Forma Tab:
- Create new pro forma
- Generate shareable link
- Convert to matter (if accepted)
- View details
- Update status

### From Time Entries Tab:
- Generate invoice for matter
- Search across all entries
- Filter by billing status
- View matter details
- See unbilled totals

## Mobile Layout

```
┌─────────────────────┐
│  INVOICES      [≡]  │
├─────────────────────┤
│ [Invoices ▼]        │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ Total Value     │ │
│ │ R 150,000       │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Paid Amount     │ │
│ │ R 100,000       │ │
│ └─────────────────┘ │
├─────────────────────┤
│ [+ Generate]        │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ INV-2025-001    │ │
│ │ [Paid]          │ │
│ │ R 25,000.00     │ │
│ │ Smith vs ABC    │ │
│ │ [View] [More]   │ │
│ └─────────────────┘ │
└─────────────────────┘
```

## Key Interactions

### Click Flows:

1. **Generate Invoice from Time Entries**
   - Click: Time Entries tab
   - Click: Generate Invoice (on matter)
   - Wizard opens with pre-selected data

2. **Convert Pro Forma**
   - Click: Pro Forma tab
   - Click: Convert to Matter (on accepted pro forma)
   - Modal opens for matter creation

3. **Traditional Invoice**
   - Click: Invoices tab
   - Click: Generate Invoice button
   - Wizard opens empty
   - Select matter and items manually

This visual guide provides a clear understanding of how the redesigned invoice page works and how users navigate through different workflows.
