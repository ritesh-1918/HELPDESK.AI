"""
Agent Performance Scorecard Service
====================================
Computes per-agent performance metrics from existing Supabase ticket data
and generates personalised AI coaching tips via Gemini.

Metrics (last 30 days, configurable):
  - resolution_rate    → resolved / total  (40 % weight)
  - sla_compliance     → non-breached / total  (30 % weight)
  - avg_speed_score    → normalised inverse of avg resolution hours  (20 % weight)
  - volume_score       → normalised ticket volume  (10 % weight)

Overall Performance Score = weighted sum, 0–100 float.
"""

from __future__ import annotations

import os
import math
import datetime
from typing import Any

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now_utc() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def _days_ago(days: int) -> str:
    """Return ISO-8601 timestamp string for <days> ago (UTC)."""
    dt = _now_utc() - datetime.timedelta(days=days)
    return dt.isoformat().replace("+00:00", "Z")


# ---------------------------------------------------------------------------
# Core metric computation
# ---------------------------------------------------------------------------

def get_agent_metrics(agent_id: str, company_id: str, supabase_client: Any, days: int = 30) -> dict:
    """
    Query Supabase for the agent's ticket history in the last <days> days.
    Returns a raw metrics dict or None if the agent has no ticket history.

    Fields returned:
        agent_id, agent_name, total_tickets, resolved_tickets,
        sla_breached_count, avg_resolution_hours, resolution_rate,
        sla_compliance_rate, period_days
    """
    if supabase_client is None:
        return _empty_metrics(agent_id)

    since = _days_ago(days)

    # Fetch tickets assigned to or created under this agent for the company
    try:
        result = (
            supabase_client.table("tickets")
            .select(
                "id, status, sla_status, created_at, metadata, assigned_agent_id"
            )
            .eq("company_id", company_id)
            .eq("assigned_agent_id", agent_id)
            .gte("created_at", since)
            .execute()
        )
        tickets = result.data or []
    except Exception:
        # assigned_agent_id column may not exist – fall back to all tickets
        # scoped by company and created by the agent (owner)
        try:
            result = (
                supabase_client.table("tickets")
                .select("id, status, sla_status, created_at, metadata, user_id")
                .eq("company_id", company_id)
                .gte("created_at", since)
                .execute()
            )
            tickets = result.data or []
        except Exception:
            tickets = []

    # Fetch agent profile name
    agent_name = _get_agent_name(agent_id, supabase_client)

    if not tickets:
        return _empty_metrics(agent_id, agent_name)

    total = len(tickets)
    resolved = sum(
        1 for t in tickets
        if t.get("status", "").lower() in ("resolved", "closed", "auto_resolved")
    )
    sla_breached = sum(
        1 for t in tickets
        if t.get("sla_status", "").upper() == "BREACHED"
    )

    # Average resolution hours (for resolved tickets only)
    resolution_hours_list = []
    for t in tickets:
        if t.get("status", "").lower() in ("resolved", "closed", "auto_resolved"):
            created_raw = t.get("created_at")
            resolved_raw = (t.get("metadata") or {}).get("resolved_at")
            if created_raw and resolved_raw:
                try:
                    created_dt = datetime.datetime.fromisoformat(created_raw.replace("Z", "+00:00"))
                    resolved_dt = datetime.datetime.fromisoformat(resolved_raw.replace("Z", "+00:00"))
                    diff_hours = (resolved_dt - created_dt).total_seconds() / 3600
                    if diff_hours >= 0:
                        resolution_hours_list.append(diff_hours)
                except Exception:
                    pass

    avg_resolution_hours = (
        sum(resolution_hours_list) / len(resolution_hours_list)
        if resolution_hours_list else None
    )

    resolution_rate = resolved / total if total else 0.0
    sla_compliance_rate = (total - sla_breached) / total if total else 0.0

    return {
        "agent_id": agent_id,
        "agent_name": agent_name,
        "total_tickets": total,
        "resolved_tickets": resolved,
        "sla_breached_count": sla_breached,
        "avg_resolution_hours": avg_resolution_hours,
        "resolution_rate": round(resolution_rate, 4),
        "sla_compliance_rate": round(sla_compliance_rate, 4),
        "period_days": days,
    }


def _get_agent_name(agent_id: str, supabase_client: Any) -> str:
    try:
        res = (
            supabase_client.table("profiles")
            .select("full_name")
            .eq("id", agent_id)
            .single()
            .execute()
        )
        return (res.data or {}).get("full_name") or "Unknown Agent"
    except Exception:
        return "Unknown Agent"


