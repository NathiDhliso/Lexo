# Invoice Redesign Integration Guide

## Quick Start

### 1. Using the New Invoice Wizard

Replace the old `InvoiceGenerationModal` with the new `InvoiceGenerationWizard`:

```tsx
import { InvoiceGenerationWizard } from '../components/invoices/InvoiceGenerationWizard';

function MyComponent() {
  const [showWizard, setShowWizard] = useState(false);

  const handleInvoiceGenerated = (invoiceData) => {
    console.log('Invoice generated:', invoiceData);
  };

  return (
    <>
      <button onClick={() => setShowWizard(true)}>
        Generate Invoice
      </button>

      {showWizard && (
        <InvoiceGenerationWizard
          matter={{
            id: 'matter-123',
            title: 'Smith vs. ABC Insurance',
            clientName: 'John Smith',
            bar: 'johannesburg',
            wipValue: 15000,
            disbursements: 500,
            matterType: 'civil_litigation'
          }}
          timeEntries={[
            {
              id: 'te-1',
              date: '2025-01-15',
              description: 'Client consultation',
              duration: 120, // minutes
              rate: 2000
            }
          ]}
          expenses={[
            {
              id: 'exp-1',
              description: 'Court filing fee',
              amount: 500,
              category: 'court_fees',
              date: '2025-01-15',
              matterId: 'matter-123',
              invoiced: false
            }
          ]}
          onClose={() => setShowWizard(false)}
          onGenerate={handleInvoiceGenerated}
        />
      )}
    </>
  );
}
```

### 2. Adding Billing Panel to Matter Details

Integrate the `MatterInvoicePanel` into your matter details page:

```tsx
import { MatterInvoicePanel } from '../components/invoices/MatterInvoicePanel';

function MatterDetailsPage({ matter }) {
  return (
    <div className="space-y-6">
      {/* Other matter details */}
      
      <MatterInvoicePanel
        matterId={matter.id}
        matterTitle={matter.title}
        clientName={matter.client_name}
        bar={matter.bar}
        matterType={matter.matter_type}
        proFormaId={matter.source_proforma_id}
      />
    </div>
  );
}
```

### 3. Complete Matter Invoicing Tab

For a full-featured invoicing section in matter details:

```tsx
import { MatterDetailsInvoicing } from '../components/matters/MatterDetailsInvoicing';

function MatterDetailsPage({ matter }) {
  return (
    <div className="space-y-6">
      {/* Matter header and basic info */}
      
      <MatterDetailsInvoicing
        matterId={matter.id}
        matterTitle={matter.title}
        clientName={matter.client_name}
        bar={matter.bar}
        matterType={matter.matter_type}
        proFormaId={matter.source_proforma_id}
        defaultRate={matter.hourly_rate || 2000}
      />
    </div>
  );
}
```

## Component Props Reference

### InvoiceGenerationWizard

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `matter` | `MatterInfo` | No | Matter details (defaults to empty) |
| `timeEntries` | `TimeEntryItem[]` | No | Array of time entries |
| `expenses` | `ExpenseItem[]` | No | Array of expenses |
| `onClose` | `() => void` | No | Called when wizard is closed |
| `onGenerate` | `(data: any) => void` | No | Called when invoice is generated |

#### MatterInfo Type
```typescript
interface MatterInfo {
  id: string;
  title: string;
  clientName: string;
  bar: string;
  wipValue: number;
  disbursements: number;
  matterType?: string;
}
```

#### TimeEntryItem Type
```typescript
interface TimeEntryItem {
  id: string;
  date: string;           // ISO date string
  description: string;
  duration: number;       // in minutes
  rate: number;          // hourly rate
}
```

#### ExpenseItem Type
```typescript
interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;          // ISO date string
  matterId: string;
  invoiced: boolean;
}
```

### MatterInvoicePanel

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `matterId` | `string` | Yes | Matter ID |
| `matterTitle` | `string` | Yes | Matter title |
| `clientName` | `string` | Yes | Client name |
| `bar` | `string` | Yes | Bar association |
| `matterType` | `string` | No | Matter type for rate cards |
| `proFormaId` | `string` | No | Linked pro forma request ID |

### MatterDetailsInvoicing

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `matterId` | `string` | Yes | Matter ID |
| `matterTitle` | `string` | Yes | Matter title |
| `clientName` | `string` | Yes | Client name |
| `bar` | `string` | Yes | Bar association |
| `matterType` | `string` | No | Matter type |
| `proFormaId` | `string` | No | Linked pro forma ID |
| `defaultRate` | `number` | No | Default hourly rate (default: 2000) |

## Invoice Data Structure

When `onGenerate` is called, it receives an object with the following structure:

```typescript
{
  matterId: string;
  isProForma: boolean;
  selectedTimeEntries: string[];      // Array of time entry IDs
  selectedExpenses: string[];         // Array of expense IDs
  selectedServices: any[];            // Array of rate card services
  discount: {
    type: 'amount' | 'percentage';
    value: number;
  };
  hourlyRateOverride: number | null;
  narrative: string | null;           // Custom narrative if not using AI
  useAINarrative: boolean;
  totals: {
    totalHours: number;
    totalFees: number;
    totalExpenses: number;
    rateCardTotal: number;
    discountValue: number;
    discountedFees: number;
    disbursements: number;
    vatAmount: number;
    totalAmount: number;
  };
}
```

