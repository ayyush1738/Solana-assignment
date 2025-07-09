'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
} from '@solana/spl-token';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreateTokenForm() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    totalSupply: '',
    decimals: '9',
    imageUrl: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey || !sendTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      const mint = Keypair.generate();
      const decimals = parseInt(formData.decimals);
      const totalSupply = parseInt(formData.totalSupply);
      const mintAmount = BigInt(totalSupply * Math.pow(10, decimals));
      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      const ata = await getAssociatedTokenAddress(
        mint.publicKey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(
        // 1. Allocate account for the Mint
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        // 2. Initialize the Mint
        createInitializeMintInstruction(
          mint.publicKey,
          decimals,
          publicKey,
          null
        ),
        // 3. Create associated token account for user
        createAssociatedTokenAccountInstruction(
          publicKey,
          ata,
          publicKey,
          mint.publicKey
        ),
        // 4. Mint tokens to user's associated token account
        createMintToInstruction(
          mint.publicKey,
          ata,
          publicKey,
          mintAmount
        )
      );

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Sign with Phantom and partial sign with Mint key
      transaction.partialSign(mint);
      const txSignature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(txSignature, 'confirmed');

      toast.success(`✅ Token Created! Mint: ${mint.publicKey.toBase58()}`);
      console.log('Mint Address:', mint.publicKey.toBase58());

      setFormData({
        name: '',
        symbol: '',
        description: '',
        totalSupply: '',
        decimals: '9',
        imageUrl: '',
      });
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to create token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Create New Token</span>
        </CardTitle>
        <CardDescription>
          Create a new SPL token with custom metadata and supply
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Token Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="My Token"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                name="symbol"
                placeholder="TKN"
                value={formData.symbol}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="A brief description of your token"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalSupply">Total Supply</Label>
              <Input
                id="totalSupply"
                name="totalSupply"
                type="number"
                placeholder="1000000"
                value={formData.totalSupply}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="decimals">Decimals</Label>
              <Input
                id="decimals"
                name="decimals"
                type="number"
                min="0"
                max="9"
                value={formData.decimals}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              placeholder="https://example.com/token.png"
              value={formData.imageUrl}
              onChange={handleInputChange}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            disabled={loading || !connected}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Token...
              </>
            ) : (
              'Create Token'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
