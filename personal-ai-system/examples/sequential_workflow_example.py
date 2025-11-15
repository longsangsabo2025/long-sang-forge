"""
Example: Sequential Workflow with LangGraph

This example demonstrates how to create a sequential workflow where agents
execute one after another, passing context between steps.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.orchestrator import LangGraphOrchestrator, WorkflowBuilder
from agents import WorkAgent, ResearchAgent


async def main():
    print("=" * 60)
    print("Sequential Workflow Example")
    print("=" * 60)
    print()
    
    # Step 1: Initialize orchestrator
    print("📦 Initializing orchestrator...")
    orchestrator = LangGraphOrchestrator()
    
    # Step 2: Create and register agents
    print("🤖 Creating agents...")
    work_agent = WorkAgent()
    research_agent = ResearchAgent()
    
    orchestrator.register_agent("work_agent", work_agent)
    orchestrator.register_agent("research_agent", research_agent)
    print(f"   ✓ Registered {len(orchestrator.agents)} agents")
    print()
    
    # Step 3: Build sequential workflow
    print("🔨 Building sequential workflow...")
    builder = WorkflowBuilder(orchestrator)
    
    builder.sequential(
        name="content_creation_sequential",
        steps=[
            ("research", "research_agent"),
            ("outline", "work_agent"),
            ("write", "work_agent")
        ]
    )
    print("   ✓ Workflow built: Research → Outline → Write")
    print()
    
    # Step 4: Execute workflow
    print("▶️  Executing workflow...")
    print("-" * 60)
    
    result = await orchestrator.execute({
        "task": "Create a comprehensive guide about AI agent frameworks including LangGraph, CrewAI, and AutoGen",
        "target_length": "1500 words",
        "tone": "professional",
        "audience": "developers"
    })
    
    print("-" * 60)
    print()
    
    # Step 5: Display results
    print("📊 Execution Results:")
    print(f"   Status: {result['status']}")
    print(f"   Success: {result['success']}")
    print()
    
    if result['success']:
        print("📝 Intermediate Results:")
        for agent_name, agent_result in result['results'].items():
            print(f"\n   [{agent_name}]")
            print(f"   {str(agent_result)[:200]}...")
        
        print("\n💬 Message History:")
        for i, msg in enumerate(result['messages'], 1):
            print(f"   {i}. [{msg['role']}] {str(msg['content'])[:100]}...")
    else:
        print("❌ Workflow failed")
        if 'error' in result:
            print(f"   Error: {result['error']}")
    
    print()
    print("=" * 60)
    print("Example completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
