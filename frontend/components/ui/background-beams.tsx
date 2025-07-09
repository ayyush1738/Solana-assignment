import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Particle = {
  left: string;
  top: string;
  delay: number;
  duration: number;
};

export function BackgroundBeams() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generatedParticles = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />

      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`beam-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
          style={{
            width: '200%',
            left: '-50%',
            top: `${20 + i * 15}%`,
          } as React.CSSProperties}
          animate={{
            x: ['0%', '100%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.5,
          }}
        />
      ))}

      {particles.map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{ left: p.left, top: p.top } as React.CSSProperties}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
