'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMint,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MintTokenForm() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tokenAddress: '',
    amount: '',
    recipientAddress: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey || !sendTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const mint = new PublicKey(formData.tokenAddress);
      const recipient = new PublicKey(formData.recipientAddress);

      // 🔥 Fetch actual decimals
      const mintInfo = await getMint(connection, mint);
      const decimals = mintInfo.decimals;

      const ata = await getAssociatedTokenAddress(
        mint,
        recipient,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const ataInfo = await connection.getAccountInfo(ata);
      const amount = BigInt(Number(formData.amount) * 10 ** decimals);

      const transaction = new Transaction();

      if (!ataInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            ata,
            recipient,
            mint
          )
        );
      }

      transaction.add(
        createMintToInstruction(mint, ata, publicKey, amount)
      );

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const txid = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(txid, 'confirmed');

      toast.success(`✅ Minted ${formData.amount} tokens!`);
      setFormData({ tokenAddress: '', amount: '', recipientAddress: '' });
    } catch (error) {
      console.error(error);
      toast.error('❌ Minting failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Coins className="h-5 w-5" />
          <span>Mint Tokens</span>
        </CardTitle>
        <CardDescription>Mint additional tokens to a specified address</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tokenAddress">Token Mint Address</Label>
            <Input
              id="tokenAddress"
              name="tokenAddress"
              placeholder="Mint address of the token"
              value={formData.tokenAddress}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount to Mint</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.000000001"
              placeholder="e.g. 1000"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="recipientAddress">Recipient Wallet Address</Label>
            <Input
              id="recipientAddress"
              name="recipientAddress"
              placeholder="e.g. recipient wallet address"
              value={formData.recipientAddress}
              onChange={handleInputChange}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            disabled={loading || !connected}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting Tokens...
              </>
            ) : (
              'Mint Tokens'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
