# Troubleshooting Guide - Edge Cases & Solutions

**Comprehensive solutions for real-world scenarios.**

---

## 💰 Payment & Invoice Issues

### Issue: Attorney Paid Wrong Amount

**Scenario:** Invoice is R39,500 but attorney paid R40,000

**Solution:**
```
1. Record the actual payment received (R40,000)
2. System shows: Overpayment R500
3. Options:
   a) Refund R500 to attorney
   b) Apply R500 credit to next invoice
   c) Keep as goodwill credit on account

4. Document in payment notes: "Overpayment - to be applied to next invoice"
```

**Scenario:** Attorney paid R35,000 but invoice is R39,500

**Solution:**
```
1. Record partial payment (R35,000)
2. Outstanding balance: R4,500
3. Contact attorney about shortfall
4. Options:
   a) Attorney pays remaining R4,500
   b) Issue credit note if agreed to reduce fee
   c) Payment plan for balance
```

---

### Issue: Need to Void Invoice and Reissue

**Scenario:** Invoice sent with wrong details, need to cancel and resend

**Solution:**
```
1. DO NOT delete the invoice (breaks sequential numbering)
2. Instead:
   - Open invoice INV-2025-005
   - Click "Issue Credit Note"
   - Reason: "Invoice voided - reissuing corrected version"
   - Credit full amount
   
3. Generate new invoice:
   - System assigns next number: INV-2025-006
   - Enter correct details
   - Send to attorney
   
4. Audit log shows:
   - INV-2025-005: Voided (full credit note CN-2025-003)
   - INV-2025-006: Corrected invoice issued
   
✓ SARS compliance maintained (no gaps in sequence)
✓ Full audit trail preserved
```

---

### Issue: Forgot to Log Disbursement Before Invoicing

**Scenario:** Invoice sent, then you remember R800 travel expense

**Solution - Option 1 (Recommended):**
```
1. Create supplementary invoice:
   - Description: "Additional disbursement - [Matter name]"
   - Travel to court: R800 + VAT R120 = R920
   - Reference original invoice: "Relates to INV-2025-005"
   - System assigns: INV-2025-007
   
2. Send to attorney with explanation
```

**Solution - Option 2:**
```
1. Add to next invoice for same attorney:
   - Line item: "Disbursement from [Matter name] - [Date]"
   - R800 + VAT R120 = R920
   - Note: "Omitted from INV-2025-005"
```

**Solution - Option 3 (if attorney agrees):**
```
1. Absorb the cost (goodwill gesture)
2. Learn: Log disbursements immediately!
```

---

### Issue: Payment Recorded Twice by Mistake

**Scenario:** Accidentally recorded same R15,000 payment twice

**Solution:**
```
1. Open invoice
2. View Payment History
3. Find duplicate payment entry
4. Click "Delete Payment" on duplicate
5. Confirm deletion
6. System recalculates balance automatically
7. Audit log records: "Payment deleted - duplicate entry"

✓ Balance corrected
✓ Audit trail maintained
```

---

### Issue: Invoice Number Sequence Out of Sync

**Scenario:** System shows next invoice as INV-2025-008 but should be INV-2025-007

**Solution:**
```
1. Settings → Invoice Settings → Numbering Audit Log
2. Review all issued numbers
3. Identify gap or duplicate
4. If gap found:
   - Check if invoice was voided (should have credit note)
   - Check if invoice was deleted (data integrity issue)
   
5. Contact support if:
   - Numbers are truly out of sync
   - Missing invoices in audit log
   - Duplicate numbers issued
   
6. Support can:
   - Manually adjust sequence
   - Regenerate audit log
   - Fix data integrity issues
```

**Prevention:**
```
✓ Never manually edit invoice numbers
✓ Never delete invoices (use credit notes instead)
✓ Regular audit log reviews (monthly)
```

---

## 📋 Matter Management Issues

### Issue: Attorney Submits Brief While You're Creating Quick Brief

**Scenario:** Race condition - both creating same matter

