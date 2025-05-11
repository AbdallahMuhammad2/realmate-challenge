'use client';

import { motion } from 'framer-motion';

export default function Logo({ theme = 'default' }) {
  const themeConfig = {
    default: {
      from: 'from-blue-600',
      to: 'to-indigo-600',
      bg1: '#3B82F6',
      bg2: '#4F46E5',
    },
    dark: {
      from: 'from-purple-600',
      to: 'to-indigo-800',
      bg1: '#9333EA',
      bg2: '#3730A3',
    },
    vibrant: {
      from: 'from-pink-500',
      to: 'to-purple-500',
      bg1: '#EC4899',
      bg2: '#8B5CF6',
    },
    minimal: {
      from: 'from-neutral-700',
      to: 'to-neutral-900',
      bg1: '#404040',
      bg2: '#171717',
    },
    neo: {
      from: 'from-black',
      to: 'to-black',
      bg1: '#000000',
      bg2: '#000000',
    },
  };

  const currentTheme = themeConfig[theme as keyof typeof themeConfig];
  
  return (
    <motion.div 
      className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} flex items-center justify-center text-white relative overflow-hidden shadow-lg`}
      initial={{ rotate: -10 }}
      animate={{ 
        rotate: [0, -5, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: "easeInOut" 
      }}
    >
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)`
        }}
      />
      
      <motion.svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6 relative z-10" 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </motion.svg>
      
      <motion.div
        className="absolute h-1/2 w-full opacity-20"
        style={{ 
          bottom: 0,
          background: `linear-gradient(to top, ${currentTheme.bg2}, transparent)`
        }}
        animate={{ 
          y: [5, -5, 5] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}