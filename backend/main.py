from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pydantic import BaseModel
from contextlib import asynccontextmanager

from database import create_db_and_tables, get_session
from models import Quiz, Question, Option, KeyEntity, Section, RelatedTopic, QuizRead
from scraper import scrape_wikipedia_article
from llm_service import generate_quiz_from_text, GeneratedQuiz

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# CORS setup
# In production, set ALLOWED_ORIGINS to your frontend domain (e.g., "https://my-quiz-app.vercel.app")
import os
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    url: str
    force_refresh: bool = False

@app.post("/api/generate", response_model=QuizRead)
def generate_quiz(request: GenerateRequest, session: Session = Depends(get_session)):
    # 1. Check if URL exists
    if not request.force_refresh:
        existing_quiz = session.exec(select(Quiz).where(Quiz.url == request.url)).first()
        if existing_quiz:
            return existing_quiz

    # 2. Scrape
    try:
        scraped_data = scrape_wikipedia_article(request.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Scraping failed: {str(e)}")

    # 3. LLM Gen
    try:
        llm_data: GeneratedQuiz = generate_quiz_from_text(scraped_data["title"], scraped_data["content"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Generation failed: {str(e)}")

    # 4. Save to DB
    # Create Quiz
    quiz = Quiz(
        url=request.url,
        title=scraped_data["title"],
        summary=llm_data.summary
    )
    session.add(quiz)
    session.commit()
    session.refresh(quiz)

    # Save Related Topics (from LLM)
    for topic in llm_data.related_topics:
        rt = RelatedTopic(topic=topic, quiz_id=quiz.id)
        session.add(rt)

    # Save Sections (from Scraper)
    for sec_name in scraped_data["sections"]:
        sec = Section(name=sec_name, quiz_id=quiz.id)
        session.add(sec)

    # Save Key Entities (from LLM)
    for name in llm_data.key_entities.people:
        session.add(KeyEntity(category="people", name=name, quiz_id=quiz.id))
    for name in llm_data.key_entities.organizations:
        session.add(KeyEntity(category="organizations", name=name, quiz_id=quiz.id))
    for name in llm_data.key_entities.locations:
        session.add(KeyEntity(category="locations", name=name, quiz_id=quiz.id))

    # Save Questions
    for q_data in llm_data.questions:
        question = Question(
            text=q_data.question,
            correct_answer=q_data.answer,
            explanation=q_data.explanation,
            difficulty=q_data.difficulty,
            quiz_id=quiz.id
        )
        session.add(question)
        session.commit()
        session.refresh(question)

        for opt_text in q_data.options:
            opt = Option(text=opt_text, question_id=question.id)
            session.add(opt)
    
    session.commit()
    session.commit()
    # Reload with all relationships loaded
    statement = (
        select(Quiz)
        .where(Quiz.id == quiz.id)
        .options(
            selectinload(Quiz.questions).selectinload(Question.options),
            selectinload(Quiz.key_entities),
            selectinload(Quiz.sections),
            selectinload(Quiz.related_topics)
        )
    )
    quiz_loaded = session.exec(statement).first()
    return quiz_loaded

@app.get("/api/history", response_model=List[QuizRead])
def get_history(session: Session = Depends(get_session)):
    statement = (
        select(Quiz)
        .options(
            selectinload(Quiz.questions).selectinload(Question.options),
            selectinload(Quiz.key_entities),
            selectinload(Quiz.sections),
            selectinload(Quiz.related_topics)
        )
    )
    quizzes = session.exec(statement).all()
    return quizzes

@app.get("/api/quiz/{quiz_id}", response_model=QuizRead)
def get_quiz(quiz_id: int, session: Session = Depends(get_session)):
    statement = (
        select(Quiz)
        .where(Quiz.id == quiz_id)
        .options(
            selectinload(Quiz.questions).selectinload(Question.options),
            selectinload(Quiz.key_entities),
            selectinload(Quiz.sections),
            selectinload(Quiz.related_topics)
        )
    )
    quiz = session.exec(statement).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
