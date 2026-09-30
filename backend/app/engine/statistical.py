import math
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
from scipy import stats
from sklearn.ensemble import IsolationForest

class StatisticalEngine:
    """
    Deterministic Statistical and Machine Learning Analysis Engine.
    Powers hypothesis testing, anomaly detection, driver decomposition, and time series trend analysis.
    """

    @staticmethod
    def calculate_descriptive(series: pd.Series) -> Dict[str, Any]:
        clean = series.dropna()
        if len(clean) == 0:
            return {"count": 0}
        
        q25 = float(np.percentile(clean, 25))
        q75 = float(np.percentile(clean, 75))
        iqr = q75 - q25

        return {
            "count": int(len(clean)),
            "mean": round(float(clean.mean()), 4),
            "median": round(float(clean.median()), 4),
            "std": round(float(clean.std()), 4) if len(clean) > 1 else 0.0,
            "min": round(float(clean.min()), 4),
            "max": round(float(clean.max()), 4),
            "q25": round(q25, 4),
            "q75": round(q75, 4),
            "iqr": round(iqr, 4),
            "skewness": round(float(stats.skew(clean)), 4) if len(clean) > 2 else 0.0
        }

    @staticmethod
    def compare_periods(
        df: pd.DataFrame,
        date_col: str,
        metric_col: str,
        period1_range: Tuple[str, str],
        period2_range: Tuple[str, str],
        group_by_col: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Period-over-period comparison (e.g. Q1 vs Q2, or Month-over-Month).
        Calculates baseline, comparison value, absolute change, percentage change,
        and if group_by_col is provided, calculates contribution to overall variance.
        """
        d = df.copy()
        d[date_col] = pd.to_datetime(d[date_col], errors="coerce")
        
        p1 = d[(d[date_col] >= period1_range[0]) & (d[date_col] <= period1_range[1])]
        p2 = d[(d[date_col] >= period2_range[0]) & (d[date_col] <= period2_range[1])]

        val1 = float(p1[metric_col].sum())
        val2 = float(p2[metric_col].sum())
        delta = val2 - val1
        pct_change = round((delta / val1 * 100), 2) if val1 != 0 else 0.0

        result = {
            "metric": metric_col,
            "period_1": {"range": period1_range, "value": round(val1, 2), "rows": len(p1)},
            "period_2": {"range": period2_range, "value": round(val2, 2), "rows": len(p2)},
            "absolute_change": round(delta, 2),
            "percentage_change": pct_change
        }

        if group_by_col and group_by_col in df.columns:
            g1 = p1.groupby(group_by_col)[metric_col].sum()
            g2 = p2.groupby(group_by_col)[metric_col].sum()
            combined = pd.DataFrame({"p1": g1, "p2": g2}).fillna(0)
            combined["change"] = combined["p2"] - combined["p1"]
            
            # Contribution to overall change
            if delta != 0:
                combined["contribution_pct"] = (combined["change"] / delta * 100).round(2)
            else:
                combined["contribution_pct"] = 0.0

            breakdown = []
            for seg, row in combined.sort_values(by="change", ascending=delta > 0).iterrows():
                breakdown.append({
                    "segment": str(seg),
                    "period_1_value": round(float(row["p1"]), 2),
                    "period_2_value": round(float(row["p2"]), 2),
                    "change": round(float(row["change"]), 2),
                    "contribution_pct": float(row["contribution_pct"])
                })
            result["segment_breakdown"] = breakdown

        return result

    @staticmethod
    def decompose_revenue_drivers(
        p1_revenue: float, p1_volume: int,
        p2_revenue: float, p2_volume: int
    ) -> Dict[str, Any]:
        """
        Decomposes delta into Volume Effect vs Average Order Value (Price) Effect.
        Total Delta = Volume Effect + Price/AOV Effect
        """
        aov1 = (p1_revenue / p1_volume) if p1_volume > 0 else 0
        aov2 = (p2_revenue / p2_volume) if p2_volume > 0 else 0
        
        delta_rev = p2_revenue - p1_revenue
        delta_vol = p2_volume - p1_volume
        delta_aov = aov2 - aov1

        # Volume effect = delta_vol * aov1
        vol_effect = delta_vol * aov1
        # Price/AOV effect = p2_volume * delta_aov
        aov_effect = p2_volume * delta_aov

        vol_pct = round((vol_effect / delta_rev * 100), 2) if delta_rev != 0 else 0.0
        aov_pct = round((aov_effect / delta_rev * 100), 2) if delta_rev != 0 else 0.0

        return {
            "period_1": {"revenue": round(p1_revenue, 2), "volume": p1_volume, "aov": round(aov1, 2)},
            "period_2": {"revenue": round(p2_revenue, 2), "volume": p2_volume, "aov": round(aov2, 2)},
            "total_revenue_change": round(delta_rev, 2),
            "volume_effect": round(vol_effect, 2),
            "volume_effect_pct": vol_pct,
            "aov_effect": round(aov_effect, 2),
            "aov_effect_pct": aov_pct,
            "primary_driver": "volume" if abs(vol_effect) > abs(aov_effect) else "aov"
        }

    @staticmethod
    def detect_anomalies(
        df: pd.DataFrame,
        metric_col: str,
        date_col: Optional[str] = None,
        method: str = "iqr",
        z_threshold: float = 3.0
    ) -> Dict[str, Any]:
        """
        Detects anomalies in a numerical series using IQR, Z-Score, or Isolation Forest.
        """
        clean_df = df.dropna(subset=[metric_col]).copy()
        s = clean_df[metric_col]
        anomalies = []

        if method == "z_score":
            mean = s.mean()
            std = s.std()
            if std > 0:
                z_scores = (s - mean) / std
                mask = z_scores.abs() > z_threshold
                anomalous_df = clean_df[mask]
                for idx, row in anomalous_df.iterrows():
                    anomalies.append({
                        "index": idx,
                        "value": round(float(row[metric_col]), 2),
                        "z_score": round(float(z_scores.loc[idx]), 2),
                        "date": str(row[date_col]) if date_col and date_col in row else None,
                        "description": f"Z-score {round(float(z_scores.loc[idx]), 2)} exceeds threshold {z_threshold}"
                    })
        elif method == "iqr":
            q25 = s.quantile(0.25)
            q75 = s.quantile(0.75)
            iqr = q75 - q25
            lower_bound = q25 - 1.5 * iqr
            upper_bound = q75 + 1.5 * iqr
            mask = (s < lower_bound) | (s > upper_bound)
            anomalous_df = clean_df[mask]
            for idx, row in anomalous_df.iterrows():
                val = float(row[metric_col])
                is_high = val > upper_bound
                anomalies.append({
                    "index": idx,
                    "value": round(val, 2),
                    "bound": round(upper_bound if is_high else lower_bound, 2),
                    "date": str(row[date_col]) if date_col and date_col in row else None,
                    "description": f"Value {round(val, 2)} outside IQR range [{round(lower_bound, 2)}, {round(upper_bound, 2)}]"
                })
        elif method == "isolation_forest":
            if len(clean_df) >= 20:
                iso = IsolationForest(contamination=0.03, random_state=42)
                preds = iso.fit_predict(clean_df[[metric_col]])
                mask = preds == -1
                anomalous_df = clean_df[mask]
                for idx, row in anomalous_df.iterrows():
                    anomalies.append({
                        "index": idx,
                        "value": round(float(row[metric_col]), 2),
                        "date": str(row[date_col]) if date_col and date_col in row else None,
                        "description": "Multi-dimensional anomaly flagged by Isolation Forest"
                    })

        return {
            "method": method,
            "metric": metric_col,
            "total_records": len(clean_df),
            "anomaly_count": len(anomalies),
            "anomaly_rate_pct": round(len(anomalies) / max(len(clean_df), 1) * 100, 2),
            "anomalies": anomalies[:50]  # top 50 anomalies
        }

    @staticmethod
    def calculate_correlation(
        df: pd.DataFrame,
        col_x: str,
        col_y: str
    ) -> Dict[str, Any]:
        """
        Calculates Pearson and Spearman correlations with p-values and linear regression slope.
        """
        clean = df[[col_x, col_y]].dropna()
        if len(clean) < 3:
            return {"error": "Insufficient data points for correlation."}

        x = clean[col_x]
        y = clean[col_y]

        pearson_r, pearson_p = stats.pearsonr(x, y)
        spearman_r, spearman_p = stats.spearmanr(x, y)
        slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)

        strength = "weak"
        if abs(pearson_r) > 0.7:
            strength = "strong"
        elif abs(pearson_r) > 0.4:
            strength = "moderate"

        return {
            "col_x": col_x,
            "col_y": col_y,
            "sample_size": len(clean),
            "pearson_r": round(float(pearson_r), 4),
            "pearson_p_value": float(pearson_p),
            "spearman_r": round(float(spearman_r), 4),
            "r_squared": round(float(r_value ** 2), 4),
            "slope": round(float(slope), 4),
            "intercept": round(float(intercept), 4),
            "strength": strength,
            "direction": "positive" if pearson_r > 0 else "negative"
        }
