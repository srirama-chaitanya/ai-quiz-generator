from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv

load_dotenv()

# Use SQLite for local development in this environment, but configured to be easily swappable for Postgres
# DB_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")
# Fallback to sqlite for the environment where postgres might not be running
DB_URL = os.getenv("DATABASE_URL", "sqlite:///./quiz.db")

engine = create_engine(DB_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
