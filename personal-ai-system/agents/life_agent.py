"""Life agent - handles personal life management tasks."""

from typing import Any, Dict, Optional

from langchain_core.language_models import BaseChatModel
from loguru import logger

from core.base_agent import BaseAgent
from core.llm_factory import LLMFactory
from memory.memory_manager import get_memory_manager


class LifeAgent(BaseAgent):
    """Agent specialized in personal life management."""
    
    def __init__(
        self,
        name: str = "LifeAgent",
        llm: Optional[BaseChatModel] = None,
    ):
        """Initialize life agent.
        
        Args:
            name: Agent name
            llm: Language model to use
        """
        if llm is None:
            llm = LLMFactory.create_fast_llm()
        
        super().__init__(
            name=name,
            role="Personal Life Management Assistant",
            llm=llm,
        )
        
        self.memory_manager = get_memory_manager()
    
    def _default_system_prompt(self) -> str:
        """Generate default system prompt."""
        return """You are a friendly personal assistant specialized in life management.

Your capabilities:
- Calendar and schedule management
- Reminder setting and tracking
- Shopping list organization
- Health and wellness tracking
- Personal goal planning
- Habit tracking and motivation
- Event planning
- Travel arrangements

Guidelines:
1. Be warm and personable
2. Proactively suggest improvements
3. Remember user preferences
4. Provide gentle reminders
5. Encourage healthy habits

When helping:
- Understand the user's lifestyle and preferences
- Offer personalized recommendations
- Help maintain work-life balance
- Be proactive about important dates and events
- Track progress on personal goals"""
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process life management task.
        
        Args:
            input_data: Input containing task
            
        Returns:
            Processing result
        """
        task = input_data.get("task", "")
        
        logger.info(f"LifeAgent processing: {task[:100]}...")
        
        # Get relevant context from memory
        context = await self.memory_manager.get_context(task, max_memories=3)
        
        # Build task prompt
        if context:
            task_prompt = f"""Context from previous interactions:
{context}

Current request: {task}

Please help with this personal task."""
        else:
            task_prompt = f"Request: {task}\n\nPlease help with this personal task."
        
        try:
            # Get response from LLM
            response = await self.invoke(task_prompt)
            
            # Store interaction in memory
            await self.memory_manager.remember(
                f"Life task: {task}\nResponse: {response}",
                metadata={
                    "agent": self.name,
                    "task_type": "life",
                },
                persist=True,
            )
            
            logger.info(f"LifeAgent completed task")
            
            return {
                "success": True,
                "response": response,
                "agent": self.name,
                "task_type": "life",
            }
        
        except Exception as e:
            logger.error(f"LifeAgent error: {e}")
            return {
                "success": False,
                "response": f"Error processing life task: {str(e)}",
                "error": str(e),
            }
    
    async def manage_calendar(self, action: str, event_details: Dict[str, Any]) -> str:
        """Manage calendar events.
        
        Args:
            action: Calendar action (create, update, delete)
            event_details: Event details
            
        Returns:
            Result message
        """
        # Placeholder for calendar management
        # Will be implemented with Google Calendar API
        prompt = f"Help me {action} a calendar event: {event_details}"
        return await self.invoke(prompt)
    
    async def set_reminder(self, reminder_details: Dict[str, Any]) -> str:
        """Set a reminder.
        
        Args:
            reminder_details: Reminder details
            
        Returns:
            Confirmation message
        """
        # Placeholder for reminder system
        prompt = f"Set a reminder for: {reminder_details}"
        return await self.invoke(prompt)
