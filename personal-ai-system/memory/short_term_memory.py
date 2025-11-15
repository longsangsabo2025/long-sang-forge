"""Short-term memory using Redis."""

import json
from typing import Any, Dict, List, Optional

from loguru import logger
from redis import Redis

from core.config import get_settings


class ShortTermMemory:
    """Short-term memory cache using Redis."""
    
    def __init__(self, ttl_seconds: int = 86400):
        """Initialize short-term memory.
        
        Args:
            ttl_seconds: Time-to-live for cached items (default 24h)
        """
        settings = get_settings()
        
        self.ttl_seconds = ttl_seconds
        self.redis_client = Redis(
            host=settings.memory.redis_host,
            port=settings.memory.redis_port,
            password=settings.memory.redis_password,
            decode_responses=True,
        )
        
        # Test connection
        try:
            self.redis_client.ping()
            logger.info("Connected to Redis for short-term memory")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}")
            self.redis_client = None
    
    def store(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
    ) -> bool:
        """Store value in short-term memory.
        
        Args:
            key: Storage key
            value: Value to store (will be JSON serialized)
            ttl: Custom TTL in seconds
            
        Returns:
            True if stored successfully
        """
        if not self.redis_client:
            logger.warning("Redis not available, skipping cache")
            return False
        
        try:
            serialized_value = json.dumps(value)
            ttl = ttl or self.ttl_seconds
            
            self.redis_client.setex(
                key,
                ttl,
                serialized_value,
            )
            
            logger.debug(f"Stored in cache: {key} (TTL: {ttl}s)")
            return True
        
        except Exception as e:
            logger.error(f"Error storing in cache: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from short-term memory.
        
        Args:
            key: Storage key
            
        Returns:
            Stored value or None
        """
        if not self.redis_client:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
        
        except Exception as e:
            logger.error(f"Error getting from cache: {e}")
        
        return None
    
    def delete(self, key: str) -> bool:
        """Delete value from short-term memory.
        
        Args:
            key: Storage key
            
        Returns:
            True if deleted
        """
        if not self.redis_client:
            return False
        
        try:
            result = self.redis_client.delete(key)
            logger.debug(f"Deleted from cache: {key}")
            return bool(result)
        
        except Exception as e:
            logger.error(f"Error deleting from cache: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache.
        
        Args:
            key: Storage key
            
        Returns:
            True if exists
        """
        if not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Error checking cache: {e}")
            return False
    
    def get_keys(self, pattern: str = "*") -> List[str]:
        """Get all keys matching pattern.
        
        Args:
            pattern: Key pattern (Redis glob pattern)
            
        Returns:
            List of matching keys
        """
        if not self.redis_client:
            return []
        
        try:
            return self.redis_client.keys(pattern)
        except Exception as e:
            logger.error(f"Error getting keys: {e}")
            return []
    
    def clear_all(self) -> bool:
        """Clear all cached data.
        
        Returns:
            True if successful
        """
        if not self.redis_client:
            return False
        
        try:
            self.redis_client.flushdb()
            logger.warning("Cleared all short-term memory")
            return True
        
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False


# Global instance
_short_term_memory: Optional[ShortTermMemory] = None


def get_short_term_memory() -> ShortTermMemory:
    """Get global short-term memory instance.
    
    Returns:
        ShortTermMemory instance
    """
    global _short_term_memory
    if _short_term_memory is None:
        _short_term_memory = ShortTermMemory()
    return _short_term_memory
