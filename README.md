# NeuroNotes AI - RAG Pipeline

NeuroNotes AI is an AI-powered study assistant that helps students transform their notes into clear summaries, quizzes, and explanations to improve learning efficiency. This repository contains the RAG (Retrieval-Augmented Generation) pipeline backend.

## Features
- **File Ingestion:** Accepts `.txt`, `.pdf`, `.png`, and `.jpg` file formats.
- **OCR Support:** Built-in Tesseract OCR integration for extracting text from images and scanned PDFs.
- **Document Chunking:** Efficiently splits long lecture notes into manageable chunks while preserving context using LangChain.
- **Quiz Generation:** Autonomously generates challenging 5-question multiple-choice quizzes using OpenAI's structured outputs.

## Requirements
- Python 3.9+
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) installed and added to your system PATH.
- An active OpenAI API Key.

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Himadryy/neuronotes-ai.git
   cd neuronotes-ai
   ```

2. **Create a virtual environment (Optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set your API Key:**
   Export your OpenAI API key as an environment variable before running the application:
   ```bash
   # On Windows (PowerShell)
   $env:OPENAI_API_KEY="sk-your-api-key-here"

   # On macOS/Linux
   export OPENAI_API_KEY="sk-your-api-key-here"
   ```

## Running the Server

Start the FastAPI development server:
```bash
python main.py
```
The API will be available at `http://localhost:8000`. You can access the interactive Swagger documentation at `http://localhost:8000/docs`.

## API Endpoints

### `POST /upload-notes`
Upload a document or image containing study notes. The system will extract the text, clean it, and chunk it.
- **Body:** `multipart/form-data` (Attach a file under the key `file`).

### `POST /generate-quiz`
Generate a quiz based on the extracted text.
- **Body:** JSON
  ```json
  {
    "text": "Your study notes or specific topic text here."
  }
  ```