"""
Content Creator Crew using CrewAI.

This crew demonstrates multi-agent collaboration for content creation:
- Researcher: Gathers information and sources
- Writer: Creates engaging content
- Editor: Reviews and polishes the final output
"""

from typing import Dict, Any, List, Optional
import logging

try:
    from crewai import Agent, Task, Crew, Process
    from crewai.tools import tool
    CREWAI_AVAILABLE = True
except ImportError:
    CREWAI_AVAILABLE = False
    Agent = None
    Task = None
    Crew = None
    Process = None

from core.llm_factory import LLMFactory

logger = logging.getLogger(__name__)


# Define custom tools for the crew
if CREWAI_AVAILABLE:
    @tool
    def web_search_tool(query: str) -> str:
        """
        Search the web for information on a given query.
        
        Args:
            query: Search query string
            
        Returns:
            Search results as formatted text
        """
        # This would integrate with actual web search
        # For now, return a placeholder
        logger.info(f"Web search: {query}")
        return f"Search results for: {query}\n[Placeholder - integrate with actual search API]"
    
    
    @tool
    def seo_analyzer_tool(content: str) -> Dict[str, Any]:
        """
        Analyze content for SEO optimization.
        
        Args:
            content: Content to analyze
            
        Returns:
            SEO analysis results
        """
        logger.info("Analyzing content for SEO")
        
        # Basic analysis (would be more sophisticated in production)
        word_count = len(content.split())
        
        return {
            "word_count": word_count,
            "readability_score": "Good" if word_count > 300 else "Needs improvement",
            "suggestions": [
                "Add more subheadings",
                "Include relevant keywords",
                "Optimize meta description"
            ]
        }
    
    
    @tool
    def grammar_checker_tool(text: str) -> Dict[str, Any]:
        """
        Check grammar and spelling in text.
        
        Args:
            text: Text to check
            
        Returns:
            Grammar check results
        """
        logger.info("Checking grammar")
        
        return {
            "errors_found": 0,
            "quality_score": 95,
            "suggestions": []
        }


