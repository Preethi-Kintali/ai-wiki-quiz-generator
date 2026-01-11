from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json

from database import SessionLocal, engine
from models import Base, Article
from schemas import WikiRequest
from scraper import scrape_wikipedia
from llm import generate_quiz, generate_related_topics, extract_key_entities

# ---------------- APP ----------------

app = FastAPI(title="AI Wiki Quiz Generator")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-wiki-quiz-generator-frontend-9teu.onrender.com",
    ],
    allow_credentials=True,
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

def hard_trim(text: str, limit: int = 2500) -> str:
    return text[:limit] if text else ""

# ---------------- GENERATE QUIZ ----------------
@app.post("/generate-quiz")
def generate_quiz_from_wiki(
    request: WikiRequest,
    db: Session = Depends(get_db)
):
    url = str(request.url).strip()


    if "wikipedia.org/wiki/" not in url:
        raise HTTPException(400, "Only Wikipedia URLs allowed")

    # ---------- CACHE ----------
    existing = db.query(Article).filter(Article.url == url).first()
    if existing:
        return {
            "id": existing.id,
            "url": existing.url,
            "title": existing.title,
            "summary": existing.summary,
            "quiz": json.loads(existing.quiz),
            "related_topics": json.loads(existing.related_topics),
            "cached": True,
        }

    # ---------- SCRAPE ----------
    data = scrape_wikipedia(url)
    article_text = hard_trim(
        (data.get("summary", "") + "\n" + data.get("raw_text", ""))
    )

    if len(article_text) < 300:
        raise HTTPException(400, "Insufficient article content")

    # ---------- LLM ----------
    try:
        quiz_data = json.loads(generate_quiz(article_text))
        related_data = json.loads(generate_related_topics(article_text))
        entities_data = json.loads(extract_key_entities(article_text))
    except Exception as e:
        raise HTTPException(500, f"LLM failed: {e}")

    quiz_list = quiz_data.get("quiz")
    if not isinstance(quiz_list, list) or not quiz_list:
        raise HTTPException(500, "Invalid quiz returned by LLM")

    # ---------- SAVE ----------
    article = Article(
        url=url,
        title=data["title"],
        summary=data["summary"],
        quiz=json.dumps(quiz_list),
        related_topics=json.dumps(related_data.get("related_topics", [])),
        key_entities=json.dumps(entities_data),
    )

    db.add(article)
    db.commit()
    db.refresh(article)

    return {
        "id": article.id,
        "url": article.url,
        "title": article.title,
        "summary": article.summary,
        "quiz": quiz_list,
        "related_topics": related_data.get("related_topics", []),
        "cached": False,
    }

# ---------------- HISTORY ----------------
@app.get("/history")
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * limit
    items = (
        db.query(Article)
        .order_by(Article.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "page": page,
        "limit": limit,
        "data": items,
    }

@app.delete("/history/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db)):
    item = db.query(Article).filter(Article.id == article_id).first()
    if not item:
        raise HTTPException(404, "Quiz not found")

    db.delete(item)
    db.commit()
    return {"message": "Quiz deleted", "id": article_id}

@app.delete("/history")
def delete_all_articles(db: Session = Depends(get_db)):
    count = db.query(Article).delete()
    db.commit()
    return {"message": "All quizzes deleted", "deleted_count": count}
