import os
import asyncio
from typing import List, cast, Union
from pydantic import BaseModel, Field, field_validator
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
import json

load_dotenv(override=True)

# 1. Define the Pydantic Schema for strict JSON enforcement
class MCQQuestion(BaseModel):
    question: str = Field(description="The multiple choice question text.")
    options: List[str] = Field(description="A list of exactly 4 strings representing the options.")
    correct_answer: str = Field(description="The exact string matching one of the options.")
    explanation: str = Field(description="A brief explanation of why the answer is correct.")

    @field_validator('options')
    @classmethod
    def validate_options_count(cls, v: List[str]) -> List[str]:
        if len(v) != 4:
            # If the model gives fewer than 4, we try to pad it to prevent crash
            if len(v) < 4:
                while len(v) < 4:
                    v.append("N/A (Invalid Option)")
            # If the model gives more than 4, we truncate it
            elif len(v) > 4:
                v = v[:4]
        return v

class QuizOutput(BaseModel):
    quiz: List[MCQQuestion] = Field(description="A list of 5 multiple choice questions.")

    @field_validator('quiz')
    @classmethod
    def validate_quiz_length(cls, v: List[MCQQuestion]) -> List[MCQQuestion]:
        # We allow a range but prefer 5. If it's too short, we don't crash, but we log it.
        return v

async def generate_quiz_with_retries(context_text: str, llm) -> QuizOutput:
    """
    Generates a 5-question MCQ quiz from text utilizing the provided LLM (Ollama or Gemini).
    Uses ASYNC calls to prevent blocking the main thread.
    """
    
    # 2. Try with_structured_output (works for Gemini and some Ollama models)
    try:
        # We attempt to use structured output if supported
        try:
            structured_llm = llm.with_structured_output(QuizOutput)
        except:
            structured_llm = None

        prompt_template = """
        You are an expert educator. Based on the following lecture notes, generate 5 challenging 
        multiple choice questions to test the student's understanding.
        
        Notes:
        {context}
        
        STRICT RULES:
        1. You MUST provide exactly 4 options for EVERY question.
        2. Even if it's a 'Yes/No' or 'A vs B' question, you MUST invent 2 more plausible distractors.
        3. Return ONLY a valid JSON object matching the requested schema.
        """
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context"]
        )

        formatted_input = prompt.format(context=context_text[:10000]) # Limit context to 10k chars
        
        if structured_llm:
            # Use asyncio.to_thread for non-blocking execution
            result = await asyncio.to_thread(structured_llm.invoke, formatted_input)
            return cast(QuizOutput, result)
        else:
            raise Exception("Structured output not supported by this LLM instance")

    except Exception as e:
        print(f"Structured output failed: {e}. Falling back to manual JSON parsing with ainvoke...")
        
        # Manual fallback for models like Qwen that might struggle with structured output via LangChain
        prompt_template = """
        You are an expert educator. Based on the following lecture notes, generate 5 challenging 
        multiple choice questions to test the student's understanding.
        
        Notes:
        {context}
        
        STRICT RULES:
        1. You MUST provide exactly 4 options for EVERY question.
        2. Even if it's a 'Yes/No' or 'A vs B' question, you MUST invent 2 more plausible distractors to make it 4 options.
        3. You MUST return a VALID JSON object exactly in this format:
        {{
            "quiz": [
                {{
                    "question": "Question text?",
                    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                    "correct_answer": "Exact string from options",
                    "explanation": "Why it is correct"
                }},
                ... (total 5 questions)
            ]
        }}
        """
        prompt = PromptTemplate(template=prompt_template, input_variables=["context"])
        # Use asyncio.to_thread for non-blocking execution
        response = await asyncio.to_thread(llm.invoke, prompt.format(context=context_text[:8000]))
        
        content = response.content
        # Extract JSON from markdown if necessary
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        else:
            # Try to find the first '{' and last '}'
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != 0:
                content = content[start:end]
            
        data = json.loads(content)
        return QuizOutput(**data)

if __name__ == "__main__":
    print("Quiz generator module updated to support async polymorphic LLMs.")
