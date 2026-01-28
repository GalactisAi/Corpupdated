from pydantic import BaseModel
from datetime import datetime


class SystemPerformanceCreate(BaseModel):
    uptime_percentage: float
    success_rate: float


class SystemPerformanceResponse(BaseModel):
    id: int
    uptime_percentage: float
    success_rate: float
    timestamp: datetime
    
    class Config:
        from_attributes = True

