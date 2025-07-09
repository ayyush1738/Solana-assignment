import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeClientProvider } from '@/components/providers/ThemeClientProvider'; // <- NEW
import WalletContextProvider from '@/components/providers/WalletProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SolanaForge - Create and Mint Solana Tokens',
  description: 'The ultimate platform for creating, minting, and managing your Solana tokens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeClientProvider>
          <WalletContextProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </WalletContextProvider>
        </ThemeClientProvider>
      </body>
    </html>
  );
}
