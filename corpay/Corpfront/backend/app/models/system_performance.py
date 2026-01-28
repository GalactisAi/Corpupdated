from sqlalchemy import Column, Integer, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base


class SystemPerformance(Base):
    __tablename__ = "system_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    uptime_percentage = Column(Float, nullable=False)
    success_rate = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

