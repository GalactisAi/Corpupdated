from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database import get_db
from app.models.api_config import ApiConfig
from app.utils.auth import get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/api/admin/config", tags=["admin-config"])


@router.get("")
async def get_api_config(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get API configuration"""
    configs = db.query(ApiConfig).filter(ApiConfig.is_active == 1).all()
    result = {}
    for config in configs:
        result[config.config_key] = config.config_value
    return result


@router.put("")
async def update_api_config(
    config_data: Dict[str, Any],
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update API configuration"""
    for key, value in config_data.items():
        config = db.query(ApiConfig).filter(ApiConfig.config_key == key).first()
        if config:
            config.config_value = str(value)
            config.updated_by = current_user.email
        else:
            config = ApiConfig(
                config_key=key,
                config_value=str(value),
                updated_by=current_user.email
            )
            db.add(config)
    
    db.commit()
    return {"message": "Configuration updated successfully"}

