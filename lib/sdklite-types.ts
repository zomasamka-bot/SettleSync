export interface PurchaseResult {
  ok: true;
  productId: string;
  paymentId: string;
  txid: string;
}

export interface SDKLiteError extends Error {
  name: "SDKLiteError";
  code: "product_not_found" | "purchase_cancelled" | "purchase_error";
}

export interface UserStateRecord {
  blob: Record<string, unknown>;
  updatedAt: string;
  version: number;
}

export interface UserPurchaseBalance {
  productId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price_in_pi: number;
  total_quantity: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductsResponse {
  products: Product[];
}

export interface PurchasesResponse {
  purchases: UserPurchaseBalance[];
}

export interface ConsumeResponse {
  productId: string;
  quantity: number;
}

export interface RestoreOptions {
  keys?: string[];
}

export interface SDKLiteState {
  get: (key: string) => Promise<UserStateRecord | null>;
  set: (key: string, blob: Record<string, unknown>) => Promise<void>;
  products: () => Promise<ProductsResponse>;
  purchases: () => Promise<PurchasesResponse>;
  consume: (productId: string, quantity?: number) => Promise<ConsumeResponse>;
  restore: (options?: RestoreOptions) => Promise<PurchasesResponse>;
}

export interface SDKLiteInstance {
  login: () => Promise<boolean>;
  makePurchase: (productId: string) => Promise<PurchaseResult>;
  showInterstitial: () => Promise<boolean>;
  showRewarded: (productId: string) => Promise<boolean>;
  isAdNetworkSupported: () => Promise<boolean>;
  state: SDKLiteState;
}

declare global {
  interface Window {
    SDKLite: {
      init: () => Promise<SDKLiteInstance>;
    };
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (scopes?: string[]) => Promise<{ username?: string; uid?: string } | null>;
      createPayment: (config: {
        amount: number;
        memo: string;
        metadata?: Record<string, unknown>;
      }, callbacks: {
        onReadyForServerApproval: (paymentId: string) => void;
        onReadyForServerCompletion?: (paymentId: string, txid: string) => void;
        onCancel: () => void;
        onError: (error: any) => void;
      }) => void;
      completePayment: (paymentId: string, txInfo: { txid: string }, callbacks: {
        onReadyForServerCompletion: (paymentId: string, txid: string) => void;
        onError: (error: any) => void;
      }) => void;
      requestUserInfo?: () => Promise<{ username?: string; uid?: string } | null>;
      wallet?: {
        connect?: () => Promise<{ address?: string } | null>;
      };
    };
  }
}
