"""
agent_scorecard.py — Agent performance metrics + AI coaching via Gemini
Issue #774 — Real-Time Agent Performance Scorecard
"""
import os
import math
from datetime import datetime, timedelta, timezone

import google.generativeai as genai
from supabase import create_client


def _make_supabase():
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        return None
    try:
        return create_client(url, key)
    except Exception as error:
        print(f"[scorecard] Supabase init failed: {error}")
        return None


def _make_gemini():
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-pro")
    except Exception as error:
        print(f"[scorecard] Gemini init failed: {error}")
        return None


_supabase = _make_supabase()
_gemini = _make_gemini()


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _days_ago(days: int) -> str:
    return (_now_utc() - timedelta(days=days)).isoformat().replace("+00:00", "Z")


def _normalize_percent(value: float | int | None) -> float:
    if value is None:
        return 0.0
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return 0.0
    if numeric <= 1.0:
        return numeric * 100.0
    return numeric


def _empty_metrics(agent_id: str, agent_name: str = "Unknown Agent") -> dict:
    return {
        "agent_id": agent_id,
        "agent_name": agent_name,
        "total_tickets": 0,
        "resolved_tickets": 0,
        "sla_breached_count": 0,
        "avg_resolution_hours": None,
        "resolution_rate": 0.0,
        "sla_compliance": 0.0,
        "ticket_volume": 0,
        "has_data": False,
        "insufficient_data": True,
        "period_days": 30,
    }


def _get_agent_name(agent_id: str, supabase_client) -> str:
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


def get_agent_metrics(agent_id: str, company_id: str, supabase_client=None, days: int = 30) -> dict:
    """Query Supabase for an agent's ticket stats over the last N days."""
    sb = supabase_client or _supabase
    if sb is None:
        return _empty_metrics(agent_id)

    since = _days_ago(days)
    agent_name = _get_agent_name(agent_id, sb)

    tickets = []
    try:
        result = (
            sb.table("tickets")
            .select("id, status, sla_status, created_at, updated_at, metadata, assigned_agent_id")
            .eq("company_id", company_id)
            .eq("assigned_agent_id", agent_id)
            .gte("created_at", since)
            .execute()
        )
        tickets = result.data or []
    except Exception:
        try:
            result = (
                sb.table("tickets")
                .select("id, status, sla_status, created_at, updated_at, metadata, user_id, assigned_agent_id")
                .eq("company_id", company_id)
                .eq("user_id", agent_id)
                .gte("created_at", since)
                .execute()
            )
            tickets = result.data or []
        except Exception as error:
            print(f"[scorecard] get_agent_metrics failed: {error}")
            return _empty_metrics(agent_id, agent_name)

    if not tickets:
        return _empty_metrics(agent_id, agent_name)

    total = len(tickets)
    resolved = [
        ticket for ticket in tickets
        if str(ticket.get("status", "")).lower() in ("resolved", "closed", "auto_resolved") or "resolv" in str(ticket.get("status", "")).lower()
    ]
    sla_breached = [
        ticket for ticket in tickets
        if str(ticket.get("sla_status", "")).upper() == "BREACHED"
    ]

    resolution_hours = []
    for ticket in resolved:
        created_raw = ticket.get("created_at")
        resolved_raw = ticket.get("updated_at") or (ticket.get("metadata") or {}).get("resolved_at")
        if created_raw and resolved_raw:
            try:
                created_dt = datetime.fromisoformat(str(created_raw).replace("Z", "+00:00"))
                resolved_dt = datetime.fromisoformat(str(resolved_raw).replace("Z", "+00:00"))
                diff_hours = (resolved_dt - created_dt).total_seconds() / 3600
                if 0 < diff_hours < 720:
                    resolution_hours.append(diff_hours)
            except Exception:
                pass

    avg_resolution_hours = round(sum(resolution_hours) / len(resolution_hours), 2) if resolution_hours else 0.0
    resolution_rate = round((len(resolved) / total) * 100, 1) if total else 0.0
    sla_compliance = round(((total - len(sla_breached)) / total) * 100, 1) if total else 0.0

    return {
        "agent_id": agent_id,
        "agent_name": agent_name,
        "total_tickets": total,
        "resolved_tickets": len(resolved),
        "sla_breached_count": len(sla_breached),
        "avg_resolution_hours": avg_resolution_hours,
        "resolution_rate": resolution_rate,
        "sla_compliance": sla_compliance,
        "ticket_volume": total,
        "has_data": True,
        "insufficient_data": False,
        "period_days": days,
    }


def compute_performance_score(metrics: dict) -> float:
    """Weighted performance score 0–100."""
    if not metrics.get("has_data") or metrics.get("total_tickets", 0) == 0:
        return 0.0

    resolution_score = min(_normalize_percent(metrics.get("resolution_rate", 0.0)), 100.0)
    sla_score = min(_normalize_percent(metrics.get("sla_compliance", metrics.get("sla_compliance_rate", 0.0))), 100.0)

    avg_hours = metrics.get("avg_resolution_hours")
    if avg_hours is None:
        speed_score = 100.0
    elif avg_hours <= 0:
        speed_score = 100.0
    elif avg_hours >= 24:
        speed_score = 0.0
    else:
        speed_score = round((1 - (avg_hours / 24)) * 100, 1)

    volume_score = min((float(metrics.get("ticket_volume", metrics.get("total_tickets", 0))) / 50.0) * 100.0, 100.0)

    score = (
        resolution_score * 0.40 +
        sla_score * 0.30 +
        speed_score * 0.20 +
        volume_score * 0.10
    )
    return round(max(0.0, min(100.0, score)), 1)


