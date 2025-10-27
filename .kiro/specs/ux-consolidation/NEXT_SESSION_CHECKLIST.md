# Next Session Checklist

**Goal:** Complete MatterModal integration and start WorkItemModal

## 🎯 Session 2 Objectives

### Part 1: MatterModal Integration (1-2 hours)

#### 1. Create Deprecation Wrappers
- [ ] Create `src/components/matters/MatterCreationModal.tsx` (wrapper)
- [ ] Create `src/components/matters/EditMatterModal.tsx` (wrapper)
- [ ] Create `src/components/matters/MatterDetailModal.tsx` (wrapper)
- [ ] Create `src/components/matters/QuickAddMatterModal.tsx` (wrapper)
- [ ] Create `src/components/matters/AcceptBriefModal.tsx` (wrapper)
- [ ] Add deprecation warnings to console
- [ ] Test backward compatibility

#### 2. Update Pilot Pages
- [ ] Update `src/pages/MattersPage.tsx`
  - [ ] Import new MatterModal
  - [ ] Use useMatterModal hook
  - [ ] Test create mode
  - [ ] Test view mode
  - [ ] Test edit mode
- [ ] Update `src/pages/MatterWorkbenchPage.tsx`
  - [ ] Import new MatterModal
  - [ ] Test detail mode
  - [ ] Test edit mode
- [ ] Test `src/pages/attorney/SubmitMatterRequestPage.tsx`
  - [ ] Verify quick-add mode works
  - [ ] Verify accept-brief mode works

#### 3. Quick Testing
- [ ] Test all 6 modes in browser
- [ ] Test form validation
- [ ] Test error handling
- [ ] Test success callbacks
- [ ] Test dark mode
- [ ] Test mobile responsive

### Part 2: WorkItemModal Foundation (1-2 hours)

#### 1. Create Directory Structure
```bash
mkdir -p src/components/modals/work-item/{forms,views,hooks}
```

#### 2. Create Main Component
- [ ] Create `src/components/modals/work-item/WorkItemModal.tsx`
  - [ ] Define WorkItemType: 'service' | 'time' | 'disbursement'
  - [ ] Define WorkItemMode: 'create' | 'edit' | 'quick'
  - [ ] Implement mode-based rendering

#### 3. Create Form Components
- [ ] Create `ServiceForm.tsx` (from LogServiceModal)
- [ ] Create `TimeEntryForm.tsx` (from TimeEntryModal)
- [ ] Create `DisbursementForm.tsx` (from LogDisbursementModal)

#### 4. Create Hook
- [ ] Create `useWorkItemModal.ts`
  - [ ] openCreateService()
  - [ ] openCreateTime()
  - [ ] openCreateDisbursement()
  - [ ] openEdit()
  - [ ] close()

## 📝 Code Templates

### Deprecation Wrapper Template
```typescript
/**
 * @deprecated Use MatterModal with mode="create" instead
 * This wrapper will be removed in v2.0
 * 
 * Migration:
 * ```typescript
 * // Before
 * <MatterCreationModal isOpen={isOpen} onClose={onClose} />
 * 
 * // After
 * <MatterModal mode="create" isOpen={isOpen} onClose={onClose} />
 * ```
 */
import React, { useEffect } from 'react';
import { MatterModal } from '../modals/matter/MatterModal';
import type { MatterModalProps } from '../modals/matter/MatterModal';

export interface MatterCreationModalProps extends Omit<MatterModalProps, 'mode'> {}

export const MatterCreationModal: React.FC<MatterCreationModalProps> = (props) => {
  useEffect(() => {
    console.warn(
      'MatterCreationModal is deprecated. Use MatterModal with mode="create" instead. ' +
      'This component will be removed in v2.0. ' +
      'See migration guide: .kiro/specs/ux-consolidation/MIGRATION_GUIDE.md'
    );
  }, []);

  return <MatterModal mode="create" {...props} />;
};

export default MatterCreationModal;
```

### Page Update Template
```typescript
// Before
import { MatterCreationModal } from '@/components/matters/MatterCreationModal';
import { EditMatterModal } from '@/components/matters/EditMatterModal';

const [showCreate, setShowCreate] = useState(false);
const [showEdit, setShowEdit] = useState(false);
const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);

<MatterCreationModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
<EditMatterModal matter={selectedMatter} isOpen={showEdit} onClose={() => setShowEdit(false)} />

// After
import { MatterModal, useMatterModal } from '@/components/modals/matter';

const matterModal = useMatterModal({
  onSuccess: (matter) => {
    refetchMatters();
  },
});

<button onClick={() => matterModal.openCreate()}>Create</button>
<button onClick={() => matterModal.openEdit(matter)}>Edit</button>

<MatterModal
  mode={matterModal.mode}
  isOpen={matterModal.isOpen}
  onClose={matterModal.close}
  matter={matterModal.matter}
  onSuccess={matterModal.handleSuccess}
  onEdit={matterModal.handleEdit}
/>
```

## ✅ Success Criteria

### MatterModal Integration
- [ ] All deprecation wrappers working
- [ ] 2-3 pages updated successfully
- [ ] All 6 modes tested in browser
- [ ] Zero regressions found
- [ ] Team can use new modal

### WorkItemModal Foundation
- [ ] Main component created
- [ ] 3 form components created
- [ ] Hook created
- [ ] Basic functionality working

## 📊 Progress Tracking

After Session 2, we should have:
- ✅ MatterModal: Complete + Integrated
- ✅ WorkItemModal: Foundation complete
- **Progress:** 2/6 modal groups (33%)

## 🚨 Potential Issues

### Watch Out For
1. **Import paths** - Make sure all imports are correct
2. **Type mismatches** - Old props vs new props
3. **Missing callbacks** - onSuccess, onEdit, etc.
4. **State management** - Ensure modal state is properly managed
5. **Form validation** - Verify all validation still works

### Quick Fixes
- If imports fail: Check relative paths
- If types fail: Check MatterModalProps interface
- If callbacks fail: Check useMatterModal hook
- If validation fails: Check form component implementation

## 📚 Reference Documents

- Main spec: `.kiro/specs/ux-consolidation/README.md`
- Quick start: `.kiro/specs/ux-consolidation/QUICK_START.md`
- Design patterns: `.kiro/specs/ux-consolidation/design.md`
- Task list: `.kiro/specs/ux-consolidation/tasks.md`
- Session 1 summary: `UX_CONSOLIDATION_SESSION_1_SUMMARY.md`

## ⏱️ Time Estimates

- Deprecation wrappers: 30 minutes
- Update pilot pages: 45 minutes
- Testing: 30 minutes
- WorkItemModal foundation: 1.5 hours
- **Total:** 3-4 hours

## 🎯 End Goal

By end of Session 2:
1. MatterModal fully integrated and tested
2. WorkItemModal foundation complete
3. Clear path to complete Phase 1
4. Team can start using consolidated modals

---

**Ready to start?** Follow this checklist step by step!
**Questions?** Check the reference documents above.
**Issues?** Document them and we'll address in next session.

**Let's keep the momentum going! 🚀**
