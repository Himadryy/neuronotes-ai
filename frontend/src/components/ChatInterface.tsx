'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, AlertCircle, Sparkles } from 'lucide-react';
import { chatWithAI } from '@/services/api';
import DOMPurify from 'isomorphic-dompurify';
import { useAppContext } from '@/utils/AppContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface() {
  const { extractedText, messages, setMessages } = useAppContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    const sanitizedInput = DOMPurify.sanitize(userMessage);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: sanitizedInput
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithAI(sanitizedInput, extractedText, history);
      
      const cleanResponse = DOMPurify.sanitize(response.response);
      
      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanResponse
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to get a response from the AI.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] max-h-[850px] glass-panel rounded-3xl overflow-hidden relative shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-purple-500/10 pointer-events-none" />
      
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5 backdrop-blur-md relative z-10 hidden sm:flex">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">NeuroNotes Assistant</h3>
            <p className="text-xs text-emerald-400 font-medium tracking-wider">ONLINE</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar relative z-10 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              key={message.id} 
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-white/10 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              
              <div 
                className={`max-w-[85%] md:max-w-[75%] rounded-3xl px-6 py-4 shadow-lg backdrop-blur-md leading-relaxed ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-indigo-500/20' 
                    : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-tl-none'
                }`}
              >
                <div 
                  className={`prose prose-invert max-w-none ${message.role === 'user' ? 'prose-p:text-white' : 'prose-p:text-slate-200'}`}
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              </div>

              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg backdrop-blur-sm">
                  <User className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
              className="flex gap-4 justify-start"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-white/10 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg backdrop-blur-sm relative overflow-hidden">
                <Sparkles className="w-5 h-5 absolute opacity-50 animate-ping" />
                <Bot className="w-5 h-5 relative z-10" />
              </div>
              <div className="glass-card rounded-3xl rounded-tl-none px-6 py-5 flex items-center gap-2 border border-white/5">
                <motion.div 
                  animate={{ y: [0, -8, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  className="w-2.5 h-2.5 bg-indigo-500 rounded-full" 
                />
                <motion.div 
                  animate={{ y: [0, -8, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2.5 h-2.5 bg-purple-500 rounded-full" 
                />
                <motion.div 
                  animate={{ y: [0, -8, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2.5 h-2.5 bg-pink-500 rounded-full" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-5 py-3 mx-4 mb-4 flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium rounded-xl backdrop-blur-md relative z-10"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-white/5 bg-slate-900/60 backdrop-blur-xl relative z-10">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message NeuroNotes AI..."
            className="flex-1 bg-slate-900 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white rounded-2xl px-6 py-4 outline-none transition-all placeholder:text-slate-500 relative z-10 text-base shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="relative z-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl px-6 py-4 flex items-center justify-center transition-colors shadow-lg group/btn overflow-hidden"
          >
            {!isLoading && <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />}
            <Send className="w-5 h-5 relative z-10 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
          </button>
        </form>
        <p className="text-center text-xs text-slate-500 mt-4 tracking-wide font-medium">
          NeuroNotes AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
