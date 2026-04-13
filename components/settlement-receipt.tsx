'use client';

import { useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { ProcessFlow } from './process-flow';
import { StatusBadge } from './status-badge';
import { WalletButton } from './wallet-button';
import type { SettlementData } from '@/lib/settlement-types';

interface SettlementReceiptProps {
  data: SettlementData;
  onDone: () => void;
}

export function SettlementReceipt({ data, onDone }: SettlementReceiptProps) {
  const { sdk } = usePiAuth();
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const handleDownloadReceipt = () => {
    try {
      const receiptContent = generateReceiptContent();
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent)
      );
      element.setAttribute(
        'download',
        `settlement_receipt_${data.receiptId}.txt`
      );
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setDownloadFeedback('Downloaded successfully');
      setTimeout(() => setDownloadFeedback(null), 3000);
    } catch (error) {
      setDownloadFeedback('Download failed');
      setTimeout(() => setDownloadFeedback(null), 3000);
    }
  };

  const generateReceiptContent = () => {
    return `
OFFICIAL SETTLEMENT RECEIPT
============================
SettleSync - Financial Settlement System

RECEIPT INFORMATION
Receipt ID: ${data.receiptId}
Transaction ID: ${data.transactionId}
Timestamp: ${data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}

SETTLEMENT DETAILS
Reference: ${data.reference}
Purpose: ${data.purpose}
Amount: ${data.amount.toFixed(2)} π (Pi)

RECIPIENT INFORMATION
Name: ${data.beneficiaryName}
Wallet Address: ${data.beneficiaryAddress}

STATUS: COMPLETED

AUTHORIZATION & VERIFICATION
This settlement receipt is an official record of the financial transaction.
The transaction details have been permanently recorded in the SettleSync system
and can be used as an authoritative reference to verify settlement completion.

Generated: ${new Date().toLocaleString()}
============================
`;
  };

  const copyToClipboard = () => {
    try {
      const receiptContent = generateReceiptContent();
      navigator.clipboard.writeText(receiptContent).then(() => {
        setCopyFeedback('Copied to clipboard');
        setTimeout(() => setCopyFeedback(null), 3000);
      }).catch(() => {
        setCopyFeedback('Copy failed');
        setTimeout(() => setCopyFeedback(null), 3000);
      });
    } catch (error) {
      setCopyFeedback('Copy failed');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Demo Mode Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900 px-4 py-2 sm:px-6">
        <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
          Demo Mode - No real transactions will be processed until app is deployed and connected to Pi Network
        </p>
      </div>

      <header className="py-4 sm:py-6 border-b border-border">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div></div>
          <div className="flex-shrink-0">
            <WalletButton />
          </div>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Settlement Record Complete
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Official settlement receipt generated
            </p>
          </div>
          <div>
            <StatusBadge status="completed" size="sm" />
          </div>
        </div>
      </header>

      {/* Process Flow */}
      <div className="px-4 sm:px-6 bg-muted/20">
        <ProcessFlow currentStep="receipt" />
      </div>

      <div className="flex-1 py-6 sm:py-8">
        {/* Success Badge */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Receipt Card */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6 space-y-4">
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Official Settlement Record
            </p>
            <p className="text-2xl font-bold text-primary mt-2">
              {data.amount.toFixed(2)} π
            </p>
          </div>

          <div className="border-t border-border pt-4" />

          {/* Receipt Details */}
          <div className="space-y-4">
            {/* Receipt ID - Prominently Displayed */}
            <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 border border-primary/30">
              <p className="text-xs font-semibold text-primary uppercase mb-1">Receipt ID</p>
              <p className="text-sm font-mono font-bold text-primary break-all">
                {data.receiptId || 'N/A'}
              </p>
            </div>

            {/* Transaction ID */}
            <div>
              <p className="text-xs text-muted-foreground">Transaction ID</p>
              <p className="text-sm font-mono text-card-foreground break-all">
                {data.transactionId}
              </p>
            </div>

            {/* Timestamp */}
            <div>
              <p className="text-xs text-muted-foreground">Date & Time</p>
              <p className="text-sm text-card-foreground">
                {data.timestamp
                  ? new Date(data.timestamp).toLocaleString()
                  : 'N/A'}
              </p>
            </div>

            <div className="border-t border-border my-2" />

            {/* Reference - Key Element */}
            <div className="bg-muted/30 rounded-lg p-3 border border-muted">
              <p className="text-xs font-semibold text-primary uppercase">Reference (Key Element)</p>
              <p className="text-sm font-medium text-card-foreground mt-1">
                {data.reference}
              </p>
            </div>

            {/* Purpose - Key Element */}
            <div className="bg-muted/30 rounded-lg p-3 border border-muted">
              <p className="text-xs font-semibold text-primary uppercase">Purpose (Key Element)</p>
              <p className="text-sm text-card-foreground mt-1">{data.purpose}</p>
            </div>

            {/* Status - Key Element */}
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-900">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase">Status (Key Element)</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">COMPLETED</p>
            </div>

            <div className="border-t border-border my-2" />

            {/* Recipient */}
            <div>
              <p className="text-xs text-muted-foreground">Recipient Name</p>
              <p className="text-sm font-medium text-card-foreground">
                {data.beneficiaryName}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Recipient Wallet Address</p>
              <p className="text-xs font-mono text-card-foreground break-all">
                {data.beneficiaryAddress}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4" />

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Record Status: <span className="text-green-600 dark:text-green-400 font-semibold">COMPLETED</span>
            </p>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900 p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Official Settlement Record
          </h3>
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            This settlement receipt is your official record. The transaction details have been permanently recorded in the SettleSync system and can be used as an authoritative reference to verify settlement completion. Keep this receipt for your records.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="py-4 sm:py-6 border-t border-border space-y-3">
        <button
          onClick={handleDownloadReceipt}
          className="w-full bg-secondary text-secondary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          Download Receipt
        </button>
        {downloadFeedback && (
          <p className="text-xs text-center text-green-600 dark:text-green-400 font-medium">
            {downloadFeedback}
          </p>
        )}

        <button
          onClick={copyToClipboard}
          className="w-full bg-secondary text-secondary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Copy Receipt
        </button>
        {copyFeedback && (
          <p className="text-xs text-center text-green-600 dark:text-green-400 font-medium">
            {copyFeedback}
          </p>
        )}

        <button
          onClick={onDone}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Create New Settlement
        </button>
      </div>
    </div>
  );
}
