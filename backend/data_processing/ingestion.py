import os
import re
import io
import unicodedata
from typing import Dict

import pytesseract
from PIL import Image
from langchain_community.document_loaders import PyMuPDFLoader
import fitz  # PyMuPDF

def clean_extracted_text(text: str) -> str:
    """
    Cleans extracted text by removing null bytes, normalizing unicode,
    and collapsing excessive whitespace.
    """
    if not text:
        return ""
    
    text = text.replace("\x00", "")
    text = unicodedata.normalize("NFKC", text)
    text = "".join(ch for ch in text if unicodedata.category(ch)[0] != "C" or ch in "\n\r\t")
    text = re.sub(r"\s+", " ", text).strip()
    
    return text

def perform_ocr_on_pdf(file_path: str) -> str:
    """
    Fallback for scanned PDFs: Converts pages to images and runs OCR.
    """
    doc = fitz.open(file_path)
    ocr_results = []
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        ocr_results.append(pytesseract.image_to_string(img))
        
    return "\n".join(ocr_results)

def extract_text_from_file(file_path: str) -> str:
    """
    Extracts text from .txt, .pdf, .png, and .jpg files given a file path.
    Returns cleaned text string.
    """
    extension = os.path.splitext(file_path)[1].lower()
    extracted_text = ""

    # 1. Handle Text Files
    if extension == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            extracted_text = f.read()

    # 2. Handle PDF Files
    elif extension == ".pdf":
        # Attempt standard extraction with PyMuPDFLoader
        loader = PyMuPDFLoader(file_path)
        docs = loader.load()
        extracted_text = " ".join([doc.page_content for doc in docs])
        
        # If extraction is empty or mostly whitespace, it's likely a scan
        if len(extracted_text.strip()) < 50:
            extracted_text = perform_ocr_on_pdf(file_path)

    # 3. Handle Image Files
    elif extension in [".png", ".jpg", ".jpeg"]:
        img = Image.open(file_path)
        extracted_text = pytesseract.image_to_string(img)

    else:
        raise ValueError(f"Unsupported file format: {extension}. Supported: .txt, .pdf, .png, .jpg")

    # Final Cleaning
    cleaned_text = clean_extracted_text(extracted_text)
    
    if not cleaned_text:
        raise ValueError("No text could be extracted from the file.")

    return cleaned_text
