from pydantic import BaseModel
from typing import List, Dict, Optional

# This file defines the Pydantic models (schemas) that
# we will use to validate data and, most importantly,
# define the *exact* JSON structure we want our LLM to return.

class QuizItem(BaseModel):
    """
    Pydantic model for a single quiz question.
    """
    question: str
    options: List[str]  # Should be a list of 4 strings
    answer: str
    difficulty: str     # e.g., "easy", "medium", "hard"
    explanation: str

class KeyEntities(BaseModel):
    """
    Pydantic model for extracted key entities.
    """
    people: Optional[List[str]] = []
    organizations: Optional[List[str]] = []
    locations: Optional[List[str]] = []

class QuizOutput(BaseModel):
    """
    The main Pydantic model for the *entire* LLM output.
    This is the structure we will force the AI to generate.
    """
    title: str
    summary: str
    key_entities: KeyEntities
    sections: List[str]     # This will come from our scraper
    quiz: List[QuizItem]    # A list of 5-10 QuizItem objects
    related_topics: List[str]