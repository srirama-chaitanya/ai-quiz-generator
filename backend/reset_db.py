from sqlmodel import SQLModel
from database import engine
# Important: Import models so SQLModel knows about them
from models import Quiz, Question, Option, KeyEntity, Section, RelatedTopic

def reset_db():
    print("⚠️  WARNING: This will drop ALL tables and data in the database defined by DATABASE_URL.")
    confirm = input("Are you sure? Type 'yes' to proceed: ")
    if confirm != "yes":
        print("Aborted.")
        return

    print("Dropping all tables...")
    SQLModel.metadata.drop_all(engine)
    print("Creating all tables with new schema...")
    SQLModel.metadata.create_all(engine)
    print("✅ Database reset successfully!")

if __name__ == "__main__":
    reset_db()
