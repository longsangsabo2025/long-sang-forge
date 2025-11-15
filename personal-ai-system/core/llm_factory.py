"""Factory for creating LLM instances."""

from typing import Optional

from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.language_models import BaseChatModel
from loguru import logger

from .config import get_settings


class LLMFactory:
    """Factory for creating LLM instances."""
    
    @staticmethod
    def create_llm(
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        streaming: bool = True,
    ) -> BaseChatModel:
        """Create an LLM instance.
        
        Args:
            provider: LLM provider (anthropic, openai, google)
            model: Model name
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            streaming: Enable streaming
            
        Returns:
            LLM instance
        """
        settings = get_settings()
        
        # Use defaults from settings if not provided
        provider = provider or settings.llm.primary_provider
        temperature = temperature if temperature is not None else settings.llm.temperature
        max_tokens = max_tokens or settings.llm.max_tokens
        
        logger.info(f"Creating LLM: provider={provider}, model={model}")
        
        if provider == "anthropic":
            return ChatAnthropic(
                model=model or "claude-3-5-sonnet-20241022",
                temperature=temperature,
                max_tokens=max_tokens,
                anthropic_api_key=settings.llm.anthropic_api_key,
                streaming=streaming,
            )
        
        elif provider == "openai":
            return ChatOpenAI(
                model=model or "gpt-4o",
                temperature=temperature,
                max_tokens=max_tokens,
                openai_api_key=settings.llm.openai_api_key,
                streaming=streaming,
            )
        
        elif provider == "google":
            return ChatGoogleGenerativeAI(
                model=model or "gemini-2.0-flash-exp",
                temperature=temperature,
                max_output_tokens=max_tokens,
                google_api_key=settings.llm.google_api_key,
            )
        
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
    
    @staticmethod
    def create_fast_llm() -> BaseChatModel:
        """Create a fast LLM for quick tasks."""
        return LLMFactory.create_llm(
            provider="openai",
            model="gpt-4o-mini",
            temperature=0.3,
            max_tokens=1000,
        )
    
    @staticmethod
    def create_reasoning_llm() -> BaseChatModel:
        """Create a reasoning LLM for complex tasks."""
        return LLMFactory.create_llm(
            provider="anthropic",
            model="claude-3-5-sonnet-20241022",
            temperature=0.7,
            max_tokens=4096,
        )
