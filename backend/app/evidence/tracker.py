import uuid
from typing import Dict, Any, List, Optional

class EvidenceTracker:
    """
    Evidence System: Records, indexes, and tracks empirical proof for every analytical claim.
    Every factual statement in an Athena analysis is bound to verifiable source data and code.
    """

    def __init__(self, analysis_id: str):
        self.analysis_id = analysis_id
        self.evidence_list: List[Dict[str, Any]] = []

    def record_evidence(
        self,
        claim: str,
        source_dataset: str,
        relevant_columns: List[str],
        computation_type: str,
        query_or_code: str,
        computed_result: Any,
        assumptions: Optional[List[str]] = None,
        verification_status: str = "verified"
    ) -> Dict[str, Any]:
        item = {
            "id": f"ev-{uuid.uuid4().hex[:8]}",
            "claim": claim,
            "source_dataset": source_dataset,
            "relevant_columns": relevant_columns,
            "computation_type": computation_type,
            "query_or_code": query_or_code.strip() if query_or_code else None,
            "computed_result": computed_result,
            "assumptions": assumptions or ["Standard business calendar applied", "Outliers included unless explicitly filtered"],
            "verification_status": verification_status
        }
        self.evidence_list.append(item)
        return item

    def get_all_evidence(self) -> List[Dict[str, Any]]:
        return self.evidence_list
