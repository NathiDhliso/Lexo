# Quick Fix Reference Card

## 🚀 What Was Fixed

| Issue | Status | File | Solution |
|-------|--------|------|----------|
| Duplicate auth code | ✅ Fixed | `LoginPage.tsx` | Removed duplicates |
| Missing supabase prop | ✅ Fixed | `ProtectedRoute.tsx` | Added prop |
| Auth error handling | ✅ Fixed | `AuthContext.tsx` | Try-catch blocks |
| Email URL mismatch | ✅ Fixed | `auth.service.ts` | Smart detection |
| UI text overlap | ✅ Fixed | `LoginPage.tsx` | Added labels |
| PDF export error | ✅ Fixed | `export.utils.ts` | Fixed import |
| 406 API errors | ✅ Fixed | `supabase.ts` | Added headers |
| RPC 404 errors | ⚠️ Expected | `reports.service.ts` | Uses mock data |

## 🔧 Quick Commands

### Clear Browser Data
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Check Auth Status
```javascript
// In browser console
console.log('[Auth] Current URL:', window.location.origin);
```

### Test Magic Link
1. Click "Forgot password?"
2. Enter email
3. Check console for: `[Auth] Magic link redirect URL: ...`
4. Check email inbox

## 📋 Supabase Setup (REQUIRED)

### 1. Add Redirect URLs
```
http://localhost:3000/#/login
http://localhost:3000/#/login?confirmed=true
http://localhost:3000/#/reset-password
```

### 2. Set Site URL
```
http://localhost:3000
```

### 3. Check Email Templates
- Confirm signup: ✅ Enabled
- Magic Link: ✅ Enabled
- Reset password: ✅ Enabled

## 🐛 Common Issues

### "Email not received"
- Check spam folder
- Wait 1-2 minutes
- Check Supabase quota (3/hour free tier)
- Try different email provider

### "Link expired"
- Links expire after 1 hour (magic link) or 24 hours (confirmation)
- Request new link

### "406 Error"
- Already fixed in `supabase.ts`
- Clear cache and reload

### "autoTable error"
- Already fixed in `export.utils.ts`
- Clear cache and reload

## 📚 Documentation

| Topic | File |
|-------|------|
| All fixes | `ALL_FIXES_SUMMARY.md` |
| Auth fixes | `AUTH_FIXES_SUMMARY.md` |
| Email setup | `SUPABASE_EMAIL_SETUP.md` |
| UI fixes | `UI_OVERLAP_FIX.md` |
| Reports fixes | `REPORTS_ERRORS_FIX.md` |
| Magic link | `MAGIC_LINK_GUIDE.md` |

## ✅ Testing Checklist

- [ ] Sign up with new email
- [ ] Check email for confirmation
- [ ] Sign in with credentials
- [ ] Click "Forgot password?"
- [ ] Receive and click magic link
- [ ] Generate a report
- [ ] Export report to PDF
- [ ] Check console for errors

## 🎯 Success Indicators

✅ Console shows: `[Auth] Sign up redirect URL: http://localhost:3000`
✅ No 406 errors in Network tab
✅ PDF downloads successfully
✅ Magic link email received
✅ No TypeScript errors
✅ No text overlap in UI

## 🆘 Need Help?

1. Check browser console for `[Auth]` logs
2. Check Network tab for failed requests
3. Check Supabase Dashboard → Logs
4. Review relevant documentation file
5. Clear cache and try again

## 🔗 Quick Links

- Supabase Dashboard: https://ecaamkrcsjrcjmcjshlu.supabase.co
- URL Config: `/project/ecaamkrcsjrcjmcjshlu/auth/url-configuration`
- Email Templates: `/project/ecaamkrcsjrcjmcjshlu/auth/templates`
- Auth Logs: `/project/ecaamkrcsjrcjmcjshlu/logs/auth-logs`
