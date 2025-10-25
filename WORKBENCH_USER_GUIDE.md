# Matter Workbench - User Guide

## Overview
The Matter Workbench is your central hub for managing active legal matters. It provides real-time WIP tracking, budget management, and path-specific workflows.

---

## 🎯 Accessing the Workbench

### From the Matters List
1. Navigate to **Matters** page
2. Click on any **Active** matter
3. Workbench opens automatically

> **Note:** Draft or pending matters open the detail modal instead of the workbench.

### After Pro Forma Approval
When you approve a pro forma request:
1. Matter converts to "Active" status
2. System automatically routes to workbench
3. Original pro forma budget is loaded

---

## 📊 Workbench Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Matter Workbench: [Matter Title]                      [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Path-Specific Action Buttons]                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Overview │ Time │ Expenses │ Services │ Documents  │  │
│  │           │      │          │          │ [+ more]    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  [Active Tab Content]                                │  │
│  │                                                       │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔀 Two Workflow Paths

### Path A: Quote First (Pro Forma → Approval)
**Used when:** Client requests a quote before work begins

**Features:**
- ✅ Original pro forma budget displayed
- ✅ Budget comparison widget
- ✅ Amendments tab (track scope changes)
- ✅ "Request Scope Amendment" button
- ✅ "Convert WIP to Invoice" button
- ✅ Standard WIP tracking (time, expenses, services)

**Workflow:**
```
1. Client requests quote → Pro Forma created
2. Client approves → Matter becomes Active
3. Work begins → Log time/expenses/services
4. Scope change needed? → Request Amendment
5. Work complete → Convert WIP to Invoice
```

---

### Path B: Accept & Work (Direct Acceptance)
**Used when:** Client accepts brief immediately without prior quote

**Features:**
- ✅ Simple fee entry (for fixed quotes)
- ✅ Standard WIP tracking (for hourly work)
- ✅ "Generate Fee Note" button
- ✅ Service logging
- ❌ No amendments tab (not applicable)
- ❌ No pro forma budget (starts fresh)

**Workflow:**
```
1. Client sends brief → Accept directly
2. Matter becomes Active immediately
3. Two options:
   a) Fixed fee → Use "Simple Fee Entry"
   b) Hourly → Log time entries as you work
4. Work complete → Generate Fee Note
```

---

## 📑 Workbench Tabs

### 1. Overview Tab
**Purpose:** High-level matter summary and quick stats

**Displays:**
- Matter title and description
- Client information
- Status badges
- Quick statistics:
  - Total WIP value
  - Time entries count
  - Expenses logged
  - Services rendered
  - Budget status (Path A only)

**Actions:**
- Quick navigation to other tabs
- Path-specific quick actions

---

### 2. Time Tab
**Purpose:** Track time spent on the matter

**Features:**
- List of all time entries
- Add new time entry (opens modal)
- Edit existing entries
- Delete entries
- Total hours display
- Total value calculation

**Time Entry Modal Fields:**
- Date worked
- Hours (decimal format: 2.5 = 2 hours 30 minutes)
- Hourly rate (defaults to your standard rate)
- Description of work performed
- Billable toggle

**Example:**
```
Date: 2024-01-15
Hours: 3.5
Rate: R2,000/hour
Description: Client consultation and legal research
Total: R7,000
```

---

### 3. Expenses Tab
**Purpose:** Track disbursements and out-of-pocket expenses

**Features:**
- List of all expenses
- Quick disbursement modal
- Expense categories
- Receipt attachment (coming soon)
- Total expenses display

**Expense Categories:**
- Court fees
- Filing fees
- Travel expenses
- Document printing
- Expert witness fees
- Other disbursements

---

### 4. Services Tab
**Purpose:** Log non-time-based services rendered

**Features:**
- Full service logging interface
- Service type categorization
- Fixed fee services
- Service descriptions
- Quantity tracking

**Service Types:**
- Consultation
- Drafting
- Research
- Court appearance
- Negotiation
- Review
- Correspondence
- Other

**Example:**
```
Service: Document Drafting
Type: Drafting
Fee: R5,000
Description: Draft of sale agreement with special conditions
```

---

### 5. Amendments Tab (Path A Only)
**Purpose:** Track scope changes and budget adjustments

