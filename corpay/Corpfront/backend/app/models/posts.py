from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class SocialPost(Base):
    __tablename__ = "social_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    author = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String(500))
    post_url = Column(String(500))  # URL of the LinkedIn post (for manual entries)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    post_type = Column(String(50), nullable=False, index=True)  # 'corpay' or 'cross_border'
    time_ago = Column(String(50))  # Human readable time
    source = Column(String(50), default='api')  # 'api' or 'manual' - to distinguish source
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Integer, default=1)  # 1 for active, 0 for deleted

