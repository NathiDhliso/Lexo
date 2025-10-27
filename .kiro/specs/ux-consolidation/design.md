# UX Consolidation Design

## Architecture Patterns

### Pattern 1: Mode-Based Modal Component

```typescript
// Base pattern for all consolidated modals
interface BaseModalProps<T extends string> {
  mode: T;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
}

// Example: MatterModal
type MatterMode = 'create' | 'edit' | 'view' | 'quick-add' | 'accept-brief' | 'detail';

interface MatterModalProps extends BaseModalProps<MatterMode> {
  matterId?: string;
  firmId?: string;
  initialData?: Partial<Matter>;
}

// Implementation structure
export function MatterModal({ mode, matterId, ...props }: MatterModalProps) {
  // Shared state and logic
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Mode-specific rendering
  const renderContent = () => {
    switch (mode) {
      case 'create':
        return <CreateMatterForm {...props} />;
      case 'edit':
        return <EditMatterForm matter={matter} {...props} />;
      case 'view':
        return <ViewMatterDetails matter={matter} {...props} />;
      case 'quick-add':
        return <QuickAddMatterForm {...props} />;
      case 'accept-brief':
        return <AcceptBriefForm {...props} />;
      case 'detail':
        return <MatterDetailView matter={matter} {...props} />;
      default:
        return null;
    }
  };
  
  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      size={getSizeForMode(mode)}
      title={getTitleForMode(mode)}
    >
      {renderContent()}
    </Modal>
  );
}
```

### Pattern 2: Tab-Based Page Consolidation

```typescript
// FinancialPage with tab navigation
export function FinancialPage() {
  const [activeTab, setActiveTab] = useState<FinancialTab>('invoices');
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const tab = searchParams.get('tab') as FinancialTab;
    if (tab) setActiveTab(tab);
  }, [searchParams]);
  
  return (
    <div className="financial-page">
      <PageHeader title="Financial Management" />
      
      <TabNavigation
        tabs={[
          { id: 'invoices', label: 'Invoices', icon: FileText },
          { id: 'credits', label: 'Credit Notes', icon: Receipt },
          { id: 'proformas', label: 'Pro Formas', icon: FileCheck },
          { id: 'disputes', label: 'Disputes', icon: AlertCircle },
          { id: 'payments', label: 'Payments', icon: DollarSign },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      
      <TabContent>
        {activeTab === 'invoices' && <InvoicesTab />}
        {activeTab === 'credits' && <CreditNotesTab />}
        {activeTab === 'proformas' && <ProFormasTab />}
        {activeTab === 'disputes' && <DisputesTab />}
        {activeTab === 'payments' && <PaymentsTab />}
      </TabContent>
    </div>
  );
}
```

### Pattern 3: Master-Detail Layout

```typescript
// ProFormas with master-detail pattern
export function ProFormasTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  return (
    <div className="master-detail-layout">
      <div className="master-panel">
        <ProFormaList
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
      </div>
      
      <div className="detail-panel">
        {selectedId ? (
          <ProFormaDetail proFormaId={selectedId} />
        ) : (
          <EmptyState
            icon={FileCheck}
            title="Select a pro forma"
            description="Choose a pro forma from the list to view details"
          />
        )}
      </div>
    </div>
  );
}
```

## Component Structure

### Consolidated Modal Directory Structure

```
src/components/modals/
├── matter/
│   ├── MatterModal.tsx              # Main consolidated modal
│   ├── forms/
│   │   ├── CreateMatterForm.tsx
│   │   ├── EditMatterForm.tsx
│   │   ├── QuickAddMatterForm.tsx
│   │   └── AcceptBriefForm.tsx
│   ├── views/
│   │   ├── MatterDetailView.tsx
│   │   └── ViewMatterDetails.tsx
│   └── hooks/
│       ├── useMatterModal.ts
│       └── useMatterForm.ts
├── work-item/
│   ├── WorkItemModal.tsx
│   ├── forms/
│   │   ├── ServiceForm.tsx
│   │   ├── TimeEntryForm.tsx
│   │   └── DisbursementForm.tsx
│   └── hooks/
│       └── useWorkItemModal.ts
├── payment/
│   ├── PaymentModal.tsx
│   ├── forms/
│   │   ├── RecordPaymentForm.tsx
│   │   └── EditPaymentForm.tsx
│   ├── views/
│   │   ├── PaymentDetailsView.tsx
│   │   └── InvoiceDetailsView.tsx
│   └── hooks/
│       └── usePaymentModal.ts
├── retainer/
│   ├── RetainerModal.tsx
│   ├── forms/
│   │   ├── CreateRetainerForm.tsx
│   │   ├── DepositForm.tsx
│   │   ├── DrawdownForm.tsx
│   │   └── RefundForm.tsx
│   └── hooks/
│       └── useRetainerModal.ts
└── shared/
    ├── ModalHeader.tsx
    ├── ModalFooter.tsx
    └── ModalActions.tsx
```

### Consolidated Page Directory Structure

```
src/pages/
├── financial/
│   ├── FinancialPage.tsx            # Main consolidated page
│   ├── tabs/
│   │   ├── InvoicesTab.tsx
│   │   ├── CreditNotesTab.tsx
│   │   ├── ProFormasTab.tsx
│   │   ├── DisputesTab.tsx
│   │   └── PaymentsTab.tsx
│   └── components/
│       ├── FinancialFilters.tsx
│       └── FinancialExport.tsx
├── dashboard/
│   ├── DashboardPage.tsx            # Unified dashboard
│   ├── views/
│   │   ├── EnhancedView.tsx
│   │   └── ClassicView.tsx
│   └── components/
│       └── ViewToggle.tsx
└── matters/
    ├── MattersPage.tsx
    ├── MatterWorkbenchPage.tsx
    └── components/
        └── MatterFilters.tsx
```

