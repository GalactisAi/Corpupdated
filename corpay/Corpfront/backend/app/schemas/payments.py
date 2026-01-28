from pydantic import BaseModel
from datetime import date, datetime


class PaymentDataCreate(BaseModel):
    amount_processed: float
    transaction_count: int
    date: date


class PaymentDataResponse(BaseModel):
    id: int
    amount_processed: float
    transaction_count: int
    date: date
    created_at: datetime
    
    class Config:
        from_attributes = True

