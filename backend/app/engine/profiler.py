import re
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np

class DataProfiler:
    """
    Deterministic data profiling engine.
    Extracts structural metadata, statistical summaries, semantic types,
    and calculates data quality scores with actionable warning diagnostics.
    """

    SEMANTIC_KEYWORDS = {
        "revenue": ["revenue", "sales", "turnover", "gross_sales", "net_sales"],
        "cost": ["cost", "cogs", "expense", "spend"],
        "profit": ["profit", "margin_amount", "net_income", "earnings"],
        "price": ["price", "unit_price", "rate", "fee"],
        "quantity": ["quantity", "qty", "units", "volume", "count", "items"],
        "discount": ["discount", "pct_discount", "rebate"],
        "customer_id": ["customer_id", "cust_id", "user_id", "client_id", "account_id"],
        "order_id": ["order_id", "transaction_id", "invoice_id", "trx_id"],
        "product_id": ["product_id", "sku", "item_id"],
        "product": ["product", "product_name", "item_name"],
        "category": ["category", "sub_category", "segment", "department"],
        "date": ["date", "time", "created_at", "order_date", "timestamp", "period"],
        "region": ["region", "territory", "area", "zone"],
        "country": ["country", "nation", "state", "city"],
        "channel": ["channel", "acquisition_channel", "medium", "source"]
    }

    @classmethod
    def infer_semantic_type(cls, col_name: str, series: pd.Series) -> str:
        clean_name = col_name.lower().replace(" ", "_").replace("-", "_")
        for sem_type, keywords in cls.SEMANTIC_KEYWORDS.items():
            if any(k == clean_name or f"_{k}" in clean_name or f"{k}_" in clean_name for k in keywords):
                return sem_type

        # Check by content heuristics
        if pd.api.types.is_datetime64_any_dtype(series):
            return "date"
        if pd.api.types.is_numeric_dtype(series):
            if series.nunique() == 2 and set(series.dropna().unique()).issubset({0, 1}):
                return "boolean_flag"
            if clean_name.endswith("_id") or clean_name.endswith("id"):
                return "identifier"
            if series.min() >= 0 and series.max() <= 1 and ("rate" in clean_name or "pct" in clean_name):
                return "ratio"
            return "numerical"
        if series.nunique() <= 30 and series.count() > 50:
            return "categorical"
        return "text"

    @classmethod
    def profile(cls, df: pd.DataFrame, dataset_name: str = "dataset") -> Dict[str, Any]:
        row_count = len(df)
        col_count = len(df.columns)
        columns_profile = []
        semantic_types = {}
        warnings = []
        quality_penalties = 0.0

        # Memory usage in MB
        mem_mb = round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2)

        # Suspected primary keys
        suspected_pks = []
        for col in df.columns:
            if df[col].nunique() == row_count and df[col].isnull().sum() == 0:
                suspected_pks.append(col)

        # Check duplicate rows and primary key collisions
        dup_rows = int(df.duplicated().sum())
        id_cols = [c for c in df.columns if c.endswith("_id") or c == "id" or "order_id" in c or "transaction_id" in c]
        id_dup_count = 0
        id_dup_col = None
        for idc in id_cols:
            d_cnt = int(df[idc].dropna().duplicated().sum())
            if d_cnt > id_dup_count:
                id_dup_count = d_cnt
                id_dup_col = idc

        total_dups = max(dup_rows, id_dup_count)
        if total_dups > 0:
            dup_pct = round((total_dups / max(row_count, 1)) * 100, 2)
            quality_penalties += min(dup_pct * 2, 20.0)
            col_hint = f"in ID column '{id_dup_col}'" if id_dup_col and id_dup_count > dup_rows else ""
            warnings.append({
                "code": "DUPLICATE_RECORDS",
                "column": id_dup_col if id_dup_col and id_dup_count > dup_rows else None,
                "severity": "high" if dup_pct > 1 else "medium",
                "message": f"{total_dups:,} duplicate records found {col_hint} ({dup_pct}% of total records).",
                "explanation": "Duplicate transactions cause revenue, counts, and customer metrics to be double-counted.",
                "affected_rows": int(total_dups),
                "suggested_action": "Deduplicate by primary transaction ID before calculating totals."
            })

        date_min, date_max = None, None

        # Inspect individual columns
        for col in df.columns:
            s = df[col]
            missing_count = int(s.isnull().sum())
            missing_pct = round((missing_count / max(row_count, 1)) * 100, 2)
            unique_count = int(s.nunique())
            dtype_str = str(s.dtype)
            sem_type = cls.infer_semantic_type(col, s)
            semantic_types[col] = sem_type

            # Missing value checks
            if missing_pct > 0:
                severity = "high" if missing_pct > 15 else "medium" if missing_pct > 2 else "low"
                quality_penalties += min(missing_pct * 0.5, 10.0)
                warnings.append({
                    "code": "MISSING_VALUES",
                    "column": col,
                    "severity": severity,
                    "message": f"{missing_pct}% missing values in column '{col}' ({missing_count:,} rows).",
                    "explanation": f"Missing values in {sem_type or 'field'} will distort breakdowns and aggregations.",
                    "affected_rows": missing_count,
                    "suggested_action": f"Impute or filter null rows during analysis of {col}."
                })

            sample_vals = [x for x in s.dropna().head(5).tolist()]
            # Convert non-serializable objects to string
            sample_vals = [str(x) if isinstance(x, (pd.Timestamp, np.generic)) else x for x in sample_vals]

            min_val, max_val, mean_val, std_val = None, None, None, None

            # Numerical diagnostics
            if pd.api.types.is_numeric_dtype(s):
                clean_s = s.dropna()
                if len(clean_s) > 0:
                    min_val = str(round(clean_s.min(), 4))
                    max_val = str(round(clean_s.max(), 4))
                    mean_val = float(round(clean_s.mean(), 4))
                    std_val = float(round(clean_s.std(), 4)) if len(clean_s) > 1 else 0.0

                    # Check negative revenue / quantities
                    if sem_type in ["revenue", "price", "quantity"] and clean_s.min() < 0:
                        neg_count = int((clean_s < 0).sum())
                        quality_penalties += 5.0
                        warnings.append({
                            "code": "NEGATIVE_NUMERICAL",
                            "column": col,
                            "severity": "medium",
                            "message": f"{neg_count:,} records contain negative values in '{col}' (min: {min_val}).",
                            "explanation": f"Financial/quantity columns should usually be non-negative; negative values may reflect refunds, corrections, or corrupt rows.",
                            "affected_rows": neg_count,
                            "suggested_action": "Segregate refunds or cancellations from baseline sales."
                        })
            elif pd.api.types.is_datetime64_any_dtype(s) or sem_type == "date":
                # Datetime conversion check
                try:
                    dt_series = pd.to_datetime(s.dropna(), errors="coerce")
                    invalid_dates = int(dt_series.isnull().sum())
                    if invalid_dates > 0:
                        quality_penalties += 5.0
                        warnings.append({
                            "code": "INCONSISTENT_DATES",
                            "column": col,
                            "severity": "medium",
                            "message": f"{invalid_dates:,} values in date column '{col}' could not be parsed.",
                            "explanation": "Inconsistent date formatting blocks time series windowing and quarterly aggregations.",
                            "affected_rows": invalid_dates,
                            "suggested_action": "Standardize date strings into ISO 8601 YYYY-MM-DD."
                        })
                    else:
                        d_min = dt_series.min()
                        d_max = dt_series.max()
                        if pd.notnull(d_min) and pd.notnull(d_max):
                            date_min = d_min.strftime("%Y-%m-%d")
                            date_max = d_max.strftime("%Y-%m-%d")
                            min_val = date_min
                            max_val = date_max
                except Exception:
                    pass

            columns_profile.append({
                "column_name": col,
                "data_type": dtype_str,
                "semantic_type": sem_type,
                "missing_count": missing_count,
                "missing_percentage": missing_pct,
                "unique_count": unique_count,
                "sample_values": sample_vals,
                "min_value": min_val,
                "max_value": max_val,
                "mean_value": mean_val,
                "std_value": std_val
            })

        # Calculate numerical correlations
        numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        correlations = {}
        if len(numeric_cols) >= 2:
            try:
                corr_df = df[numeric_cols].corr()
                for c1 in numeric_cols[:10]:
                    correlations[c1] = {}
                    for c2 in numeric_cols[:10]:
                        val = corr_df.loc[c1, c2]
                        if pd.notnull(val):
                            correlations[c1][c2] = round(float(val), 3)
            except Exception:
                pass

        # Overall Data Quality Score: 100 minus penalties (bounded 10 to 100)
        overall_score = max(10.0, round(100.0 - quality_penalties, 1))

        date_range_str = f"{date_min} → {date_max}" if date_min and date_max else None

        return {
            "row_count": row_count,
            "column_count": col_count,
            "data_quality_score": overall_score,
            "date_range": date_range_str,
            "memory_usage_mb": mem_mb,
            "columns": columns_profile,
            "warnings": warnings,
            "correlations": correlations,
            "suspected_primary_keys": suspected_pks,
            "semantic_types": semantic_types
        }
