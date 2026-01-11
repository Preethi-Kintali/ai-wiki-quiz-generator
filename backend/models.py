from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)

    url = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)

    summary = Column(Text, nullable=True)

    quiz = Column(Text, nullable=False)          # JSON string
    related_topics = Column(Text, nullable=True) # JSON string
    key_entities = Column(Text, nullable=True)   # JSON string

    created_at = Column(DateTime(timezone=True), server_default=func.now())
