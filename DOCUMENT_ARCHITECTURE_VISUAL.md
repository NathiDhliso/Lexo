# 🏗️ Document System Architecture - Visual Guide

## SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S ENVIRONMENT                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ☁️ Google Drive        ☁️ OneDrive        💻 Local Files  │
│  ├─ brief.pdf          ├─ motion.docx      ├─ affidavit.pdf│
│  ├─ evidence.jpg       ├─ contract.pdf     └─ witness.txt  │
│  └─ correspondence/    └─ discovery/                        │
│                                                              │
│  🔑 User maintains full access control                      │
│  🔒 Files never leave user's storage                        │
│  💰 User pays for storage (not you)                         │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ ① User links file
                     │ (No upload happens)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  YOUR APPLICATION (LexoHub)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📱 Matter Workbench                                         │
│  └─ Documents Tab (NEW COMPONENT)                           │
│     ├─ 🔗 Link Document button                              │
│     ├─ 🔒 Privacy notice                                    │
│     ├─ 📋 Linked documents list                             │
│     └─ ✅ Status indicators                                 │
│                                                              │
│  Components:                                                 │
│  ├─ DocumentsTab (components/documents/) ✅ ACTIVE          │
│  ├─ LinkDocumentModal                                       │
│  ├─ DocumentBrowser                                         │
│  └─ CloudStorageSetupWizard                                 │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ ② Create reference
                     │ (Metadata only)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              YOUR DATABASE (Supabase)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 document_references                                      │
│  ├─ id: uuid                                                │
│  ├─ file_name: "brief.pdf" ← Name only!                     │
│  ├─ storage_provider: "google_drive"                        │
│  ├─ provider_file_id: "abc123xyz" ← Drive ID                │
│  ├─ provider_web_url: "https://drive.google.com/..."        │
│  ├─ verification_status: "available"                        │
│  ├─ file_size_bytes: 245760                                 │
│  ├─ mime_type: "application/pdf"                            │
│  └─ ❌ NO FILE CONTENTS STORED!                             │
│                                                              │
│  🔗 matter_document_links                                    │
│  ├─ matter_id: uuid                                         │
│  ├─ document_reference_id: uuid                             │
│  ├─ link_reason: "Primary brief"                            │
│  └─ is_primary: true                                        │
│                                                              │
│  📝 document_access_logs (optional)                          │
│  └─ Audit trail of when documents accessed                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## DATA FLOW: LINKING A DOCUMENT

```
USER ACTION                     SYSTEM RESPONSE
─────────────────────────────────────────────────────────────

1️⃣ Click "Documents" tab
                        →      Load DocumentsTab component
                        →      Show privacy notice
                        →      Display linked documents

2️⃣ Click "Link Document"
                        →      Open LinkDocumentModal
                        →      Check cloud connections
                        →      Show provider selection

3️⃣ Select Google Drive
                        →      Open DocumentBrowser
                        →      Authenticate with Google
                        →      Load file tree from Drive

4️⃣ Navigate folders
                        →      Call Google Drive API
                        →      Display files & folders
                        →      Allow file selection

5️⃣ Select "brief.pdf"
                        →      Get file metadata from Drive
                        →      Create document_reference
                        →      Link to current matter
                        →      ❌ NO FILE UPLOAD!

6️⃣ Document appears in list
                        →      Show file name
                        →      Show "Available" status
                        →      Show "Open" button
                        →      File still in user's Drive!
```

---

## COMPONENT ARCHITECTURE

```
MatterWorkbenchPage
├─ Matter header
├─ Action buttons (Path A/B)
├─ Tab navigation
└─ Tab content
   └─ [Documents Tab Selected]
      ↓
      DocumentsTab (components/documents/) ← CORRECT ONE!
      ├─ Privacy notice (green box)
      ├─ Action buttons
      │  ├─ "Verify All" button
      │  └─ "Link Document" button
      │     ↓
      │     LinkDocumentModal
      │     ├─ Provider selection
      │     ├─ DocumentBrowser
      │     │  └─ Cloud file tree
      │     └─ Local file picker
      │
      └─ Documents list
         └─ For each document:
            ├─ Status icon (✅❌⚠️)
            ├─ File name
            ├─ Storage provider icon
            ├─ Linked date
            ├─ "Open" button → Opens in cloud
            └─ "Unlink" button → Removes reference
```

