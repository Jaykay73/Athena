import re
from typing import Dict, Any, List, Optional
from app.models.schemas import Hypothesis

class AnalysisPlanner:
    """
    Formulates structured analytical hypotheses and execution plans.
    Translates business questions into competing hypotheses and deterministic tool steps.
    """

    @classmethod
    def classify_intent(cls, question: str) -> str:
        q = question.lower()
        if any(w in q for w in ["why", "fall", "drop", "decline", "fell", "decrease", "down", "dropped"]):
            return "root_cause_decline"
        if any(w in q for w in ["growth", "driving", "increase", "top performing", "expanded"]):
            return "growth_drivers"
        if any(w in q for w in ["churn", "inactive", "attrition", "leaving", "lost customer"]):
            return "churn_analysis"
        if any(w in q for w in ["margin", "profitability", "less profitable", "declining margin"]):
            return "margin_analysis"
        if any(w in q for w in ["anomal", "unusual", "outlier", "irregular", "spike"]):
            return "anomaly_detection"
        if any(w in q for w in ["compare", "comparison", "across region", "versus", "vs"]):
            return "segment_comparison"
        if any(w in q for w in ["policy", "document", "contract", "terms", "rules"]):
            return "policy_document_analysis"
        return "general_analytical_query"

    @classmethod
    def generate_hypotheses(cls, question: str, intent: str, schema_columns: List[str]) -> List[Dict[str, Any]]:
        """Generates competing hypotheses for analytical questions."""
        has_region = any(c in schema_columns for c in ["region", "country", "territory"])
        has_product = any(c in schema_columns for c in ["product", "product_name", "category"])
        has_segment = any(c in schema_columns for c in ["segment", "customer_segment", "channel"])

        hypotheses = []

        if intent == "root_cause_decline":
            hypotheses.append({
                "id": "h1",
                "statement": "Revenue decline was driven by reduced transaction order volume rather than lower order sizes.",
                "tested_with": "decompose_revenue_drivers()",
                "status": "pending",
                "evidence_summary": "Testing volume vs AOV delta"
            })
            if has_region:
                hypotheses.append({
                    "id": "h2",
                    "statement": "The downturn was concentrated in a single deteriorating geographic region.",
                    "tested_with": "compare_periods(group_by='region')",
                    "status": "pending",
                    "evidence_summary": "Testing regional contribution variance"
                })
            if has_segment:
                hypotheses.append({
                    "id": "h3",
                    "statement": "Enterprise/B2B customer cohorts experienced disproportionate contraction.",
                    "tested_with": "compare_periods(group_by='customer_segment')",
                    "status": "pending",
                    "evidence_summary": "Testing customer tier contribution"
                })
            if has_product:
                hypotheses.append({
                    "id": "h4",
                    "statement": "Key high-volume product categories suffered sharp demand contraction.",
                    "tested_with": "compare_periods(group_by='category')",
                    "status": "pending",
                    "evidence_summary": "Testing category revenue performance"
                })
            hypotheses.append({
                "id": "h5",
                "statement": "Average unit pricing or discounting policy shift depressed realized price per unit.",
                "tested_with": "SQL unit_price & discount analysis",
                "status": "pending",
                "evidence_summary": "Testing discount variance"
            })

        elif intent == "margin_analysis":
            hypotheses.append({
                "id": "h1",
                "statement": "Cost of goods sold (COGS) inflation squeezed gross margins.",
                "tested_with": "SQL unit_cost vs unit_price comparison",
                "status": "pending",
                "evidence_summary": "Testing input cost increases"
            })
            hypotheses.append({
                "id": "h2",
                "statement": "Shift in product sales mix toward lower-margin commodity products.",
                "tested_with": "SQL category margin breakdown",
                "status": "pending",
                "evidence_summary": "Testing mix shift effect"
            })
            hypotheses.append({
                "id": "h3",
                "statement": "Increased promotional discounting eroded net realization.",
                "tested_with": "SQL discount_rate variance by period",
                "status": "pending",
                "evidence_summary": "Testing discount rate expansion"
            })

        elif intent == "churn_analysis":
            hypotheses.append({
                "id": "h1",
                "statement": "Inactivity is concentrated in specific customer tiers (e.g. Enterprise vs SMB).",
                "tested_with": "SQL customer inactivity breakdown by segment",
                "status": "pending",
                "evidence_summary": "Testing segment churn disparity"
            })
            hypotheses.append({
                "id": "h2",
                "statement": "Churned accounts show decreasing transaction frequency prior to final order.",
                "tested_with": "RFM recency & frequency analysis",
                "status": "pending",
                "evidence_summary": "Testing frequency drop"
            })

        elif intent == "anomaly_detection":
            hypotheses.append({
                "id": "h1",
                "statement": "Extreme volume spikes or negative revenue records represent isolated operational data errors.",
                "tested_with": "detect_anomalies(method='iqr')",
                "status": "pending",
                "evidence_summary": "Testing IQR 1.5 bounds"
            })
            hypotheses.append({
                "id": "h2",
                "statement": "Specific transaction dates experienced statistical outliers (>3 standard deviations).",
                "tested_with": "detect_anomalies(method='z_score')",
                "status": "pending",
                "evidence_summary": "Testing Z-score > 3.0"
            })

        else:
            hypotheses.append({
                "id": "h1",
                "statement": "Metrics follow normal seasonal distributions across observed timeframes.",
                "tested_with": "Statistical aggregation and distribution analysis",
                "status": "pending",
                "evidence_summary": "Testing baseline distribution"
            })

        return hypotheses
