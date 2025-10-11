# Magic Link Authentication Guide

## Overview
Magic link authentication allows users to sign in via email without entering a password. This is useful for password reset and passwordless authentication.

## How It Works

### User Flow
1. User clicks "Forgot password?" on login page
2. User enters their email address
3. System sends magic link to email
4. User clicks link in email
5. User is automatically authenticated

### Technical Flow
```
LoginPage → authService.signInWithMagicLink() → Supabase Auth → Email Service → User Email
```

## Implementation Details

### Code Location
- **Service:** `src/services/auth.service.ts`
- **UI:** `src/pages/LoginPage.tsx`
- **Context:** `src/contexts/AuthContext.tsx`

### Magic Link Method

```typescript
async signInWithMagicLink(email: string) {
  // Use current origin for development, production URL for production
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
  const redirectUrl = isDevelopment ? 
    window.location.origin : 
    (import.meta.env.VITE_APP_URL || window.location.origin);
  
  console.log('[Auth] Magic link redirect URL:', redirectUrl);
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${redirectUrl}/#/login`,
    },
  });
  return { error };
}
```

## Configuration

### Supabase Dashboard Setup

1. **Add Redirect URLs**
   - Go to: Authentication → URL Configuration
   - Add: `http://localhost:3000/#/login`
   - Add: `http://localhost:5173/#/login`
   - Add: `https://your-domain.com/#/login`

2. **Set Site URL**
   - Set to: `http://localhost:3000` (development)
   - Or: `https://your-domain.com` (production)

3. **Email Templates**
   - Go to: Authentication → Email Templates
   - Select: "Magic Link"
   - Customize template if needed
   - Ensure it's enabled

### Environment Variables

```env
# Development
VITE_APP_URL=http://localhost:3000

# Production
VITE_APP_URL=https://your-production-domain.com
```

## Usage in UI

### Forgot Password Button

```typescript
const handleSendMagicLink = async () => {
  setShowValidation(true);
  setError(null);
  setSuccess(null);

  if (!emailValidation.isValid) {
    const msg = emailValidation.message || 'Please enter a valid email address.';
    setError(msg);
    toast.error(msg, { duration: 4000 });
    return;
  }

  setIsSubmitting(true);

  try {
    const { error } = await signInWithMagicLink(formData.email);
    if (error) {
      const message = error.message || 'Failed to send magic link. Please try again.';
      setError(message);
      toast.error(message, { duration: 5000 });
    } else {
      const successMsg = 'Magic link sent successfully! Check your email to sign in.';
      setSuccess(successMsg);
      toast.success('Magic link sent! Check your email.', { duration: 6000 });
    }
  } catch (err) {
    const message = 'Failed to send magic link. Please try again.';
    setError(message);
    toast.error(message, { duration: 5000 });
    console.error('Magic link error:', err);
  } finally {
    setIsSubmitting(false);
  }
};
```

## Email Template

### Default Template
Supabase sends an email with:
- Subject: "Magic Link"
- Body: Contains a link to sign in
- Link format: `{SITE_URL}/#/login?token={TOKEN}`

### Custom Template (Optional)
You can customize the email template in Supabase Dashboard:

```html
<h2>Sign in to lexo</h2>
<p>Click the link below to sign in to your account:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
<p>This link expires in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

## Troubleshooting

### Issue: Not Receiving Email

**Check:**
1. Email is in spam folder
2. Email address is correct
3. Supabase email quota (3 emails/hour on free tier)
4. Email service is configured in Supabase

**Solution:**
```bash
# Check Supabase logs
Dashboard → Logs → Auth Logs
# Look for email sending events
```

### Issue: Link Expired

**Cause:** Magic links expire after 1 hour

**Solution:**
- Request a new magic link
- User should click link within 1 hour

### Issue: Wrong Redirect URL

**Cause:** Redirect URL mismatch

**Solution:**
1. Check console log: `[Auth] Magic link redirect URL: ...`
2. Verify URL matches Supabase configuration
3. Update Supabase redirect URLs if needed

### Issue: 406 Error

**Cause:** Missing Accept header

**Solution:** Already fixed in `src/lib/supabase.ts`:
```typescript
headers: { 
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}
```

## Security Considerations

### Token Expiration
- Magic links expire after 1 hour
- Tokens are single-use only
- Used tokens cannot be reused

### Rate Limiting
- Supabase free tier: 3 emails/hour per user
- Prevents spam and abuse
- Consider upgrading for production

### Email Verification
- Ensure email belongs to user
- Don't send magic links to unverified emails
- Consider adding CAPTCHA for public forms

## Testing

### Manual Testing
1. Open login page
2. Click "Forgot password?"
3. Enter test email
4. Check browser console for redirect URL
5. Check email inbox (and spam)
6. Click magic link
7. Verify successful authentication

### Automated Testing
```typescript
// Example test
test('magic link authentication', async () => {
  // Enter email
  await page.fill('input[type="email"]', 'test@example.com');
  
  // Click forgot password
  await page.click('button:has-text("Forgot password?")');
  
  // Verify success message
  await expect(page.locator('text=Magic link sent')).toBeVisible();
  
  // Check email (requires email testing service)
  // Click link and verify authentication
});
```

## Best Practices

1. **Clear User Feedback**
   - Show success message when link is sent
   - Indicate link expiration time
   - Provide option to resend

2. **Error Handling**
   - Handle network errors gracefully
   - Show user-friendly error messages
   - Log errors for debugging

3. **Security**
   - Use HTTPS in production
   - Validate email format
   - Implement rate limiting

4. **UX**
   - Make button easily accessible
   - Provide clear instructions
   - Show loading state while sending

## Related Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Magic Link Guide](https://supabase.com/docs/guides/auth/auth-magic-link)
- [Email Configuration](https://supabase.com/docs/guides/auth/auth-email)
