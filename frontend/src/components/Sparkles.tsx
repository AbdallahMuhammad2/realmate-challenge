'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

interface SparklesProps {
  children: React.ReactNode;
}

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

const Sparkle = ({ size, color, style }: { size: number, color: string, style: React.CSSProperties }) => {
  const sparkleVariants = {
    start: {
      opacity: 0,
      scale: 0
    },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 1,
        ease: "easeOut",
        times: [0, 0.1, 1]
      }
    }
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 68 68"
      style={style}
      variants={sparkleVariants}
      initial="start"
      animate="animate"
    >
      <path
        d="M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z"
        fill={color}
      />
    </motion.svg>
  );
};

export function Sparkles({ children }: SparklesProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number, size: number, color: string, style: React.CSSProperties }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  
  const createSparkle = () => {
    const size = random(8, 15);
    const color = ["#FFC700", "#FF5E5B", "#69D2E7", "#9356FB"][Math.floor(Math.random() * 4)];
    const containerWidth = containerRef.current?.offsetWidth || 100;
    const containerHeight = containerRef.current?.offsetHeight || 50;
    
    const style = {
      position: "absolute",
      left: `${random(0, containerWidth)}px`,
      top: `${random(0, containerHeight)}px`,
      zIndex: 20,
      pointerEvents: "none",
      transform: `rotate(${random(0, 360)}deg)`
    } as React.CSSProperties;
    
    return {
      id: Date.now() + random(0, 1000),
      size,
      color,
      style
    };
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (containerRef.current) {
        setSparkles([createSparkle()]);
        setTimeout(() => setSparkles([]), 1000);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="relative inline-block cursor-pointer" 
      onMouseEnter={() => {
        controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 0.3 }
        });
        // Add extra sparkles on hover
        setSparkles([createSparkle(), createSparkle(), createSparkle()]);
        setTimeout(() => setSparkles([]), 1000);
      }}
    >
      <motion.div animate={controls}>
        {children}
      </motion.div>
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          size={sparkle.size}
          color={sparkle.color}
          style={sparkle.style}
        />
      ))}
    </div>
  );
}