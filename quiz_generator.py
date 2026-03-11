import os
from typing import List, Any, cast
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

# Load environment variables from the .env file
load_dotenv()


# 1. Define the Pydantic Schema for strict JSON enforcement
class MCQQuestion(BaseModel):
    question: str = Field(description="The multiple choice question text.")
    options: List[str] = Field(
        description="A list of exactly 4 strings representing the options.",
        min_length=4,
        max_length=4,
    )
    correct_answer: str = Field(
        description="The exact string matching one of the options."
    )
    explanation: str = Field(
        description="A brief explanation of why the answer is correct."
    )


class QuizOutput(BaseModel):
    quiz: List[MCQQuestion] = Field(
        description="A list of exactly 5 multiple choice questions.",
        min_length=5,
        max_length=5,
    )


def generate_quiz_with_retries(context_text: str) -> QuizOutput:
    """
    Generates a 5-question MCQ quiz from text utilizing modern LLM structured outputs.
    This natively handles retries and ensures valid JSON structure automatically.
    """

    # Ensure the API key is present in the environment
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        raise ValueError("OPENAI_API_KEY is not set in the environment or .env file.")

    # Initialize the LLM securely (ChatOpenAI automatically uses the OPENAI_API_KEY env var)
    llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

    # 2. Use modern LangChain with_structured_output to enforce strict JSON schema
    # strict=True forces OpenAI to adhere perfectly to the Pydantic JSON schema
    structured_llm = llm.with_structured_output(
        QuizOutput, method="json_schema", strict=True
    )

    # 3. Create the Prompt
    prompt_template = """
    You are an expert educator. Based on the following lecture notes, generate 5 challenging 
    multiple choice questions to test the student's understanding.
    
    Notes:
    {context}
    """

    prompt = PromptTemplate(template=prompt_template, input_variables=["context"])

    # Prepare the input
    formatted_input = prompt.format(context=context_text)

    # Execute generation - returning the Pydantic object directly
    try:
        result = structured_llm.invoke(formatted_input)
        return cast(QuizOutput, result)
    except Exception as e:
        # Provide a clearer error message if the LLM output fails validation
        raise ValueError(f"Failed to generate valid quiz: {str(e)}")


if __name__ == "__main__":
    NOTES = (
        "The process of photosynthesis converts light energy into chemical energy..."
    )
    print(
        "Quiz generator module initialized with Pydantic v2 schema, dotenv, and modern strict structured output."
    )
