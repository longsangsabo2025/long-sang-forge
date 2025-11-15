"""
LangGraph-based orchestrator for multi-agent workflows.

This orchestrator provides:
- Stateful workflow execution
- Inter-agent communication
- Error handling and retry logic
- Human-in-the-loop checkpoints
- Workflow persistence
"""

from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import logging

try:
    from langgraph.graph import StateGraph, END
    from langgraph.checkpoint import MemorySaver
    from langchain_core.messages import HumanMessage, AIMessage
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False
    StateGraph = None
    END = None
    MemorySaver = None

from core.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class WorkflowStatus(Enum):
    """Workflow execution status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


@dataclass
class WorkflowState:
    """State maintained throughout workflow execution."""
    messages: List[Dict[str, Any]]
    context: Dict[str, Any]
    current_agent: Optional[str]
    status: WorkflowStatus
    error: Optional[str]
    intermediate_results: Dict[str, Any]
    
    def add_message(self, role: str, content: str, metadata: Optional[Dict] = None):
        """Add a message to the conversation history."""
        msg = {
            "role": role,
            "content": content,
            "metadata": metadata or {}
        }
        self.messages.append(msg)
    
    def update_context(self, key: str, value: Any):
        """Update workflow context."""
        self.context[key] = value
    
    def store_result(self, agent_name: str, result: Any):
        """Store intermediate result from an agent."""
        self.intermediate_results[agent_name] = result


class LangGraphOrchestrator:
    """
    Orchestrates multi-agent workflows using LangGraph.
    
    Features:
    - Graph-based workflow definition
    - State management across agents
    - Conditional routing
    - Error handling
    - Checkpointing for resumability
    
    Example:
        orchestrator = LangGraphOrchestrator()
        
        # Register agents
        orchestrator.register_agent("researcher", research_agent)
        orchestrator.register_agent("writer", writer_agent)
        orchestrator.register_agent("editor", editor_agent)
        
        # Define workflow
        orchestrator.add_node("research", "researcher", process_research)
        orchestrator.add_node("write", "writer", process_writing)
        orchestrator.add_node("edit", "editor", process_editing)
        
        orchestrator.add_edge("research", "write")
        orchestrator.add_conditional_edge("write", should_edit, {"yes": "edit", "no": END})
        
        # Execute
        result = await orchestrator.execute({"task": "Write about AI agents"})
    """
    
    def __init__(self, checkpoint_saver: Optional[Any] = None):
        """
        Initialize the orchestrator.
        
        Args:
            checkpoint_saver: Optional checkpoint saver for persistence.
                            Defaults to MemorySaver() if not provided.
        """
        if not LANGGRAPH_AVAILABLE:
            raise ImportError(
                "LangGraph is not installed. Install with: pip install langgraph"
            )
        
        self.agents: Dict[str, BaseAgent] = {}
        self.graph = None
        self.compiled_graph = None
        self.checkpoint_saver = checkpoint_saver or MemorySaver()
        
        logger.info("LangGraphOrchestrator initialized")
    
    def register_agent(self, name: str, agent: BaseAgent):
        """
        Register an agent with the orchestrator.
        
        Args:
            name: Unique identifier for the agent
            agent: Agent instance
        """
        self.agents[name] = agent
        logger.info(f"Registered agent: {name}")
    
    def create_workflow(self, name: str) -> StateGraph:
        """
        Create a new workflow graph.
        
        Args:
            name: Name of the workflow
            
        Returns:
            StateGraph instance
        """
        self.graph = StateGraph(WorkflowState)
        logger.info(f"Created workflow: {name}")
        return self.graph
    
    def add_node(
        self,
        name: str,
        agent_name: str,
        processor: Optional[Callable] = None
    ):
        """
        Add a node (agent execution step) to the workflow.
        
        Args:
            name: Node name
            agent_name: Name of registered agent to use
            processor: Optional custom processor function
        """
        if not self.graph:
            raise ValueError("Create a workflow first using create_workflow()")
        
        if agent_name not in self.agents:
            raise ValueError(f"Agent '{agent_name}' not registered")
        
        agent = self.agents[agent_name]
        
        async def node_function(state: WorkflowState) -> WorkflowState:
            """Execute agent and update state."""
            try:
                state.current_agent = agent_name
                state.status = WorkflowStatus.RUNNING
                
                # Get last message as task
                task = state.messages[-1]["content"] if state.messages else ""
                
                # Process with agent
                if processor:
                    result = await processor(agent, task, state)
                else:
                    result = await agent.process({"task": task, **state.context})
                
                # Update state
                state.store_result(agent_name, result)
                state.add_message("assistant", str(result), {"agent": agent_name})
                
                logger.info(f"Node '{name}' executed successfully")
                return state
                
            except Exception as e:
                logger.error(f"Error in node '{name}': {e}")
                state.status = WorkflowStatus.FAILED
                state.error = str(e)
                return state
        
        self.graph.add_node(name, node_function)
        logger.info(f"Added node: {name} (agent: {agent_name})")
    
    def add_edge(self, from_node: str, to_node: str):
        """
        Add a direct edge between nodes.
        
        Args:
            from_node: Source node
            to_node: Destination node
        """
        if not self.graph:
            raise ValueError("Create a workflow first using create_workflow()")
        
        self.graph.add_edge(from_node, to_node)
        logger.info(f"Added edge: {from_node} -> {to_node}")
    
    def add_conditional_edge(
        self,
        from_node: str,
        condition: Callable[[WorkflowState], str],
        mapping: Dict[str, str]
    ):
        """
        Add a conditional edge that routes based on state.
        
        Args:
            from_node: Source node
            condition: Function that returns routing key based on state
            mapping: Map of condition results to target nodes
        """
        if not self.graph:
            raise ValueError("Create a workflow first using create_workflow()")
        
        self.graph.add_conditional_edges(from_node, condition, mapping)
        logger.info(f"Added conditional edge from: {from_node}")
    
    def set_entry_point(self, node: str):
        """Set the entry point for the workflow."""
        if not self.graph:
            raise ValueError("Create a workflow first using create_workflow()")
        
        self.graph.set_entry_point(node)
        logger.info(f"Set entry point: {node}")
    
    def compile(self):
        """Compile the workflow graph for execution."""
        if not self.graph:
            raise ValueError("Create a workflow first using create_workflow()")
        
        self.compiled_graph = self.graph.compile(
            checkpointer=self.checkpoint_saver
        )
        logger.info("Workflow compiled successfully")
    
    async def execute(
        self,
        initial_input: Dict[str, Any],
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute the compiled workflow.
        
        Args:
            initial_input: Initial input to the workflow
            config: Optional configuration (e.g., for checkpointing)
            
        Returns:
            Final workflow state and results
        """
        if not self.compiled_graph:
            raise ValueError("Compile the workflow first using compile()")
        
        # Initialize state
        initial_state = WorkflowState(
            messages=[{"role": "user", "content": initial_input.get("task", "")}],
            context=initial_input,
            current_agent=None,
            status=WorkflowStatus.PENDING,
            error=None,
            intermediate_results={}
        )
        
        try:
            logger.info("Starting workflow execution")
            
            # Execute graph
            result = await self.compiled_graph.ainvoke(
                initial_state,
                config=config or {}
            )
            
            logger.info("Workflow execution completed")
            
            return {
                "success": True,
                "status": result.status.value,
                "results": result.intermediate_results,
                "messages": result.messages,
                "context": result.context
            }
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "status": WorkflowStatus.FAILED.value
            }
    
    async def stream_execute(
        self,
        initial_input: Dict[str, Any],
        config: Optional[Dict[str, Any]] = None
    ):
        """
        Execute workflow with streaming updates.
        
        Yields state updates as the workflow progresses.
        
        Args:
            initial_input: Initial input to the workflow
            config: Optional configuration
            
        Yields:
            State updates during execution
        """
        if not self.compiled_graph:
            raise ValueError("Compile the workflow first using compile()")
        
        initial_state = WorkflowState(
            messages=[{"role": "user", "content": initial_input.get("task", "")}],
            context=initial_input,
            current_agent=None,
            status=WorkflowStatus.PENDING,
            error=None,
            intermediate_results={}
        )
        
        try:
            async for state in self.compiled_graph.astream(
                initial_state,
                config=config or {}
            ):
                yield {
                    "current_agent": state.current_agent,
                    "status": state.status.value,
                    "latest_result": state.intermediate_results.get(
                        state.current_agent
                    ) if state.current_agent else None
                }
                
        except Exception as e:
            logger.error(f"Stream execution failed: {e}")
            yield {
                "error": str(e),
                "status": WorkflowStatus.FAILED.value
            }


