"""Orchestrator agent - routes and coordinates other agents."""

from typing import Any, Dict, Optional

from langchain_core.language_models import BaseChatModel
from loguru import logger

from core.base_agent import BaseAgent
from core.llm_factory import LLMFactory
from memory.memory_manager import get_memory_manager


class OrchestratorAgent(BaseAgent):
    """Main orchestrator that routes tasks to specialized agents."""
    
    def __init__(
        self,
        name: str = "Orchestrator",
        llm: Optional[BaseChatModel] = None,
    ):
        """Initialize orchestrator agent.
        
        Args:
            name: Agent name
            llm: Language model to use
        """
        if llm is None:
            llm = LLMFactory.create_reasoning_llm()
        
        super().__init__(
            name=name,
            role="Task Router and Coordinator",
            llm=llm,
        )
        
        self.memory_manager = get_memory_manager()
        self.agent_capabilities = {
            "work_agent": [
                "email management",
                "task tracking",
                "meeting scheduling",
                "project management",
                "document creation",
                "code assistance",
            ],
            "life_agent": [
                "calendar management",
                "reminders",
                "shopping lists",
                "health tracking",
                "personal planning",
                "habit tracking",
            ],
            "research_agent": [
                "web search",
                "information gathering",
                "document analysis",
                "summarization",
                "knowledge synthesis",
                "trend monitoring",
            ],
        }
    
    def _default_system_prompt(self) -> str:
        """Generate default system prompt."""
        capabilities_text = "\n".join([
            f"- **{agent}**: {', '.join(caps)}"
            for agent, caps in self.agent_capabilities.items()
        ])
        
        return f"""You are an intelligent orchestrator agent that routes user requests to specialized agents.

Your available specialized agents and their capabilities:
{capabilities_text}

Your responsibilities:
1. Analyze the user's request carefully
2. Determine which specialized agent(s) can best handle the task
3. Route the request to the appropriate agent
4. If multiple agents are needed, coordinate them
5. Synthesize responses from multiple agents if necessary

When routing, respond with a JSON object:
{{
    "agent": "agent_name",
    "reasoning": "why this agent was chosen",
    "task_type": "category of the task"
}}

Be concise and accurate in your routing decisions."""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input and route to appropriate agent.
        
        Args:
            input_data: Input containing task
            
        Returns:
            Routing decision
        """
        task = input_data.get("task", "")
        
        logger.info(f"Orchestrator analyzing task: {task[:100]}...")
        
        # Get relevant context from memory
        context = await self.memory_manager.get_context(task, max_memories=2)
        
        # Build routing prompt
        routing_prompt = f"""Task: {task}

{context}

Analyze this task and determine which specialized agent should handle it.
Respond with your routing decision in JSON format."""
        
        # Get routing decision
        try:
            response = await self.invoke(routing_prompt)
            
            # Parse response to determine routing
            # (In production, use structured output)
            task_lower = task.lower()
            
            if any(word in task_lower for word in ["email", "task", "meeting", "work", "project", "code"]):
                agent = "work_agent"
                task_type = "work"
            elif any(word in task_lower for word in ["calendar", "remind", "schedule", "health", "habit"]):
                agent = "life_agent"
                task_type = "life"
            elif any(word in task_lower for word in ["search", "research", "find", "information", "learn", "web"]):
                agent = "research_agent"
                task_type = "research"
            else:
                agent = "work_agent"  # Default
                task_type = "general"
            
            logger.info(f"Routed to: {agent} (type: {task_type})")
            
            return {
                "agent": agent,
                "task_type": task_type,
                "reasoning": response,
                "response": f"Routing task to {agent}",
            }
        
        except Exception as e:
            logger.error(f"Orchestrator error: {e}")
            return {
                "agent": "work_agent",
                "task_type": "general",
                "error": str(e),
                "response": "Error in routing, defaulting to work agent",
            }
