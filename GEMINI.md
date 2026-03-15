# NeuroNotes AI - Gemini CLI Sessions

## Session: Friday, 13 March 2026
- **Distributed AI Setup:** Configured 'NeuroNotes AI' to use a remote Ollama instance (Windows laptop `100.106.211.44`) via Tailscale tunnel.
- **Backend (FastAPI):** Implemented a fallback mechanism in `main.py` that prioritizes Local AI (Ollama) and falls back to Gemini API on timeout or error.
- **Frontend (Next.js):**
  - Fixed `useEffect` missing imports in `QuizGenerator.tsx`.
  - Refactored `AppContext.tsx` to remove `any` types and use strict interfaces for Graph and Quiz data.
  - Implemented a data transformer in `KnowledgeGraph.tsx` to map raw AI responses into `reactflow` Node/Edge formats with a circular layout.
  - Verified that `npm run build` now compiles successfully.
- **Dev Workflow:** Use `uvicorn main:app --reload --port 8000` for backend and `npm run dev` for frontend.