**Displays:**
- Amendment history
- Original scope vs amended scope
- Budget impact (+/- amounts)
- Approval status
- Amendment dates

**Amendment Workflow:**
1. Click "Request Scope Amendment" button
2. Describe scope change
3. Specify additional fee
4. Submit for client approval
5. Track status in Amendments tab

**Budget Calculation:**
```
Current Budget = Original Budget + Sum of Approved Amendments
```

---

### 6. Documents Tab
**Purpose:** Manage matter-related documents (coming soon)

**Planned Features:**
- Document upload
- Document linking
- Version control
- Document search
- Share with client

---

### 7. Invoicing Tab
**Purpose:** Convert WIP to invoices or generate fee notes

**Path A (WIP to Invoice):**
- Review all accumulated WIP
- Select items to invoice
- Generate invoice
- Email to client

**Path B (Fee Note):**
- Simple fee note generation
- Fixed fee or accumulated WIP
- Professional formatting
- Email delivery

---

## 🎬 Action Buttons Explained

### Path A Actions

#### 📝 Request Scope Amendment
**When to use:** Client requests additional work outside original scope

**Process:**
1. Click button
2. Describe additional work
3. Specify additional fee
4. Submit to client
5. Track in Amendments tab

**Example:**
```
Original Scope: Sale agreement for residential property
Amendment: Add clause for business assets transfer
Additional Fee: R3,500
```

---

#### 💰 Convert WIP to Invoice
**When to use:** Work is complete or ready to bill

**Process:**
1. Click button
2. Review time entries, expenses, services
3. Select items to invoice
4. System generates draft invoice
5. Review and send to client

**Auto-Calculates:**
- Time entries: Hours × Rate
- Expenses: Sum of disbursements
- Services: Sum of service fees
- Amendments: Additional approved amounts
- Total: All above combined

---

#### 📥 Download Pro Forma
**When to use:** Need to reference original quote

**Downloads:** PDF copy of original pro forma quote

---

### Path B Actions

#### ⚡ Simple Fee Entry
**When to use:** Fixed fee work (not hourly)

**Process:**
1. Click button
2. Enter fee amount
3. Add description
4. System records as WIP

**Example:**
```
Fee: R15,000
Description: Fixed fee for contract review and opinion
```

---

#### 📄 Generate Fee Note
**When to use:** Work complete, ready to bill client

**Process:**
1. Click button
2. System generates fee note with:
   - Fixed fees entered
   - OR accumulated time/expenses
3. Professional PDF format
4. Email to client

---

#### ⏱️ Log Time Entry
**Quick access to time entry modal**

**Same as Time Tab but faster:**
- One-click access
- Modal opens immediately
- Fill and save
- Returns to current view

---

#### 💸 Log Expense
**Quick access to expense entry modal**

**Same as Expenses Tab but faster:**
- One-click access
- Quick disbursement form
- Save and return

---

## 💡 Budget Comparison Widget (Path A Only)

### What It Shows
Visual representation of budget vs actual spend

**Components:**
1. **Original Budget Bar** (Blue)
   - Total from pro forma quote
   
2. **Amendments Bar** (Purple)
   - Sum of approved amendments
   
3. **Current Budget** (Total)
   - Original + Amendments
   
4. **WIP Value Bar** (Green/Yellow/Red)
   - Current work-in-progress value
   - Green: Under 80% of budget
   - Yellow: 80-100% of budget
   - Red: Over budget

