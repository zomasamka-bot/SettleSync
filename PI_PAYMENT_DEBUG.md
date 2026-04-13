# Pi Network Payment Debugging Guide

## Issue: "Pi.pay() is not available" Error

When attempting to execute a payment in Pi Browser, the app shows:
```
"Pi.pay() is not available. Please ensure the app is running in Pi Browser."
```

## Root Cause Analysis

The issue occurs when `window.Pi.pay()` is called but the method is not available at runtime, even though the app is running in Pi Browser.

### Common Causes

1. **Pi SDK not fully initialized** - `Pi.init()` completed but `Pi.pay()` method wasn't injected
2. **Wrong Pi Browser version** - Using an old Pi Browser that doesn't have `Pi.pay()`
3. **Running outside Pi Browser** - App opened in regular browser, not Pi Browser
4. **SDK Loading timeout** - Network issue prevented SDK from loading

## Debugging Steps

### Step 1: Check Console Logs
Open F12 DevTools (Console tab) and look for `[v0]` logs:

```
[v0] executePayment started
[v0] Payment config: { amount: 0.01, memo: '...', recipient: '...' }
[v0] Current window.Pi state: { piExists: true, piPayExists: true }
[v0] Available Pi methods: ['init', 'authenticate', 'pay', ...]
```

### Step 2: Verify Pi Browser Environment
In console, type and run:
```javascript
// Check if Pi exists
console.log('window.Pi exists:', typeof window.Pi !== 'undefined');

// Check available methods
console.log('Pi methods:', window.Pi ? Object.keys(window.Pi) : 'N/A');

// Check if pay is available
console.log('Pi.pay() available:', typeof window.Pi?.pay === 'function');
```

### Step 3: Check App Location
In console:
```javascript
// This should show: https://settle-sync-six.vercel.app or Pi app URL
console.log('Current URL:', window.location.href);

// This should show you're in Pi Browser
console.log('Is Pi Browser:', /pi\b/i.test(navigator.userAgent));
```

### Step 4: Test Payment Directly
Try this in console to test if Pi.pay() works:
```javascript
window.Pi.pay({
  amount: 0.001,
  memo: 'Test payment',
  metadata: { test: true }
}).then(r => console.log('Success:', r))
  .catch(e => console.error('Error:', e));
```

## Expected Behavior

### Successful Flow
1. Click "Execute Settlement Record"
2. App logs: `[v0] Pi.pay() succeeded with result: ...`
3. Payment dialog appears in Pi Browser
4. User confirms with PIN/biometric
5. Settlement record and receipt generated

### Error Cases

**Case 1: Pi.pay() not a function**
- Log: `[v0] Pi.pay is not a function. Type: undefined`
- Solution: Ensure Pi Browser is latest version

**Case 2: Pi not defined**
- Log: `[v0] Pi SDK is not loaded`
- Solution: Refresh page, or open app in Pi Browser

**Case 3: Pi exists but methods missing**
- Log: `[v0] Available methods: ['init', 'authenticate']` (no 'pay')
- Solution: Pi Browser version too old, update required

## Resolution Checklist

- [ ] Open app in **Pi Browser**, not regular browser
- [ ] Use URL: https://settle-sync-six.vercel.app (or QR code in Pi app)
- [ ] Check F12 console for `[v0]` logs
- [ ] Verify `window.Pi.pay` exists (should show: `ƒ pay()`)
- [ ] Test with small amount (0.001 - 0.01π)
- [ ] Refresh if needed (Cmd+R or Ctrl+R)
- [ ] Try again after refresh

## Contact Support

If still failing after these steps:
1. Take screenshot of console logs
2. Note Pi Browser version (Settings → About)
3. Note exact error message
4. Report at vercel.com/help
