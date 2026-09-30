from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class LLMResponse:
    def __init__(self, content: str, model: str, provider: str, tokens_used: int = 0):
        self.content = content
        self.model = model
        self.provider = provider
        self.tokens_used = tokens_used

class LLMProvider(ABC):
    """Abstract base class for all LLM providers in Athena."""

    @abstractmethod
    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.1,
        max_tokens: int = 2000
    ) -> LLMResponse:
        pass

    @abstractmethod
    def is_available(self) -> bool:
        pass
