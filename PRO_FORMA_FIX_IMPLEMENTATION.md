# Pro Forma Creation Fix - Implementation Guide

## The Fix Required

The `PendingProFormaRequests.tsx` component needs to create actual pro formas instead of invoices.

## File to Modify
`src/components/proforma/PendingProFormaRequests.tsx`

## Changes Needed

### 1. Add Import for ProForma Service
At the top of the file, add:
```typescript
import { proformaService } from '../../services/api/proforma.service';
import { matterApiService } from '../../services/api';
```

### 2. Replace handleConfirmGenerate Function (Lines 120-171)

Replace the entire function with:

```typescript
const handleConfirmGenerate = async () => {
  if (!selectedRequest) return;

  const request = selectedRequest;
  setShowConfirmDialog(false);

  if (request.requested_action === 'matter') {
    // Existing matter creation flow
    const initialData = {
      title: request.matter_title || `Matter for ${request.client_name || request.instructing_attorney_name}`,
      description: request.matter_description || '',
      client_name: request.client_name || '',
      client_email: request.client_email || '',
      client_phone: request.client_phone || '',
      matter_type: request.matter_type || 'general',
      instructing_attorney: request.instructing_attorney_name || '',
      instructing_firm: request.instructing_attorney_firm || '',
      instructing_attorney_email: request.instructing_attorney_email || '',
      instructing_attorney_phone: request.instructing_attorney_phone || '',
      estimated_value: request.total_amount || 0,
      additional_notes: request.fee_narrative || ''
    };
    setPrepopulationData(initialData);
    setShowNewMatterModal(true);
  } else {
    // NEW: Create pro forma instead of invoice
    try {
      // 1. First create a matter for this pro forma
      const matterData = {
        title: request.matter_title || `Matter for ${request.client_name || request.instructing_attorney_name}`,
        description: request.matter_description || '',
        client_name: request.client_name || '',
        client_email: request.client_email || '',
        client_phone: request.client_phone || '',
        matter_type: request.matter_type || 'general',
        instructing_attorney: request.instructing_attorney_name || '',
        instructing_firm: request.instructing_attorney_firm || '',
        instructing_attorney_email: request.instructing_attorney_email || '',
        instructing_attorney_phone: request.instructing_attorney_phone || '',
        estimated_fee: request.total_amount || 0,
        status: 'active',
        client_type: 'individual',
        fee_type: 'hourly',
        risk_level: 'medium'
      };

      const matterResponse = await matterApiService.create(matterData);
      
      if (matterResponse.error || !matterResponse.data) {
        throw new Error('Failed to create matter');
      }

      const matter = matterResponse.data;

      // 2. Create pro forma linked to the matter
      const proFormaData = {
        matter_id: matter.id,
        quote_date: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        total_amount: request.total_amount || 0,
        fee_narrative: request.fee_narrative || '',
        notes: `Created from pro forma request for ${request.client_name || request.instructing_attorney_name}`
      };

      await proformaService.generateProForma(proFormaData);

      // 3. Mark request as processed
      await markRequestAsProcessed(request.id);

      // 4. Show success and navigate to pro forma page
      toast.success('Pro forma created successfully!');
      
      if (onNavigate) {
        onNavigate('proforma');
      }
    } catch (error) {
      console.error('Error creating pro forma:', error);
      toast.error('Failed to create pro forma. Please try again.');
    }
  }
};
```

### 3. Update Button Label (Line 436)

Change from:
```typescript
Process Request
```

To:
```typescript
{request.requested_action === 'matter' ? 'Create Matter' : 'Create Pro Forma'}
```

Full button code:
```typescript
<Button
  onClick={() => handleProcessRequest(request)}
  size="sm"
  variant="primary"
  disabled={request.status === 'pending'}
  className="flex items-center gap-2"
  title={request.status === 'pending' ? 'Waiting for client to submit form' : 'Create pro forma from this request'}
>
  {request.requested_action === 'matter' ? (
    <>
      <Plus className="h-4 w-4" />
      Create Matter
    </>
  ) : (
    <>
      <Calculator className="h-4 w-4" />
      Create Pro Forma
    </>
  )}
</Button>
```

### 4. Remove Old Invoice Modal Code

Delete or comment out lines 437-476 (the InvoiceGenerationModal section) since we're no longer using it for pro forma requests.

## Expected Result

After these changes:

1. ✅ Client fills out pro forma request form
2. ✅ Request appears in dashboard
3. ✅ Advocate clicks "Create Pro Forma"
4. ✅ System creates a matter
5. ✅ System creates a pro forma linked to that matter
6. ✅ Pro forma appears in **Pro Forma page**
7. ✅ Advocate can view, edit, and send pro forma
8. ✅ Later, advocate can convert pro forma to invoice

## Testing Steps

1. Generate a new pro forma request link
2. Fill out the form as a client
3. Go to dashboard - see the submitted request
4. Click "Create Pro Forma"
5. Wait for success message
6. Navigate to Pro Forma page
7. Verify the pro forma is there with correct details

## Notes

- The matter is created automatically (needed for pro forma)
- Pro forma is set to expire in 30 days
- Request is marked as 'processed' and removed from dashboard
- User is navigated to Pro Forma page to see the result
