'use client';

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Upload, 
  MessageSquare, 
  Network, 
  HelpCircle,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const quickActions = [
    { name: "Upload Notes", desc: "Extract & summarize with AI", icon: Upload, href: "/upload", color: "from-blue-500 to-cyan-400", accentColor: "blue" },
    { name: "Chat with AI", desc: "Interactive AI tutor", icon: MessageSquare, href: "/chat", color: "from-indigo-500 to-purple-500", accentColor: "indigo" },
    { name: "Knowledge Graph", desc: "Visualize & connect concepts", icon: Network, href: "/graph", color: "from-purple-500 to-pink-500", accentColor: "purple" },
    { name: "Take a Quiz", desc: "Test your knowledge", icon: HelpCircle, href: "/quiz", color: "from-pink-500 to-rose-400", accentColor: "pink" },
  ];

  const recentActivity = [
    { title: "Photosynthesis Summary", type: "Summary", date: "2 hours ago", icon: BookOpen },
    { title: "Cell Biology Quiz 1", type: "Quiz", date: "Yesterday", icon: Award },
    { title: "Neuroscience Basics", type: "Note", date: "Oct 12, 2023", icon: Network },
  ];

  const stats = [
    { label: "Notes Uploaded", value: "12", icon: BookOpen, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5", borderColor: "border-emerald-500/20" },
    { label: "Hours Studied", value: "24", icon: Clock, color: "text-amber-400", bg: "from-amber-500/10 to-amber-600/5", borderColor: "border-amber-500/20" },
    { label: "Quizzes Mastered", value: "7", icon: Award, color: "text-rose-400", bg: "from-rose-500/10 to-rose-600/5", borderColor: "border-rose-500/20" },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 15 }
    }
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 12 }
    }
  };

  return (
    <div className="min-h-full pb-16 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 px-6 md:px-8 lg:px-10 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-12"
        >
          {/* Header Section */}
          <motion.header 
            variants={headerVariants}
            className="pt-8 pb-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-block"
                >
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </motion.div>
                <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Welcome Back</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="text-gradient">Study Smarter with AI</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                Your personalized study companion is ready to help you learn effectively. Organize notes, practice with quizzes, visualize concepts, and chat with AI.
              </p>
            </div>
          </motion.header>

          {/* Stats Section with enhanced design */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className={`glass-card rounded-2xl p-8 relative overflow-hidden group border ${stat.borderColor}`}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm font-medium mb-3 tracking-wide">{stat.label}</p>
                      <p className={`text-5xl font-bold ${stat.color} tabular-nums`}>{stat.value}</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${stat.bg} border ${stat.borderColor}`}
                    >
                      <Icon className={`w-7 h-7 ${stat.color}`} />
                    </motion.div>
                  </div>

                  {/* Accent line */}
                  <motion.div 
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.bg}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                  />
                </motion.div>
              );
            })}
          </motion.section>

          {/* Quick Actions Section */}
          <motion.section variants={itemVariants}>
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h2 className="text-3xl font-bold text-white">Quick Actions</h2>
                </div>
                <p className="text-slate-400">Get started with any of these powerful features below</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        visible: {
                          opacity: 1,
                          scale: 1,
                          transition: { type: "spring", stiffness: 100, delay: i * 0.05 }
                        }
                      }}
                    >
                      <Link href={action.href} className="group block h-full">
                        <motion.div 
                          whileHover={{ y: -12 }}
                          whileTap={{ scale: 0.98 }}
                          className="h-full glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 relative overflow-hidden"
                        >
                          {/* Gradient background overlay */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10`} />
                          
                          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 h-full">
                            {/* Icon with gradient background */}
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 10 }}
                              whileTap={{ scale: 0.95 }}
                              className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg shadow-indigo-500/20 group-hover:shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-300`}
                            >
                              <Icon className="w-8 h-8 text-white" />
                            </motion.div>
                            
                            {/* Text content */}
                            <div className="space-y-2 flex-1 flex flex-col justify-center">
                              <h3 className="text-slate-100 font-bold text-lg leading-tight group-hover:text-white transition-colors">{action.name}</h3>
                              <p className="text-slate-400 text-sm leading-tight group-hover:text-slate-300 transition-colors">{action.desc}</p>
                            </div>
                            
                            {/* Arrow indicator */}
                            <motion.div
                              initial={{ opacity: 0, x: -5 }}
                              whileHover={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-2 text-indigo-400 font-medium text-sm"
                            >
                              <span>Explore</span>
                              <motion.div whileHover={{ x: 3 }}>
                                <ArrowRight className="w-4 h-4" />
                              </motion.div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Recent Activity Section */}
          <motion.section variants={itemVariants}>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">Recent Activity</h2>
                </div>
                <p className="text-slate-400">Your latest study sessions and progress</p>
              </div>
              
              <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
                <motion.ul 
                  className="divide-y divide-white/5"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {recentActivity.map((activity, i) => {
                    const ActivityIcon = activity.icon;
                    return (
                      <motion.li 
                        key={i}
                        variants={itemVariants}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingLeft: '2rem' }}
                        className="p-6 flex justify-between items-center transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/50 transition-colors"
                          >
                            <ActivityIcon className="w-6 h-6 text-indigo-400" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-lg">{activity.title}</p>
                            <p className="text-sm text-slate-400">{activity.type}</p>
                          </div>
                        </div>
                        <motion.div 
                          initial={{ opacity: 0.7 }}
                          whileHover={{ opacity: 1 }}
                          className="text-sm font-medium text-slate-500 bg-slate-900/50 px-4 py-2 rounded-full border border-white/5 group-hover:border-indigo-500/50 group-hover:text-slate-300 transition-all"
                        >
                          {activity.date}
                        </motion.div>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section variants={itemVariants} className="py-8">
            <div className="glass-panel rounded-2xl p-8 border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to boost your learning?</h3>
                  <p className="text-slate-300">Upload your first study notes and let AI help you ace your exams.</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/upload" className="btn-gradient inline-flex items-center gap-2 whitespace-nowrap">
                    <Upload className="w-5 h-5" />
                    Upload Notes
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