class ContentCreatorCrew:
    """
    A specialized crew for creating high-quality content.
    
    The crew consists of:
    1. Researcher - Gathers information and sources
    2. Writer - Creates engaging, SEO-optimized content
    3. Editor - Reviews and polishes the final output
    
    Example:
        crew = ContentCreatorCrew()
        result = await crew.create_content(
            topic="AI Agent Systems",
            keywords=["AI", "automation", "agents"],
            tone="professional"
        )
    """
    
    def __init__(self, llm_provider: str = "openai", model: str = "gpt-4o"):
        """
        Initialize the content creator crew.
        
        Args:
            llm_provider: LLM provider to use (openai, anthropic, etc.)
            model: Specific model to use
        """
        if not CREWAI_AVAILABLE:
            raise ImportError(
                "CrewAI is not installed. Install with: pip install crewai crewai-tools"
            )
        
        self.llm_factory = LLMFactory()
        self.llm = self.llm_factory.get_llm(llm_provider, model)
        
        # Initialize agents
        self.researcher = self._create_researcher()
        self.writer = self._create_writer()
        self.editor = self._create_editor()
        
        logger.info("ContentCreatorCrew initialized")
    
    def _create_researcher(self) -> Agent:
        """Create the researcher agent."""
        return Agent(
            role="Content Researcher",
            goal="Gather comprehensive, accurate information on any given topic",
            backstory="""You are an expert researcher with years of experience in 
            gathering information from various sources. You have a keen eye for 
            credible sources and can quickly identify key insights. Your research 
            forms the foundation for high-quality content.""",
            tools=[web_search_tool] if CREWAI_AVAILABLE else [],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def _create_writer(self) -> Agent:
        """Create the writer agent."""
        return Agent(
            role="Content Writer",
            goal="Create engaging, well-structured, SEO-optimized content",
            backstory="""You are a professional content writer with 10+ years of 
            experience. You excel at transforming research into compelling narratives 
            that engage readers. You understand SEO principles and know how to balance 
            optimization with readability. Your writing is clear, concise, and 
            impactful.""",
            tools=[seo_analyzer_tool] if CREWAI_AVAILABLE else [],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def _create_editor(self) -> Agent:
        """Create the editor agent."""
        return Agent(
            role="Content Editor",
            goal="Review and polish content to ensure highest quality",
            backstory="""You are a meticulous editor with an eye for detail. You 
            ensure every piece of content meets the highest standards of quality, 
            clarity, and correctness. You check for grammar, style consistency, 
            factual accuracy, and overall flow. Nothing escapes your careful review.""",
            tools=[grammar_checker_tool] if CREWAI_AVAILABLE else [],
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
    
    def _create_research_task(
        self,
        topic: str,
        keywords: Optional[List[str]] = None
    ) -> Task:
        """Create research task."""
        keywords_str = ", ".join(keywords) if keywords else "N/A"
        
        return Task(
            description=f"""Research the topic: {topic}
            
            Focus on:
            - Key concepts and definitions
            - Recent developments and trends
            - Expert opinions and insights
            - Relevant statistics and data
            - Practical applications and examples
            
            Keywords to focus on: {keywords_str}
            
            Provide a comprehensive research summary with sources.""",
            agent=self.researcher,
            expected_output="Detailed research summary with key findings and sources"
        )
    
    def _create_writing_task(
        self,
        topic: str,
        tone: str,
        keywords: Optional[List[str]] = None
    ) -> Task:
        """Create writing task."""
        keywords_str = ", ".join(keywords) if keywords else "N/A"
        
        return Task(
            description=f"""Using the research provided, write a comprehensive article about: {topic}
            
            Requirements:
            - Tone: {tone}
            - Length: 1500-2000 words
            - Include: Introduction, multiple sections, conclusion
            - Incorporate keywords naturally: {keywords_str}
            - Use clear headings and subheadings
            - Include examples where relevant
            - Make it engaging and valuable for readers
            
            Format the output in Markdown.""",
            agent=self.writer,
            expected_output="Well-structured article in Markdown format",
            context=[self._create_research_task(topic, keywords)]  # Depends on research
        )
    
    def _create_editing_task(self, topic: str) -> Task:
        """Create editing task."""
        return Task(
            description=f"""Review and edit the article about: {topic}
            
            Check for:
            - Grammar and spelling errors
            - Clarity and readability
            - Logical flow and structure
            - Factual accuracy
            - Tone consistency
            - SEO optimization
            
            Provide the final polished version with any necessary corrections.
            Also include a brief editor's note highlighting key improvements made.""",
            agent=self.editor,
            expected_output="Final polished article with editor's notes",
            context=[self._create_writing_task(topic, "professional")]  # Depends on writing
        )
    
    async def create_content(
        self,
        topic: str,
        keywords: Optional[List[str]] = None,
        tone: str = "professional",
        process: str = "sequential"
    ) -> Dict[str, Any]:
        """
        Create content using the full crew.
        
        Args:
            topic: Topic to write about
            keywords: Optional list of SEO keywords
            tone: Tone of the content (professional, casual, technical, etc.)
            process: Process type - "sequential" or "hierarchical"
            
        Returns:
            Dictionary containing the final content and metadata
        """
        try:
            logger.info(f"Starting content creation for: {topic}")
            
            # Create tasks
            research_task = self._create_research_task(topic, keywords)
            writing_task = self._create_writing_task(topic, tone, keywords)
            editing_task = self._create_editing_task(topic)
            
            # Create crew
            crew = Crew(
                agents=[self.researcher, self.writer, self.editor],
                tasks=[research_task, writing_task, editing_task],
                process=Process.sequential if process == "sequential" else Process.hierarchical,
                verbose=True
            )
            
            # Execute crew
            logger.info("Executing content creation crew...")
            result = await crew.kickoff_async()
            
            logger.info("Content creation completed successfully")
            
            return {
                "success": True,
                "topic": topic,
                "content": result,
                "metadata": {
                    "keywords": keywords,
                    "tone": tone,
                    "process": process,
                    "agents_used": ["researcher", "writer", "editor"]
                }
            }
            
        except Exception as e:
            logger.error(f"Content creation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "topic": topic
            }
    
    async def research_only(self, topic: str, keywords: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Run only the research phase.
        
        Args:
            topic: Topic to research
            keywords: Optional keywords to focus on
            
        Returns:
            Research results
        """
        try:
            research_task = self._create_research_task(topic, keywords)
            
            crew = Crew(
                agents=[self.researcher],
                tasks=[research_task],
                process=Process.sequential,
                verbose=True
            )
            
            result = await crew.kickoff_async()
            
            return {
                "success": True,
                "topic": topic,
                "research": result
            }
            
        except Exception as e:
            logger.error(f"Research failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def write_from_research(
        self,
        topic: str,
        research: str,
        tone: str = "professional",
        keywords: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Write content based on provided research.
        
        Args:
            topic: Topic to write about
            research: Research material to base content on
            tone: Tone of the content
            keywords: Optional SEO keywords
            
        Returns:
            Written content
        """
        try:
            writing_task = self._create_writing_task(topic, tone, keywords)
            
            # Inject research into task context
            writing_task.description = f"{writing_task.description}\n\nResearch material:\n{research}"
            
            crew = Crew(
                agents=[self.writer],
                tasks=[writing_task],
                process=Process.sequential,
                verbose=True
            )
            
            result = await crew.kickoff_async()
            
            return {
                "success": True,
                "topic": topic,
                "content": result,
                "tone": tone
            }
            
        except Exception as e:
            logger.error(f"Writing failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Example usage function
async def example_usage():
    """Example of how to use the ContentCreatorCrew."""
    
    # Initialize crew
    crew = ContentCreatorCrew(llm_provider="openai", model="gpt-4o")
    
    # Create full content
    result = await crew.create_content(
        topic="The Future of AI Agents in Business Automation",
        keywords=["AI agents", "automation", "business efficiency", "AI tools"],
        tone="professional"
    )
    
    if result["success"]:
        print("Content created successfully!")
        print(f"\nContent:\n{result['content']}")
    else:
        print(f"Error: {result['error']}")
    
    # Or do research only
    research = await crew.research_only(
        topic="AI Agent Frameworks",
        keywords=["LangGraph", "CrewAI", "AutoGen"]
    )
    
    print(f"\nResearch results:\n{research}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(example_usage())
