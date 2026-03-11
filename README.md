# NeuroNotes AI - RAG Pipeline

NeuroNotes AI is an AI-powered study assistant that helps students transform their notes into clear summaries, quizzes, and explanations to improve learning efficiency.

## Features
- **File Ingestion:** Accepts `.txt`, `.pdf`, `.png`, and `.jpg` file formats.
- **OCR Support:** Built-in Tesseract OCR integration for extracting text from images and scanned PDFs.
- **Document Chunking:** Efficiently splits long lecture notes into manageable chunks while preserving context using LangChain.
- **Quiz Generation:** Autonomously generates challenging 5-question multiple-choice quizzes using Google's Gemini models.
- **AI Chat:** Interactive chat tutor that uses your uploaded notes as context.
- **Modern UI:** Premium dark-themed dashboard built with Next.js and Tailwind CSS.

## Requirements
- Python 3.9+
- Node.js 18+
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) installed and added to your system PATH.
- An active Google Gemini API Key.

## Setup Instructions

### Backend (Python)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Himadryy/neuronotes-ai.git
   cd neuronotes-ai
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set your API Key:**
   ```bash
   # On macOS/Linux
   export GOOGLE_API_KEY="your-gemini-api-key"
   ```

5. **Start the FastAPI server:**
   ```bash
   python main.py
   ```

### Frontend (Next.js)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### `POST /api/upload`
Upload a document or image. Returns extracted text and chunk metadata.

### `POST /api/generate-quiz`
Generate a quiz based on text.

### `POST /api/chat`
Chat with AI using uploaded notes as context.

### `POST /api/summarize`
Generate a concise summary of your notes.
