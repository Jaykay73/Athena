import uuid
from typing import Dict, Any, List

class LineageBuilder:
    """
    Constructs an end-to-end data provenance and lineage DAG:
    Question -> Dataset -> Active Columns -> Analytical Queries -> Calculated Metrics -> Visualizations -> Conclusion.
    """

    @staticmethod
    def build_lineage(
        question: str,
        dataset_name: str,
        columns_used: List[str],
        queries_used: List[str],
        metrics: List[Dict[str, Any]],
        charts: List[Dict[str, Any]],
        conclusion: str
    ) -> Dict[str, Any]:
        nodes = []
        edges = []

        q_node = {"id": "n-q", "type": "question", "label": "User Query", "details": question[:60]}
        nodes.append(q_node)

        ds_node = {"id": "n-ds", "type": "dataset", "label": f"Dataset: {dataset_name}", "details": f"{len(columns_used)} columns selected"}
        nodes.append(ds_node)
        edges.append({"from_node": "n-q", "to_node": "n-ds", "label": "queries"})

        # Column nodes
        for i, col in enumerate(columns_used[:6]):
            c_id = f"n-col-{i}"
            nodes.append({"id": c_id, "type": "column", "label": f"Col: {col}", "details": "active field"})
            edges.append({"from_node": "n-ds", "to_node": c_id, "label": "contains"})

        # Query node
        q_exec_id = "n-query"
        nodes.append({"id": q_exec_id, "type": "query", "label": "DuckDB Analytics", "details": queries_used[0][:50] if queries_used else "Calculated"})
        for i in range(min(len(columns_used), 6)):
            edges.append({"from_node": f"n-col-{i}", "to_node": q_exec_id, "label": "transforms"})

        # Metric node
        m_id = "n-metric"
        m_label = f"{metrics[0].get('name', 'Metric')}: {metrics[0].get('value', '')}" if metrics else "Aggregated metrics"
        nodes.append({"id": m_id, "type": "metric", "label": m_label, "details": "computed metric"})
        edges.append({"from_node": q_exec_id, "to_node": m_id, "label": "produces"})

        # Chart node
        if charts:
            ch_id = "n-chart"
            nodes.append({"id": ch_id, "type": "chart", "label": f"Chart: {charts[0].get('title', '')[:30]}", "details": charts[0].get('chart_type', 'line')})
            edges.append({"from_node": m_id, "to_node": ch_id, "label": "renders"})
            concl_source = ch_id
        else:
            concl_source = m_id

        # Conclusion node
        c_node = {"id": "n-conclusion", "type": "conclusion", "label": "Verified Finding", "details": conclusion[:60]}
        nodes.append(c_node)
        edges.append({"from_node": concl_source, "to_node": "n-conclusion", "label": "synthesizes"})

        return {"nodes": nodes, "edges": edges}
