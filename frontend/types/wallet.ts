export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  provider: 'phantom' | 'metamask' | null;
}

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  symbol?: string;
}

export interface Transaction {
  signature: string;
  type: 'create' | 'mint' | 'transfer';
  amount?: number;
  recipient?: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}