**Solution:**
```
System handles automatically:
1. First submission creates matter
2. Second submission shows warning:
   "Similar matter exists: [Matter name] created [time] ago"
   
3. Options:
   a) "Open existing matter" (recommended)
   b) "Create anyway" (if genuinely different)
   c) "Cancel"
   
✓ Prevents duplicate matters
✓ User chooses resolution
```

---

### Issue: Matter Archived But Has Unpaid Invoice

**Scenario:** Archived matter, invoice still outstanding

**Solution:**
```
System prevents this:
1. Try to archive matter
2. System checks for unpaid invoices
3. Warning shown:
   "Cannot archive - outstanding invoice INV-2025-005 (R12,500)"
   
4. Options:
   a) Record payment first, then archive
   b) Issue credit note (if writing off), then archive
   c) Cancel archive operation
   
✓ Outstanding Fees Report still shows unpaid invoices
✓ Cannot accidentally hide unpaid work
```

---

### Issue: Scope Changed But Forgot to Request Amendment

**Scenario:** Did extra work without formal amendment approval

**Solution:**
```
1. Complete the work
2. Generate invoice including all work done
3. Add note on invoice:
   "Additional work performed as per phone discussion [date]"
   
4. Send to attorney with explanation email
5. Options:
   a) Attorney approves and pays full amount
   b) Attorney disputes - issue credit note for disputed portion
   c) Negotiate fair resolution
   
Prevention:
✓ Always request formal amendment before starting extra work
✓ Document phone agreements in matter notes
✓ Send confirmation email after scope discussions
```

---

### Issue: Matter Stuck in WIP for 60+ Days

**Scenario:** Matter shows in WIP Report, no activity for 2 months

**Solution:**
```
1. Dashboard flags: "Stale matter - 60 days no activity"
2. Review matter:
   - Is work actually complete? → Invoice now
   - Waiting on attorney? → Follow up
   - Waiting on information? → Chase
   - Matter abandoned? → Contact attorney
   
3. Actions:
   a) If complete: Generate invoice immediately
   b) If waiting: Set reminder, follow up
   c) If abandoned: Discuss with attorney
      - Invoice for work done to date?
      - Write off and close?
      - Put on hold formally?
      
Prevention:
✓ Weekly WIP Report review
✓ Set matter deadlines
✓ Regular attorney communication
```

---

## 🔄 Scope Amendment Issues

### Issue: Amendment Declined But Work Already Started

**Scenario:** Started extra work, attorney declines amendment

**Solution:**
```
1. Stop additional work immediately
2. Options:
   a) Negotiate: "I've already done X hours, can we agree on partial fee?"
   b) Absorb cost: Goodwill gesture for good client
   c) Invoice anyway: If work was clearly requested
   
3. Document everything:
   - When work was requested
   - Communication trail
   - Work actually performed
   
4. Prevention:
   ✓ Wait for amendment approval before starting
   ✓ If urgent, get email confirmation first
   ✓ Set matter status to "Pending Amendment" while waiting
```

---

### Issue: Multiple Amendments Making Budget Unclear

**Scenario:** Original R25k, Amendment 1 +R21k, Amendment 2 +R8k, Amendment 3 +R5k

**Solution:**
```
System tracks automatically:
1. Matter page shows:
   "Original scope: R25,000"
   "Amendments: +R34,000 (3 amendments)"
   "Current budget: R59,000"
   "Work logged: R52,000"
   "Remaining: R7,000"
   
2. Click "View Amendment History":
   - Amendment 1: +R21,000 (Approved 15 Oct)
   - Amendment 2: +R8,000 (Approved 22 Oct)
   - Amendment 3: +R5,000 (Approved 1 Nov)
   
3. Invoice shows:
   "Professional services as per pro forma and 3 approved amendments"
   
✓ Full transparency
✓ Clear audit trail
✓ Attorney can verify against their approvals
```

---

## 📊 Reporting Issues

### Issue: Dashboard Shows Wrong Numbers

**Scenario:** Dashboard says R50k outstanding but report shows R45k

