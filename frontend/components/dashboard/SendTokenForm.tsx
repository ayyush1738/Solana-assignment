//Transferring token from one account to another but not adding up to the supply
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
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getMint,
  createTransferInstruction,
} from '@solana/spl-token';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SendTokenForm() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tokenAddress: '',
    amount: '',
    recipientAddress: '',
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey || !sendTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const mint = new PublicKey(formData.tokenAddress.trim());
      const recipient = new PublicKey(formData.recipientAddress.trim());
      //Collecting mint information
      const mintInfo = await getMint(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
      const decimals = mintInfo.decimals;
      const parsedAmount = Number(formData.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Amount must be a positive number');
      }
      //Amount based on the specified number * decimals
      const amount = BigInt(Math.floor(parsedAmount * 10 ** decimals));

      //Sender associated token address
      const senderAta = await getAssociatedTokenAddress(
        mint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      //Reciever's associated token address
      const recipientAta = await getAssociatedTokenAddress(
        mint,
        recipient,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction();

      const senderAtaInfo = await connection.getAccountInfo(senderAta);
      if (!senderAtaInfo) {
        throw new Error("Sender's associated token account does not exist or is invalid.");
      }

      const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
      if (!recipientAtaInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            recipientAta,
            recipient,
            mint,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      transaction.add(
        createTransferInstruction(
          senderAta,
          recipientAta,
          publicKey,
          amount,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      //Sender will be the fee payer
      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const txid = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(txid, 'confirmed');

      toast.success('Tokens sent successfully!');
      setFormData({
        tokenAddress: '',
        amount: '',
        recipientAddress: '',
      });
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to send tokens: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Send Tokens</span>
        </CardTitle>
        <CardDescription>
          Transfer tokens to another wallet address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tokenAddress">Token Address</Label>
            <Input
              id="tokenAddress"
              name="tokenAddress"
              placeholder="Token mint address"
              value={formData.tokenAddress}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount to Send</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.000000001"
              placeholder="100"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="recipientAddress">Recipient Address</Label>
            <Input
              id="recipientAddress"
              name="recipientAddress"
              placeholder="Recipient wallet address"
              value={formData.recipientAddress}
              onChange={handleInputChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            disabled={loading || !connected}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Tokens...
              </>
            ) : (
              'Send Tokens'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
