from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Revenue(Base):
    __tablename__ = "revenue"
    
    id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Float, nullable=False)
    percentage_change = Column(Float, nullable=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RevenueTrend(Base):
    __tablename__ = "revenue_trends"
    
    id = Column(Integer, primary_key=True, index=True)
    month = Column(String(10), nullable=False, index=True)
    value = Column(Float, nullable=False)
    highlight = Column(Boolean, default=False)
    year = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RevenueProportion(Base):
    __tablename__ = "revenue_proportions"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False, unique=True, index=True)  # Fleet, Corporate, Lodging
    percentage = Column(Float, nullable=False)
    color = Column(String(7), nullable=False)  # Hex color code
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SharePrice(Base):
    __tablename__ = "share_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    price = Column(Float, nullable=False)
    change_percentage = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    api_source = Column(String(100))  # Which API was used
    created_at = Column(DateTime(timezone=True), server_default=func.now())

