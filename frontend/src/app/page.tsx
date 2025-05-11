'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useScroll, useInView } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import ConversationList from '../components/ConversationList';
import ConversationView from '../components/ConversationView';
import NewConversationModal from '../components/NewConversationModal';
import { fetchConversations, fetchConversation, sendWebhook, fetchStats } from '../services/api';

// Tipos
interface Message {
  id: string;
  direction: 'SENT' | 'RECEIVED';
  content: string;
  created_at: string;
  conversation_id: string;
}

interface Conversation {
  id: string;
  state: 'OPEN' | 'CLOSED';
  messages: Message[];
  created_at?: string;
}

type View = 'dashboard' | 'chat' | 'analytics';

// Canvas de fundo com efeito interativo avançado
function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const particles: Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    alpha: number;
    decreasing: boolean;
    connection: number;
  }> = [];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configurar tamanho do canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Evento de mouse
    const updateMousePosition = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    window.addEventListener('mousemove', updateMousePosition);
    
    // Criar partículas
    const createParticles = () => {
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.1,
          speedX: Math.random() * 0.3 - 0.15,
          speedY: Math.random() * 0.3 - 0.15,
          color: `hsla(${Math.random() * 40 + 210}, 80%, 60%, 0.5)`,
          alpha: Math.random() * 0.5 + 0.1,
          decreasing: Math.random() > 0.5,
          connection: Math.random() * 80 + 40
        });
      }
    };
    
    createParticles();
    
    // Animar partículas
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Gradiente de fundo
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.02)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.01)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Desenhar partículas e conectar
      ctx.globalCompositeOperation = 'lighter';
      
      // Calcular influência do mouse
      const radius = 150;
      
      // Desenhar e atualizar partículas
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        
        // Verificar distância ao mouse
        const dx = p.x - mousePosition.current.x;
        const dy = p.y - mousePosition.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Influência do mouse
        if (distance < radius) {
          const force = (1 - distance / radius) * 0.05;
          p.x += dx * force;
          p.y += dy * force;
        }
        
        // Atualizar posição
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Manter partículas na tela
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        // Pulsar alpha
        if (p.decreasing) {
          p.alpha -= 0.003;
          if (p.alpha <= 0.1) {
            p.decreasing = false;
            p.alpha = 0.1;
          }
        } else {
          p.alpha += 0.003;
          if (p.alpha >= 0.5) {
            p.decreasing = true;
            p.alpha = 0.5;
          }
        }
        
        // Desenhar partícula
        ctx.fillStyle = p.color.replace('0.5', String(p.alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Conectar com outras partículas
        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < p.connection) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / p.connection)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}

// Efeito de linhas de grade animadas
function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 grid-animation opacity-5"></div>
    </div>
  );
}

// Componente de contador animado com efeitos visuais
function AnimatedCounter({ 
  value, 
  duration = 1.5,
  formatter = (val: number) => val.toLocaleString()
}: { 
  value: number, 
  duration?: number, 
  formatter?: (val: number) => string 
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(counterRef, { once: false });
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number | null = null;
    let animationFrame: number;
    
    const updateValue = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easedProgress = progress === 1 
        ? 1 
        : 1 - Math.pow(1 - progress, 4); // Easing cuártico
      
      if (progress < 1) {
        setDisplayValue(Math.floor(easedProgress * value));
        animationFrame = requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(value);
      }
    };
    
    animationFrame = requestAnimationFrame(updateValue);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, isInView]);
  
  return (
    <div ref={counterRef} className="relative">
      <span className="relative z-10">{formatter(displayValue)}</span>
      {isInView && (
        <div className="counter-highlight absolute inset-0 animate-pulse-slow opacity-50"></div>
      )}
    </div>
  );
}