**Solution:**
```
1. Check dashboard refresh time (bottom of page)
2. Manual refresh: Click refresh icon
3. If still wrong:
   a) Check invoice statuses (Sent vs Paid)
   b) Check partial payments recorded correctly
   c) Check credit notes issued
   d) Check date filters on reports
   
4. Common causes:
   - Recent payment not yet reflected (wait 5 min)
   - Invoice marked "Paid" but payment not recorded
   - Credit note issued but not applied
   - Archived matters included/excluded inconsistently
   
5. If persistent:
   - Clear browser cache
   - Log out and back in
   - Contact support with screenshot
```

---

### Issue: WIP Report Shows Matter Already Invoiced

**Scenario:** Generated invoice but matter still in WIP Report

**Solution:**
```
1. Check invoice status:
   - If "Draft": Not yet sent, still in WIP ✓
   - If "Sent": Should be removed from WIP
   
2. If invoice is "Sent" but still in WIP:
   - Refresh WIP Report
   - Check if invoice includes ALL logged work
   - Partial invoice? Remaining work stays in WIP ✓
   
3. System behavior:
   - Full invoice → Matter removed from WIP
   - Partial invoice → Remaining work stays in WIP
   - Draft invoice → Matter stays in WIP until sent
```

---

### Issue: Revenue Report Doesn't Match Bank Deposits

**Scenario:** Report shows R100k received but bank shows R95k

**Solution:**
```
Common causes:
1. Bank fees deducted: R100k invoiced, R95k deposited (R5k fees)
2. Payment timing: Invoice paid 31 Oct, cleared 1 Nov (different months)
3. Partial payments: Some payments not yet recorded
4. Refunds issued: Overpayments refunded
5. Credit notes: Reduced revenue after initial payment

Reconciliation:
1. Revenue Report → Export to CSV
2. Bank statement → Export transactions
3. Match line by line:
   - Invoice INV-2025-001: R12,500 → Bank: R12,500 ✓
   - Invoice INV-2025-002: R8,500 → Bank: R8,075 (R425 fees)
   - Invoice INV-2025-003: R15,000 → Not in bank (still pending)
   
4. Adjust expectations:
   - Revenue Report = Invoiced amounts
   - Bank = Actual deposits (minus fees, timing differences)
   
✓ Both are correct, just measuring different things
```

---

## 🔐 Data Integrity Issues

### Issue: Concurrent Payment Recording

**Scenario:** You and assistant both record same payment simultaneously

**Solution:**
```
System handles:
1. First payment saves successfully
2. Second payment triggers warning:
   "Payment of R15,000 already recorded [time] ago. Record anyway?"
   
3. Options:
   a) "No, cancel" (recommended if duplicate)
   b) "Yes, record" (if genuinely two separate payments)
   
4. If duplicate recorded:
   - Delete duplicate from Payment History
   - System recalculates balance
   
Prevention:
✓ Assign payment recording to one person
✓ Check Payment History before recording
✓ Use reference numbers to identify duplicates
```

---

### Issue: VAT Rate Changed Mid-Year

**Scenario:** SA government changes VAT from 15% to 16% on 1 April

**Solution:**
```
System handles automatically:
1. Settings → Invoice Settings → VAT Rate History
2. Add new rate:
   - Effective date: 1 April 2025
   - New rate: 16%
   - Reason: "Government VAT increase"
   
3. System behavior:
   - Invoices before 1 April: 15% VAT
   - Invoices from 1 April: 16% VAT
   - Pro formas created before, invoiced after: Use invoice date rate
   
4. Reports:
   - Revenue Report shows VAT breakdown by rate
   - SARS export includes rate changes
   
✓ Historical invoices unchanged
✓ New invoices use new rate
✓ Full compliance maintained
```

---

### Issue: Lost Internet Connection While Working

**Scenario:** Internet drops while logging time entries

**Solution:**
```
System behavior:
1. Offline detection: Warning banner appears
   "No internet connection - changes will sync when reconnected"
   
2. Local storage:
   - Time entries saved locally
   - Disbursements saved locally
   - Changes queued for sync
   
3. Reconnection:
   - Auto-sync queued changes
   - Success notification: "3 time entries synced"
   - Conflict resolution if needed
   
4. If browser closed before sync:
   - Changes lost (local storage cleared)
   - Prevention: Don't close browser until synced
   
Best practice:
✓ Wait for "Synced ✓" indicator before closing
✓ Stable internet for financial operations
✓ Save frequently (auto-save every 30 seconds)
```

