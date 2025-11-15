"""LangGraph state management and workflow orchestration."""

from typing import Annotated, Any, Dict, List, Literal, Optional, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from loguru import logger


class AgentState(TypedDict):
    """State for agent workflow.
    
    This TypedDict defines the structure of the state that flows through
    the agent graph. LangGraph uses this to manage state transitions.
    """
    
    # Messages in the conversation
    messages: Annotated[List[BaseMessage], add_messages]
    
    # Current task/query
    task: str
    
    # Task type (work, life, research, etc.)
    task_type: Optional[str]
    
    # Agent responsible for current step
    current_agent: Optional[str]
    
    # Next agent to route to
    next_agent: Optional[str]
    
    # Intermediate results from agents
    agent_outputs: Dict[str, Any]
    
    # Final response
    final_response: Optional[str]
    
    # Metadata
    metadata: Dict[str, Any]
    
    # Error information
    error: Optional[str]
    
    # Iteration count (for loop prevention)
    iteration: int


class AgentGraphBuilder:
    """Builder for creating agent workflow graphs."""
    
    def __init__(self):
        """Initialize the graph builder."""
        self.graph = StateGraph(AgentState)
        self.nodes: Dict[str, Any] = {}
        logger.info("Initialized AgentGraphBuilder")
    
    def add_agent_node(
        self,
        name: str,
        agent_func: Any,
        description: str = "",
    ) -> "AgentGraphBuilder":
        """Add an agent node to the graph.
        
        Args:
            name: Node name (typically agent name)
            agent_func: Function that processes the state
            description: Human-readable description
            
        Returns:
            Self for chaining
        """
        self.graph.add_node(name, agent_func)
        self.nodes[name] = {
            "func": agent_func,
            "description": description,
        }
        logger.debug(f"Added agent node: {name}")
        return self
    
    def add_conditional_edge(
        self,
        source: str,
        router_func: Any,
        path_map: Dict[str, str],
    ) -> "AgentGraphBuilder":
        """Add conditional edge for routing.
        
        Args:
            source: Source node name
            router_func: Function that returns next node name
            path_map: Mapping of router output to node names
            
        Returns:
            Self for chaining
        """
        self.graph.add_conditional_edges(
            source,
            router_func,
            path_map,
        )
        logger.debug(f"Added conditional edge from {source}")
        return self
    
    def add_edge(self, source: str, target: str) -> "AgentGraphBuilder":
        """Add direct edge between nodes.
        
        Args:
            source: Source node name
            target: Target node name
            
        Returns:
            Self for chaining
        """
        self.graph.add_edge(source, target)
        logger.debug(f"Added edge: {source} -> {target}")
        return self
    
    def set_entry_point(self, node_name: str) -> "AgentGraphBuilder":
        """Set the entry point of the graph.
        
        Args:
            node_name: Name of entry node
            
        Returns:
            Self for chaining
        """
        self.graph.set_entry_point(node_name)
        logger.debug(f"Set entry point: {node_name}")
        return self
    
    def build(self):
        """Compile and return the graph.
        
        Returns:
            Compiled LangGraph
        """
        compiled_graph = self.graph.compile()
        logger.info("Agent graph compiled successfully")
        return compiled_graph
    
    def visualize(self, output_path: str = "graph.png") -> None:
        """Visualize the graph structure.
        
        Args:
            output_path: Path to save visualization
        """
        try:
            from langgraph.graph import graph_to_mermaid
            mermaid_code = graph_to_mermaid(self.graph)
            logger.info(f"Graph visualization:\n{mermaid_code}")
        except Exception as e:
            logger.warning(f"Could not visualize graph: {e}")


def create_initial_state(task: str, metadata: Optional[Dict[str, Any]] = None) -> AgentState:
    """Create initial state for agent workflow.
    
    Args:
        task: The task/query to process
        metadata: Additional metadata
        
    Returns:
        Initial AgentState
    """
    return AgentState(
        messages=[],
        task=task,
        task_type=None,
        current_agent=None,
        next_agent=None,
        agent_outputs={},
        final_response=None,
        metadata=metadata or {},
        error=None,
        iteration=0,
    )


# Router functions for conditional edges

def route_by_task_type(state: AgentState) -> str:
    """Route to appropriate agent based on task type.
    
    Args:
        state: Current agent state
        
    Returns:
        Next node name
    """
    task_type = state.get("task_type")
    
    if task_type == "work":
        return "work_agent"
    elif task_type == "life":
        return "life_agent"
    elif task_type == "research":
        return "research_agent"
    elif task_type == "finance":
        return "finance_agent"
    elif task_type == "learning":
        return "learning_agent"
    else:
        # Default to orchestrator for clarification
        return "orchestrator"


def should_continue(state: AgentState) -> Literal["continue", "end"]:
    """Decide whether to continue or end the workflow.
    
    Args:
        state: Current agent state
        
    Returns:
        "continue" or "end"
    """
    # Check for errors
    if state.get("error"):
        return "end"
    
    # Check for final response
    if state.get("final_response"):
        return "end"
    
    # Check iteration limit
    if state.get("iteration", 0) > 10:
        logger.warning("Max iterations reached, ending workflow")
        return "end"
    
    # Check if next agent is specified
    if state.get("next_agent"):
        return "continue"
    
    return "end"


def increment_iteration(state: AgentState) -> AgentState:
    """Increment iteration counter.
    
    Args:
        state: Current state
        
    Returns:
        Updated state
    """
    state["iteration"] = state.get("iteration", 0) + 1
    return state
