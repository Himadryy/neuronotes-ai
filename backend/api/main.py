import os
import sys
import tempfile
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add the parent directory to sys.path so we can import other modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our independent modules
from data_processing.ingestion import extract_text_from_file
from data_processing.processor import process_lecture_text
from ai_core.quiz_generator import generate_quiz_with_retries

app = FastAPI(title="NeuroNotes AI RAG Pipeline")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup your OpenAI API key (use environment variables in production)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-api-key-here")

class QuizRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    history: Optional[List[dict]] = None

class SummaryRequest(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "NeuroNotes AI API is live!", "version": "1.0.0"}

@app.post("/api/upload")
async def upload_notes(file: UploadFile = File(...)):
    """
    Ingests an uploaded file, extracts its text, and chunks it.
    """
    temp_file_path = ""
    try:
        # Safely save the incoming UploadFile to a temporary directory
        suffix = os.path.splitext(file.filename)[1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file_path = tmp.name

        # Pass the temporary file path to the ingestion module
        extracted_text = extract_text_from_file(temp_file_path)

        # Chunk the result with the processor module
        document_chunks = process_lecture_text(extracted_text, source_filename=file.filename)

        # Return the extracted text for the UI and metadata
        return {
            "message": "File processed successfully",
            "text": extracted_text,
            "chunk_count": len(document_chunks),
        }

    except Exception as e:
        # Catch all errors and return a precise 500 response
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Safely delete the temporary file regardless of success or failure
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@app.post("/api/generate-quiz")
async def generate_quiz(request: QuizRequest):
    """
    Generates a 5-question MCQ based on the provided text.
    """
    try:
        if not request.text.strip():
            raise ValueError("Input text cannot be empty.")
            
        # Call the quiz generation function
        quiz_output = generate_quiz_with_retries(request.text, OPENAI_API_KEY)
        
        # Pydantic v2 serialization
        return quiz_output.model_dump()
        
    except Exception as e:
        # Catch all errors and return a precise 500 response
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize")
async def summarize(request: SummaryRequest):
    """
    Generates a summary of the provided text.
    """
    try:
        # For now, we'll use a simple prompt since we already have OpenAI integrated
        # In a real scenario, this would be its own module
        from langchain_openai import ChatOpenAI
        from langchain_core.prompts import PromptTemplate
        
        llm = ChatOpenAI(model="gpt-4o", openai_api_key=OPENAI_API_KEY)
        prompt = PromptTemplate.from_template("Summarize the following study material into clear, concise bullet points:\n\n{text}")
        response = llm.invoke(prompt.format(text=request.text[:8000]))
        
        return {"summary": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Basic chat endpoint for interacting with study notes.
    """
    try:
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
        
        llm = ChatOpenAI(model="gpt-4o", openai_api_key=OPENAI_API_KEY)
        
        system_content = "You are a helpful study assistant. Help the student understand their notes."
        if request.context:
            system_content += f"\n\nContext from their notes:\n{request.context[:10000]}"
            
        messages = [
            SystemMessage(content=system_content)
        ]
        
        # Add history if available
        if request.history:
            for msg in request.history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        
        messages.append(HumanMessage(content=request.message))
        
        response = llm.invoke(messages)
        
        return {"response": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