// Card de estatísticas interativo e futurista
function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  percentage, 
  trend = 0,
  isPositive = true,
  valueFormatter = (val: number) => val.toLocaleString()
}: { 
  title: string, 
  value: number,
  icon: React.ReactNode,
  color: string,
  percentage: number,
  trend?: number,
  isPositive?: boolean,
  valueFormatter?: (val: number) => string
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false });
  
  const springConfig = { stiffness: 200, damping: 30 };
  const springY = useSpring(20, springConfig);
  const opacity = useSpring(0, springConfig);
  
  useEffect(() => {
    if (isInView) {
      springY.set(0);
      opacity.set(1);
    } else {
      springY.set(20);
      opacity.set(0);
    }
  }, [isInView, springY, opacity]);

  // Movimento 3D com mouse
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isPressed) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 3;
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 3;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, [isPressed]);
  
  const resetCardTransform = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <motion.div 
      ref={cardRef}
      className="cyber-card relative backdrop-blur-xl rounded-2xl border p-6 shadow-xl overflow-hidden transition-all duration-300"
      style={{ 
        y: springY,
        opacity,
        borderColor: `${color}40`,
        boxShadow: isHovered 
          ? `0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2), 0 0 15px 0 ${color}30` 
          : `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        resetCardTransform();
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/50 to-transparent"></div>
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
      
      <motion.div 
        className="absolute -right-10 -top-10 w-32 h-32 rounded-full"
        style={{ 
          background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
          opacity: isInView ? 0.4 : 0
        }}
        animate={{ 
          scale: isHovered ? 1.3 : 1,
        }}
        transition={{ duration: 0.6 }}
      />
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <div 
          className={`p-3 rounded-xl transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
          style={{ background: `${color}20` }}
        >
          <div className="text-xl" style={{ color }}>
            {icon}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col relative z-10">
        <div className="text-3xl xl:text-4xl font-bold mb-1 futuristic-text">
          <AnimatedCounter value={value} formatter={valueFormatter} />
        </div>
        
        {trend !== 0 && (
          <div className="flex items-center mt-2 mb-3">
            <div className={`text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-md
              ${isPositive ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/30 text-green-400 border border-green-500/20' : 
                           'bg-gradient-to-r from-red-900/20 to-rose-900/30 text-red-400 border border-red-500/20'}`}>
              <span className="text-base">{isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
            <span className="text-slate-400 text-xs ml-2">vs. previous</span>
          </div>
        )}
        
        <div className="mt-2 mb-1">
          <div className="h-1.5 w-full bg-slate-700/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full relative overflow-hidden"
              style={{ 
                background: `linear-gradient(90deg, ${color}60, ${color})`,
                width: isInView ? `${percentage}%` : '0%'
              }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            >
              <div className="absolute top-0 left-0 h-full w-20 bg-white/20 animate-shimmer-slow"></div>
            </motion.div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500">{0}%</span>
            <span className="text-xs text-slate-500">{100}%</span>
          </div>
        </div>
      </div>
      
      {/* Tech lines animation */}
      <div className="tech-lines"></div>
      
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-blue-500/5 to-transparent"></div>
        </div>
      )}
    </motion.div>
  );
}

