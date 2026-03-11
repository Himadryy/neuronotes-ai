import axios from 'axios';
import { Node, Edge } from 'reactflow';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Since we don't have a real backend for the hackathon, we will use mock functions
// that simulate network requests. For real endpoints, you would use `api.post(...)`

export const uploadNotes = async (file: File): Promise<{ text: string, message: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Real implementation:
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await api.post('/upload', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // });
  // return response.data;

  return {
    message: "File uploaded successfully!",
    text: `Extracted text from ${file.name}...\n\nArtificial Intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans...`
  };
};

export const generateSummary = async (text: string): Promise<{ summary: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Real implementation:
  // const response = await api.post('/summarize', { text });
  // return response.data;
  
  return {
    summary: "This document discusses the basics of Artificial Intelligence, describing it as intelligence demonstrated by machines. It distinguishes AI from natural intelligence."
  };
};

export const chatWithAI = async (message: string, history: { role: string; content: string }[]): Promise<{ response: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Real implementation:
  // const response = await api.post('/chat', { message, history });
  // return response.data;
  
  return {
    response: "I'm your NeuroNotes AI study assistant! I can help you understand your uploaded notes better, answer questions, or quiz you on the material."
  };
};

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const generateQuiz = async (): Promise<{ questions: QuizQuestion[] }> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Real implementation:
  // const response = await api.post('/generate-quiz');
  // return response.data;
  
  return {
    questions: [
      {
        id: "q1",
        question: "What is Artificial Intelligence?",
        options: ["Human intelligence", "Intelligence demonstrated by machines", "Animal intelligence", "A programming language"],
        correctAnswer: 1
      },
      {
        id: "q2",
        question: "Which of the following is true about machine learning?",
        options: ["It requires explicit programming for every task", "It is a subset of AI", "It cannot process large datasets", "It is only used in robotics"],
        correctAnswer: 1
      },
      {
        id: "q3",
        question: "What does NLP stand for in AI?",
        options: ["Natural Language Processing", "Neural Logic Programming", "Network Learning Protocol", "New Level Processing"],
        correctAnswer: 0
      }
    ]
  };
};

export const getKnowledgeGraph = async (): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Real implementation:
  // const response = await api.get('/knowledge-graph');
  // return response.data; // Should return { nodes: [...], edges: [...] }
  
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
