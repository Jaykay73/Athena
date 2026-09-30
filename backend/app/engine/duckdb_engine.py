import time
import os
from typing import Dict, Any, List, Optional, Tuple
import duckdb
import pandas as pd
from app.core.security import validate_sql_safety, SecurityError
from app.core.config import settings

class DuckDBEngine:
    """
    High-performance analytical SQL query engine backed by DuckDB.
    Enforces read-only execution, records query duration, and formats results.
    """

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or ":memory:"
        self.conn = duckdb.connect(self.db_path)
        self.registered_views = set()

    def register_dataset(self, view_name: str, file_path: str, file_type: str = "csv"):
        """Register a dataset file as an in-memory or zero-copy DuckDB view."""
        clean_view = view_name.lower().replace("-", "_").replace(" ", "_")
        escaped_path = file_path.replace("\\", "/")
        
        if file_type == "csv":
            self.conn.execute(f"CREATE OR REPLACE VIEW {clean_view} AS SELECT * FROM read_csv_auto('{escaped_path}')")
        elif file_type == "parquet":
            self.conn.execute(f"CREATE OR REPLACE VIEW {clean_view} AS SELECT * FROM read_parquet('{escaped_path}')")
        elif file_type == "json":
            self.conn.execute(f"CREATE OR REPLACE VIEW {clean_view} AS SELECT * FROM read_json_auto('{escaped_path}')")
        elif file_type == "xlsx":
            # For excel, load into pandas then register
            df = pd.read_excel(file_path)
            self.conn.register(clean_view, df)
        else:
            raise ValueError(f"Unsupported file type for DuckDB: {file_type}")

        self.registered_views.add(clean_view)
        return clean_view

    def register_dataframe(self, view_name: str, df: pd.DataFrame):
        clean_view = view_name.lower().replace("-", "_").replace(" ", "_")
        self.conn.register(clean_view, df)
        self.registered_views.add(clean_view)
        return clean_view

    def execute_query(self, query: str, max_rows: int = 1000) -> Dict[str, Any]:
        """
        Executes a safe read-only SQL query against DuckDB.
        Returns tabular rows, column schemas, execution duration, and row count.
        """
        is_safe, error_msg = validate_sql_safety(query)
        if not is_safe:
            raise SecurityError(f"SQL Safety Violation: {error_msg}")

        start_time = time.time()
        try:
            rel = self.conn.sql(query)
            duration_ms = round((time.time() - start_time) * 1000, 2)
            
            # Fetch column descriptions
            columns = [desc[0] for desc in rel.description] if rel.description else []
            
            # Fetch results
            df_result = rel.limit(max_rows).df()
            total_rows = len(df_result)
            
            # Convert NaN to None for JSON compliance
            cleaned_records = df_result.where(pd.notnull(df_result), None).to_dict(orient="records")

            return {
                "success": True,
                "columns": columns,
                "rows": cleaned_records,
                "row_count": total_rows,
                "duration_ms": duration_ms,
                "query": query.strip()
            }
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "success": False,
                "error": str(e),
                "duration_ms": duration_ms,
                "query": query.strip()
            }

    def get_table_schema(self, table_name: str) -> List[Dict[str, str]]:
        clean_view = table_name.lower().replace("-", "_").replace(" ", "_")
        res = self.conn.execute(f"DESCRIBE {clean_view}").fetchall()
        return [{"column_name": r[0], "column_type": r[1], "null": r[2]} for r in res]

# Global shared analytical engine instance
analytics_engine = DuckDBEngine()
