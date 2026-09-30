import uuid
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

class VisualizerEngine:
    """
    Deterministic Visualization Generator.
    Produces clean, presentation-grade chart specifications (line, bar, scatter, histogram, area)
    with clear metadata, units, axes, source provenance, and anomaly highlights.
    """

    @staticmethod
    def create_trend_chart(
        df: pd.DataFrame,
        date_col: str,
        metric_col: str,
        title: str,
        units: str = "$",
        source: str = "Athena Analytical Engine",
        anomalies: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        d = df.dropna(subset=[date_col, metric_col]).copy()
        d[date_col] = pd.to_datetime(d[date_col], errors="coerce")
        d = d.sort_values(by=date_col)
        
        # Aggregate by day or month if too many rows
        if len(d) > 60:
            d["period"] = d[date_col].dt.to_period("M").dt.to_timestamp()
            agg = d.groupby("period")[metric_col].sum().reset_index()
            date_field = "period"
        else:
            agg = d
            date_field = date_col

        chart_data = []
        for _, row in agg.iterrows():
            d_str = row[date_field].strftime("%Y-%m-%d") if hasattr(row[date_field], "strftime") else str(row[date_field])
            chart_data.append({
                "date": d_str,
                "value": round(float(row[metric_col]), 2)
            })

        min_date = chart_data[0]["date"] if chart_data else ""
        max_date = chart_data[-1]["date"] if chart_data else ""

        return {
            "id": f"chart-{uuid.uuid4().hex[:8]}",
            "title": title,
            "chart_type": "line",
            "x_axis": "date",
            "y_axis": "value",
            "series_name": metric_col.replace("_", " ").title(),
            "data": chart_data,
            "units": units,
            "source": source,
            "date_range": f"{min_date} → {max_date}",
            "highlight_anomalies": anomalies or []
        }

    @staticmethod
    def create_category_bar_chart(
        df: pd.DataFrame,
        cat_col: str,
        metric_col: str,
        title: str,
        units: str = "$",
        top_n: int = 10,
        source: str = "Athena Analytical Engine"
    ) -> Dict[str, Any]:
        agg = df.groupby(cat_col)[metric_col].sum().reset_index()
        agg = agg.sort_values(by=metric_col, ascending=False).head(top_n)

        chart_data = []
        for _, row in agg.iterrows():
            chart_data.append({
                "category": str(row[cat_col]),
                "value": round(float(row[metric_col]), 2)
            })

        return {
            "id": f"chart-{uuid.uuid4().hex[:8]}",
            "title": title,
            "chart_type": "bar",
            "x_axis": "category",
            "y_axis": "value",
            "series_name": metric_col.replace("_", " ").title(),
            "data": chart_data,
            "units": units,
            "source": source
        }

    @staticmethod
    def create_period_comparison_chart(
        breakdown: List[Dict[str, Any]],
        title: str,
        units: str = "$",
        period1_label: str = "Prior Period",
        period2_label: str = "Current Period",
        source: str = "Athena Analytical Engine"
    ) -> Dict[str, Any]:
        chart_data = []
        for item in breakdown:
            chart_data.append({
                "segment": item.get("segment", "Unknown"),
                period1_label: item.get("period_1_value", 0),
                period2_label: item.get("period_2_value", 0),
                "change": item.get("change", 0)
            })

        return {
            "id": f"chart-{uuid.uuid4().hex[:8]}",
            "title": title,
            "chart_type": "bar",
            "x_axis": "segment",
            "y_axis": "value",
            "series_name": f"{period1_label} vs {period2_label}",
            "data": chart_data,
            "units": units,
            "source": source
        }

    @staticmethod
    def create_scatter_correlation_chart(
        df: pd.DataFrame,
        col_x: str,
        col_y: str,
        title: str,
        sample_size: int = 200,
        source: str = "Athena Analytical Engine"
    ) -> Dict[str, Any]:
        clean = df[[col_x, col_y]].dropna()
        if len(clean) > sample_size:
            clean = clean.sample(sample_size, random_state=42)

        chart_data = []
        for _, row in clean.iterrows():
            chart_data.append({
                "x": round(float(row[col_x]), 2),
                "y": round(float(row[col_y]), 2)
            })

        return {
            "id": f"chart-{uuid.uuid4().hex[:8]}",
            "title": title,
            "chart_type": "scatter",
            "x_axis": col_x,
            "y_axis": col_y,
            "series_name": f"{col_y} vs {col_x}",
            "data": chart_data,
            "source": source
        }
