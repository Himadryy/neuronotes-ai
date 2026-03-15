import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadNotes = async (file: File): Promise<{ text: string, message: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return {
    message: response.data.message,
    text: response.data.text
  };
};

export const generateSummary = async (text: string): Promise<{ summary: string }> => {
  const response = await api.post('/summarize', { text });
  return response.data;
};

export const chatWithAI = async (message: string, context: string = '', history: { role: string; content: string }[] = []): Promise<{ response: string }> => {
  const response = await api.post('/chat', { message, context, history });
  return response.data;
};

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export const generateQuiz = async (text: string): Promise<{ questions: QuizQuestion[] }> => {
  const response = await api.post('/generate-quiz', { text });
  return {
    questions: response.data.quiz || response.data.questions || []
  };
};

export interface BackendNode {
  id: string;
  label: string;
}

export interface BackendEdge {
  source: string;
  target: string;
  label: string;
}

export interface GraphResponse {
  nodes: BackendNode[];
  edges: BackendEdge[];
}

export const getKnowledgeGraph = async (text: string): Promise<GraphResponse> => {
  const response = await api.post('/knowledge-graph', { text });
  return response.data;
};

export default api;
