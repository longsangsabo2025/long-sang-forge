"""
Example: Content Creation with CrewAI

This example demonstrates multi-agent collaboration using CrewAI.
The crew consists of:
- Researcher: Gathers information
- Writer: Creates content
- Editor: Polishes the output
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.specialized.content_creator_crew import ContentCreatorCrew


async def example_full_content_creation():
    """Example: Full content creation workflow."""
    print("=" * 60)
    print("CrewAI Content Creation Example")
    print("=" * 60)
    print()
    
    # Initialize crew
    print("👥 Initializing Content Creator Crew...")
    crew = ContentCreatorCrew(
        llm_provider="openai",
        model="gpt-4o"
    )
    print("   ✓ Crew initialized with 3 agents")
    print("     - Researcher")
    print("     - Writer")
    print("     - Editor")
    print()
    
    # Create content
    print("▶️  Executing content creation workflow...")
    print("-" * 60)
    
    result = await crew.create_content(
        topic="Building Multi-Agent AI Systems with LangGraph and CrewAI",
        keywords=[
            "AI agents",
            "LangGraph",
            "CrewAI",
            "automation",
            "multi-agent systems"
        ],
        tone="professional"
    )
    
    print("-" * 60)
    print()
    
    # Display results
    if result["success"]:
        print("✅ Content creation successful!")
        print()
        print("📝 Generated Content:")
        print("-" * 60)
        print(result["content"])
        print("-" * 60)
        print()
        print("📊 Metadata:")
        print(f"   Topic: {result['topic']}")
        print(f"   Keywords: {', '.join(result['metadata']['keywords'])}")
        print(f"   Tone: {result['metadata']['tone']}")
        print(f"   Agents Used: {', '.join(result['metadata']['agents_used'])}")
    else:
        print("❌ Content creation failed")
        print(f"   Error: {result['error']}")
    
    print()
    print("=" * 60)


async def example_research_only():
    """Example: Research phase only."""
    print("\n" + "=" * 60)
    print("CrewAI Research-Only Example")
    print("=" * 60)
    print()
    
    crew = ContentCreatorCrew()
    
    print("🔍 Running research phase...")
    print("-" * 60)
    
    result = await crew.research_only(
        topic="Latest trends in AI agent frameworks",
        keywords=["LangGraph", "AutoGen", "Semantic Kernel"]
    )
    
    print("-" * 60)
    print()
    
    if result["success"]:
        print("✅ Research completed!")
        print()
        print("📚 Research Results:")
        print("-" * 60)
        print(result["research"])
        print("-" * 60)
    else:
        print(f"❌ Research failed: {result['error']}")
    
    print()


async def example_write_from_research():
    """Example: Write content from provided research."""
    print("\n" + "=" * 60)
    print("CrewAI Write-from-Research Example")
    print("=" * 60)
    print()
    
    crew = ContentCreatorCrew()
    
    # Simulated research data
    research = """
    Key Findings on AI Agent Frameworks:
    
    1. LangGraph: Graph-based workflow orchestration
       - Stateful execution
       - Human-in-the-loop capabilities
       - Part of LangChain ecosystem
    
    2. CrewAI: Role-based multi-agent collaboration
       - Simple API design
       - Built-in collaboration patterns
       - Task delegation support
    
    3. AutoGen: Conversational agents
       - Multi-agent conversations
       - Code execution capabilities
       - Microsoft backing
    """
    
    print("✍️  Writing content from research...")
    print("-" * 60)
    
    result = await crew.write_from_research(
        topic="Comparing Top AI Agent Frameworks",
        research=research,
        tone="professional",
        keywords=["AI frameworks", "comparison", "agent systems"]
    )
    
    print("-" * 60)
    print()
    
    if result["success"]:
        print("✅ Writing completed!")
        print()
        print("📝 Written Content:")
        print("-" * 60)
        print(result["content"])
        print("-" * 60)
    else:
        print(f"❌ Writing failed: {result['error']}")
    
    print()


async def main():
    """Run all examples."""
    
    # Example 1: Full content creation
    await example_full_content_creation()
    
    # Example 2: Research only
    await example_research_only()
    
    # Example 3: Write from research
    await example_write_from_research()
    
    print("=" * 60)
    print("All examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    # Run specific example or all
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "full":
            asyncio.run(example_full_content_creation())
        elif sys.argv[1] == "research":
            asyncio.run(example_research_only())
        elif sys.argv[1] == "write":
            asyncio.run(example_write_from_research())
        else:
            print(f"Unknown example: {sys.argv[1]}")
            print("Available: full, research, write")
    else:
        asyncio.run(main())
