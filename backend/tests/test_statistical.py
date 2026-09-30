import pytest
import pandas as pd
import numpy as np
from app.engine.statistical import StatisticalEngine

def test_compare_periods_and_drivers():
    df = pd.DataFrame({
        "order_date": ["2026-04-10", "2026-05-15", "2026-07-20", "2026-08-10"],
        "region": ["North America", "Europe", "North America", "Europe"],
        "revenue": [5000.0, 3000.0, 3500.0, 3100.0]
    })

    comp = StatisticalEngine.compare_periods(
        df=df,
        date_col="order_date",
        metric_col="revenue",
        period1_range=("2026-04-01", "2026-06-30"),
        period2_range=("2026-07-01", "2026-09-30"),
        group_by_col="region"
    )

    assert comp["period_1"]["value"] == 8000.0
    assert comp["period_2"]["value"] == 6600.0
    assert comp["percentage_change"] == -17.5
    assert len(comp["segment_breakdown"]) == 2

    # Revenue driver decomposition test
    drivers = StatisticalEngine.decompose_revenue_drivers(
        p1_revenue=8000.0, p1_volume=40,
        p2_revenue=6600.0, p2_volume=33
    )
    assert drivers["primary_driver"] == "volume"
    assert drivers["total_revenue_change"] == -1400.0

def test_iqr_anomaly_detection():
    # Normal data + 1 clear outlier
    data = [100.0] * 30 + [105.0] * 20 + [5000.0]
    df = pd.DataFrame({"revenue": data})
    
    anom = StatisticalEngine.detect_anomalies(df, "revenue", method="iqr")
    assert anom["anomaly_count"] == 1
    assert anom["anomalies"][0]["value"] == 5000.0
