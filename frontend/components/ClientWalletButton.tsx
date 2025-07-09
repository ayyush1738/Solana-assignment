'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function WalletMultiButtonClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure we only render this after the component is mounted
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <WalletMultiButton />;
}
