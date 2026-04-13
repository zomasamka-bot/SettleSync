# Pi SDK Payment Execution Troubleshooting Guide

## Quick Checklist

Before trying anything else:

1. **Are you in Pi Browser?**
   - Open Pi app → Click "Browse" or "Apps" → Visit https://settle-sync-six.vercel.app
   - NOT: Opening the URL in regular Chrome/Safari/Firefox

2. **Is the app fully loaded?**
   - Wait for "Ready" status in the app (not "Loading...")
   - Check browser console (F12) for any errors

3. **Try a small test payment first**
   - Use smallest allowed amount
   - Use a test recipient address

## Diagnostic Information

### Check These in Browser Console (F12)

```javascript
// 1. Check if Pi object exists
window.Pi

// 2. Check if Pi.pay is available
typeof window.Pi?.pay

// 3. Check all available Pi methods
Object.keys(window.Pi || {})

// 4. Run app diagnostics
window.location.href  // Should be SettleSync URL
console.log('[v0]')   // Check [v0] logs
```

### Expected Console Output When Working

You should see logs like:
```
[v0] executePayment started
[v0] Pi SDK Diagnostics
[v0] Pi.pay() is immediately available
[v0] Initiating Pi Network payment
[v0] Pi.pay() returned successfully
[v0] Payment completed successfully
```

## Common Issues & Solutions

### Issue 1: "Pi.pay() is not available"

**Most Common Causes:**

1. **Wrong Environment** - Not running in Pi Browser
   - Solution: Open app inside Pi app, not in regular browser

2. **Pi SDK Didn't Load**
   - Check console for: "Pi SDK script loaded successfully"
   - If missing: Try F5 refresh
   - If still missing: Pi Network may be temporarily down

3. **SDK Initialization Failed**
   - Look for in console: "Pi.init() completed successfully"
   - If missing: Pi.init() call failed
   - Try refresh or check Pi Network status

### Issue 2: Long Delay Before Payment Dialog

**Cause:** App is waiting for Pi SDK initialization

**Normal Timeline:**
- 0-2 seconds: SDK loads
- 2-4 seconds: Pi.init() runs
- 4-5 seconds: Ready for payment
- 5+: Payment dialog should appear

If this takes >30 seconds → Your environment may not support Pi.pay()

### Issue 3: Payment Dialog Never Appears

**After** you click "Execute Settlement Record":

1. Check console for errors (F12)
2. Look for: "[v0] Calling Pi.pay()"
3. If not there: executePayment didn't complete

**Next Steps:**
- Note the exact error shown
- Check if you're still in Pi Browser
- Try a smaller payment amount

### Issue 4: SDK Initialized But Pay Not Available

**Symptoms:**
- Console shows: "Pi.init() completed successfully"
- But: "Pi.pay() is not available" error

**Possible Causes:**
1. Pi Network version mismatch
2. Browser/device compatibility issue
3. Pi app outdated (update Pi app)

**Try:**
- Update Pi app to latest version
- Restart Pi app completely
- Try different browser if available in Pi

## Verification Steps

### Step 1: Confirm Pi Environment
```javascript
// In console, run:
typeof window.Pi !== 'undefined'  // Should be: true
typeof window.Pi.pay              // Should be: "function"
```

### Step 2: Verify SDK Initialized
Search console for:
- ✓ "Pi SDK script loaded successfully"
- ✓ "Calling Pi.init()..."
- ✓ "Pi.init() completed successfully"

### Step 3: Check Payment Functions
```javascript
// In console, run:
Object.keys(window.Pi)  // Should include: 'pay', 'init', 'authenticate'
```

### Step 4: Try Simple Payment (Developer Tools)
```javascript
// Only if you understand what you're doing:
window.Pi.pay({
  amount: 0.01,
  memo: "Test payment",
  metadata: { test: true }
})
```

## Advanced Debugging

### Enable Maximum Logging

1. Open Settlement Initiator
2. Fill in test details
3. Press F12 (Developer Tools)
4. Look for all `[v0]` prefixed logs
5. Copy-paste entire log section

### Collect Diagnostic Data

```javascript
// Run in console to get full diagnostics:
console.log('User Agent:', navigator.userAgent);
console.log('Window.Pi:', window.Pi);
console.log('Pi Methods:', Object.keys(window.Pi || {}));
console.log('URL:', window.location.href);
console.log('Network:', navigator.connection?.effectiveType);
```

## When to Contact Support

Provide this information:

1. **Full console output** - Copy all [v0] logs
2. **Device/Browser** - "Pi app on iOS" or "Pi app on Android"
3. **Pi app version** - Check Pi Settings
4. **Exact error message** - Shown in red in app
5. **Steps to reproduce** - What you clicked before error
6. **Diagnostic data** - From section above

## Network/Environment Requirements

SettleSync requires:
- **Pi Browser** or Pi Developer Portal
- **Active internet connection**
- **Pi Network testnet access**
- **JavaScript enabled**

If any are missing, payments won't work.

## Pi Network Status

If payments fail for EVERYONE:
- Check Pi Network status: https://status.minepi.com
- May need to wait for Pi Network recovery

## Testing in Pi Sandbox

If testing without real Pi wallet:
- Use Pi Sandbox/Developer Portal
- Payments are simulated, not real
- Perfect for testing flow and UI
