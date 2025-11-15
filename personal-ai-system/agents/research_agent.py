"""Research agent - handles information gathering and research tasks."""

from typing import Any, Dict, Optional

from langchain_core.language_models import BaseChatModel
from loguru import logger

from core.base_agent import BaseAgent
from core.llm_factory import LLMFactory
from memory.memory_manager import get_memory_manager


class ResearchAgent(BaseAgent):
    """Agent specialized in research and information gathering."""
    
    def __init__(
        self,
        name: str = "ResearchAgent",
        llm: Optional[BaseChatModel] = None,
    ):
        """Initialize research agent.
        
        Args:
            name: Agent name
            llm: Language model to use
        """
        if llm is None:
            llm = LLMFactory.create_reasoning_llm()
        
        super().__init__(
            name=name,
            role="Research and Information Specialist",
            llm=llm,
        )
        
        self.memory_manager = get_memory_manager()
    
    def _default_system_prompt(self) -> str:
        """Generate default system prompt."""
        return """You are an expert research assistant specialized in information gathering and analysis.

Your capabilities:
- Web search and information retrieval
- Document analysis and summarization
- Data synthesis from multiple sources
- Fact-checking and verification
- Trend analysis and monitoring
- Academic and technical research
- Competitive intelligence

Guidelines:
1. Be thorough and accurate
2. Cite sources when possible
3. Distinguish between facts and opinions
4. Provide balanced perspectives
5. Synthesize information clearly

When researching:
- Start with reliable sources
- Cross-reference information
- Identify key insights
- Organize findings logically
- Highlight important patterns or trends
- Note areas needing further investigation"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process research task.
        
        Args:
            input_data: Input containing task
            
        Returns:
            Processing result with findings
        """
        task = input_data.get("task", "")
        
        logger.info(f"ResearchAgent processing: {task[:100]}...")
        
        # Get relevant context from memory
        context = await self.memory_manager.get_context(task, max_memories=3)
        
        # Build research prompt
        if context:
            research_prompt = f"""Previous research context:
{context}

Research request: {task}

Please conduct thorough research on this topic."""
        else:
            research_prompt = f"Research request: {task}\n\nPlease conduct thorough research on this topic."
        
        try:
            # Get response from LLM
            response = await self.invoke(research_prompt)
            
            # Store research in memory
            await self.memory_manager.remember(
                f"Research: {task}\nFindings: {response}",
                metadata={
                    "agent": self.name,
                    "task_type": "research",
                },
                persist=True,
            )
            
            logger.info(f"ResearchAgent completed research")
            
            return {
                "success": True,
                "response": response,
                "agent": self.name,
                "task_type": "research",
            }
        
        except Exception as e:
            logger.error(f"ResearchAgent error: {e}")
            return {
                "success": False,
                "response": f"Error conducting research: {str(e)}",
                "error": str(e),
            }
    
    async def web_search(self, query: str, num_results: int = 5) -> Dict[str, Any]:
        """Perform web search.
        
        Args:
            query: Search query
            num_results: Number of results to return
            
        Returns:
            Search results
        """
        # Placeholder for web search
        # Will be implemented with actual search API (DuckDuckGo, Brave, etc.)
        prompt = f"Search the web for: {query} (top {num_results} results)"
        response = await self.invoke(prompt)
        
        return {
            "query": query,
            "results": response,
            "num_results": num_results,
        }
    
    async def summarize_document(self, document: str, max_length: int = 500) -> str:
        """Summarize a document.
        
        Args:
            document: Document text
            max_length: Maximum summary length
            
        Returns:
            Summary
        """
        prompt = f"""Summarize the following document in approximately {max_length} words:

{document}

Provide a clear, concise summary highlighting the key points."""
        
        return await self.invoke(prompt)
