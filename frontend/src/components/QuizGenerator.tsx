'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuiz, QuizQuestion } from '@/services/api';
import { Brain, CheckCircle2, XCircle, RefreshCw, Sparkles, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { useAppContext } from '@/utils/AppContext';

export function QuizGenerator() {
  const { extractedText } = useAppContext();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = async () => {
    if (!extractedText) {
      setError('Please upload notes first to generate a quiz.');
      return;
    }

    setIsGenerating(true);
    setQuestions([]);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setShowResults(false);
    setError(null);

    try {
      const response = await generateQuiz(extractedText);
      
      const sanitizedQuestions = response.questions.map(q => ({
        ...q,
        question: DOMPurify.sanitize(q.question),
        options: q.options.map(opt => DOMPurify.sanitize(opt))
      }));

      setQuestions(sanitizedQuestions);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to generate quiz.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (showResults) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: optionIdx
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (q.options[selectedAnswers[idx]] === q.correct_answer) {
        score++;
      }
    });
    return score;
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  if (isGenerating) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-16 glass-panel rounded-3xl relative overflow-hidden h-[500px]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
        <div className="relative mb-8">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 border-4 border-indigo-500/30 rounded-full" 
          />
          <div className="relative bg-slate-900/50 backdrop-blur-md p-6 rounded-full border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <Brain className="w-12 h-12 text-indigo-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Generating Quiz...</h3>
        <p className="text-slate-400 text-center max-w-sm font-medium">
          Synthesizing your notes into interactive questions...
        </p>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-16 glass-panel shadow-2xl rounded-3xl relative overflow-hidden group min-h-[500px]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="bg-slate-800/50 p-6 rounded-[2rem] mb-8 border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative z-10"
        >
          <Brain className="w-14 h-14 text-transparent fill-indigo-400 stroke-indigo-300" />
        </motion.div>
        
        <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">Ready to test your knowledge?</h3>
        <p className="text-slate-400 text-center text-lg max-w-md mb-10 leading-relaxed font-medium">
          Generate a custom quiz based on the notes you&apos;ve uploaded. AI will evaluate your comprehension.
        </p>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 px-5 py-3 rounded-xl glass-card bg-rose-500/10 border-rose-500/30 text-rose-300 font-medium flex items-center gap-3 relative z-10"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateQuiz}
          className="relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl transition-all shadow-[0_5px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.6)] overflow-hidden group/btn z-10 border border-white/10"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            Generate Quiz
          </span>
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
        </motion.button>
      </motion.div>
    );
  }

  const currentQ = questions[currentQuestionIdx];
  const isAnswered = selectedAnswers[currentQuestionIdx] !== undefined;

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <motion.div 
        initial="initial"
        animate="in"
        variants={pageVariants}
        className="glass-panel rounded-3xl p-8 md:p-12 max-w-4xl mx-auto relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
        
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-[12px] border-slate-800 mb-8 relative shadow-inner">
            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-emerald-500"
                strokeDasharray={`${(percentage / 100) * 427} 427`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1.5s ease-out" }}
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter">{percentage}%</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-3">Quiz Completed!</h2>
          <p className="text-slate-400 text-lg font-medium">
            You scored <span className="text-emerald-400">{score}</span> out of {questions.length} correct.
          </p>
        </div>

        <div className="space-y-6 mb-10 relative z-10">
          <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            Review Answers
          </h3>
          {questions.map((q, i) => {
            const userAnswer = selectedAnswers[i];
            const isCorrect = q.options[userAnswer] === q.correct_answer;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 shadow-lg"
              >
                <p className="text-slate-100 font-semibold mb-5 text-lg leading-relaxed">
                  <span className="text-indigo-400 mr-2 opacity-80">{i + 1}.</span> 
                  <span dangerouslySetInnerHTML={{ __html: q.question }} />
                </p>
                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => {
                    let optionClass = "text-slate-400 bg-slate-800/30 border border-white/5";
                    let Icon = null;

                    if (opt === q.correct_answer) {
                      optionClass = "text-emerald-300 bg-emerald-500/10 border-emerald-500/30 font-medium shadow-[0_0_15px_rgba(52,211,153,0.1)]";
                      Icon = CheckCircle2;
                    } else if (optIdx === userAnswer && !isCorrect) {
                      optionClass = "text-rose-300 bg-rose-500/10 border-rose-500/30 line-through opacity-80";
                      Icon = XCircle;
                    }

                    return (
                      <div key={optIdx} className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${optionClass}`}>
                        {Icon ? <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <div className="w-5 h-5" />}
                        <span dangerouslySetInnerHTML={{ __html: opt }} />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateQuiz}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold rounded-2xl transition-all shadow-lg border border-white/10"
          >
            <RefreshCw className="w-5 h-5" />
            Generate New Quiz
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-3xl p-6 md:p-10 max-w-3xl mx-auto shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 inset-x-0 h-1 bg-slate-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
        />
      </div>

      <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center gap-3">
          <Brain className="w-7 h-7 text-indigo-400" />
          Knowledge Check
        </h2>
        <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-300 font-bold rounded-full text-sm border border-indigo-500/20 tracking-wide">
          Q {currentQuestionIdx + 1} / {questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="mb-10"
        >
          <h3 
            className="text-2xl font-bold text-white mb-8 leading-relaxed drop-shadow-sm"
            dangerouslySetInnerHTML={{ __html: currentQ.question }}
          />
          
          <div className="space-y-4">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestionIdx] === idx;
              
              return (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                      : 'bg-slate-900/50 border-white/5 hover:border-indigo-500/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isSelected ? 'border-indigo-400 bg-indigo-500/20 scale-110' : 'border-slate-600 bg-slate-900'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />}
                    </div>
                    <span 
                      className={`text-lg transition-colors ${isSelected ? 'text-indigo-100 font-medium' : 'text-slate-300'}`}
                      dangerouslySetInnerHTML={{ __html: option }} 
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center pt-8 border-t border-white/10">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIdx === 0}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800/50 text-white font-medium rounded-xl transition-all border border-white/5 disabled:cursor-not-allowed group"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white font-bold rounded-xl transition-all shadow-lg border border-transparent disabled:cursor-not-allowed group"
        >
          {currentQuestionIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          <ChevronRight className={`w-5 h-5 transition-transform ${isAnswered ? 'group-hover:translate-x-1' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
}
