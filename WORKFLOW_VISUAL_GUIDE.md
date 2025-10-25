# Visual Workflow Guide - TIER 1 & TIER 2 Features

## 🎯 Complete System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATTORNEY SUBMITS BRIEF                        │
│                   (New Request Created)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   YOU REVIEW NEW REQUEST      │
         │   (MattersPage - New Requests)│
         └───────────┬───────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│   PATH A      │         │   PATH B     │
│ "Quote First" │         │ "Accept &    │
│               │         │  Work"       │
└───────┬───────┘         └──────┬───────┘
        │                        │
        ▼                        ▼
```

---

## 📋 PATH A: "Quote First" (Complex Matters)

### Stage 1: PRO FORMA (The Estimate)

```
┌─────────────────────────────────────────────────────────────┐
│  YOU: ProFormaRequestPage                                    │
│  ├─ Use Universal Toolset                                    │
│  ├─ Add services from catalog                                │
│  ├─ Build detailed estimate                                  │
│  └─ Generate PDF                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  SEND TO ATTORNEY                                            │
│  Matter Status: "Awaiting Approval"                          │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────┐                 ┌──────────────┐
│   APPROVED    │                 │   DECLINED   │
│   ✅          │                 │   ❌         │
└───────┬───────┘                 └──────┬───────┘
        │                                │
        ▼                                ▼
┌───────────────┐                 ┌──────────────┐
│ Status:       │                 │ Status:      │
│ "Active"      │                 │ "Declined"   │
│ Proceed with  │                 │ Matter       │
│ work          │                 │ archived     │
└───────┬───────┘                 └──────────────┘
        │
        ▼
```

### Stage 2: MATTERS/WIP (Detailed Tracking)

```
┌─────────────────────────────────────────────────────────────┐
│  YOU: MatterWorkbenchPage                                    │
│  ├─ Log time entries as work happens                         │
│  ├─ Log expenses (travel, filing fees, etc.)                 │
│  ├─ Log services performed                                   │
│  └─ WIP value accumulates automatically                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  🆕 SCOPE AMENDMENT TRIGGER                                  │
│  Attorney phones: "Can you also draft heads of argument?"    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  YOU: Click "Request Scope Amendment"                        │
│  ├─ Add new line items:                                      │
│  │  • "Draft heads of argument"                              │
│  │  • 8 hours @ R2,500 = R20,000                             │
│  ├─ System shows:                                            │
│  │  • Original estimate: R25,000                             │
│  │  • Amendment: +R20,000                                    │
│  │  • New total: R45,000                                     │
│  └─ Send amendment request to attorney                       │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────┐                 ┌──────────────┐
│   APPROVED    │                 │   DECLINED   │
│   ✅          │                 │   ❌         │
└───────┬───────┘                 └──────┬───────┘
        │                                │
        ▼                                ▼
┌───────────────┐                 ┌──────────────┐
│ Budget updates│                 │ Work only on │
│ to R45,000    │                 │ original     │
│ Continue with │                 │ scope        │
│ new scope     │                 │ R25,000      │
└───────┬───────┘                 └──────┬───────┘
        │                                │
        └────────────────┬───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  📊 WIP REPORT (Tier 2)                                      │
│  At any time: Reports → WIP Report                           │
│  ├─ See all active matters with unbilled work                │
│  ├─ Shows: Matter name, hours, value, days in WIP            │
│  └─ Example: "I have R45,000 in unbilled work across 6       │
│              matters"                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  YOU: Complete work → Mark ready for invoicing               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
```

### Stage 3: INVOICE (The Final Bill)

```
┌─────────────────────────────────────────────────────────────┐
│  YOU: InvoicesPage → Convert WIP to invoice                 │
│  ├─ System pulls all logged time/expenses/services          │
│  ├─ Generate invoice PDF                                     │
│  ├─ Review invoice                                           │
│  └─ Send to attorney → Status: "Sent"                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  📊 OUTSTANDING FEES REPORT (Tier 1)                         │
│  Reports → Outstanding Fees                                  │
│  ├─ All unpaid invoices sorted by days overdue               │
│  ├─ Smith & Associates | Contract dispute | R15,000 | 45d   │
│  ├─ Jones Inc | Opinion on tax | R8,500 | 12d                │
│  └─ Use for: Follow up on late payments, manage cashflow    │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────┐                 ┌──────────────┐
│  PAID         │                 │  DISPUTE     │
│  ✅           │                 │  ⚠️          │
└───────┬───────┘                 └──────┬───────┘
        │                                │
        ▼                                ▼
