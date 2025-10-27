# MatterModal Migration Guide

**Version:** 1.0 → 2.0
**Status:** Deprecation Period Active
**Removal Date:** v2.0 (TBD)

---

## Overview

The 6 separate matter modals have been consolidated into a single `MatterModal` component with mode-based rendering. This guide will help you migrate your code.

## Quick Migration

### Before (Old Way)
```typescript
import { MatterCreationModal } from '@/components/matters/MatterCreationModal';
import { EditMatterModal } from '@/components/matters/EditMatterModal';
import { MatterDetailModal } from '@/components/matters/MatterDetailModal';
import { QuickAddMatterModal } from '@/components/matters/QuickAddMatterModal';
import { AcceptBriefModal } from '@/components/matters/AcceptBriefModal';

// Multiple state variables
const [showCreate, setShowCreate] = useState(false);
const [showEdit, setShowEdit] = useState(false);
const [showDetail, setShowDetail] = useState(false);
const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);

// Multiple modal components
<MatterCreationModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
<EditMatterModal matter={selectedMatter} isOpen={showEdit} onClose={() => setShowEdit(false)} />
<MatterDetailModal matter={selectedMatter} isOpen={showDetail} onClose={() => setShowDetail(false)} />
```

### After (New Way)
```typescript
import { MatterModal, useMatterModal } from '@/components/modals/matter';

// Single hook manages all state
const matterModal = useMatterModal({
  onSuccess: (matter) => {
    console.log('Matter saved:', matter);
    refetchMatters();
  },
});

// Single modal component
<MatterModal
  mode={matterModal.mode}
  isOpen={matterModal.isOpen}
  onClose={matterModal.close}
  matter={matterModal.matter}
  onSuccess={matterModal.handleSuccess}
  onEdit={matterModal.handleEdit}
/>

// Trigger different modes
<button onClick={() => matterModal.openCreate()}>Create</button>
<button onClick={() => matterModal.openEdit(matter)}>Edit</button>
<button onClick={() => matterModal.openDetail(matter)}>View</button>
```

---

## Detailed Migration by Modal

### 1. MatterCreationModal → MatterModal (mode: create)

#### Before
```typescript
import { MatterCreationModal } from '@/components/matters/MatterCreationModal';

<MatterCreationModal
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleSubmit}
  firmId={firmId}
/>
```

#### After
```typescript
import { MatterModal } from '@/components/modals/matter';

<MatterModal
  mode="create"
  isOpen={isOpen}
  onClose={onClose}
  onSuccess={handleSubmit}  // Note: onSubmit → onSuccess
  firmId={firmId}
/>
```

**Changes:**
- `onSubmit` → `onSuccess`
- Add `mode="create"`

---

### 2. EditMatterModal → MatterModal (mode: edit)

#### Before
```typescript
import { EditMatterModal } from '@/components/matters/EditMatterModal';

<EditMatterModal
  matter={matter}
  isOpen={isOpen}
  onClose={onClose}
  onSave={handleSave}
/>
```

#### After
```typescript
import { MatterModal } from '@/components/modals/matter';

<MatterModal
  mode="edit"
  matter={matter}
  isOpen={isOpen}
  onClose={onClose}
  onSuccess={handleSave}  // Note: onSave → onSuccess
/>
```

**Changes:**
- `onSave` → `onSuccess`
- Add `mode="edit"`

---

### 3. MatterDetailModal → MatterModal (mode: detail)

#### Before
```typescript
import { MatterDetailModal } from '@/components/matters/MatterDetailModal';

<MatterDetailModal
  matter={matter}
  isOpen={isOpen}
  onClose={onClose}
  onEdit={handleEdit}
/>
```

#### After
```typescript
import { MatterModal } from '@/components/modals/matter';

<MatterModal
  mode="detail"
  matter={matter}
  isOpen={isOpen}
  onClose={onClose}
  onEdit={handleEdit}  // Same prop name
/>
```

