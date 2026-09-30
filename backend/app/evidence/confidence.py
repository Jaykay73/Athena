from typing import Dict, Any, List, Tuple

class ConfidenceScorer:
    """
    Deterministic Confidence Evaluation Engine.
    Assesses analytical certainty based on empirical factors:
    sample size, data completeness, replication across methods, and potential missing confounders.
    """

    @classmethod
    def evaluate(
        cls,
        row_count: int,
        missing_percentage: float,
        methods_count: int,
        has_anomalies: bool = False,
        missing_confounders: List[str] = None
    ) -> Tuple[str, List[str], List[str]]:
        score = 70.0
        rationales = []
        limitations = []

        # 1. Sample Size Assessment
        if row_count > 100000:
            score += 15.0
            rationales.append(f"Statistically robust sample size ({row_count:,} observations).")
        elif row_count > 1000:
            score += 10.0
            rationales.append(f"Sufficient sample size ({row_count:,} observations).")
        elif row_count > 50:
            score += 0.0
            rationales.append(f"Moderate sample size ({row_count} observations).")
        else:
            score -= 25.0
            rationales.append(f"Small sample size ({row_count} records); higher statistical variance.")
            limitations.append("Small sample size limits statistical generalizability.")

        # 2. Completeness Assessment
        if missing_percentage < 2.0:
            score += 15.0
            rationales.append(f"High data completeness ({100 - missing_percentage:.1f}% intact).")
        elif missing_percentage < 10.0:
            score += 5.0
            rationales.append(f"Acceptable completeness with {missing_percentage:.1f}% missing values.")
        else:
            score -= 20.0
            rationales.append(f"Elevated missingness ({missing_percentage:.1f}% missing fields).")
            limitations.append(f"Missing records ({missing_percentage:.1f}%) may introduce sample bias.")

        # 3. Method Replication
        if methods_count >= 2:
            score += 10.0
            rationales.append(f"Findings validated across {methods_count} distinct analytical methods.")
        else:
            rationales.append("Finding derived from single analytical execution.")

        # 4. Outliers/Anomalies
        if has_anomalies:
            score -= 5.0
            limitations.append("Outliers or extreme values were detected and could influence top-line aggregates.")

        # 5. Missing confounders
        if missing_confounders:
            score -= 10.0
            for conf in missing_confounders:
                limitations.append(f"Dataset does not contain {conf}; external drivers cannot be evaluated.")

        score = max(10.0, min(100.0, score))

        if score >= 80.0:
            level = "HIGH"
        elif score >= 55.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        return level, rationales, limitations
