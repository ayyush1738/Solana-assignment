import React from 'react';
import { Plus, Coins, Send, Shield, Zap, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function FeaturesSection() {
  const features = [
    {
      icon: Plus,
      title: 'Create Tokens',
      description: 'Launch your own SPL token with custom metadata, supply, and decimals in minutes.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Coins,
      title: 'Mint Tokens',
      description: 'Mint additional tokens to your wallet or any other address with just a few clicks.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Send,
      title: 'Send Tokens',
      description: 'Transfer tokens to any Solana address quickly and securely with low transaction fees.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Built with industry-standard security practices and integrated with trusted wallets.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience the speed of Solana with transactions that confirm in seconds.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Access your tokens from anywhere in the world with just your wallet connection.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Manage Tokens
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful tools and features to create, manage, and distribute your tokens
            on the Solana blockchain with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50 hover:border-border"
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}