import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.config import settings
from app.utils.cache import get, set
from app.services.linkedin_scraper import LinkedInScraper, LinkedInAPIClient
import logging

logger = logging.getLogger(__name__)


class LinkedInService:
    """Service for fetching LinkedIn posts from external API or using mock data"""
    
    @staticmethod
    async def get_corpay_posts(limit: int = 10, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch Corpay posts from API, LinkedIn, or return mock data"""
        cache_key = f"linkedin_posts_corpay_{limit}"
        
        # Check cache
        if use_cache:
            cached = get(cache_key)
            if cached:
                return cached
        
        # Try LinkedIn Official API first (if configured)
        if settings.linkedin_api_key and hasattr(settings, 'linkedin_company_urn') and getattr(settings, 'linkedin_company_urn', ''):
            try:
                api_client = LinkedInAPIClient(
                    client_id=getattr(settings, 'linkedin_client_id', ''),
                    client_secret=getattr(settings, 'linkedin_client_secret', ''),
                    access_token=settings.linkedin_api_key
                )
                posts = await api_client.get_company_posts(
                    company_urn=getattr(settings, 'linkedin_company_urn', ''),
                    limit=limit
                )
                if posts:
                    if use_cache:
                        set(cache_key, posts, ttl_seconds=600)
                    return posts
            except Exception as e:
                logger.warning(f"LinkedIn Official API failed: {e}")
        
        # Try custom LinkedIn API endpoint
        if settings.linkedin_api_url and settings.linkedin_api_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    headers = {
                        "Authorization": f"Bearer {settings.linkedin_api_key}"
                    }
                    
                    response = await client.get(
                        f"{settings.linkedin_api_url}/corpay",
                        headers=headers,
                        params={"limit": limit}
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    # Transform API response to our format
                    posts = []
                    for item in data.get("posts", []):
                        posts.append({
                            "author": item.get("author", "Corpay"),
                            "content": item.get("content", ""),
                            "image_url": item.get("image_url"),
                            "likes": item.get("likes", 0),
                            "comments": item.get("comments", 0),
                            "post_type": "corpay",
                            "time_ago": item.get("time_ago", "Just now"),
                            "created_at": datetime.fromisoformat(item.get("created_at", datetime.now().isoformat()))
                        })
                    
                    # Cache for 10 minutes
                    if use_cache:
                        set(cache_key, posts, ttl_seconds=600)
                    
                    return posts
            except httpx.TimeoutException:
                logger.warning("LinkedIn API timeout, using cached data")
                cached = get(cache_key)
                if cached:
                    return cached
            except Exception as e:
                logger.warning(f"Failed to fetch LinkedIn posts from API: {e}, using cached or empty data")
                cached = get(cache_key)
                if cached:
                    return cached
        
        # Try LinkedIn scraper for Galactis AI Tech (if URL configured)
        if hasattr(settings, 'linkedin_company_url') and settings.linkedin_company_url:
            try:
                scraper = LinkedInScraper(settings.linkedin_company_url)
                posts = await scraper.fetch_posts(limit=limit)
                if posts:
                    if use_cache:
                        set(cache_key, posts, ttl_seconds=600)
                    return posts
            except Exception as e:
                logger.warning(f"LinkedIn scraper failed: {e}")
        
        # Return empty list if no API and no cache
        return []
    
    @staticmethod
    async def get_cross_border_posts(limit: int = 10, use_cache: bool = True) -> List[Dict[str, Any]]:
        """Fetch Cross-Border posts from API or return mock data"""
        cache_key = f"linkedin_posts_crossborder_{limit}"
        
        # Check cache
        if use_cache:
            cached = get(cache_key)
            if cached:
                return cached
        
        if settings.linkedin_api_url and settings.linkedin_api_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    headers = {
                        "Authorization": f"Bearer {settings.linkedin_api_key}"
                    }
                    
                    response = await client.get(
                        f"{settings.linkedin_api_url}/cross-border",
                        headers=headers,
                        params={"limit": limit}
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    posts = []
                    for item in data.get("posts", []):
                        posts.append({
                            "author": item.get("author", "Corpay Cross-Border"),
                            "content": item.get("content", ""),
                            "image_url": item.get("image_url"),
                            "likes": item.get("likes", 0),
                            "comments": item.get("comments", 0),
                            "post_type": "cross_border",
                            "time_ago": item.get("time_ago", "Just now"),
                            "created_at": datetime.fromisoformat(item.get("created_at", datetime.now().isoformat()))
                        })
                    
                    # Cache for 10 minutes
                    if use_cache:
                        set(cache_key, posts, ttl_seconds=600)
                    
                    return posts
            except httpx.TimeoutException:
                logger.warning("LinkedIn API timeout, using cached data")
                cached = get(cache_key)
                if cached:
                    return cached
            except Exception as e:
                logger.warning(f"Failed to fetch Cross-Border posts from API: {e}, using cached or empty data")
                cached = get(cache_key)
                if cached:
                    return cached
        
        # Return empty list if no API and no cache
        return []

