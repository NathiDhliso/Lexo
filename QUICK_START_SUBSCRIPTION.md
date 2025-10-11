# 🚀 Quick Start: Subscription Integration

## What You Got

A complete subscription system with 3 tiers and 2 payment gateways (Paystack & PayFast) for your LexoHub app!

## 5-Minute Setup

### 1. Add Environment Variables

```bash
# .env file
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key
VITE_PAYSTACK_SECRET_KEY=sk_test_your_key
VITE_PAYFAST_MERCHANT_ID=10000100
VITE_PAYFAST_MERCHANT_KEY=your_key
VITE_PAYFAST_PASSPHRASE=your_passphrase
VITE_PAYFAST_MODE=sandbox
```

### 2. Run Database Migration

```bash
supabase db push
```

### 3. Add Routes

In `src/App.tsx`:

```typescript
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SubscriptionCallbackPage } from './pages/SubscriptionCallbackPage';

// Add these routes
<Route path="/subscription" element={<SubscriptionPage />} />
<Route path="/subscription/callback" element={<SubscriptionCallbackPage />} />
```

### 4. Test It

1. Go to `/subscription`
2. Click "Get Started" on Admission (free)
3. Try upgrading with test card: `4084084084084081`

## Subscription Tiers

| Tier | Price | Matters | Users |
|------|-------|---------|-------|
| Admission | R0 | 10 | 1 |
| Advocate | R299 | 50 | 1 (+R149/user) |
| Senior Counsel | R799 | Unlimited | 5 (+R99/user) |

## Usage Examples

### Protect a Feature

```typescript
import { SubscriptionGuard } from './middleware/SubscriptionGuard';

<SubscriptionGuard requiredTier="advocate">
  <PremiumFeature />
</SubscriptionGuard>
```

### Check Limits

```typescript
import { useSubscription } from './hooks/useSubscription';

const { subscription, usage } = useSubscription();

if (usage?.active_matters_count >= 10) {
  return <UpgradePrompt />;
}
```

### Enforce Matter Creation

```typescript
import { subscriptionService } from './services/api/subscription.service';

const canCreate = await subscriptionService.canPerformAction('create_matter');
if (!canCreate) {
  toast.error('Upgrade to create more matters');
}
```

## Files Created

- ✅ 20+ files for complete subscription system
- ✅ Database schema with RLS
- ✅ Payment gateway integrations
- ✅ React components & hooks
- ✅ TypeScript types
- ✅ Comprehensive documentation

## Need Help?

- Full Guide: `SUBSCRIPTION_INTEGRATION_GUIDE.md`
- Setup Steps: `SUBSCRIPTION_SETUP.md`
- Complete Status: `SUBSCRIPTION_IMPLEMENTATION_COMPLETE.md`

---

**You're all set!** The subscription system is ready to use. 🎉
