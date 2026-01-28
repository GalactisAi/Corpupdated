"""
LinkedIn OAuth Helper Utilities
Helps with getting and refreshing LinkedIn access tokens
"""
import httpx
from typing import Optional, Dict, Any
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class LinkedInAuthHelper:
    """Helper class for LinkedIn OAuth authentication"""
    
    OAUTH_BASE_URL = "https://www.linkedin.com/oauth/v2"
    API_BASE_URL = "https://api.linkedin.com/v2"
    
    @staticmethod
    async def get_access_token_from_code(code: str, redirect_uri: str) -> Optional[str]:
        """
        Exchange authorization code for access token
        
        Args:
            code: Authorization code from OAuth callback
            redirect_uri: Redirect URI used in OAuth flow
        
        Returns:
            Access token or None if failed
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{LinkedInAuthHelper.OAUTH_BASE_URL}/accessToken",
                    data={
                        "grant_type": "authorization_code",
                        "code": code,
                        "redirect_uri": redirect_uri,
                        "client_id": settings.linkedin_client_id,
                        "client_secret": settings.linkedin_client_secret,
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                response.raise_for_status()
                data = response.json()
                return data.get("access_token")
        except Exception as e:
            logger.error(f"Error getting access token: {e}")
            return None
    
    @staticmethod
    async def refresh_access_token(refresh_token: str) -> Optional[Dict[str, Any]]:
        """
        Refresh an expired access token
        
        Args:
            refresh_token: Refresh token from initial OAuth flow
        
        Returns:
            Dictionary with new access_token and refresh_token, or None if failed
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{LinkedInAuthHelper.OAUTH_BASE_URL}/accessToken",
                    data={
                        "grant_type": "refresh_token",
                        "refresh_token": refresh_token,
                        "client_id": settings.linkedin_client_id,
                        "client_secret": settings.linkedin_client_secret,
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error refreshing access token: {e}")
            return None
    
    @staticmethod
    def get_authorization_url(redirect_uri: str, state: str = "random_state") -> str:
        """
        Generate LinkedIn OAuth authorization URL
        
        Args:
            redirect_uri: Redirect URI after authorization
            state: Random state for CSRF protection
        
        Returns:
            Authorization URL
        """
        scopes = [
            "r_organization_social",  # Read organization posts
            "r_basicprofile",  # Read basic profile
            "r_liteprofile",  # Read lite profile
        ]
        
        params = {
            "response_type": "code",
            "client_id": settings.linkedin_client_id,
            "redirect_uri": redirect_uri,
            "state": state,
            "scope": " ".join(scopes),
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{LinkedInAuthHelper.OAUTH_BASE_URL}/authorization?{query_string}"
    
    @staticmethod
    async def get_company_urn_by_vanity_name(vanity_name: str, access_token: str) -> Optional[str]:
        """
        Get company URN by vanity name (e.g., "galactisaitech")
        
        Args:
            vanity_name: Company vanity name from URL
            access_token: LinkedIn access token
        
        Returns:
            Company URN or None if not found
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Use organization lookup API
                response = await client.get(
                    f"{LinkedInAuthHelper.API_BASE_URL}/organizationSearch",
                    params={
                        "q": "vanityName",
                        "vanityName": vanity_name
                    },
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                # Extract URN from response
                elements = data.get("elements", [])
                if elements and len(elements) > 0:
                    return elements[0].get("id")  # This is the URN
                
                return None
        except Exception as e:
            logger.error(f"Error getting company URN: {e}")
            return None
