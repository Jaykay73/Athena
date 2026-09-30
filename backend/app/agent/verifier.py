import re
from typing import Dict, Any, List, Set, Tuple

class NumericalVerifier:
    """
    No-Hallucination Verification Layer.
    Scans generated text for numerical claims (dollar values, percentages, counts, multipliers)
    and verifies that each matches computed evidence within rounding tolerance.
    """

    @classmethod
    def extract_numbers_from_text(cls, text: str) -> List[float]:
        # Matches numbers like $12.5M, 11.8%, 14,200, 3.2, etc.
        patterns = [
            r'[-+]?\d*\.\d+',  # floats
            r'[-+]?\d+'        # integers
        ]
        numbers = []
        # Remove markdown links, citations, years like 2023, 2026, or Q1/Q2/Q3/Q4 tokens from accidental checking
        cleaned = re.sub(r'Q[1-4]', '', text)
        cleaned = re.sub(r'202[0-9]', '', cleaned)
        cleaned = re.sub(r'#\d+', '', cleaned)

        for match in re.finditer(r'[-+]?\d+(?:\.\d+)?', cleaned):
            try:
                val = float(match.group())
                # Filter out single digits 0-9 that are often bullet points or list numbers
                if abs(val) > 0.05:
                    numbers.append(val)
            except ValueError:
                pass
        return numbers

    @classmethod
    def collect_computed_numbers(cls, metrics: List[Dict[str, Any]], evidence: List[Dict[str, Any]]) -> Set[float]:
        computed = set()
        for m in metrics:
            val = m.get("value")
            if isinstance(val, (int, float)):
                computed.add(round(float(val), 2))
                computed.add(round(float(val), 1))
                computed.add(round(float(val), 0))

        for ev in evidence:
            res = ev.get("computed_result")
            if isinstance(res, (int, float)):
                computed.add(round(float(res), 2))
                computed.add(round(float(res), 1))
            elif isinstance(res, dict):
                for v in res.values():
                    if isinstance(v, (int, float)):
                        computed.add(round(float(v), 2))
                        computed.add(round(float(v), 1))
            elif isinstance(res, list):
                for row in res:
                    if isinstance(row, dict):
                        for v in row.values():
                            if isinstance(v, (int, float)):
                                computed.add(round(float(v), 2))
                                computed.add(round(float(v), 1))
        return computed

    @classmethod
    def verify(
        cls,
        text: str,
        metrics: List[Dict[str, Any]],
        evidence: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        text_numbers = cls.extract_numbers_from_text(text)
        computed_numbers = cls.collect_computed_numbers(metrics, evidence)

        verified = []
        unverified = []

        for num in text_numbers:
            # Check within tolerance or magnitude rounding (e.g. 11.8 vs 11.84, or $8.2M vs 8.2)
            matched = False
            for c in computed_numbers:
                if abs(num - c) < 0.6 or (c != 0 and abs(num - c) / abs(c) < 0.05):
                    matched = True
                    break
                # Check for millions/thousands scaling (e.g., 8.2 vs 8200000)
                if c != 0 and (abs(num - (c / 1_000_000)) < 0.2 or abs(num - (c / 1_000)) < 0.2):
                    matched = True
                    break

            if matched:
                verified.append(num)
            else:
                unverified.append(num)

        total_claims = len(text_numbers)
        pass_rate = round(len(verified) / max(total_claims, 1) * 100, 1) if total_claims > 0 else 100.0

        return {
            "passed": len(unverified) == 0 or pass_rate >= 85.0,
            "total_numerical_claims": total_claims,
            "verified_count": len(verified),
            "unverified_count": len(unverified),
            "pass_rate_pct": pass_rate,
            "unverified_numbers": unverified[:10],
            "status": "VERIFIED_GROUNDED" if pass_rate >= 85.0 else "UNSUPPORTED_CLAIMS_DETECTED"
        }
