"""Tool registry for managing agent tools."""

from typing import Any, Callable, Dict, List, Optional

from langchain_core.tools import StructuredTool
from loguru import logger


class ToolRegistry:
    """Registry for managing tools available to agents."""
    
    def __init__(self):
        """Initialize tool registry."""
        self.tools: Dict[str, StructuredTool] = {}
        self.categories: Dict[str, List[str]] = {}
        logger.info("Initialized ToolRegistry")
    
    def register_tool(
        self,
        name: str,
        func: Callable,
        description: str,
        category: str = "general",
        args_schema: Optional[Any] = None,
    ) -> None:
        """Register a tool.
        
        Args:
            name: Tool name
            func: Tool function
            description: Tool description
            category: Tool category
            args_schema: Pydantic schema for arguments
        """
        tool = StructuredTool.from_function(
            func=func,
            name=name,
            description=description,
            args_schema=args_schema,
        )
        
        self.tools[name] = tool
        
        if category not in self.categories:
            self.categories[category] = []
        self.categories[category].append(name)
        
        logger.info(f"Registered tool: {name} (category: {category})")
    
    def get_tool(self, name: str) -> Optional[StructuredTool]:
        """Get a tool by name.
        
        Args:
            name: Tool name
            
        Returns:
            Tool or None
        """
        return self.tools.get(name)
    
    def get_tools_by_category(self, category: str) -> List[StructuredTool]:
        """Get all tools in a category.
        
        Args:
            category: Category name
            
        Returns:
            List of tools
        """
        tool_names = self.categories.get(category, [])
        return [self.tools[name] for name in tool_names if name in self.tools]
    
    def get_all_tools(self) -> List[StructuredTool]:
        """Get all registered tools.
        
        Returns:
            List of all tools
        """
        return list(self.tools.values())
    
    def list_tools(self) -> Dict[str, str]:
        """List all tools with descriptions.
        
        Returns:
            Dictionary of tool names to descriptions
        """
        return {
            name: tool.description
            for name, tool in self.tools.items()
        }
    
    def list_categories(self) -> List[str]:
        """List all tool categories.
        
        Returns:
            List of category names
        """
        return list(self.categories.keys())


# Global tool registry instance
_tool_registry: Optional[ToolRegistry] = None


def get_tool_registry() -> ToolRegistry:
    """Get global tool registry instance.
    
    Returns:
        ToolRegistry instance
    """
    global _tool_registry
    if _tool_registry is None:
        _tool_registry = ToolRegistry()
    return _tool_registry
