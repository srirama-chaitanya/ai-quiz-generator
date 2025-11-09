import json
import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

# Import all our components
import database
from database import get_db, Quiz
from scraper import scrape_wikipedia
from llm_quiz_generator import generate_quiz_from_text
import models

# --- 1. Initialize FastAPI App ---

app = FastAPI(
    title="AI Wiki Quiz Generator",
    description="API for generating quizzes from Wikipedia articles.",
    version="1.0.0"
)

# --- 2. Set up CORS (Cross-Origin Resource Sharing) ---
origins = ["*"] # Allow all origins for development

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# --- 3. Create Database Tables on Startup ---
@app.on_event("startup")
def on_startup():
    database.create_db_and_tables()

# --- 4. Define Request Models ---
class GenerateRequest(BaseModel):
    url: str

# --- 5. Define API Endpoints ---

@app.post("/generate_quiz", response_model=models.QuizOutput)
def create_quiz(request: GenerateRequest, db: Session = Depends(get_db)):
    """
    The main endpoint.
    Takes a URL, scrapes it, generates a quiz, and saves it to the DB.
    *** NOW WITH CACHING ***
    """
    url = request.url
    print(f"Received request to generate quiz for URL: {url}")

    # --- OPTIMIZATION 1: CACHING ---
    # Check if this URL is already in our database
    try:
        existing_quiz = db.query(Quiz).filter(Quiz.url == url).first()
        if existing_quiz:
            print("--- CACHE HIT: Returning existing quiz from DB. ---")
            # Just parse the stored JSON and return it
            return json.loads(existing_quiz.full_quiz_data)
    except Exception as e:
        # If DB query fails, just log it and proceed.
        print(f"Cache check failed: {e}")
    
    print("--- CACHE MISS: Generating new quiz. ---")
    # --- END OF OPTIMIZATION ---

    # Step 1: Scrape the article
    try:
        scraped_data = scrape_wikipedia(url)
        if not scraped_data or not scraped_data["clean_text"]:
            raise HTTPException(status_code=400, detail="Scraping failed. Could not extract text.")
        print("Scraping successful.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping error: {e}")

    # Step 2: Generate the quiz using the LLM
    try:
        quiz_data_model = generate_quiz_from_text(scraped_data)
        if not quiz_data_model:
            raise HTTPException(status_code=500, detail="LLM failed to generate quiz.")
        print("LLM generation successful.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")

    # Step 3: Save to the database
    try:
        # Convert the Pydantic model back to a JSON string for storage
        json_data_string = json.dumps(quiz_data_model)
        
        new_quiz_entry = Quiz(
            url=url,
            title=quiz_data_model["title"],
            full_quiz_data=json_data_string
        )
        db.add(new_quiz_entry)
        db.commit()
        db.refresh(new_quiz_entry)
        print("Quiz saved to database.")
        
        return json.loads(json_data_string) 
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

# --- Response model for the History list ---
class HistoryItem(BaseModel):
    id: int
    url: str
    title: str
    date_generated: str

@app.get("/history", response_model=List[HistoryItem])
def get_history(db: Session = Depends(get_db)):
    """
    Fetches a list of all previously generated quizzes.
    """
    try:
        quizzes = db.query(Quiz).order_by(Quiz.date_generated.desc()).all()
        return [
            HistoryItem(
                id=q.id,
                url=q.url,
                title=q.title,
                date_generated=q.date_generated.isoformat()
            ) for q in quizzes
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {e}")


@app.get("/quiz/{quiz_id}")
def get_quiz_details(quiz_id: int, db: Session = Depends(get_db)):
    """
    Fetches the full JSON data for a single quiz from the database.
    """
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        quiz_data = json.loads(quiz.full_quiz_data)
        return quiz_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quiz details: {e}")


@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Wiki Quiz Generator API"}