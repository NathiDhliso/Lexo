# 🎯 How to Test Documents Tab - Step by Step Guide

## ⚠️ IMPORTANT CLARIFICATION

**The screenshot you shared is NOT the Documents tab!**

That's the **"Basic Information" form** for creating a NEW matter. You're looking at the wrong screen.

---

## 📍 WHERE YOU ARE vs WHERE YOU NEED TO BE

### ❌ Where You Are (Screenshot)
```
New Matter Creation Flow
└─ "Basic Information" step
   ├─ Matter Title field
   ├─ Matter Type dropdown
   ├─ Court Case Number field
   └─ Description textarea
```

**This is:** Matter creation wizard  
**Purpose:** Create a new matter  
**File:** `NewMatterWizardPage.tsx`  

### ✅ Where You Need to Be
```
Existing Matter Management
└─ Matter Workbench OR Matter Detail Modal
   └─ Documents Tab
      ├─ Privacy notice
      ├─ "Link Document" button
      ├─ List of linked documents
      └─ "Verify All" button
```

**This is:** Document management for existing matters  
**Purpose:** Link documents to an already-created matter  
**Files:** 
- `MatterWorkbenchPage.tsx` (full view)
- `MatterDetailModal.tsx` (modal view)

---

## 🚀 CORRECT TESTING STEPS

### Step 1: Go to Matters Page
1. Navigate to the main navigation
2. Click **"Matters"** link
3. You should see a list of existing matters

### Step 2: Open an Existing Matter (Two Ways)

**Option A: Matter Workbench (Full View)**
1. Click on any matter row in the list
2. Should open full Matter Workbench page
3. Look for tabs at top: Overview, Time, Expenses, Services, **Documents**, etc.
4. Click **"Documents"** tab ← This is what you need!

**Option B: Matter Detail Modal (Quick View)**
1. From Matters list, click the "..." menu or details button
2. Modal opens with matter details
3. Look for tabs: Details, Time Entries, Scope & Amendments, **Documents**
4. Click **"Documents"** tab ← This is what you need!

### Step 3: Test Document Linking
Once you're on the Documents tab, you should see:

```
┌────────────────────────────────────────────┐
│ 🔒 Privacy Protected Notice                │
│ (Green/Blue box with lock icon)            │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ [Link from Google Drive] [Link Local File]│
└────────────────────────────────────────────┘

Documents List:
┌────────────────────────────────────────────┐
│ 📁 No documents linked yet                 │
│ Link briefs, motions, or other documents   │
└────────────────────────────────────────────┘
```

### Step 4: Test Linking Process
1. Click **"Link from Google Drive"**
2. Should trigger OAuth flow (Google login if not connected)
3. File picker opens with your Drive files
4. Select a file
5. File reference is saved (NOT uploaded!)
6. Document appears in list with:
   - ✅ Available status
   - 📁 Google Drive icon
   - File name
   - Date linked
7. Click **"Open"** button
8. Should open file in new Google Drive tab

---

## 🔍 WHY YOU'RE SEEING THE WRONG SCREEN

### Possible Reasons:

1. **You clicked "New Matter" instead of opening existing matter**
   - Solution: Go to Matters list, click existing matter

2. **You're in matter creation wizard**
   - Solution: Complete/cancel wizard, go to Matters list

3. **No existing matters in database**
   - Solution: Create a test matter first, then open it

---

## 📋 PRE-TESTING CHECKLIST

Before testing Documents tab:

- [ ] Have at least one existing matter in database
- [ ] Know how to access Matters page
- [ ] Can open a matter (either workbench or modal)
- [ ] Can see the Documents tab option
- [ ] Cloud storage configured (Settings → Cloud Storage)
- [ ] Google Drive OAuth credentials set up (if needed)

---

## 🎯 QUICK TEST SCRIPT

### 1. Create Test Matter (If Needed)
```
1. Click "New Matter" button
2. Fill in basic info
3. Submit
4. Matter created with ID
```

### 2. Open That Matter
```
1. Go to Matters page
2. Find the matter you just created
3. Click on it
4. Matter Workbench opens
```

### 3. Test Documents Tab
```
1. Click "Documents" tab
2. See privacy notice? ✅
3. See "Link Document" button? ✅
4. Click "Link from Google Drive"
5. OAuth flow triggered? ✅
6. Select file from picker
7. File appears in list? ✅
8. Click "Open" → Opens in Drive? ✅
```

---

## 🚨 TROUBLESHOOTING

### Issue: Can't find Documents tab
**Check:** Are you in Matter Workbench or Modal? Look for tabs at top.

### Issue: Still seeing "Basic Information" form
**Solution:** You're in matter creation. Cancel and open existing matter instead.

### Issue: Documents tab is there but looks different
**Check:** Does it say "Upload Document" or "Link Document"?
- If "Upload" → Wrong component (old system)
- If "Link" → Correct component (new system) ✅

### Issue: No matters in database
**Solution:** 
```sql
-- Check if you have matters
SELECT id, title, status FROM matters LIMIT 5;
```

---

## 📸 WHAT YOU SHOULD SEE

### Wrong Screen (What You Showed)
```
┌─────────────────────────────────────┐
│ 📄 Basic Information                │
│ Provide fundamental details...      │
│                                     │
│ Matter Title *                      │
│ [_____________________________]     │
│                                     │
│ Matter Type *                       │
│ [Select matter type ▼]              │
│                                     │
│ Court Case Number                   │
│ [_____________________________]     │
│                                     │
│ Description *                       │
│ [_____________________________]     │
│                                     │
│ [← Previous]        [Next →]        │
└─────────────────────────────────────┘
```
**This is:** NEW matter creation wizard  
**Not what you need!**

### Correct Screen (What You Need)
```
┌─────────────────────────────────────┐
│ Matter: Smith vs. ABC Insurance     │
│ [Overview][Time][Expenses][Services]│
│ [Documents] ← YOU NEED THIS TAB     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔒 Privacy Protected:               │
│ Your documents stay in your storage │
│ We only store references            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [+ Link from Google Drive]          │
│ [+ Link Local File]                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📁 brief.pdf                        │
│ ✅ Available • Google Drive         │
│ Linked Oct 25, 2025    [Open]      │
└─────────────────────────────────────┘
```
**This is:** Documents tab in existing matter  
**This is what you need to test!**

---

## ✅ SUMMARY

**You're testing the wrong thing!**

1. ❌ **Screenshot shows:** New matter creation form
2. ✅ **You need to test:** Documents tab in existing matter

**How to fix:**
1. Go to Matters page
2. Open an existing matter (not create new)
3. Click Documents tab
4. Test linking from there

---

## 🎓 UNDERSTANDING THE DIFFERENCE

### Matter Creation (What You're Looking At)
- **When:** Creating a brand new matter
- **Purpose:** Enter basic details
- **Stage:** Before matter exists
- **File:** `NewMatterWizardPage.tsx`

### Documents Tab (What You Need to Test)
- **When:** Working with existing matter
- **Purpose:** Link documents to matter
- **Stage:** After matter is created
- **Files:** `MatterWorkbenchPage.tsx`, `MatterDetailModal.tsx`

---

**Next Steps:**
1. Close the "New Matter" wizard (if open)
2. Go to Matters list
3. Open an existing matter
4. Find Documents tab
5. Test linking from there

That's where your privacy-first document system lives! 🚀
