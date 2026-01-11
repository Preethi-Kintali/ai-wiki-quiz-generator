from pydantic import BaseModel, HttpUrl
from typing import Optional

class WikiRequest(BaseModel):
    url: HttpUrl
    mode: Optional[str] = "assisted"  # ✅ REQUIRED

class WikiScrapeResponse(BaseModel):
    url: str
    title: str
    summary: str
    sections: list[str]
    content_length: int
class ArticleBase(BaseModel):
    id: int
    url: str
    title: str
    summary: str

    class Config:
        from_attributes = True