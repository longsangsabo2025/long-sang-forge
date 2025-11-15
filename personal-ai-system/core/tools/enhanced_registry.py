"""
Enhanced Tool Registry with LangChain integration.

This registry extends the base tool registry with:
- LangChain tool wrappers
- Tool discovery and registration
- Tool categories and metadata
- Dynamic tool loading
"""

from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import logging

try:
    from langchain_core.tools import BaseTool, tool
    from langchain_community.tools import DuckDuckGoSearchRun
    from langchain_community.utilities import WikipediaAPIWrapper
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    BaseTool = None
    tool = None

logger = logging.getLogger(__name__)


class ToolCategory(Enum):
    """Tool categories."""
    WEB_SEARCH = "web_search"
    DATA_PROCESSING = "data_processing"
    FILE_OPERATIONS = "file_operations"
    COMMUNICATION = "communication"
    ANALYSIS = "analysis"
    CODE_EXECUTION = "code_execution"
    INTEGRATION = "integration"
    UTILITY = "utility"


@dataclass
class ToolMetadata:
    """Metadata for a registered tool."""
    name: str
    description: str
    category: ToolCategory
    version: str
    author: str
    requires_api_key: bool
    cost_per_use: float  # Estimated cost in USD
    avg_execution_time: float  # Seconds
    tags: List[str]


