# Pi Network Payment - Quick Test Guide

## What to Check

### 1. All Callbacks Present
✓ onReadyForServerApproval - on Pi.createPayment()
✓ onReadyForServerCompletion - on Pi.createPayment() (fallback)
✓ onReadyForServerCompletion - on Pi.completePayment() (primary)
✓ onCancel - on both functions
✓ onError - on both functions

### 2. Expected Console Output (In Order)
```
[v0] executePayment started
[v0] Payment config: { amount: 0.1, memo: '...', recipient: '...' }
[v0] Calling Pi.createPayment()
[v0] STEP 1: onReadyForServerApproval - Payment approved
[v0] STEP 2: Calling Pi.completePayment()
[v0] STEP 3: onReadyForServerCompletion from Pi.completePayment
[v0] STEP 4: Calling server endpoint
[v0] Calling server to complete payment: {...}
[v0] Server payment completion successful: {...}
[v0] STEP 5: Server confirmed - Payment complete
[v0] PAYMENT SUCCESS: {...}
```

### 3. Testing Steps
1. Open SettleSync in Pi Browser
2. Go to Settlement page
3. Enter test amount (0.1 Pi)
4. Click "Execute Settlement"
5. Approve in Pi Browser popup
6. Watch console logs - should see all STEP 1-5 logs
7. See settlement record created
8. Check receipt is generated

### 4. Success Indicators
- ✓ No "One or more callback functions are missing" error
- ✓ All 5 STEP logs appear in console
- ✓ onReadyForServerApproval fires
- ✓ onReadyForServerCompletion fires
- ✓ Server endpoint is called and returns success
- ✓ Payment status shows as "paid"
- ✓ Receipt is generated with transaction details

### 5. Failure Scenarios

**Error: "One or more callback functions are missing"**
- Missing callbacks on Pi.createPayment() or Pi.completePayment()
- Check /lib/pi-network-payment.ts for all 5 callbacks

**Error: "Payment cancelled by user"**
- User rejected payment in Pi Browser
- Try again

**Error: "Server completion failed"**
- Check /api/pi/complete-payment endpoint
- Check that endpoint returns JSON success response
- Check browser console for server errors

**Payment stuck (no STEP logs appear)**
- Pi SDK not loaded in Pi Browser
- Make sure app is opened in Pi Browser, not regular browser
- Check /lib/pi-network-payment.ts line 88-93 (Pi SDK check)

### 6. File Changes Made
- `/lib/pi-network-payment.ts` - Complete payment flow with all callbacks
- `/app/api/pi/complete-payment/route.ts` - Server endpoint (existing, should work)
- `/components/transaction-review.tsx` - Error handling (existing)

### 7. Critical Lines to Verify

**In `/lib/pi-network-payment.ts`:**
- Line ~48: `onReadyForServerApproval` callback defined
- Line ~128: `onReadyForServerCompletion` callback defined (fallback on createPayment)
- Line ~81 (inside onReadyForServerApproval): `window.Pi.completePayment()` called with 3 callbacks
- Line ~95 (inside completePayment): `onReadyForServerCompletion` defined (primary)
- Line ~133: `onCancel` callback defined
- Line ~139: `onError` callback defined

All these MUST be present for payment to work.

### 8. If Still Getting Errors

1. Check browser console for EXACT error message
2. Open Pi Browser Developer Tools
3. Look at Network tab - is `/api/pi/complete-payment` being called?
4. Check if Pi SDK is available: `window.Pi` should exist
5. Verify all callback functions are non-null functions (typeof === 'function')

### 9. Deployment

After fixing, deploy to Vercel:
1. Changes are auto-deployed in v0
2. Test in Pi Browser preview
3. If working, can commit to GitHub
4. Production deploy through Vercel dashboard
