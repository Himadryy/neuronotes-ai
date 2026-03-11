'use client';

import { motion } from 'framer-motion';
import { QuizGenerator } from '@/components/QuizGenerator';
import { Target } from 'lucide-react';

export default function QuizPage() {
  return (
    <div className="min-h-full pb-16 px-6 md:px-8 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-rose-400" />
            <span className="text-sm font-semibold text-rose-400 uppercase tracking-wider">Knowledge Testing</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient">AI-Powered Quizzes</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              Test your understanding with adaptive quizzes generated from your study materials. Get instant feedback and track your progress.
            </p>
          </div>
        </motion.header>

        {/* Quiz section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 20 }}
        >
          <QuizGenerator />
        </motion.section>
      </div>
    </div>
  );
}
