"""
Setup Script for AI Agent Center

This script helps you:
1. Check dependencies
2. Verify configuration
3. Test installations
4. Initialize the system
"""

import subprocess
import sys
import os
from pathlib import Path
from typing import List, Tuple
import importlib


class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_header(text: str):
    """Print a formatted header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'=' * 70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(70)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 70}{Colors.END}\n")


def print_step(text: str):
    """Print a step message."""
    print(f"{Colors.BOLD}▶ {text}{Colors.END}")


def print_success(text: str):
    """Print a success message."""
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")


def print_warning(text: str):
    """Print a warning message."""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")


def print_error(text: str):
    """Print an error message."""
    print(f"{Colors.RED}✗ {text}{Colors.END}")


def check_python_version() -> bool:
    """Check if Python version is compatible."""
    print_step("Checking Python version...")
    
    version = sys.version_info
    required = (3, 10)
    
    if version >= required:
        print_success(f"Python {version.major}.{version.minor}.{version.micro} ✓")
        return True
    else:
        print_error(f"Python {required[0]}.{required[1]}+ required, found {version.major}.{version.minor}")
        return False


def check_dependencies() -> Tuple[List[str], List[str]]:
    """Check which dependencies are installed."""
    print_step("Checking dependencies...")
    
    required_packages = [
        ("langgraph", "LangGraph - Core orchestration"),
        ("langchain", "LangChain - Tool integration"),
        ("crewai", "CrewAI - Multi-agent collaboration"),
        ("pyautogen", "AutoGen - Conversational agents"),
        ("semantic_kernel", "Semantic Kernel - Microsoft integration"),
        ("fastapi", "FastAPI - Web framework"),
        ("pydantic", "Pydantic - Data validation"),
    ]
    
    optional_packages = [
        ("chromadb", "ChromaDB - Vector store"),
        ("redis", "Redis - Caching"),
        ("playwright", "Playwright - Web automation"),
    ]
    
    installed = []
    missing = []
    
    for package_name, description in required_packages:
        try:
            importlib.import_module(package_name)
            print_success(f"{description}")
            installed.append(package_name)
        except ImportError:
            print_error(f"{description} - NOT INSTALLED")
            missing.append(package_name)
    
    print("\nOptional packages:")
    for package_name, description in optional_packages:
        try:
            importlib.import_module(package_name)
            print_success(f"{description}")
        except ImportError:
            print_warning(f"{description} - Not installed (optional)")
    
    return installed, missing


def check_env_file() -> bool:
    """Check if .env file exists and has required variables."""
    print_step("Checking environment configuration...")
    
    env_file = Path(".env")
    
    if not env_file.exists():
        print_error(".env file not found")
        print("  Create it from .env.example:")
        print("  cp .env.example .env")
        return False
    
    print_success(".env file found")
    
    # Check for API keys
    required_vars = [
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
    ]
    
    optional_vars = [
        "LANGCHAIN_API_KEY",
        "LANGFUSE_PUBLIC_KEY",
    ]
    
    with open(env_file, 'r') as f:
        env_content = f.read()
    
    print("\nAPI Keys:")
    has_at_least_one = False
    for var in required_vars:
        if var in env_content and not env_content.split(var)[1].split('\n')[0].strip(' ='):
            print_warning(f"{var} - Not set (at least one LLM provider required)")
        elif var in env_content:
            print_success(f"{var} - Configured")
            has_at_least_one = True
        else:
            print_warning(f"{var} - Not found in .env")
    
    if not has_at_least_one:
        print_error("No LLM API keys configured!")
        print("  Add at least one of: OPENAI_API_KEY, ANTHROPIC_API_KEY")
        return False
    
    print("\nOptional configurations:")
    for var in optional_vars:
        if var in env_content and env_content.split(var)[1].split('\n')[0].strip(' ='):
            print_success(f"{var} - Configured")
        else:
            print_warning(f"{var} - Not configured (optional)")
    
    return True


def install_missing_dependencies(missing: List[str]):
    """Offer to install missing dependencies."""
    if not missing:
        return
    
    print(f"\n{Colors.YELLOW}Missing {len(missing)} required package(s){Colors.END}")
    response = input("Would you like to install them now? (y/n): ")
    
    if response.lower() == 'y':
        print_step("Installing dependencies...")
        
        try:
            subprocess.check_call([
                sys.executable,
                "-m",
                "pip",
                "install",
                "-r",
                "requirements-aiagent.txt"
            ])
            print_success("Dependencies installed successfully!")
        except subprocess.CalledProcessError:
            print_error("Installation failed. Please install manually:")
            print("  pip install -r requirements-aiagent.txt")
    else:
        print("\nTo install manually:")
        print("  pip install -r requirements-aiagent.txt")


def test_imports():
    """Test if key modules can be imported."""
    print_step("Testing module imports...")
    
    tests = [
        ("core.orchestrator", "LangGraph Orchestrator"),
        ("agents.specialized.content_creator_crew", "CrewAI Content Crew"),
        ("core.tools.enhanced_registry", "Enhanced Tool Registry"),
        ("api.agent_center", "Agent Center API"),
    ]
    
    all_passed = True
    
    for module_name, description in tests:
        try:
            importlib.import_module(module_name)
            print_success(f"{description}")
        except Exception as e:
            print_error(f"{description} - {str(e)}")
            all_passed = False
    
    return all_passed


def create_examples_dir():
    """Create examples directory if it doesn't exist."""
    examples_dir = Path("examples")
    if not examples_dir.exists():
        examples_dir.mkdir()
        print_success("Created examples directory")
    else:
        print_success("Examples directory exists")


