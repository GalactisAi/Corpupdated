"""
LinkedIn Posts Synchronization Service
Periodically fetches posts from LinkedIn and stores them in the database
"""
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.posts import SocialPost
from app.services.linkedin_api import LinkedInService
import logging

logger = logging.getLogger(__name__)


class LinkedInSyncService:
    """Service to sync LinkedIn posts to database"""
    
    @staticmethod
    async def sync_posts_to_database(post_type: str = "corpay", limit: int = 20):
        """
        Fetch posts from LinkedIn and store them in database
        
        Args:
            post_type: Type of posts to sync ('corpay' or 'cross_border')
            limit: Maximum number of posts to fetch
        """
        db: Session = SessionLocal()
        try:
            # Fetch posts from LinkedIn
            if post_type == "corpay":
                posts = await LinkedInService.get_corpay_posts(limit=limit, use_cache=False)
            else:
                posts = await LinkedInService.get_cross_border_posts(limit=limit, use_cache=False)
            
            if not posts:
                logger.info(f"No posts fetched from LinkedIn for type: {post_type}")
                return
            
            # Store posts in database
            new_posts_count = 0
            updated_posts_count = 0
            
            for post_data in posts:
                # Check if post already exists (by content hash or unique identifier)
                # For now, we'll check by content and created_at
                existing_post = db.query(SocialPost).filter(
                    SocialPost.content == post_data.get("content", "")[:500],  # First 500 chars for comparison
                    SocialPost.post_type == post_type,
                    SocialPost.is_active == 1
                ).first()
                
                if existing_post:
                    # Update existing post
                    existing_post.likes = post_data.get("likes", 0)
                    existing_post.comments = post_data.get("comments", 0)
                    existing_post.time_ago = post_data.get("time_ago", "Just now")
                    existing_post.updated_at = datetime.now()
                    updated_posts_count += 1
                else:
                    # Create new post
                    new_post = SocialPost(
                        author=post_data.get("author", "Corpay"),
                        content=post_data.get("content", ""),
                        image_url=post_data.get("image_url"),
                        likes=post_data.get("likes", 0),
                        comments=post_data.get("comments", 0),
                        post_type=post_type,
                        time_ago=post_data.get("time_ago", "Just now"),
                        created_at=post_data.get("created_at", datetime.now()),
                        is_active=1
                    )
                    db.add(new_post)
                    new_posts_count += 1
            
            db.commit()
            logger.info(
                f"LinkedIn sync completed for {post_type}: "
                f"{new_posts_count} new posts, {updated_posts_count} updated posts"
            )
            
        except Exception as e:
            logger.error(f"Error syncing LinkedIn posts: {e}")
            db.rollback()
        finally:
            db.close()
    
    @staticmethod
    async def sync_all_posts(limit: int = 20):
        """Sync both corpay and cross-border posts"""
        await LinkedInSyncService.sync_posts_to_database("corpay", limit)
        await LinkedInSyncService.sync_posts_to_database("cross_border", limit)


async def run_periodic_sync(interval_minutes: int = 30):
    """
    Run periodic sync of LinkedIn posts
    
    Args:
        interval_minutes: How often to sync (default: 30 minutes)
    """
    while True:
        try:
            logger.info("Starting periodic LinkedIn posts sync...")
            await LinkedInSyncService.sync_all_posts(limit=20)
            logger.info(f"LinkedIn sync completed. Next sync in {interval_minutes} minutes.")
        except Exception as e:
            logger.error(f"Error in periodic LinkedIn sync: {e}")
        
        # Wait for next sync
        await asyncio.sleep(interval_minutes * 60)
