'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  extractedText: string;
  setExtractedText: (text: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [extractedText, setExtractedText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Persist to session storage for the hackathon
  useEffect(() => {
    const savedText = sessionStorage.getItem('neuronotes_text');
    const savedName = sessionStorage.getItem('neuronotes_filename');
    if (savedText) setExtractedText(savedText);
    if (savedName) setFileName(savedName);
  }, []);

  const handleSetExtractedText = (text: string) => {
    setExtractedText(text);
    sessionStorage.setItem('neuronotes_text', text);
  };

  const handleSetFileName = (name: string) => {
    setFileName(name);
    sessionStorage.setItem('neuronotes_filename', name);
  };

  return (
    <AppContext.Provider 
      value={{ 
        extractedText, 
        setExtractedText: handleSetExtractedText, 
        fileName, 
        setFileName: handleSetFileName 
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