┌───────────────┐         ┌──────────────────────────────────┐
│ Mark as "Paid"│         │ 🆕 CREDIT NOTE SCENARIO          │
│ Matter closes │         │ Attorney: "Error in billing"     │
└───────┬───────┘         └──────┬───────────────────────────┘
        │                        │
        │                        ▼
        │         ┌──────────────────────────────────────────┐
        │         │ YOU: InvoicesPage → Open invoice         │
        │         │ → Click "Issue Credit Note"              │
        │         │ ├─ Select reason: "Fee adjustment"       │
        │         │ ├─ Enter amount: R5,000                  │
        │         │ └─ System updates:                       │
        │         │    • Original: R25,000                   │
        │         │    • Credit: -R5,000                     │
        │         │    • Balance: R20,000                    │
        │         └──────┬───────────────────────────────────┘
        │                │
        │                ▼
        │         ┌──────────────────────────────────────────┐
        │         │ Send credit note to attorney             │
        │         │ ├─ Outstanding Fees Report updates       │
        │         │ └─ Revenue Report adjusts                │
        │         └──────┬───────────────────────────────────┘
        │                │
        └────────────────┴───────────────┐
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────┐
│  📊 REVENUE REPORT (Tier 1)                                  │
│  Reports → Revenue                                           │
│  ├─ Total fees earned per month/quarter/year                │
│  ├─ Filter by: Date range, attorney firm, practice area     │
│  ├─ Shows: Gross revenue, credit notes, net revenue         │
│  └─ Use for: SARS provisional tax, income tracking          │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ PATH B: "Accept & Work" (Traditional Brief Fee)

### Immediate Acceptance

```
┌─────────────────────────────────────────────────────────────┐
│  Attorney submits brief → Matter status: "New Request"       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  YOU: Open matter → Review brief                             │
│  → Click "Accept Brief"                                      │
│  → Matter status: "Active" (skip pro forma)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
```

### Work & Bill

