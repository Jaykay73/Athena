from enum import Enum
from typing import Dict, Any, List, Optional
import time

class AgentState(str, Enum):
    IDLE = "IDLE"
    UNDERSTAND = "UNDERSTAND"
    PLAN = "PLAN"
    EXECUTE = "EXECUTE"
    VALIDATE = "VALIDATE"
    INVESTIGATE_MORE = "INVESTIGATE_MORE"
    SYNTHESIZE = "SYNTHESIZE"
    COMPLETE = "COMPLETE"
    FAILED = "FAILED"

class AgentStateMachine:
    """
    Explicit Finite State Machine governing the analytical agent lifecycle.
    Enforces maximum iterations, tool execution limits, and strict validation gates.
    """

    def __init__(self, max_iterations: int = 8, max_tools: int = 15, timeout_sec: int = 30):
        self.state = AgentState.IDLE
        self.max_iterations = max_iterations
        self.max_tools = max_tools
        self.timeout_sec = timeout_sec
        self.iteration = 0
        self.tool_calls_count = 0
        self.start_time = time.time()
        self.history: List[Dict[str, Any]] = []

    def transition(self, next_state: AgentState, reason: str = ""):
        self.history.append({
            "from_state": self.state.value,
            "to_state": next_state.value,
            "iteration": self.iteration,
            "reason": reason,
            "timestamp": time.time()
        })
        self.state = next_state

    def check_limits(self) -> Optional[str]:
        if self.iteration >= self.max_iterations:
            return f"Exceeded maximum agent iterations ({self.max_iterations})."
        if self.tool_calls_count >= self.max_tools:
            return f"Exceeded maximum tool execution budget ({self.max_tools})."
        if (time.time() - self.start_time) > self.timeout_sec:
            return f"Execution timeout exceeded ({self.timeout_sec}s)."
        return None
