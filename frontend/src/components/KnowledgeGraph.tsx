'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Panel,
  BackgroundVariant,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getKnowledgeGraph } from '@/services/api';
import { Network, AlertCircle, Sparkles } from 'lucide-react';
import { useAppContext } from '@/utils/AppContext';

export function KnowledgeGraph() {
  const { extractedText } = useAppContext();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraphData = useCallback(async () => {
    if (!extractedText) {
      setError('Please upload notes first to visualize the knowledge graph.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getKnowledgeGraph();
      if (data && data.nodes && data.edges) {
        // Enhance node styling with glassmorphism classes
        const enhancedNodes = data.nodes.map((n: Node) => {
          let customClass = 'bg-slate-800/80 backdrop-blur-md border border-white/10 text-slate-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] px-5 py-3 font-medium transition-all hover:shadow-[0_4px_25px_rgba(99,102,241,0.2)] hover:border-indigo-500/50';
          
          if (n.id === '1') {
            customClass = 'bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-400/50 text-white rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] px-6 py-4 font-bold text-lg';
          }

          return {
            ...n,
            className: customClass
          };
        });

        setNodes(enhancedNodes);
        setEdges(data.edges);
      } else {
        setError('Received invalid data format for knowledge graph.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load knowledge graph.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [extractedText, setNodes, setEdges]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: { stroke: 'url(#edge-gradient)', strokeWidth: 2 }
  }), []);

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col h-[650px] w-full items-center justify-center glass-panel rounded-3xl relative overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />
        <div className="relative mb-6">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute inset-0 border-4 border-purple-500/30 rounded-full" 
          />
          <div className="relative bg-slate-900/60 backdrop-blur-xl p-5 rounded-full border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            <Network className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">Synthesizing Concepts...</h3>
        <p className="text-slate-400 font-medium">Building your interactive knowledge map</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-[650px] w-full items-center justify-center glass-panel rounded-3xl p-8 text-center"
      >
        <AlertCircle className="w-14 h-14 text-rose-500 mb-5 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]" />
        <h3 className="text-2xl font-bold text-white mb-3">Failed to load Knowledge Graph</h3>
        <p className="text-slate-400 mb-8 max-w-md">{error}</p>
        <button 
          onClick={fetchGraphData}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_25px_rgba(99,102,241,0.6)]"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="h-[650px] w-full glass-panel rounded-3xl overflow-hidden shadow-2xl relative"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-purple-900/20 pointer-events-none z-0" />
      
      {/* SVG filter for edge gradients */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        className="relative z-10"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={2} 
          color="rgba(255, 255, 255, 0.1)" 
        />
        <Controls 
          className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden fill-slate-300 [&>button]:border-b [&>button]:border-white/10 [&>button:last-child]:border-none [&>button]:bg-transparent [&>button:hover]:bg-white/10 transition-colors shadow-lg" 
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.id === '1') return '#818cf8';
            return '#475569';
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
          className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl"
        />
        <Panel position="top-left">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 uppercase tracking-wider">
              Concept Map
            </span>
          </motion.div>
        </Panel>
      </ReactFlow>
    </motion.div>
  );
}