## Modal Size Strategy

```typescript
// Modal size configuration
const MODAL_SIZES = {
  sm: 'max-w-md',      // Quick actions, confirmations
  md: 'max-w-2xl',     // Standard forms
  lg: 'max-w-4xl',     // Complex forms, detail views
  xl: 'max-w-6xl',     // Wizards, multi-step
  full: 'w-screen h-screen', // Full-screen editors
};

// Size mapping by mode
const getMatterModalSize = (mode: MatterMode): keyof typeof MODAL_SIZES => {
  switch (mode) {
    case 'quick-add':
      return 'sm';
    case 'create':
    case 'edit':
      return 'md';
    case 'accept-brief':
      return 'lg';
    case 'detail':
    case 'view':
      return 'xl';
    default:
      return 'md';
  }
};
```

## Transition Strategy

### Phase 1: Create New Components (No Breaking Changes)

```typescript
// Step 1: Create new consolidated component
export function MatterModal(props: MatterModalProps) {
  // New implementation
}

// Step 2: Keep old components as wrappers (deprecated)
/** @deprecated Use MatterModal with mode="create" instead */
export function MatterCreationModal(props: OldProps) {
  return <MatterModal mode="create" {...adaptProps(props)} />;
}

/** @deprecated Use MatterModal with mode="edit" instead */
export function EditMatterModal(props: OldProps) {
  return <MatterModal mode="edit" {...adaptProps(props)} />;
}
```

### Phase 2: Update Usage Gradually

```typescript
// Before
<MatterCreationModal
  isOpen={isOpen}
  onClose={onClose}
  onSuccess={handleSuccess}
/>

// After
<MatterModal
  mode="create"
  isOpen={isOpen}
  onClose={onClose}
  onSuccess={handleSuccess}
/>
```

### Phase 3: Remove Deprecated Components

```typescript
// After all usages updated, remove wrapper components
// and update exports
export { MatterModal } from './modals/matter/MatterModal';
// Remove: MatterCreationModal, EditMatterModal, etc.
```

## Naming Convention Standards

### Modal Naming

```typescript
// ✅ CORRECT
CreateInvoiceModal
EditMatterModal
RecordPaymentModal
IssueCreditNoteModal
InviteAttorneyModal
RequestScopeAmendmentModal

// ❌ INCORRECT
MatterCreationModal  // Use CreateMatterModal
PaymentModal         // Too generic, use RecordPaymentModal
LogServiceModal      // Use CreateServiceModal or ServiceModal with mode
```

### Page Naming

```typescript
// ✅ CORRECT
MattersPage
FinancialPage
DashboardPage
SettingsPage

// ❌ INCORRECT
MatterListPage       // Use MattersPage
InvoicesListPage     // Use FinancialPage with tab
EnhancedDashboard    // Use DashboardPage with view prop
```

### Component Naming

```typescript
// ✅ CORRECT
MatterCard
InvoiceList
PaymentHistoryTable
FinancialSnapshot

// ❌ INCORRECT
MatterItem           // Use MatterCard
InvoicesList         // Use InvoiceList (no plural 's')
PaymentsHistory      // Use PaymentHistory
```

## UX Patterns to Implement

### 1. Empty States

```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}
```

### 2. Skeleton Loaders

```typescript
export function MatterListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
```

### 3. Bulk Actions

```typescript
interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: Array<{
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }>;
}

export function BulkActionBar({ selectedCount, onClearSelection, actions }: BulkActionBarProps) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 flex items-center gap-4">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          size="sm"
          onClick={action.onClick}
        >
          <action.icon className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Clear
      </Button>
    </div>
  );
}
```

### 4. Command Palette

```typescript
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const commands = [
    { id: 'create-matter', label: 'Create matter...', action: () => {} },
    { id: 'record-payment', label: 'Record payment...', action: () => {} },
    { id: 'generate-invoice', label: 'Generate invoice...', action: () => {} },
    // ... more commands
  ];
  
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );
  
  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
      <input
        type="text"
        placeholder="Type a command..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-3 border-b"
      />
      <div className="max-h-96 overflow-y-auto">
        {filteredCommands.map((cmd) => (
          <button
            key={cmd.id}
            onClick={() => {
              cmd.action();
              setIsOpen(false);
            }}
            className="w-full text-left p-3 hover:bg-gray-100"
          >
            {cmd.label}
          </button>
        ))}
      </div>
    </Modal>
  );
}
```

## Accessibility Requirements

### Keyboard Navigation

```typescript
// All modals must support:
// - Esc to close
// - Tab to navigate
// - Enter to submit
// - Arrow keys for lists

export function useModalKeyboard(onClose: () => void, onSubmit?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter' && e.metaKey && onSubmit) {
        onSubmit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onSubmit]);
}
```

### Focus Management

```typescript
export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Save current focus
      const previousFocus = document.activeElement as HTMLElement;
      
      // Focus first focusable element in modal
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable[0] as HTMLElement)?.focus();
      
      // Restore focus on close
      return () => {
        previousFocus?.focus();
      };
    }
  }, [isOpen]);
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load modal components
const MatterModal = lazy(() => import('./modals/matter/MatterModal'));
const WorkItemModal = lazy(() => import('./modals/work-item/WorkItemModal'));

// Usage with Suspense
<Suspense fallback={<ModalSkeleton />}>
  <MatterModal mode="create" {...props} />
</Suspense>
```

### Memoization

```typescript
// Memoize expensive computations
const MatterModal = memo(function MatterModal({ mode, ...props }: MatterModalProps) {
  const content = useMemo(() => renderContent(mode), [mode]);
  
  return (
    <Modal {...props}>
      {content}
    </Modal>
  );
});
```