---

## OLD vs NEW SYSTEM COMPARISON

### 🔴 OLD SYSTEM (Deprecated)

```
Component: src/components/matters/DocumentsTab.tsx

Flow:
┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───→│  Upload  │───→│ Supabase │
│  selects │    │   File   │    │ Storage  │
│   file   │    │          │    │  Bucket  │
└──────────┘    └──────────┘    └──────────┘

Stored:
├─ File contents (blob) ← PRIVACY RISK!
├─ File metadata
└─ Storage path

Access:
└─ Download from Supabase bucket

Concerns:
❌ Files stored on your server
❌ Storage costs increase
❌ POPIA compliance issues
❌ Data breach exposes files
❌ User loses control
```

### 🟢 NEW SYSTEM (Active)

```
Component: src/components/documents/DocumentsTab.tsx

Flow:
┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───→│   Link   │───→│ Database │
│  selects │    │Reference │    │(metadata)│
│   file   │    │   Only   │    │   only   │
└──────────┘    └──────────┘    └──────────┘
     │
     └─────────────────────────→ File stays
                                 in user's
                                 cloud storage

Stored:
├─ File name
├─ Storage provider
├─ Provider file ID
├─ Web URL
└─ ❌ NO FILE CONTENTS!

Access:
└─ Open directly in user's cloud storage

Benefits:
✅ Files stay in user's storage
✅ No storage costs for you
✅ Better POPIA compliance
✅ Data breach only exposes metadata
✅ User maintains full control
```

---

## DATABASE SCHEMA

```
document_references
├─ id (uuid, PK)
├─ firm_id (uuid, FK)
├─ created_by (uuid, FK → users)
├─ file_name (text) ← "brief.pdf"
├─ file_extension (text) ← "pdf"
├─ file_size_bytes (bigint) ← 245760
├─ mime_type (text) ← "application/pdf"
├─ storage_provider (text) ← "google_drive"
├─ provider_file_id (text) ← "1ABC...XYZ"
├─ provider_file_path (text) ← "/Legal/Matters/Smith/brief.pdf"
├─ provider_web_url (text) ← "https://drive.google.com/file/d/..."
├─ provider_download_url (text) ← Direct download link
├─ local_file_path (text) ← For desktop app: "C:/Documents/..."
├─ document_type (text) ← "brief" | "motion" | "contract" | etc.
├─ tags (text[]) ← ["urgent", "confidential"]
├─ description (text) ← Optional notes
├─ is_confidential (boolean) ← Flag for sensitivity
├─ access_level (text) ← "private" | "firm" | "matter_team"
├─ verification_status (text) ← "available" | "missing" | "access_denied"
├─ last_verified_at (timestamptz) ← When availability checked
├─ created_at (timestamptz)
└─ updated_at (timestamptz)

matter_document_links
├─ id (uuid, PK)
├─ matter_id (uuid, FK → matters)
├─ document_reference_id (uuid, FK → document_references)
├─ linked_by (uuid, FK → users)
├─ link_reason (text) ← "Primary brief for matter"
├─ is_primary (boolean) ← Mark main document
├─ linked_at (timestamptz)
└─ updated_at (timestamptz)

document_access_logs (optional)
├─ id (uuid, PK)
├─ document_reference_id (uuid, FK)
├─ user_id (uuid, FK)
├─ action (text) ← "viewed" | "downloaded" | "verified"
├─ accessed_at (timestamptz)
└─ ip_address (inet)
```

---

## SECURITY MODEL

