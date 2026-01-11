# Deployment Guide

## 1. Frontend (Vercel)

1.  Push your code to GitHub.
2.  Go to [Vercel](https://vercel.com) and "Add New Project".
3.  Import the `ai-quiz-generator` repository.
4.  **Root Directory**: Select `frontend`.
5.  **Environment Variables**:
    *   `VITE_API_BASE_URL`: The URL of your deployed backend (see below) + `/api`.
        *   *Example*: `https://my-quiz-backend.onrender.com/api`

## 2. Backend (Render)

1.  Go to [Render](https://render.com) and create a "Web Service".
2.  Connect your GitHub repo.
3.  **Root Directory**: `backend`.
4.  **Build Command**: `pip install -r requirements.txt`.
5.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
6.  **Environment Variables**:
    *   `GOOGLE_API_KEY`: Your Gemini API key.
    *   `DATABASE_URL`: Your database connection string.
        *   *Note*: For a simple start, you can use SQLite (default), but data won't persist across restarts on free tiers. For persistence, create a "PostgreSQL" instance on Render and use its "Internal Database URL".
    *   `ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g., `https://my-quiz.vercel.app`).

## 3. Final Step

Once backend is live, copy its URL, go back to Vercel settings, update `VITE_API_BASE_URL`, and redeploy.
