# Payment Callback Structure - Complete Flow

## The Problem That Was Fixed

The error "One or more callback functions are missing" occurred because the callback structure was incomplete. Pi Network's `Pi.completePayment()` API requires ALL callbacks to be properly defined and accessible.

## The Complete Payment Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SETTLESYNC PAYMENT FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ STEP 1: User initiates settlement                              │
│         → executePayment() is called                           │
│                                                                 │
│ STEP 2: Pi.createPayment() is invoked with ALL 4 callbacks:   │
│                                                                 │
│         Callback 1: onReadyForServerApproval                  │
│         ├─ User confirms payment in Pi Browser                │
│         ├─ Payment is created on Pi Network                   │
│         └─ onReadyForServerApproval is FIRED                  │
│                                                                 │
│ STEP 3: Inside onReadyForServerApproval:                      │
│         ├─ Generate transaction ID (txid)                     │
│         └─ Call Pi.completePayment(paymentId, { txid }, {...})│
│                                                                 │
│ STEP 4: Pi.completePayment() requires 2 callbacks:            │
│                                                                 │
│         Callback 2: onReadyForServerCompletion               │
│         ├─ Payment is now on Pi Network (pending state)       │
│         ├─ MUST call server endpoint to finalize              │
│         └─ onReadyForServerCompletion is FIRED                │
│                                                                 │
│         Callback 3: onError                                   │
│         ├─ Error handling for Pi.completePayment()            │
│         └─ Rejects the promise if completePayment fails       │
│                                                                 │
│ STEP 5: Inside onReadyForServerCompletion:                    │
│         ├─ Call /api/pi/complete-payment (server endpoint)    │
│         ├─ Server records the transaction                      │
│         └─ Returns success response                            │
│                                                                 │
│ STEP 6: Payment Complete                                       │
│         ├─ Settlement is recorded                              │
│         ├─ Receipt is generated                                │
│         └─ User sees success                                   │
│                                                                 │
│ ✓ PAYMENT IS FULLY RESOLVED (not pending)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Callback Structure Details

### Pi.createPayment() Callbacks (4 required)

```typescript
window.Pi.createPayment(
  paymentData,
  {
    // REQUIRED: Called when user confirms payment
    onReadyForServerApproval: (paymentId: string) => {
      // 1. Generate txid
      // 2. Call Pi.completePayment()
    },

    // REQUIRED: Called when user cancels payment
    onCancel: () => {
      // Handle cancellation
    },

    // REQUIRED: Called on error during payment creation
    onError: (error: any) => {
      // Handle error
    },
  }
);
```

### Pi.completePayment() Callbacks (2 required)

```typescript
window.Pi.completePayment(
  paymentId,
  { txid: "..." },
  {
    // REQUIRED: Called when ready for server completion
    onReadyForServerCompletion: async () => {
      // 1. Call server endpoint /api/pi/complete-payment
      // 2. Resolve payment promise on success
      // 3. Reject payment promise on failure
    },

    // REQUIRED: Error callback for completePayment
    onError: (error: any) => {
      // Handle completion error
    },
  }
);
```

## Complete Code Example

See `/lib/pi-network-payment.ts` for the full implementation. The key points:

1. **All 4 callbacks in Pi.createPayment()**: onReadyForServerApproval, onCancel, onError
2. **All 2 callbacks in Pi.completePayment()**: onReadyForServerCompletion, onError
3. **Server endpoint must be called** from onReadyForServerCompletion
4. **No step can be skipped** or payment stays pending forever

## Testing the Flow

Open the app in Pi Browser and watch the console logs:

```
[v0] ✓ STEP 1: onReadyForServerApproval - Payment approved by user
[v0] ✓ STEP 2: Calling Pi.completePayment() with txid: txn_...
[v0] ✓ STEP 3: onReadyForServerCompletion - Calling server endpoint
[v0] ✓ STEP 4: Payment fully completed - server confirmed
[v0] ✓ PAYMENT SUCCESS: { txid, amount, ... }
```

If you see any step missing, the payment will fail or get stuck.

## Why Callbacks Must Be Complete

Pi Network requires all callbacks because:

1. **onReadyForServerApproval** - Confirms user authorization
2. **onReadyForServerCompletion** - Allows server to finalize the payment
3. **onCancel** - Handles user cancellation
4. **onError** - Handles all error scenarios

If any callback is missing, Pi Network cannot proceed and returns "One or more callback functions are missing" error.

## Server Endpoint (`/api/pi/complete-payment`)

This endpoint is called during **Step 5** above. It receives:

```json
{
  "paymentId": "payment_1234567890",
  "txid": "txn_1234567890",
  "amount": 3.14,
  "memo": "Settlement for Invoice #123",
  "recipient": "0x1234567890abcdef"
}
```

The endpoint:
1. Validates the payment data
2. Records the transaction in the settlement history
3. Returns success response

This is what finally resolves the payment from "pending" to "completed" on Pi Network.

## Key Takeaways

- ✓ All 4 callbacks must be provided to Pi.createPayment()
- ✓ All 2 callbacks must be provided to Pi.completePayment()
- ✓ Server endpoint must be called from onReadyForServerCompletion
- ✓ Payment stays pending if any step is skipped
- ✓ Once server confirms, payment is fully resolved
