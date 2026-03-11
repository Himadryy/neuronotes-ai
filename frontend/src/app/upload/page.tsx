'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadDropzone } from '@/components/UploadDropzone';
import { uploadNotes, generateSummary } from '@/services/api';
import DOMPurify from 'isomorphic-dompurify';
import { FileText, Sparkles, AlertCircle, BookOpen, Zap } from 'lucide-react';

export default function UploadPage() {
  const [extractedText, setExtractedText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (uploadedFile: File) => {
    setIsUploading(true);
    setError(null);
    setSummary('');
    setExtractedText('');

    try {
      const response = await uploadNotes(uploadedFile);
      const cleanText = DOMPurify.sanitize(response.text);
      setExtractedText(cleanText);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to upload and extract text.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!extractedText) return;
    
    setIsSummarizing(true);
    setError(null);
    
    try {
      const response = await generateSummary(extractedText);
      const cleanSummary = DOMPurify.sanitize(response.summary);
      setSummary(cleanSummary);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to generate summary.');
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="min-h-full pb-16 px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 space-y-2"
        >
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Upload & Summarize</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="text-gradient">Smart Document Processing</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mt-4">
            Upload your study materials and let AI extract key insights instantly. Perfect for distilling complex documents into concise summaries.
          </p>
        </motion.header>

        {/* Upload Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <UploadDropzone onFileUpload={handleFileUpload} isLoading={isUploading} />
        </motion.section>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="flex items-center gap-3 p-5 rounded-xl bg-gradient-to-r from-rose-500/20 to-rose-900/20 border border-rose-500/30 text-rose-300 shadow-lg overflow-hidden"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content columns */}
        <AnimatePresence>
          {extractedText && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Extracted Text Column */}
              <div className="flex flex-col h-[600px] glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-sm relative z-10">
                  <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.1 }} className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                      <FileText className="w-6 h-6" />
                    </motion.div>
                    <div>
                      <h3 className="text-slate-100 font-bold text-lg">Extracted Text</h3>
                      <p className="text-xs text-slate-400">Original document content</p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerateSummary}
                    disabled={isSummarizing || !extractedText}
                    className="btn-gradient flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSummarizing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Generate Summary
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar relative z-10">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium"
                  >
                    {extractedText}
                  </motion.p>
                </div>
              </div>

              {/* AI Summary Column */}
              <div className="flex flex-col h-[600px] glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
                
                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b border-white/5 bg-white/5 backdrop-blur-sm relative z-10">
                  <motion.div whileHover={{ scale: 1.1 }} className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                    <Sparkles className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="text-slate-100 font-bold text-lg">AI Summary</h3>
                    <p className="text-xs text-slate-400">Key insights & takeaways</p>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar relative z-10">
                  <AnimatePresence mode="wait">
                    {summary ? (
                      <motion.div 
                        key="summary"
                        initial={{ opacity: 0, filter: "blur(10px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.3 }}
                        className="prose prose-invert prose-p:text-slate-200 prose-p:leading-relaxed prose-p:mb-4 text-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: summary }} 
                      />
                    ) : isSummarizing ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center gap-6"
                      >
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="relative"
                        >
                          <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full" />
                          <Sparkles className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                        </motion.div>
                        <div className="text-center space-y-2">
                          <p className="font-semibold text-slate-200">Processing your notes...</p>
                          <p className="text-sm text-slate-400">Extracting key concepts and insights</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col items-center justify-center text-center gap-4"
                      >
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-20 h-20 text-slate-500/40" />
                        </motion.div>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-300">Ready to summarize</p>
                          <p className="text-sm text-slate-400 max-w-[200px]">Click the &quot;Generate Summary&quot; button to create an AI-powered summary</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