# Example workflow builders
def create_content_creation_workflow(orchestrator: LangGraphOrchestrator):
    """
    Create a content creation workflow: Research → Write → Edit.
    
    Args:
        orchestrator: LangGraphOrchestrator instance with registered agents
    """
    orchestrator.create_workflow("content_creation")
    
    # Add nodes
    orchestrator.add_node("research", "research_agent")
    orchestrator.add_node("write", "work_agent")
    orchestrator.add_node("edit", "work_agent")
    
    # Define routing logic
    def should_edit(state: WorkflowState) -> str:
        """Decide if content needs editing."""
        # Check if writing was successful
        if state.status == WorkflowStatus.FAILED:
            return "end"
        return "edit"
    
    # Build graph
    orchestrator.set_entry_point("research")
    orchestrator.add_edge("research", "write")
    orchestrator.add_conditional_edge(
        "write",
        should_edit,
        {"edit": "edit", "end": END}
    )
    orchestrator.add_edge("edit", END)
    
    orchestrator.compile()
    logger.info("Content creation workflow created")


def create_analysis_workflow(orchestrator: LangGraphOrchestrator):
    """
    Create a data analysis workflow: Collect → Analyze → Report.
    
    Args:
        orchestrator: LangGraphOrchestrator instance with registered agents
    """
    orchestrator.create_workflow("data_analysis")
    
    orchestrator.add_node("collect", "research_agent")
    orchestrator.add_node("analyze", "research_agent")
    orchestrator.add_node("report", "work_agent")
    
    orchestrator.set_entry_point("collect")
    orchestrator.add_edge("collect", "analyze")
    orchestrator.add_edge("analyze", "report")
    orchestrator.add_edge("report", END)
    
    orchestrator.compile()
    logger.info("Data analysis workflow created")
