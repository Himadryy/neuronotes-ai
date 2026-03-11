import os
import sys
import tempfile
import shutil
import json
import time
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

# Setup your Gemini API key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

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

async def call_gemini_with_fallback(func, *args, **kwargs):
    """
    Tries multiple models and implements retries to bypass 429 errors.
    """
    import time
    # Priority list of models to try
    models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-flash-latest"]
    last_error = None
    
    for model_name in models:
        for attempt in range(2):
            try:
                return await func(model_name)
            except Exception as e:
                last_error = e
                err_msg = str(e)
                if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                    print(f"Quota hit for {model_name}, retrying in 2s...")
                    time.sleep(2)
                    continue
                if "404" in err_msg or "not found" in err_msg:
                    break # Try next model
                raise e 
    raise last_error

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

@app.get("/api/activities")
async def get_activities():
    if os.path.exists(ACTIVITY_LOG_PATH):
        with open(ACTIVITY_LOG_PATH, "r") as f:
            return json.load(f)
    return []

@app.post("/api/upload")
async def upload_notes(file: UploadFile = File(...)):
    temp_file_path = ""
    try:
        suffix = os.path.splitext(file.filename)[1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file_path = tmp.name
        extracted_text = extract_text_from_file(temp_file_path)
        document_chunks = process_lecture_text(extracted_text, source_filename=file.filename)
        log_activity("UPLOAD", {"filename": file.filename, "chunks": len(document_chunks)})
        return {"message": "File processed successfully", "text": extracted_text, "chunk_count": len(document_chunks)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/api/generate-quiz")
async def generate_quiz(request: QuizRequest):
    async def _run(model_name):
        return generate_quiz_with_retries(request.text, GOOGLE_API_KEY)
    try:
        quiz_output = await call_gemini_with_fallback(_run)
        log_activity("QUIZ_GENERATION", {"text_length": len(request.text)})
        if hasattr(quiz_output, 'model_dump'):
            return quiz_output.model_dump()
        return {"quiz": quiz_output}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Quiz Error: {str(e)}")

@app.post("/api/summarize")
async def summarize(request: SummaryRequest):
    async def _run(model_name):
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.prompts import PromptTemplate
        llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=GOOGLE_API_KEY)
        prompt = PromptTemplate.from_template("Summarize the following study material into clear, concise bullet points:\n\n{text}")
        return llm.invoke(prompt.format(text=request.text[:8000]))
    try:
        response = await call_gemini_with_fallback(_run)
        summary_content = response.content
        if isinstance(summary_content, list):
            summary_content = " ".join([item.get("text", "") if isinstance(item, dict) else str(item) for item in summary_content])
        log_activity("SUMMARY_GENERATION", {"text_length": len(request.text)})
        return {"summary": str(summary_content)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Summary Error: {str(e)}")

@app.post("/api/chat")
async def chat(request: ChatRequest):
    async def _run(model_name):
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
        llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=GOOGLE_API_KEY)
        system_content = "You are a helpful study assistant. Help the student understand their notes."
        if request.context:
            system_content += f"\n\nContext from their notes:\n{request.context[:10000]}"
        messages = [SystemMessage(content=system_content)]
        if request.history:
            for msg in request.history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        messages.append(HumanMessage(content=request.message))
        return llm.invoke(messages)
    try:
        response = await call_gemini_with_fallback(_run)
        chat_content = response.content
        if isinstance(chat_content, list):
            chat_content = " ".join([item.get("text", "") if isinstance(item, dict) else str(item) for item in chat_content])
        return {"response": str(chat_content)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/knowledge-graph")
async def extract_knowledge_graph(request: SummaryRequest):
    async def _run(model_name):
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=GOOGLE_API_KEY, temperature=0.2)
        structured_llm = llm.with_structured_output(GraphResponse)
        prompt = f"Extract important concepts and relationships from:\n{request.text[:5000]}"
        return structured_llm.invoke(prompt)
    try:
        graph_data = await call_gemini_with_fallback(_run)
        log_activity("GRAPH_EXTRACTION", {"text_length": len(request.text)})
        return graph_data
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Graph Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
