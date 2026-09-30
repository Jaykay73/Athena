from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
from app.engine.duckdb_engine import analytics_engine
from app.engine.statistical import StatisticalEngine
from app.engine.visualizer import VisualizerEngine
from app.engine.rag_engine import rag_engine

class ToolRegistry:
    """
    Centralized tool execution registry for Athena's analytical agent.
    Each tool returns deterministic structured data and timing information.
    """

    def __init__(self, active_dfs: Optional[Dict[str, pd.DataFrame]] = None):
        self.active_dfs: Dict[str, pd.DataFrame] = active_dfs or {}

    def register_dataframe(self, name: str, df: pd.DataFrame):
        self.active_dfs[name.lower()] = df
        analytics_engine.register_dataframe(name, df)

    def inspect_schema(self, dataset_name: str) -> Dict[str, Any]:
        """Inspect column names, data types, and nullability."""
        clean_name = dataset_name.lower().replace("-", "_").replace(" ", "_")
        try:
            schema = analytics_engine.get_table_schema(clean_name)
            return {"success": True, "dataset": clean_name, "columns": schema}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def run_sql(self, query: str) -> Dict[str, Any]:
        """Execute a safe read-only SQL query in DuckDB."""
        return analytics_engine.execute_query(query)

    def compare_periods(
        self,
        dataset_name: str,
        date_col: str,
        metric_col: str,
        p1_range: Tuple[str, str],
        p2_range: Tuple[str, str],
        group_by_col: Optional[str] = None
    ) -> Dict[str, Any]:
        """Run period-over-period comparison with segment contribution."""
        clean_name = dataset_name.lower().replace("-", "_").replace(" ", "_")
        df = self.active_dfs.get(clean_name)
        if df is None:
            return {"success": False, "error": f"Dataset '{clean_name}' not loaded in active session."}
        
        result = StatisticalEngine.compare_periods(df, date_col, metric_col, p1_range, p2_range, group_by_col)
        result["success"] = True
        return result

    def decompose_revenue_drivers(
        self,
        p1_revenue: float, p1_volume: int,
        p2_revenue: float, p2_volume: int
    ) -> Dict[str, Any]:
        """Decompose revenue change into volume effect vs price/AOV effect."""
        result = StatisticalEngine.decompose_revenue_drivers(p1_revenue, p1_volume, p2_revenue, p2_volume)
        result["success"] = True
        return result

    def detect_anomalies(
        self,
        dataset_name: str,
        metric_col: str,
        date_col: Optional[str] = None,
        method: str = "iqr"
    ) -> Dict[str, Any]:
        """Detect anomalies using IQR, Z-Score, or Isolation Forest."""
        clean_name = dataset_name.lower().replace("-", "_").replace(" ", "_")
        df = self.active_dfs.get(clean_name)
        if df is None:
            return {"success": False, "error": f"Dataset '{clean_name}' not loaded."}
        
        result = StatisticalEngine.detect_anomalies(df, metric_col, date_col, method)
        result["success"] = True
        return result

    def calculate_correlation(self, dataset_name: str, col_x: str, col_y: str) -> Dict[str, Any]:
        clean_name = dataset_name.lower().replace("-", "_").replace(" ", "_")
        df = self.active_dfs.get(clean_name)
        if df is None:
            return {"success": False, "error": f"Dataset '{clean_name}' not loaded."}
        
        result = StatisticalEngine.calculate_correlation(df, col_x, col_y)
        result["success"] = "error" not in result
        return result

    def search_documentation(self, query: str) -> Dict[str, Any]:
        """Search policy, business rules, and context documents via RAG."""
        docs = rag_engine.search(query, top_k=2)
        return {"success": True, "results": docs, "count": len(docs)}

    def generate_chart(
        self,
        chart_type: str,
        title: str,
        data: List[Dict[str, Any]],
        x_axis: str,
        y_axis: str,
        units: str = "$"
    ) -> Dict[str, Any]:
        return {
            "success": True,
            "chart": {
                "id": f"chart-{len(data)}",
                "title": title,
                "chart_type": chart_type,
                "x_axis": x_axis,
                "y_axis": y_axis,
                "data": data,
                "units": units
            }
        }
