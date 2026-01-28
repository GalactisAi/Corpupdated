from pydantic import BaseModel
from typing import Optional


class NewsroomItemResponse(BaseModel):
    """Lightweight representation of a Corpay newsroom article."""

    title: str
    url: str
    date: Optional[str] = None
    category: Optional[str] = None
    excerpt: Optional[str] = None

