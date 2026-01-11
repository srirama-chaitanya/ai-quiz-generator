import os
from dotenv import load_dotenv

load_dotenv()

import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict

# Define Pydantic models for the structure we want from LLM
class QuizOption(BaseModel):
    text: str = Field(description="The option text")

class QuizQuestion(BaseModel):
    question: str = Field(description="The question text")
    options: List[str] = Field(description="List of 4 options", min_items=4, max_items=4)
    answer: str = Field(description="The correct answer text (must match one of the options exactly)")
    difficulty: str = Field(description="Difficulty level: easy, medium, or hard")
    explanation: str = Field(description="Short explanation of the answer")

class KeyEntities(BaseModel):
    people: List[str] = Field(description="List of key people mentioned")
    organizations: List[str] = Field(description="List of organizations mentioned")
    locations: List[str] = Field(description="List of locations mentioned")

class GeneratedQuiz(BaseModel):
    summary: str = Field(description="Brief summary of the article (2-3 sentences)")
    key_entities: KeyEntities = Field(description="Key entities extracted from the text")
    questions: List[QuizQuestion] = Field(description="List of 5-10 generated quiz questions")
    related_topics: List[str] = Field(description="List of 3-5 suggested related Wikipedia topics")

# Initialize LLM
# Note: User must provide GOOGLE_API_KEY in .env
llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.7, google_api_key=os.getenv("GOOGLE_API_KEY"))

parser = PydanticOutputParser(pydantic_object=GeneratedQuiz)

PROMPT_TEMPLATE = """
You are a WORLD-CLASS EDUCATIONAL CONTENT CREATOR and EXPERT EXAMINER.
Your goal is to create a flawless, high-quality quiz based *strictly* on the provided text.

---
### INPUT TEXT
**Title**: "{title}"
**Content**:
{content}
---

### YOUR MISSION
Analyze the text above and generate a JSON output containing the following:

#### 1. SUMMARY
- Write a concise, engaging summary of the article.
- Maximum 3 sentences.
- Focus on the "who, what, and why".

#### 2. KEY ENTITIES
- Extract up to 5 specific names for each category:
  - **People**: Important figures mentioned.
  - **Organizations**: Companies, groups, institutions.
  - **Locations**: Cities, countries, specific places.
- *Constraint*: If none found, return an empty list. Do not hallucinate.

#### 3. QUIZ QUESTIONS (The Core Task)
Generate 5 to 10 multiple-choice questions. 
**CRITICAL RULES FOR QUESTIONS:**
1.  **SOURCE OF TRUTH**: Every single question must be answerable using *only* the provided text. Do not use external knowledge.
2.  **NO AMBIGUITY**: The correct answer must be indisputably correct based on the text.
3.  **DISTRACTORS**: The 3 wrong options must be:
    -   Plausible (related to the topic).
    -   Grammatically consistent with the question.
    -   Clearly incorrect according to the text.
4.  **BANNED PHRASES**: Do NOT use "All of the above", "None of the above", or "A and B".
5.  **DIFFICULTY MIX**:
    -   *Easy*: Direct fact retrieval (e.g., "In what year...?").
    -   *Medium*: Synthesis of two facts or understanding a concept.
    -   *Hard*: Inference or distinguishing between similar concepts.

#### 4. RELATED TOPICS
- Suggest 3-5 specific Wikipedia-style topics for further reading.
- Must be relevant to the article content.

### QUALITY CONTROL CHECKLIST (Internal Monologue)
- Did I double-check that the correct answer is explicitly supported by the text?
- Are the distractors not accidentally correct?
- Is the JSON structure valid?

{format_instructions}
"""

prompt = PromptTemplate(
    template=PROMPT_TEMPLATE,
    input_variables=["title", "content"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

def generate_quiz_from_text(title: str, content: str):
    formatted_prompt = prompt.format(title=title, content=content)
    try:
        # Invoke LLM
        response = llm.invoke(formatted_prompt)
        
        content_text = response.content
        if isinstance(content_text, list):
             # Join text parts if it's a list (multimodal response structure)
             content_text = "".join([part if isinstance(part, str) else part.get('text', '') for part in content_text])
        
        # Parse output
        parsed_data = parser.parse(content_text)
        return parsed_data
    except Exception as e:
        print(f"Error generating quiz: {e}")
        # Return empty/safe structure or re-raise
        raise e
