"""Main FastAPI application."""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agents import OrchestratorAgent, WorkAgent, LifeAgent, ResearchAgent
from core import setup_logging, get_settings, WorkflowManager
from .integration import router as integration_router
from .agent_center import router as agent_center_router


# Request/Response models
class TaskRequest(BaseModel):
    """Task request model."""
    task: str = Field(..., description="Task description", min_length=1)
    agent: Optional[str] = Field(None, description="Specific agent to use")
    metadata: Optional[Dict] = Field(default_factory=dict, description="Additional metadata")


class TaskResponse(BaseModel):
    """Task response model."""
    success: bool
    response: Optional[str] = None
    agent: Optional[str] = None
    task_type: Optional[str] = None
    error: Optional[str] = None
    iterations: Optional[int] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    agents: Dict[str, bool]


# Global workflow manager
workflow_manager: Optional[WorkflowManager] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown."""
    # Startup
    global workflow_manager
    
    settings = get_settings()
    
    # Setup logging
    log_file = Path("logs/api.log")
    setup_logging(
        log_level=settings.system.log_level,
        log_file=log_file,
    )
    
    # Initialize workflow manager
    workflow_manager = WorkflowManager()
    
    # Register agents
    workflow_manager.register_agent("work_agent", WorkAgent())
    workflow_manager.register_agent("life_agent", LifeAgent())
    workflow_manager.register_agent("research_agent", ResearchAgent())
    
    # Build workflow graph
    workflow_manager.build_graph()
    
    yield
    
    # Shutdown
    workflow_manager = None


# Create FastAPI app
app = FastAPI(
    title="Personal AI Assistant API",
    description="REST API for multi-agent AI assistant system",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(integration_router)
app.include_router(agent_center_router)


@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint."""
    return {
        "message": "Personal AI Assistant API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    settings = get_settings()
    
    return HealthResponse(
        status="healthy" if workflow_manager else "unhealthy",
        version=settings.system.version,
        agents={
            "work_agent": "work_agent" in workflow_manager.agents if workflow_manager else False,
            "life_agent": "life_agent" in workflow_manager.agents if workflow_manager else False,
            "research_agent": "research_agent" in workflow_manager.agents if workflow_manager else False,
        }
    )


@app.post("/task", response_model=TaskResponse)
async def execute_task(request: TaskRequest):
    """Execute a task using the agent system."""
    if not workflow_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    try:
        result = await workflow_manager.execute(
            request.task,
            metadata=request.metadata,
        )
        
        return TaskResponse(
            success=result["success"],
            response=result.get("response"),
            agent=result.get("agent_outputs", {}).get("agent"),
            error=result.get("error"),
            iterations=result.get("iterations"),
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agents")
async def list_agents():
    """List available agents."""
    if not workflow_manager:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    return {
        "agents": list(workflow_manager.agents.keys()),
        "count": len(workflow_manager.agents),
    }


@app.get("/config")
async def get_config():
    """Get system configuration."""
    settings = get_settings()
    
    return {
        "system": {
            "name": settings.system.name,
            "version": settings.system.version,
            "environment": settings.system.environment,
        },
        "llm": {
            "primary_provider": settings.llm.primary_provider,
            "fallback_provider": settings.llm.fallback_provider,
        },
        "agents": settings.agents,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
