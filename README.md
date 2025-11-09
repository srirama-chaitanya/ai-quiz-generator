# 🧠 AI Wiki Quiz Generator

A full-stack application that **automatically generates educational quizzes** from any Wikipedia article using **Google Gemini AI**.  
Just paste a Wikipedia URL, and the app will fetch the content, generate an intelligent quiz, and let you take it interactively — all in one place!

---

## ✨ Features

- 🧩 **AI Quiz Generation** — Paste any valid Wikipedia URL to get a customized quiz instantly.  
- 🧠 **Interactive Quiz Mode** — Take the quiz in the app, select answers, and view your score in real-time.  
- 📜 **Quiz History** — Access all previously generated quizzes anytime from the “History” tab.  
- ⚡ **Database Caching** — Avoid redundant API calls; cached quizzes are served directly from MySQL.  
- ✅ **Smart URL Validation** — The frontend ensures the input is a valid Wikipedia link before sending it to the backend.  

---

## 🛠️ Tech Stack

### **Backend**
- 🚀 [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python web framework  
- 🧩 [SQLAlchemy](https://www.sqlalchemy.org/) — ORM for database interaction  
- 🧠 [LangChain](https://www.langchain.com/) — Framework for working with LLMs  
- 🤖 [Google Gemini](https://ai.google/) — Large Language Model used for quiz generation  
- 🧮 [MySQL](https://www.mysql.com/) — Persistent data storage  
- 🕸️ [BeautifulSoup4](https://pypi.org/project/beautifulsoup4/) + [LXML](https://pypi.org/project/lxml/) — Web scraping tools

### **Frontend**
- ⚛️ [React (Vite)](https://vitejs.dev/) — Lightning-fast frontend framework  
- 🎨 [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling  
- 🔗 [Axios](https://axios-http.com/) — HTTP client for API communication  

---

## ⚙️ Architecture Overview

```text
┌────────────────────┐        ┌─────────────────────────────┐
│      Frontend      │        │           Backend           │
│  React + Tailwind  │  --->  │ FastAPI + Gemini + MySQL DB │
│    (Vite Dev)      │        │  (LangChain Integration)    │
└────────────────────┘        └─────────────────────────────┘
             ▲
             │
     User Inputs Wikipedia URL
🚀 Getting Started
You will need three terminals running simultaneously — one each for MySQL, FastAPI, and React.

Terminal 1 — Start MySQL Server
Make sure MySQL is installed and running.

bash
Copy code
# On WSL / Linux
sudo service mysql start
Terminal 2 — Start the Backend (FastAPI)
bash
Copy code
# 1️⃣ Navigate to the backend folder
cd backend

# 2️⃣ Create and activate a virtual environment
python3.10 -m venv venv
source venv/bin/activate

# 3️⃣ Install dependencies
pip install -r requirements.txt

# 4️⃣ Set up your environment variables
# Create a file named `.env` in this directory with the following content:
GOOGLE_API_KEY="YOUR_API_KEY_HERE"
MYSQL_DATABASE_URL="mysql+mysqlconnector://YOUR_MYSQL_USER:YOUR_MYSQL_PASSWORD@localhost/quiz_db"

# 5️⃣ Run the backend server
uvicorn main:app --reload
✅ The FastAPI backend should now be running at:
👉 http://127.0.0.1:8000

Terminal 3 — Start the Frontend (React)
bash
Copy code
# 1️⃣ Navigate to the frontend folder
cd frontend

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start the development server
npm run dev
✅ The React frontend will be available at:
👉 http://localhost:5173

🧩 Example Workflow
Open the frontend in your browser.

Paste a valid Wikipedia URL (e.g., https://en.wikipedia.org/wiki/Artificial_intelligence).

Click “Generate Quiz”.

The app will:

Scrape the article using BeautifulSoup.

Send text to the Gemini model through LangChain.

Generate and display the quiz instantly.

View past quizzes anytime under the History tab.

🧱 Database Schema (Simplified)
Table Name	Description
quiz	Stores quiz questions, answers, and metadata
history	Tracks previously generated quizzes by URL
cache	Holds AI-generated content for quick retrieval

📁 Project Structure
text
Copy code
AI-Wiki-Quiz-Generator/
│
├── backend/
│   ├── main.py               # FastAPI entry point
│   ├── database.py           # SQLAlchemy setup
│   ├── models.py             # ORM models
│   ├── schemas.py            # Pydantic schemas
│   ├── routes/               # API endpoints
│   ├── services/             # Quiz generation logic
│   ├── utils/                # Helper functions
│   └── .env                  # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page-level views
│   │   ├── services/         # Axios API calls
│   │   └── App.jsx           # Main entry file
│   ├── package.json
│   └── vite.config.js
│
└── README.md
🧠 Future Enhancements
🗂️ Add user authentication and profiles

🌍 Support for non-English Wikipedia pages

📊 Export quiz performance analytics

🎤 Add voice-based quiz reading

🤝 Contributing
Contributions are welcome!
Feel free to open issues or submit pull requests for improvements.

📜 License
This project is licensed under the MIT License.
See the LICENSE file for more details.

💡 Acknowledgements
Wikipedia — Source of all educational content

LangChain — For simplifying LLM integration

Google Gemini — For generating intelligent quiz questions

FastAPI & React — For powering the app’s backend and frontend