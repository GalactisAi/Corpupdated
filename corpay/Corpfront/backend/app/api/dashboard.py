from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from app.database import get_db
from app.models.revenue import Revenue, RevenueTrend, RevenueProportion, SharePrice
from app.models.posts import SocialPost
from app.models.employees import EmployeeMilestone
from app.models.payments import PaymentData
from app.models.system_performance import SystemPerformance
from app.schemas.revenue import RevenueResponse, RevenueTrendResponse, RevenueProportionResponse, SharePriceResponse
from app.schemas.posts import SocialPostResponse
from app.schemas.employees import EmployeeMilestoneResponse
from app.schemas.payments import PaymentDataResponse
from app.schemas.system_performance import SystemPerformanceResponse
from app.schemas.newsroom import NewsroomItemResponse
from app.services.share_price_api import SharePriceService
from app.services.linkedin_api import LinkedInService
from app.services.newsroom_scraper import (
    fetch_corpay_newsroom,
    fetch_corpay_resources_newsroom,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/revenue", response_model=RevenueResponse)
async def get_revenue(db: Session = Depends(get_db)):
    """Get current total revenue"""
    revenue = db.query(Revenue).order_by(Revenue.last_updated.desc()).first()
    if not revenue:
        # Return default if no data
        return RevenueResponse(
            total_amount=976000000.0,
            percentage_change=12.5,
            last_updated=datetime.now()
        )
    return revenue


@router.get("/share-price", response_model=SharePriceResponse)
async def get_share_price(db: Session = Depends(get_db)):
    """Get current share price"""
    # Always get the most recent entry from database (prioritize manual entries)
    share_price = db.query(SharePrice).order_by(SharePrice.timestamp.desc()).first()
    
    # If we have a recent manual entry (within last 24 hours), use it
    if share_price and share_price.api_source == "manual":
        return share_price
    
    # If we have any entry less than 1 hour old, use it
    if share_price and (datetime.now() - share_price.timestamp).total_seconds() < 3600:
        return share_price
    
    # If no data or data is older than 1 hour, fetch from API service
    if not share_price or (datetime.now() - share_price.timestamp).total_seconds() > 3600:
        # Fetch from API service
        api_data = await SharePriceService.get_share_price()
        
        # Save to database
        new_share_price = SharePrice(
            price=api_data["price"],
            change_percentage=api_data["change_percentage"],
            api_source=api_data.get("api_source", "mock")
        )
        db.add(new_share_price)
        db.commit()
        db.refresh(new_share_price)
        return new_share_price
    
    return share_price


@router.get("/revenue-trends", response_model=List[RevenueTrendResponse])
async def get_revenue_trends(db: Session = Depends(get_db)):
    """Get revenue trends for chart"""
    current_year = datetime.now().year
    trends = db.query(RevenueTrend).filter(
        RevenueTrend.year == current_year
    ).all()
    
    if not trends:
        # Return default data (already in calendar order Jan–Dec)
        return [
            RevenueTrendResponse(month="Jan", value=70, highlight=False),
            RevenueTrendResponse(month="Feb", value=72, highlight=False),
            RevenueTrendResponse(month="Mar", value=75, highlight=False),
            RevenueTrendResponse(month="Apr", value=92, highlight=True),
            RevenueTrendResponse(month="May", value=73, highlight=False),
            RevenueTrendResponse(month="Jun", value=87, highlight=False),
            RevenueTrendResponse(month="Jul", value=89, highlight=False),
            RevenueTrendResponse(month="Aug", value=72, highlight=False),
            RevenueTrendResponse(month="Sep", value=105, highlight=True),
            RevenueTrendResponse(month="Oct", value=88, highlight=False),
            RevenueTrendResponse(month="Nov", value=91, highlight=False),
            RevenueTrendResponse(month="Dec", value=83, highlight=False),
        ]
    
    # Sort trends in calendar order Jan–Dec based on the (normalized)
    # three‑letter month abbreviation stored in the database.
    month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    month_index = {m: i for i, m in enumerate(month_order)}

    def month_sort_key(trend: RevenueTrend) -> int:
        # Normalize just in case: take first 3 chars and title‑case
        month_label = (trend.month or "")[:3].title()
        return month_index.get(month_label, 99)

    trends.sort(key=month_sort_key)
    
    # Automatically highlight the top 3 months by value
    # so the frontend can render them with a different color.
    sorted_by_value = sorted(trends, key=lambda t: t.value, reverse=True)
    top_three_ids = {t.id for t in sorted_by_value[:3]}

    for trend in trends:
        trend.highlight = trend.id in top_three_ids

    return trends


@router.get("/revenue-proportions", response_model=List[RevenueProportionResponse])
async def get_revenue_proportions(db: Session = Depends(get_db)):
    """Get revenue proportions for pie chart"""
    proportions = db.query(RevenueProportion).all()
    
    if not proportions:
        # Return default data
        return [
            RevenueProportionResponse(category="Fleet", percentage=40, color="#981239"),
            RevenueProportionResponse(category="Corporate", percentage=35, color="#3D1628"),
            RevenueProportionResponse(category="Lodging", percentage=25, color="#E6E8E7"),
        ]
    
    return proportions


@router.get("/posts", response_model=List[SocialPostResponse])
async def get_corpay_posts(limit: int = 10, db: Session = Depends(get_db)):
    """Get Corpay LinkedIn posts"""
    posts = db.query(SocialPost).filter(
        SocialPost.post_type == "corpay",
        SocialPost.is_active == 1
    ).order_by(SocialPost.created_at.desc()).limit(limit).all()
    
    # If no posts in DB, try to fetch from API
    if not posts:
        api_posts = await LinkedInService.get_corpay_posts(limit)
        # Could save to DB here if needed
        return [SocialPostResponse(**post) for post in api_posts]
    
    return posts


@router.get("/cross-border-posts", response_model=List[SocialPostResponse])
async def get_cross_border_posts(limit: int = 10, db: Session = Depends(get_db)):
    """Get Cross-Border LinkedIn posts"""
    posts = db.query(SocialPost).filter(
        SocialPost.post_type == "cross_border",
        SocialPost.is_active == 1
    ).order_by(SocialPost.created_at.desc()).limit(limit).all()
    
    # If no posts in DB, try to fetch from API
    if not posts:
        api_posts = await LinkedInService.get_cross_border_posts(limit)
        return [SocialPostResponse(**post) for post in api_posts]
    
    return posts


@router.get("/employees", response_model=List[EmployeeMilestoneResponse])
async def get_employee_milestones(limit: int = 20, db: Session = Depends(get_db)):
    """Get employee milestones"""
    milestones = db.query(EmployeeMilestone).filter(
        EmployeeMilestone.is_active == 1
    ).order_by(EmployeeMilestone.milestone_date.desc()).limit(limit).all()
    
    return milestones


@router.get("/payments", response_model=PaymentDataResponse)
async def get_payments_today(db: Session = Depends(get_db)):
    """Get today's payment data"""
    today = date.today()
    payment = db.query(PaymentData).filter(PaymentData.date == today).first()
    
    if not payment:
        # Return default if no data
        return PaymentDataResponse(
            id=0,
            amount_processed=428000000.0,  # ₹42.8 Cr
            transaction_count=19320,
            date=today,
            created_at=datetime.now()
        )
    
    return payment


@router.get("/system-performance", response_model=SystemPerformanceResponse)
async def get_system_performance(db: Session = Depends(get_db)):
    """Get latest system performance metrics"""
    performance = db.query(SystemPerformance).order_by(
        SystemPerformance.timestamp.desc()
    ).first()
    
    if not performance:
        # Return default if no data
        return SystemPerformanceResponse(
            id=0,
            uptime_percentage=99.985,
            success_rate=99.62,
            timestamp=datetime.now()
        )
    
    return performance


@router.get("/newsroom", response_model=List[NewsroomItemResponse])
async def get_newsroom_items(limit: int = 5) -> List[NewsroomItemResponse]:
    """
    Get latest items from the public Corpay corporate newsroom.
    
    This simply proxies the public website [`https://www.corpay.com/corporate-newsroom?limit=10&years=&categories=&search=`]
    and returns a lightweight list of articles for display in the Corpfront UI.
    """
    items = await fetch_corpay_newsroom(limit=limit)
    # Pydantic response_model will validate/serialize to NewsroomItemResponse
    return [NewsroomItemResponse(**item) for item in items]


@router.get("/resources-newsroom", response_model=List[NewsroomItemResponse])
async def get_resources_newsroom_items(limit: int = 4) -> List[NewsroomItemResponse]:
    """
    Get latest items from the Corpay Resources → Newsroom page.
    
    Source: `https://www.corpay.com/resources/newsroom?page=2`
    Returns up to `limit` items, text-only (no images).
    """
    items = await fetch_corpay_resources_newsroom(limit=limit)
    return [NewsroomItemResponse(**item) for item in items]