class EnhancedToolRegistry:
    """
    Enhanced tool registry with LangChain integration.
    
    Features:
    - Register custom and LangChain tools
    - Tool discovery and search
    - Category-based organization
    - Usage tracking
    - Cost estimation
    
    Example:
        registry = EnhancedToolRegistry()
        
        # Register a custom tool
        @registry.register_tool(
            category=ToolCategory.WEB_SEARCH,
            description="Search using DuckDuckGo"
        )
        def web_search(query: str) -> str:
            return search_results
        
        # Get tools by category
        search_tools = registry.get_tools_by_category(ToolCategory.WEB_SEARCH)
        
        # Get tool for LangChain agent
        tool = registry.get_tool("web_search")
    """
    
    def __init__(self):
        """Initialize the enhanced tool registry."""
        self.tools: Dict[str, Any] = {}
        self.metadata: Dict[str, ToolMetadata] = {}
        self.usage_stats: Dict[str, Dict[str, int]] = {}
        
        # Auto-register built-in tools
        self._register_builtin_tools()
        
        logger.info("EnhancedToolRegistry initialized")
    
    def _register_builtin_tools(self):
        """Register built-in LangChain tools."""
        if not LANGCHAIN_AVAILABLE:
            logger.warning("LangChain not available, skipping built-in tools")
            return
        
        try:
            # DuckDuckGo Search
            ddg_search = DuckDuckGoSearchRun()
            self.register_langchain_tool(
                tool=ddg_search,
                category=ToolCategory.WEB_SEARCH,
                metadata={
                    "version": "1.0",
                    "author": "LangChain",
                    "requires_api_key": False,
                    "cost_per_use": 0.0,
                    "tags": ["search", "web", "free"]
                }
            )
            logger.info("Registered DuckDuckGo search tool")
            
        except Exception as e:
            logger.warning(f"Could not register built-in tools: {e}")
    
    def register_tool(
        self,
        category: ToolCategory,
        description: str,
        version: str = "1.0",
        author: str = "Custom",
        requires_api_key: bool = False,
        cost_per_use: float = 0.0,
        avg_execution_time: float = 1.0,
        tags: Optional[List[str]] = None
    ) -> Callable:
        """
        Decorator to register a custom tool.
        
        Args:
            category: Tool category
            description: Tool description
            version: Tool version
            author: Tool author
            requires_api_key: Whether tool requires API key
            cost_per_use: Estimated cost per use
            avg_execution_time: Average execution time in seconds
            tags: Optional tags for discovery
            
        Returns:
            Decorated function
        """
        def decorator(func: Callable) -> Callable:
            tool_name = func.__name__
            
            # Store the function
            self.tools[tool_name] = func
            
            # Store metadata
            self.metadata[tool_name] = ToolMetadata(
                name=tool_name,
                description=description,
                category=category,
                version=version,
                author=author,
                requires_api_key=requires_api_key,
                cost_per_use=cost_per_use,
                avg_execution_time=avg_execution_time,
                tags=tags or []
            )
            
            # Initialize usage stats
            self.usage_stats[tool_name] = {
                "total_calls": 0,
                "successful_calls": 0,
                "failed_calls": 0
            }
            
            logger.info(f"Registered tool: {tool_name} ({category.value})")
            
            return func
        
        return decorator
    
    def register_langchain_tool(
        self,
        tool: Any,
        category: ToolCategory,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Register a LangChain tool.
        
        Args:
            tool: LangChain tool instance
            category: Tool category
            metadata: Optional metadata dict
        """
        tool_name = tool.name
        
        self.tools[tool_name] = tool
        
        meta = metadata or {}
        self.metadata[tool_name] = ToolMetadata(
            name=tool_name,
            description=tool.description if hasattr(tool, 'description') else "",
            category=category,
            version=meta.get("version", "1.0"),
            author=meta.get("author", "LangChain"),
            requires_api_key=meta.get("requires_api_key", False),
            cost_per_use=meta.get("cost_per_use", 0.0),
            avg_execution_time=meta.get("avg_execution_time", 1.0),
            tags=meta.get("tags", [])
        )
        
        self.usage_stats[tool_name] = {
            "total_calls": 0,
            "successful_calls": 0,
            "failed_calls": 0
        }
        
        logger.info(f"Registered LangChain tool: {tool_name}")
    
    def get_tool(self, name: str) -> Optional[Any]:
        """
        Get a tool by name.
        
        Args:
            name: Tool name
            
        Returns:
            Tool instance or None
        """
        return self.tools.get(name)
    
    def get_tools_by_category(self, category: ToolCategory) -> List[Any]:
        """
        Get all tools in a category.
        
        Args:
            category: Tool category
            
        Returns:
            List of tools in the category
        """
        return [
            self.tools[name]
            for name, meta in self.metadata.items()
            if meta.category == category
        ]
    
    def search_tools(self, query: str) -> List[str]:
        """
        Search tools by name, description, or tags.
        
        Args:
            query: Search query
            
        Returns:
            List of matching tool names
        """
        query = query.lower()
        matches = []
        
        for name, meta in self.metadata.items():
            if (query in name.lower() or
                query in meta.description.lower() or
                any(query in tag.lower() for tag in meta.tags)):
                matches.append(name)
        
        return matches
    
    def get_all_tools(self) -> List[Any]:
        """Get all registered tools."""
        return list(self.tools.values())
    
    def get_tool_metadata(self, name: str) -> Optional[ToolMetadata]:
        """Get metadata for a tool."""
        return self.metadata.get(name)
    
    def list_tools(self) -> Dict[str, Dict[str, Any]]:
        """
        List all tools with their metadata.
        
        Returns:
            Dict mapping tool names to metadata
        """
        return {
            name: {
                "description": meta.description,
                "category": meta.category.value,
                "version": meta.version,
                "author": meta.author,
                "requires_api_key": meta.requires_api_key,
                "cost_per_use": meta.cost_per_use,
                "tags": meta.tags,
                "usage": self.usage_stats.get(name, {})
            }
            for name, meta in self.metadata.items()
        }
    
    def track_usage(self, tool_name: str, success: bool = True):
        """
        Track tool usage.
        
        Args:
            tool_name: Name of the tool
            success: Whether the call was successful
        """
        if tool_name in self.usage_stats:
            self.usage_stats[tool_name]["total_calls"] += 1
            if success:
                self.usage_stats[tool_name]["successful_calls"] += 1
            else:
                self.usage_stats[tool_name]["failed_calls"] += 1
    
    def estimate_cost(self, tool_names: List[str]) -> float:
        """
        Estimate total cost for using a set of tools.
        
        Args:
            tool_names: List of tool names
            
        Returns:
            Estimated cost in USD
        """
        total_cost = 0.0
        for name in tool_names:
            if name in self.metadata:
                total_cost += self.metadata[name].cost_per_use
        return total_cost
    
    def get_tools_for_agent(
        self,
        categories: Optional[List[ToolCategory]] = None,
        max_tools: Optional[int] = None,
        exclude_api_key_required: bool = False
    ) -> List[Any]:
        """
        Get tools suitable for an agent.
        
        Args:
            categories: Optional list of categories to include
            max_tools: Maximum number of tools to return
            exclude_api_key_required: Whether to exclude tools requiring API keys
            
        Returns:
            List of tools
        """
        tools = []
        
        for name, meta in self.metadata.items():
            # Filter by category
            if categories and meta.category not in categories:
                continue
            
            # Filter by API key requirement
            if exclude_api_key_required and meta.requires_api_key:
                continue
            
            tools.append(self.tools[name])
        
        # Limit number of tools
        if max_tools:
            tools = tools[:max_tools]
        
        return tools


# Global registry instance
_global_registry = None


def get_global_registry() -> EnhancedToolRegistry:
    """Get the global tool registry instance."""
    global _global_registry
    if _global_registry is None:
        _global_registry = EnhancedToolRegistry()
    return _global_registry


# Pre-register common tools
def register_common_tools(registry: EnhancedToolRegistry):
    """Register commonly used tools."""
    
    @registry.register_tool(
        category=ToolCategory.WEB_SEARCH,
        description="Search the web using DuckDuckGo",
        requires_api_key=False,
        cost_per_use=0.0,
        tags=["search", "web", "free"]
    )
    def web_search(query: str) -> str:
        """Search the web for information."""
        try:
            if LANGCHAIN_AVAILABLE:
                search = DuckDuckGoSearchRun()
                return search.run(query)
            else:
                return f"Search results for: {query} (DuckDuckGo not available)"
        except Exception as e:
            logger.error(f"Web search failed: {e}")
            return f"Search failed: {str(e)}"
    
    @registry.register_tool(
        category=ToolCategory.ANALYSIS,
        description="Analyze text for sentiment",
        requires_api_key=False,
        cost_per_use=0.0,
        tags=["nlp", "sentiment", "analysis"]
    )
    def sentiment_analysis(text: str) -> Dict[str, Any]:
        """Analyze sentiment of text."""
        # Simple sentiment analysis (would use proper NLP in production)
        positive_words = ["good", "great", "excellent", "amazing", "wonderful"]
        negative_words = ["bad", "terrible", "awful", "horrible", "poor"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = "positive"
            score = 0.7
        elif negative_count > positive_count:
            sentiment = "negative"
            score = 0.3
        else:
            sentiment = "neutral"
            score = 0.5
        
        return {
            "sentiment": sentiment,
            "score": score,
            "positive_indicators": positive_count,
            "negative_indicators": negative_count
        }
    
    @registry.register_tool(
        category=ToolCategory.UTILITY,
        description="Calculate mathematical expressions",
        requires_api_key=False,
        cost_per_use=0.0,
        tags=["math", "calculator", "utility"]
    )
    def calculator(expression: str) -> str:
        """Evaluate mathematical expressions safely."""
        try:
            # Very basic calculator (would use proper expression parser in production)
            result = eval(expression, {"__builtins__": {}}, {})
            return f"Result: {result}"
        except Exception as e:
            return f"Calculation error: {str(e)}"
    
    @registry.register_tool(
        category=ToolCategory.DATA_PROCESSING,
        description="Count words in text",
        requires_api_key=False,
        cost_per_use=0.0,
        tags=["text", "analysis", "utility"]
    )
    def word_counter(text: str) -> Dict[str, int]:
        """Count words, characters, and sentences in text."""
        words = len(text.split())
        chars = len(text)
        sentences = text.count('.') + text.count('!') + text.count('?')
        
        return {
            "words": words,
            "characters": chars,
            "sentences": sentences,
            "avg_word_length": round(chars / words, 2) if words > 0 else 0
        }
    
    logger.info("Common tools registered")


# Auto-register on import
_registry = get_global_registry()
register_common_tools(_registry)
