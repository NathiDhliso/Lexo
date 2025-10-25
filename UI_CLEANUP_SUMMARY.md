# UI Cleanup Summary - Quick Reference

## 🎯 What Needs to Go

### Dashboard (DashboardPage.tsx)
- ❌ Settlement Rate (you don't settle cases)
- ❌ Conflict Checks (attorney's job)
- ❌ Collection Rate % (need R amounts instead)
- ❌ Average Bill Time (not actionable)
- ❌ Quick Time Entry modal (log time in matter context)
- ❌ New Invoice modal (invoices come from matters)

### Matter Detail Modal (MatterDetailModal.tsx)
- ❌ "Retainer & Trust" tab (advocates don't hold trust funds)
- ❌ "Submit for Approval" button (you work independently)

### Matter Card (MatterCard.tsx)
- ❌ Risk Level display (not your workflow)
- ❌ Fee types: Pro Bono, Success Fee, Retainer (simplify to Hourly/Brief Fee)
- ❌ Status: ON_HOLD, PENDING, SETTLED (use your workflow statuses)

---

## ✅ What Should Replace Them

### Dashboard Should Show:
```
📋 New Requests: 5          (briefs awaiting your decision)
⏳ Awaiting Approval: 3     (pro formas sent to attorneys)
⚡ Active Matters: 12        (work in progress)
💰 Outstanding Fees: R87,500 (total owed to you)
📊 Unbilled WIP: R45,000    (work done, not invoiced)
💵 This Month Revenue: R120,000 (fees collected)
⚠️ Oldest Unpaid: 67 days   (follow up needed)
```

### Matter Statuses Should Be:
- NEW_REQUEST (attorney submitted)
- AWAITING_APPROVAL (pro forma sent)
- ACTIVE (work in progress)
- DECLINED (rejected)
- COMPLETED (work done, invoice sent)
- PAID (invoice paid)
- ARCHIVED (old matters)

### Matter Detail Modal Tabs (for ACTIVE matters):
- Details ✅
- Time Entries ✅
- Scope & Amendments ✅
- Documents ✅
- ~~Retainer & Trust~~ ❌ REMOVE

---

## 🚀 Quick Wins (Do These First)

1. **Remove Retainer Tab** - 30 min
   - Biggest confusion point
   - Advocates don't manage trust accounts

2. **Remove Settlement Rate** - 15 min
   - Misleading metric
   - You're not a plaintiff attorney

3. **Remove Conflict Checks** - 10 min
   - Not your responsibility
   - Attorneys handle this

4. **Replace Collection Rate with Outstanding Fees** - 20 min
   - Show R amount instead of %
   - More actionable

**Total: ~75 minutes for major improvements**

---

## 📝 Files to Edit

1. `src/pages/DashboardPage.tsx` - Remove 4 metrics, add 2 new ones
2. `src/components/matters/MatterDetailModal.tsx` - Remove 1 tab, 1 button
3. `src/components/matters/MatterCard.tsx` - Simplify risk/fee displays
4. `src/types/index.ts` - Clean up type definitions

---

## 💡 Why This Matters

**Current UI** = Built for plaintiff attorneys (settlements, trust accounts, conflict checks)

**Your Workflow** = Advocate practice (briefs, pro formas, court appearances, opinions)

The mismatch confuses users and shows irrelevant data. After cleanup:
- ✅ Every metric is actionable
- ✅ Every status matches your workflow
- ✅ No confusing legal concepts from other practice types
- ✅ Clear path from New Request → Pro Forma/Accept → Work → Invoice → Payment

---

See `UI_AUDIT_OUTDATED_ELEMENTS.md` for detailed analysis and line numbers.
