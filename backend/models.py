from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime

class QuizBase(SQLModel):
    url: str = Field(index=True)
    title: str
    summary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Quiz(QuizBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    questions: List["Question"] = Relationship(back_populates="quiz")
    key_entities: List["KeyEntity"] = Relationship(back_populates="quiz")
    sections: List["Section"] = Relationship(back_populates="quiz")
    related_topics: List["RelatedTopic"] = Relationship(back_populates="quiz")

class QuestionBase(SQLModel):
    text: str
    correct_answer: str
    explanation: str
    difficulty: str  # easy, medium, hard

class Question(QuestionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    quiz_id: Optional[int] = Field(default=None, foreign_key="quiz.id")
    
    quiz: Optional[Quiz] = Relationship(back_populates="questions")
    options: List["Option"] = Relationship(back_populates="question")

class Option(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    question_id: Optional[int] = Field(default=None, foreign_key="question.id")
    
    question: Optional[Question] = Relationship(back_populates="options")

class KeyEntity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str # people, organizations, locations
    name: str
    quiz_id: Optional[int] = Field(default=None, foreign_key="quiz.id")
    
    quiz: Optional[Quiz] = Relationship(back_populates="key_entities")

class Section(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    quiz_id: Optional[int] = Field(default=None, foreign_key="quiz.id")
    
    quiz: Optional[Quiz] = Relationship(back_populates="sections")

class RelatedTopic(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    topic: str
    quiz_id: Optional[int] = Field(default=None, foreign_key="quiz.id")
    
    quiz: Optional[Quiz] = Relationship(back_populates="related_topics")

# Read Models for API Responses
class OptionRead(SQLModel):
    id: int
    text: str

class QuestionRead(QuestionBase):
    id: int
    options: List[OptionRead] = []

class KeyEntityRead(SQLModel):
    id: int
    category: str
    name: str

class SectionRead(SQLModel):
    id: int
    name: str

class RelatedTopicRead(SQLModel):
    id: int
    topic: str

class QuizRead(QuizBase):
    id: int
    questions: List[QuestionRead] = []
    key_entities: List[KeyEntityRead] = []
    sections: List[SectionRead] = []
    related_topics: List[RelatedTopicRead] = []
