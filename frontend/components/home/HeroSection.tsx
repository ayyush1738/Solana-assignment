//UI for the Hero section which routes to dashboard
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { BackgroundBeams } from '@/components/ui/background-beams';

export default function HeroSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLaunch = () => {
    setLoading(true);
    router.push('/dashboard');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-background/50">
      <BackgroundBeams />

      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full px-4 py-2 text-sm font-medium mb-8">
            <span>Built on Solana Devnet</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Create and Mint Your Own{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Solana Token
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The easiest way to create, mint, and manage SPL tokens on Solana.
            No coding required - just connect your wallet and start building.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              disabled={loading}
              onClick={handleLaunch}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-none h-12 px-8 text-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
