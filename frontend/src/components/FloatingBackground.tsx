'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type BackgroundBubble = {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
};

export default function FloatingBackground({ theme = 'default' }) {
  const [bubbles, setBubbles] = useState<BackgroundBubble[]>([]);

  const themeConfig = {
    default: {
      colors: ['rgba(59, 130, 246, 0.1)', 'rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)'],
      count: 12,
    },
    dark: {
      colors: ['rgba(99, 102, 241, 0.05)', 'rgba(139, 92, 246, 0.05)', 'rgba(76, 29, 149, 0.05)'],
      count: 15,
    },
    vibrant: {
      colors: ['rgba(236, 72, 153, 0.1)', 'rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.1)'],
      count: 20,
    },
    minimal: {
      colors: ['rgba(229, 231, 235, 0.5)', 'rgba(209, 213, 219, 0.5)'],
      count: 8,
    },
    neo: {
      colors: ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.08)'],
      count: 5,
    },
  };

  useEffect(() => {
    const config = themeConfig[theme as keyof typeof themeConfig] || themeConfig.default;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const newBubbles = Array.from({ length: config.count }).map((_, i) => ({
      id: i,
      size: Math.random() * 200 + 50,
      x: Math.random() * windowWidth,
      y: Math.random() * windowHeight,
      delay: Math.random() * 10,
      duration: Math.random() * 20 + 20,
    }));
    
    setBubbles(newBubbles);
  }, [theme]);

  if (theme === 'minimal') return null;

  const config = themeConfig[theme as keyof typeof themeConfig] || themeConfig.default;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.x,
            top: bubble.y,
            backgroundColor: config.colors[bubble.id % config.colors.length],
          }}
          animate={{
            x: [0, Math.random() * 40 - 20, 0],
            y: [0, Math.random() * 40 - 20, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: bubble.duration,
            delay: bubble.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}