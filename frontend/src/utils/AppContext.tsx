'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface GraphNode {
  id: string;
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface QuizData {
  questions: QuizQuestion[];
  currentIdx: number;
  selectedAnswers: Record<number, number>;
  showResults: boolean;
}

interface AppContextType {
  extractedText: string;
  setExtractedText: (text: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  summary: string;
  setSummary: (summary: string) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  graphData: GraphData | null;
  setGraphData: (data: GraphData | null) => void;
  quizData: QuizData | null;
  setQuizData: (data: QuizData | null) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [extractedText, setExtractedText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [messages, setMessagesState] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am NeuroNotes AI. How can I help you with your studies today?'
    }
  ]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  // Load from session storage on mount
  useEffect(() => {
    try {
      const savedText = sessionStorage.getItem('neuronotes_text');
      const savedName = sessionStorage.getItem('neuronotes_filename');
      const savedSummary = sessionStorage.getItem('neuronotes_summary');
      const savedMessages = sessionStorage.getItem('neuronotes_messages');
      const savedGraph = sessionStorage.getItem('neuronotes_graph');
      const savedQuiz = sessionStorage.getItem('neuronotes_quiz');

      if (savedText) setExtractedText(savedText);
      if (savedName) setFileName(savedName);
      if (savedSummary) setSummary(savedSummary);
      if (savedMessages) setMessagesState(JSON.parse(savedMessages));
      if (savedGraph) setGraphData(JSON.parse(savedGraph));
      if (savedQuiz) setQuizData(JSON.parse(savedQuiz));
    } catch (e) {
      console.error("Failed to load state from sessionStorage:", e);
    }
  }, []);

  const handleSetExtractedText = (text: string) => {
    setExtractedText(text);
    sessionStorage.setItem('neuronotes_text', text);
  };

  const handleSetFileName = (name: string) => {
    setFileName(name);
    sessionStorage.setItem('neuronotes_filename', name);
  };

  const handleSetSummary = (s: string) => {
    setSummary(s);
    sessionStorage.setItem('neuronotes_summary', s);
  };

  const setMessages = (update: Message[] | ((prev: Message[]) => Message[])) => {
    setMessagesState(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      sessionStorage.setItem('neuronotes_messages', JSON.stringify(next));
      return next;
    });
  };

  const handleSetGraphData = (data: GraphData | null) => {
    setGraphData(data);
    if (data) {
      sessionStorage.setItem('neuronotes_graph', JSON.stringify(data));
    } else {
      sessionStorage.removeItem('neuronotes_graph');
    }
  };

  const handleSetQuizData = (data: QuizData | null) => {
    setQuizData(data);
    if (data) {
      sessionStorage.setItem('neuronotes_quiz', JSON.stringify(data));
    } else {
      sessionStorage.removeItem('neuronotes_quiz');
    }
  };

  const clearAllData = () => {
    setExtractedText('');
    setFileName('');
    setSummary('');
    setMessagesState([{
      id: '1',
      role: 'assistant',
      content: 'Hello! I am NeuroNotes AI. How can I help you with your studies today?'
    }]);
    setGraphData(null);
    setQuizData(null);
    sessionStorage.clear();
  };

  return (
    <AppContext.Provider 
      value={{ 
        extractedText, 
        setExtractedText: handleSetExtractedText, 
        fileName, 
        setFileName: handleSetFileName,
        summary,
        setSummary: handleSetSummary,
        messages,
        setMessages,
        graphData,
        setGraphData: handleSetGraphData,
        quizData,
        setQuizData: handleSetQuizData,
        clearAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
