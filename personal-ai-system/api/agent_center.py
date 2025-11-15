"""
Agent Center API - Management endpoints for AI Agent Center.

Provides REST API for:
- Agent registration and management
- Workflow execution
- Tool management
- Monitoring and analytics
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from datetime import datetime
import logging
import asyncio

from core.orchestrator import LangGraphOrchestrator, WorkflowBuilder, WorkflowTemplates
from agents import WorkAgent, LifeAgent, ResearchAgent
from agents.specialized.content_creator_crew import ContentCreatorCrew
from core.tools.enhanced_registry import get_global_registry, ToolCategory
from integrations import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/v1/agent-center", tags=["agent-center"])


# ============================================
# Request/Response Models
# ============================================

class WorkflowExecuteRequest(BaseModel):
    """Request to execute a workflow."""
    workflow_type: str = Field(..., description="Type: sequential, parallel, conditional, or template name")
    task: str = Field(..., description="Task description")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    agents: Optional[List[str]] = Field(default=None, description="Agent names to use")
    stream: bool = Field(default=False, description="Stream results")


class CrewExecuteRequest(BaseModel):
    """Request to execute a CrewAI crew."""
    crew_type: str = Field(..., description="Crew type: content_creator, etc.")
    topic: str = Field(..., description="Topic or task")
    keywords: Optional[List[str]] = Field(default_factory=list)
    tone: str = Field(default="professional")
    additional_context: Optional[Dict[str, Any]] = Field(default_factory=dict)


class AgentInfo(BaseModel):
    """Agent information."""
    name: str
    role: str
    status: str
    capabilities: List[str]
    last_used: Optional[str]


class WorkflowInfo(BaseModel):
    """Workflow information."""
    name: str
    type: str
    steps: List[str]
    status: str
    created_at: str


class ToolInfo(BaseModel):
    """Tool information."""
    name: str
    description: str
    category: str
    requires_api_key: bool
    cost_per_use: float


# ============================================
# Global State (would use proper state management in production)
# ============================================

_orchestrators: Dict[str, LangGraphOrchestrator] = {}
_execution_history: List[Dict[str, Any]] = []


def get_or_create_orchestrator(name: str = "default") -> LangGraphOrchestrator:
    """Get or create an orchestrator instance."""
    if name not in _orchestrators:
        _orchestrators[name] = LangGraphOrchestrator()
        
        # Register default agents
        try:
            work_agent = WorkAgent()
            research_agent = ResearchAgent()
            life_agent = LifeAgent()
            
            _orchestrators[name].register_agent("work_agent", work_agent)
            _orchestrators[name].register_agent("research_agent", research_agent)
            _orchestrators[name].register_agent("life_agent", life_agent)
            
            logger.info(f"Orchestrator '{name}' created with default agents")
        except Exception as e:
            logger.error(f"Failed to register default agents: {e}")
    
    return _orchestrators[name]


# ============================================
# Agent Management Endpoints
# ============================================

@router.get("/agents", response_model=List[AgentInfo])
async def list_agents():
    """List all registered agents."""
    orchestrator = get_or_create_orchestrator()
    
    agents = []
    for name, agent in orchestrator.agents.items():
        agents.append(AgentInfo(
            name=name,
            role=getattr(agent, 'role', 'Unknown'),
            status="active",
            capabilities=getattr(agent, 'capabilities', []),
            last_used=None
        ))
    
    return agents


@router.get("/agents/{agent_name}")
async def get_agent_info(agent_name: str):
    """Get detailed information about an agent."""
    orchestrator = get_or_create_orchestrator()
    
    if agent_name not in orchestrator.agents:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    
    agent = orchestrator.agents[agent_name]
    
    return {
        "name": agent_name,
        "role": getattr(agent, 'role', 'Unknown'),
        "status": "active",
        "capabilities": getattr(agent, 'capabilities', []),
        "config": getattr(agent, 'config', {}),
        "metadata": {
            "model": getattr(agent, 'model_name', 'unknown'),
            "provider": getattr(agent, 'llm_provider', 'unknown')
        }
    }


# ============================================
# Workflow Endpoints
# ============================================

@router.post("/workflows/execute")
async def execute_workflow(request: WorkflowExecuteRequest, background_tasks: BackgroundTasks):
    """
    Execute a workflow.
    
    Supported workflow types:
    - sequential: Steps execute one after another
    - parallel: Steps execute simultaneously
    - conditional: Branching based on conditions
    - content_creation_pipeline: Pre-built content workflow
    - data_analysis_workflow: Pre-built analysis workflow
    """
    try:
        orchestrator = get_or_create_orchestrator()
        builder = WorkflowBuilder(orchestrator)
        
        # Build workflow based on type
        if request.workflow_type == "sequential":
            steps = [
                ("step1", "research_agent"),
                ("step2", "work_agent")
            ]
            builder.sequential(
                name=f"sequential_{datetime.now().timestamp()}",
                steps=steps
            )
        
        elif request.workflow_type == "parallel":
            steps = [
                ("task1", "work_agent"),
                ("task2", "research_agent"),
                ("task3", "work_agent")
            ]
            builder.parallel(
                name=f"parallel_{datetime.now().timestamp()}",
                parallel_steps=steps,
                aggregator=("summary", "research_agent")
            )
        
        elif request.workflow_type == "content_creation_pipeline":
            WorkflowTemplates.content_creation_pipeline(orchestrator)
        
        elif request.workflow_type == "data_analysis_workflow":
            WorkflowTemplates.data_analysis_workflow(orchestrator)
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown workflow type: {request.workflow_type}"
            )
        
        # Execute workflow
        if request.stream:
            # For streaming, we'd need WebSocket support
            # For now, return execution ID
            execution_id = f"exec_{datetime.now().timestamp()}"
            
            # Execute in background
            async def bg_execute():
                result = await orchestrator.execute({
                    "task": request.task,
                    **request.context
                })
                _execution_history.append({
                    "id": execution_id,
                    "workflow_type": request.workflow_type,
                    "result": result,
                    "timestamp": datetime.now().isoformat()
                })
            
            background_tasks.add_task(bg_execute)
            
            return {
                "execution_id": execution_id,
                "status": "running",
                "message": "Workflow executing in background"
            }
        else:
            # Synchronous execution
            result = await orchestrator.execute({
                "task": request.task,
                **request.context
            })
            
            execution_id = f"exec_{datetime.now().timestamp()}"
            _execution_history.append({
                "id": execution_id,
                "workflow_type": request.workflow_type,
                "result": result,
                "timestamp": datetime.now().isoformat()
            })
            
            return {
                "execution_id": execution_id,
                "success": result.get("success", False),
                "status": result.get("status"),
                "results": result.get("results"),
                "messages": result.get("messages")
            }
    
    except Exception as e:
        logger.error(f"Workflow execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/workflows/history")
async def get_workflow_history(limit: int = 10):
    """Get workflow execution history."""
    return {
        "total": len(_execution_history),
        "executions": _execution_history[-limit:]
    }


@router.get("/workflows/execution/{execution_id}")
async def get_execution_status(execution_id: str):
    """Get status of a specific execution."""
    for execution in _execution_history:
        if execution["id"] == execution_id:
            return execution
    
    raise HTTPException(status_code=404, detail="Execution not found")


# ============================================
# CrewAI Endpoints
# ============================================

@router.post("/crews/execute")
async def execute_crew(request: CrewExecuteRequest):
    """Execute a CrewAI crew."""
    try:
        if request.crew_type == "content_creator":
            crew = ContentCreatorCrew()
            
            result = await crew.create_content(
                topic=request.topic,
                keywords=request.keywords,
                tone=request.tone
            )
            
            return result
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown crew type: {request.crew_type}"
            )
    
    except Exception as e:
        logger.error(f"Crew execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/crews/content/research")
async def research_only(topic: str, keywords: Optional[List[str]] = None):
    """Run only research phase of content crew."""
    try:
        crew = ContentCreatorCrew()
        result = await crew.research_only(topic, keywords)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Tool Management Endpoints
# ============================================

@router.get("/tools", response_model=Dict[str, Any])
async def list_tools(category: Optional[str] = None):
    """List all available tools."""
    registry = get_global_registry()
    
    all_tools = registry.list_tools()
    
    if category:
        try:
            cat = ToolCategory(category)
            filtered_tools = {
                name: info
                for name, info in all_tools.items()
                if info["category"] == category
            }
            return {
                "total": len(filtered_tools),
                "category": category,
                "tools": filtered_tools
            }
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    
    return {
        "total": len(all_tools),
        "tools": all_tools
    }


@router.get("/tools/{tool_name}")
async def get_tool_info(tool_name: str):
    """Get detailed information about a tool."""
    registry = get_global_registry()
    
    metadata = registry.get_tool_metadata(tool_name)
    if not metadata:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found")
    
    return {
        "name": metadata.name,
        "description": metadata.description,
        "category": metadata.category.value,
        "version": metadata.version,
        "author": metadata.author,
        "requires_api_key": metadata.requires_api_key,
        "cost_per_use": metadata.cost_per_use,
        "avg_execution_time": metadata.avg_execution_time,
        "tags": metadata.tags,
        "usage": registry.usage_stats.get(tool_name, {})
    }


@router.get("/tools/search")
async def search_tools(query: str):
    """Search tools by name, description, or tags."""
    registry = get_global_registry()
    
    matching_tools = registry.search_tools(query)
    
    return {
        "query": query,
        "matches": len(matching_tools),
        "tools": [
            {
                "name": name,
                "metadata": registry.get_tool_metadata(name).__dict__
            }
            for name in matching_tools
        ]
    }


@router.get("/tools/categories")
async def list_tool_categories():
    """List all tool categories."""
    return {
        "categories": [cat.value for cat in ToolCategory]
    }


# ============================================
# Analytics & Monitoring Endpoints
# ============================================

@router.get("/analytics/overview")
async def get_analytics_overview():
    """Get overall analytics."""
    registry = get_global_registry()
    orchestrator = get_or_create_orchestrator()
    
    # Tool usage stats
    total_tool_calls = sum(
        stats["total_calls"]
        for stats in registry.usage_stats.values()
    )
    
    # Workflow stats
    total_workflows = len(_execution_history)
    successful_workflows = sum(
        1 for exec in _execution_history
        if exec.get("result", {}).get("success", False)
    )
    
    return {
        "agents": {
            "total": len(orchestrator.agents),
            "active": len(orchestrator.agents)
        },
        "tools": {
            "total": len(registry.tools),
            "total_calls": total_tool_calls
        },
        "workflows": {
            "total_executed": total_workflows,
            "successful": successful_workflows,
            "success_rate": successful_workflows / total_workflows if total_workflows > 0 else 0
        },
        "timestamp": datetime.now().isoformat()
    }


@router.get("/analytics/tools/usage")
async def get_tool_usage_stats():
    """Get tool usage statistics."""
    registry = get_global_registry()
    
    sorted_tools = sorted(
        registry.usage_stats.items(),
        key=lambda x: x[1]["total_calls"],
        reverse=True
    )
    
    return {
        "most_used_tools": [
            {
                "name": name,
                "usage": stats
            }
            for name, stats in sorted_tools[:10]
        ]
    }


# ============================================
# Health & Status Endpoints
# ============================================

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    orchestrator = get_or_create_orchestrator()
    registry = get_global_registry()
    
    return {
        "status": "healthy",
        "service": "ai-agent-center",
        "version": "1.0.0",
        "components": {
            "orchestrator": "operational",
            "agents": len(orchestrator.agents),
            "tools": len(registry.tools),
            "executions": len(_execution_history)
        },
        "timestamp": datetime.now().isoformat()
    }


@router.get("/status")
async def get_system_status():
    """Get detailed system status."""
    orchestrator = get_or_create_orchestrator()
    registry = get_global_registry()
    
    return {
        "agents": {
            "registered": list(orchestrator.agents.keys()),
            "count": len(orchestrator.agents)
        },
        "tools": {
            "registered": len(registry.tools),
            "categories": {
                cat.value: len(registry.get_tools_by_category(cat))
                for cat in ToolCategory
            }
        },
        "workflows": {
            "orchestrators": len(_orchestrators),
            "total_executions": len(_execution_history)
        },
        "system": {
            "uptime": "running",
            "memory_usage": "normal"
        }
    }
