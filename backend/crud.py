from sqlalchemy.orm import Session
from models import Article

def get_article_by_url(db: Session, url: str):
    return db.query(Article).filter(Article.url == url).first()

def create_article(db: Session, data: dict):
    article = Article(**data)
    db.add(article)
    db.commit()
    db.refresh(article)
    return article

def get_all_articles(db: Session):
    return db.query(Article).order_by(Article.id.desc()).all()

def get_article_by_id(db: Session, article_id: int):
    return db.query(Article).filter(Article.id == article_id).first()
def get_articles_paginated(db: Session, skip: int, limit: int):
    return (
        db.query(Article)
        .order_by(Article.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def delete_article(db: Session, article_id: int):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return None
    db.delete(article)
    db.commit()
    return article

def delete_all_articles(db: Session):
    count = db.query(Article).delete()
    db.commit()
    return count