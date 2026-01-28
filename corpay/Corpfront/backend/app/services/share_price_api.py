import httpx
from typing import Optional, Dict, Any
from datetime import datetime
from app.config import settings
from app.utils.cache import get, set
import logging

logger = logging.getLogger(__name__)


class SharePriceService:
    """Service for fetching share price from external API or using mock data"""
    
    @staticmethod
    async def get_share_price(use_cache: bool = True) -> Dict[str, Any]:
        """
        Fetch share price from API or return mock data
        Returns: {price: float, change_percentage: float}
        """
        cache_key = "share_price"
        
        # Check cache first
        if use_cache:
            cached = get(cache_key)
            if cached:
                return cached
        
        # Try real API first if configured
        if settings.share_price_api_url and settings.share_price_api_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    headers = {}
                    if settings.share_price_api_key:
                        headers["Authorization"] = f"Bearer {settings.share_price_api_key}"
                    
                    response = await client.get(
                        settings.share_price_api_url,
                        headers=headers
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    # Parse response (adjust based on actual API format)
                    price = float(data.get("price", data.get("close", 0)))
                    change = float(data.get("change_percent", data.get("change", 0)))
                    
                    result = {
                        "price": price,
                        "change_percentage": change,
                        "api_source": "external"
                    }
                    
                    # Cache for 5 minutes
                    if use_cache:
                        set(cache_key, result, ttl_seconds=300)
                    
                    return result
            except httpx.TimeoutException:
                logger.warning("Share price API timeout, using cached or mock data")
                cached = get(cache_key)
                if cached:
                    return cached
            except Exception as e:
                logger.warning(f"Failed to fetch share price from API: {e}, using mock data")
                cached = get(cache_key)
                if cached:
                    return cached
        
        # Return mock data
        result = {
            "price": 1482.35,
            "change_percentage": 1.24,
            "api_source": "mock"
        }
        
        # Cache mock data for 1 minute
        if use_cache:
            set(cache_key, result, ttl_seconds=60)
        
        return result

