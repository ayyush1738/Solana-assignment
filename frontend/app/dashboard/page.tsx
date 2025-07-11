'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Plus, Coins, Send, Wallet as WalletIcon } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WalletInfo from '@/components/dashboard/WalletInfo';
import CreateTokenForm from '@/components/dashboard/CreateTokenForm';
import MintTokenForm from '@/components/dashboard/MintTokenForm';
import SendTokenForm from '@/components/dashboard/SendTokenForm';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <WalletIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-8">
              Please connect your Solana wallet to access the dashboard and start managing your tokens.
            </p>
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500 !border-none !rounded-lg !h-12 !px-8 !text-lg !font-medium hover:!from-purple-600 hover:!to-blue-600 !transition-all !duration-200" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Token Dashboard</h1>
          <p className="text-muted-foreground">
            Create, mint, and manage your Solana tokens
          </p>
        </div>

        <WalletInfo />

        <Tabs defaultValue="create" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </TabsTrigger>
            <TabsTrigger value="mint" className="flex items-center space-x-2">
              <Coins className="h-4 w-4" />
              <span>Mint</span>
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Send</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <WalletIcon className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-8">
            <CreateTokenForm />
          </TabsContent>

          <TabsContent value="mint" className="space-y-8">
            <MintTokenForm />
          </TabsContent>

          <TabsContent value="send" className="space-y-8">
            <SendTokenForm />
          </TabsContent>

          <TabsContent value="history" className="space-y-8">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}