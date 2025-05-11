'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ThemeType, getThemeConfig } from '../utils/themes';
import { fetchStats, Stats } from '../services/api';
import confetti from 'canvas-confetti';

interface ChatMetric {
  date: string;
  conversations: number;
  messages: number;
}

interface DashboardProps {
  theme: ThemeType;
  onStartChat: () => void;
}

// Simulated data for the chart
const SAMPLE_METRICS: ChatMetric[] = Array.from({ length: 14 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 13 + i);
  return {
    date: date.toISOString().split('T')[0],
    conversations: Math.floor(Math.random() * 10) + 1,
    messages: Math.floor(Math.random() * 50) + 5,
  };
});

export default function AdvancedDashboard({ theme, onStartChat }: DashboardProps) {
  const themeConfig = getThemeConfig(theme);
  const [stats, setStats] = useState({
    total_conversations: 0,
    open_conversations: 0,
    closed_conversations: 0,
    total_messages: 0,
    response_time: '0',
  });
  const [metrics, setMetrics] = useState<ChatMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSpotlight, setShowSpotlight] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // Get mouse position for spotlight effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!spotlightRef.current || !showSpotlight) return;
    
    const rect = spotlightRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    spotlightRef.current.style.setProperty('--x', `${x}px`);
    spotlightRef.current.style.setProperty('--y', `${y}px`);
  };
  
  // Load stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data: Stats = await fetchStats();
        setStats({
          total_conversations: data.total_conversations,
          open_conversations: data.open_conversations,
          closed_conversations: data.closed_conversations,
          total_messages: Math.floor(Math.random() * 1000) + 100, // Simulated
          response_time: (Math.random() * 4 + 1).toFixed(1), // Simulated
        });
        
        // Use sample metrics for demo
        setMetrics(SAMPLE_METRICS);
      } catch (error) {
        console.error('Error loading stats:', error);
        setMetrics(SAMPLE_METRICS);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Animation sequence
  useEffect(() => {
    const sequence = async () => {
      await controls.start({
        y: 0,
        opacity: 1,
        transition: { duration: 0.7, ease: "easeOut" }
      });
      
      // Show spotlight effect after dashboard loads
      setTimeout(() => {
        setShowSpotlight(true);
      }, 1000);
    };
    
    sequence();
  }, [controls]);
  
  // Get max value for chart scaling
  const maxMessages = Math.max(...metrics.map(m => m.messages));
  
  // Trigger confetti on button click
  const handleStartChatWithConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    onStartChat();
  };
  
  return (
    <div 
      className={`w-full h-full ${themeConfig.container.bg} ${themeConfig.container.pattern} overflow-y-auto`}
      onMouseMove={handleMouseMove}
      ref={spotlightRef}
    >
      <div className={`
        ${showSpotlight ? 'spotlight' : ''}
        relative max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-12
      `}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
        >
          <div className="text-center mb-10">
            <h1 className={`text-4xl sm:text-5xl font-bold mb-4 tracking-tight ${themeConfig.card.text}`}>
              Welcome to{' '}
              <span className={`bg-gradient-to-r ${themeConfig.accent.gradient} bg-clip-text text-transparent ${themeConfig.accent.shadow}`}>
                RealMate
              </span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Advanced messaging platform with real-time webhook processing for enterprise communications
            </p>
          </div>
        </motion.div>
        
        {/* Dashboard Tabs */}
        <motion.div 
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`inline-flex rounded-lg p-1 ${themeConfig.card.border} ${themeConfig.card.bg}`}>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? `${themeConfig.button.primary.bg} ${themeConfig.button.primary.text} ${themeConfig.button.primary.shadow}`
                  : `${themeConfig.card.text} opacity-70 hover:opacity-100`
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? `${themeConfig.button.primary.bg} ${themeConfig.button.primary.text} ${themeConfig.button.primary.shadow}`
                  : `${themeConfig.card.text} opacity-70 hover:opacity-100`
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'system'
                  ? `${themeConfig.button.primary.bg} ${themeConfig.button.primary.text} ${themeConfig.button.primary.shadow}`
                  : `${themeConfig.card.text} opacity-70 hover:opacity-100`
              }`}
              onClick={() => setActiveTab('system')}
            >
              System
            </button>
          </div>
        </motion.div>
        
        {/* Main Dashboard Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard 
                  title="Active Conversations"
                  value={isLoading ? "..." : stats.open_conversations.toString()}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  }
                  theme={theme}
                  trend="+12%"
                  trendUp={true}
                />
                <StatsCard 
                  title="Total Messages"
                  value={isLoading ? "..." : stats.total_messages.toString()}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  }
                  theme={theme}
                  trend="+24%"
                  trendUp={true}
                />
                <StatsCard 
                  title="Avg. Response Time"
                  value={isLoading ? "..." : `${stats.response_time}m`}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  theme={theme}
                  trend="-8%"
                  trendUp={false}
                />
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="mb-8">
                {/* Messages chart */}
                <div className={`p-6 rounded-2xl ${themeConfig.card.bg} ${themeConfig.card.border} ${themeConfig.card.shadow} mb-6`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-lg font-semibold ${themeConfig.card.text}`}>Message Volume (Last 14 Days)</h3>
                    <div className={`text-xs px-2 py-1 rounded-full ${themeConfig.states.open.bg} ${themeConfig.states.open.text}`}>
                      +18% vs previous period
                    </div>
                  </div>
                  
                  <div className="h-64 flex items-end space-x-2">
                    {metrics.map((metric, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center justify-end h-[200px]">
                          <motion.div 
                            className={`w-full max-w-[20px] rounded-t-sm bg-gradient-to-t ${themeConfig.accent.gradient}`}
                            initial={{ height: 0 }}
                            animate={{ height: `${(metric.messages / maxMessages) * 100}%` }}
                            transition={{ delay: 0.1 * i, duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <div className="text-xs text-neutral-500 mt-2">
                          {new Date(metric.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Additional analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-2xl ${themeConfig.card.bg} ${themeConfig.card.border} ${themeConfig.card.shadow}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${themeConfig.card.text}`}>Conversation Sources</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-400">WhatsApp</span>
                          <span className={themeConfig.card.text}>68%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                          <motion.div 
                            className={`h-2 rounded-full bg-gradient-to-r ${themeConfig.accent.gradient}`} 
                            initial={{ width: 0 }}
                            animate={{ width: '68%' }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-400">Web Chat</span>
                          <span className={themeConfig.card.text}>24%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                          <motion.div 
                            className={`h-2 rounded-full bg-gradient-to-r ${themeConfig.accent.gradient}`} 
                            initial={{ width: 0 }}
                            animate={{ width: '24%' }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-400">API</span>
                          <span className={themeConfig.card.text}>8%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                          <motion.div 
                            className={`h-2 rounded-full bg-gradient-to-r ${themeConfig.accent.gradient}`} 
                            initial={{ width: 0 }}
                            animate={{ width: '8%' }}
                            transition={{ duration: 1, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-6 rounded-2xl ${themeConfig.card.bg} ${themeConfig.card.border} ${themeConfig.card.shadow}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${themeConfig.card.text}`}>Conversation Outcomes</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${theme === 'glassmorphism' ? 'bg-white/20' : 'bg-neutral-800/50'} text-center`}>
                        <div className={`text-2xl font-bold mb-1 ${themeConfig.special.highlight}`}>84%</div>
                        <div className="text-sm text-neutral-400">Resolution Rate</div>
                      </div>
                      <div className={`p-4 rounded-xl ${theme === 'glassmorphism' ? 'bg-white/20' : 'bg-neutral-800/50'} text-center`}>
                        <div className={`text-2xl font-bold mb-1 ${themeConfig.special.highlight}`}>4.7</div>
                        <div className="text-sm text-neutral-400">Satisfaction</div>
                      </div>
                      <div className={`p-4 rounded-xl ${theme === 'glassmorphism' ? 'bg-white/20' : 'bg-neutral-800/50'} text-center`}>
                        <div className={`text-2xl font-bold mb-1 ${themeConfig.special.highlight}`}>8m</div>
                        <div className="text-sm text-neutral-400">Avg. Duration</div>
                      </div>
                      <div className={`p-4 rounded-xl ${theme === 'glassmorphism' ? 'bg-white/20' : 'bg-neutral-800/50'} text-center`}>
                        <div className={`text-2xl font-bold mb-1 ${themeConfig.special.highlight}`}>76%</div>
                        <div className="text-sm text-neutral-400">First Contact</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'system' && (
              <div className="mb-8">
                <div className={`p-6 rounded-2xl ${themeConfig.card.bg} ${themeConfig.card.border} ${themeConfig.card.shadow} mb-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${themeConfig.card.text}`}>System Status</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full bg-green-500 mr-2 ${theme === 'cyberpunk' ? 'shadow-[0_0_8px_rgba(34,197,94,0.7)]' : ''}`}></div>
                        <span className={themeConfig.card.text}>API Server</span>
                      </div>
                      <span className="text-green-500 text-sm">Operational</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full bg-green-500 mr-2 ${theme === 'cyberpunk' ? 'shadow-[0_0_8px_rgba(34,197,94,0.7)]' : ''}`}></div>
                        <span className={themeConfig.card.text}>Webhook Processor</span>
                      </div>
                      <span className="text-green-500 text-sm">Operational</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full bg-green-500 mr-2 ${theme === 'cyberpunk' ? 'shadow-[0_0_8px_rgba(34,197,94,0.7)]' : ''}`}></div>
                        <span className={themeConfig.card.text}>Database</span>
                      </div>
                      <span className="text-green-500 text-sm">Operational</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse ${theme === 'cyberpunk' ? 'shadow-[0_0_8px_rgba(234,179,8,0.7)]' : ''}`}></div>
                        <span className={themeConfig.card.text}>WhatsApp Integration</span>
                      </div>
                      <span className="text-yellow-500 text-sm">Degraded Performance</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-neutral-800">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 text-sm">Last updated</span>
                      <span className="text-neutral-400 text-sm">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`p-6 rounded-2xl ${themeConfig.card.bg} ${themeConfig.card.border} ${themeConfig.card.shadow}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${themeConfig.card.text}`}>Webhook Events (Last 24h)</h3>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`p-3 rounded-lg ${theme === 'glassmorphism' ? 'bg-white/20' : 'bg-neutral-800/50'}`}>
                        <div className="flex justify-between mb-2">
                          <span className={`text-sm font-medium ${themeConfig.special.highlight}`}>
                            {['NEW_CONVERSATION', 'NEW_MESSAGE', 'NEW_MESSAGE', 'CLOSE_CONVERSATION', 'NEW_CONVERSATION'][i]}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {new Date(Date.now() - i * 3600000).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-xs truncate text-neutral-400">
                          {`{"id":"${crypto.randomUUID().substring(0, 8)}","timestamp":"${new Date().toISOString()}","type":"webhook"}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Interactive demo section */}
        <motion.div
          className={`p-6 rounded-2xl ${themeConfig.card.bg} ${themeConfig.card.border} ${themeConfig.card.shadow} mb-8`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${themeConfig.card.text}`}>Interactive Demo Experience</h3>
            <div className={`${themeConfig.states.open.bg} ${themeConfig.states.open.text} px-3 py-1 rounded-full text-xs font-medium ${themeConfig.states.open.glow}`}>
              Live
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-xl ${theme === 'glassmorphism' ? 'bg-white/20' : 'bg-neutral-800/30'}`}>
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${themeConfig.states.open.bg} mr-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <div>
                  <h4 className={`font-medium ${themeConfig.card.text}`}>Webhook Processing</h4>
                  <p className="text-neutral-400 text-xs">Receive and process events</p>
                </div>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Our system instantly processes incoming webhook events from WhatsApp and other channels
              </p>
              <div className={`text-xs ${themeConfig.special.highlight} font-medium`}>Latency: &lt; 100ms</div>
            </div>
            
            <div className={`p-4 rounded-xl ${theme === 'glassmorphism' ? 'bg-white/20' : 'bg-neutral-800/30'}`}>
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${themeConfig.states.open.bg} mr-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className={`font-medium ${themeConfig.card.text}`}>Two-way Sync</h4>
                  <p className="text-neutral-400 text-xs">Bidirectional integration</p>
                </div>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Messages sent from this interface are instantly delivered to WhatsApp and vice versa
              </p>
              <div className={`text-xs ${themeConfig.special.highlight} font-medium`}>Message Delivery: 99.9%</div>
            </div>
            
            <div className={`p-4 rounded-xl ${theme === 'glassmorphism' ? 'bg-white/20' : 'bg-neutral-800/30'}`}>
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${themeConfig.states.open.bg} mr-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className={`font-medium ${themeConfig.card.text}`}>Real-time Analytics</h4>
                  <p className="text-neutral-400 text-xs">Track performance metrics</p>
                </div>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Get insights into conversation metrics, response times, and user satisfaction
              </p>
              <div className={`text-xs ${themeConfig.special.highlight} font-medium`}>Refresh Rate: 30 seconds</div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleStartChatWithConfetti}
              className={`w-full py-3 px-6 rounded-xl ${themeConfig.button.primary.bg} ${themeConfig.button.primary.text} 
                       ${themeConfig.button.primary.hover} ${themeConfig.button.primary.shadow} font-medium
                       transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center`}
            >
              <span className="mr-2">⚡</span>
              Start a New Conversation
            </button>
          </div>
        </motion.div>
        
        {/* Tech stack section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <TechBadge icon="⚛️" name="React" theme={theme} />
          <TechBadge icon="🐍" name="Django" theme={theme} />
          <TechBadge icon="📱" name="WhatsApp" theme={theme} />
          <TechBadge icon="🔄" name="Webhooks" theme={theme} />
        </motion.div>
      </div>
      
      {/* CSS for spotlight effect */}
      <style jsx global>{`
        .spotlight {
          position: relative;
        }
        
        .spotlight::before {
          content: '';
          position: absolute;
          inset: -100px;
          background: radial-gradient(
            600px circle at var(--x) var(--y),
            rgba(255, 255, 255, 0.06),
            transparent 40%
          );
          z-index: 0;
          pointer-events: none;
        }
        
        /* For dark themes */
        .spotlight.dark::before {
          background: radial-gradient(
            600px circle at var(--x) var(--y),
            ${theme === 'cyberpunk' ? 'rgba(6, 182, 212, 0.15)' : 
              theme === 'luxury' ? 'rgba(245, 158, 11, 0.1)' : 
              theme === 'futuristic' ? 'rgba(99, 102, 241, 0.15)' : 
              theme === 'neon' ? 'rgba(163, 230, 53, 0.15)' : 
              'rgba(255, 255, 255, 0.1)'},
            transparent 40%
          );
        }
      `}</style>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  theme: ThemeType;
  trend: string;
  trendUp: boolean;
}

function StatsCard({ title, value, icon, theme, trend, trendUp }: StatsCardProps) {
  const themeConfig = getThemeConfig(theme);
  
  return (
    <motion.div 
      className={`p-6 rounded-xl ${themeConfig.card.bg} ${themeConfig.card.border} ${themeConfig.card.shadow}`}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${themeConfig.states.open.bg}`}>
          {icon}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs ${
          trendUp 
            ? 'bg-green-900/30 text-green-400' 
            : 'bg-red-900/30 text-red-400'
        }`}>
          <span>{trend}</span>
        </div>
      </div>
      
      <h3 className="text-sm text-neutral-400 mb-1">{title}</h3>
      <div className={`text-2xl font-bold ${themeConfig.card.text}`}>
        {value === "..." ? (
          <div className="animate-pulse bg-neutral-800 h-8 w-16 rounded"></div>
        ) : (
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {value}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

interface TechBadgeProps {
  icon: string;
  name: string;
  theme: ThemeType;
}

function TechBadge({ icon, name, theme }: TechBadgeProps) {
  const themeConfig = getThemeConfig(theme);
  
  return (
    <motion.div 
      className={`p-4 rounded-xl ${themeConfig.card.bg} ${themeConfig.card.border} text-center ${themeConfig.card.shadow}`}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-sm font-medium ${themeConfig.card.text}`}>{name}</div>
    </motion.div>
  );
}