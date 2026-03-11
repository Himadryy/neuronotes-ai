from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

def process_lecture_text(text: str, source_filename: str = "lecture_notes.pdf") -> List[Document]:
    """
    Splits massive strings into manageable Document chunks for Vector DB ingestion.
    
    Args:
        text (str): The raw extracted text from the document.
        source_filename (str): The name of the source file for metadata tracking.
        
    Returns:
        List[Document]: A list of LangChain Document objects with metadata.
    """
    
    # Initialize the splitter with specified constraints
    # Separators are ordered by priority: Paragraphs > Sentences > Words
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", ".", " ", ""]
    )
    
    # Create the initial chunks (returns list of strings)
    chunks = text_splitter.split_text(text)
    
    # Wrap chunks in Document objects with enriched metadata
    documents = []
    for i, chunk in enumerate(chunks):
        doc = Document(
            page_content=chunk,
            metadata={
                "source": source_filename,
                "chunk_index": i,
                "total_chunks": len(chunks)
            }
        )
        documents.append(doc)
        
    return documents

if __name__ == "__main__":
    # Example usage for verification
    sample_text = "Introduction to AI.\n\nThis is a long paragraph about machine learning basics. " * 50
    processed_docs = process_lecture_text(sample_text)
    
    print(f"Created {len(processed_docs)} document chunks.")
    if processed_docs:
        print(f"Sample metadata for first chunk: {processed_docs[0].metadata}")
