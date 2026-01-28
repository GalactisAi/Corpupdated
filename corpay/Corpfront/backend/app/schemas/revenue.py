from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RevenueResponse(BaseModel):
    total_amount: float
    percentage_change: float
    last_updated: datetime
    
    class Config:
        from_attributes = True


class RevenueTrendResponse(BaseModel):
    month: str
    value: float
    highlight: bool
    
    class Config:
        from_attributes = True


class RevenueProportionResponse(BaseModel):
    category: str
    percentage: float
    color: str
    
    class Config:
        from_attributes = True


class SharePriceResponse(BaseModel):
    price: float
    change_percentage: float
    timestamp: datetime
    
    class Config:
        from_attributes = True

