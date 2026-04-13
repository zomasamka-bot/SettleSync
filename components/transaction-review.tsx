'use client';

import { useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useSettlements } from '@/hooks/use-settlements';
import { executePayment } from '@/lib/pi-network-payment';
import { ProcessFlow } from './process-flow';
import { StatusBadge } from './status-badge';
import { WalletButton } from './wallet-button';
import { Spinner } from './ui/spinner';
import type { SettlementData } from '@/lib/settlement-types';

interface TransactionReviewProps {
  data: SettlementData;
  onConfirm: (transactionId: string, receiptId: string) => void;
  onBack: () => void;
}

export function TransactionReview({
  data,
  onConfirm,
  onBack,
}: TransactionReviewProps) {
  const { sdk } = usePiAuth();
  const { saveSettlement } = useSettlements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Generate unique transaction ID and Receipt ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const receiptId = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Save settlement to persistent storage with 'pending' status
      const now = new Date().toISOString();
      const settlementRecord = {
        id: transactionId,
        ...data,
        transactionId,
        receiptId,
        status: 'pending' as const,
        timestamp: now,
        createdAt: now,
        updatedAt: now,
      };

      saveSettlement(settlementRecord);

      // Execute real Pi Network payment
      console.log('[v0] Executing real Pi Network payment...');
      const paymentResult = await executePayment({
        amount: data.amount,
        memo: `${data.reference} - ${data.purpose}`,
        recipient: data.beneficiaryAddress,
      });

      console.log('[v0] Payment successful:', paymentResult);

      // Update settlement with successful payment
      saveSettlement({
        ...settlementRecord,
        status: 'paid' as const,
        timestamp: paymentResult.timestamp,
        updatedAt: new Date().toISOString(),
      });

      onConfirm(transactionId, receiptId);
    } catch (err) {
      console.error('[v0] Payment error:', err);

      let errorMessage = 'Failed to execute settlement';
      let isStuckPayment = false;

      // Check if payment was cancelled
      if (err && typeof err === 'object' && 'status' in err) {
        if (err.status === 'cancelled') {
          errorMessage = 'Payment was cancelled. Settlement not executed.';
        } else if (err.status === 'failed') {
          errorMessage = (err as any).message || 'Payment failed. Please try again.';
          // Check if payment is stuck on Pi Network
          if ((err as any).isStuck) {
            isStuckPayment = true;
            errorMessage =
              'Payment was approved but failed to complete on server. The payment may be stuck on the Pi Network. ' +
              'Please contact support to resolve this issue.';
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && 'message' in err) {
        errorMessage = (err.message as string);
      }

      // Provide specific guidance for Pi Browser issues
      if (errorMessage.includes('Pi Browser')) {
        errorMessage +=
          '\n\nTo use SettleSync, please open this app in Pi Browser by visiting: https://settle-sync-six.vercel.app within the Pi app.';
      }

      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 sm:py-6 border-b border-border px-4 sm:px-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-primary hover:opacity-80"
          >
            ← Back
          </button>
          <div className="flex-shrink-0">
            <WalletButton />
          </div>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Review Settlement Record
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verify details before official execution
            </p>
          </div>
          <div>
            <StatusBadge status="confirmed" size="sm" />
          </div>
        </div>
      </header>

      {/* Process Flow */}
      <div className="px-4 sm:px-6 bg-muted/20">
        <ProcessFlow currentStep="review" />
      </div>

      <div className="flex-1 py-6 sm:py-8 px-4 sm:px-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Transaction Details Card */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Settlement Details
          </h2>

          <div className="space-y-4">
            {/* Reference - Key Element */}
            <div className="bg-muted/30 rounded-lg p-3 border border-muted">
              <span className="text-xs font-semibold text-primary uppercase">Reference (Key Element)</span>
              <p className="text-sm font-medium text-card-foreground mt-1">
                {data.reference}
              </p>
            </div>

            {/* Purpose - Key Element */}
            <div className="bg-muted/30 rounded-lg p-3 border border-muted">
              <span className="text-xs font-semibold text-primary uppercase">Purpose (Key Element)</span>
              <p className="text-sm font-medium text-card-foreground mt-1">
                {data.purpose}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-2" />

            {/* Amount */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-lg font-bold text-primary">
                {data.amount.toFixed(2)} π
              </span>
            </div>
          </div>
        </div>

        {/* Recipient Card */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Recipient Information
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="text-sm font-medium text-card-foreground">
                {data.beneficiaryName}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
              <p className="text-xs font-mono text-card-foreground break-all">
                {data.beneficiaryAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div className="bg-muted rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            ⚠️ Official Settlement Execution
          </h3>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li>• This settlement cannot be reversed once executed</li>
            <li>• Ensure the recipient address is correct</li>
            <li>• An official settlement receipt will be generated</li>
            <li>• Transaction details will be recorded as a permanent settlement record</li>
          </ul>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="py-4 sm:py-6 border-t border-border px-4 sm:px-6 space-y-3 max-w-2xl mx-auto w-full">
        <button
          onClick={handleExecute}
          disabled={isProcessing}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing && <Spinner className="w-4 h-4" />}
          {isProcessing ? 'Processing Settlement...' : 'Execute Settlement Record'}
        </button>
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="w-full bg-secondary text-secondary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