```
┌─────────────────────────────────────────────────────────────┐
│  YOU: Do the work                                            │
│  (court appearance / consultation / opinion)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  YOU: MatterWorkbenchPage → Choose billing method            │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────────────┐         ┌──────────────────────────┐
│ OPTION 1:             │         │ OPTION 2:                │
│ 🆕 Simple Fee Entry   │         │ Time Tracking            │
│                       │         │ (Path C Hybrid)          │
└───────┬───────────────┘         └──────┬───────────────────┘
        │                                │
        ▼                                ▼
┌───────────────────────┐         ┌──────────────────────────┐
│ Click "Simple Fee     │         │ Log time entries as you  │
│ Entry"                │         │ work                     │
│ ├─ Enter: "Brief fee: │         │ System calculates:       │
│ │  R15,000"            │         │ (hours × rate) +         │
│ ├─ Add disbursements: │         │ expenses                 │
│ │  "Travel: R800"      │         │                          │
│ └─ System generates   │         │ 📊 Appears in WIP Report │
│    fee note           │         │ until invoiced           │
│    immediately        │         │                          │
└───────┬───────────────┘         └──────┬───────────────────┘
        │                                │
        └────────────────┬───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Mark matter complete → Generate fee note/invoice            │
│  → Send to attorney → Status: "Sent"                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  📊 OUTSTANDING FEES REPORT (Tier 1)                         │
│  After sending → Appears in Outstanding Fees Report          │
│  Shows: Days since sent, amount owing                        │
│  Updates when payment received                               │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────┐                 ┌──────────────┐
│  PAID         │                 │  DISPUTE     │
│  ✅           │                 │  ⚠️          │
└───────┬───────┘                 └──────┬───────┘
        │                                │
        ▼                                ▼
┌───────────────┐         ┌──────────────────────────────────┐
│ Mark as "Paid"│         │ 🆕 CREDIT NOTE SCENARIO          │
│ Matter closes │         │ Attorney: "Wrong disbursement"   │
└───────┬───────┘         └──────┬───────────────────────────┘
        │                        │
        │                        ▼
        │         ┌──────────────────────────────────────────┐
        │         │ YOU: Open fee note                       │
        │         │ → Click "Issue Credit Note"              │
        │         │ → Credit R800 for incorrect disbursement │
        │         │ → System updates balance:                │
        │         │    R15,800 - R800 = R15,000              │
        │         └──────┬───────────────────────────────────┘
        │                │
        └────────────────┴───────────────┐
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────┐
│  📊 REVENUE REPORT (Tier 1)                                  │
│  After payment → Counted in Revenue Report                   │
│  Credit notes automatically adjust totals                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Reports Hub - Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        DASHBOARD                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MAIN NAVIGATION                           │
│  ├─ Matters (see all matters by status)                      │
│  ├─ Invoices (all invoices & fee notes)                      │
│  ├─ Firms (attorney firms & contacts)                        │
│  └─ 📊 Reports (enhanced section)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    📊 REPORTS PAGE                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⭐ Outstanding Fees (Tier 1 - HIGH)                    │ │
│  │ ├─ All unpaid invoices                                 │ │
│  │ ├─ Sorted by days overdue                              │ │
│  │ ├─ Shows: Invoice #, client, attorney, amount, days   │ │
│  │ └─ Export to CSV                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⭐ Revenue (Tier 1 - HIGH)                             │ │
│  │ ├─ Total fees earned per period                        │ │
│  │ ├─ Filter by date range, firm, practice area          │ │
│  │ ├─ Shows: Gross revenue, credit notes, net revenue    │ │
│  │ └─ Export for SARS                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⭐ WIP (Tier 2 - Medium)                               │ │
│  │ ├─ All active matters with unbilled work               │ │
│  │ ├─ Shows: Matter name, hours, value, days in WIP      │ │
│  │ ├─ Helps answer: "How much unbilled work do I have?"  │ │
│  │ └─ Export to CSV/PDF                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Key User Flows Summary

### Daily Work Flow
```
1. Check MattersPage → See new requests
2. Accept or quote on new briefs
3. Work on active matters → Log time/services
4. Generate invoices/fee notes when done
```

### Weekly Financial Check Flow
```
1. Reports → Outstanding Fees → "Who owes me money?"
2. Follow up on overdue invoices
3. Reports → WIP → "How much unbilled work do I have?"
```

### Monthly Accounting Flow
```
1. Reports → Revenue → Generate for accountant
2. Calculate SARS provisional tax
3. Review: Invoices sent vs paid vs outstanding
```

### Exception Handling Flow
```
1. Attorney disputes fee → Issue credit note
2. Scope changes mid-work → Request amendment
3. Payment delayed → Outstanding Fees Report shows aging
```

---

## 🎯 Feature Access Points

### Credit Notes
```
Invoices Page → Open Invoice → "Issue Credit Note" button
```

### Scope Amendments
```
Matters Page → Open Active Matter → "Request Scope Amendment" button
```

### Simple Fee Entry
```
Matters Page → Open Active Matter (Path B) → "Simple Fee Entry" button
```

### Reports
```
Dashboard → Reports → Select Report Type
```

---

## ✨ Integration Complete!

All workflows are now fully integrated and working together seamlessly. Users can navigate through the entire lifecycle from request to payment with full reporting and exception handling capabilities.
