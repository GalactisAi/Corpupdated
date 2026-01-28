from pydantic import BaseModel, EmailStr
from typing import Optional


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional["UserResponse"] = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    is_admin: bool
    
    class Config:
        from_attributes = True