```
┌─────────────────────────────────────────────┐
│         THREAT: Database Breach             │
└─────────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
    OLD SYSTEM              NEW SYSTEM
         │                       │
         ↓                       ↓
┌─────────────────┐    ┌─────────────────┐
│  Attacker Gets: │    │  Attacker Gets: │
├─────────────────┤    ├─────────────────┤
│ • File contents │    │ • File names    │
│   (full PDFs!)  │    │ • Locations     │
│ • Confidential  │    │ • Metadata      │
│   documents     │    │                 │
│ • Everything!   │    │ ❌ NO FILES!    │
└─────────────────┘    └─────────────────┘
         │                       │
         ↓                       ↓
    🚨 DISASTER!            ✅ Contained


┌─────────────────────────────────────────────┐
│        COMPLIANCE: POPIA/GDPR               │
└─────────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
    OLD SYSTEM              NEW SYSTEM
         │                       │
         ↓                       ↓
┌─────────────────┐    ┌─────────────────┐
│ You are a data  │    │ You are NOT a   │
│ controller for  │    │ data controller │
│ file contents   │    │ for files       │
│                 │    │                 │
│ Must secure:    │    │ Must secure:    │
│ • File storage  │    │ • Metadata only │
│ • Backups       │    │                 │
│ • Access        │    │ Users control:  │
│ • Retention     │    │ • Their files   │
│                 │    │ • Access        │
│ Higher burden!  │    │ • Retention     │
└─────────────────┘    └─────────────────┘
         │                       │
         ↓                       ↓
   Complex compliance       Simplified
```

---

## USER PRIVACY FLOW

```
USER'S PERSPECTIVE:

Old System (Upload):
1. Select file on my computer
2. Click "Upload"
3. File transferred to LexoHub server
4. ❓ Where is my file now?
5. ❓ Who has access?
6. ❓ What if I want to delete it?
7. 😟 Not sure I trust this...

New System (Link):
1. Select file in MY Google Drive
2. Click "Link"
3. LexoHub saves reference
4. ✅ File still in MY Drive
5. ✅ I control access
6. ✅ I can delete anytime
7. ✅ I can move/rename file
8. 😊 I'm in control!


COUNSEL'S PERSPECTIVE:

Old System:
1. Upload attorney's brief
2. Store on my server
3. 💰 Pay for storage
4. 😰 Worry about security
5. 😰 Worry about compliance
6. 😰 Worry about backups
7. 😰 Worry about retention
8. 😰 Worry about breaches

New System:
1. Link attorney's brief from my Drive
2. Store reference only
3. ✅ No storage costs
4. ✅ Google handles security
5. ✅ Better compliance
6. ✅ Google handles backups
7. ✅ I control retention
8. ✅ Breach risk minimized
9. 😊 Peace of mind!
```

---

## COST COMPARISON

```
OLD SYSTEM (Upload-Based):

Storage Costs (Monthly):
├─ 100 matters
├─ 10 documents per matter avg
├─ 5 MB per document avg
├─ = 5,000 MB = 5 GB
└─ Supabase Storage: ~$20/month
   (grows over time!)

NEW SYSTEM (Link-Based):

Storage Costs (Monthly):
├─ 100 matters
├─ 10 documents per matter avg
├─ Metadata only: ~2 KB per reference
├─ = 2,000 KB = 2 MB
└─ Database Storage: < $1/month
   (minimal growth!)

SAVINGS: ~$19/month → $228/year
(And scales much better as you grow!)
```

---

## THE FIX VISUALIZED

```
BEFORE (Wrong Import):

MatterWorkbenchPage.tsx
└─ import DocumentsTab from 'components/matters/'
   └─ Renders UPLOAD-based component
      └─ User sees "Upload Document" button
         └─ Files uploaded to server
            └─ ❌ Privacy risk!


AFTER (Fixed Import):

MatterWorkbenchPage.tsx
└─ import DocumentsTab from 'components/documents/'
   └─ Renders LINK-based component
      └─ User sees "Link Document" button
         └─ Files linked from cloud
            └─ ✅ Privacy protected!


THE CHANGE:

- import { DocumentsTab } from '../components/matters/DocumentsTab';
+ import { DocumentsTab } from '../components/documents/DocumentsTab';

One line. Massive impact! 🎉
```

---

## SUMMARY

### What Changed
- ✅ One import statement
- ✅ Wrong component → Right component
- ✅ Upload system → Link system
- ✅ Privacy risk → Privacy protected

### What This Unlocks
- ✅ Document reference system (already built!)
- ✅ Cloud storage integration (already working!)
- ✅ Privacy-first approach (now active!)
- ✅ Cost savings (no storage fees!)
- ✅ Better compliance (reduced liability!)

### What You Need to Do
1. Test the Documents tab
2. Verify linking works
3. Configure OAuth if needed
4. Train users on new system
5. Deploy to production

---

**The system was complete. It just wasn't connected. Now it is!** 🚀
