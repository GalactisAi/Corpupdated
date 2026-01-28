from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.revenue import Revenue, RevenueTrend, RevenueProportion, SharePrice
from app.models.file_upload import FileUpload, FileType
from app.schemas.revenue import RevenueResponse, RevenueTrendResponse, RevenueProportionResponse, SharePriceResponse
from app.utils.auth import get_current_admin_user
from app.utils.file_handler import save_uploaded_file, get_file_size_mb
from app.services.excel_parser import ExcelParser
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin/revenue", tags=["admin-revenue"])


@router.post("/upload")
async def upload_revenue_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Upload revenue Excel file (authenticated)"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be Excel format (.xlsx or .xls)")
    
    # Save file
    file_path = save_uploaded_file(file, "revenue")
    file_size = get_file_size_mb(file_path)
    
    # Record upload
    file_upload = FileUpload(
        original_filename=file.filename,
        stored_path=file_path,
        file_type=FileType.REVENUE,
        file_size=int(file_size * 1024 * 1024),
        uploaded_by=current_user.email
    )
    db.add(file_upload)
    
    try:
        # Parse Excel file
        parser = ExcelParser()
        data = parser.parse_revenue_file(f"uploads/{file_path}")
        
        # Update revenue
        if data.get("total_revenue"):
            # Ensure we never write NULL into a non-nullable percentage_change column
            pct_change = data.get("percentage_change")
            if pct_change is None:
                pct_change = 0.0

            revenue = db.query(Revenue).order_by(Revenue.last_updated.desc()).first()
            if revenue:
                revenue.total_amount = data["total_revenue"]
                revenue.percentage_change = pct_change
            else:
                revenue = Revenue(
                    total_amount=data["total_revenue"],
                    percentage_change=pct_change
                )
                db.add(revenue)
        
        # Update revenue trends
        if data.get("revenue_trends"):
            current_year = datetime.now().year
            # Clear existing trends for current year
            db.query(RevenueTrend).filter(RevenueTrend.year == current_year).delete()
            
            for trend in data["revenue_trends"]:
                revenue_trend = RevenueTrend(
                    month=trend["month"],
                    value=trend["value"],
                    highlight=trend.get("highlight", False),
                    year=current_year
                )
                db.add(revenue_trend)
        
        # Update revenue proportions
        if data.get("revenue_proportions"):
            for prop in data["revenue_proportions"]:
                proportion = db.query(RevenueProportion).filter(
                    RevenueProportion.category == prop["category"]
                ).first()
                
                if proportion:
                    proportion.percentage = prop["percentage"]
                    proportion.color = prop.get("color", "#981239")
                else:
                    proportion = RevenueProportion(
                        category=prop["category"],
                        percentage=prop["percentage"],
                        color=prop.get("color", "#981239")
                    )
                    db.add(proportion)
        
        file_upload.processed = 1
        db.commit()
        
        return {"message": "File processed successfully", "file_id": file_upload.id}
    
    except Exception as e:
        file_upload.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")


