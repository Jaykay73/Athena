import pytest
import pandas as pd
import numpy as np
from app.engine.profiler import DataProfiler

def test_profiler_statistics_and_warnings():
    # Sample dataframe with intentional flaws
    df = pd.DataFrame({
        "order_id": ["ORD-1", "ORD-2", "ORD-3", "ORD-3"],  # 1 duplicate
        "order_date": ["2026-01-01", "2026-02-01", "2026-03-01", "2026-03-01"],
        "region": ["North America", "Europe", None, None],  # 50% missing
        "revenue": [500.0, 1200.0, -150.0, 800.0],  # 1 negative revenue
        "category": ["Software", "Hardware", "Services", "Software"]
    })

    profile = DataProfiler.profile(df, "test_sales")

    assert profile["row_count"] == 4
    assert profile["column_count"] == 5
    assert profile["data_quality_score"] < 100.0  # penalties applied

    # Check semantic types inferred
    sem_types = profile["semantic_types"]
    assert sem_types["order_id"] == "order_id"
    assert sem_types["region"] == "region"
    assert sem_types["revenue"] == "revenue"

    # Check warnings
    warning_codes = [w["code"] for w in profile["warnings"]]
    assert "DUPLICATE_RECORDS" in warning_codes
    assert "MISSING_VALUES" in warning_codes
    assert "NEGATIVE_NUMERICAL" in warning_codes
