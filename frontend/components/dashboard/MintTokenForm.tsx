'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MintTokenForm() {
  const { connected, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tokenAddress: '',
    amount: '',
    recipientAddress: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement token minting logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast.success('Tokens minted successfully!');
      setFormData({
        tokenAddress: '',
        amount: '',
        recipientAddress: '',
      });
    } catch (error) {
      toast.error('Failed to mint tokens');
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
            <Label htmlFor="amount">Amount to Mint</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.000000001"
              placeholder="1000"
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