@router.post("/upload-dev")
async def upload_revenue_file_dev(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload revenue Excel file (development mode - no auth required)
    
    This reuses the same processing logic as the authenticated endpoint but
    skips the admin auth dependency so it is easier to test from the Admin
    Dashboard UI.
    """
    try:
        # Debug log: entry into upload-dev
        try:
            with open("/Users/madhujitharumugam/Desktop/latest_corpgit/corpay/.cursor/debug.log", "a") as f:
                f.write('{"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"H4","location":"revenue.py:upload_revenue_file_dev:start","message":"Entered upload-dev","data":{"fileName":"%s"},"timestamp":%d}\\n' % (file.filename, int(datetime.now().timestamp() * 1000)))
        except Exception:
            pass

        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="File must be Excel format (.xlsx or .xls)")
        
        # Save file
        file_path = save_uploaded_file(file, "revenue")
        file_size = get_file_size_mb(file_path)

        # Record upload
        file_upload = FileUpload(
            original_filename=file.filename,
            stored_path=file_path,
            file_type=FileType.REVENUE,
            file_size=int(file_size * 1024 * 1024),
            uploaded_by="dev_user"
        )
        db.add(file_upload)

        # Parse Excel file
        parser = ExcelParser()
        data = parser.parse_revenue_file(f"uploads/{file_path}")

        # Update revenue
        if data.get("total_revenue"):
            # Ensure we never write NULL into a non-nullable percentage_change column
            pct_change = data.get("percentage_change")
            if pct_change is None:
                pct_change = 0.0

            revenue = db.query(Revenue).order_by(Revenue.last_updated.desc()).first()
            if revenue:
                revenue.total_amount = data["total_revenue"]
                revenue.percentage_change = pct_change
            else:
                revenue = Revenue(
                    total_amount=data["total_revenue"],
                    percentage_change=pct_change
                )
                db.add(revenue)

        # Update revenue trends
        if data.get("revenue_trends"):
            current_year = datetime.now().year
            # Clear existing trends for current year
            db.query(RevenueTrend).filter(RevenueTrend.year == current_year).delete()

            for trend in data["revenue_trends"]:
                revenue_trend = RevenueTrend(
                    month=trend["month"],
                    value=trend["value"],
                    highlight=trend.get("highlight", False),
                    year=current_year
                )
                db.add(revenue_trend)

        # Update revenue proportions
        if data.get("revenue_proportions"):
            for prop in data["revenue_proportions"]:
                proportion = db.query(RevenueProportion).filter(
                    RevenueProportion.category == prop["category"]
                ).first()

                if proportion:
                    proportion.percentage = prop["percentage"]
                    proportion.color = prop.get("color", "#981239")
                else:
                    proportion = RevenueProportion(
                        category=prop["category"],
                        percentage=prop["percentage"],
                        color=prop.get("color", "#981239")
                    )
                    db.add(proportion)

        file_upload.processed = 1
        db.commit()

        try:
            with open("/Users/madhujitharumugam/Desktop/latest_corpgit/corpay/.cursor/debug.log", "a") as f:
                f.write('{"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"H5","location":"revenue.py:upload_revenue_file_dev:success","message":"upload-dev processed successfully","data":{"fileId":%d},"timestamp":%d}\\n' % (file_upload.id, int(datetime.now().timestamp() * 1000)))
        except Exception:
            pass

        return {"message": "File processed successfully", "file_id": file_upload.id}

    except HTTPException:
        # Re-raise HTTPExceptions so FastAPI can handle status code properly
        raise
    except Exception as e:
        # Catch-all for unexpected errors
        try:
            with open("/Users/madhujitharumugam/Desktop/latest_corpgit/corpay/.cursor/debug.log", "a") as f:
                f.write('{"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"H6","location":"revenue.py:upload_revenue_file_dev:exception","message":"Unexpected exception during upload-dev","data":{"error":"%s"},"timestamp":%d}\\n' % (str(e).replace("\\", "\\\\"), int(datetime.now().timestamp() * 1000)))
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Unexpected error processing file: {str(e)}")


class ManualRevenueRequest(BaseModel):
    total_amount: float
    percentage_change: float


@router.post("/manual", response_model=RevenueResponse)
async def create_manual_revenue(
    request: ManualRevenueRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Manually create revenue entry"""
    revenue = Revenue(
        total_amount=request.total_amount,
        percentage_change=request.percentage_change
    )
    db.add(revenue)
    db.commit()
    db.refresh(revenue)
    return revenue


@router.post("/manual-dev", response_model=RevenueResponse)
async def create_manual_revenue_dev(
    request: ManualRevenueRequest,
    db: Session = Depends(get_db)
):
    """Manually create revenue entry (development mode - no auth required)"""
    revenue = Revenue(
        total_amount=request.total_amount,
        percentage_change=request.percentage_change
    )
    db.add(revenue)
    db.commit()
    db.refresh(revenue)
    return revenue


class ManualSharePriceRequest(BaseModel):
    price: float
    change_percentage: float


@router.post("/share-price/manual-dev", response_model=SharePriceResponse)
async def create_manual_share_price_dev(
    request: ManualSharePriceRequest,
    db: Session = Depends(get_db)
):
    """Manually create share price entry (development mode - no auth required)"""
    share_price = SharePrice(
        price=request.price,
        change_percentage=request.change_percentage,
        api_source="manual"
    )
    db.add(share_price)
    db.commit()
    db.refresh(share_price)
    return share_price


@router.post("/share-price/manual", response_model=SharePriceResponse)
async def create_manual_share_price(
    request: ManualSharePriceRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Manually create share price entry"""
    share_price = SharePrice(
        price=request.price,
        change_percentage=request.change_percentage,
        api_source="manual"
    )
    db.add(share_price)
    db.commit()
    db.refresh(share_price)
    return share_price


class ProportionItem(BaseModel):
    category: str
    percentage: float
    color: str


class ManualProportionsRequest(BaseModel):
    proportions: List[ProportionItem]


@router.post("/proportions/manual-dev")
async def create_manual_proportions_dev(
    request: ManualProportionsRequest,
    db: Session = Depends(get_db)
):
    """Manually create/update revenue proportions (development mode - no auth required)"""
    # Clear existing proportions
    db.query(RevenueProportion).delete()
    
    # Add new proportions
    for prop in request.proportions:
        proportion = RevenueProportion(
            category=prop.category,
            percentage=prop.percentage,
            color=prop.color
        )
        db.add(proportion)
    
    db.commit()
    return {"message": "Proportions saved successfully", "count": len(request.proportions)}


@router.post("/proportions/manual")
async def create_manual_proportions(
    request: ManualProportionsRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Manually create/update revenue proportions"""
    # Clear existing proportions
    db.query(RevenueProportion).delete()
    
    # Add new proportions
    for prop in request.proportions:
        proportion = RevenueProportion(
            category=prop.category,
            percentage=prop.percentage,
            color=prop.color
        )
        db.add(proportion)
    
    db.commit()
    return {"message": "Proportions saved successfully", "count": len(request.proportions)}

