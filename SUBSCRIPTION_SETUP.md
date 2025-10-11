# Quick Setup Guide for Subscription Integration

## Step 1: Install Dependencies

The integration uses built-in browser APIs and existing dependencies. No additional packages needed!

## Step 2: Configure Environment Variables

Copy the payment gateway credentials to your `.env` file:

```bash
# Paystack (Get from https://dashboard.paystack.com)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
VITE_PAYSTACK_SECRET_KEY=sk_test_your_key_here

# PayFast (Get from https://www.payfast.co.za/dashboard)
VITE_PAYFAST_MERCHANT_ID=10000100
VITE_PAYFAST_MERCHANT_KEY=your_merchant_key
VITE_PAYFAST_PASSPHRASE=your_passphrase
VITE_PAYFAST_MODE=sandbox
```

## Step 3: Run Database Migration

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Via Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy contents of supabase/migrations/20250110_subscription_system.sql
# 3. Run the query
```

## Step 4: Add Routes to Your App

Update `src/App.tsx`:

```typescript
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SubscriptionCallbackPage } from './pages/SubscriptionCallbackPage';

// Add these routes
<Route path="/subscription" element={<SubscriptionPage />} />
<Route path="/subscription/callback" element={<SubscriptionCallbackPage />} />
```

## Step 5: Add Subscription Link to Navigation

Update your navigation component:

```typescript
<a href="/subscription">Subscription</a>
```

## Step 6: Protect Features with Subscription Guards

Example usage:

```typescript
import { SubscriptionGuard } from './middleware/SubscriptionGuard';

// Protect a feature
<SubscriptionGuard requiredTier="advocate">
  <AdvancedReports />
</SubscriptionGuard>

// Show upgrade prompt when limit reached
import { UpgradePrompt } from './components/subscription/UpgradePrompt';

if (matterCount >= 10 && tier === 'admission') {
  return <UpgradePrompt message="You've reached your matter limit" />;
}
```

## Step 7: Test the Integration

### Test in Sandbox Mode

1. **Create Free Account (Admission)**
   - Navigate to `/subscription`
   - Click "Get Started" on Admission tier
   - Verify subscription is created

2. **Test Paystack Payment**
   - Click "Upgrade" on Advocate tier
   - Select Paystack
   - Use test card: `4084084084084081`
   - Verify redirect and callback

3. **Test PayFast Payment**
   - Click "Upgrade" on Senior Counsel tier
   - Select PayFast
   - Use sandbox credentials
   - Complete payment flow

### Verify Features

- [ ] Matter limits enforced
- [ ] Tier-specific features show/hide correctly
- [ ] Upgrade prompts appear when limits reached
- [ ] Payment callbacks work
- [ ] Subscription status updates

## Step 8: Configure Webhooks

### Paystack Webhooks

1. Go to https://dashboard.paystack.com/settings/webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/paystack`
3. Select events:
   - `charge.success`
   - `subscription.create`
   - `subscription.disable`

### PayFast ITN

1. Go to https://www.payfast.co.za/dashboard
2. Settings → Integration
3. Set ITN URL: `https://your-domain.com/api/webhooks/payfast`

## Step 9: Create Webhook Handlers (Backend)

You'll need to create server-side webhook handlers. Example structure:

```typescript
// /api/webhooks/paystack
export async function POST(request: Request) {
  const signature = request.headers.get('x-paystack-signature');
  const body = await request.json();
  
  // Verify signature
  // Update subscription in database
  // Send confirmation email
}

// /api/webhooks/payfast
export async function POST(request: Request) {
  const data = await request.formData();
  
  // Verify ITN signature
  // Update subscription in database
  // Return 200 OK
}
```

## Step 10: Go Live

When ready for production:

1. Update environment variables:
   ```bash
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
   VITE_PAYSTACK_SECRET_KEY=sk_live_...
   VITE_PAYFAST_MODE=live
   ```

2. Update webhook URLs to production domain

3. Test complete flow in production

4. Monitor for errors

## Usage Examples

### Check User's Subscription

```typescript
import { useSubscription } from './hooks/useSubscription';

function MyComponent() {
  const { subscription, usage, isLoading } = useSubscription();
  
  if (subscription?.tier === 'admission') {
    return <UpgradePrompt />;
  }
  
  return <PremiumFeature />;
}
```

### Enforce Matter Limits

```typescript
import { subscriptionService } from './services/api/subscription.service';

async function handleCreateMatter() {
  const canCreate = await subscriptionService.canPerformAction('create_matter');
  
  if (!canCreate) {
    toast.error('Matter limit reached. Please upgrade.');
    return;
  }
  
  // Create matter
}
```

### Show Feature Based on Tier

```typescript
import { useFeatureAccess } from './middleware/SubscriptionGuard';

function ReportsPage() {
  const hasCustomReports = useFeatureAccess('custom_reports');
  
  return (
    <div>
      <BasicReports />
      {hasCustomReports && <CustomReports />}
    </div>
  );
}
```

## Troubleshooting

**Issue**: Payment not processing
- Check API keys are correct
- Verify webhook URLs are accessible
- Check browser console for errors

**Issue**: Subscription limits not working
- Ensure migration ran successfully
- Check RLS policies are enabled
- Verify user has a subscription record

**Issue**: Callback page not working
- Check route is registered
- Verify payment gateway returns correct parameters
- Check browser console for errors

## Support

For issues or questions:
- Email: support@lexohub.com
- Documentation: See SUBSCRIPTION_INTEGRATION_GUIDE.md
- Paystack Support: https://paystack.com/support
- PayFast Support: https://www.payfast.co.za/support

---

**Ready to go!** Your subscription system is now integrated. Start with sandbox testing, then move to production when ready.
