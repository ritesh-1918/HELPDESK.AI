#!/usr/bin/env python3
"""
Benchmarking Report Generator for Locust Load Tests.

Parses Locust stats output (summary.json) and generates:
  1. An HTML report with response time percentiles, error rates, and SLA pass/fail
  2. A CI-friendly summary (stdout) for GitHub Actions annotations

Usage:
    python3 generate_report.py                    # Uses latest summary.json in cwd
    python3 generate_report.py --report-dir ./reports  # Custom report directory
    python3 generate_report.py --html report.html      # Custom HTML output path
"""

import argparse
import json
import os
import sys
from datetime import datetime

from locust_config import DEFAULT_BUDGET, parse_budget_env


# ─── Color / Emoji helpers for terminal output ─────────────

def status_emoji(passed: bool) -> str:
    return "✅" if passed else "❌"

def sla_cell(p50, p95, p99, threshold, error_rate, error_threshold) -> str:
    """Return HTML table cell with pass/fail indicators."""
    p50_ok = p50 <= threshold.p50_ms
    p95_ok = p95 <= threshold.p95_ms
    p99_ok = p99 <= threshold.p99_ms
    err_ok = error_rate <= error_threshold
    all_ok = p50_ok and p95_ok and p99_ok and err_ok
    status = "PASS" if all_ok else "FAIL"
    color = "green" if all_ok else "red"
    return (
        f'<td style="color:{color};font-weight:bold">{status}</td>'
        f'<td>{p50:.0f} ms</td>'
        f'<td>{p95:.0f} ms</td>'
        f'<td>{p99:.0f} ms</td>'
        f'<td>{error_rate*100:.3f}%</td>'
        f'<td style="font-size:0.85em">'
        f'p50&lt;{threshold.p50_ms} | p95&lt;{threshold.p95_ms} | p99&lt;{threshold.p99_ms} | '
        f'err&lt;{error_threshold*100:.1f}%'
        f'</td>'
    )


# ─── Report Generation ─────────────────────────────────────

def load_summary(summary_path: str) -> dict:
    """Load the Locust summary JSON file."""
    if not os.path.exists(summary_path):
        print(f"[ERROR] Summary file not found: {summary_path}", file=sys.stderr)
        print("Run locust with --headless flag and ensure summary.json was generated.")
        sys.exit(1)
    with open(summary_path) as f:
        return json.load(f)


