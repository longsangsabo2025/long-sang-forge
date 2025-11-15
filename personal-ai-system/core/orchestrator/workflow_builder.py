"""
Workflow Builder - Simplified workflow creation for common patterns.

This module provides high-level utilities to quickly build common workflow patterns:
- Sequential workflows
- Parallel workflows
- Conditional workflows
- Loop workflows
"""

from typing import List, Dict, Any, Callable, Optional
from enum import Enum
import logging

from .langgraph_orchestrator import LangGraphOrchestrator, WorkflowStatus

logger = logging.getLogger(__name__)


class WorkflowPattern(Enum):
    """Common workflow patterns."""
    SEQUENTIAL = "sequential"  # A -> B -> C
    PARALLEL = "parallel"  # A, B, C all at once
    CONDITIONAL = "conditional"  # A -> (B or C based on condition)
    PIPELINE = "pipeline"  # A -> B -> C with data passing
    MAP_REDUCE = "map_reduce"  # Distribute then aggregate


class WorkflowBuilder:
    """
    Simplified builder for creating common workflow patterns.
    
    Example:
        builder = WorkflowBuilder(orchestrator)
        
        # Build a sequential workflow
        builder.sequential(
            name="content_pipeline",
            steps=[
                ("research", "research_agent"),
                ("write", "work_agent"),
                ("edit", "work_agent")
            ]
        )
        
        # Build a conditional workflow
        builder.conditional(
            name="adaptive_content",
            initial_step=("analyze", "research_agent"),
            condition=lambda state: "simple" if state.context.get("complexity") == "low" else "detailed",
            branches={
                "simple": [("quick_write", "work_agent")],
                "detailed": [("research", "research_agent"), ("deep_write", "work_agent")]
            }
        )
    """
    
    def __init__(self, orchestrator: LangGraphOrchestrator):
        """
        Initialize the workflow builder.
        
        Args:
            orchestrator: LangGraphOrchestrator instance with registered agents
        """
        self.orchestrator = orchestrator
        logger.info("WorkflowBuilder initialized")
    
    def sequential(
        self,
        name: str,
        steps: List[tuple[str, str]],
        preprocessors: Optional[Dict[str, Callable]] = None
    ):
        """
        Build a sequential workflow where steps execute one after another.
        
        Pattern: Step1 -> Step2 -> Step3 -> ... -> END
        
        Args:
            name: Workflow name
            steps: List of (node_name, agent_name) tuples
            preprocessors: Optional dict of {node_name: preprocessor_function}
        """
        logger.info(f"Building sequential workflow: {name}")
        
        self.orchestrator.create_workflow(name)
        
        # Add all nodes
        for node_name, agent_name in steps:
            processor = preprocessors.get(node_name) if preprocessors else None
            self.orchestrator.add_node(node_name, agent_name, processor)
        
        # Connect sequentially
        self.orchestrator.set_entry_point(steps[0][0])
        
        for i in range(len(steps) - 1):
            from_node = steps[i][0]
            to_node = steps[i + 1][0]
            self.orchestrator.add_edge(from_node, to_node)
        
        # Connect last step to END
        try:
            from langgraph.graph import END
            self.orchestrator.add_edge(steps[-1][0], END)
        except ImportError:
            pass
        
        self.orchestrator.compile()
        logger.info(f"Sequential workflow '{name}' built with {len(steps)} steps")
    
    def parallel(
        self,
        name: str,
        parallel_steps: List[tuple[str, str]],
        aggregator: Optional[tuple[str, str]] = None
    ):
        """
        Build a parallel workflow where steps execute simultaneously.
        
        Pattern: 
                 -> Step1 ->
        Start -> -> Step2 -> Aggregator -> END
                 -> Step3 ->
        
        Args:
            name: Workflow name
            parallel_steps: List of (node_name, agent_name) tuples to run in parallel
            aggregator: Optional (node_name, agent_name) to aggregate results
        """
        logger.info(f"Building parallel workflow: {name}")
        
        self.orchestrator.create_workflow(name)
        
        # Create a start node that fans out
        start_node_name = "parallel_start"
        
        async def start_node(agent, task, state):
            """Start node that prepares for parallel execution."""
            return {"ready": True, "task": task}
        
        # Use first agent for start node (it's just a pass-through)
        self.orchestrator.add_node(
            start_node_name,
            parallel_steps[0][1],
            start_node
        )
        
        # Add all parallel nodes
        for node_name, agent_name in parallel_steps:
            self.orchestrator.add_node(node_name, agent_name)
        
        # Set entry and fan out
        self.orchestrator.set_entry_point(start_node_name)
        
        for node_name, _ in parallel_steps:
            self.orchestrator.add_edge(start_node_name, node_name)
        
        # Handle aggregation or end
        if aggregator:
            agg_node_name, agg_agent_name = aggregator
            
            async def aggregator_processor(agent, task, state):
                """Aggregate results from parallel steps."""
                results = [
                    state.intermediate_results.get(node_name)
                    for node_name, _ in parallel_steps
                ]
                
                return await agent.process({
                    "task": f"Aggregate these results: {results}",
                    "results": results,
                    **state.context
                })
            
            self.orchestrator.add_node(
                agg_node_name,
                agg_agent_name,
                aggregator_processor
            )
            
            # Connect parallel nodes to aggregator
            for node_name, _ in parallel_steps:
                self.orchestrator.add_edge(node_name, agg_node_name)
            
            # Connect aggregator to END
            try:
                from langgraph.graph import END
                self.orchestrator.add_edge(agg_node_name, END)
            except ImportError:
                pass
        else:
            # No aggregator, connect all to END
            try:
                from langgraph.graph import END
                for node_name, _ in parallel_steps:
                    self.orchestrator.add_edge(node_name, END)
            except ImportError:
                pass
        
        self.orchestrator.compile()
        logger.info(f"Parallel workflow '{name}' built with {len(parallel_steps)} parallel steps")
    
    def conditional(
        self,
        name: str,
        initial_step: tuple[str, str],
        condition: Callable,
        branches: Dict[str, List[tuple[str, str]]]
    ):
        """
        Build a conditional workflow that routes based on conditions.
        
        Pattern:
                 -> Branch1 (if condition == "branch1")
        Initial -> -> Branch2 (if condition == "branch2")
                 -> Branch3 (if condition == "branch3")
        
        Args:
            name: Workflow name
            initial_step: (node_name, agent_name) for the initial decision step
            condition: Function that returns branch key based on WorkflowState
            branches: Dict mapping branch keys to lists of (node_name, agent_name) steps
        """
        logger.info(f"Building conditional workflow: {name}")
        
        self.orchestrator.create_workflow(name)
        
        # Add initial node
        initial_node_name, initial_agent_name = initial_step
        self.orchestrator.add_node(initial_node_name, initial_agent_name)
        self.orchestrator.set_entry_point(initial_node_name)
        
        try:
            from langgraph.graph import END
            
            # Add branches
            branch_endpoints = []
            
            for branch_key, steps in branches.items():
                if not steps:
                    continue
                
                # Add nodes for this branch
                for node_name, agent_name in steps:
                    full_node_name = f"{branch_key}_{node_name}"
                    self.orchestrator.add_node(full_node_name, agent_name)
                
                # Connect steps within branch
                full_steps = [f"{branch_key}_{node}" for node, _ in steps]
                
                for i in range(len(full_steps) - 1):
                    self.orchestrator.add_edge(full_steps[i], full_steps[i + 1])
                
                # Track branch endpoint
                branch_endpoints.append((branch_key, full_steps[0], full_steps[-1]))
            
            # Create routing map for conditional edge
            routing_map = {
                branch_key: first_node
                for branch_key, first_node, _ in branch_endpoints
            }
            routing_map["end"] = END
            
            # Add conditional edge from initial node
            self.orchestrator.add_conditional_edge(
                initial_node_name,
                condition,
                routing_map
            )
            
            # Connect all branch endpoints to END
            for _, _, last_node in branch_endpoints:
                self.orchestrator.add_edge(last_node, END)
            
        except ImportError:
            logger.warning("LangGraph not fully available, conditional edges limited")
        
        self.orchestrator.compile()
        logger.info(f"Conditional workflow '{name}' built with {len(branches)} branches")
    
    def pipeline(
        self,
        name: str,
        steps: List[tuple[str, str]],
        transformers: Optional[Dict[str, Callable]] = None
    ):
        """
        Build a pipeline workflow with explicit data transformation between steps.
        
        Similar to sequential but with explicit data transformation functions.
        
        Args:
            name: Workflow name
            steps: List of (node_name, agent_name) tuples
            transformers: Dict of {node_name: transformer_function} that processes
                         output before passing to next step
        """
        logger.info(f"Building pipeline workflow: {name}")
        
        transformers = transformers or {}
        
        # Create processors that include transformation
        processors = {}
        for i, (node_name, agent_name) in enumerate(steps):
            if node_name in transformers:
                transformer = transformers[node_name]
                
                async def make_processor(transform_fn):
                    async def processor(agent, task, state):
                        # Get previous result
                        if i > 0:
                            prev_node = steps[i - 1][0]
                            prev_result = state.intermediate_results.get(prev_node)
                            # Transform it
                            task = await transform_fn(prev_result, state)
                        
                        # Process with agent
                        return await agent.process({"task": task, **state.context})
                    
                    return processor
                
                processors[node_name] = await make_processor(transformer)
        
        # Use sequential builder with processors
        self.sequential(name, steps, processors)
        logger.info(f"Pipeline workflow '{name}' built")