**Example Display:**
```
┌─────────────────────────────────────────────────┐
│  Budget Comparison                               │
├─────────────────────────────────────────────────┤
│  Original Budget:  R50,000                       │
│  [████████████████████████████████] 100%         │
│                                                   │
│  Amendments:       +R10,000 (2 approved)         │
│  [██████] 20%                                    │
│                                                   │
│  Current Budget:   R60,000                       │
│  [████████████████████████████████████████] 100% │
│                                                   │
│  WIP Value:        R45,000 (75%)                 │
│  [███████████████████████████] 75%               │
│                                                   │
│  ✅ Under Budget by R15,000                      │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Updates

### What Refreshes Automatically
- WIP value after adding time/expense/service
- Tab counts (e.g., "Time (5)" shows 5 entries)
- Budget widget calculations
- Matter status changes

### What Requires Manual Refresh
- Amendment approvals (refresh page)
- Invoice generation (navigate back)

---

## 📱 Responsive Design

### Desktop View
- Full tab navigation
- Side-by-side action buttons
- Wide budget widget

### Tablet View
- Scrollable tabs
- Stacked action buttons
- Compact budget display

### Mobile View (Coming Soon)
- Dropdown tab selector
- Full-width action buttons
- Simplified budget view

---

## 🚨 Common Workflows

### Scenario 1: Hourly Matter (Path B)
```
1. Accept brief → Matter becomes active
2. Open workbench
3. Click "Log Time Entry"
4. Fill in hours worked, description
5. Save → WIP updates immediately
6. Repeat as work progresses
7. When complete → "Generate Fee Note"
8. Review and send to client
```

---

### Scenario 2: Fixed Fee Matter (Path B)
```
1. Accept brief → Matter becomes active
2. Open workbench
3. Click "Simple Fee Entry"
4. Enter fixed fee amount (e.g., R20,000)
5. Add description
6. Save → WIP created
7. When complete → "Generate Fee Note"
8. Professional fee note sent to client
```

---

### Scenario 3: Pro Forma with Amendments (Path A)
```
1. Pro forma approved → Matter becomes active
2. Open workbench
3. See original budget (e.g., R50,000)
4. Log time/expenses as work progresses
5. Client requests additional work
6. Click "Request Scope Amendment"
7. Describe new work, add fee (e.g., +R10,000)
8. Submit to client
9. Client approves → Amendment added
10. Budget widget updates (now R60,000)
11. Continue logging WIP
12. When complete → "Convert WIP to Invoice"
13. All work itemized in invoice
```

---

## 🔒 Permissions & Security

### Who Can Access?
- Matter advocate (assigned to matter)
- Firm partners (full access)
- Firm managers (read-only)

### What's Protected?
- Edit/delete requires ownership
- Invoice generation requires authorization
- Amendment approval requires client action

---

## 💾 Data Persistence

### Auto-Save
- All form inputs auto-save
- No "Save Draft" needed

### Real-Time Sync
- WIP updates immediately
- Multi-device support
- Conflict resolution built-in

---

## 🐛 Troubleshooting

### Issue: Workbench won't open
**Cause:** Matter status is not "Active"  
**Solution:** Check matter status in list. Only active matters open workbench.

---

### Issue: Budget widget shows R0
**Cause:** Matter is Path B (no pro forma)  
**Solution:** This is normal. Path B matters don't have original budgets.

---

### Issue: Amendments tab missing
**Cause:** Matter is Path B  
**Solution:** This is normal. Path B matters don't support amendments.

---

### Issue: Time entry modal shows error
**Cause:** Missing required fields  
**Solution:** Ensure date, hours, and description are filled.

---

## 📞 Support

### Quick Help
- Hover over any field for tooltip
- Click (?) icons for inline help
- Check status bar for error messages

### Need More Help?
- Email: support@lexohub.com
- Phone: +27 11 XXX XXXX
- Live Chat: Bottom-right corner

---

## 🎓 Best Practices

### Time Tracking
✅ Log time daily for accuracy  
✅ Use decimal format (1.5 = 1h 30m)  
✅ Be specific in descriptions  
❌ Don't wait until month-end  

### Expense Logging
✅ Log expenses immediately  
✅ Categorize correctly  
✅ Keep receipts for reference  
❌ Don't lump multiple expenses  

### Budget Management
✅ Check budget widget regularly  
✅ Request amendments proactively  
✅ Keep client informed of overruns  
❌ Don't exceed budget without approval  

### Invoicing
✅ Review WIP before invoicing  
✅ Check for unbillable items  
✅ Add invoice notes if needed  
❌ Don't invoice incomplete work  

---

## 🎉 Getting Started Checklist

- [ ] Access workbench from matters list
- [ ] Identify if Path A or Path B
- [ ] Review Overview tab
- [ ] Log first time entry
- [ ] Log first expense
- [ ] Check budget widget (Path A)
- [ ] Practice tab navigation
- [ ] Generate test invoice
- [ ] Bookmark for quick access

---

**Version:** 1.0  
**Last Updated:** January 2024  
**Compatible With:** LexoHub v2.0+  

---

**Need a quick reference?** Save this guide or print the **Common Workflows** section for your desk!
