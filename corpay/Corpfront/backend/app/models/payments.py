from sqlalchemy import Column, Integer, Float, DateTime, Date
from sqlalchemy.sql import func
from app.database import Base


class PaymentData(Base):
    __tablename__ = "payment_data"
    
    id = Column(Integer, primary_key=True, index=True)
    amount_processed = Column(Float, nullable=False)
    transaction_count = Column(Integer, nullable=False)
    date = Column(Date, nullable=False, index=True, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

