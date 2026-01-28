import os
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from app.config import settings


def ensure_upload_dir():
    """Ensure upload directory exists"""
    upload_path = Path(settings.upload_dir)
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path


def save_uploaded_file(file: UploadFile, subdirectory: str = "") -> str:
    """
    Save uploaded file and return the stored path
    """
    upload_dir = ensure_upload_dir()
    
    if subdirectory:
        target_dir = upload_dir / subdirectory
        target_dir.mkdir(parents=True, exist_ok=True)
    else:
        target_dir = upload_dir
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    import uuid
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = target_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return relative path
    return str(file_path.relative_to(upload_dir))


def delete_file(file_path: str) -> bool:
    """Delete a file from the upload directory"""
    try:
        upload_dir = Path(settings.upload_dir)
        full_path = upload_dir / file_path
        if full_path.exists():
            full_path.unlink()
            return True
        return False
    except Exception:
        return False


def get_file_size_mb(file_path: str) -> float:
    """Get file size in MB"""
    upload_dir = Path(settings.upload_dir)
    full_path = upload_dir / file_path
    if full_path.exists():
        return full_path.stat().st_size / (1024 * 1024)
    return 0.0

