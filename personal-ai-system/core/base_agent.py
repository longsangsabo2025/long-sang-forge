"""Base agent class for all specialized agents."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.language_models import BaseChatModel
from loguru import logger


class BaseAgent(ABC):
    """Base class for all AI agents."""
    
    def __init__(
        self,
        name: str,
        role: str,
        llm: BaseChatModel,
        system_prompt: Optional[str] = None,
        tools: Optional[List[Any]] = None,
    ):
        """Initialize the agent.
        
        Args:
            name: Agent name
            role: Agent role description
            llm: Language model to use
            system_prompt: Custom system prompt
            tools: List of tools the agent can use
        """
        self.name = name
        self.role = role
        self.llm = llm
        self.tools = tools or []
        self.system_prompt = system_prompt or self._default_system_prompt()
        self.conversation_history: List[BaseMessage] = []
        
        logger.info(f"Initialized {self.name} agent with role: {self.role}")
    
    @abstractmethod
    def _default_system_prompt(self) -> str:
        """Generate default system prompt for this agent."""
        pass
    
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input and return output.
        
        Args:
            input_data: Input data dictionary
            
        Returns:
            Output data dictionary
        """
        pass
    
    def add_message(self, message: BaseMessage) -> None:
        """Add message to conversation history."""
        self.conversation_history.append(message)
    
    def clear_history(self) -> None:
        """Clear conversation history."""
        self.conversation_history = []
        logger.debug(f"Cleared conversation history for {self.name}")
    
    def get_history(self) -> List[BaseMessage]:
        """Get conversation history."""
        return self.conversation_history
    
    async def invoke(self, message: str) -> str:
        """Invoke the agent with a message.
        
        Args:
            message: Input message
            
        Returns:
            Agent's response
        """
        # Build messages
        messages = [SystemMessage(content=self.system_prompt)]
        messages.extend(self.conversation_history)
        messages.append(HumanMessage(content=message))
        
        # Get response
        logger.debug(f"{self.name} processing message: {message[:100]}...")
        response = await self.llm.ainvoke(messages)
        
        # Update history
        self.add_message(HumanMessage(content=message))
        self.add_message(response)
        
        return response.content
    
    def get_capabilities(self) -> List[str]:
        """Get list of agent capabilities."""
        return [tool.name for tool in self.tools]
    
    def __repr__(self) -> str:
        """String representation."""
        return f"{self.__class__.__name__}(name='{self.name}', role='{self.role}')"


class AgentState(ABC):
    """Base class for agent state management."""
    
    def __init__(self):
        """Initialize agent state."""
        self.data: Dict[str, Any] = {}
    
    def update(self, key: str, value: Any) -> None:
        """Update state value."""
        self.data[key] = value
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get state value."""
        return self.data.get(key, default)
    
    def clear(self) -> None:
        """Clear all state."""
        self.data = {}
