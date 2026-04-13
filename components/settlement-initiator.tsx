'use client';

import { useState } from 'react';
import { ProcessFlow } from './process-flow';
import { StatusBadge } from './status-badge';
import { WalletButton } from './wallet-button';
import type { SettlementData } from '@/lib/settlement-types';

interface SettlementInitiatorProps {
  onInitiate: (data: SettlementData) => void;
}

export function SettlementInitiator({ onInitiate }: SettlementInitiatorProps) {
  const [formData, setFormData] = useState({
    reference: '',
    purpose: '',
    amount: '',
    beneficiaryAddress: '',
    beneficiaryName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reference.trim()) {
      newErrors.reference = 'Reference is required';
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.beneficiaryAddress.trim()) {
      newErrors.beneficiaryAddress = 'Beneficiary wallet address is required';
    }
    if (!formData.beneficiaryName.trim()) {
      newErrors.beneficiaryName = 'Beneficiary name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onInitiate({
      reference: formData.reference,
      purpose: formData.purpose,
      amount: parseFloat(formData.amount),
      beneficiaryAddress: formData.beneficiaryAddress,
      beneficiaryName: formData.beneficiaryName,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 sm:py-6 border-b border-border px-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              SettleSync
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create and Execute Settlement Record
            </p>
          </div>
          <div className="relative">
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Process Flow */}
      <div className="px-4 sm:px-6 bg-muted/20">
        <ProcessFlow currentStep="data-entry" />
      </div>

      <div className="flex-1 py-6 sm:py-8 px-4 sm:px-6 max-w-2xl mx-auto w-full">
        <div className="bg-card rounded-lg border border-border p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">
                Create Settlement Record
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter settlement details to generate an official settlement record with receipt
              </p>
            </div>
            <div>
              <StatusBadge status="ready" size="sm" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Reference - Highlighted as Key Element */}
            <div className="bg-muted/30 rounded-lg p-4 border border-muted">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Settlement Reference <span className="text-xs text-primary font-semibold">(Key Element)</span>
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="e.g., INV-2024-001"
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.reference && (
                <p className="text-xs text-destructive mt-1">{errors.reference}</p>
              )}
            </div>
            {/* Purpose - Highlighted as Key Element */}
            <div className="bg-muted/30 rounded-lg p-4 border border-muted">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Purpose <span className="text-xs text-primary font-semibold">(Key Element)</span>
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Describe the settlement purpose..."
                rows={3}
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              {errors.purpose && (
                <p className="text-xs text-destructive mt-1">{errors.purpose}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Amount (π)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.amount && (
                <p className="text-xs text-destructive mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Beneficiary Name */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Beneficiary Name
              </label>
              <input
                type="text"
                name="beneficiaryName"
                value={formData.beneficiaryName}
                onChange={handleChange}
                placeholder="Full name of recipient"
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.beneficiaryName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.beneficiaryName}
                </p>
              )}
            </div>

            {/* Beneficiary Address */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Beneficiary Wallet Address
              </label>
              <input
                type="text"
                name="beneficiaryAddress"
                value={formData.beneficiaryAddress}
                onChange={handleChange}
                placeholder="Pi Network wallet address"
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              />
              {errors.beneficiaryAddress && (
                <p className="text-xs text-destructive mt-1">
                  {errors.beneficiaryAddress}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity mt-6"
            >
              Review Settlement
            </button>

            {/* Note about Settlement Record and Receipt */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed mb-2">
                <span className="font-semibold">Real Pi Network Payment Execution & Settlement Record:</span>
              </p>
              <ul className="text-xs text-blue-900 dark:text-blue-200 space-y-1 leading-relaxed">
                <li>• A real Pi Network payment will be processed from your wallet to the beneficiary's wallet address (testnet)</li>
                <li>• You will be prompted to confirm the payment in Pi Browser</li>
                <li>• An official settlement record will be created with transaction ID and Receipt ID</li>
                <li>• A verifiable Settlement Receipt will be generated containing all transaction details</li>
                <li>• All transaction details will be permanently recorded in the SettleSync system</li>
                <li>• You can use this receipt as an authoritative reference to verify settlement completion</li>
              </ul>
            </div>

            {/* Warning */}
            <div className="p-4 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                ⚠️ Please review all transaction details carefully before proceeding. Once executed, settlements cannot be reversed.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
