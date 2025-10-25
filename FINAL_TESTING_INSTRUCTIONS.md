# 🎯 FINAL CLEAR INSTRUCTIONS: How to Test Documents Tab

## WHERE YOU ARE RIGHT NOW

You're looking at: **NewMatterWizardPage.tsx**
- Purpose: Create NEW matters
- No Documents tab here (and that's correct!)

---

## WHERE DOCUMENTS TAB IS

Documents tab lives in **MatterWorkbenchPage.tsx**
- Purpose: Manage EXISTING matters
- Has tabs: Overview, Time, Expenses, Services, **Documents**, Invoicing

---

## 📋 STEP-BY-STEP TESTING

### Option 1: Create New Matter & Test

**1. Complete the Wizard (where you are now)**
```
Fill in the form:
├─ Matter Title: "Test Document Linking"
├─ Matter Type: Any type
├─ Description: "Testing new document system"
├─ Client Name: "Test Client"
├─ Client Email: "test@example.com"
├─ Attorney: "Test Attorney"
├─ Firm: "Test Firm"
├─ Attorney Email: "attorney@test.com"
└─ Estimated Fee: 10000

Click through: Next → Next → Next → Create Matter
```

**2. Navigate to the Created Matter**
```
After creating:
├─ Should redirect to Matters page (or workbench)
├─ If on Matters list: Click the matter you just created
└─ Matter Workbench opens
```

**3. Find Documents Tab**
```
Look for tabs at top of workbench:
[Overview] [Time] [Expenses] [Services] [Documents] [Invoicing]
                                         ^^^^^^^^^^^
                                         CLICK HERE!
```

**4. Test Document Linking**
```
On Documents tab:
├─ See privacy notice? ✅
├─ See "Link from Google Drive" button? ✅
├─ See "Upload Document" button? ❌ (should NOT see this)
├─ Click "Link from Google Drive"
├─ OAuth flow triggers
├─ Select test file
├─ File appears in list with "Available" status
└─ Click "Open" → Opens in Google Drive
```

---

### Option 2: Use Existing Matter

If you already have matters:

**1. Go to Matters Page**
```
Navigate: Click "Matters" in main navigation
```

**2. Open Any Matter**
```
Click on any matter row in the list
→ Matter Workbench opens
```

**3. Click Documents Tab**
```
Look for tabs, click "Documents"
```

**4. Test Linking**
```
Follow step 4 from Option 1 above
```

---

## 🔍 WHAT YOU SHOULD SEE

### When Documents Tab Loads:

```
┌────────────────────────────────────────────┐
│ Linked Documents        [Verify All] [+]   │
├────────────────────────────────────────────┤
│                                            │
│ 🔒 Privacy Protected:                      │
│ Your documents stay in your storage.       │
│ We only store references.                  │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│ [Link from Google Drive]                   │
│ [Link Local File]                          │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│ 📁 No documents linked yet                 │
│ Link documents from your cloud storage     │
│                                            │
└────────────────────────────────────────────┘
```

### After Linking a Document:

```
┌────────────────────────────────────────────┐
│ 📁 brief_smith_case.pdf                    │
│ ✅ Available • Google Drive                │
│ Linked Oct 25, 2025         [Open] [X]     │
└────────────────────────────────────────────┘
```

---

## ❌ WHAT YOU SHOULD NOT SEE

- ❌ "Upload Document" button
- ❌ File upload input
- ❌ "Drag and drop files here"
- ❌ Progress bars for uploading

---

## 🎯 NAVIGATION MAP

```
Your Current Location:
/matters/new (NewMatterWizardPage)
└─ Step 1: Basic Information ← YOU ARE HERE

Where You Need To Go:
/matters/:id (MatterWorkbenchPage)
└─ Documents Tab ← TEST HERE

How To Get There:
1. Complete wizard (create matter)
2. Click on created matter
3. Click Documents tab
```

---

## 🚨 TROUBLESHOOTING

### "I can't find Documents tab"
- **Check:** Are you in Matter Workbench or still in creation wizard?
- **Solution:** Make sure you completed wizard and opened an existing matter

### "I see 'Upload' instead of 'Link'"
- **Problem:** Wrong component being used
- **Solution:** This should not happen anymore after our fix today!

### "Documents tab is empty"
- **That's correct!** It should be empty until you link documents
- Click "Link from Google Drive" to start

### "Can't find any matters"
- **Solution:** Complete the wizard to create your first test matter

---

## ✅ SUCCESS CRITERIA

You'll know it's working when:

1. ✅ Privacy notice visible on Documents tab
2. ✅ "Link from Google Drive" button (not "Upload")
3. ✅ Can click and OAuth flow triggers
4. ✅ Can select file from Drive
5. ✅ File appears in list (not uploaded to server)
6. ✅ Can click "Open" → Opens in Google Drive
7. ✅ File stays in user's Drive, only reference stored

---

## 🎓 UNDERSTANDING THE DIFFERENCE

| Aspect | Matter Creation (Your Screenshot) | Documents Tab (What You Need) |
|--------|-----------------------------------|-------------------------------|
| **File** | NewMatterWizardPage.tsx | MatterWorkbenchPage.tsx |
| **When** | Creating NEW matter | Managing EXISTING matter |
| **Purpose** | Enter matter details | Link documents to matter |
| **Has Documents?** | ❌ No | ✅ Yes |
| **URL** | /matters/new | /matters/:id |

---

## 📱 QUICK COMMANDS

### If using dev server:
```bash
# Start dev server (if not running)
npm run dev

# Navigate in browser:
1. http://localhost:5173/matters/new  ← Where you are
2. Complete wizard
3. http://localhost:5173/matters      ← Go here
4. Click a matter
5. Click Documents tab                ← Test here
```

---

## 🎯 FINAL ANSWER

**Q: Is the form I'm seeing supposed to have Documents tab?**  
**A: NO! That form creates new matters. Documents tab is in a different place.**

**Q: Where do I test document linking?**  
**A: After creating a matter, open it, then click Documents tab.**

**Q: Do I need to change anything in NewMatterWizardPage?**  
**A: NO! It's correct as-is. Just use it to create a test matter.**

---

**Next Action:** Complete the wizard, create a matter, then open that matter to test Documents tab! 🚀
