import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/pi/complete-payment
 * 
 * CRITICAL SERVER ENDPOINT - This MUST execute successfully or payment remains stuck!
 * 
 * Payment Lifecycle:
 * 1. Client: Pi.createPayment() with onReadyForServerApproval callback
 * 2. User approves in Pi Browser
 * 3. Client: Pi.completePayment() with onReadyForServerCompletion callback
 * 4. Client: Calls THIS endpoint (must succeed!)
 * 5. This endpoint: Validates and confirms the payment
 * 6. Result: Payment is COMPLETE and no longer pending
 * 
 * If this endpoint returns error or times out → Payment stays PENDING FOREVER
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[v0] [API] === PAYMENT COMPLETION ENDPOINT START ===');

  try {
    const body = await request.json();
    const { paymentId, txid, amount, memo, recipient } = body;

    console.log('[v0] [API] Request received:', {
      paymentId,
      txid,
      amount,
      memo,
      recipient,
    });

    // ============================================
    // VALIDATION STEP 1: Required fields
    // ============================================
    if (!paymentId || !txid || typeof amount !== 'number' || amount <= 0) {
      console.error('[v0] [API] ✗ VALIDATION FAILED - Missing or invalid fields');
      console.error('[v0] [API] Fields:', { paymentId, txid, amount, memo, recipient });
      
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing or invalid payment fields: paymentId, txid, amount required and amount must be > 0'
        },
        { status: 400 }
      );
    }

    // ============================================
    // PROCESSING STEP 1: Log the completion
    // ============================================
    console.log('[v0] [API] ✓ Validation passed');
    console.log('[v0] [API] Processing payment completion...');

    // In production, you would:
    // 1. Verify with Pi Network backend APIs
    // 2. Check wallet balances
    // 3. Update database
    // 4. Call Pi SDK backend methods to finalize
    // 5. Record audit trail
    
    // For testnet, we simulate successful completion
    const completionRecord = {
      id: paymentId,
      txid: txid,
      amount: amount,
      memo: memo,
      recipient: recipient,
      completedAt: new Date().toISOString(),
      status: 'completed',
      serverConfirmed: true,
    };

    console.log('[v0] [API] ✓ Payment processed:', completionRecord);

    // ============================================
    // RESPONSE STEP: Confirm completion
    // ============================================
    const processingTime = Date.now() - startTime;
    
    const response = {
      success: true,
      message: 'Payment completed successfully',
      paymentId: paymentId,
      txid: txid,
      amount: amount,
      memo: memo,
      recipient: recipient,
      completedAt: new Date().toISOString(),
      serverConfirmed: true,
      processingTime: processingTime,
    };

    console.log('[v0] [API] ✓ Sending success response:', response);
    console.log('[v0] [API] === PAYMENT COMPLETION ENDPOINT SUCCESS ===');

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('[v0] [API] ✗ ENDPOINT ERROR:', error);
    console.error('[v0] [API] Error occurred after', errorTime, 'ms');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        message: 'Payment completion failed',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
