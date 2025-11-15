"""Workflow manager for coordinating agent execution."""

from typing import Any, Dict, Optional

from loguru import logger

from .agent_graph import AgentGraphBuilder, AgentState, create_initial_state


class WorkflowManager:
    """Manages agent workflow execution."""
    
    def __init__(self):
        """Initialize workflow manager."""
        self.graph = None
        self.agents: Dict[str, Any] = {}
        logger.info("Initialized WorkflowManager")
    
    def register_agent(self, name: str, agent: Any) -> None:
        """Register an agent with the workflow manager.
        
        Args:
            name: Agent name
            agent: Agent instance
        """
        self.agents[name] = agent
        logger.info(f"Registered agent: {name}")
    
    def build_graph(self) -> None:
        """Build the agent workflow graph."""
        builder = AgentGraphBuilder()
        
        # Add orchestrator node
        builder.add_agent_node(
            "orchestrator",
            self._orchestrator_node,
            "Routes tasks to appropriate agents"
        )
        
        # Add agent nodes
        if "work_agent" in self.agents:
            builder.add_agent_node(
                "work_agent",
                self._work_agent_node,
                "Handles work-related tasks"
            )
        
        if "life_agent" in self.agents:
            builder.add_agent_node(
                "life_agent",
                self._life_agent_node,
                "Handles life management tasks"
            )
        
        if "research_agent" in self.agents:
            builder.add_agent_node(
                "research_agent",
                self._research_agent_node,
                "Handles research and information gathering"
            )
        
        # Set entry point
        builder.set_entry_point("orchestrator")
        
        # Add conditional routing from orchestrator
        def route_from_orchestrator(state: AgentState) -> str:
            next_agent = state.get("next_agent")
            if next_agent and next_agent in self.agents:
                return next_agent
            return "__end__"
        
        path_map = {agent: agent for agent in self.agents.keys()}
        path_map["__end__"] = "__end__"
        
        builder.add_conditional_edge(
            "orchestrator",
            route_from_orchestrator,
            path_map
        )
        
        # Add edges back to orchestrator or end
        for agent_name in self.agents.keys():
            def route_from_agent(state: AgentState) -> str:
                if state.get("final_response"):
                    return "__end__"
                if state.get("next_agent"):
                    return "orchestrator"
                return "__end__"
            
            builder.add_conditional_edge(
                agent_name,
                route_from_agent,
                {
                    "orchestrator": "orchestrator",
                    "__end__": "__end__"
                }
            )
        
        # Compile graph
        self.graph = builder.build()
        logger.info("Agent workflow graph built successfully")
    
    async def execute(
        self,
        task: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute workflow for a task.
        
        Args:
            task: Task description
            metadata: Additional metadata
            
        Returns:
            Result dictionary
        """
        if not self.graph:
            raise RuntimeError("Graph not built. Call build_graph() first.")
        
        logger.info(f"Executing workflow for task: {task[:100]}...")
        
        # Create initial state
        initial_state = create_initial_state(task, metadata)
        
        # Execute graph
        try:
            final_state = await self.graph.ainvoke(initial_state)
            
            return {
                "success": True,
                "response": final_state.get("final_response"),
                "agent_outputs": final_state.get("agent_outputs", {}),
                "iterations": final_state.get("iteration", 0),
                "error": final_state.get("error"),
            }
        
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            return {
                "success": False,
                "response": None,
                "error": str(e),
            }
    
    # Node functions
    
    async def _orchestrator_node(self, state: AgentState) -> AgentState:
        """Orchestrator node - routes tasks to appropriate agents.
        
        Args:
            state: Current state
            
        Returns:
            Updated state
        """
        logger.debug("Orchestrator processing task")
        
        task = state["task"]
        
        # Simple keyword-based routing (will be enhanced later)
        task_lower = task.lower()
        
        if any(word in task_lower for word in ["email", "task", "meeting", "work", "project"]):
            state["task_type"] = "work"
            state["next_agent"] = "work_agent"
        
        elif any(word in task_lower for word in ["calendar", "remind", "schedule", "appointment"]):
            state["task_type"] = "life"
            state["next_agent"] = "life_agent"
        
        elif any(word in task_lower for word in ["search", "research", "find", "information", "learn"]):
            state["task_type"] = "research"
            state["next_agent"] = "research_agent"
        
        else:
            # Default: use orchestrator's LLM to decide
            state["next_agent"] = "work_agent"  # Default fallback
        
        state["current_agent"] = "orchestrator"
        logger.info(f"Routed task to: {state['next_agent']}")
        
        return state
    
    async def _work_agent_node(self, state: AgentState) -> AgentState:
        """Work agent node.
        
        Args:
            state: Current state
            
        Returns:
            Updated state
        """
        logger.debug("Work agent processing task")
        
        agent = self.agents.get("work_agent")
        if not agent:
            state["error"] = "Work agent not available"
            return state
        
        try:
            result = await agent.process({"task": state["task"]})
            state["agent_outputs"]["work_agent"] = result
            state["final_response"] = result.get("response")
            state["current_agent"] = "work_agent"
        
        except Exception as e:
            logger.error(f"Work agent error: {e}")
            state["error"] = str(e)
        
        return state
    
    async def _life_agent_node(self, state: AgentState) -> AgentState:
        """Life agent node.
        
        Args:
            state: Current state
            
        Returns:
            Updated state
        """
        logger.debug("Life agent processing task")
        
        agent = self.agents.get("life_agent")
        if not agent:
            state["error"] = "Life agent not available"
            return state
        
        try:
            result = await agent.process({"task": state["task"]})
            state["agent_outputs"]["life_agent"] = result
            state["final_response"] = result.get("response")
            state["current_agent"] = "life_agent"
        
        except Exception as e:
            logger.error(f"Life agent error: {e}")
            state["error"] = str(e)
        
        return state
    
    async def _research_agent_node(self, state: AgentState) -> AgentState:
        """Research agent node.
        
        Args:
            state: Current state
            
        Returns:
            Updated state
        """
        logger.debug("Research agent processing task")
        
        agent = self.agents.get("research_agent")
        if not agent:
            state["error"] = "Research agent not available"
            return state
        
        try:
            result = await agent.process({"task": state["task"]})
            state["agent_outputs"]["research_agent"] = result
            state["final_response"] = result.get("response")
            state["current_agent"] = "research_agent"
        
        except Exception as e:
            logger.error(f"Research agent error: {e}")
            state["error"] = str(e)
        
        return state
