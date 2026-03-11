'use client';

import { motion } from 'framer-motion';
import { ChatInterface } from '@/components/ChatInterface';
import { Brain } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="min-h-full pb-16 px-6 md:px-8 lg:px-10 flex flex-col">
      <div className="max-w-6xl mx-auto w-full space-y-8 flex-1 flex flex-col">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 flex flex-col gap-4 flex-shrink-0"
        >
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Smart Conversations</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient">Chat with Your AI Tutor</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              Ask questions about your notes, get instant explanations, and deepen your understanding through intelligent conversations powered by advanced AI.
            </p>
          </div>
        </motion.header>

        {/* Chat section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 20 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <ChatInterface />
        </motion.section>
      </div>
    </div>
  );
}