def _fallback_tip(weakest: str) -> str:
    tips = {
        "resolution rate": "Try breaking complex tickets into smaller steps to close them faster. Consistent follow-ups can significantly improve your resolution rate.",
        "SLA compliance": "Set personal reminders before SLA deadlines so nothing slips. Proactive communication with users helps prevent breaches.",
        "response speed": "Aim to respond quickly to new tickets with a short acknowledgment first. That keeps users informed while you work the full fix.",
    }
    return tips.get(weakest, "Keep up the great work and focus on closing tickets within SLA windows.")


def get_ai_coaching_tip(agent_name: str, metrics: dict, score: float) -> str:
    model = _gemini
    if model is None or not metrics.get("has_data"):
        return _fallback_tip("response speed")

    weakest = "resolution rate"
    scores = {
        "resolution rate": _normalize_percent(metrics.get("resolution_rate", 0.0)),
        "SLA compliance": _normalize_percent(metrics.get("sla_compliance", metrics.get("sla_compliance_rate", 0.0))),
        "response speed": max(0.0, 100.0 - (float(metrics.get("avg_resolution_hours") or 0.0) * 4.0)),
    }
    weakest = min(scores, key=scores.get)

    try:
        prompt = f"""You are a supportive IT team coach. Write exactly 2 sentences of personalized coaching advice for this agent.

Agent: {agent_name}
Overall Score: {score}/100
Resolution Rate: {scores['resolution rate']:.1f}%
SLA Compliance: {scores['SLA compliance']:.1f}%
Avg Resolution Time: {metrics.get('avg_resolution_hours', 0.0)} hours
Tickets Handled: {metrics.get('ticket_volume', metrics.get('total_tickets', 0))}
Weakest area: {weakest}

Rules:
- Address them by first name only
- Be encouraging, not critical
- Give one specific, actionable tip for their weakest area
- Keep it under 40 words total
- Write ONLY the 2 sentences, nothing else"""

        response = model.generate_content(prompt)
        tip = (response.text or "").strip()
        if not tip:
            return _fallback_tip(weakest)

        sentences = [sentence.strip() for sentence in tip.replace("\n", " ").split(".") if sentence.strip()]
        if len(sentences) >= 2:
            return ". ".join(sentences[:2]) + "."
        return tip[:300]
    except Exception as error:
        print(f"[scorecard] Gemini coaching tip failed: {error}")
        return _fallback_tip(weakest)


def get_company_scorecard(company_id: str, supabase_client=None, days: int = 30) -> list[dict]:
    """Get performance scorecard for all agents in a company from cache."""
    sb = supabase_client or _supabase
    if sb is None:
        return []

    try:
        result = (
            sb.table("agent_scorecards")
            .select("*, profiles!agent_scorecards_agent_id_fkey(full_name, email, avatar_url)")
            .eq("company_id", company_id)
            .order("performance_score", desc=True)
            .execute()
        )
        return result.data or []
    except Exception as error:
        print(f"[scorecard] get_company_scorecard failed: {error}")
        return []


def refresh_agent_scorecard(agent_id: str, company_id: str, agent_name: str = "Agent", supabase_client=None, days: int = 30) -> dict:
    """Full pipeline: compute metrics → score → AI tip → upsert to Supabase."""
    sb = supabase_client or _supabase
    metrics = get_agent_metrics(agent_id, company_id, supabase_client=sb, days=days)
    score = compute_performance_score(metrics)
    tip = get_ai_coaching_tip(agent_name, metrics, score)

    record = {
        "agent_id": agent_id,
        "company_id": company_id,
        "resolution_rate": metrics.get("resolution_rate", 0.0),
        "avg_resolution_hours": metrics.get("avg_resolution_hours", 0.0),
        "sla_compliance": metrics.get("sla_compliance", 0.0),
        "ticket_volume": metrics.get("ticket_volume", 0),
        "performance_score": score,
        "ai_coaching_tip": tip,
        "computed_at": _now_utc().isoformat(),
        "agent_name": metrics.get("agent_name", agent_name),
    }

    if sb:
        try:
            sb.table("agent_scorecards").upsert(record, on_conflict="agent_id").execute()
        except Exception as error:
            print(f"[scorecard] scorecard upsert failed: {error}")

        try:
            sb.table("profiles").update(
                {
                    "performance_score": score,
                    "performance_updated_at": _now_utc().isoformat(),
                }
            ).eq("id", agent_id).execute()
        except Exception as error:
            print(f"[scorecard] profile performance update failed: {error}")

    return {**record, "metrics": metrics}
