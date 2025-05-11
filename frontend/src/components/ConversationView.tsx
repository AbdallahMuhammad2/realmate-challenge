import { useState, useEffect, useRef } from 'react';

// Extend the Window interface to include _tempSimulatedMessage
declare global {
  interface Window {
    _tempSimulatedMessage?: string;
  }
}
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

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
}

interface ConversationViewProps {
  conversation: Conversation | null;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onCloseConversation: () => void;
  onRefreshConversation: () => void;
  onSimulateResponse?: () => void; // Adicionar esta propriedade
}

export default function ConversationView({
  conversation,
  isLoading,
  onSendMessage,
  onCloseConversation,
  onRefreshConversation,
  onSimulateResponse,
}: ConversationViewProps) {
  const [message, setMessage] = useState('');
  const [scrolledUp, setScrolledUp] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Auto-rolagem para o final quando as mensagens mudam
  useEffect(() => {
    if (messageContainerRef.current && conversation?.messages?.length && !scrolledUp) {
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [conversation?.messages, scrolledUp]);

  // Focar input quando a conversa muda
  useEffect(() => {
    if (inputRef.current && !isLoading && conversation?.state === 'OPEN') {
      inputRef.current.focus();
    }
  }, [conversation, isLoading]);

  // Lidar com eventos de rolagem
  useEffect(() => {
    const messagesContainer = messageContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

      setScrolledUp(!isAtBottom);
      setShowScrollButton(!isAtBottom && (conversation?.messages?.length ?? 0) > 5);
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [conversation?.messages]);

  // Enviar mensagem
  const handleSend = () => {
    if (message.trim() && conversation?.state === 'OPEN') {
      onSendMessage(message);
      setMessage('');
      setScrolledUp(false);
    }
  };

  // Função para lidar com resposta manual
  const handleManualResponse = (message: string) => {
    if (!conversation || !onSimulateResponse || !message.trim()) return;

    try {
      // Criar um objeto global temporário para passar a mensagem
      // Esta é uma solução simples para o escopo deste projeto
      window._tempSimulatedMessage = message;

      // Chamar a função de simulação normal
      onSimulateResponse();

      // Mostrar notificação de sucesso
      toast.success("Resposta manual enviada!");
    } catch (error) {
      console.error('Erro ao enviar resposta manual:', error);
      toast.error('Falha ao enviar resposta manual');
    }
  };

  // Lidar com mudanças no campo de texto
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Rolar para o final
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setScrolledUp(false);
    }
  };

  // Formatar tempo relativo
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch {
      return '';
    }
  };

  // Obter data de início da conversa
  const getConversationDate = () => {
    if (!conversation?.messages.length) return '';

    try {
      const firstMessage = conversation.messages[0];
      const date = new Date(firstMessage.created_at);
      return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch {
      return '';
    }
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="p-4 border-b border-slate-700/50 backdrop-blur-sm bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="animate-pulse h-10 w-10 bg-slate-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="animate-pulse h-5 w-48 bg-slate-700 rounded"></div>
                <div className="animate-pulse h-3 w-24 bg-slate-700/70 rounded"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="animate-pulse h-9 w-9 bg-slate-700 rounded-full"></div>
              <div className="animate-pulse h-9 w-9 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-6 relative">
          <div className="space-y-6 max-w-md mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[80%] ${i % 2 === 0 ? 'animate-pulse-slow-right' : 'animate-pulse-slow-left'}`}>
                  <div className={`h-${10 + (i * 6)} w-full ${
                    i % 2 === 0 
                      ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-2xl rounded-tr-sm' 
                      : 'bg-slate-700/30 rounded-2xl rounded-tl-sm'
                    } p-4`}>
                    <div className="space-y-2">
                      {[...Array(2 + i)].map((_, j) => (
                        <div key={j} className="h-4 bg-current opacity-10 rounded-full"></div>
                      ))}
                      <div className="h-4 bg-current opacity-10 rounded-full w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="absolute inset-x-0 bottom-10 flex justify-center">
            <div className="px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg border border-slate-700/50 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-700/50 backdrop-blur-sm bg-slate-800/50">
          <div className="animate-pulse h-14 w-full bg-slate-700/70 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Estado vazio
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] animate-slow-spin"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="p-8 rounded-full bg-gradient-to-br from-blue-600/10 to-indigo-600/10 backdrop-blur-sm border border-blue-500/20 mb-8 relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 mb-3">
            Nenhuma Conversa Selecionada
          </h3>
          
          <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
            Selecione uma conversa existente ou inicie uma nova para começar a interagir com seus clientes.
          </p>
          
          <button className="px-6 py-3 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl shadow-xl shadow-blue-900/20 flex items-center gap-2 transition-all hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Iniciar Nova Conversa</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800 relative">
      {/* Cabeçalho da conversa */}
      <div className="relative p-4 border-b border-slate-700/50 backdrop-blur-sm bg-slate-800/50 shadow-md z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar do cliente */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white font-medium shadow-lg shadow-indigo-900/20">
                {conversation.id.substring(0, 1).toUpperCase()}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                conversation.state === 'OPEN' 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-slate-400'
              }`}></div>
            </div>
            
            {/* Informações da conversa */}
            <div>
              <div className="flex items-center">
                <h3 className="font-semibold text-white">
                  Conversa #{conversation.id.substring(0, 8)}
                </h3>
                <div className={`ml-2.5 px-1.5 py-0.5 text-xs rounded-md ${
                  conversation.state === 'OPEN'
                    ? 'bg-green-900/30 text-green-400 border border-green-800/30'
                    : 'bg-slate-800/70 text-slate-400 border border-slate-700/50'
                }`}>
                  {conversation.state === 'OPEN' ? 'Ativa' : 'Encerrada'}
                </div>
              </div>
              
              <div className="text-xs text-slate-400 mt-0.5 flex items-center">
                <svg className="w-3 h-3 mr-1 opacity-70" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Iniciada em {getConversationDate()}</span>
                
                <span className="mx-1.5">•</span>
                
                <span>{conversation.messages.length} mensage{conversation.messages.length !== 1 ? 'ns' : 'm'}</span>
              </div>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex space-x-2">
            {conversation.state === 'OPEN' && (
              <button
                onClick={onCloseConversation}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-all group"
                title="Encerrar conversa"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transform group-hover:rotate-90 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            
            <button
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-all"
              title="Informações da conversa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Área de mensagens */}
      <div 
        ref={messageContainerRef}
        className="relative flex-1 overflow-y-auto py-6 px-4 md:px-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent z-10"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Mensagem de início de conversa */}
        <div className="flex justify-center">
          <div className="px-4 py-2 bg-slate-800/70 backdrop-blur-sm rounded-full text-xs text-slate-400 border border-slate-700/50 shadow-lg">
            Início da conversa
          </div>
        </div>
        
        {conversation.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center py-12">
            <div className="p-4 rounded-full bg-slate-800/70 backdrop-blur-sm mb-4 border border-slate-700/50 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-slate-300 mb-2">Nenhuma mensagem ainda</h4>
            <p className="text-slate-400 text-sm max-w-xs">Comece a conversar com seu cliente enviando uma mensagem abaixo.</p>
            
            {conversation.state === 'OPEN' && (
              <button
                onClick={() => inputRef.current?.focus()}
                className="mt-6 px-4 py-2 bg-blue-700/30 text-blue-300 border border-blue-600/30 rounded-lg flex items-center text-sm shadow-lg shadow-blue-900/10 hover:bg-blue-700/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Enviar primeira mensagem</span>
              </button>
            )}
          </div>
        ) : (
          // Renderizar mensagens
          conversation.messages.map((msg, index) => {
            const isReceived = msg.direction === 'RECEIVED';
            const isLastMessage = index === conversation.messages.length - 1;
            
            return (
              <motion.div 
                key={msg.id}
                className={`flex ${isReceived ? 'justify-start' : 'justify-end'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                ref={isLastMessage ? lastMessageRef : undefined}
              >
                {isReceived && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white mr-2 mt-1">
                    <span className="text-xs font-semibold">C</span>
                  </div>
                )}
                
                <div 
                  className={`max-w-[80%] relative group mb-4 ${
                    isReceived ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'
                  } py-3 px-4 rounded-2xl ${
                    isReceived ? 'rounded-tl-sm' : 'rounded-tr-sm'
                  } shadow-md`}
                >
                  {/* Conteúdo da mensagem */}
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-1 ${isReceived ? 'text-slate-400' : 'text-blue-200'} flex items-center gap-1 justify-end`}>
                    {format(new Date(msg.created_at), 'HH:mm')}
                    {!isReceived && (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Efeito visual na mensagem */}
                  <div 
                    className={`absolute ${
                      isReceived ? '-left-1 top-1' : '-right-1 top-1'
                    } w-2 h-2 transform rotate-45 ${
                      isReceived ? 'bg-slate-800' : 'bg-blue-600'
                    }`}
                  ></div>
                </div>
                
                {!isReceived && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white ml-2 mt-1">
                    <span className="text-xs font-semibold">V</span>
                  </div>
                )}
              </motion.div>
            );
          })
        )}

        {/* Adicionar opções de simulação quando apropriado */}
        {conversation?.state === 'OPEN' && conversation.messages.length > 0 && onSimulateResponse && (
          // Só mostrar se a última mensagem foi enviada (não recebida)
          conversation.messages[conversation.messages.length - 1]?.direction === 'SENT' && (
            <div className="flex justify-center my-4">
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 shadow-md">
                <div className="text-xs text-slate-400 mb-2 text-center">
                  Simular resposta do cliente
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onSimulateResponse();
                      toast.success("Resposta automática enviada");
                      scrollToBottom();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-700/30 hover:bg-amber-600/30 transition-colors text-sm flex items-center"
                    title="Gerar resposta automática"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                    <span>Automática</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const response = window.prompt("Digite a resposta manual do cliente:");
                      if (response && response.trim()) {
                        handleManualResponse(response.trim());
                        scrollToBottom();
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-700/30 hover:bg-purple-600/30 transition-colors text-sm flex items-center"
                    title="Digitar resposta manualmente"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Manual</span>
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Botão de rolar para baixo */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 z-20 p-3 rounded-full bg-blue-700 text-white shadow-lg shadow-blue-900/30 hover:bg-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Área de input de mensagem */}
      <div className={`relative p-4 md:p-5 border-t border-slate-700/50 backdrop-blur-sm bg-slate-800/50 z-10 ${conversation.state === 'CLOSED' ? 'bg-slate-900/70' : ''}`}>
        {conversation.state === 'CLOSED' ? (
          <div className="bg-gradient-to-r from-slate-800/70 to-slate-800/90 backdrop-blur-xl rounded-xl p-5 text-center border border-slate-700/50 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="text-base text-slate-200 font-medium mb-1">Esta conversa foi encerrada</div>
            <p className="text-sm text-slate-400">Não é possível enviar novas mensagens para esta conversa.</p>
          </div>
        ) : (
          <div className="relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="w-full py-4 px-5 pr-16 bg-slate-800/70 text-white placeholder-slate-400 rounded-2xl border border-slate-700/60 focus:border-blue-500 focus:outline-none resize-none shadow-inner"
              rows={2}
              style={{ minHeight: '3.5rem' }}
            />
            
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`absolute right-2 top-2 p-2 rounded-lg ${
                message.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-slate-700/50 text-slate-400'
              } transition-all`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}