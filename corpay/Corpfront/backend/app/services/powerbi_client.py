import httpx
from typing import Dict, Any, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class PowerBIClient:
    """Client for PowerBI API integration"""
    
    @staticmethod
    async def get_access_token() -> Optional[str]:
        """Get PowerBI access token using client credentials"""
        if not all([
            settings.powerbi_client_id,
            settings.powerbi_client_secret,
            settings.powerbi_tenant_id
        ]):
            return None
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                token_url = f"https://login.microsoftonline.com/{settings.powerbi_tenant_id}/oauth2/v2.0/token"
                
                data = {
                    "client_id": settings.powerbi_client_id,
                    "client_secret": settings.powerbi_client_secret,
                    "scope": "https://analysis.windows.net/powerbi/api/.default",
                    "grant_type": "client_credentials"
                }
                
                response = await client.post(token_url, data=data)
                response.raise_for_status()
                token_data = response.json()
                return token_data.get("access_token")
        except Exception as e:
            logger.error(f"Failed to get PowerBI access token: {e}")
            return None
    
    @staticmethod
    async def get_revenue_data() -> Optional[Dict[str, Any]]:
        """Fetch revenue data from PowerBI"""
        token = await PowerBIClient.get_access_token()
        if not token:
            return None
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # PowerBI REST API endpoint
                # This is a placeholder - actual implementation depends on PowerBI dataset structure
                url = f"https://api.powerbi.com/v1.0/myorg/groups/{settings.powerbi_workspace_id}/datasets"
                
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                
                # Parse PowerBI response and transform to our format
                # This needs to be customized based on actual PowerBI dataset structure
                data = response.json()
                
                return {
                    "total_revenue": 0.0,
                    "percentage_change": 0.0,
                    "revenue_trends": [],
                    "revenue_proportions": []
                }
        except Exception as e:
            logger.error(f"Failed to fetch PowerBI data: {e}")
            return None

