'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewConversationModalProps {
  onClose: () => void;
  onCreateConversation: (customerName: string, customerPhone: string) => void;
  theme : string;
}

export default function NewConversationModal({ onClose, onCreateConversation }: NewConversationModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', phone: '' });
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  
  // Focar no primeiro campo quando o modal abrir
  useEffect(() => {
    const timer = setTimeout(() => {
      const nameInput = document.getElementById('customer-name');
      if (nameInput) nameInput.focus();
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Validar os campos
  const validateFields = () => {
    let isValid = true;
    const newErrors = { name: '', phone: '' };
    
    if (!customerName.trim()) {
      newErrors.name = 'Nome do cliente é obrigatório';
      isValid = false;
    }
    
    const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{5})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(customerPhone)) {
      newErrors.phone = 'Formato: (XX) XXXXX-XXXX';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Formatar o número de telefone enquanto o usuário digita
  const formatPhoneNumber = (value: string) => {
    // Remover caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplicar máscara (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    } else {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
    }
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setCustomerPhone(formattedPhone);
    
    // Limpar erro se o campo estiver válido
    if (errors.phone && /^\(\d{2}\) \d{5}-\d{4}$/.test(formattedPhone)) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value);
    
    // Limpar erro se o campo não estiver vazio
    if (errors.name && e.target.value.trim()) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleContinue = () => {
    if (validateFields()) {
      if (step === 1) {
        setStep(2);
      } else {
        handleSubmit();
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleContinue();
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('Iniciando criação de conversa para:', customerName, customerPhone);
    
    try {
      // Imediatamente criar a conversa em vez de esperar
      console.log('Chamando onCreateConversation com:', {
        customerName,
        customerPhone
      });
      
      // Chamar diretamente a função de criação de conversa
      await onCreateConversation(customerName, customerPhone);
      
      // Mostrar estado de sucesso
      setSuccess(true);
      
      // Fechar modal após mostrar sucesso por alguns segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      
      // Mostrar erro ao usuário
      setErrors({
        ...errors,
        name: 'Erro ao criar conversa. Tente novamente.'
      });
      setStep(1); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden w-full max-w-md mx-4 z-10 shadow-2xl border border-slate-700/50"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {/* Efeitos visuais de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-64 h-64 -top-32 -right-32 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute w-64 h-64 -bottom-32 -left-32 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Linhas futuristas */}
        <div className="absolute h-px w-full top-0 left-0 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="absolute h-px w-full bottom-0 left-0 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
        <div className="absolute w-px h-full top-0 left-0 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent"></div>
        <div className="absolute w-px h-full top-0 right-0 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-slate-700/50 relative">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                Nova Conversa
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {step === 1 ? 'Informe os dados do cliente' : 'Confirme os dados para criar a conversa'}
              </p>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800/80 transition-colors text-slate-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress steps */}
          <div className="absolute bottom-0 left-0 right-0 flex h-1 mt-3 overflow-hidden">
            <div 
              className="bg-blue-600 transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {/* Passo 1: Formulário */}
          {step === 1 && !success && (
            <motion.div 
              className="p-6 space-y-5"
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="customer-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Nome do Cliente
                  </label>
                  <div className={`relative rounded-lg overflow-hidden ${
                    errors.name ? 'ring-1 ring-red-500/50' : ''
                  }`}>
                    <input
                      id="customer-name"
                      type="text"
                      value={customerName}
                      onChange={handleNameChange}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-slate-800/80 border border-slate-700/60 text-white placeholder-slate-400 pl-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                      placeholder="Digite o nome do cliente"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="customer-phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Número de Telefone
                  </label>
                  <div className={`relative rounded-lg overflow-hidden ${
                    errors.phone ? 'ring-1 ring-red-500/50' : ''
                  }`}>
                    <input
                      id="customer-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-slate-800/80 border border-slate-700/60 text-white placeholder-slate-400 pl-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                      placeholder="(11) 98765-4321"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
                      </svg>
                      {errors.phone}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-slate-500">
                    O WhatsApp será usado para enviar mensagens ao cliente.
                  </p>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <motion.button
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                
                <motion.button
                  onClick={handleContinue}
                  className="px-5 py-2.5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all relative overflow-hidden shadow-lg shadow-blue-900/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center">
                    <span>Continuar</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
          
          {/* Passo 2: Confirmação */}
          {step === 2 && !success && (
            <motion.div 
              className="p-6 space-y-6"
              key="confirmation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
                <h3 className="text-lg font-medium text-slate-200 mb-3">Confirme os dados</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-slate-400">Nome do Cliente</div>
                    <div className="text-white font-medium">{customerName}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-400">Número de Telefone</div>
                    <div className="text-white font-medium">{customerPhone}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-slate-400 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Ao criar uma conversa, você poderá enviar e receber mensagens com este cliente via WhatsApp.
                  </span>
                </div>
              </div>
              
              <div className="pt-4 flex justify-between">
                <motion.button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </motion.button>
                
                <div className="flex space-x-3">
                  <motion.button
                    onClick={onClose}
                    className="px-4 py-2.5 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  
                  {/* Botão Corrigido */}
                  <button
                    onClick={() => {
                      console.log('Botão de criar conversa clicado');
                      handleSubmit();
                    }}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-800 disabled:to-indigo-800 disabled:opacity-70 transition-colors shadow-lg shadow-blue-900/30 min-w-[140px] relative z-20"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Criando...
                      </div>
                    ) : (
                      <span className="flex items-center">
                        <span>Criar Conversa</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Sucesso */}
          {success && (
            <motion.div 
              className="p-6 flex flex-col items-center justify-center py-12 text-center"
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-5 shadow-lg shadow-green-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Conversa Criada!</h3>
              <p className="text-slate-400 mb-6">
                A conversa com {customerName} foi criada com sucesso.
              </p>
              
              <div className="animate-pulse">
                <p className="text-slate-500 text-sm">Redirecionando...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}