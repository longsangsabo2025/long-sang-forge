"""Vector store for long-term memory using Qdrant."""

import uuid
from typing import Any, Dict, List, Optional

from langchain_openai import OpenAIEmbeddings
from loguru import logger
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from core.config import get_settings


class VectorMemory:
    """Vector-based long-term memory using Qdrant."""
    
    def __init__(
        self,
        collection_name: Optional[str] = None,
        embedding_model: Optional[Any] = None,
    ):
        """Initialize vector memory.
        
        Args:
            collection_name: Name of Qdrant collection
            embedding_model: Embedding model to use
        """
        settings = get_settings()
        
        self.collection_name = collection_name or settings.memory.collection_name
        
        # Initialize Qdrant client
        self.client = QdrantClient(
            host=settings.memory.qdrant_host,
            port=settings.memory.qdrant_port,
            api_key=settings.memory.qdrant_api_key,
        )
        
        # Initialize embeddings
        if embedding_model:
            self.embeddings = embedding_model
        else:
            self.embeddings = OpenAIEmbeddings(
                model="text-embedding-3-small",
                openai_api_key=settings.llm.openai_api_key,
            )
        
        # Ensure collection exists
        self._ensure_collection()
        
        logger.info(f"Initialized VectorMemory with collection: {self.collection_name}")
    
    def _ensure_collection(self) -> None:
        """Ensure the collection exists, create if not."""
        try:
            collections = self.client.get_collections().collections
            collection_names = [c.name for c in collections]
            
            if self.collection_name not in collection_names:
                settings = get_settings()
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=settings.memory.embedding_dimension,
                        distance=Distance.COSINE,
                    ),
                )
                logger.info(f"Created collection: {self.collection_name}")
        
        except Exception as e:
            logger.error(f"Error ensuring collection: {e}")
            raise
    
    async def store(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
        memory_id: Optional[str] = None,
    ) -> str:
        """Store text in vector memory.
        
        Args:
            text: Text to store
            metadata: Associated metadata
            memory_id: Optional ID for the memory
            
        Returns:
            Memory ID
        """
        # Generate embedding
        embedding = await self.embeddings.aembed_query(text)
        
        # Generate ID if not provided
        if not memory_id:
            memory_id = str(uuid.uuid4())
        
        # Prepare payload
        payload = {
            "text": text,
            "metadata": metadata or {},
        }
        
        # Store in Qdrant
        point = PointStruct(
            id=memory_id,
            vector=embedding,
            payload=payload,
        )
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=[point],
        )
        
        logger.debug(f"Stored memory: {memory_id}")
        return memory_id
    
    async def search(
        self,
        query: str,
        limit: int = 5,
        score_threshold: float = 0.7,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Search for similar memories.
        
        Args:
            query: Search query
            limit: Maximum number of results
            score_threshold: Minimum similarity score
            filter_metadata: Optional metadata filters
            
        Returns:
            List of matching memories with scores
        """
        # Generate query embedding
        query_embedding = await self.embeddings.aembed_query(query)
        
        # Search in Qdrant
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            limit=limit,
            score_threshold=score_threshold,
        )
        
        # Format results
        memories = []
        for result in results:
            memories.append({
                "id": result.id,
                "text": result.payload.get("text"),
                "metadata": result.payload.get("metadata", {}),
                "score": result.score,
            })
        
        logger.debug(f"Found {len(memories)} memories for query: {query[:50]}...")
        return memories
    
    async def get_by_id(self, memory_id: str) -> Optional[Dict[str, Any]]:
        """Get memory by ID.
        
        Args:
            memory_id: Memory ID
            
        Returns:
            Memory data or None
        """
        try:
            result = self.client.retrieve(
                collection_name=self.collection_name,
                ids=[memory_id],
            )
            
            if result:
                point = result[0]
                return {
                    "id": point.id,
                    "text": point.payload.get("text"),
                    "metadata": point.payload.get("metadata", {}),
                }
        
        except Exception as e:
            logger.error(f"Error retrieving memory {memory_id}: {e}")
        
        return None
    
    async def delete(self, memory_id: str) -> bool:
        """Delete a memory.
        
        Args:
            memory_id: Memory ID
            
        Returns:
            True if deleted successfully
        """
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=[memory_id],
            )
            logger.debug(f"Deleted memory: {memory_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error deleting memory {memory_id}: {e}")
            return False
    
    def clear_all(self) -> bool:
        """Clear all memories from collection.
        
        Returns:
            True if successful
        """
        try:
            self.client.delete_collection(self.collection_name)
            self._ensure_collection()
            logger.warning("Cleared all memories from collection")
            return True
        
        except Exception as e:
            logger.error(f"Error clearing memories: {e}")
            return False


# Global instance
_vector_memory: Optional[VectorMemory] = None


def get_vector_memory() -> VectorMemory:
    """Get global vector memory instance.
    
    Returns:
        VectorMemory instance
    """
    global _vector_memory
    if _vector_memory is None:
        _vector_memory = VectorMemory()
    return _vector_memory
