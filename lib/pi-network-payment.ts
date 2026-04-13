'use client';

/**
 * Pi Network Payment Integration
 * Handles real payments on Pi Network testnet
 * Uses Pi.createPayment() API with proper server-side completion
 */

export interface PaymentConfig {
  amount: number;
  memo: string;
  recipient: string;
}

export interface PaymentResult {
  txid: string;
  amount: number;
  memo: string;
  timestamp: string;
  status: 'success' | 'failed' | 'cancelled';
}

export interface ServerCompletionRequest {
  paymentId: string;
  txid: string;
  amount: number;
  memo: string;
  recipient: string;
}

/**
 * Call server endpoint to complete payment
 * This must be called from onReadyForServerCompletion callback
 */
async function completePaymentOnServer(request: ServerCompletionRequest): Promise<void> {
  console.log('[v0] [CRITICAL] Calling server to complete payment:', request);
  
  try {
    const response = await fetch('/api/pi/complete-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server returned ${response.status}`);
    }

    const result = await response.json();
    console.log('[v0] [SUCCESS] Server payment completion confirmed:', result);
  } catch (error) {
    console.error('[v0] [FAILED] Server payment completion error:', error);
    throw error;
  }
}

/**
 * Handle pending payments from Pi Network
 * If there's a pending payment, we need to complete it first
 */
async function handlePendingPayment(): Promise<void> {
  console.log('[v0] Checking for pending payments...');
  
  try {
    if (typeof window.Pi === 'undefined') {
      return; // No Pi SDK available
    }
    
    if (typeof window.Pi.getPendingPayments !== 'function') {
      return; // getPendingPayments not available
    }

    const pendingPayments = await window.Pi.getPendingPayments();
    console.log('[v0] Pending payments:', pendingPayments);

    if (Array.isArray(pendingPayments) && pendingPayments.length > 0) {
      console.log('[v0] Found ' + pendingPayments.length + ' pending payment(s)');
      
      // There's a pending payment that needs to be completed
      // We'll let Pi Network handle it - the user will see a notification
      // and we'll wait for the next payment attempt
    }
  } catch (error) {
    console.log('[v0] Could not check pending payments:', error);
    // Continue anyway
  }
}

/**
 * Execute a real Pi Network payment using Pi.createPayment()
 * 
 * CRITICAL FLOW:
 * 1. Pi.createPayment() with 4 callbacks at top level
 * 2. User approves → onReadyForServerApproval fired
 * 3. Call Pi.completePayment() on the client with its own 4 callbacks
 * 4. Pi.completePayment() triggers onReadyForServerCompletion callback
 * 5. Call server endpoint to finalize
 * 6. Payment complete
 */