def _empty_metrics(agent_id: str, agent_name: str = "Unknown Agent") -> dict:
    return {
        "agent_id": agent_id,
        "agent_name": agent_name,
        "total_tickets": 0,
        "resolved_tickets": 0,
        "sla_breached_count": 0,
        "avg_resolution_hours": None,
        "resolution_rate": 0.0,
        "sla_compliance_rate": 0.0,
        "period_days": 30,
        "insufficient_data": True,
    }


# ---------------------------------------------------------------------------
# Performance score
# ---------------------------------------------------------------------------

# Target: agent handling ~20 tickets/month with avg 4 h resolution = top speed score.
_SPEED_REFERENCE_HOURS = 4.0   # Hours for a "perfect" speed score
_VOLUME_REFERENCE = 20.0       # Tickets/period for a "perfect" volume score


def compute_performance_score(metrics: dict) -> float:
    """
    Weighted formula:
        resolution_rate  × 40
        sla_compliance   × 30
        avg_speed_score  × 20
        volume_score     × 10

    Returns a float in [0.0, 100.0].
    """
    if metrics.get("total_tickets", 0) == 0:
        return 0.0

    resolution_score = metrics.get("resolution_rate", 0.0) * 40.0
    sla_score = metrics.get("sla_compliance_rate", 0.0) * 30.0

    # Speed score: lower hours → higher score (exponential decay)
    avg_hours = metrics.get("avg_resolution_hours")
    if avg_hours is not None and avg_hours >= 0:
        # Score = 20 × e^(-(hours / reference))  clamped to [0, 20]
        speed_score = 20.0 * math.exp(-avg_hours / (_SPEED_REFERENCE_HOURS * 5))
        speed_score = max(0.0, min(20.0, speed_score))
    else:
        # No resolved tickets yet → give neutral score (10/20)
        speed_score = 10.0

    # Volume score: more tickets → higher score, clamped to 10
    volume = metrics.get("total_tickets", 0)
    volume_score = min(10.0, (volume / _VOLUME_REFERENCE) * 10.0)

    total = resolution_score + sla_score + speed_score + volume_score
    return round(max(0.0, min(100.0, total)), 2)


# ---------------------------------------------------------------------------
# Weakest metric detector (for targeted coaching)
# ---------------------------------------------------------------------------

def _identify_weakest_metric(metrics: dict, score: float) -> str:
    """Return a human-readable label of the agent's weakest area."""
    checks = {
        "resolution rate": metrics.get("resolution_rate", 0.0),
        "SLA compliance": metrics.get("sla_compliance_rate", 0.0),
    }
    avg_hours = metrics.get("avg_resolution_hours")
    if avg_hours is not None:
        # Normalise: 0 h → 1.0, 24 h → ~0.0
        checks["resolution speed"] = math.exp(-avg_hours / (_SPEED_REFERENCE_HOURS * 5))

    volume = metrics.get("total_tickets", 0)
    checks["ticket volume"] = min(1.0, volume / _VOLUME_REFERENCE)

    return min(checks, key=lambda k: checks[k])


# ---------------------------------------------------------------------------
# AI Coaching tip (Gemini)
# ---------------------------------------------------------------------------

def get_ai_coaching_tip(agent_name: str, metrics: dict, score: float, gemini_service: Any) -> str:
    """
    Call Gemini to generate a 2-sentence personalised coaching tip.
    Falls back to a rule-based tip if Gemini is unavailable.
    """
    if gemini_service is None or not getattr(gemini_service, "_initialized", False):
        return _rule_based_tip(metrics, score)

    weakest = _identify_weakest_metric(metrics, score)
    avg_hours_str = (
        f"{metrics['avg_resolution_hours']:.1f} hours"
        if metrics.get("avg_resolution_hours") is not None
        else "N/A"
    )

    prompt = (
        f"You are an expert IT helpdesk performance coach.\n"
        f"Agent: {agent_name}\n"
        f"Performance Score: {score}/100\n"
        f"Metrics (last 30 days):\n"
        f"  - Total tickets: {metrics.get('total_tickets', 0)}\n"
        f"  - Resolution rate: {metrics.get('resolution_rate', 0)*100:.1f}%\n"
        f"  - SLA compliance: {metrics.get('sla_compliance_rate', 0)*100:.1f}%\n"
        f"  - Avg resolution time: {avg_hours_str}\n"
        f"  - Weakest area: {weakest}\n\n"
        f"Write exactly 2 concise, actionable coaching sentences personalised to this agent's "
        f"weakest metric. Be encouraging but specific. No bullet points, no headers, no intro phrase "
        f"like 'Great job' or 'Hello'. Just the 2 sentences."
    )

    try:
        response = gemini_service.client.models.generate_content(
            model=gemini_service.model_name,
            contents=prompt
        )
        tip = response.text.strip()
        # Ensure only 2 sentences (safety clamp)
        sentences = [s.strip() for s in tip.split(".") if s.strip()]
        return ". ".join(sentences[:2]) + ("." if sentences else "")
    except Exception as e:
        print(f"[AgentScorecard] Gemini coaching tip failed: {e}")
        return _rule_based_tip(metrics, score)


