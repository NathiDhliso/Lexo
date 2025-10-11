# LexoHub Subscription & Payment Integration Guide

## Overview

This guide covers the complete integration of subscription tiers (Admission, Advocate, Senior Counsel) with Paystack and PayFast payment gateways.

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Setup Instructions](#setup-instructions)
3. [Subscription Tiers](#subscription-tiers)
4. [Payment Gateways](#payment-gateways)
5. [Database Schema](#database-schema)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)
8. [Production Checklist](#production-checklist)

## Architecture

### Components Created

```
src/
├── types/
│   └── subscription.types.ts          # Type definitions
├── config/
│   └── subscription-tiers.config.ts   # Tier configurations
├── services/
│   ├── api/
│   │   └── subscription.service.ts    # Subscription API
│   └── payment/
│       ├── paystack.service.ts        # Paystack integration
│       ├── payfast.service.ts         # PayFast integration
│       └── payment-gateway.service.ts # Unified payment interface
├── components/
│   └── subscription/
│       ├── SubscriptionManagement.tsx
│       ├── SubscriptionTierCard.tsx
│       └── PaymentGatewaySelector.tsx
├── hooks/
│   └── useSubscription.ts             # Subscription hook
└── pages/
    └── SubscriptionPage.tsx            # Main subscription page
```

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
VITE_PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# PayFast Configuration
VITE_PAYFAST_MERCHANT_ID=10000100
VITE_PAYFAST_MERCHANT_KEY=xxxxxxxxxxxxx
VITE_PAYFAST_PASSPHRASE=your_secure_passphrase
VITE_PAYFAST_MODE=sandbox  # Change to 'live' for production
```

### 2. Database Migration

Run the subscription system migration:

```bash
# Using Supabase CLI
supabase db push

# Or apply directly via SQL editor in Supabase Dashboard
# Copy contents of: supabase/migrations/20250110_subscription_system.sql
```

### 3. Payment Gateway Setup

#### Paystack Setup

1. Sign up at [https://paystack.com](https://paystack.com)
2. Get your API keys from Settings → API Keys & Webhooks
3. Set up webhook URL: `https://your-domain.com/api/webhooks/paystack`
4. Add webhook events:
   - `charge.success`
   - `subscription.create`
   - `subscription.disable`

#### PayFast Setup

1. Sign up at [https://www.payfast.co.za](https://www.payfast.co.za)
2. Get merchant credentials from Settings → Integration
3. Set up ITN (Instant Transaction Notification) URL: `https://your-domain.com/api/webhooks/payfast`
4. Enable subscription payments in your account settings

### 4. Add Routes

Update your router configuration:

```typescript
// In your App.tsx or router config
import { SubscriptionPage } from './pages/SubscriptionPage';

// Add route
<Route path="/subscription" element={<SubscriptionPage />} />
<Route path="/subscription/callback" element={<SubscriptionCallbackPage />} />
```

## Subscription Tiers

### Admission (Free)
- **Price**: R0/month
- **Features**:
  - Up to 10 active matters
  - Single user
  - Time tracking & invoicing
  - Basic reporting
  - Mobile access
  - Email support

### Advocate (Pro)
- **Price**: R299/month
- **Additional Users**: R149/user/month
- **Features**:
  - Up to 50 active matters
  - Single user (expandable)
  - All Admission features
  - Matter pipeline
  - Client revenue reports
  - Aging reports
  - Priority email support

### Senior Counsel (Enterprise)
- **Price**: R799/month
- **Additional Users**: R99/user/month (first 5 included)
- **Features**:
  - Unlimited active matters
  - 5 users included
  - All Advocate features
  - Matter profitability analysis
  - Custom reports
  - Team collaboration
  - API access
  - Priority phone & email support

## Payment Gateways

### Paystack Integration

```typescript
import { paystackService } from './services/payment/paystack.service';

// Initialize payment
const response = await paystackService.initializeTransaction({
  email: 'user@example.com',
  amount: 29900, // R299 in kobo (cents)
  reference: paystackService.generateReference(),
  callback_url: 'https://your-domain.com/subscription/callback'
});

// Redirect user to payment page
window.location.href = response.data.authorization_url;

// Verify payment (in callback)
const verification = await paystackService.verifyTransaction(reference);
```

### PayFast Integration

```typescript
import { payfastService } from './services/payment/payfast.service';

// Prepare payment data
const paymentData = payfastService.preparePaymentData({
  amount: 299, // R299
  item_name: 'LexoHub Advocate Subscription',
  item_description: 'Monthly subscription',
  email: 'user@example.com',
  name_first: 'John',
  name_last: 'Doe',
  return_url: 'https://your-domain.com/subscription/callback',
  cancel_url: 'https://your-domain.com/subscription',
  notify_url: 'https://your-domain.com/api/webhooks/payfast',
  subscription: true,
  recurring_amount: 299
});

// Submit form to PayFast (handled automatically by payment-gateway.service)
```

## Database Schema

### Tables Created

1. **subscriptions**
   - Stores user subscription information
   - Tracks tier, status, billing period
   - Links to payment gateway

2. **payment_transactions**
   - Records all payment attempts
   - Tracks transaction status
   - Stores gateway references

3. **subscription_history**
   - Audit log for subscription changes
   - Tracks tier upgrades/downgrades
   - Records cancellations

### Key Functions

- `check_subscription_limits(user_id, action)` - Validates user actions against tier limits
- `log_subscription_change()` - Automatically logs subscription modifications

## Usage Examples

### Check Subscription Status

```typescript
import { useSubscription } from './hooks/useSubscription';

function MyComponent() {
  const { subscription, usage, isLoading } = useSubscription();

  if (subscription?.tier === 'admission' && usage?.active_matters_count >= 10) {
    return <UpgradePrompt />;
  }

  return <NormalView />;
}
```

### Enforce Matter Limits

```typescript
import { subscriptionService } from './services/api/subscription.service';

async function createMatter() {
  const canCreate = await subscriptionService.canPerformAction('create_matter');
  
  if (!canCreate) {
    toast.error('Matter limit reached. Please upgrade your subscription.');
    return;
  }

  // Proceed with matter creation
}
```

### Upgrade Subscription

```typescript
import { paymentGatewayService } from './services/payment/payment-gateway.service';

async function upgradeToAdvocate() {
  const result = await paymentGatewayService.initiateSubscriptionPayment({
    tier: 'advocate',
    additionalUsers: 0,
    gateway: 'paystack',
    userEmail: user.email,
    userName: { first: user.firstName, last: user.lastName },
    callbackUrl: `${window.location.origin}/subscription/callback`,
    cancelUrl: `${window.location.origin}/subscription`
  });

  if (result.success && result.paymentUrl) {
    window.location.href = result.paymentUrl;
  }
}
```

## Testing

### Test Cards (Paystack)

```
Success: 4084084084084081
Declined: 5060666666666666666
Insufficient Funds: 5060666666666666666
```

### Test Credentials (PayFast Sandbox)

```
Merchant ID: 10000100
Merchant Key: 46f0cd694581a
```

### Testing Checklist

- [ ] Free tier signup (Admission)
- [ ] Upgrade to Advocate with Paystack
- [ ] Upgrade to Senior Counsel with PayFast
- [ ] Add additional users
- [ ] Matter limit enforcement
- [ ] Subscription cancellation
- [ ] Payment failure handling
- [ ] Webhook processing

## Production Checklist

### Before Going Live

- [ ] Update payment gateway keys to production
- [ ] Set `VITE_PAYFAST_MODE=live`
- [ ] Configure production webhook URLs
- [ ] Test webhook endpoints with gateway test tools
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications for subscription events
- [ ] Review and test RLS policies
- [ ] Set up backup payment method
- [ ] Document cancellation policy
- [ ] Prepare customer support scripts

### Security Considerations

1. **Never expose secret keys** - Keep `VITE_PAYSTACK_SECRET_KEY` and `VITE_PAYFAST_MERCHANT_KEY` server-side only
2. **Validate webhooks** - Always verify webhook signatures
3. **Use HTTPS** - All payment URLs must use HTTPS
4. **Implement rate limiting** - Prevent payment API abuse
5. **Log all transactions** - Maintain audit trail

### Monitoring

Set up alerts for:
- Failed payment attempts
- Subscription cancellations
- Unusual payment patterns
- Webhook failures
- Matter limit violations

## Support & Resources

### Paystack
- Documentation: https://paystack.com/docs
- Support: support@paystack.com
- Dashboard: https://dashboard.paystack.com

### PayFast
- Documentation: https://developers.payfast.co.za
- Support: support@payfast.co.za
- Dashboard: https://www.payfast.co.za/dashboard

### LexoHub Support
- Email: support@lexohub.com
- Sales: sales@lexohub.com
- Demo: www.lexohub.com/demo

## Troubleshooting

### Common Issues

**Payment not processing**
- Verify API keys are correct
- Check webhook URLs are accessible
- Ensure HTTPS is enabled
- Review gateway dashboard for errors

**Subscription limits not enforcing**
- Run database migration
- Check RLS policies are enabled
- Verify `check_subscription_limits` function exists

**Webhook not receiving events**
- Test webhook URL is publicly accessible
- Verify webhook signature validation
- Check firewall/security rules
- Review gateway webhook logs

## Next Steps

1. Run the database migration
2. Configure payment gateway credentials
3. Test in sandbox mode
4. Implement webhook handlers
5. Add subscription page to navigation
6. Test complete user flow
7. Deploy to production

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Maintained by**: LexoHub Development Team