---

## 🔍 Search & Archive Issues

### Issue: Can't Find Matter You Know Exists

**Scenario:** Worked on matter last month, now can't find it

**Solution - Checklist:**
```
1. ☐ Check if archived:
   Advanced Filters → ☑ Include Archived Matters
   
2. ☐ Check spelling:
   "Restraint" vs "Restraing" (typo)
   
3. ☐ Search by attorney firm instead:
   "Smith & Associates" → Shows all their matters
   
4. ☐ Check date range:
   Advanced Filters → Date range: "All Time"
   
5. ☐ Check status filter:
   Advanced Filters → Status: "All Statuses"
   
6. ☐ Search by client name:
   Matter might be titled differently than you remember
   
7. ☐ Check if deleted:
   Audit Trail → Search for matter name
   Shows if matter was deleted and by whom
   
8. ☐ Contact support:
   Provide: Matter name, attorney firm, approximate date
   Support can search database directly
```

---

### Issue: Accidentally Archived Active Matter

**Scenario:** Archived wrong matter, need to restore

**Solution:**
```
1. Matters → Advanced Filters
2. Check "☑ Include Archived Matters"
3. Find the matter
4. Open matter
5. Click "Restore Matter"
6. Confirm restoration
7. Matter returns to active list
8. Audit log records: "Matter restored from archive"

✓ No data lost
✓ Full history preserved
✓ Can restore anytime
```

---

## 💳 Credit Note Issues

### Issue: Credit Note Issued But Attorney Already Paid Full Amount

**Scenario:** Invoice R39,500 paid in full, then you issue R5,000 credit note

**Solution:**
```
System calculates:
1. Original invoice: R39,500
2. Amount paid: R39,500
3. Credit note: -R5,000
4. Result: Overpayment R5,000

Options:
a) Refund R5,000 to attorney
   - EFT back to their account
   - Record refund in system
   
b) Apply R5,000 credit to next invoice
   - Next invoice: R12,000
   - Less credit: -R5,000
   - Amount due: R7,000
   
c) Keep as account credit
   - Shows on attorney's account
   - Applied to future invoices automatically
   
Document in credit note notes: "Refund issued [date]" or "Credit to be applied to next invoice"
```

---

### Issue: Need to Issue Credit Note for Old Invoice

**Scenario:** Invoice from 6 months ago, error just discovered

**Solution:**
```
1. Find old invoice: INV-2024-087
2. Click "Issue Credit Note"
3. System assigns current sequential number: CN-2025-015
4. Enter:
   - Reason: "Correction to invoice from [date]"
   - Amount: R2,500
   - Notes: "Calculation error discovered during audit"
   
5. System updates:
   - Old invoice balance: Adjusted
   - Current month revenue: Reduced by R2,500
   - Audit log: Full trail
   
6. Send to attorney with explanation
7. Adjust current year tax calculations

✓ Can issue credit notes for any historical invoice
✓ Credit note gets current sequential number
✓ References original invoice clearly
```

---

## 🚨 Emergency Scenarios

### Issue: System Down During Critical Deadline

**Scenario:** Need to send invoice today, system unavailable

**Solution - Backup Process:**
```
1. Manual invoice creation:
   - Use Word/Excel template
   - Manually assign next sequential number
   - Include all required SARS details
   - Send to attorney
   
2. When system returns:
   - Enter invoice with same number used
   - Mark as "Sent" with correct date
   - Upload PDF copy
   - System syncs numbering
   
3. Prevention:
   - Keep offline invoice template ready
   - Know your current sequence number
   - Have attorney contact details backed up
   - Export critical data weekly
```

---

### Issue: Accidentally Deleted Critical Matter

**Scenario:** Matter deleted, need to recover

