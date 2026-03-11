'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle, Cloud, Sparkles } from 'lucide-react';

interface UploadDropzoneProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'text/plain'];

export function UploadDropzone({ onFileUpload, isLoading }: UploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Only PDF and TXT files are allowed.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum file size is 5MB.');
      return false;
    }
    return true;
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileUpload(file);
      }
    }
  }, [onFileUpload, validateFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileUpload(file);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.label
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            htmlFor="dropzone-file"
            className={`group flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
              dragActive 
                ? 'border-indigo-400 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-[0_0_40px_rgba(99,102,241,0.3)]' 
                : 'border-white/20 hover:border-indigo-400/50 hover:bg-white/3'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Background effects */}
            {dragActive && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 z-0 pointer-events-none"
              />
            )}
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center relative z-10 text-center px-4 space-y-4"
            >
              {/* Icon */}
              <motion.div 
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileDrag={{ scale: 1.2 }}
                animate={dragActive ? { scale: 1.15, y: -5 } : { scale: 1, y: 0 }}
                className={`p-5 rounded-2xl transition-all duration-300 shadow-xl ${
                  dragActive 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/40' 
                    : 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 text-indigo-400 group-hover:from-indigo-500/30 group-hover:to-purple-600/30'
                }`}
              >
                {dragActive ? (
                  <Cloud className="w-10 h-10" />
                ) : (
                  <Upload className="w-10 h-10" />
                )}
              </motion.div>

              {/* Text content */}
              <div className="space-y-2 max-w-sm">
                <p className="text-lg font-bold">
                  {dragActive ? (
                    <span className="text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">Drop your file here</span>
                  ) : (
                    <>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                        Drop your notes here
                      </span>
                      <br />
                      <span className="text-base font-semibold text-slate-400">
                        or <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">click to browse</span>
                      </span>
                    </>
                  )}
                </p>
                <p className="text-sm text-slate-400 font-medium tracking-wide">
                  PDF or TXT • Up to 5MB
                </p>
              </div>

              {/* Features */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 pt-2 flex-wrap justify-center"
              >
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Processing</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Instant Extract</span>
                </div>
              </motion.div>
            </motion.div>

            <input 
              id="dropzone-file" 
              type="file" 
              className="hidden" 
              accept=".pdf,.txt"
              onChange={handleChange} 
              disabled={isLoading}
            />
          </motion.label>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-3xl overflow-hidden border border-indigo-500/20 relative group"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />

            <div className="p-6 relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/40 flex-shrink-0"
                >
                  <FileText className="w-6 h-6" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-slate-100 truncate">{selectedFile.name}</p>
                  <p className="text-sm text-slate-400 font-medium">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-500/30 text-indigo-300 text-sm font-semibold"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full"
                    />
                    <span>Processing...</span>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                    </motion.div>
                    <motion.button 
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={clearFile}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all rounded-xl border border-transparent hover:border-rose-500/30"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-rose-900/5 border border-rose-500/30 text-rose-300 text-sm font-medium shadow-lg flex items-center gap-3"
          >
            <AlertIcon className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