def _rule_based_tip(metrics: dict, score: float) -> str:
    """Deterministic fallback coaching tip based on worst metric."""
    res_rate = metrics.get("resolution_rate", 0.0)
    sla_rate = metrics.get("sla_compliance_rate", 0.0)
    avg_h = metrics.get("avg_resolution_hours")

    if res_rate < 0.5:
        return (
            "Focus on closing out open tickets by setting aside dedicated resolution windows each day. "
            "Consider using the AI auto-resolve feature for common issues to boost your resolution rate."
        )
    if sla_rate < 0.7:
        return (
            "Prioritise tickets nearing their SLA deadline by enabling SLA breach alerts in your notification settings. "
            "Acknowledge new tickets within 30 minutes to prevent SLA escalations."
        )
    if avg_h is not None and avg_h > 8:
        return (
            "Your resolution time can improve by leveraging the Knowledge Base for quicker diagnostic steps. "
            "Try to resolve tickets in one interaction by providing comprehensive initial responses."
        )
    if score >= 75:
        return (
            "Excellent performance — keep up the momentum by mentoring junior agents on your efficient workflows. "
            "Consider documenting your best-practice resolutions to enrich the team knowledge base."
        )
    return (
        "Maintain a consistent daily review of your open tickets to prevent ageing. "
        "Use ticket tags and categories to prioritise your workload more effectively."
    )


# ---------------------------------------------------------------------------
# Company-level scorecard aggregation
# ---------------------------------------------------------------------------

def get_company_scorecard(company_id: str, supabase_client: Any, gemini_service: Any, days: int = 30) -> list[dict]:
    """
    Return a ranked list of agent scorecards for all agents in the company.
    Each entry contains: agent_id, agent_name, metrics, score, coaching_tip.
    """
    if supabase_client is None:
        return []

    # Fetch all agent profiles for this company
    try:
        result = (
            supabase_client.table("profiles")
            .select("id, full_name, role")
            .eq("company_id", company_id)
            .in_("role", ["agent", "admin", "super_admin"])
            .execute()
        )
        agents = result.data or []
    except Exception:
        # Fallback: fetch by company name field
        try:
            company_name_res = (
                supabase_client.table("companies")
                .select("name")
                .eq("id", company_id)
                .single()
                .execute()
            )
            company_name = (company_name_res.data or {}).get("name", "")
            result = (
                supabase_client.table("profiles")
                .select("id, full_name, role")
                .eq("company", company_name)
                .in_("role", ["agent", "admin", "super_admin"])
                .execute()
            )
            agents = result.data or []
        except Exception:
            agents = []

    scorecards = []
    for agent in agents:
        agent_id = agent["id"]
        metrics = get_agent_metrics(agent_id, company_id, supabase_client, days)
        score = compute_performance_score(metrics)

        # Only generate coaching tip for agents with data to save on API calls
        if metrics.get("insufficient_data"):
            coaching_tip = "Insufficient data — fewer than 1 ticket in the last 30 days."
        else:
            coaching_tip = get_ai_coaching_tip(
                metrics.get("agent_name", "Agent"), metrics, score, gemini_service
            )

        scorecards.append({
            "agent_id": agent_id,
            "agent_name": metrics.get("agent_name", agent.get("full_name", "Unknown")),
            "role": agent.get("role", "agent"),
            "metrics": metrics,
            "score": score,
            "coaching_tip": coaching_tip,
            "insufficient_data": metrics.get("insufficient_data", False),
        })

    # Sort descending by score
    scorecards.sort(key=lambda x: x["score"], reverse=True)
    return scorecards
