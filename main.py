import os
import tempfile
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from pydantic import BaseModel

# Import our independent modules
from ingestion import extract_text_from_file
from processor import process_lecture_text
from quiz_generator import generate_quiz_with_retries

app = FastAPI(title="RAG Pipeline API")

class QuizRequest(BaseModel):
    text: str

@app.post("/upload-notes")
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

        # Return the total chunk count and the first chunk's preview
        return {
            "message": "File processed successfully",
            "chunk_count": len(document_chunks),
            "preview": document_chunks[0].page_content if document_chunks else ""
        }

    except Exception as e:
        # Catch all errors and return a precise 500 response
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Safely delete the temporary file regardless of success or failure
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@app.post("/generate-quiz")
async def generate_quiz(request: QuizRequest):
    """
    Generates a 5-question MCQ based on the provided text.
    """
    try:
        if not request.text.strip():
            raise ValueError("Input text cannot be empty.")
            
        # Call the quiz generation function
        quiz_output = generate_quiz_with_retries(request.text)
        
        # Pydantic v2 serialization
        return quiz_output.model_dump()
        
    except Exception as e:
        # Catch all errors and return a precise 500 response
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
