# Pi SDK Quick Start - Testing Real Payments

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Pi Browser installed or Developer Portal access
- SettleSync deployed to Vercel: https://settle-sync-six.vercel.app
- Test Pi wallet with testnet balance

### Step 1: Open App in Pi Browser
```
1. Open Pi Browser
2. Navigate to: https://settle-sync-six.vercel.app
3. Wait for "Initializing Pi Network..." message
4. Should see settlement form once loaded
```

### Step 2: Fill Settlement Details
```
Amount:              1.5 (Pi)
Reference:           INV-20250413-001
Purpose:             Service Settlement
Beneficiary Address: piXXXXXXXXXX... (wallet address)
Description:         Test payment execution
```

### Step 3: Execute Payment
```
1. Click "Proceed to Review" button
2. Review details on next screen
3. Click "Execute Settlement Record"
4. Button shows "Processing Settlement..." with spinner
5. Wait for Pi payment dialog (2-5 seconds)
6. Confirm payment in Pi Browser
7. Receipt displays with transaction ID
```

## 🔍 Verify It's Working

### In Browser Console:

```javascript
// Check 1: Pi SDK Loaded
typeof window.Pi
// Expected: "object"

// Check 2: Pi.pay Available
typeof window.Pi?.pay
// Expected: "function"

// Check 3: Pi Methods
Object.keys(window.Pi)
// Expected: ["init", "pay", "authenticate", "requestUserInfo", ...]

// Check 4: Look at console logs
console.log("Search for: [v0]")
// Should show initialization and payment logs
```

### Expected Console Output:

```
✓ [v0] markPiAsInitializing called
✓ [v0] Calling Pi.init()...
✓ [v0] Pi.init() completed successfully
✓ [v0] Marking Pi SDK as initialized
✓ [v0] executePayment started
✓ [v0] Pi.pay() is immediately available
✓ [v0] Payment completed successfully
```

## ❌ Troubleshooting

### Error: "Pi.pay() is not available"

```
Check                                  How to Verify
─────────────────────────────────────  ────────────────────────
1. Running in Pi Browser?              window.Pi exists in console
2. URL correct?                        Should be https://settle-sync-six.vercel.app
3. SDK loaded?                         Look for pi-sdk.js in Network tab
4. Initialized?                        Search console for "Pi.init() completed"
5. Timeout?                            Check for "timeout" in console
```

**Solution Steps:**
1. Close Pi Browser completely
2. Reopen Pi Browser
3. Navigate to app again
4. Check console before clicking Execute

### Error: Payment Dialog Doesn't Appear

- Wait 2-5 seconds after clicking Execute
- Check if Pi Browser is asking for permission
- Look in browser console for detailed error message

### Payment Confirmed But No Receipt

- Check console for transaction ID (txid)
- Refresh page to load receipt from storage
- Check settlement history for the transaction

## 📊 Testing Different Scenarios

### Scenario 1: Successful Payment
```
Expected Flow:
1. Form fills correctly
2. Execute button works
3. Payment dialog appears
4. Confirm in Pi Browser
5. Receipt generated immediately
Time: ~5-10 seconds
```

### Scenario 2: Network Delay
```
If initialization takes 5+ seconds:
1. Console shows waiting logs
2. Button remains in loading state
3. Payment executes after Pi initializes
4. Normal flow continues
This is OK - Pi SDK may be slow on first load
```

### Scenario 3: User Cancels Payment
```
Expected:
1. Payment dialog appears
2. User clicks "Cancel"
3. Error message: "Payment was cancelled"
4. No settlement recorded
5. Can retry or go back
```

## 🛠️ Developer Notes

### Checking Pi SDK State Programmatically

```typescript
import { isPiPayReady } from '@/lib/pi-sdk-ready';

// Check if ready NOW
if (isPiPayReady()) {
  console.log('Pi.pay() ready to execute immediately');
}

// Wait for readiness
import { waitForPiInitialization } from '@/lib/pi-sdk-ready';

try {
  await waitForPiInitialization(10000); // Wait up to 10 seconds
  console.log('Pi SDK ready, proceeding...');
} catch (e) {
  console.error('Timeout:', e);
}
```

### Manual State Reset (if needed)

```typescript
import { resetPiState } from '@/lib/pi-sdk-ready';

// For testing - resets initialization state
resetPiState();
// Then reload page to reinitialize
```

### Execution Flow Diagram

```
User Opens App
    ↓
Pi SDK loads (pi-sdk.js)
    ↓
Pi.init() called
    ↓
markPiAsInitializing() ← State set
    ↓
Pi.init() completes
    ↓
markPiAsInitialized() ← State set
    ↓
User enters settlement details
    ↓
User clicks "Execute"
    ↓
isPiPayReady() → YES?
    ├─ YES → Immediate Pi.pay()
    └─ NO → waitForPiInitialization()
    ↓
Pi.pay() dialog in Pi Browser
    ↓
User confirms
    ↓
Transaction ID returned
    ↓
Settlement saved, receipt generated
```

## 📱 Different Environments

### Pi Browser (Primary)
```
URL:        Any HTTPS URL opened in Pi Browser
Experience: Native payment dialog in Pi Browser
Speed:      ~3-5 seconds to payment dialog
```

### Developer Portal
```
URL:        app.get-pi.com/developer-portal
Experience: Same as Pi Browser
Speed:      ~5-10 seconds to payment dialog
Setup:      Create Pi app entry pointing to your app
```

### Regular Browser
```
URL:        https://settle-sync-six.vercel.app
Experience: Error message explaining need for Pi Browser
Speed:      Instant error response
Purpose:    Easy access to app URLs for sharing
```

## 🎯 Key Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Initial Load | < 3s | First SDK load may be slower |
| Payment Dialog | 3-5s | Includes Pi initialization time |
| Initialization Wait | 30s max | Configurable timeout |
| Payment Confirmation | 10-30s | Depends on Pi Network speed |
| Receipt Generation | < 1s | Immediate after confirmation |

## 📚 Related Files

- `/lib/pi-sdk-ready.ts` - State management
- `/lib/pi-network-payment.ts` - Payment execution  
- `/contexts/pi-auth-context.tsx` - SDK initialization
- `/PI_SDK_SOLUTION_SUMMARY.md` - Complete technical docs
- `/PI_SDK_DEBUGGING.md` - Advanced troubleshooting

## 💡 Pro Tips

1. **First test:** Smallest amount (e.g., 0.01 Pi) to confirm flow
2. **Monitor console:** Always keep console open during testing
3. **Try twice:** Sometimes first attempt slower due to caching
4. **Check testnet:** Verify using test wallet on testnet
5. **Clear cache:** If issues persist, clear browser cache

## ✅ Verification Checklist

- [ ] App loads in Pi Browser without error
- [ ] Console shows `[v0]` initialization logs
- [ ] Can enter settlement details
- [ ] Execute button shows loading spinner
- [ ] Payment dialog appears after 3-5 seconds
- [ ] Can confirm payment in Pi Browser
- [ ] Receipt displays with transaction ID
- [ ] Settlement history shows new transaction

---

**For detailed troubleshooting:** See `/PI_SDK_DEBUGGING.md`
**For technical details:** See `/PI_SDK_SOLUTION_SUMMARY.md`
