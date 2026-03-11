import axios from 'axios';
import { Node, Edge } from 'reactflow';

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
    questions: response.data.quiz
  };
};

export const getKnowledgeGraph = async (): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  // Knowledge graph is currently a mock because it requires specialized extraction logic
  return {
    nodes: [
      { id: '1', position: { x: 250, y: 50 }, data: { label: 'Artificial Intelligence' }, type: 'default', className: 'bg-indigo-600 border-indigo-500 text-white rounded-xl shadow-lg font-bold px-6 py-3' },
      { id: '2', position: { x: 100, y: 150 }, data: { label: 'Machine Learning' }, type: 'default', className: 'bg-slate-800 border-slate-700 text-white rounded-lg shadow px-4 py-2' },
      { id: '3', position: { x: 400, y: 150 }, data: { label: 'Deep Learning' }, type: 'default', className: 'bg-slate-800 border-slate-700 text-white rounded-lg shadow px-4 py-2' },
      { id: '4', position: { x: 250, y: 250 }, data: { label: 'Neural Networks' }, type: 'default', className: 'bg-slate-800 border-slate-700 text-white rounded-lg shadow px-4 py-2' },
      { id: '5', position: { x: 100, y: 350 }, data: { label: 'Data Science' }, type: 'default', className: 'bg-slate-800 border-slate-700 text-slate-300 rounded-lg shadow px-4 py-2' }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1' } },
      { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#6366f1' } },
      { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#94a3b8' } },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#94a3b8' } },
      { id: 'e2-5', source: '2', target: '5', style: { stroke: '#475569', strokeDasharray: '5,5' } }
    ]
  };
};

export default api;
