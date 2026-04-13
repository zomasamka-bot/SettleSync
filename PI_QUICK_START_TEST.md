# Pi Payment Testing - Quick Start

## Pre-Flight Checklist

Before testing payments:

- [ ] App URL: https://settle-sync-six.vercel.app
- [ ] Environment: Pi Browser (not regular browser)
- [ ] Internet: Connected and stable
- [ ] Pi App: Updated to latest version
- [ ] Testnet: Using Pi Network testnet

## Testing Flow

### 1. Open App in Pi Browser
```
Pi App → Browse/Apps → https://settle-sync-six.vercel.app
```

### 2. Wait for Ready
- See "Review Settlement Record" page
- Wallet button shows in top-right
- No errors in console (F12)

### 3. Fill Test Settlement
- Reference: "TEST-001"
- Purpose: "Test Payment"
- Amount: "0.01" (small test amount)
- Recipient Name: "Test User"
- Recipient Address: Any valid Pi wallet address

### 4. Click "Execute Settlement Record"
- Button should be enabled
- Shows spinner while processing
- Payment dialog appears in Pi Browser (within 5 seconds)

### 5. Confirm Payment in Pi Browser
- Review payment details
- Enter PIN or confirm biometric
- Wait for confirmation

### 6. Verify Success
- See settlement receipt displayed
- Check console for success logs
- Look for "Settlement recorded" message

## Console Commands for Monitoring

Open F12 Developer Tools and run:

```javascript
// Check Pi is ready
console.log('Pi.pay ready:', typeof window.Pi?.pay === 'function')

// Get detailed status
Object.keys(window.Pi || {})

// Watch for success
// Look for logs: [v0] Payment completed successfully
```

## Expected Console Output

```
[v0] executePayment started
[v0] Running Pi SDK diagnostics
[v0] Pi SDK Diagnostics
[v0] Pi Status: Pi SDK is ready for payments
[v0] Pi.pay() is immediately available in window.Pi
[v0] Marking Pi as initialized (detected at payment time)
[v0] Initiating Pi Network payment
[v0] Calling Pi.pay() with paymentId: payment_...
[v0] Pi.pay() returned successfully
[v0] Payment completed successfully
```

## If Payment Doesn't Work

1. **Check Pi Status**: Is Pi.pay() available?
   ```javascript
   typeof window.Pi?.pay === 'function'  // Must be: true
   ```

2. **Check Console for Errors**: F12 → Console tab
   - Look for red error messages
   - Note exact error text

3. **Try Refresh**: F5 in Pi Browser
   - Wait for "Ready" status
   - Try again

4. **Check Network**: Is Pi Network working?
   - Try status page: https://status.minepi.com

## Getting Help

If payment still fails:

1. **Collect diagnostics**:
   - Copy all console logs (F12)
   - Note exact error message
   - Device/OS type
   - Pi app version

2. **Check troubleshooting**: See `PI_TROUBLESHOOTING.md`

3. **Contact support** with collected info

## Success Indicators

✓ Payment confirmation dialog appears  
✓ Can enter PIN/biometric  
✓ Settlement record created  
✓ Receipt generated with transaction ID  
✓ Console shows "[v0] Payment completed successfully"  

## Failure Indicators

✗ "Pi.pay() is not available" - Not in Pi Browser  
✗ Long delay (>30s) then timeout - SDK won't load  
✗ "Payment failed" - Network or wallet issue  
✗ "Payment cancelled" - User cancelled in dialog  

---

**Ready to test!** Open the app in Pi Browser and follow the flow above.
