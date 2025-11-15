"""Work agent - handles work-related tasks."""

from typing import Any, Dict, List, Optional

from langchain_core.language_models import BaseChatModel
from loguru import logger

from core.base_agent import BaseAgent
from core.llm_factory import LLMFactory
from memory.memory_manager import get_memory_manager


class WorkAgent(BaseAgent):
    """Agent specialized in work-related tasks."""
    
    def __init__(
        self,
        name: str = "WorkAgent",
        llm: Optional[BaseChatModel] = None,
    ):
        """Initialize work agent.
        
        Args:
            name: Agent name
            llm: Language model to use
        """
        if llm is None:
            llm = LLMFactory.create_llm(provider="openai", model="gpt-4o")
        
        super().__init__(
            name=name,
            role="Work and Productivity Assistant",
            llm=llm,
        )
        
        self.memory_manager = get_memory_manager()
    
    def _default_system_prompt(self) -> str:
        """Generate default system prompt."""
        return """You are a professional work assistant specialized in productivity and task management.

Your capabilities:
- Email management and composition
- Task tracking and prioritization
- Meeting scheduling and preparation
- Project management assistance
- Document creation and editing
- Code review and programming help
- Time management and productivity tips

Guidelines:
1. Be professional and concise
2. Provide actionable advice
3. Prioritize efficiency
4. Offer practical solutions
5. Remember context from previous interactions

When helping with tasks:
- Break down complex tasks into steps
- Suggest tools and methods
- Provide templates when appropriate
- Offer to automate repetitive tasks"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process work-related task.
        
        Args:
            input_data: Input containing task
            
        Returns:
            Processing result
        """
        task = input_data.get("task", "")
        
        logger.info(f"WorkAgent processing: {task[:100]}...")
        
        # Get relevant context from memory
        context = await self.memory_manager.get_context(task, max_memories=3)
        
        # Build task prompt
        if context:
            task_prompt = f"""Context from previous interactions:
{context}

Current task: {task}

Please help with this work-related task."""
        else:
            task_prompt = f"Task: {task}\n\nPlease help with this work-related task."
        
        try:
            # Get response from LLM
            response = await self.invoke(task_prompt)
            
            # Store interaction in memory
            await self.memory_manager.remember(
                f"Work task: {task}\nResponse: {response}",
                metadata={
                    "agent": self.name,
                    "task_type": "work",
                },
                persist=True,
            )
            
            logger.info(f"WorkAgent completed task")
            
            return {
                "success": True,
                "response": response,
                "agent": self.name,
                "task_type": "work",
            }
        
        except Exception as e:
            logger.error(f"WorkAgent error: {e}")
            return {
                "success": False,
                "response": f"Error processing work task: {str(e)}",
                "error": str(e),
            }
    
    async def manage_email(self, action: str, details: Dict[str, Any]) -> str:
        """Manage email tasks.
        
        Args:
            action: Email action (compose, reply, organize)
            details: Email details
            
        Returns:
            Result message
        """
        # Placeholder for email management
        # Will be implemented with actual email API integration
        prompt = f"Help me {action} an email with these details: {details}"
        return await self.invoke(prompt)
    
    async def manage_tasks(self, action: str, task_details: Dict[str, Any]) -> str:
        """Manage tasks.
        
        Args:
            action: Task action (create, update, complete)
            task_details: Task details
            
        Returns:
            Result message
        """
        # Placeholder for task management
        # Will be implemented with task management API integration
        prompt = f"Help me {action} a task: {task_details}"
        return await self.invoke(prompt)
