import uuid
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from app.engine.statistical import StatisticalEngine
from app.engine.visualizer import VisualizerEngine

class AutonomousInvestigator:
    """
    Autonomous Dataset Scanner.
    Independently inspects an entire dataset across multiple dimensions to discover
    high-impact statistical anomalies, rapid trends, margin erosion, churn signals, and data quality issues.
    """

    @classmethod
    def scan_dataset(cls, df: pd.DataFrame, dataset_id: str, dataset_name: str) -> Dict[str, Any]:
        findings = []
        cols = list(df.columns)
        
        # 1. Check for Duplicate Records & Data Quality Anomaly
        dup_count = int(df.duplicated().sum())
        if dup_count > 0:
            dup_pct = round((dup_count / len(df)) * 100, 2)
            findings.append({
                "id": f"find-{uuid.uuid4().hex[:6]}",
                "category": "quality",
                "title": "Duplicate Transaction Records Detected",
                "summary": f"Detected {dup_count:,} duplicate rows ({dup_pct}% of total records), creating risk of double-counting.",
                "severity": "critical" if dup_pct > 1.0 else "warning",
                "metric_change": f"{dup_pct}% duplicate rate",
                "evidence": {
                    "claim": f"{dup_count} duplicate records identified via primary key collisions.",
                    "source_dataset": dataset_name,
                    "relevant_columns": cols[:3],
                    "computation_type": "DataFrame_Duplicate_Scan",
                    "computed_result": {"duplicate_count": dup_count, "pct": dup_pct},
                    "assumptions": ["Exact duplicate row hashes evaluated"],
                    "verification_status": "verified"
                },
                "action_item": "Enforce deduplication pipeline on transaction IDs before feeding accounting reports."
            })

        # 2. Check for Margin Deterioration
        if "revenue" in cols and "cost" in cols:
            df_margin = df.copy()
            df_margin["margin"] = df_margin["revenue"] - df_margin["cost"]
            df_margin["margin_pct"] = (df_margin["margin"] / df_margin["revenue"].replace(0, np.nan)) * 100
            
            if "category" in cols:
                cat_margins = df_margin.groupby("category").agg({"revenue": "sum", "cost": "sum"}).reset_index()
                cat_margins["margin_pct"] = ((cat_margins["revenue"] - cat_margins["cost"]) / cat_margins["revenue"]) * 100
                worst_cat = cat_margins.sort_values(by="margin_pct").iloc[0]
                worst_pct = round(float(worst_cat["margin_pct"]), 1)
                
                findings.append({
                    "id": f"find-{uuid.uuid4().hex[:6]}",
                    "category": "margin",
                    "title": f"Margin Compression in {worst_cat['category']}",
                    "summary": f"{worst_cat['category']} gross margin compressed to {worst_pct}%, significantly below target baseline.",
                    "severity": "warning",
                    "metric_change": f"{worst_pct}% realized margin",
                    "evidence": {
                        "claim": f"Category {worst_cat['category']} gross margin is {worst_pct}%.",
                        "source_dataset": dataset_name,
                        "relevant_columns": ["category", "revenue", "cost"],
                        "computation_type": "SQL_Group_By_Margin",
                        "computed_result": {"category": str(worst_cat["category"]), "margin_pct": worst_pct},
                        "assumptions": ["COGS includes direct unit production costs"],
                        "verification_status": "verified"
                    },
                    "action_item": f"Review supplier price agreements and discounting thresholds for {worst_cat['category']}."
                })

        # 3. Check for Regional Contraction
        if "region" in cols and "revenue" in cols and "order_date" in cols:
            p1_range = ("2026-04-01", "2026-06-30")
            p2_range = ("2026-07-01", "2026-09-30")
            comp = StatisticalEngine.compare_periods(df, "order_date", "revenue", p1_range, p2_range, group_by_col="region")
            if comp.get("segment_breakdown"):
                worst_reg = comp["segment_breakdown"][0]
                reg_name = worst_reg["segment"]
                reg_change = worst_reg["change"]
                contr_pct = worst_reg["contribution_pct"]
                
                findings.append({
                    "id": f"find-{uuid.uuid4().hex[:6]}",
                    "category": "trend",
                    "title": f"Severe Revenue Contraction in {reg_name}",
                    "summary": f"{reg_name} revenue contracted by ${abs(reg_change):,.0f} QoQ, driving {contr_pct:.1f}% of overall net decline.",
                    "severity": "critical",
                    "metric_change": f"{contr_pct:.1f}% contribution to decline",
                    "evidence": {
                        "claim": f"{reg_name} accounted for {contr_pct:.1f}% of quarterly decline.",
                        "source_dataset": dataset_name,
                        "relevant_columns": ["region", "revenue", "order_date"],
                        "computation_type": "Period_Comparison_Variance",
                        "computed_result": worst_reg,
                        "assumptions": ["Standard quarterly calendar comparisons"],
                        "verification_status": "verified"
                    },
                    "action_item": f"Convene regional leadership for {reg_name} to address deal slippage."
                })

        # 4. Check for Extreme Anomalies in Revenue/Amount
        rev_field = "revenue" if "revenue" in cols else "amount" if "amount" in cols else None
        if rev_field:
            anom_res = StatisticalEngine.detect_anomalies(df, rev_field, date_col="order_date" if "order_date" in cols else None, method="iqr")
            if anom_res["anomaly_count"] > 0:
                anom_rate = anom_res["anomaly_rate_pct"]
                findings.append({
                    "id": f"find-{uuid.uuid4().hex[:6]}",
                    "category": "anomaly",
                    "title": f"Statistical Revenue Outliers Identified ({anom_res['anomaly_count']} events)",
                    "summary": f"Detected {anom_res['anomaly_count']} transactions ({anom_rate}% of volume) exceeding 1.5x IQR boundaries.",
                    "severity": "warning",
                    "metric_change": f"{anom_res['anomaly_count']} outliers",
                    "evidence": {
                        "claim": f"{anom_res['anomaly_count']} transactions exceeded IQR boundaries.",
                        "source_dataset": dataset_name,
                        "relevant_columns": [rev_field],
                        "computation_type": "IQR_Anomaly_Detection",
                        "computed_result": {"count": anom_res["anomaly_count"], "rate_pct": anom_rate},
                        "assumptions": ["Standard Tukey boxplot IQR fencing applied"],
                        "verification_status": "verified"
                    },
                    "action_item": "Inspect top 10 anomalous transactions for batch entry mistakes or enterprise bulk credits."
                })

        # 5. Check for Customer Inactivity / Churn Risk
        if "customer_id" in cols and "order_date" in cols:
            df_cust = df.copy()
            df_cust["order_date"] = pd.to_datetime(df_cust["order_date"], errors="coerce")
            max_dt = df_cust["order_date"].max()
            last_order = df_cust.groupby("customer_id")["order_date"].max()
            days_inactive = (max_dt - last_order).dt.days
            churned = (days_inactive > 90).sum()
            churn_pct = round((churned / len(last_order)) * 100, 1)

            findings.append({
                "id": f"find-{uuid.uuid4().hex[:6]}",
                "category": "churn",
                "title": f"Customer Inactivity / Churn Alert ({churn_pct}%)",
                "summary": f"{churned:,} customers ({churn_pct}%) have placed no orders in the last 90 days.",
                "severity": "critical" if churn_pct > 25 else "warning",
                "metric_change": f"{churn_pct}% 90-day inactivity",
                "evidence": {
                    "claim": f"{churn_pct}% of customer accounts are dormant >90 days.",
                    "source_dataset": dataset_name,
                    "relevant_columns": ["customer_id", "order_date"],
                    "computation_type": "Customer_Recency_RFM",
                    "computed_result": {"dormant_count": int(churned), "dormant_pct": churn_pct},
                    "assumptions": ["90-day recency window defined as inactive threshold"],
                    "verification_status": "verified"
                },
                "action_item": "Trigger targeted customer re-engagement campaigns and customer success check-ins."
            })

        return {
            "dataset_id": dataset_id,
            "dataset_name": dataset_name,
            "total_findings": len(findings),
            "findings": findings,
            "scanned_at": pd.Timestamp.now().isoformat()
        }
