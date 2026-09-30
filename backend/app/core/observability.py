import time
import logging
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

# Configure structured logging format
logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "message": "%(message)s"}'
)
logger = logging.getLogger("athena")

class TraceStep:
    def __init__(self, step_number: int, action: str, details: Optional[Dict[str, Any]] = None):
        self.step_number = step_number
        self.action = action
        self.details = details or {}
        self.timestamp = datetime.utcnow().isoformat()
        self.duration_ms: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_number": self.step_number,
            "action": self.action,
            "details": self.details,
            "timestamp": self.timestamp,
            "duration_ms": round(self.duration_ms, 2)
        }

class ExecutionTrace:
    def __init__(self, analysis_id: str, question: str):
        self.analysis_id = analysis_id
        self.question = question
        self.start_time = time.time()
        self.end_time: Optional[float] = None
        self.steps: List[TraceStep] = []
        self.tool_calls: List[Dict[str, Any]] = []
        self.sql_queries: List[Dict[str, Any]] = []
        self.token_usage: Dict[str, int] = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        self.errors: List[str] = []

    def add_step(self, action: str, details: Optional[Dict[str, Any]] = None) -> TraceStep:
        step_num = len(self.steps) + 1
        step = TraceStep(step_num, action, details)
        self.steps.append(step)
        logger.info(f"[Trace {self.analysis_id}] Step {step_num}: {action}")
        return step

    def record_tool_call(self, tool_name: str, arguments: Dict[str, Any], duration_ms: float, success: bool, output_summary: str):
        record = {
            "tool": tool_name,
            "arguments": arguments,
            "duration_ms": round(duration_ms, 2),
            "success": success,
            "output_summary": output_summary,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.tool_calls.append(record)
        logger.info(f"[ToolCall {self.analysis_id}] {tool_name} executed in {duration_ms:.2f}ms (Success: {success})")

    def record_sql(self, query: str, duration_ms: float, row_count: int):
        self.sql_queries.append({
            "query": query,
            "duration_ms": round(duration_ms, 2),
            "row_count": row_count,
            "timestamp": datetime.utcnow().isoformat()
        })

    def complete(self) -> Dict[str, Any]:
        self.end_time = time.time()
        total_duration_ms = (self.end_time - self.start_time) * 1000
        return {
            "analysis_id": self.analysis_id,
            "question": self.question,
            "total_duration_ms": round(total_duration_ms, 2),
            "step_count": len(self.steps),
            "steps": [s.to_dict() for s in self.steps],
            "tool_calls": self.tool_calls,
            "sql_queries": self.sql_queries,
            "token_usage": self.token_usage,
            "errors": self.errors
        }

# Trace registry to access execution traces via API
TRACE_REGISTRY: Dict[str, ExecutionTrace] = {}

def create_trace(question: str, analysis_id: Optional[str] = None) -> ExecutionTrace:
    aid = analysis_id or str(uuid.uuid4())
    trace = ExecutionTrace(aid, question)
    TRACE_REGISTRY[aid] = trace
    return trace

def get_trace(analysis_id: str) -> Optional[Dict[str, Any]]:
    trace = TRACE_REGISTRY.get(analysis_id)
    return trace.complete() if trace else None
