'use client';

import React, { useEffect, useRef } from 'react';
import { ThemeType } from '../utils/themes';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

interface ParticleBackgroundProps {
  theme: ThemeType;
  density?: number;
}

export default function ParticleBackground({ theme, density = 20 }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Create particles based on theme
    const createParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 25000) * density;
      
      let colors: string[] = [];
      
      switch (theme) {
        case 'cyberpunk':
          colors = ['#06b6d4', '#c026d3', '#3b82f6', '#8b5cf6'];
          break;
        case 'luxury':
          colors = ['#f59e0b', '#92400e', '#d97706', '#b45309'];
          break;
        case 'futuristic':
          colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#2563eb'];
          break;
        case 'glassmorphism':
          colors = ['#7c3aed', '#8b5cf6', '#6366f1', '#4f46e5'];
          break;
        case 'neon':
          colors = ['#84cc16', '#a3e635', '#65a30d', '#4d7c0f'];
          break;
        default:
          colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#2563eb'];
      }
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.5 + 0.1
        });
      }
    };
    
    // Draw particles
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Connect particles that are close
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = particle.color + Math.floor((0.1 - distance / 1000) * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 0.2;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
      
      animationFrameId = requestAnimationFrame(drawParticles);
    };
    
    createParticles();
    drawParticles();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, density]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}