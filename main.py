import os
import sys
import tempfile
import shutil
import json
import time
import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv(override=True)

# Import our independent modules
from ingestion import extract_text_from_file
from processor import process_lecture_text
from quiz_generator import generate_quiz_with_retries

app = FastAPI(title="NeuroNotes AI RAG Pipeline")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup your Gemini API key (still used as fallback)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Configuration for Local AI (Ollama)
USE_LOCAL_AI = os.getenv("USE_LOCAL_AI", "true").lower() == "true"
LOCAL_OLLAMA_MODEL = os.getenv("LOCAL_OLLAMA_MODEL", "qwen2.5-coder:3b")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Path for logging user activities
ACTIVITY_LOG_PATH = "user_activity.json"

def log_activity(action: str, details: dict):
    try:
        activity = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "details": details
        }
        activities = []
        if os.path.exists(ACTIVITY_LOG_PATH):
            with open(ACTIVITY_LOG_PATH, "r") as f:
                try:
                    activities = json.load(f)
                except:
                    activities = []
        activities.append(activity)
        with open(ACTIVITY_LOG_PATH, "w") as f:
            json.dump(activities, f, indent=4)
    except Exception as e:
        print(f"Failed to log activity: {e}")

async def call_llm_with_fallback(func, *args, **kwargs):
    """
    Tries Local Ollama first if enabled, then falls back to Gemini models.
    """
    from langchain_ollama import ChatOllama
    from langchain_google_genai import ChatGoogleGenerativeAI
    
    # 1. Try Local Ollama first
    if USE_LOCAL_AI:
        try:
            print(f"--- Attempting Local AI: {LOCAL_OLLAMA_MODEL} ---")
            llm = ChatOllama(
                model=LOCAL_OLLAMA_MODEL,
                base_url=OLLAMA_BASE_URL,
                temperature=0.3
            )
            return await func(llm)
        except Exception as e:
            print(f"Local AI failed: {e}. Falling back to Gemini...")

    # 2. Priority list of Gemini models
    models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
    last_error = None
    
    for model_name in models:
        try:
            print(f"--- Attempting Gemini: {model_name} ---")
            llm = ChatGoogleGenerativeAI(
                model=model_name, 
                google_api_key=GOOGLE_API_KEY,
                temperature=0.3
            )
            return await func(llm)
        except Exception as e:
            last_error = e
            print(f"Gemini {model_name} failed: {e}")
    
    raise last_error or Exception("All LLM attempts failed")

class QuizRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    history: Optional[List[dict]] = None

class SummaryRequest(BaseModel):
    text: str

class GraphNode(BaseModel):
    id: str = Field(description="Unique short ID for the node")
    label: str = Field(description="Brief display label")

class GraphEdge(BaseModel):
    source: str = Field(description="The ID of the source node")
    target: str = Field(description="The ID of the target node")
    label: str = Field(description="Brief description of the relationship")

class GraphResponse(BaseModel):
    nodes: List[GraphNode] = Field(description="List of concepts")
    edges: List[GraphEdge] = Field(description="List of connections between concepts")

@app.get("/")
async def root():
    return {"message": "NeuroNotes AI API is live!", "version": "1.0.0"}

@app.post("/api/upload")
async def upload_notes(file: UploadFile = File(...)):
    temp_file_path = ""
    try:
        suffix = os.path.splitext(file.filename)[1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file_path = tmp.name
        extracted_text = extract_text_from_file(temp_file_path)
        process_lecture_text(extracted_text, source_filename=file.filename)
        log_activity("UPLOAD", {"filename": file.filename})
        return {"message": "File processed successfully", "text": extracted_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/api/generate-quiz")
async def generate_quiz(request: QuizRequest):
    async def _run(llm):
        return await generate_quiz_with_retries(request.text, llm)
    try:
        quiz_output = await call_llm_with_fallback(_run)
        log_activity("QUIZ_GENERATION", {"text_length": len(request.text)})
        if hasattr(quiz_output, 'model_dump'):
            return quiz_output.model_dump()
        return quiz_output
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz Error: {str(e)}")

@app.post("/api/summarize")
async def summarize(request: SummaryRequest):
    async def _run(llm):
        from langchain_core.prompts import PromptTemplate
        prompt = PromptTemplate.from_template("Summarize into clear bullet points:\n\n{text}")
        response = await asyncio.to_thread(llm.invoke, prompt.format(text=request.text[:8000]))
        return response.content
    try:
        summary = await call_llm_with_fallback(_run)
        log_activity("SUMMARY_GENERATION", {"text_length": len(request.text)})
        return {"summary": str(summary)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary Error: {str(e)}")

@app.post("/api/chat")
async def chat(request: ChatRequest):
    async def _run(llm):
        from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
        system_content = "You are a helpful study assistant."
        if request.context:
            system_content += f"\n\nContext:\n{request.context[:5000]}"
        messages = [SystemMessage(content=system_content)]
        if request.history:
            for msg in request.history:
                role = HumanMessage if msg["role"] == "user" else AIMessage
                messages.append(role(content=msg["content"]))
        messages.append(HumanMessage(content=request.message))
        response = await asyncio.to_thread(llm.invoke, messages)
        return response.content
    try:
        response = await call_llm_with_fallback(_run)
        return {"response": str(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/knowledge-graph")
async def extract_knowledge_graph(request: SummaryRequest):
    async def _run(llm):
        try:
            structured_llm = llm.with_structured_output(GraphResponse)
            return await asyncio.to_thread(structured_llm.invoke, f"Extract concepts and relationships from:\n{request.text[:5000]}")
        except:
            prompt = f"Extract knowledge graph nodes and edges as JSON from:\n{request.text[:4000]}"
            response = await asyncio.to_thread(llm.invoke, prompt)
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            return json.loads(content)
    try:
        graph_data = await call_llm_with_fallback(_run)
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
