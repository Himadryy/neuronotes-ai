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

interface BackendNode {
  id: string;
  label: string;
}

interface BackendEdge {
  source: string;
  target: string;
  label: string;
}

export const getKnowledgeGraph = async (text: string): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  const response = await api.post('/knowledge-graph', { text });
  
  // Transform backend response into ReactFlow format if needed
  const nodes: Node[] = response.data.nodes.map((n: BackendNode, idx: number) => ({
    id: n.id,
    data: { label: n.label },
    position: { x: 250 + (idx * 50), y: 100 + (idx * 100) }, // Better layout later
    type: 'default'
  }));

  const edges: Edge[] = response.data.edges.map((e: BackendEdge) => ({
    id: `e-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true
  }));

  return { nodes, edges };
};

export default api;
