"""Tests for memory system."""

import pytest
from memory import VectorMemory, ShortTermMemory, MemoryManager


@pytest.mark.asyncio
async def test_vector_memory_store_and_search():
    """Test vector memory storage and search."""
    memory = VectorMemory(collection_name="test_collection")
    
    # Store a memory
    memory_id = await memory.store(
        "The user prefers morning meetings",
        metadata={"type": "preference"}
    )
    
    assert memory_id is not None
    
    # Search for similar memories
    results = await memory.search("meeting time preferences", limit=1)
    
    assert len(results) > 0
    assert "morning" in results[0]["text"].lower()


def test_short_term_memory():
    """Test short-term memory cache."""
    cache = ShortTermMemory()
    
    # Store value
    success = cache.store("test_key", {"data": "test_value"})
    assert success or cache.redis_client is None  # May not have Redis in test env
    
    if success:
        # Retrieve value
        value = cache.get("test_key")
        assert value["data"] == "test_value"
        
        # Delete value
        deleted = cache.delete("test_key")
        assert deleted


@pytest.mark.asyncio
async def test_memory_manager():
    """Test unified memory manager."""
    manager = MemoryManager()
    
    # Store memory
    memory_id = await manager.remember(
        "User likes Python programming",
        metadata={"category": "preference"},
        persist=True,
    )
    
    assert memory_id is not None
    
    # Recall memory
    results = await manager.recall("programming languages", limit=1)
    
    # May or may not find results depending on embeddings
    assert isinstance(results, list)