**Changes:**
- Add `mode="detail"`
- `onEdit` stays the same

---

### 4. QuickAddMatterModal → MatterModal (mode: quick-add)

#### Before
```typescript
import { QuickAddMatterModal } from '@/components/matters/QuickAddMatterModal';

<QuickAddMatterModal
  isOpen={isOpen}
  onConfirm={handleConfirm}
  onClose={onClose}
  prefillData={data}
/>
```

#### After
```typescript
import { MatterModal } from '@/components/modals/matter';

<MatterModal
  mode="quick-add"
  isOpen={isOpen}
  onSuccess={handleConfirm}  // Note: onConfirm → onSuccess
  onClose={onClose}
  prefillData={data}
/>
```

**Changes:**
- `onConfirm` → `onSuccess`
- Add `mode="quick-add"`

---

### 5. AcceptBriefModal → MatterModal (mode: accept-brief)

#### Before
```typescript
import { AcceptBriefModal } from '@/components/matters/AcceptBriefModal';

<AcceptBriefModal
  isOpen={isOpen}
  matter={matter}
  onConfirm={handleConfirm}
  onClose={onClose}
/>
```

#### After
```typescript
import { MatterModal } from '@/components/modals/matter';

<MatterModal
  mode="accept-brief"
  matter={matter}
  isOpen={isOpen}
  onSuccess={handleConfirm}  // Note: onConfirm → onSuccess
  onClose={onClose}
/>
```

**Changes:**
- `onConfirm` → `onSuccess`
- Add `mode="accept-brief"`

---

## Using the Hook (Recommended)

The `useMatterModal` hook simplifies state management:

### Basic Usage
```typescript
import { MatterModal, useMatterModal } from '@/components/modals/matter';

function MyComponent() {
  const matterModal = useMatterModal({
    onSuccess: (matter) => {
      console.log('Success:', matter);
      refetchData();
    },
    onEdit: (matter) => {
      console.log('Editing:', matter);
    },
  });

  return (
    <>
      {/* Trigger buttons */}
      <button onClick={() => matterModal.openCreate()}>
        Create Matter
      </button>
      
      <button onClick={() => matterModal.openQuickAdd()}>
        Quick Add
      </button>
      
      <button onClick={() => matterModal.openEdit(selectedMatter)}>
        Edit Matter
      </button>
      
      <button onClick={() => matterModal.openDetail(selectedMatter)}>
        View Details
      </button>

      {/* Single modal */}
      <MatterModal
        mode={matterModal.mode}
        isOpen={matterModal.isOpen}
        onClose={matterModal.close}
        matter={matterModal.matter}
        matterId={matterModal.matterId}
        prefillData={matterModal.prefillData}
        onSuccess={matterModal.handleSuccess}
        onEdit={matterModal.handleEdit}
      />
    </>
  );
}
```

### Hook API
```typescript
const matterModal = useMatterModal(options);

// Open methods
matterModal.openCreate(prefillData?)
matterModal.openEdit(matter)
matterModal.openView(matter)
matterModal.openQuickAdd(prefillData?)
matterModal.openAcceptBrief(matter)
matterModal.openDetail(matter)

// Close
matterModal.close()

// State
matterModal.isOpen      // boolean
matterModal.mode        // MatterMode
matterModal.matter      // Matter | null
matterModal.matterId    // string | undefined
matterModal.prefillData // Partial<Matter> | undefined

// Handlers
matterModal.handleSuccess(matter)
matterModal.handleEdit(matter)
```

---

## Migration Checklist

### For Each File Using Matter Modals

- [ ] Find all matter modal imports
- [ ] Replace with `import { MatterModal, useMatterModal } from '@/components/modals/matter'`
- [ ] Replace modal state with `useMatterModal` hook
- [ ] Update prop names (onSubmit → onSuccess, onSave → onSuccess, onConfirm → onSuccess)
- [ ] Add `mode` prop
- [ ] Replace multiple modal components with single `<MatterModal />`
- [ ] Test all modal modes
- [ ] Remove old imports

