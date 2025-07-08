interface Window {
  solana?: {
    isPhantom: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    publicKey: { toString: () => string } | null;
  };
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    isMetaMask: boolean;
  };
}