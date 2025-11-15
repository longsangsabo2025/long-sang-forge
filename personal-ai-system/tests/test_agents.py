"""Tests for AI agents."""

import pytest
from agents import OrchestratorAgent, WorkAgent, LifeAgent, ResearchAgent


@pytest.mark.asyncio
async def test_work_agent():
    """Test work agent processing."""
    agent = WorkAgent()
    
    result = await agent.process({
        "task": "Help me write an email to schedule a meeting"
    })
    
    assert result["success"] is True
    assert "response" in result
    assert result["agent"] == "WorkAgent"


@pytest.mark.asyncio
async def test_life_agent():
    """Test life agent processing."""
    agent = LifeAgent()
    
    result = await agent.process({
        "task": "Remind me to exercise tomorrow at 7am"
    })
    
    assert result["success"] is True
    assert "response" in result
    assert result["agent"] == "LifeAgent"


@pytest.mark.asyncio
async def test_research_agent():
    """Test research agent processing."""
    agent = ResearchAgent()
    
    result = await agent.process({
        "task": "Find information about AI agent architectures"
    })
    
    assert result["success"] is True
    assert "response" in result
    assert result["agent"] == "ResearchAgent"


@pytest.mark.asyncio
async def test_orchestrator_routing():
    """Test orchestrator routing logic."""
    orchestrator = OrchestratorAgent()
    
    # Test work routing
    result = await orchestrator.process({
        "task": "Schedule a meeting for tomorrow"
    })
    assert result["agent"] == "work_agent"
    
    # Test life routing
    result = await orchestrator.process({
        "task": "Set a reminder for my dentist appointment"
    })
    assert result["agent"] == "life_agent"
    
    # Test research routing
    result = await orchestrator.process({
        "task": "Search for the latest AI research papers"
    })
    assert result["agent"] == "research_agent"
