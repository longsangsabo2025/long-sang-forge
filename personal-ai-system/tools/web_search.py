"""Web search tool using DuckDuckGo."""

from typing import List, Dict, Any

from duckduckgo_search import DDGS
from loguru import logger


async def web_search_tool(
    query: str,
    max_results: int = 5,
) -> List[Dict[str, Any]]:
    """Search the web using DuckDuckGo.
    
    Args:
        query: Search query
        max_results: Maximum number of results
        
    Returns:
        List of search results
    """
    try:
        logger.info(f"Searching web for: {query}")
        
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        
        formatted_results = []
        for result in results:
            formatted_results.append({
                "title": result.get("title", ""),
                "url": result.get("href", ""),
                "snippet": result.get("body", ""),
            })
        
        logger.info(f"Found {len(formatted_results)} results")
        return formatted_results
    
    except Exception as e:
        logger.error(f"Web search error: {e}")
        return []


# For LangChain tool integration
def search_web(query: str) -> str:
    """Search web and return formatted results.
    
    Args:
        query: Search query
        
    Returns:
        Formatted search results as string
    """
    import asyncio
    
    results = asyncio.run(web_search_tool(query))
    
    if not results:
        return "No results found."
    
    formatted = [f"**{i+1}. {r['title']}**\n{r['snippet']}\nURL: {r['url']}"
                 for i, r in enumerate(results)]
    
    return "\n\n".join(formatted)