def run_simple_test():
    """Run a simple test to verify setup."""
    print_step("Running simple test...")
    
    try:
        from core.tools.enhanced_registry import get_global_registry
        
        registry = get_global_registry()
        tool_count = len(registry.tools)
        
        print_success(f"Tool registry initialized with {tool_count} tools")
        return True
    except Exception as e:
        print_error(f"Test failed: {str(e)}")
        return False


def print_next_steps():
    """Print next steps for the user."""
    print_header("Setup Complete!")
    
    print(f"{Colors.BOLD}Next Steps:{Colors.END}\n")
    
    print("1. Try the examples:")
    print(f"   {Colors.BLUE}python examples/sequential_workflow_example.py{Colors.END}")
    print(f"   {Colors.BLUE}python examples/crewai_example.py{Colors.END}")
    print()
    
    print("2. Start the API server:")
    print(f"   {Colors.BLUE}python -m uvicorn api.main:app --reload{Colors.END}")
    print()
    
    print("3. Access the Agent Center API:")
    print(f"   {Colors.BLUE}http://localhost:8000/docs{Colors.END}")
    print()
    
    print("4. Read the documentation:")
    print(f"   {Colors.BLUE}AI_AGENT_CENTER_PLAN.md{Colors.END} - Full plan")
    print(f"   {Colors.BLUE}AI_AGENT_CENTER_QUICKSTART.md{Colors.END} - Quick start guide")
    print()
    
    print(f"{Colors.BOLD}Resources:{Colors.END}\n")
    print("  • LangGraph: https://langchain-ai.github.io/langgraph/")
    print("  • CrewAI: https://docs.crewai.com/")
    print("  • LangChain: https://python.langchain.com/")
    print()


def main():
    """Main setup function."""
    print_header("AI Agent Center Setup")
    
    # Change to script directory
    os.chdir(Path(__file__).parent)
    
    # Check Python version
    if not check_python_version():
        print("\nPlease upgrade Python to 3.10 or higher")
        sys.exit(1)
    
    print()
    
    # Check dependencies
    installed, missing = check_dependencies()
    
    if missing:
        install_missing_dependencies(missing)
        print()
    
    # Check environment
    print()
    env_ok = check_env_file()
    
    if not env_ok:
        print(f"\n{Colors.YELLOW}Please configure your .env file before proceeding{Colors.END}")
    
    # Test imports
    print()
    imports_ok = test_imports()
    
    # Create examples directory
    print()
    create_examples_dir()
    
    # Run simple test
    print()
    test_ok = run_simple_test()
    
    # Summary
    print()
    print_header("Setup Summary")
    
    checks = [
        ("Python version", True),
        ("Dependencies", len(missing) == 0),
        ("Environment config", env_ok),
        ("Module imports", imports_ok),
        ("Simple test", test_ok),
    ]
    
    all_passed = all(passed for _, passed in checks)
    
    for check_name, passed in checks:
        if passed:
            print_success(check_name)
        else:
            print_error(check_name)
    
    print()
    
    if all_passed:
        print_success("All checks passed! System is ready.")
        print_next_steps()
    else:
        print_error("Some checks failed. Please fix the issues above.")
        print("\nFor help, see:")
        print("  • AI_AGENT_CENTER_QUICKSTART.md")
        print("  • AI_AGENT_CENTER_PLAN.md")


if __name__ == "__main__":
    main()
