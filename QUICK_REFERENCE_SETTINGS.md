# Quick Reference: Settings & Team Management

## 🎯 Where Is Everything?

### Settings Page
**Location**: Click your profile icon (top-right) → "Settings"

**URL**: `/settings` (when using page navigation)

**Tabs Available**:
1. **Profile** - Personal & practice info
2. **Subscription & Billing** - Your subscription management ⭐
3. **Team Members** - Add admins/secretaries ⭐
4. **Notifications** - Notification settings
5. **Security** - Security preferences
6. **Appearance** - Theme options

## 👥 Adding Team Members

### Quick Steps:
1. Click profile icon → Settings
2. Go to "Team Members" tab
3. Click "Invite Member"
4. Fill in:
   - Email address
   - First & last name
   - Role (Admin/Advocate/Secretary)
5. Click "Send Invitation"

### Roles:
- **Admin**: Full access, can manage everything
- **Advocate**: Manage matters, time, invoices
- **Secretary**: Administrative support

### Limits:
- **Admission**: 1 user only (no team members)
- **Advocate**: 1 user + R149/additional user
- **Senior Counsel**: 5 users + R99/additional user

## 💳 Managing Subscription

### Quick Steps:
1. Click profile icon → Settings
2. Go to "Subscription & Billing" tab
3. View current plan and usage
4. Click "Upgrade" on desired tier
5. Select payment method (Paystack/PayFast)
6. Complete payment

### Tiers:
- **Admission**: R0 - 10 matters, 1 user
- **Advocate**: R299 - 50 matters, advanced features
- **Senior Counsel**: R799 - Unlimited matters, team features

## 🔧 Database Setup

### Run Migrations:
```bash
# Team members & profiles
supabase db push
```

### Tables Created:
- `team_members` - Team invitations & memberships
- `user_profiles` - Extended user information
- `subscriptions` - Subscription data (from previous setup)
- `payment_transactions` - Payment history

## 📍 File Locations

### Pages:
- `src/pages/SettingsPage.tsx` - Main settings page
- `src/pages/SubscriptionPage.tsx` - Standalone subscription page

### Components:
- `src/components/settings/ProfileSettings.tsx`
- `src/components/settings/TeamManagement.tsx`
- `src/components/subscription/SubscriptionManagement.tsx`

### Database:
- `supabase/migrations/20250110_subscription_system.sql`
- `supabase/migrations/20250110_team_members.sql`

## ✅ Checklist

- [x] Settings page created
- [x] Profile management added
- [x] Subscription management integrated
- [x] Team member management added
- [x] Database migrations created
- [x] Navigation menu updated
- [ ] Email invitation sending (to implement)
- [ ] Team member acceptance flow (to implement)

## 🚀 What Works Now

✅ Access settings from profile menu  
✅ View and edit profile  
✅ Manage subscription and billing  
✅ Invite team members  
✅ View team member list  
✅ Remove team members  
✅ Automatic limit enforcement  
✅ Upgrade prompts when limits reached  

## 📚 Documentation

- **Full Guide**: `SETTINGS_AND_TEAM_SETUP.md`
- **Subscription Guide**: `SUBSCRIPTION_INTEGRATION_GUIDE.md`
- **Quick Start**: `QUICK_START_SUBSCRIPTION.md`

---

**Everything is ready to use!** Just click your profile icon and select Settings. 🎉