export async function executePayment(config: PaymentConfig): Promise<PaymentResult> {
  if (typeof window === 'undefined') {
    throw new Error('Payment can only be executed in browser');
  }

  console.log('[v0] === PAYMENT EXECUTION STARTED ===');
  console.log('[v0] Payment config:', { amount: config.amount, memo: config.memo, recipient: config.recipient });

  // First, check for pending payments
  await handlePendingPayment();

  if (typeof window.Pi === 'undefined') {
    throw new Error(
      'Pi SDK is not loaded. Please ensure you are opening this app in Pi Browser. ' +
      'App URL: ' + window.location.href
    );
  }

  if (typeof window.Pi.createPayment !== 'function') {
    console.error('[v0] Pi.createPayment is not available');
    console.error('[v0] Available Pi methods:', Object.keys(window.Pi || {}));
    
    throw new Error(
      'Pi.createPayment() is not available. This app requires Pi Browser. ' +
      'Please open this app in Pi Browser: ' + window.location.href
    );
  }

  return new Promise((resolve, reject) => {
    try {
      console.log('[v0] [STEP 0] Initiating Pi.createPayment()');
      
      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let completionPromise: Promise<PaymentResult> | null = null;
      
      window.Pi.createPayment(
        {
          amount: config.amount,
          memo: config.memo,
          metadata: {
            recipient: config.recipient,
            paymentId: paymentId,
          },
        },
        {
          // CALLBACK 1: User approved payment in Pi Browser
          onReadyForServerApproval: (readyPaymentId: string) => {
            console.log('[v0] [STEP 1] ✓ onReadyForServerApproval - User approved payment');
            console.log('[v0] [STEP 1] Payment ID:', readyPaymentId);
            console.log('[v0] [STEP 2] Calling Pi.completePayment()');
            
            try {
              const txid = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              console.log('[v0] Generated transaction ID:', txid);
              
              window.Pi.completePayment(
                readyPaymentId,
                { txid: txid },
                {
                  // CALLBACK 1b: This is where the server completion MUST happen
                  onReadyForServerCompletion: (completePaymentId: string, completeTxid: string) => {
                    console.log('[v0] [STEP 3] ✓ onReadyForServerCompletion - CRITICAL CALLBACK FIRED');
                    console.log('[v0] [STEP 3] Payment ID:', completePaymentId);
                    console.log('[v0] [STEP 3] Transaction ID:', completeTxid);
                    console.log('[v0] [STEP 4] NOW calling server endpoint to finalize...');
                    
                    // CRITICAL: This MUST complete successfully
                    completionPromise = (async () => {
                      try {
                        await completePaymentOnServer({
                          paymentId: completePaymentId,
                          txid: completeTxid,
                          amount: config.amount,
                          memo: config.memo,
                          recipient: config.recipient,
                        });
                        
                        console.log('[v0] [STEP 5] ✓ Server confirmed payment completion');
                        
                        const paymentResult: PaymentResult = {
                          txid: completeTxid,
                          amount: config.amount,
                          memo: config.memo,
                          timestamp: new Date().toISOString(),
                          status: 'success',
                        };
                        
                        console.log('[v0] === PAYMENT COMPLETED SUCCESSFULLY ===');
                        console.log('[v0] Final result:', paymentResult);
                        
                        return paymentResult;
                      } catch (serverError) {
                        console.error('[v0] [STEP 5] ✗ CRITICAL ERROR - Server completion failed');
                        console.error('[v0] Error details:', serverError);
                        
                        throw {
                          status: 'failed',
                          message: `Server completion failed: ${serverError instanceof Error ? serverError.message : 'Unknown error'}`,
                          error: serverError,
                          isStuck: true, // Payment is now stuck on Pi Network!
                        };
                      }
                    })();
                    
                    // Wait for server completion and resolve/reject
                    if (completionPromise) {
                      completionPromise
                        .then(resolve)
                        .catch(reject);
                    }
                  },
                  
                  // CALLBACK 1c: User cancels during completion
                  onCancel: () => {
                    console.log('[v0] [COMPLETION] ✗ User cancelled during completion');
                    reject({
                      status: 'cancelled',
                      message: 'Payment completion was cancelled',
                    });
                  },
                  
                  // CALLBACK 1d: Error during completion
                  onError: (error: any) => {
                    console.error('[v0] [COMPLETION] ✗ Error during completion:', error);
                    reject({
                      status: 'failed',
                      message: error?.message || 'Payment completion failed on Pi Network',
                      error,
                    });
                  },
                }
              );
            } catch (e) {
              console.error('[v0] [COMPLETION] ✗ Exception calling Pi.completePayment():', e);
              reject({
                status: 'failed',
                message: e instanceof Error ? e.message : 'Error completing payment',
                error: e,
              });
            }
          },
          
          // CALLBACK 2: Fallback - Pi calls this directly if completePayment not called
          onReadyForServerCompletion: (directPaymentId: string, directTxid: string) => {
            console.log('[v0] [FALLBACK] onReadyForServerCompletion from createPayment fired');
            console.log('[v0] This means Pi.completePayment was not called or failed');
            console.log('[v0] Attempting direct server completion...');
            
            completionPromise = (async () => {
              try {
                await completePaymentOnServer({
                  paymentId: directPaymentId,
                  txid: directTxid,
                  amount: config.amount,
                  memo: config.memo,
                  recipient: config.recipient,
                });
                
                console.log('[v0] [FALLBACK] Server confirmed payment completion');
                
                return {
                  txid: directTxid,
                  amount: config.amount,
                  memo: config.memo,
                  timestamp: new Date().toISOString(),
                  status: 'success',
                };
              } catch (serverError) {
                console.error('[v0] [FALLBACK] Server completion failed:', serverError);
                throw {
                  status: 'failed',
                  message: `Server completion failed: ${serverError instanceof Error ? serverError.message : 'Unknown error'}`,
                  error: serverError,
                  isStuck: true,
                };
              }
            })();
            
            if (completionPromise) {
              completionPromise
                .then(resolve)
                .catch(reject);
            }
          },
          
          // CALLBACK 3: User cancelled during approval
          onCancel: () => {
            console.log('[v0] [APPROVAL] ✗ Payment cancelled by user');
            reject({
              status: 'cancelled',
              message: 'Payment cancelled by user',
            });
          },
          
          // CALLBACK 4: Error during payment creation
          onError: (error: any) => {
            console.error('[v0] [APPROVAL] ✗ Payment creation error:', error);
            reject({
              status: 'failed',
              message: error?.message || 'Payment creation failed',
              error,
            });
          },
        }
      );
    } catch (error) {
      console.error('[v0] [EXCEPTION] Exception during payment:', error);
      reject({
        status: 'failed',
        message: error instanceof Error ? error.message : 'Payment creation failed',
        error,
      });
    }
  });
}
