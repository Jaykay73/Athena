import pytest
import pandas as pd
from app.engine.duckdb_engine import analytics_engine
from app.core.security import validate_sql_safety, SecurityError

def test_duckdb_read_only_and_safety():
    df = pd.DataFrame({
        "product": ["Widget A", "Widget B", "Widget C"],
        "price": [10.0, 25.0, 50.0],
        "sales": [100, 200, 300]
    })
    analytics_engine.register_dataframe("test_products", df)

    # Safe SELECT query
    res = analytics_engine.execute_query("SELECT product, price * sales as revenue FROM test_products ORDER BY revenue DESC")
    assert res["success"] is True
    assert len(res["rows"]) == 3
    assert res["rows"][0]["revenue"] == 15000.0

    # Test safety against destructive SQL
    is_safe, err = validate_sql_safety("DROP TABLE test_products")
    assert is_safe is False
    assert "DROP" in err

    is_safe, err = validate_sql_safety("DELETE FROM test_products WHERE price > 0")
    assert is_safe is False

    is_safe, err = validate_sql_safety("SELECT * FROM test_products; DROP TABLE test_products;")
    assert is_safe is False
