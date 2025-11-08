import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
from dotenv import load_dotenv

# --- Database Connection Setup ---

# Load environment variables from .env file
# This will read the MYSQL_DATABASE_URL we set up
load_dotenv()

DATABASE_URL = os.getenv("MYSQL_DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No MYSQL_DATABASE_URL found in .env file. Please check your .env file.")

# Create the SQLAlchemy engine to connect to your MySQL database
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
# This SessionLocal is what we'll use to talk to the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for our models to inherit from
Base = declarative_base()

# --- Database Model Definition ---

class Quiz(Base):
    """
    SQLAlchemy model for storing quiz history.
    This class will be mapped to a table named 'quizzes'.
    """
    __tablename__ = "quizzes"

    # Define the columns for our table
    id = Column(Integer, primary_key=True, index=True)
    
    url = Column(String(1024), nullable=False, unique=True, index=True)
    
    title = Column(String(255), nullable=False)
    
    date_generated = Column(DateTime, default=datetime.utcnow)
    
    # This is the CRUCIAL field.
    # We use 'Text' (which is unlimited in length) to store the 
    # entire JSON blob from the AI as a single string.
    full_quiz_data = Column(Text, nullable=False)

# --- Helper Functions (for our FastAPI app) ---

def create_db_and_tables():
    """
    Creates all tables in the database (if they don't exist).
    We will call this function once from main.py when our app starts.
    """
    try:
        print("Creating database tables (if they don't exist)...")
        Base.metadata.create_all(bind=engine)
        print("Database tables checked/created.")
    except Exception as e:
        print(f"Error creating database tables: {e}")

def get_db():
    """
    This is a FastAPI dependency.
    It creates a new database session for each request and closes it
    when the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()