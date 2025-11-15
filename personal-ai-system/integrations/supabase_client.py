"""Supabase integration for syncing agent data."""

import os
from typing import Any, Dict, Optional
from datetime import datetime

from loguru import logger

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    logger.warning("Supabase client not installed. Run: pip install supabase")


class SupabaseClient:
    """Client for Supabase integration."""
    
    def __init__(self):
        """Initialize Supabase client."""
        self.client: Optional[Client] = None
        
        if not SUPABASE_AVAILABLE:
            return
        
        # Read from parent .env (frontend env)
        url = os.getenv("VITE_SUPABASE_URL")
        key = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
        
        if url and key:
            try:
                self.client = create_client(url, key)
                logger.info("✓ Supabase connected")
            except Exception as e:
                logger.error(f"Supabase connection failed: {e}")
    
    def is_connected(self) -> bool:
        """Check if connected."""
        return self.client is not None
    
    async def log_activity(
        self,
        agent_id: str,
        action: str,
        status: str,
        details: Optional[Dict[str, Any]] = None,
        duration_ms: Optional[int] = None,
        error_message: Optional[str] = None,
    ) -> bool:
        """Log to activity_logs table."""
        if not self.is_connected():
            return False
        
        try:
            data = {
                "agent_id": agent_id,
                "action": action,
                "status": status,
                "details": details or {},
                "duration_ms": duration_ms,
                "error_message": error_message,
            }
            
            self.client.table("activity_logs").insert(data).execute()
            logger.debug(f"✓ Activity logged: {action}")
            return True
        except Exception as e:
            logger.error(f"Activity log failed: {e}")
            return False
    
    async def add_to_content_queue(
        self,
        agent_id: str,
        title: str,
        content: str,
        content_type: str,
        metadata: Optional[Dict[str, Any]] = None,
        priority: int = 5,
    ) -> Optional[str]:
        """Add to content_queue table."""
        if not self.is_connected():
            return None
        
        try:
            data = {
                "agent_id": agent_id,
                "title": title,
                "content": content,
                "content_type": content_type,
                "metadata": metadata or {},
                "priority": priority,
                "status": "pending",
            }
            
            result = self.client.table("content_queue").insert(data).execute()
            logger.info(f"✓ Added to queue: {title}")
            return result.data[0]["id"] if result.data else None
        except Exception as e:
            logger.error(f"Queue insert failed: {e}")
            return None


# Global instance
_supabase_client: Optional[SupabaseClient] = None


def get_supabase_client() -> SupabaseClient:
    """Get global Supabase client."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = SupabaseClient()
    return _supabase_client


async def log_to_supabase(agent_id: str, action: str, status: str, **kwargs) -> bool:
    """Quick helper to log activity."""
    client = get_supabase_client()
    return await client.log_activity(agent_id, action, status, **kwargs)
