'use client';

import { useState } from 'react';
import { SettlementInitiator } from '@/components/settlement-initiator';
import { TransactionReview } from '@/components/transaction-review';
import { SettlementReceipt } from '@/components/settlement-receipt';
import { SettlementHistory } from '@/components/settlement-history';
import type { SettlementData } from '@/lib/settlement-types';

type AppState = 'initiator' | 'review' | 'receipt' | 'history';

/**
 * SettleSync - Financial Settlement Application
 * Manages the complete settlement lifecycle with persistent storage and cross-tab sync
 */
export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('initiator');
  const [settlementData, setSettlementData] = useState<SettlementData | null>(null);

  const handleInitiate = (data: SettlementData) => {
    setSettlementData({
      ...data,
      status: 'ready',
      processStatus: 'review',
    });
    setAppState('review');
  };

  const handleConfirm = (transactionId: string, receiptId: string) => {
    if (settlementData) {
      setSettlementData({
        ...settlementData,
        transactionId,
        receiptId,
        timestamp: new Date().toISOString(),
        status: 'completed',
        processStatus: 'receipt',
      });
      setAppState('receipt');
    }
  };

  const handleReset = () => {
    setSettlementData(null);
    setAppState('initiator');
  };

  const handleViewHistory = () => {
    setAppState('history');
  };

  const handleBackFromHistory = () => {
    setAppState('initiator');
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-4 py-4 sm:py-6 max-w-2xl">
        {appState === 'initiator' && (
          <>
            <div className="mb-6 flex gap-2">
              <button
                onClick={handleViewHistory}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                View History
              </button>
            </div>
            <SettlementInitiator onInitiate={handleInitiate} />
          </>
        )}
        {appState === 'review' && settlementData && (
          <TransactionReview
            data={settlementData}
            onConfirm={handleConfirm}
            onBack={handleReset}
          />
        )}
        {appState === 'receipt' && settlementData && (
          <SettlementReceipt
            data={settlementData}
            onDone={handleReset}
          />
        )}
        {appState === 'history' && (
          <div>
            <button
              onClick={handleBackFromHistory}
              className="mb-6 px-4 py-2 text-sm text-primary hover:opacity-80"
            >
              ← Back to Settlement
            </button>
            <div className="bg-card rounded-lg border border-border p-6 mb-4">
              <h2 className="text-xl font-semibold text-card-foreground">Settlement History</h2>
              <p className="text-sm text-muted-foreground mt-1">All settlements and their current status</p>
            </div>
            <SettlementHistory />
          </div>
        )}
      </main>
    </div>
  );
}
