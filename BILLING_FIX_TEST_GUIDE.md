# Quick Testing Guide: Billing Preferences Deduplication Fix

## What to Test

Verify that the `ERR_INSUFFICIENT_RESOURCES` error no longer appears when signing up or logging in.

## Test Steps

### Test 1: Fresh Signup Flow
1. **Open DevTools Console** (F12)
2. **Sign up as a new user**
3. **Watch the console** for these logs:

   ✅ **Expected (Good):**
   ```
   [BillingPreferences] Fetching fresh data for advocate [id]
   [BillingPreferences] Reusing in-flight request for advocate [id]
   [BillingPreferences] Reusing in-flight request for advocate [id]
   ```

   ❌ **Should NOT see:**
   ```
   Failed to fetch billing preferences: TypeError: Failed to fetch
   ERR_INSUFFICIENT_RESOURCES
   ```

4. **Check Network Tab** (DevTools → Network → Filter: "advocate_billing_preferences")
   - Should see **1-2 requests max** (not 5-7)
   - All requests should show status **200 OK**

### Test 2: Existing User Login
1. **Open DevTools Console**
2. **Log in with existing account**
3. **Watch the console:**

   ✅ **Expected (Good):**
   ```
   [BillingPreferences] Using cached data for advocate [id]
   ```
   OR
   ```
   [BillingPreferences] Fetching fresh data for advocate [id]
   ```

4. **Navigate between pages** (Matters, Settings, etc.)
   - Should see cache hits: `Using cached data...`
   - No redundant requests

### Test 3: Onboarding Modal
1. **Sign up or dismiss onboarding then reopen from Settings**
2. **Open onboarding modal**
3. **Console should show:**
   ```
   [BillingPreferences] Using cached data for advocate [id]
   ```
   (Because data was already loaded on login)

### Test 4: Multiple Tabs
1. **Open app in 2 browser tabs** (same account)
2. **Both tabs load at same time**
3. **Each tab should make its own request** (different contexts)
4. **No errors should appear**

## Success Criteria

✅ **Pass:** 
- No `ERR_INSUFFICIENT_RESOURCES` errors
- Console shows deduplication logs
- Network tab shows 1-2 requests (not 5-7)
- Onboarding modal loads without errors
- App feels responsive

❌ **Fail:**
- Still seeing resource errors
- Multiple simultaneous identical requests
- Console errors related to billing preferences
- Slow or unresponsive app

## Troubleshooting

### If you still see errors:

1. **Clear browser cache:**
   ```
   Ctrl+Shift+Delete → Clear cached files
   ```

2. **Hard refresh:**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. **Check Supabase status:**
   - Is your Supabase instance running?
   - Check RLS policies on `advocate_billing_preferences` table

4. **Check auth state:**
   - Are you properly logged in?
   - Does `user.id` exist?

## Debug Commands

Open browser console and run:

```javascript
// Check if service is loaded
console.log(typeof billingPreferencesService);

// Check cache state (if exposed)
// Note: Cache is private, but check console logs for hits/misses

// Force clear local storage (if needed)
localStorage.clear();
```

## Performance Comparison

### Before Fix
- **Requests:** 5-7 simultaneous
- **Time to load:** 2-3 seconds (or failure)
- **Console:** Error spam
- **Network:** Multiple failures

### After Fix
- **Requests:** 1-2 total
- **Time to load:** <500ms
- **Console:** Clean debug logs
- **Network:** All successful

## Contact

If issues persist after testing, check:
- `BILLING_PREFERENCES_DEDUPLICATION_FIX.md` for technical details
- Browser console for specific error messages
- Network tab for failed requests

---

**Test Status:** ⏳ Pending verification  
**Expected Outcome:** ✅ All tests pass with no errors
