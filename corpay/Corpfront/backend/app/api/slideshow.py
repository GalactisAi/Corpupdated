from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.utils.auth import get_current_admin_user
from app.utils.file_handler import save_uploaded_file, get_file_size_mb
from app.models.user import User
from app.models.file_upload import FileUpload, FileType
from pydantic import BaseModel
import json
import os
from pathlib import Path
from app.config import settings
import subprocess
import shutil
from pptx import Presentation
from io import BytesIO
from PIL import Image
import io

router = APIRouter(prefix="/api", tags=["slideshow"])


class SlideshowState(BaseModel):
    is_active: bool
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    started_at: Optional[datetime] = None


# In-memory storage for slideshow state (can be moved to database later)
_slideshow_state = {
    "is_active": False,
    "file_url": None,
    "file_name": None,
    "started_at": None
}


@router.post("/admin/slideshow/upload-dev")
async def upload_ppt_file_dev(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload PowerPoint file for slideshow (development mode - no auth required)"""
    if not file.filename.endswith(('.pptx', '.ppt')):
        raise HTTPException(status_code=400, detail="File must be PowerPoint format (.pptx or .ppt)")
    
    # Save file
    file_path = save_uploaded_file(file, "slideshow")
    file_size = get_file_size_mb(file_path)
    
    # Record upload (optional - for tracking)
    # Note: Using EMPLOYEE_DATA as placeholder since PPT files don't have a dedicated type
    try:
        file_upload = FileUpload(
            original_filename=file.filename,
            stored_path=file_path,
            file_type=FileType.EMPLOYEE_DATA,  # Placeholder type
            file_size=int(file_size * 1024 * 1024),
            uploaded_by="dev_user"
        )
        db.add(file_upload)
        db.commit()
    except Exception as e:
        # Log but don't fail if file upload record fails
        print(f"Warning: Could not record file upload: {e}")
    
    # Construct file URL
    API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
    file_url = f"{API_BASE_URL}/uploads/{file_path}"
    
    # Update slideshow state with file info (but don't activate yet)
    _slideshow_state["file_url"] = file_url
    _slideshow_state["file_name"] = file.filename
    
    return {
        "message": "File uploaded successfully",
        "file_url": file_url,
        "file_name": file.filename,
        "file_path": file_path
    }


@router.post("/admin/slideshow/upload")
async def upload_ppt_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Upload PowerPoint file for slideshow"""
    if not file.filename.endswith(('.pptx', '.ppt')):
        raise HTTPException(status_code=400, detail="File must be PowerPoint format (.pptx or .ppt)")
    
    # Save file
    file_path = save_uploaded_file(file, "slideshow")
    file_size = get_file_size_mb(file_path)
    
    # Record upload (optional - for tracking)
    # Note: Using EMPLOYEE_DATA as placeholder since PPT files don't have a dedicated type
    try:
        file_upload = FileUpload(
            original_filename=file.filename,
            stored_path=file_path,
            file_type=FileType.EMPLOYEE_DATA,  # Placeholder type
            file_size=int(file_size * 1024 * 1024),
            uploaded_by=current_user.email
        )
        db.add(file_upload)
        db.commit()
    except Exception as e:
        # Log but don't fail if file upload record fails
        print(f"Warning: Could not record file upload: {e}")
    
    # Construct file URL
    API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
    file_url = f"{API_BASE_URL}/uploads/{file_path}"
    
    # Update slideshow state with file info (but don't activate yet)
    _slideshow_state["file_url"] = file_url
    _slideshow_state["file_name"] = file.filename
    
    return {
        "message": "File uploaded successfully",
        "file_url": file_url,
        "file_name": file.filename,
        "file_path": file_path
    }


@router.post("/admin/slideshow/start-dev")
async def start_slideshow_dev(
    db: Session = Depends(get_db)
):
    """Start the slideshow on frontend dashboard (development mode - no auth required)"""
    if not _slideshow_state["file_url"]:
        raise HTTPException(status_code=400, detail="No PPT file uploaded. Please upload a file first.")
    
    _slideshow_state["is_active"] = True
    _slideshow_state["started_at"] = datetime.now()
    
    return {
        "message": "Slideshow started",
        "is_active": True,
        "file_url": _slideshow_state["file_url"],
        "file_name": _slideshow_state["file_name"]
    }


@router.post("/admin/slideshow/start")
async def start_slideshow(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Start the slideshow on frontend dashboard"""
    if not _slideshow_state["file_url"]:
        raise HTTPException(status_code=400, detail="No PPT file uploaded. Please upload a file first.")
    
    _slideshow_state["is_active"] = True
    _slideshow_state["started_at"] = datetime.now()
    
    return {
        "message": "Slideshow started",
        "is_active": True,
        "file_url": _slideshow_state["file_url"],
        "file_name": _slideshow_state["file_name"]
    }


@router.post("/admin/slideshow/stop-dev")
async def stop_slideshow_dev(
    db: Session = Depends(get_db)
):
    """Stop the slideshow on frontend dashboard (development mode - no auth required)"""
    _slideshow_state["is_active"] = False
    _slideshow_state["started_at"] = None
    
    return {
        "message": "Slideshow stopped",
        "is_active": False
    }


@router.post("/admin/slideshow/stop")
async def stop_slideshow(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Stop the slideshow on frontend dashboard"""
    _slideshow_state["is_active"] = False
    _slideshow_state["started_at"] = None
    
    return {
        "message": "Slideshow stopped",
        "is_active": False
    }


@router.get("/dashboard/slideshow", response_model=SlideshowState)
async def get_slideshow_state(db: Session = Depends(get_db)):
    """Get current slideshow state (public endpoint for frontend dashboard)"""
    return SlideshowState(
        is_active=_slideshow_state["is_active"],
        file_url=_slideshow_state["file_url"],
        file_name=_slideshow_state["file_name"],
        started_at=_slideshow_state["started_at"]
    )


@router.get("/dashboard/slideshow/slides")
async def get_slide_images(db: Session = Depends(get_db)):
    """Convert PPTX slides to images - exact page-by-page display without extraction"""
    if not _slideshow_state["file_url"]:
        raise HTTPException(status_code=404, detail="No PPT file uploaded")
    
    file_path = _slideshow_state["file_url"].replace(f"{os.getenv('API_BASE_URL', 'http://localhost:8000')}/uploads/", "")
    upload_dir = Path(settings.upload_dir)
    full_file_path = upload_dir / file_path
    
    if not full_file_path.exists():
        raise HTTPException(status_code=404, detail="PPT file not found")
    
    slides_dir = upload_dir / "slideshow" / "slides"
    slides_dir.mkdir(parents=True, exist_ok=True)
    
    base_name = full_file_path.stem
    API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
    
    # Use LibreOffice to convert each slide to an image (exact rendering)
    # This preserves the exact layout, fonts, colors, images - everything
    try:
        # Find LibreOffice executable (Windows paths)
        libreoffice_paths = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",  # Most common Windows path
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
            "libreoffice",  # Try PATH
            "soffice",  # Alternative command
        ]
        
        libreoffice_cmd = None
        for path in libreoffice_paths:
            try:
                # Test if file exists (for Windows paths) or command works
                if os.path.exists(path) if os.sep in path else True:
                    test_result = subprocess.run(
                        [path, "--version"],
                        capture_output=True,
                        timeout=5,
                        text=True
                    )
                    if test_result.returncode == 0 or "LibreOffice" in (test_result.stdout or "") or "LibreOffice" in (test_result.stderr or ""):
                        libreoffice_cmd = path
                        print(f"[Slideshow] Found LibreOffice at: {path}")
                        break
            except Exception as e:
                print(f"[Slideshow] Testing {path} failed: {e}")
                continue
        
        if not libreoffice_cmd:
            raise FileNotFoundError("LibreOffice not found. Please ensure it's installed at C:\\Program Files\\LibreOffice\\program\\soffice.exe")
        
        print(f"[Slideshow] Converting {full_file_path} to images using LibreOffice...")
        result = subprocess.run(
            [
                libreoffice_cmd,
                "--headless",
                "--convert-to", "png",
                "--outdir", str(slides_dir),
                str(full_file_path)
            ],
            capture_output=True,
            timeout=120,
            text=True
        )
        
        print(f"[Slideshow] LibreOffice exit code: {result.returncode}")
        if result.stdout:
            print(f"[Slideshow] LibreOffice stdout: {result.stdout}")
        if result.stderr:
            print(f"[Slideshow] LibreOffice stderr: {result.stderr}")
        
        if result.returncode == 0:
            slide_images = []
            # LibreOffice creates files like: filename_1.png, filename_2.png, etc.
            # Or sometimes: filename.png (single slide)
            
            # Check for numbered slides first
            for i in range(1, 100):  # Max 100 slides
                slide_file = slides_dir / f"{base_name}_{i}.png"
                if slide_file.exists():
                    slide_images.append(f"{API_BASE_URL}/uploads/slideshow/slides/{slide_file.name}")
                    print(f"[Slideshow] Found slide {i}: {slide_file.name}")
                else:
                    # Check for single slide file (if only 1 slide)
                    if i == 1:
                        single_file = slides_dir / f"{base_name}.png"
                        if single_file.exists():
                            slide_images.append(f"{API_BASE_URL}/uploads/slideshow/slides/{single_file.name}")
                            print(f"[Slideshow] Found single slide: {single_file.name}")
                    break
            
            if slide_images:
                print(f"[Slideshow] Successfully converted {len(slide_images)} slides")
                return {"slides": slide_images, "use_viewer": False}
            else:
                print(f"[Slideshow] No slide images found after conversion")
        else:
            print(f"[Slideshow] LibreOffice conversion failed with code {result.returncode}")
    except FileNotFoundError:
        print("[Slideshow] LibreOffice not found - please install LibreOffice for slide conversion")
    except subprocess.TimeoutExpired:
        print("[Slideshow] LibreOffice conversion timed out")
    except Exception as e:
        print(f"[Slideshow] LibreOffice conversion error: {e}")
    
    # If LibreOffice fails, return error
    raise HTTPException(
        status_code=500, 
        detail="Failed to convert slides to images. Please install LibreOffice or ensure the PPTX file is valid."
    )
