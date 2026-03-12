'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { motion, type Variants } from 'framer-motion';
import { 
  LayoutDashboard, 
  Upload, 
  MessageSquare, 
  Network, 
  HelpCircle,
  BrainCircuit,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useAppContext } from '@/utils/AppContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Upload Notes', href: '/upload', icon: Upload },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Knowledge Graph', href: '/graph', icon: Network },
  { name: 'Quiz Generator', href: '/quiz', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { clearAllData } = useAppContext();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    },
  };

  return (
    <div className="h-screen p-4 w-72 flex-shrink-0 z-50">
      <div className="h-full flex flex-col rounded-2xl glass-panel overflow-hidden border border-white/10 shadow-2xl relative group">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
        
        <div className="flex h-20 items-center px-6 border-b border-white/5 bg-white/5 relative z-10">
          <Link href="/" className="flex items-center gap-3 text-white font-bold text-xl hover:opacity-80 transition-opacity group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow"
            >
              <BrainCircuit className="h-6 w-6 text-white" />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-gradient font-bold"
            >
              NeuroNotes AI
            </motion.span>
          </Link>
        </div>
        
        <motion.nav 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 space-y-1 px-3 py-6 overflow-y-auto custom-scrollbar relative z-10"
        >
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <motion.div key={item.name} variants={itemVariants}>
                <Link href={item.href} className="relative block">
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/15 shadow-lg shadow-indigo-500/10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={cn(
                      'relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group/item',
                      isActive 
                        ? 'text-white' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    )}
                  >
                    <Icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-5 w-5 transition-all duration-300',
                        isActive 
                          ? 'text-indigo-400 scale-110 shadow-lg shadow-indigo-500/30' 
                          : 'text-slate-500 group-hover/item:text-indigo-400'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>
        
        <div className="p-4 border-t border-white/5 bg-white/5 relative z-10 space-y-2">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (confirm('Are you sure you want to clear your current session? All uploaded notes and progress will be lost.')) {
                clearAllData();
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all duration-300 group/clear"
          >
            <Trash2 className="w-5 h-5 group-hover/clear:scale-110 transition-transform" />
            <span className="text-sm font-medium">Clear Session</span>
          </motion.button>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group/profile"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 group-hover/profile:shadow-indigo-500/50 transition-shadow"
            >
              ST
            </motion.div>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-semibold text-slate-100">Student</span>
              <span className="text-xs text-indigo-400 font-medium">Pro Plan</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
