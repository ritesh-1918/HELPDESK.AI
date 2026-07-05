"""
SLA configuration for HELPDESK.AI load testing.
Defines performance thresholds and reporting utilities.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional
import time
import json
from pathlib import Path


@dataclass
class SLAThreshold:
    """SLA threshold for a specific endpoint."""
    endpoint: str
    method: str
    p50_ms: float = 200.0
    p95_ms: float = 500.0
    p99_ms: float = 1000.0
    max_error_rate: float = 0.001  # 0.1%
    max_concurrent: int = 100

    def check(self, p50: float, p95: float, p99: float, error_rate: float) -> Dict[str, bool]:
        """Check if all SLA thresholds are met."""
        return {
            "p50_ok": p50 <= self.p50_ms,
            "p95_ok": p95 <= self.p95_ms,
            "p99_ok": p99 <= self.p99_ms,
            "error_rate_ok": error_rate <= self.max_error_rate,
        }


# Default SLA configuration
SLA_CONFIG: Dict[str, SLAThreshold] = {
    # CRUD endpoints
    "GET /tickets": SLAThreshold(
        endpoint="/tickets", method="GET",
        p50_ms=200, p95_ms=500, p99_ms=1000, max_error_rate=0.001,
    ),
    "POST /tickets": SLAThreshold(
        endpoint="/tickets", method="POST",
        p50_ms=200, p95_ms=500, p99_ms=1000, max_error_rate=0.001,
    ),
    "GET /tickets/[id]": SLAThreshold(
        endpoint="/tickets/{ticket_id}", method="GET",
        p50_ms=150, p95_ms=400, p99_ms=800, max_error_rate=0.001,
    ),
    "POST /tickets/save": SLAThreshold(
        endpoint="/tickets/save", method="POST",
        p50_ms=300, p95_ms=700, p99_ms=1500, max_error_rate=0.001,
    ),
    # AI analysis endpoints (higher latency expected)
    "POST /ai/analyze_ticket": SLAThreshold(
        endpoint="/ai/analyze_ticket", method="POST",
        p50_ms=500, p95_ms=1500, p99_ms=3000, max_error_rate=0.01,
    ),
    "POST /ai/analyze": SLAThreshold(
        endpoint="/ai/analyze", method="POST",
        p50_ms=400, p95_ms=1200, p99_ms=2500, max_error_rate=0.01,
    ),
    # Auth endpoints
    "POST /auth/login": SLAThreshold(
        endpoint="/auth/login", method="POST",
        p50_ms=300, p95_ms=800, p99_ms=2000, max_error_rate=0.005,
    ),
    "POST /auth/signup": SLAThreshold(
        endpoint="/auth/signup", method="POST",
        p50_ms=500, p95_ms=1500, p99_ms=3000, max_error_rate=0.005,
    ),
    # Health check
    "GET /health": SLAThreshold(
        endpoint="/health", method="GET",
        p50_ms=50, p95_ms=100, p99_ms=200, max_error_rate=0.0,
    ),
    "GET /ready": SLAThreshold(
        endpoint="/ready", method="GET",
        p50_ms=50, p95_ms=100, p99_ms=200, max_error_rate=0.0,
    ),
}


class ReportCollector:
    """
    Collects and aggregates test metrics for SLA reporting.
    Designed to work with Locust's event hooks.
    """

    def __init__(self, sla_config: Dict[str, SLAThreshold] = SLA_CONFIG):
        self.sla_config = sla_config
        self.endpoint_stats: Dict[str, Dict[str, List[float]]] = {}
        self.start_time: float = time.time()

    def record(self, endpoint: str, method: str, duration_ms: float, success: bool, error: Optional[str] = None):
        """Record a single request result."""
        key = f"{method.upper()} {endpoint}"
        if key not in self.endpoint_stats:
            self.endpoint_stats[key] = {
                "durations": [],
                "errors": 0,
                "total": 0,
            }
        self.endpoint_stats[key]["durations"].append(duration_ms)
        self.endpoint_stats[key]["total"] += 1
        if not success:
            self.endpoint_stats[key]["errors"] += 1

    def _percentile(self, data: List[float], pct: float) -> float:
        """Calculate percentile."""
        if not data:
            return 0.0
        sorted_data = sorted(data)
        idx = int(len(sorted_data) * pct / 100)
        return sorted_data[min(idx, len(sorted_data) - 1)]

    def generate_report(self) -> Dict:
        """Generate a full benchmarking report."""
        results = {}
        sla_violations = []
        all_ok = True

        for key, stats in self.endpoint_stats.items():
            durations = stats["durations"]
            total = stats["total"]
            errors = stats["errors"]
            error_rate = errors / max(total, 1)

            p50 = self._percentile(durations, 50)
            p95 = self._percentile(durations, 95)
            p99 = self._percentile(durations, 99)
            avg = sum(durations) / max(len(durations), 1)

            threshold = self.sla_config.get(key)
            sla_ok = True
            sla_details = {}

            if threshold:
                sla_check = threshold.check(p50, p95, p99, error_rate)
                sla_details = sla_check
                sla_ok = all(sla_check.values())
                if not sla_ok:
                    sla_violations.append({"endpoint": key, "checks": sla_check})
                    all_ok = False

            results[key] = {
                "total_requests": total,
                "errors": errors,
                "error_rate_pct": round(error_rate * 100, 3),
                "avg_ms": round(avg, 2),
                "p50_ms": round(p50, 2),
                "p95_ms": round(p95, 2),
                "p99_ms": round(p99, 2),
                "sla_passed": sla_ok,
                "sla_details": sla_details,
            }

        return {
            "benchmark_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "duration_seconds": round(time.time() - self.start_time, 2),
            "overall_sla_status": "PASSED" if all_ok else "VIOLATIONS DETECTED",
            "sla_violations": sla_violations,
            "endpoint_results": results,
        }

    def save_report(self, path: str = "benchmark_report.json"):
        """Save report to JSON file."""
        report = self.generate_report()
        report_path = Path(path)
        report_path.write_text(json.dumps(report, indent=2))
        print(f"\n{'='*60}")
        print(f"  BENCHMARK REPORT — {report['benchmark_time']}")
        print(f"  Duration: {report['duration_seconds']}s")
        print(f"  SLA Status: {report['overall_sla_status']}")
        print(f"{'='*60}")
        for ep, data in report["endpoint_results"].items():
            sla_mark = "✅" if data["sla_passed"] else "❌"
            print(f"  {sla_mark} {ep:35s} | "
                  f"p50={data['p50_ms']:>7.1f}ms "
                  f"p95={data['p95_ms']:>7.1f}ms "
                  f"p99={data['p99_ms']:>7.1f}ms "
                  f"err={data['error_rate_pct']:>5.2f}% "
                  f"reqs={data['total_requests']}")
        if sla_violations:
            print(f"\n  ❌ SLA VIOLATIONS:")
            for v in sla_violations:
                failed = [k for k, val in v["checks"].items() if not val]
                print(f"     - {v['endpoint']}: {', '.join(failed)}")
        print(f"{'='*60}\n")
        print(f"Report saved to: {report_path.absolute()}")
        return report
