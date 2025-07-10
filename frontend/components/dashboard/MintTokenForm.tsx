'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  createMintToInstruction,
  getMint,
} from '@solana/spl-token';
import { unpack } from '@solana/spl-token-metadata';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Helper to fetch SPL Token 2022 metadata from the mint account
async function fetchToken2022Metadata(
  connection: Connection,
  mintAddress: string
): Promise<{ name: string; symbol: string; uri: string } | null> {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const mintAccount = await connection.getAccountInfo(mintPubkey);
    if (!mintAccount) return null;

    // Use unpack to get all extensions
    const extensions = unpack(mintAccount.data);
    // Find the extension with name, symbol, and uri fields
    const metadataExt = extensions.find(
      (ext) =>
        ext &&
        typeof ext === 'object' &&
        'name' in ext &&
        'symbol' in ext &&
        'uri' in ext
    );
    if (!metadataExt) return null;

    // The extension object contains name, symbol, uri
    const { name, symbol, uri } = metadataExt as any;
    return { name, symbol, uri };
  } catch (err) {
    return null;
  }
}

export default function MintTokenForm() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tokenAddress: '',
    amount: '',
    recipientAddress: '',
  });

  const [tokenMetadata, setTokenMetadata] = useState<{
    name: string;
    symbol: string;
    uri: string;
  } | null>(null);

  // Fetch metadata when tokenAddress changes
  const fetchAndSetTokenMetadata = useCallback(async (mintAddress: string) => {
    if (!mintAddress) {
      setTokenMetadata(null);
      return;
    }
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const metadata = await fetchToken2022Metadata(connection, mintAddress);
      setTokenMetadata(metadata);
    } catch {
      setTokenMetadata(null);
    }
  }, []);

  useEffect(() => {
    if (formData.tokenAddress) {
      fetchAndSetTokenMetadata(formData.tokenAddress);
    } else {
      setTokenMetadata(null);
    }
  }, [formData.tokenAddress, fetchAndSetTokenMetadata]);

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
      const mint = new PublicKey(formData.tokenAddress.trim());
      const recipient = new PublicKey(formData.recipientAddress.trim());

      // Validate amount
      const mintInfo = await getMint(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
      const decimals = mintInfo.decimals;
      const parsedAmount = Number(formData.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Amount must be a positive number');
      }
      const amount = BigInt(Math.floor(parsedAmount * 10 ** decimals));

      // Get or create recipient ATA
      const ata = await getAssociatedTokenAddress(
        mint,
        recipient,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const ataInfo = await connection.getAccountInfo(ata);

      const transaction = new Transaction();

      if (!ataInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            ata,
            recipient,
            mint,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      transaction.add(
        createMintToInstruction(
          mint,
          ata,
          publicKey,
          amount,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const txid = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(txid, 'confirmed');

      toast.success(`✅ Minted ${formData.amount} tokens!`);
      setFormData({ tokenAddress: '', amount: '', recipientAddress: '' });
      setTokenMetadata(null);
    } catch (error: any) {
      console.error(error);
      toast.error('❌ Minting failed: ' + (error?.message || 'Unknown error'));
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
        <CardDescription>
          Mint additional tokens to a specified address
        </CardDescription>
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
            {tokenMetadata && (
              <div className="mt-2 text-sm text-gray-600">
                <strong>Name:</strong> {tokenMetadata.name} <br />
                <strong>Symbol:</strong> {tokenMetadata.symbol} <br />
                <strong>URI:</strong>{' '}
                <a
                  href={tokenMetadata.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {tokenMetadata.uri}
                </a>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="amount">Amount to Mint</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="any"
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
