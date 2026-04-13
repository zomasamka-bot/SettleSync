export interface SettlementData {
  reference: string;
  purpose: string;
  amount: number;
  beneficiaryAddress: string;
  beneficiaryName: string;
  transactionId?: string;
  receiptId?: string;
  timestamp?: string;
  status?: 'ready' | 'pending' | 'paid' | 'confirmed' | 'completed' | 'failed';
  processStatus?: 'data-entry' | 'review' | 'execution' | 'receipt';
}

export interface Settlement extends SettlementData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
