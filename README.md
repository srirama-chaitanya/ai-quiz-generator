# AI Wiki Quiz Generator

A full-stack application that generates interactive quizzes from Wikipedia articles using AI.

## Features

- **Generate Quiz**: Enter a Wikipedia URL to scrape content and generate a 5-10 question quiz using Google Gemini LLM.
- **Detailed Questions**: Includes difficulty levels, explanations, and multiple-choice options.
- **Related Topics**: Suggests related Wikipedia articles for further reading.
- **History**: view past quizzes.
- **Interactive UI**: Clean, card-based interface built with React and Tailwind CSS.

## Tech Stack

- **Backend**: Python, FastAPI, SQLModel (SQLAlchemy), PostgreSQL/SQLite
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **AI/LLM**: LangChain, Google Gemini Pro
- **Scraping**: BeautifulSoup4

## Documentation

- **[PROMPTS.md](PROMPTS.md)**: Contains the detailed "spoon-feeding" prompt template used to instruct the Google Gemini LLM.

## Project Structure

```
ai-quiz-generator/
├── backend/                 # FastAPI backend
│   ├── models.py           # SQLModel database schemas
│   ├── main.py             # API endpoints and logic
│   ├── llm_service.py      # LangChain + Gemini integration
│   └── requirements.txt
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/     # React components (QuizCard, Generator, etc.)
│   │   └── App.jsx         # Main application logic
│   └── tailwind.config.js
├── scripts/                 # Utility scripts
└── sample_data/            # Example outputs
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- Google Cloud API Key (for Gemini)

### Backend Setup

1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file:
   ```env
   DATABASE_URL=sqlite:///./quiz.db  # or postgresql://...
   GOOGLE_API_KEY=your_google_api_key_here
   ```
4. Run the server:
   ```bash
   python3 -m uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173`.

## Usage

1. Go to the "Generate Quiz" tab.
2. Paste a Wikipedia URL (e.g., `https://en.wikipedia.org/wiki/Albert_Einstein`).
3. Click "Generate".
4. View the generated summary, key entities, and take the quiz.
5. Visit the "History" tab to see previously generated quizzes.

## Testing

Run the included test script to verify components (requires API key):
```bash
python scripts/test_backend.py
```

## Sample Data

Check the `sample_data/` directory for example JSON outputs.
