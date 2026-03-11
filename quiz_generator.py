from typing import List
from pydantic import BaseModel, Field, field_validator
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

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
            raise ValueError("Exactly 4 options must be provided.")
        return v

class QuizOutput(BaseModel):
    quiz: List[MCQQuestion] = Field(description="A list of 5 multiple choice questions.")

    @field_validator('quiz')
    @classmethod
    def validate_quiz_length(cls, v: List[MCQQuestion]) -> List[MCQQuestion]:
        if len(v) != 5:
            raise ValueError("Exactly 5 questions must be generated.")
        return v

def generate_quiz_with_retries(context_text: str, openai_api_key: str) -> QuizOutput:
    """
    Generates a 5-question MCQ quiz from text utilizing modern LLM structured outputs.
    This natively handles retries and ensures valid JSON structure automatically.
    """
    
    # Initialize the LLM
    llm = ChatOpenAI(
        model="gpt-4o", 
        temperature=0.7, 
        openai_api_key=openai_api_key
    )

    # 2. Use modern LangChain with_structured_output (Native retry + Function Calling)
    structured_llm = llm.with_structured_output(QuizOutput)
    
    # 3. Create the Prompt
    prompt_template = """
    You are an expert educator. Based on the following lecture notes, generate 5 challenging 
    multiple choice questions to test the student's understanding.
    
    Notes:
    {context}
    """
    
    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["context"]
    )

    # Prepare the input
    formatted_input = prompt.format(context=context_text)
    
    # Execute generation - returning the Pydantic object directly
    return structured_llm.invoke(formatted_input)

if __name__ == "__main__":
    # Mock usage
    API_KEY = "sk-..." # User should provide their key
    NOTES = "The process of photosynthesis converts light energy into chemical energy..."
    
    # In a real scenario, call:
    # quiz = generate_quiz_with_retries(NOTES, API_KEY)
    # print(quiz.model_dump_json(indent=2))
    print("Quiz generator module initialized with Pydantic v2 schema and modern structured output.")
