from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SocialPostCreate(BaseModel):
    author: str
    content: str
    image_url: Optional[str] = None
    post_url: Optional[str] = None  # URL of the LinkedIn post
    likes: int = 0
    comments: int = 0
    post_type: str  # 'corpay' or 'cross_border'
    time_ago: Optional[str] = None
    source: Optional[str] = 'api'  # 'api' or 'manual'


class PostFromURLRequest(BaseModel):
    post_url: str
    post_type: str  # 'corpay' or 'cross_border'


class SocialPostResponse(BaseModel):
    id: int
    author: str
    content: str
    image_url: Optional[str]
    post_url: Optional[str]
    likes: int
    comments: int
    post_type: str
    time_ago: Optional[str]
    source: Optional[str] = 'api'
    created_at: datetime
    
    class Config:
        from_attributes = True

