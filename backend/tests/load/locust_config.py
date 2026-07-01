"""
SLA Threshold Configuration for Locust Load Testing.

Defines performance budgets for all critical API endpoints.
Used by locustfile.py to validate responses and by generate_report.py
to produce pass/fail benchmarking reports.
"""

from dataclasses import dataclass, field
from typing import Dict

@dataclass
class SLAThreshold:
    """SLA threshold definition for a single endpoint group."""
    p50_ms: float       # Median response time in milliseconds
    p95_ms: float       # 95th percentile response time in milliseconds
    p99_ms: float       # 99th percentile response time in milliseconds
    max_error_rate: float = 0.001  # 0.1% default

@dataclass
class PerformanceBudget:
    """
    Full performance budget configuration.
    Each group maps endpoint patterns to SLA thresholds.
    """
    # CRUD endpoints: tickets, auth
    crud: SLAThreshold = field(
        default_factory=lambda: SLAThreshold(
            p50_ms=200, p95_ms=500, p99_ms=1000, max_error_rate=0.001
        )
    )
    # AI analysis endpoints
    ai_analysis: SLAThreshold = field(
        default_factory=lambda: SLAThreshold(
            p50_ms=500, p95_ms=1500, p99_ms=3000, max_error_rate=0.001
        )
    )
    # Auth endpoints (login/signup)
    auth: SLAThreshold = field(
        default_factory=lambda: SLAThreshold(
            p50_ms=300, p95_ms=800, p99_ms=1500, max_error_rate=0.001
        )
    )
    # Health/readiness endpoints
    health: SLAThreshold = field(
        default_factory=lambda: SLAThreshold(
            p50_ms=100, p95_ms=300, p99_ms=500, max_error_rate=0.0
        )
    )

    def get_threshold(self, endpoint: str) -> SLAThreshold:
        """Return the appropriate SLA threshold for a given endpoint path."""
        if endpoint.startswith("/ai/"):
            return self.ai_analysis
        elif endpoint.startswith("/auth/"):
            return self.auth
        elif endpoint in ("/health", "/ready"):
            return self.health
        else:
            return self.crud


# Performance budget environment variable name
PERFORMANCE_BUDGET_ENV_VAR = "PERFORMANCE_BUDGET"

# Default budget — can be overridden via PERFORMANCE_BUDGET env var
DEFAULT_BUDGET = PerformanceBudget()


def parse_budget_env(env_value: str | None) -> PerformanceBudget:
    """
    Parse a PERFORMANCE_BUDGET env var string into a PerformanceBudget.
    Format: "crud_p50=200,crud_p95=500,ai_p50=500"

    Returns DEFAULT_BUDGET if env_value is None or empty.
    """
    if not env_value:
        return DEFAULT_BUDGET

    budget = PerformanceBudget()
    pairs = env_value.split(",")
    for pair in pairs:
        pair = pair.strip()
        if "=" not in pair:
            continue
        key, value = pair.split("=", 1)
        try:
            value = float(value)
        except ValueError:
            continue

        key = key.strip().lower()
        if key == "crud_p50":
            budget.crud.p50_ms = value
        elif key == "crud_p95":
            budget.crud.p95_ms = value
        elif key == "crud_p99":
            budget.crud.p99_ms = value
        elif key == "ai_p50":
            budget.ai_analysis.p50_ms = value
        elif key == "ai_p95":
            budget.ai_analysis.p95_ms = value
        elif key == "ai_p99":
            budget.ai_analysis.p99_ms = value
        elif key == "auth_p50":
            budget.auth.p50_ms = value
        elif key == "auth_p95":
            budget.auth.p95_ms = value
        elif key == "auth_p99":
            budget.auth.p99_ms = value
        elif key == "error_rate":
            budget.crud.max_error_rate = value / 100.0
            budget.ai_analysis.max_error_rate = value / 100.0
            budget.auth.max_error_rate = value / 100.0

    return budget