// Componente de barra de navegação futurista
function NavigationBar({ activeView, setView, onNewChat }: { 
  activeView: View, 
  setView: (view: View) => void,
  onNewChat: () => void
}) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    )},
    { id: 'chat' as const, label: 'Conversas', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )},
   
  ];

  return (
    <header className="relative z-10">
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 rounded-2xl border border-slate-700/30 bg-slate-800/20 backdrop-blur-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <div className="relative">
            <div className="flex items-center">
              <div className="relative h-12 w-12 mr-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 overflow-hidden group">
                <div className="text-white text-2xl font-bold relative z-10">R</div>
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-white/20"></div>
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                
                {/* Particle system inside logo */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="logo-particles"></div>
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">RealMate</span>
                </div>
                <div className="text-xs text-blue-400 tracking-widest font-medium">Desafio Front</div>
              </div>
            </div>
            
            <motion.div 
              className="absolute -bottom-1 left-12 right-0 h-[2px] rounded-full"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                background: "linear-gradient(to right, rgb(59, 130, 246), rgba(99, 102, 241, 0.6), transparent)",
                transformOrigin: "left"
              }}
            />
          </div>
        </div>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex">
          <nav className="flex p-1.5 bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-lg shadow-slate-950/20">
            <div className="flex space-x-2 relative">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                    ${activeView === item.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <span className="relative z-10">{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                  {activeView === item.id && (
                    <motion.div 
                      className="absolute inset-0 rounded-lg cyberpunk-gradient -z-0"
                      layoutId="navBackground"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 rounded-lg"></div>
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20"></div>
                      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-black/20"></div>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="h-6 mx-2 w-px bg-slate-700/50 self-center"></div>
            
            <button
              onClick={onNewChat}
              className="cyberpunk-button flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white rounded-lg transition-all relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-700 group-hover:to-indigo-700"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute inset-x-0 top-0 h-[1px] bg-white/20"></span>
              <span className="absolute inset-x-0 bottom-0 h-[1px] bg-black/20"></span>
              
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="relative z-10">Nova Conversa</span>
            </button>
          </nav>
        </div>
      </motion.div>
    </header>
  );
}

// Visualização avançada do dashboard
function DashboardView({ conversations, onSelect }: { 
  conversations: Conversation[]; 
  onSelect: (id: string) => void;
}) {
  const [stats, setStats] = useState({
    total_conversations: 0,
    open_conversations: 0,
    closed_conversations: 0,
    total_messages: 0
  });
  
  // Refs para animações
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  
  useEffect(() => {
    // Calcular estatísticas reais baseadas nos dados das conversas
    const open = conversations.filter(c => c.state === 'OPEN').length;
    const closed = conversations.filter(c => c.state === 'CLOSED').length;
    const totalMessages = conversations.reduce((count, conv) => count + (conv.messages?.length || 0), 0);
    
    setStats({
      total_conversations: conversations.length,
      open_conversations: open,
      closed_conversations: closed,
      total_messages: totalMessages
    });
  }, [conversations]);
  
  // Percentagens
  const openPercentage = stats.total_conversations > 0 ? 
    (stats.open_conversations / stats.total_conversations) * 100 : 0;
  const closedPercentage = stats.total_conversations > 0 ? 
    (stats.closed_conversations / stats.total_conversations) * 100 : 0;
  
  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Estatísticas Principais */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <StatCard 
          title="Total de Conversas"
          value={stats.total_conversations} 
          color="#3b82f6" 
          percentage={100}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          }
        />
        
        <StatCard 
          title="Conversas Abertas"
          value={stats.open_conversations} 
          color="#10b981" 
          percentage={openPercentage}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
        />
        
        <StatCard 
          title="Conversas Fechadas"
          value={stats.closed_conversations} 
          color="#8b5cf6" 
          percentage={closedPercentage}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        
        <StatCard 
          title="Total de Mensagens"
          value={stats.total_messages} 
          color="#f59e0b" 
          percentage={100}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          }
        />
      </motion.div>
      
      {/* Visual de Distribuição de Status */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Distribuição de Status */}
        <div className="cyber-card relative rounded-2xl border border-blue-500/30 p-6 shadow-xl backdrop-blur-xl overflow-hidden">
          <h3 className="text-lg font-medium text-white mb-4">Distribuição de Status</h3>
          
          <div className="relative h-48">
            {/* Status chart visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="200" height="200" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="10" />
                
                {/* Open conversations */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="10"
                  strokeDasharray={`${openPercentage * 2.51} ${251 - openPercentage * 2.51}`}
                  strokeDashoffset="0"
                  transform="rotate(-90, 50, 50)"
                  className="transition-all duration-1000"
                />
                
                {/* Closed conversations */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="30" 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="10"
                  strokeDasharray={`${closedPercentage * 1.88} ${188 - closedPercentage * 1.88}`}
                  strokeDashoffset="0"
                  transform="rotate(-90, 50, 50)"
                  className="transition-all duration-1000"
                />
                
                {/* Inner circle */}
                <circle cx="50" cy="50" r="20" fill="#1e293b" stroke="#1e293b" strokeWidth="2" />
                
                {/* Text */}
                <text x="50" y="45" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" className="futuristic-text">{stats.total_conversations}</text>
                <text x="50" y="58" textAnchor="middle" fill="#94a3b8" fontSize="6">conversas</text>
              </svg>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-0 inset-x-0">
              <div className="flex justify-center space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-xs text-slate-300">Abertas ({stats.open_conversations})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-xs text-slate-300">Fechadas ({stats.closed_conversations})</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="cyber-lines-effect"></div>
        </div>
        
        {/* Conversas Recentes */}
        <motion.div 
          className="cyber-card relative rounded-2xl border border-purple-500/30 shadow-xl md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white inline-flex items-center">
                <span className="mr-2">Atividade Recente</span>
                <div className="flex h-2 w-2">
                  <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative rounded-full h-2 w-2 bg-green-400"></span>
                </div>
              </h3>
              <button
                onClick={() => onSelect('new')}
                className="p-2 rounded-lg bg-purple-900/20 border border-purple-800/30 text-purple-400 hover:bg-purple-900/30 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-slate-400 text-sm mt-1">Últimas conversas e atualizações</p>
          </div>
          
          <div className="h-[420px] overflow-auto custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-800/70 flex items-center justify-center mb-4 border border-slate-700/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-slate-300 mb-2 font-medium">Nenhuma conversa ainda</p>
                <p className="text-slate-400 mb-6 text-sm">Inicie sua primeira conversa para começar</p>
                <button 
                  onClick={() => onSelect('new')} 
                  className="cyberpunk-button px-4 py-2.5 relative text-white text-sm font-medium rounded-lg overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 group-hover:from-purple-700 group-hover:to-indigo-700"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative z-10 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Iniciar uma conversa
                  </span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/70">
                {conversations.slice(0, 8).map((conv, idx) => {
                  const messagesCount = conv.messages?.length || 0;
                  // Get formatted date
                  const date = conv.created_at ? new Date(conv.created_at) : new Date();
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - date.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
                  
                  let timeAgo;
                  if (diffDays > 1) {
                    timeAgo = `${diffDays} dias atrás`;
                  } else if (diffHours > 1) {
                    timeAgo = `${diffHours} horas atrás`;
                  } else {
                    timeAgo = `${diffMinutes} minutos atrás`;
                  }
                  
                  return (
                    <motion.div 
                      key={conv.id}
                      className="p-4 hover:bg-slate-800/50 cursor-pointer transition-all relative group overflow-hidden"
                      onClick={() => onSelect(conv.id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx, duration: 0.3 }}
                      whileHover={{ x: 2 }}
                    >
                      {/* Hover effect */}
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500/0 via-purple-500/70 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2.5 ${
                            conv.state === 'OPEN' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
                          }`}></div>
                          <span className="font-medium text-slate-200">
                            Conversa <span className="text-blue-400 font-semibold">#{conv.id.substring(0, 8)}</span>
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center space-x-1 ${
                          conv.state === 'OPEN' 
                            ? 'bg-green-900/20 text-green-400 border border-green-600/20'
                            : 'bg-slate-800/80 text-slate-400 border border-slate-600/20'
                        }`}>
                          {conv.state === 'OPEN' && (
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                          )}
                          <span>{conv.state === 'OPEN' ? 'ABERTA' : 'FECHADA'}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <span>{messagesCount} mensage{messagesCount !== 1 ? 'ns' : 'm'}</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{timeAgo}</span>
                        </div>
                      </div>
                      
                      {conv.messages && conv.messages.length > 0 && (
                        <div className="mt-3 text-sm text-slate-300 line-clamp-1 italic group-hover:text-white transition-colors">
                          "{conv.messages[conv.messages.length-1].content}"
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
          
          {conversations.length > 8 && (
            <div className="p-4 border-t border-slate-700/50 text-center">
              <button
                onClick={() => onSelect('viewAll')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center justify-center mx-auto group"
              >
                <span>Ver todas as conversas</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Componente principal com as melhorias visuais e de scroll
export default function Home() {
  const [view, setView] = useState<View>('dashboard');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  // Load conversations on component mount
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      try {
        const data = await fetchConversations();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversations();
  }, []);
  
  // Handle conversation selection
  const handleConversationSelect = async (id: string) => {
    if (id === 'new') {
      setShowNew(true);
      return;
    }
    
    setLoadingConversation(true);
    try {
      const conversation = await fetchConversation(id) as Conversation;
      setActiveConversation(conversation);
      setView('chat');
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoadingConversation(false);
    }
  };
  
  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    if (!activeConversation || activeConversation.state === 'CLOSED' || !content.trim()) return;

    const messageId = crypto.randomUUID();

    // Optimistic update
    setActiveConversation((prev) => (prev ? {
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: messageId,
          direction: 'SENT',
          content,
          created_at: new Date().toISOString(),
          conversation_id: activeConversation.id,
        },
      ],
    } : null));

    try {
      // Use the correct webhook parameters structure
      await sendWebhook('NEW_MESSAGE', {
        id: messageId,
        conversation_id: activeConversation.id,
        direction: 'SENT',
        content,
      });

      // Refresh conversation after a delay
      setTimeout(async () => {
        try {
          const updatedConversation = await fetchConversation(activeConversation.id);
          setActiveConversation(updatedConversation as Conversation);
        } catch (error) {
          console.error('Error refreshing conversation:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Restore the conversation state on error
      try {
        const restoredConversation = await fetchConversation(activeConversation.id);
        setActiveConversation(restoredConversation as Conversation);
      } catch (fetchError) {
        console.error('Error restoring conversation state:', fetchError);
      }
    }
  };
  
  // Handle closing conversation
  const handleCloseConversation = async (id: string) => {
    try {
      console.log('Fechando conversa:', id);
      
      // Enviar webhook no formato correto
      await sendWebhook('CLOSE_CONVERSATION', {
        id: id
      });
      
      // Atualizar estado local após fechar
      toast.success('Conversa fechada');
      
      // Atualizar as listas
      const updatedConversation = await fetchConversation(id);
      setActiveConversation(updatedConversation as Conversation);
      
      // Atualizar lista de conversas
      const updatedConversations = await fetchConversations();
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Erro ao fechar conversa:', error);
      toast.error('Falha ao fechar conversa');
    }
  };
  
  // Handle creating new conversation
  const handleCreateConversation = async (customerName: string, customerPhone: string) => {
    try {
      // Gerar UUID válido usando crypto.randomUUID()
      const newId = crypto.randomUUID();
      
      console.log('Criando conversa com ID:', newId);
      
      // Enviar webhook com formato correto
      await sendWebhook('NEW_CONVERSATION', {
        id: newId
      });
      
      // Atualizar UI após criação
      const newConversation = await fetchConversation(newId);
      
      if (newConversation) {
        setConversations(prev => [newConversation as Conversation, ...prev]);
        setActiveConversation(newConversation as Conversation);
        setShowNew(false);
        setView('chat');
        
        toast.success(`Conversa criada com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast.error('Falha ao criar conversa');
    }
  };

const handleSimulateResponse = async (conversationId: string) => {
  try {
    console.log('Simulando resposta para conversa:', conversationId);
    
    // Gerar ID único para mensagem simulada
    const messageId = crypto.randomUUID();
    
    // Verificar se há mensagem manual temporária
    let messageContent = "";
    
    if (window._tempSimulatedMessage) {
      // Usar a mensagem manual fornecida
      messageContent = window._tempSimulatedMessage;
      // Limpar após uso
      window._tempSimulatedMessage = undefined;
    } else {
      // Preparar mensagens simuladas realistas para resposta automática
      const possibleResponses = [
        "Olá, obrigado pelo contato! Como posso ajudar?",
        "Entendi sua solicitação. Pode me dar mais detalhes?",
        "Estou avaliando sua proposta, aguarde um momento.",
        "Perfeito! Vamos prosseguir com o atendimento.",
        "Preciso de mais informações sobre isso. Você poderia detalhar?",
        "Agradeço o retorno. Estou à disposição para ajudar."
      ];
      
      // Escolher mensagem aleatória para resposta automática
      messageContent = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
    }
    
    // Enviar webhook com formato correto
    await sendWebhook('NEW_MESSAGE', {
      id: messageId,
      direction: 'RECEIVED',
      content: messageContent,
      conversation_id: conversationId
    });
    
    // Atualizar a conversa após enviar
    setTimeout(async () => {
      if (activeConversation && activeConversation.id === conversationId) {
        try {
          const updatedConversation = await fetchConversation(conversationId);
          setActiveConversation(updatedConversation as Conversation);
        } catch (error) {
          console.error('Erro ao atualizar conversa após simulação:', error);
        }
      }
    }, 500);
  } catch (error) {
    console.error('Erro ao simular resposta:', error);
    toast.error('Falha ao simular resposta');
  }
};
  return (
    <main className="min-h-screen bg-[#0f172a] text-white scrollbar-thin">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <BackgroundEffect />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 opacity-95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="absolute top-10 left-10 w-[50vw] h-[50vw] bg-blue-600/5 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-10 right-10 w-[40vw] h-[40vw] bg-indigo-600/5 rounded-full filter blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-fixed opacity-[0.02]"></div>
        <GridLines />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        <NavigationBar 
          activeView={view} 
          setView={setView} 
          onNewChat={() => setShowNew(true)} 
        />
        
        <div className="pb-24">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardView 
                  conversations={conversations}
                  onSelect={handleConversationSelect}
                />
              </motion.div>
            )}

            {/* Chat View */}
            {view === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-[calc(100vh-160px)] min-h-[500px]"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
                  <div className="md:col-span-4 xl:col-span-3 cyber-card rounded-2xl overflow-hidden shadow-xl h-[500px] md:h-full">
                    <ConversationList
                      conversations={conversations}
                      activeConversationId={activeConversation?.id}
                      onSelect={handleConversationSelect}
                      onNewConversation={() => setShowNew(true)}
                      isLoading={isLoading}
                      theme="dark"
                    />
                  </div>
                  
                  <div className="md:col-span-8 xl:col-span-9 cyber-card rounded-2xl overflow-hidden shadow-xl h-[500px] md:h-full">
                    <ConversationView
                      conversation={activeConversation}
                      isLoading={loadingConversation}
                      onSendMessage={handleSendMessage}
                      onCloseConversation={() => {
                        if (activeConversation) {
                          handleCloseConversation(activeConversation.id);
                        }
                      }}
                      onRefreshConversation={async () => {
                        if (activeConversation) {
                          try {
                            const updatedConversation = await fetchConversation(activeConversation.id);
                            setActiveConversation(updatedConversation as Conversation);
                          } catch (error) {
                            console.error('Error refreshing conversation:', error);
                            toast.error('Failed to refresh conversation');
                          }
                        }
                      }}
                      onSimulateResponse={() => {
                        if (activeConversation) {
                          handleSimulateResponse(activeConversation.id);
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Analytics View */}
            {view === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="cyber-card rounded-2xl overflow-hidden p-6 shadow-xl"
              >
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#e2e8f0',
            borderRadius: '0.75rem',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          }
        }}
      />
      
      {/* Mobile Nav Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 md:hidden z-20">
        <div className="flex space-x-2 bg-slate-800/90 backdrop-blur-xl rounded-full p-1.5 border border-slate-700/50 shadow-2xl shadow-black/30">
          {['dashboard', 'chat', ].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as View)}
              className={`p-3 rounded-full transition-all ${
                view === v
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-label={v}
            >
              {v === 'dashboard' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
              )}
              {v === 'chat' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              )}
              {v === 'analytics' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              )}
            </button>
          ))}
          <button
            onClick={() => setShowNew(true)}
            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full transition-all shadow-lg shadow-blue-900/30"
            aria-label="New Chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* New conversation modal */}
      <AnimatePresence>
        {showNew && (
          <NewConversationModal
            onClose={() => setShowNew(false)}
            onCreateConversation={handleCreateConversation}
            theme="dark"
          />
        )}
      </AnimatePresence>
      
      {/* Global Styles */}
      <style jsx global>{`
        html, body {
          scroll-behavior: smooth;
          height: 100%;
          overflow-y: auto;
        }
        
        body::-webkit-scrollbar {
          width: 8px;
        }
        
        body::-webkit-scrollbar-track {
          background: transparent;
        }
        
        body::-webkit-scrollbar-thumb {
          background-color: rgba(100, 116, 139, 0.3);
          border-radius: 20px;
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.3) transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(100, 116, 139, 0.3);
          border-radius: 20px;
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(100, 116, 139, 0.3);
          border-radius: 20px;
        }
        
        .cyber-card {
          background: linear-gradient(to bottom right, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(71, 85, 105, 0.3);
          box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        
        .cyberpunk-gradient {
          position: relative;
          overflow: hidden;
          background: linear-gradient(to right, #3b82f6, #6366f1);
        }
        
        .cyber-lines-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right,
            transparent 0%,
            rgba(59, 130, 246, 0.3) 15%,
            rgba(59, 130, 246, 0.6) 50%,
            rgba(59, 130, 246, 0.3) 85%,
            transparent 100%
          );
        }
        
        .tech-grid {
          position: absolute;
          inset: 0;
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
          mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 40%, transparent 75%);
          pointer-events: none;
          z-index: -1;
        }
        
        .grid-animation {
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, rgba(100, 116, 139, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100, 116, 139, 0.1) 1px, transparent 1px);
          background-position: 0 0;
          animation: gridMove 20s linear infinite;
        }
        
        @keyframes gridMove {
          from { background-position: 0 0; }
          to { background-position: 50px 50px; }
        }
        
        .futuristic-text {
          font-family: 'Inter', 'Segoe UI', -apple-system, sans-serif;
          letter-spacing: 0.05em;
          text-shadow: 0 0 5px rgba(79, 209, 197, 0.5);
        }
        
        .animate-shimmer-slow {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
        }
        
        .animate-ping-slow {
          animation: ping 2s ease-in-out infinite;
        }
        
        .animate-scanner {
          width: 30%;
          animation: scanner 2s infinite linear;
        }
        
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        
        @keyframes ping {
          0% { transform: scale(0.7); opacity: 1; }
          70% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(0.7); opacity: 1; }
        }
        
        @keyframes scanner {
          from { transform: translateX(-100%); }
          to { transform: translateX(400%); }
        }
        
        .cyberpunk-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          transform-style: preserve-3d;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06),
                      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }
        
        .cyberpunk-button:active {
          transform: scale(0.98);
        }
        
        .cyberpunk-button:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          z-index: 10;
          animation: shimmerButton 3s infinite;
        }
        
        @keyframes shimmerButton {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .logo-particles {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.2) 1px,
            transparent 1px
          );
          background-size: 4px 4px;
          animation: particleDrift 10s linear infinite;
        }
        
        @keyframes particleDrift {
          0% { background-position: 0 0; }
          100% { background-position: 8px 8px; }
        }
      `}</style>
    </main>
  );
}