**Solution:**
```
1. Check Audit Trail immediately:
   - Shows deletion event
   - Shows who deleted
   - Shows when deleted
   
2. Contact support urgently:
   - Provide matter ID or name
   - Provide deletion timestamp
   - Request recovery
   
3. Support can:
   - Restore from database backup
   - Recover within 30 days
   - Restore all associated data
   
4. Prevention:
   ✓ Use archive instead of delete
   ✓ Confirmation dialog before delete
   ✓ Restrict delete permissions
   ✓ Regular backups
```

---

## 📱 Mobile & Remote Issues

### Issue: Need to Record Payment While Away from Office

**Scenario:** At court, attorney pays cash, need to record immediately

**Solution:**
```
Mobile workflow:
1. Open app on phone
2. Navigate to Invoices
3. Find invoice (use search)
4. Click "Record Payment"
5. Enter:
   - Amount
   - Method: Cash
   - Date: Today
   - Reference: "Cash payment at court"
6. Save
7. System syncs immediately

✓ Full functionality on mobile
✓ Real-time sync
✓ Secure connection
```

---

### Issue: Need to Log Time Entry Without Internet

**Scenario:** Working on opinion at home, internet down

**Solution:**
```
1. Note time entry details:
   - Activity: "Draft opinion"
   - Duration: 3 hours
   - Rate: R2,500
   - Date: Today
   
2. When internet returns:
   - Open matter
   - Log time entry with correct date
   - Add note: "Logged retrospectively - internet outage"
   
3. Alternative:
   - Keep paper log
   - Enter all at once when connected
   - System accepts backdated entries
   
✓ No work lost
✓ Accurate time tracking maintained
```

---

## 🎓 Training & Onboarding Issues

### Issue: New Assistant Doesn't Understand Workflow

**Solution - Training Checklist:**
```
Day 1: Basics
☐ System login and navigation
☐ Dashboard overview
☐ Path A vs Path B explanation
☐ Quick Brief Capture demo
☐ Practice with test data

Day 2: Daily Operations
☐ Logging time entries
☐ Recording disbursements
☐ Recording payments
☐ Searching for matters
☐ Practice exercises

Day 3: Financial Operations
☐ Generating invoices
☐ Issuing credit notes
☐ Running reports
☐ Understanding dashboard metrics
☐ Practice scenarios

Week 2: Advanced
☐ Scope amendments
☐ Troubleshooting common issues
☐ Archive/restore matters
☐ Export reports
☐ Handle edge cases

Resources:
- WORKFLOW_QUICK_START.md (read first)
- WORKFLOW_VISUAL_GUIDE.md (flowcharts)
- This troubleshooting guide (reference)
- Video tutorials (if available)
- Sandbox environment for practice
```

---

## 📞 When to Contact Support

**Contact support immediately if:**
- Invoice numbering sequence broken
- Data appears corrupted or missing
- System performance severely degraded
- Security concerns
- Critical deadline at risk
- Cannot resolve issue using this guide

**Include in support request:**
- Your advocate ID
- Screenshot of issue
- Steps to reproduce
- What you've tried already
- Urgency level (critical/high/medium/low)

**Response times:**
- Critical (deadline risk): 1 hour
- High (blocking work): 4 hours
- Medium (inconvenience): 24 hours
- Low (question): 48 hours

---

## 💡 Prevention Best Practices

**Daily:**
- ✓ Log time and disbursements as you work
- ✓ Check dashboard urgent attention section
- ✓ Record payments same day received

**Weekly:**
- ✓ Review WIP Report for aging matters
- ✓ Follow up on overdue invoices
- ✓ Generate invoices for completed work

**Monthly:**
- ✓ Review numbering audit log
- ✓ Archive completed matters
- ✓ Export reports for accountant
- ✓ Reconcile with bank statements

**Quarterly:**
- ✓ Review and update Quick Brief templates
- ✓ Analyze practice area profitability
- ✓ Review payment rates by attorney firm
- ✓ Update rate cards if needed

**Annually:**
- ✓ Verify VAT registration details
- ✓ Review invoice numbering format
- ✓ Archive old matters (2+ years closed)
- ✓ System health check with support

---

**Most issues are preventable with good habits and regular maintenance.**

**When in doubt, refer to this guide or contact support.**
