"""Main CLI application."""

import asyncio
from pathlib import Path

import typer
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.prompt import Prompt

from agents import OrchestratorAgent, WorkAgent, LifeAgent, ResearchAgent
from core import setup_logging, get_settings, WorkflowManager

app = typer.Typer(help="Personal AI Agent System")
console = Console()


def initialize_system():
    """Initialize the AI system."""
    settings = get_settings()
    
    # Setup logging
    log_file = Path("logs/app.log")
    setup_logging(
        log_level=settings.system.log_level,
        log_file=log_file,
    )
    
    # Initialize workflow manager
    workflow = WorkflowManager()
    
    # Register agents
    workflow.register_agent("work_agent", WorkAgent())
    workflow.register_agent("life_agent", LifeAgent())
    workflow.register_agent("research_agent", ResearchAgent())
    
    # Build workflow graph
    workflow.build_graph()
    
    return workflow


@app.command()
def interactive():
    """Start interactive chat mode."""
    console.print(Panel.fit(
        "[bold cyan]🤖 Personal AI Assistant[/bold cyan]\n"
        "Type your requests or 'exit' to quit",
        border_style="cyan"
    ))
    
    # Initialize system
    workflow = initialize_system()
    
    # Chat loop
    while True:
        try:
            # Get user input
            user_input = Prompt.ask("\n[bold green]You[/bold green]")
            
            if user_input.lower() in ["exit", "quit", "bye"]:
                console.print("[yellow]Goodbye! 👋[/yellow]")
                break
            
            if not user_input.strip():
                continue
            
            # Show processing
            with console.status("[bold cyan]Processing...", spinner="dots"):
                # Execute workflow
                result = asyncio.run(workflow.execute(user_input))
            
            # Display response
            if result["success"]:
                response = result["response"]
                console.print(Panel(
                    Markdown(response),
                    title="[bold cyan]🤖 Assistant[/bold cyan]",
                    border_style="cyan"
                ))
            else:
                console.print(f"[red]Error: {result.get('error', 'Unknown error')}[/red]")
        
        except KeyboardInterrupt:
            console.print("\n[yellow]Goodbye! 👋[/yellow]")
            break
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")


@app.command()
def query(
    task: str = typer.Argument(..., help="Task to execute"),
    agent: str = typer.Option(None, "--agent", "-a", help="Specific agent to use"),
):
    """Execute a single task."""
    workflow = initialize_system()
    
    with console.status("[bold cyan]Processing...", spinner="dots"):
        result = asyncio.run(workflow.execute(task))
    
    if result["success"]:
        console.print(Panel(
            Markdown(result["response"]),
            title="[bold cyan]Response[/bold cyan]",
            border_style="cyan"
        ))
    else:
        console.print(f"[red]Error: {result.get('error', 'Unknown error')}[/red]")
        raise typer.Exit(1)


@app.command()
def config():
    """Show current configuration."""
    settings = get_settings()
    
    config_text = f"""
## System Configuration

**System:**
- Name: {settings.system.name}
- Version: {settings.system.version}
- Environment: {settings.system.environment}
- Log Level: {settings.system.log_level}

**LLM:**
- Primary Provider: {settings.llm.primary_provider}
- Fallback Provider: {settings.llm.fallback_provider}
- Temperature: {settings.llm.temperature}

**Memory:**
- Type: {settings.memory.type}
- Qdrant Host: {settings.memory.qdrant_host}:{settings.memory.qdrant_port}
- Redis Host: {settings.memory.redis_host}:{settings.memory.redis_port}

**Agents:**
- Orchestrator: Enabled
- Work Agent: {settings.agents.get('work_agent', {}).get('enabled', True)}
- Life Agent: {settings.agents.get('life_agent', {}).get('enabled', True)}
- Research Agent: {settings.agents.get('research_agent', {}).get('enabled', True)}
"""
    
    console.print(Markdown(config_text))


@app.command()
def version():
    """Show version information."""
    settings = get_settings()
    console.print(f"[cyan]{settings.system.name}[/cyan] version [bold]{settings.system.version}[/bold]")


if __name__ == "__main__":
    app()
