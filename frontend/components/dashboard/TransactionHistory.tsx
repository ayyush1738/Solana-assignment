'use client';

import React, { useEffect, useState } from 'react';
import {
  Connection,
  ParsedTransactionWithMeta,
  PublicKey,
  clusterApiUrl,
} from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'create' | 'mint' | 'send' | 'receive';
  amount: string;
  token: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
  hash: string;
}

export default function TransactionHistory() {
  const { connected, publicKey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!connected || !publicKey) return;
    setLoading(true);

    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 10,
      });

      const txs: Transaction[] = [];

      for (const sigInfo of signatures) {
        const parsedTx: ParsedTransactionWithMeta | null =
          await connection.getParsedTransaction(sigInfo.signature, 'confirmed');

        if (!parsedTx) continue;

        const { transaction, meta } = parsedTx;
        const instructions = transaction.message.instructions as any[];

        let type: Transaction['type'] = 'send';

        const hasCreate = instructions.some(
          (ix) => ix.program === 'spl-token' && ix.parsed?.type === 'initializeMint'
        );
        const hasMint = instructions.some(
          (ix) => ix.program === 'spl-token' && ix.parsed?.type === 'mintTo'
        );
        const hasTransfer = instructions.some(
          (ix) => ix.program === 'spl-token' && ix.parsed?.type === 'transfer'
        );

        if (hasCreate) {
          type = 'create';
        } else if (hasMint) {
          type = 'mint';
        } else if (hasTransfer) {
          const pre = meta?.preTokenBalances?.find(b => b.owner === publicKey.toBase58());
          const post = meta?.postTokenBalances?.find(b => b.owner === publicKey.toBase58());

          if (pre && post) {
            const preAmount = BigInt(pre.uiTokenAmount.amount || '0');
            const postAmount = BigInt(post.uiTokenAmount.amount || '0');
            type = postAmount > preAmount ? 'receive' : 'send';
          } else if (post && !pre) {
            type = 'receive';
          }
        }

        let amount = '0';
        let token = 'SPL';

        const parsedIx = instructions.find(ix => ix.parsed?.info?.amount);
        if (parsedIx?.parsed?.info) {
          const rawAmount = parsedIx.parsed.info.amount;
          const mintAddr = parsedIx.parsed.info.mint;

          if (mintAddr) {
            try {
              const mintPubkey = new PublicKey(mintAddr);
              const mintInfo = await getMint(connection, mintPubkey);
              const decimals = mintInfo.decimals;
              amount = (Number(rawAmount) / 10 ** decimals).toString();
              token = `${mintAddr.slice(0, 4)}...`;
            } catch {
              amount = rawAmount;
            }
          } else {
            amount = rawAmount;
          }
        }

        txs.push({
          id: sigInfo.signature,
          type,
          amount,
          token,
          timestamp: sigInfo.blockTime
            ? new Date(sigInfo.blockTime * 1000)
            : new Date(),
          status: sigInfo.err ? 'failed' : 'success',
          hash: sigInfo.signature,
        });
      }

      setTransactions(txs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) fetchTransactions();
  }, [connected, publicKey]);

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'create':
        return 'bg-purple-500/20 text-purple-500';
      case 'mint':
        return 'bg-blue-500/20 text-blue-500';
      case 'send':
        return 'bg-red-500/20 text-red-500';
      case 'receive':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'failed':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transaction History
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!connected ? (
          <p className="text-muted-foreground">
            Please connect your wallet to view transactions.
          </p>
        ) : transactions.length === 0 ? (
          <p className="text-muted-foreground">No transactions found</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Badge className={getTypeColor(tx.type)}>
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </Badge>
                  <div>
                    <p className="font-medium">
                      {tx.amount} {tx.token}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tx.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://explorer.solana.com/tx/${tx.hash}?cluster=devnet`,
                        '_blank'
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
