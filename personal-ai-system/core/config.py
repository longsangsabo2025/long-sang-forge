"""Configuration management."""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml
from pydantic import Field
from pydantic_settings import BaseSettings


class LLMSettings(BaseSettings):
    """LLM configuration."""

    primary_provider: str = "anthropic"
    fallback_provider: str = "openai"
    temperature: float = 0.7
    max_tokens: int = 4096
    streaming: bool = True
    
    # API Keys (support both VITE_ prefix and direct)
    openai_api_key: Optional[str] = Field(default=None)
    anthropic_api_key: Optional[str] = Field(default=None)
    google_api_key: Optional[str] = Field(default=None)
    
    def __init__(self, **data):
        # Handle VITE_ prefix from frontend .env
        import os
        if not data.get('openai_api_key'):
            data['openai_api_key'] = os.getenv('VITE_OPENAI_API_KEY') or os.getenv('OPENAI_API_KEY')
        if not data.get('anthropic_api_key'):
            data['anthropic_api_key'] = os.getenv('VITE_ANTHROPIC_API_KEY') or os.getenv('ANTHROPIC_API_KEY')
        if not data.get('google_api_key'):
            data['google_api_key'] = os.getenv('VITE_GOOGLE_API_KEY') or os.getenv('GOOGLE_API_KEY')
        super().__init__(**data)
    
    class Config:
        env_file = ".env"
        populate_by_name = True


class MemorySettings(BaseSettings):
    """Memory system configuration."""

    type: str = "qdrant"
    collection_name: str = "personal_ai_memory"
    embedding_dimension: int = 1536
    
    # Qdrant settings
    qdrant_host: str = Field(default="localhost", alias="QDRANT_HOST")
    qdrant_port: int = Field(default=6333, alias="QDRANT_PORT")
    qdrant_api_key: Optional[str] = Field(default=None, alias="QDRANT_API_KEY")
    
    # Redis settings
    redis_host: str = Field(default="localhost", alias="REDIS_HOST")
    redis_port: int = Field(default=6379, alias="REDIS_PORT")
    redis_password: Optional[str] = Field(default=None, alias="REDIS_PASSWORD")
    
    class Config:
        env_file = ".env"
        populate_by_name = True


class SystemSettings(BaseSettings):
    """System-wide settings."""

    name: str = "Personal AI Assistant"
    version: str = "0.1.0"
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    max_retries: int = 3
    timeout_seconds: int = 300
    
    class Config:
        env_file = ".env"
        populate_by_name = True


class Settings(BaseSettings):
    """Main settings object."""

    system: SystemSettings = Field(default_factory=SystemSettings)
    llm: LLMSettings = Field(default_factory=LLMSettings)
    memory: MemorySettings = Field(default_factory=MemorySettings)
    
    # Additional config from YAML
    agents: Dict[str, Any] = Field(default_factory=dict)
    tools: Dict[str, Any] = Field(default_factory=dict)
    orchestration: Dict[str, Any] = Field(default_factory=dict)
    monitoring: Dict[str, Any] = Field(default_factory=dict)
    security: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        env_file = ".env"


def load_settings(config_path: Optional[Path] = None) -> Settings:
    """Load settings from YAML and environment variables."""
    
    # Load YAML config
    if config_path is None:
        config_path = Path(__file__).parent.parent / "config" / "settings.yaml"
    
    yaml_config = {}
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            yaml_config = yaml.safe_load(f)
    
    # Create settings with YAML config
    settings = Settings(
        system=SystemSettings(**yaml_config.get("system", {})),
        llm=LLMSettings(**yaml_config.get("llm", {})),
        memory=MemorySettings(**yaml_config.get("memory", {})),
        agents=yaml_config.get("agents", {}),
        tools=yaml_config.get("tools", {}),
        orchestration=yaml_config.get("orchestration", {}),
        monitoring=yaml_config.get("monitoring", {}),
        security=yaml_config.get("security", {}),
    )
    
    return settings


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get global settings instance."""
    global _settings
    if _settings is None:
        _settings = load_settings()
    return _settings
