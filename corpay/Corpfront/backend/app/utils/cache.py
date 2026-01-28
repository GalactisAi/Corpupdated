from typing import Optional, Any
from datetime import datetime, timedelta
import json
import hashlib

# Simple in-memory cache (can be replaced with Redis in production)
_cache = {}
_cache_ttl = {}


def get_cache_key(key: str) -> str:
    """Generate a cache key"""
    return hashlib.md5(key.encode()).hexdigest()


def get(key: str, default: Any = None) -> Optional[Any]:
    """Get value from cache"""
    cache_key = get_cache_key(key)
    if cache_key in _cache:
        # Check if expired
        if cache_key in _cache_ttl:
            if datetime.now() > _cache_ttl[cache_key]:
                # Expired, remove
                del _cache[cache_key]
                del _cache_ttl[cache_key]
                return default
        return _cache[cache_key]
    return default


def set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    """Set value in cache with TTL"""
    cache_key = get_cache_key(key)
    _cache[cache_key] = value
    _cache_ttl[cache_key] = datetime.now() + timedelta(seconds=ttl_seconds)


def delete(key: str) -> None:
    """Delete from cache"""
    cache_key = get_cache_key(key)
    if cache_key in _cache:
        del _cache[cache_key]
    if cache_key in _cache_ttl:
        del _cache_ttl[cache_key]


def clear() -> None:
    """Clear all cache"""
    _cache.clear()
    _cache_ttl.clear()

