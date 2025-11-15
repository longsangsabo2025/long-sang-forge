"""Unified memory manager coordinating short and long-term memory."""

from typing import Any, Dict, List, Optional

from loguru import logger

from .short_term_memory import ShortTermMemory, get_short_term_memory
from .vector_store import VectorMemory, get_vector_memory


class MemoryManager:
    """Manages both short-term and long-term memory."""
    
    def __init__(
        self,
        short_term: Optional[ShortTermMemory] = None,
        long_term: Optional[VectorMemory] = None,
    ):
        """Initialize memory manager.
        
        Args:
            short_term: Short-term memory instance
            long_term: Long-term memory instance
        """
        self.short_term = short_term or get_short_term_memory()
        self.long_term = long_term or get_vector_memory()
        logger.info("Initialized MemoryManager")
    
    async def remember(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
        cache_key: Optional[str] = None,
        persist: bool = True,
    ) -> str:
        """Store information in memory.
        
        Args:
            text: Text to remember
            metadata: Associated metadata
            cache_key: Optional key for short-term cache
            persist: Whether to persist to long-term memory
            
        Returns:
            Memory ID
        """
        memory_id = None
        
        # Store in long-term memory
        if persist:
            memory_id = await self.long_term.store(text, metadata)
            logger.debug(f"Stored in long-term memory: {memory_id}")
        
        # Store in short-term cache
        if cache_key:
            cache_data = {
                "text": text,
                "metadata": metadata,
                "memory_id": memory_id,
            }
            self.short_term.store(cache_key, cache_data)
            logger.debug(f"Cached with key: {cache_key}")
        
        return memory_id or cache_key or ""
    
    async def recall(
        self,
        query: str,
        use_cache: bool = True,
        cache_key: Optional[str] = None,
        limit: int = 5,
        score_threshold: float = 0.7,
    ) -> List[Dict[str, Any]]:
        """Recall relevant memories.
        
        Args:
            query: Search query
            use_cache: Check short-term cache first
            cache_key: Specific cache key to check
            limit: Maximum results from long-term memory
            score_threshold: Minimum similarity score
            
        Returns:
            List of relevant memories
        """
        results = []
        
        # Check short-term cache first
        if use_cache and cache_key:
            cached = self.short_term.get(cache_key)
            if cached:
                logger.debug(f"Cache hit: {cache_key}")
                results.append({
                    "text": cached.get("text"),
                    "metadata": cached.get("metadata", {}),
                    "source": "cache",
                    "score": 1.0,
                })
                return results
        
        # Search long-term memory
        memories = await self.long_term.search(
            query,
            limit=limit,
            score_threshold=score_threshold,
        )
        
        for memory in memories:
            results.append({
                "text": memory["text"],
                "metadata": memory["metadata"],
                "source": "vector_db",
                "score": memory["score"],
                "id": memory["id"],
            })
        
        logger.debug(f"Recalled {len(results)} memories for: {query[:50]}...")
        return results
    
    async def forget(
        self,
        memory_id: Optional[str] = None,
        cache_key: Optional[str] = None,
    ) -> bool:
        """Forget/delete a memory.
        
        Args:
            memory_id: Long-term memory ID
            cache_key: Short-term cache key
            
        Returns:
            True if deleted successfully
        """
        success = True
        
        if memory_id:
            success = success and await self.long_term.delete(memory_id)
        
        if cache_key:
            success = success and self.short_term.delete(cache_key)
        
        return success
    
    async def get_context(
        self,
        query: str,
        max_memories: int = 3,
    ) -> str:
        """Get relevant context for a query.
        
        Args:
            query: Query to get context for
            max_memories: Maximum number of memories to include
            
        Returns:
            Formatted context string
        """
        memories = await self.recall(query, limit=max_memories)
        
        if not memories:
            return ""
        
        context_parts = ["Relevant context from memory:"]
        for i, memory in enumerate(memories, 1):
            context_parts.append(f"{i}. {memory['text']}")
        
        return "\n".join(context_parts)
    
    def clear_cache(self) -> bool:
        """Clear short-term cache.
        
        Returns:
            True if successful
        """
        return self.short_term.clear_all()
    
    def clear_all_memory(self) -> bool:
        """Clear all memory (USE WITH CAUTION).
        
        Returns:
            True if successful
        """
        logger.warning("Clearing ALL memory!")
        cache_cleared = self.short_term.clear_all()
        vector_cleared = self.long_term.clear_all()
        return cache_cleared and vector_cleared


# Global instance
_memory_manager: Optional[MemoryManager] = None


def get_memory_manager() -> MemoryManager:
    """Get global memory manager instance.
    
    Returns:
        MemoryManager instance
    """
    global _memory_manager
    if _memory_manager is None:
        _memory_manager = MemoryManager()
    return _memory_manager
