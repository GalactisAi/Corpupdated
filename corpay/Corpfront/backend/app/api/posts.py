from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.posts import SocialPost
from app.schemas.posts import SocialPostCreate, SocialPostResponse
from app.utils.auth import get_current_admin_user
from app.models.user import User
from app.services.linkedin_sync import LinkedInSyncService

router = APIRouter(prefix="/api/admin/posts", tags=["admin-posts"])


@router.post("", response_model=SocialPostResponse)
async def create_post(
    post: SocialPostCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new social media post"""
    db_post = SocialPost(**post.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.get("", response_model=List[SocialPostResponse])
async def list_posts(
    post_type: str = None,
    limit: int = 50,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """List all posts"""
    query = db.query(SocialPost)
    if post_type:
        query = query.filter(SocialPost.post_type == post_type)
    posts = query.order_by(SocialPost.created_at.desc()).limit(limit).all()
    return posts


@router.get("/{post_id}", response_model=SocialPostResponse)
async def get_post(
    post_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get a specific post"""
    post = db.query(SocialPost).filter(SocialPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/{post_id}", response_model=SocialPostResponse)
async def update_post(
    post_id: int,
    post: SocialPostCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a post"""
    db_post = db.query(SocialPost).filter(SocialPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    for key, value in post.dict().items():
        setattr(db_post, key, value)
    
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a post (soft delete)"""
    post = db.query(SocialPost).filter(SocialPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.is_active = 0
    db.commit()
    return {"message": "Post deleted successfully"}


@router.post("/sync-linkedin")
async def sync_linkedin_posts(
    post_type: str = "corpay",
    limit: int = 20,
    current_user: User = Depends(get_current_admin_user)
):
    """Manually trigger LinkedIn posts sync"""
    try:
        await LinkedInSyncService.sync_posts_to_database(post_type=post_type, limit=limit)
        return {"message": f"LinkedIn posts synced successfully for type: {post_type}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing LinkedIn posts: {str(e)}")


@router.post("/sync-linkedin-dev")
async def sync_linkedin_posts_dev(
    post_type: str = "corpay",
    limit: int = 20
):
    """Manually trigger LinkedIn posts sync (development mode - no auth)"""
    try:
        await LinkedInSyncService.sync_posts_to_database(post_type=post_type, limit=limit)
        return {"message": f"LinkedIn posts synced successfully for type: {post_type}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing LinkedIn posts: {str(e)}")