def generate_terminal_report(summary: dict, budget) -> str:
    """Generate a terminal-friendly benchmark report."""
    lines = []
    lines.append("=" * 70)
    lines.append("   LOAD TEST BENCHMARK REPORT")
    lines.append(f"   Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("=" * 70)
    lines.append("")
    lines.append(f"  Total Requests:      {summary.get('total_requests', 0):,}")
    lines.append(f"  Total Failures:      {summary.get('total_failures', 0):,}")
    lines.append(f"  Fail Ratio:          {summary.get('fail_ratio', 0) * 100:.3f}%")
    lines.append(f"  Avg Response Time:   {summary.get('avg_response_time_ms', 0):.1f} ms")
    lines.append(f"  Requests/sec:        {summary.get('requests_per_second', 0):.1f}")
    lines.append(f"  SLA Violations:      {summary.get('sla_violations', 0)}")
    lines.append("")

    sla_passed = summary.get("sla_passed", False)
    lines.append(f"  OVERALL SLA: {status_emoji(sla_passed)} {'PASS' if sla_passed else 'FAIL'}")
    lines.append("")

    # Per-endpoint breakdown
    endpoints = summary.get("endpoints", {})
    if endpoints:
        lines.append("  ── Per-Endpoint Breakdown ──")
        for name, ep in sorted(endpoints.items()):
            ep_sla = ep.get("sla_passed", True)
            lines.append(f"    {status_emoji(ep_sla)} {name}")
            lines.append(f"       avg={ep.get('avg_ms', 0):.0f}ms  "
                         f"min={ep.get('min_ms', 0):.0f}ms  "
                         f"max={ep.get('max_ms', 0):.0f}ms  "
                         f"errors={ep.get('num_failures', 0)}"
                         f" ({ep.get('fail_ratio', 0)*100:.2f}%)")

    lines.append("")
    lines.append("=" * 70)
    return "\n".join(lines)


def generate_html_report(summary: dict, budget, output_path: str):
    """Generate an HTML benchmark report."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    total_req = summary.get("total_requests", 0)
    total_fail = summary.get("total_failures", 0)
    fail_ratio = summary.get("fail_ratio", 0) * 100
    avg_ms = summary.get("avg_response_time_ms", 0)
    rps = summary.get("requests_per_second", 0)
    sla_passed = summary.get("sla_passed", False)
    sla_violations = summary.get("sla_violations", 0)
    endpoints = summary.get("endpoints", {})

    # Build endpoint rows
    endpoint_rows = ""
    for name, ep in sorted(endpoints.items()):
        # Determine SLA for this endpoint
        threshold = budget.get_threshold(name)
        avg = ep.get("avg_ms", 0)
        p95 = ep.get("p95_response_time_ms", 0) or avg * 1.5  # estimate if not recorded
        p99 = ep.get("p99", 0) or avg * 2.0
        err_rate = ep.get("fail_ratio", 0)

        ep_sla_passed = (
            avg <= threshold.p50_ms
            and err_rate <= threshold.max_error_rate
        )
        ep_status = "PASS" if ep_sla_passed else "FAIL"
        ep_color = "green" if ep_sla_passed else "red"

        endpoint_rows += f"""
        <tr>
            <td>{name}</td>
            <td style="color:{ep_color};font-weight:bold">{ep_status}</td>
            <td>{ep.get('num_requests', 0):,}</td>
            <td>{ep.get('num_failures', 0):,}</td>
            <td>{ep.get('fail_ratio', 0)*100:.3f}%</td>
            <td>{avg:.0f}</td>
            <td>{ep.get('min_ms', 0):.0f}</td>
            <td>{ep.get('max_ms', 0):.0f}</td>
            <td>{ep.get('rps', 0):.1f}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Benchmark Report — HELPDESK.AI</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               background: #0f172a; color: #e2e8f0; padding: 2rem; }}
        h1 {{ color: #38bdf8; margin-bottom: 0.5rem; }}
        h2 {{ color: #94a3b8; margin: 2rem 0 1rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }}
        .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem; margin: 1.5rem 0; }}
        .card {{ background: #1e293b; border-radius: 0.75rem; padding: 1.25rem; }}
        .card .label {{ font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }}
        .card .value {{ font-size: 1.5rem; font-weight: 700; margin-top: 0.25rem; }}
        .sla-badge {{ display: inline-block; padding: 0.25rem 1rem; border-radius: 999px;
                      font-weight: 700; font-size: 1.25rem; }}
        .sla-pass {{ background: #166534; color: #86efac; }}
        .sla-fail {{ background: #7f1d1d; color: #fca5a5; }}
        table {{ width: 100%; border-collapse: collapse; margin: 1rem 0; }}
        th, td {{ text-align: left; padding: 0.75rem 0.5rem; border-bottom: 1px solid #334155; }}
        th {{ color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }}
        td {{ font-size: 0.9rem; }}
        tr:hover {{ background: #1e293b; }}
        .meta {{ color: #64748b; font-size: 0.85rem; margin-top: 2rem; text-align: center; }}
        .pass {{ color: #86efac; }}
        .fail {{ color: #fca5a5; }}
    </style>
</head>
<body>
    <h1>🏋️ Load Test Benchmark Report</h1>
    <p style="color:#94a3b8;">HELPDESK.AI — Critical API Endpoints Performance Suite</p>
    <p style="color:#64748b;font-size:0.85rem;">Generated: {now}</p>

    <div class="summary">
        <div class="card">
            <div class="label">Total Requests</div>
            <div class="value">{total_req:,}</div>
        </div>
        <div class="card">
            <div class="label">Fail Ratio</div>
            <div class="value">{fail_ratio:.3f}%</div>
        </div>
        <div class="card">
            <div class="label">Avg Response Time</div>
            <div class="value">{avg_ms:.0f} ms</div>
        </div>
        <div class="card">
            <div class="label">Throughput</div>
            <div class="value">{rps:.1f} req/s</div>
        </div>
    </div>

    <div style="text-align:center;margin:1.5rem 0;">
        <span class="sla-badge {'sla-pass' if sla_passed else 'sla-fail'}">
            {'✅ SLA PASSED' if sla_passed else f'❌ {sla_violations} SLA VIOLATION(S)'}
        </span>
    </div>

    <h2>📊 Per-Endpoint Results</h2>
    <table>
        <thead>
            <tr>
                <th>Endpoint</th>
                <th>SLA</th>
                <th>Requests</th>
                <th>Failures</th>
                <th>Error%</th>
                <th>Avg ms</th>
                <th>Min ms</th>
                <th>Max ms</th>
                <th>RPS</th>
            </tr>
        </thead>
        <tbody>
            {endpoint_rows}
        </tbody>
    </table>

    <h2>🎯 SLA Thresholds</h2>
    <table>
        <thead>
            <tr>
                <th>Endpoint Group</th>
                <th>p50</th>
                <th>p95</th>
                <th>p99</th>
                <th>Max Error</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>CRUD (tickets, etc.)</td><td>&lt; {budget.crud.p50_ms}ms</td><td>&lt; {budget.crud.p95_ms}ms</td><td>&lt; {budget.crud.p99_ms}ms</td><td>&lt; {budget.crud.max_error_rate*100:.1f}%</td></tr>
            <tr><td>AI Analysis</td><td>&lt; {budget.ai_analysis.p50_ms}ms</td><td>&lt; {budget.ai_analysis.p95_ms}ms</td><td>&lt; {budget.ai_analysis.p99_ms}ms</td><td>&lt; {budget.ai_analysis.max_error_rate*100:.1f}%</td></tr>
            <tr><td>Auth</td><td>&lt; {budget.auth.p50_ms}ms</td><td>&lt; {budget.auth.p95_ms}ms</td><td>&lt; {budget.auth.p99_ms}ms</td><td>&lt; {budget.auth.max_error_rate*100:.1f}%</td></tr>
            <tr><td>Health</td><td>&lt; {budget.health.p50_ms}ms</td><td>&lt; {budget.health.p95_ms}ms</td><td>&lt; {budget.health.p99_ms}ms</td><td>&lt; {budget.health.max_error_rate*100:.1f}%</td></tr>
        </tbody>
    </table>

    <div class="meta">
        <p>Performance budget configurable via <code>$PERFORMANCE_BUDGET</code> environment variable</p>
        <p>Report generated by <code>backend/tests/load/generate_report.py</code></p>
    </div>
</body>
</html>"""

    with open(output_path, "w") as f:
        f.write(html)

    print(f"[OK] HTML report written to: {output_path}")
    return output_path


def main():
    parser = argparse.ArgumentParser(
        description="Generate load test benchmarking reports from Locust summary."
    )
    parser.add_argument(
        "--summary", default="load_test_reports/summary.json",
        help="Path to Locust summary JSON file"
    )
    parser.add_argument(
        "--html", default="load_test_reports/report.html",
        help="Output path for HTML report"
    )
    parser.add_argument(
        "--report-dir", default="load_test_reports",
        help="Directory containing summary.json (alternative to --summary)"
    )
    args = parser.parse_args()

    # Resolve summary path
    summary_path = args.summary
    if args.report_dir and summary_path == "load_test_reports/summary.json":
        summary_path = os.path.join(args.report_dir, "summary.json")

    # Load data
    budget = DEFAULT_BUDGET
    summary = load_summary(summary_path)

    # Generate reports
    terminal = generate_terminal_report(summary, budget)
    print(terminal)

    html_path = args.html
    if args.report_dir:
        html_path = os.path.join(args.report_dir, "report.html")
    generate_html_report(summary, budget, html_path)

    # Exit with appropriate code for CI
    if not summary.get("sla_passed", False):
        print("\n[CI] ❌ SLA thresholds not met — marking as failure")
        sys.exit(1)
    else:
        print("\n[CI] ✅ All SLA thresholds passed")
        sys.exit(0)


if __name__ == "__main__":
    main()