### Example Checklist for MattersPage.tsx
- [ ] Import new MatterModal
- [ ] Add useMatterModal hook
- [ ] Update create button to use `matterModal.openCreate()`
- [ ] Update edit button to use `matterModal.openEdit(matter)`
- [ ] Update view button to use `matterModal.openDetail(matter)`
- [ ] Replace old modal components with new MatterModal
- [ ] Test create flow
- [ ] Test edit flow
- [ ] Test view flow
- [ ] Remove old imports

---

## Backward Compatibility

During the deprecation period, old modal components still work via deprecation wrappers:

```typescript
// This still works but shows console warning
import { MatterCreationModal } from '@/components/matters/MatterCreationModal';
<MatterCreationModal isOpen={isOpen} onClose={onClose} />
// ⚠️ Console: "MatterCreationModal is deprecated. Use MatterModal with mode='create'"
```

**Deprecation wrappers will be removed in v2.0**

---

## Common Patterns

### Pattern 1: List Page with Create/Edit/View
```typescript
function MattersPage() {
  const [matters, setMatters] = useState<Matter[]>([]);
  
  const matterModal = useMatterModal({
    onSuccess: () => {
      refetchMatters();
    },
  });

  return (
    <>
      <button onClick={() => matterModal.openCreate()}>
        Create Matter
      </button>

      {matters.map(matter => (
        <div key={matter.id}>
          <h3>{matter.title}</h3>
          <button onClick={() => matterModal.openView(matter)}>View</button>
          <button onClick={() => matterModal.openEdit(matter)}>Edit</button>
        </div>
      ))}

      <MatterModal
        mode={matterModal.mode}
        isOpen={matterModal.isOpen}
        onClose={matterModal.close}
        matter={matterModal.matter}
        onSuccess={matterModal.handleSuccess}
        onEdit={matterModal.handleEdit}
      />
    </>
  );
}
```

### Pattern 2: Quick Add from Attorney Submission
```typescript
function handleAttorneySubmission(submissionData: any) {
  matterModal.openQuickAdd({
    instructing_firm: submissionData.firm,
    instructing_attorney: submissionData.attorney,
    instructing_attorney_email: submissionData.email,
    title: submissionData.matterTitle,
    description: submissionData.description,
  });
}
```

### Pattern 3: Accept Brief Flow
```typescript
function handleNewRequest(matter: Matter) {
  if (matter.status === 'new_request') {
    matterModal.openAcceptBrief(matter);
  }
}
```

---

## Troubleshooting

### Issue: TypeScript errors on prop names
**Solution:** Update prop names:
- `onSubmit` → `onSuccess`
- `onSave` → `onSuccess`
- `onConfirm` → `onSuccess`

### Issue: Modal doesn't open
**Solution:** Check that you're passing `isOpen={matterModal.isOpen}`

### Issue: Callback not firing
**Solution:** Make sure you're using `onSuccess={matterModal.handleSuccess}`

### Issue: Matter data not loading
**Solution:** Pass either `matter={matterModal.matter}` or `matterId={matterModal.matterId}`

---

## Benefits of Migration

1. **Less Code** - One modal instead of 6
2. **Consistent API** - Same props across all modes
3. **Better State Management** - Hook handles complexity
4. **Easier Testing** - Test one component with different modes
5. **Better Performance** - Lazy loading, code splitting
6. **Easier Maintenance** - Update one place, affects all modes

---

## Support

**Questions?** Check:
1. [QUICK_START.md](./QUICK_START.md) - Implementation examples
2. [design.md](./design.md) - Architecture patterns
3. [PHASE_1_WEEK_1_COMPLETE.md](./PHASE_1_WEEK_1_COMPLETE.md) - Implementation details

**Issues?** Document in `.kiro/specs/ux-consolidation/ISSUES.md`

---

**Last Updated:** 2025-01-27
**Deprecation Period:** Active
**Removal Date:** v2.0 (TBD)