# Pre-built workflow templates
class WorkflowTemplates:
    """Pre-built workflow templates for common use cases."""
    
    @staticmethod
    def content_creation_pipeline(orchestrator: LangGraphOrchestrator):
        """
        Content creation: Research -> Outline -> Write -> Edit -> SEO
        """
        builder = WorkflowBuilder(orchestrator)
        
        builder.sequential(
            name="content_creation_pipeline",
            steps=[
                ("research", "research_agent"),
                ("outline", "work_agent"),
                ("write", "work_agent"),
                ("edit", "work_agent"),
                ("seo_optimize", "work_agent")
            ]
        )
        
        logger.info("Content creation pipeline template created")
    
    @staticmethod
    def data_analysis_workflow(orchestrator: LangGraphOrchestrator):
        """
        Data analysis: Collect -> Clean -> Analyze -> Visualize -> Report
        """
        builder = WorkflowBuilder(orchestrator)
        
        builder.sequential(
            name="data_analysis_workflow",
            steps=[
                ("collect_data", "research_agent"),
                ("clean_data", "research_agent"),
                ("analyze", "research_agent"),
                ("visualize", "research_agent"),
                ("report", "work_agent")
            ]
        )
        
        logger.info("Data analysis workflow template created")
    
    @staticmethod
    def multi_channel_marketing(orchestrator: LangGraphOrchestrator):
        """
        Marketing: Content -> [Blog, Social, Email, Newsletter] in parallel
        """
        builder = WorkflowBuilder(orchestrator)
        
        builder.parallel(
            name="multi_channel_marketing",
            parallel_steps=[
                ("blog_post", "work_agent"),
                ("social_media", "work_agent"),
                ("email_campaign", "work_agent"),
                ("newsletter", "work_agent")
            ],
            aggregator=("campaign_report", "research_agent")
        )
        
        logger.info("Multi-channel marketing workflow template created")
    
    @staticmethod
    def adaptive_learning_path(orchestrator: LangGraphOrchestrator):
        """
        Adaptive learning: Assess -> [Beginner/Intermediate/Advanced] -> Feedback
        """
        builder = WorkflowBuilder(orchestrator)
        
        def assess_level(state):
            """Determine learner level."""
            # This would use actual assessment logic
            level = state.context.get("level", "beginner")
            return level
        
        builder.conditional(
            name="adaptive_learning_path",
            initial_step=("assess", "research_agent"),
            condition=assess_level,
            branches={
                "beginner": [
                    ("intro_lesson", "work_agent"),
                    ("basic_practice", "work_agent")
                ],
                "intermediate": [
                    ("standard_lesson", "work_agent"),
                    ("medium_practice", "work_agent")
                ],
                "advanced": [
                    ("advanced_lesson", "work_agent"),
                    ("complex_practice", "work_agent")
                ]
            }
        )
        
        logger.info("Adaptive learning path workflow template created")
