from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SocialPostCreate(BaseModel):
    author: str
    content: str
    image_url: Optional[str] = None
    likes: int = 0
    comments: int = 0
    post_type: str  # 'corpay' or 'cross_border'
    time_ago: Optional[str] = None


class SocialPostResponse(BaseModel):
    id: int
    author: str
    content: str
    image_url: Optional[str]
    likes: int
    comments: int
    post_type: str
    time_ago: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

