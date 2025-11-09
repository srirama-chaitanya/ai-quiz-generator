import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
from dotenv import load_dotenv

# --- Database Connection Setup ---

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("MYSQL_DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No MYSQL_DATABASE_URL found in .env file. Please check your .env file.")

# --- THIS IS THE FIX ---
# 1. Clean the URL: Remove the "?ssl-mode=REQUIRED" part that SQLAlchemy doesn't like.
cleaned_url = DATABASE_URL.split('?')[0]

# 2. Add the correct SSL argument: Tell the driver to use SSL.
# The mysql-connector-python driver uses 'ssl_disabled=False'
connect_args = {'ssl_disabled': False}

# 3. Create the engine with the cleaned URL and the correct SSL arguments
engine = create_engine(cleaned_url, connect_args=connect_args)
# --- END OF FIX ---


# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for our models to inherit from
Base = declarative_base()

# --- Database Model Definition ---

class Quiz(Base):
    """
    SQLAlchemy model for storing quiz history.
    """
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    
    # Set to 768 to avoid index key length error
    # Set unique=False for PlanetScale/Aiven free tier compatibility
    url = Column(String(768), nullable=False, unique=False, index=True)
    
    title = Column(String(255), nullable=False)
    
    date_generated = Column(DateTime, default=datetime.utcnow)
    
    # We use 'Text' to store the entire JSON blob as a string.
    full_quiz_data = Column(Text, nullable=False)

# --- Helper Functions (for our FastAPI app) ---

def create_db_and_tables():
    """
    Creates all tables in the database (if they don't exist).
    """
    try:
        print("Creating database tables (if they don't exist)...")
        Base.metadata.create_all(bind=engine)
        print("Database tables checked/created.")
    except Exception as e:
        # This will now print the *real* error if connection fails
        print(f"Error creating database tables: {e}")

def get_db():
    """
    FastAPI dependency to get a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()