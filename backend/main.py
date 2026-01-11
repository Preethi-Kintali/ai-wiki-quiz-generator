from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import re

from schemas import WikiRequest
from scraper import scrape_wikipedia
from llm import generate_quiz, generate_related_topics, extract_key_entities
from database import SessionLocal, engine
from models import Base
from crud import (
    get_article_by_url,
    create_article,
    get_article_by_id,
    get_articles_paginated,
    delete_article,
    delete_all_articles
)

# ---------------- APP ----------------

app = FastAPI(title="AI Wiki Quiz Generator")

# ✅ FIXED CORS (THIS IS THE KEY CHANGE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-wiki-quiz-generator-frontend-9teu.onrender.com"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ---------------- DB ----------------

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- HELPERS ----------------

def hard_trim(text: str, limit: int = 2500) -> str:
    return text[:limit] if text else ""

def extract_json(text: str) -> dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON found in LLM response")
    return json.loads(match.group())

# ---------------- GENERATE QUIZ ----------------

@app.post("/generate-quiz")
def generate_quiz_from_wiki(
    request: WikiRequest,
    db: Session = Depends(get_db)
):
    url = str(request.url)

    if "wikipedia.org/wiki/" not in url:
        raise HTTPException(400, "Only Wikipedia URLs allowed")

    existing = get_article_by_url(db, url)
    if existing:
        return {
            "id": existing.id,
            "url": existing.url,
            "title": existing.title,
            "summary": existing.summary,
            "quiz": json.loads(existing.quiz),
            "related_topics": json.loads(existing.related_topics),
            "cached": True
        }

    data = scrape_wikipedia(url)
    raw_text = data.get("raw_text", "")
    summary = data.get("summary", "")

    article_text = hard_trim(summary + "\n\n" + raw_text)

    if len(article_text) < 300:
        raise HTTPException(400, "Insufficient article content")

    try:
        quiz_raw = generate_quiz(article_text)
        quiz_data = extract_json(quiz_raw)

        related_raw = generate_related_topics(article_text)
        related_data = extract_json(related_raw)

        entities_raw = extract_key_entities(article_text)
        entities_data = extract_json(entities_raw)

    except Exception:
        raise HTTPException(500, "LLM returned invalid output")

    quiz_list = quiz_data.get("quiz")
    if not isinstance(quiz_list, list) or len(quiz_list) < 3:
        raise HTTPException(500, "Invalid quiz structure from LLM")

    related_topics = related_data.get("related_topics", [])

    article = create_article(
        db,
        {
            "url": url,
            "title": data["title"],
            "summary": data["summary"],
            "quiz": json.dumps(quiz_list),
            "related_topics": json.dumps(related_topics),
            "key_entities": json.dumps(entities_data),
        }
    )

    return {
        "id": article.id,
        "url": article.url,
        "title": article.title,
        "summary": article.summary,
        "quiz": quiz_list,
        "related_topics": related_topics,
        "cached": False
    }

# ---------------- HISTORY ----------------

@app.get("/history")
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    articles = get_articles_paginated(db, skip, limit)

    return {
        "page": page,
        "limit": limit,
        "count": len(articles),
        "data": articles
    }

@app.delete("/history/{article_id}")
def delete_history_item(article_id: int, db: Session = Depends(get_db)):
    article = delete_article(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return {
        "message": "Quiz deleted",
        "id": article_id
    }

@app.delete("/history")
def delete_all_history(db: Session = Depends(get_db)):
    count = delete_all_articles(db)
    return {
        "message": "All quizzes deleted",
        "deleted_count": count
    }