## Workflow Examples

### Example 1: Generate Invoice from Matter Page

```tsx
import { useState } from 'react';
import { MatterInvoicePanel } from '../components/invoices/MatterInvoicePanel';
import { toast } from 'react-hot-toast';

function MatterPage({ matter }) {
  const handleInvoiceGenerated = async (invoiceData) => {
    try {
      // Call your API to create the invoice
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      
      if (response.ok) {
        toast.success('Invoice generated successfully!');
        // Refresh matter data or navigate to invoice
      } else {
        toast.error('Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('An error occurred');
    }
  };

  return (
    <MatterInvoicePanel
      matterId={matter.id}
      matterTitle={matter.title}
      clientName={matter.client_name}
      bar={matter.bar}
      matterType={matter.matter_type}
      proFormaId={matter.source_proforma_id}
    />
  );
}
```

### Example 2: Convert Pro Forma to Invoice

```tsx
import { InvoiceGenerationWizard } from '../components/invoices/InvoiceGenerationWizard';

function ProFormaConversion({ proForma, matter }) {
  const [showWizard, setShowWizard] = useState(false);

  const handleConvert = async (invoiceData) => {
    try {
      // Create invoice from pro forma
      const response = await fetch('/api/invoices/from-proforma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoiceData,
          sourceProFormaId: proForma.id
        })
      });
      
      if (response.ok) {
        toast.success('Pro forma converted to invoice!');
        setShowWizard(false);
      }
    } catch (error) {
      toast.error('Conversion failed');
    }
  };

  return (
    <>
      <button onClick={() => setShowWizard(true)}>
        Convert to Invoice
      </button>

      {showWizard && (
        <InvoiceGenerationWizard
          matter={matter}
          timeEntries={proForma.time_entries}
          expenses={proForma.expenses}
          onClose={() => setShowWizard(false)}
          onGenerate={handleConvert}
        />
      )}
    </>
  );
}
```

### Example 3: Batch Invoice Generation

```tsx
function BatchInvoicing({ matters }) {
  const [selectedMatters, setSelectedMatters] = useState([]);
  const [currentMatter, setCurrentMatter] = useState(null);

  const handleGenerateForMatter = async (invoiceData) => {
    // Generate invoice for current matter
    await createInvoice(invoiceData);
    
    // Move to next matter
    const nextIndex = selectedMatters.indexOf(currentMatter) + 1;
    if (nextIndex < selectedMatters.length) {
      setCurrentMatter(selectedMatters[nextIndex]);
    } else {
      setCurrentMatter(null);
      toast.success('All invoices generated!');
    }
  };

  return (
    <>
      {/* Matter selection UI */}
      
      {currentMatter && (
        <InvoiceGenerationWizard
          matter={currentMatter}
          onClose={() => setCurrentMatter(null)}
          onGenerate={handleGenerateForMatter}
        />
      )}
    </>
  );
}
```

## Styling Customization

The components use Tailwind CSS and support dark mode. You can customize colors by modifying the classes:

```tsx
// Custom color scheme example
<InvoiceGenerationWizard
  // ... props
  className="custom-invoice-wizard"
/>

// In your CSS
.custom-invoice-wizard {
  --wizard-primary: #your-color;
  --wizard-secondary: #your-color;
}
```

## Best Practices

1. **Always provide matter context**: Even if generating from invoices page, pass matter details for better UX
2. **Handle errors gracefully**: Wrap API calls in try-catch and show user-friendly messages
3. **Validate before generating**: The wizard validates, but add server-side validation too
4. **Track invoice generation**: Log analytics for invoice generation patterns
5. **Provide feedback**: Use toast notifications for success/error states
6. **Test with real data**: Test with various combinations of time entries, expenses, and services

## Migration Checklist

- [ ] Replace `InvoiceGenerationModal` imports with `InvoiceGenerationWizard`
- [ ] Update invoice generation handlers to use new data structure
- [ ] Add `MatterInvoicePanel` to matter details pages
- [ ] Test invoice generation with time entries only
- [ ] Test invoice generation with expenses only
- [ ] Test invoice generation with rate card services
- [ ] Test pro forma conversion workflow
- [ ] Verify calculations are accurate
- [ ] Test dark mode appearance
- [ ] Update documentation for your team

## Troubleshooting

### Wizard doesn't show
- Check that `showWizard` state is properly managed
- Verify z-index isn't being overridden
- Ensure parent container doesn't have `overflow: hidden`

### Calculations are incorrect
- Verify time entry durations are in minutes
- Check that rates are numbers, not strings
- Ensure discount values are properly typed

### Time entries not loading
- Verify `TimeEntryService` is properly configured
- Check API endpoint returns correct data structure
- Ensure matter ID is valid

### Pro forma link not showing
- Verify `proFormaId` prop is passed
- Check that matter has `source_proforma_id` field
- Ensure pro forma record exists in database

## Support

For issues or questions:
1. Check the component source code for inline documentation
2. Review the summary document: `INVOICE_REDESIGN_SUMMARY.md`
3. Test with the provided examples
4. Check browser console for errors
