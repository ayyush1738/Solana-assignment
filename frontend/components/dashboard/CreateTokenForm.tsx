'use client';

import React, { useState, useContext } from 'react';
import {
  useConnection,
  useWallet,
  WalletContext,
} from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';

import {
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";

import { notification } from "antd";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreateTokenForm() {
  const { connected } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    totalSupply: '',
    decimals: '1',
    imageUrl: '',
  });

  const { connection } = useConnection();
  const wallet = useWallet();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !wallet.publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      const decimals = Number(formData.decimals);
      const totalSupply = Number(formData.totalSupply);
      if (
        isNaN(decimals) ||
        isNaN(totalSupply) ||
        decimals < 0 ||
        decimals > 9 ||
        totalSupply <= 0
      ) {
        toast.error('Please enter valid decimals (0-9) and total supply (>0)');
        setLoading(false);
        return;
      }

      const mintKeypair = Keypair.generate();
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const mintAmount = BigInt(totalSupply * Math.pow(10, decimals));

      const metadata = {
        mint: mintKeypair.publicKey,
        name: formData.name,
        totalSupply: mintAmount,
        symbol: formData.symbol,
        description: formData.description,
        uri: formData.imageUrl,
        additionalMetadata: [],
      };

      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      const associatedToken = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mintKeypair.publicKey,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          wallet.publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintKeypair.publicKey,
          metadata: mintKeypair.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        }),
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedToken,
          wallet.publicKey,
          metadata.totalSupply,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      await wallet.sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });

      notification.success({
        message: "Success",
        description: "Token created Successfully",
        duration: 2,
      });
      setFormData({
        name: "",
        symbol: "",
        description: "",
        totalSupply: "",
        decimals: "1",
        imageUrl: "",
      });
    } catch (error: any) {
      console.error(error);
      notification.error({
        message: "Failed",
        description: error?.message || "An error occurred while creating the Token",
        duration: 2,
      });
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
                min="1"
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
