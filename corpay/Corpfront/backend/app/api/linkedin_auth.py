"""
LinkedIn OAuth Authentication Endpoints
Handles OAuth flow for LinkedIn API access
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.linkedin_auth import LinkedInAuthHelper
from app.config import settings
import secrets
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/auth/linkedin", tags=["linkedin-auth"])


@router.get("/authorize")
async def authorize_linkedin(
    redirect_uri: str = Query(default="http://localhost:8000/api/admin/auth/linkedin/callback")
):
    """
    Initiate LinkedIn OAuth flow
    Redirects user to LinkedIn authorization page
    """
    if not settings.linkedin_client_id:
        raise HTTPException(
            status_code=400,
            detail="LinkedIn Client ID not configured. Please set LINKEDIN_CLIENT_ID in .env"
        )
    
    # Generate random state for CSRF protection
    state = secrets.token_urlsafe(32)
    
    # Store state in session/cache (in production, use Redis or database)
    # For now, we'll include it in the redirect
    
    auth_url = LinkedInAuthHelper.get_authorization_url(
        redirect_uri=redirect_uri,
        state=state
    )
    
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def linkedin_callback(
    code: str = Query(...),
    state: str = Query(None),
    redirect_uri: str = Query(default="http://localhost:8000/api/admin/auth/linkedin/callback")
):
    """
    Handle LinkedIn OAuth callback
    Exchanges authorization code for access token
    """
    try:
        # Exchange code for access token
        access_token = await LinkedInAuthHelper.get_access_token_from_code(
            code=code,
            redirect_uri=redirect_uri
        )
        
        if not access_token:
            raise HTTPException(
                status_code=400,
                detail="Failed to get access token from LinkedIn"
            )
        
        # If company URN is not set, try to get it from vanity name
        if not settings.linkedin_company_urn and settings.linkedin_vanity_name:
            company_urn = await LinkedInAuthHelper.get_company_urn_by_vanity_name(
                vanity_name=settings.linkedin_vanity_name,
                access_token=access_token
            )
            
            if company_urn:
                logger.info(f"Found company URN: {company_urn}")
                # In production, save this to database or config
                # For now, return it in the response
                return {
                    "message": "LinkedIn authentication successful",
                    "access_token": access_token[:20] + "...",  # Don't expose full token
                    "company_urn": company_urn,
                    "instructions": "Add the access_token and company_urn to your .env file"
                }
        
        return {
            "message": "LinkedIn authentication successful",
            "access_token": access_token[:20] + "...",  # Don't expose full token
            "instructions": "Add the access_token to LINKEDIN_API_KEY in your .env file"
        }
        
    except Exception as e:
        logger.error(f"Error in LinkedIn callback: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing LinkedIn callback: {str(e)}"
        )


@router.get("/test-connection")
async def test_linkedin_connection():
    """
    Test LinkedIn API connection with current credentials
    """
    if not settings.linkedin_api_key:
        return {
            "status": "not_configured",
            "message": "LinkedIn API key not set. Please configure LINKEDIN_API_KEY in .env"
        }
    
    if not settings.linkedin_company_urn:
        return {
            "status": "missing_urn",
            "message": "LinkedIn Company URN not set. Please configure LINKEDIN_COMPANY_URN in .env"
        }
    
    try:
        from app.services.linkedin_api import LinkedInService
        posts = await LinkedInService.get_corpay_posts(limit=1, use_cache=False)
        
        return {
            "status": "success",
            "message": f"Successfully connected to LinkedIn API. Found {len(posts)} posts.",
            "posts_count": len(posts)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error connecting to LinkedIn API: {str(e)}"
        }
