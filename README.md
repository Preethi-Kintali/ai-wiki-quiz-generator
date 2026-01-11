🧠 AI Wiki Quiz Generator

An end-to-end web application that accepts a Wikipedia article URL and automatically generates a multiple-choice quiz using a Large Language Model (LLM).
The system scrapes Wikipedia pages, generates quizzes grounded in article content, stores data in a database, and provides a clean UI for quiz generation and history viewing.

🚀 Features
✅ Tab 1 – Generate Quiz

Accepts any valid Wikipedia article URL

Scrapes article content using BeautifulSoup

Uses an LLM (Gemini / HuggingFace free tier) to generate:

5–10 multiple-choice questions

4 options (A–D) per question

Correct answer

Short explanation

Difficulty level (easy / medium / hard)

Suggests related Wikipedia topics

Displays quiz in a card-based UI

Stores all data in PostgreSQL

📚 Tab 2 – Quiz History

Lists all previously generated quizzes

Displays:

Article title

Summary

Details Modal to view full quiz

Delete individual quizzes

Delete all quizzes

🎯 Bonus Features

Quiz caching (prevents duplicate generation)

Error handling for invalid URLs and LLM failures

Clean and minimal UI

LLM prompt grounding to minimize hallucination

🧱 Tech Stack
Backend

Python

FastAPI

PostgreSQL

SQLAlchemy

BeautifulSoup

Frontend

React

Fetch API

LLM

Gemini Free Tier / HuggingFace Free Tier

Prompt-based generation (no Wikipedia API used)

📂 Project Structure
AI-wiki-quiz-generator/
│
├── backend/
│   ├── main.py
│   ├── llm.py
│   ├── scraper.py
│   ├── prompts.py
│   ├── database.py
│   ├── models.py
│   ├── crud.py
│   ├── schemas.py
│   ├── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── api.js
│   ├── App.jsx
│   ├── History.jsx
│   ├── main.jsx
│
├── sample_data/
│   ├── alan_turing.json
│   ├── internet.json
│
├── screenshots/
│   ├── generate_quiz.png
│   ├── history.png
│   ├── details_modal.png
│
├── README.md

🧪 Sample API Output
{
  "id": 1,
  "url": "https://en.wikipedia.org/wiki/Alan_Turing",
  "title": "Alan Turing",
  "summary": "Alan Turing was a British mathematician and computer scientist...",
  "key_entities": {
    "people": ["Alan Turing", "Alonzo Church"],
    "organizations": ["University of Cambridge", "Bletchley Park"],
    "locations": ["United Kingdom"]
  },
  "quiz": [
    {
      "question": "Where did Alan Turing study?",
      "options": [
        "Harvard University",
        "Cambridge University",
        "Oxford University",
        "Princeton University"
      ],
      "answer": "Cambridge University",
      "difficulty": "easy",
      "explanation": "Mentioned in the Early life section."
    }
  ],
  "related_topics": [
    "Cryptography",
    "Enigma machine",
    "Computer science history"
  ]
}


🛠️ How to Run Locally
Backend
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload


Backend runs at:

http://127.0.0.1:8000

Frontend
cd frontend
npm install
npm run dev


Frontend runs at:

http://localhost:5173

📦 sample_data Folder

Contains example Wikipedia URLs tested and their corresponding API JSON outputs:

alan_turing.json

internet.json

🖼️ Screenshots

Screenshots included:

Quiz generation page (Tab 1)

History view (Tab 2)

Details modal

🎥 Screen Recording

A complete screen recording demonstrates:

Quiz generation

History listing

Details modal

Delete and Delete All functionality

📎 Link: (to be added)

🌍 Deployment
Backend

Hosted on Render

Frontend

Hosted on Vercel

🔗 Submission Links

GitHub Repository:
👉 https://github.com/Ypreethi-kintali/ai-wiki-quiz-generator

Deployed Application:
👉 https://your-frontend.vercel.app

(or local demo shown in screen recording)

Screen Recording:
👉 https://drive.google.com/file/d/1CwhhKiAZzJeuzJW5Vbk9i8pbcmtrVw6E/view?usp=sharing