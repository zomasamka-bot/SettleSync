import type { SettlementData } from './settlement-types';

/**
 * Generate a unique settlement ID
 */
export const generateSettlementId = (): string => {
  return `SETTLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
};

/**
 * Generate a unique transaction ID
 */
export const generateTransactionId = (): string => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
};

/**
 * Format settlement amount with currency
 */
export const formatSettlementAmount = (amount: number): string => {
  return `${amount.toFixed(2)} π`;
};

/**
 * Validate wallet address format (basic validation)
 */
export const isValidWalletAddress = (address: string): boolean => {
  return address.trim().length > 0 && address.length > 10;
};

/**
 * Create settlement receipt text
 */
export const createSettlementReceipt = (data: SettlementData): string => {
  const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A';
  
  return `
═══════════════════════════════════════════════════════════
                    SETTLEMENT RECEIPT
                  SettleSync Financial System
═══════════════════════════════════════════════════════════

TRANSACTION CONFIRMATION
─────────────────────────────────────────────────────────
Transaction ID:    ${data.transactionId || 'N/A'}
Settlement Ref:    ${data.reference}
Timestamp:         ${timestamp}
Status:            ${data.status === 'completed' ? 'COMPLETED ✓' : data.status || 'PENDING'}

TRANSACTION DETAILS
─────────────────────────────────────────────────────────
Amount:            ${formatSettlementAmount(data.amount)}
Purpose:           ${data.purpose}

RECIPIENT INFORMATION
─────────────────────────────────────────────────────────
Recipient Name:    ${data.beneficiaryName}
Wallet Address:    ${data.beneficiaryAddress}

AUTHORIZATION & DISCLAIMER
─────────────────────────────────────────────────────────
This settlement has been officially recorded in the 
SettleSync system. This receipt serves as an authoritative 
reference for settlement verification and can be used for 
future reference.

Important:
• This settlement is final and cannot be reversed
• Keep this receipt for your records
• For support or disputes, contact the system administrator

Generated: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════════
  `;
};

/**
 * Validate settlement data
 */
export const validateSettlementData = (data: Partial<SettlementData>): string[] => {
  const errors: string[] = [];

  if (!data.reference?.trim()) {
    errors.push('Settlement reference is required');
  }

  if (!data.purpose?.trim()) {
    errors.push('Purpose is required');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!data.beneficiaryName?.trim()) {
    errors.push('Beneficiary name is required');
  }

  if (!data.beneficiaryAddress?.trim()) {
    errors.push('Beneficiary wallet address is required');
  } else if (!isValidWalletAddress(data.beneficiaryAddress)) {
    errors.push('Invalid wallet address format');
  }

  return errors;
};
