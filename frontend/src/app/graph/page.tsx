'use client';

import { motion } from 'framer-motion';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { Zap } from 'lucide-react';

export default function GraphPage() {
  return (
    <div className="min-h-full pb-16 px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Concept Mapping</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient">Knowledge Graph</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
              Visualize how concepts connect and relate to each other. Interactive graph shows relationships between key ideas from your study materials for better understanding.
            </p>
          </div>
        </motion.header>

        {/* Graph section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 20 }}
        >
          <KnowledgeGraph />
        </motion.section>
      </div>
    </div>
  );
}
