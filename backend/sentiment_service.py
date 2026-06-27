"""
sentiment_service.py — AI ticket sentiment analysis + frustration escalation
Issue #775 — AI-Powered Ticket Sentiment Analysis
"""

import json
import os

import google.generativeai as genai
from supabase import create_client


def _make_supabase():
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        return None
    try:
        return create_client(url, key)
    except Exception as exc:
        print(f"[sentiment] Supabase init failed: {exc}")
        return None


def _make_gemini():
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-pro")
    except Exception as exc:
        print(f"[sentiment] Gemini init failed: {exc}")
        return None


_supabase = _make_supabase()
_gemini = _make_gemini()

ESCALATION_MAP = {"low": "medium", "medium": "high", "high": "critical", "critical": "critical"}
FRUSTRATION_LEVELS = ["neutral", "mild", "moderate", "high", "critical"]


def analyze_sentiment(ticket_title: str, ticket_body: str) -> dict:
    neutral_fallback = {
        "sentiment_score": 0.0,
        "frustration_level": "neutral",
        "detected_signals": [],
        "recommended_action": "standard",
        "confidence": 0.0,
    }

    if not ticket_title and not ticket_body:
        return neutral_fallback

    model = _gemini
    if model is None:
        return neutral_fallback

    try:
        prompt = f"""You are an expert IT support sentiment analyst. Analyze the emotional tone of this support ticket.

Ticket Title: {ticket_title[:200]}
Ticket Body: {ticket_body[:600]}

Return ONLY a valid JSON object with these exact fields:
{{
  "sentiment_score": <float from -1.0 (very frustrated) to 1.0 (positive)>,
  "frustration_level": <one of: "neutral", "mild", "moderate", "high", "critical">,
  "detected_signals": <array of up to 4 short strings describing what signals you detected>,
  "recommended_action": <one of: "standard", "prioritize", "escalate-immediately">,
  "confidence": <float 0.0 to 1.0>
}}

Return ONLY the JSON object, no markdown, no explanation."""

        response = model.generate_content(prompt)
        raw = response.text.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(raw)

        score = max(-1.0, min(1.0, float(data.get("sentiment_score", 0.0))))
        level = str(data.get("frustration_level", "neutral")).lower()
        if level not in FRUSTRATION_LEVELS:
            level = "neutral"

        signals = data.get("detected_signals", [])
        if isinstance(signals, list):
            signals = [str(signal)[:50] for signal in signals[:4]]
        else:
            signals = []

        action = str(data.get("recommended_action", "standard"))
        if action not in ["standard", "prioritize", "escalate-immediately"]:
            action = "standard"

        confidence = max(0.0, min(1.0, float(data.get("confidence", 0.5))))
        return {
            "sentiment_score": round(score, 3),
            "frustration_level": level,
            "detected_signals": signals,
            "recommended_action": action,
            "confidence": round(confidence, 2),
        }
    except Exception as exc:
        print(f"[sentiment] analyze_sentiment failed: {exc}")
        return neutral_fallback


def should_auto_escalate(frustration_level: str, current_priority: str) -> tuple[bool, str]:
    current = (current_priority or "medium").lower()
    level = (frustration_level or "neutral").lower()
    if level in ("high", "critical"):
        new_priority = ESCALATION_MAP.get(current, current)
        return new_priority != current, new_priority
    return False, current


def save_sentiment(ticket_id: str, sentiment: dict, new_priority: str, auto_escalated: bool) -> bool:
    sb = _supabase
    if sb is None:
        return False
    try:
        update = {
            "sentiment_score": sentiment["sentiment_score"],
            "frustration_level": sentiment["frustration_level"],
            "sentiment_signals": sentiment["detected_signals"],
            "auto_escalated": auto_escalated,
            "sentiment_analyzed": True,
        }
        if auto_escalated:
            update["priority"] = new_priority
        sb.table("tickets").update(update).eq("id", ticket_id).execute()
        return True
    except Exception as exc:
        print(f"[sentiment] save_sentiment failed: {exc}")
        return False


def get_frustration_heatmap(company_id: str) -> dict:
    sb = _supabase
    empty = {level: 0 for level in FRUSTRATION_LEVELS}
    empty["total"] = 0
    if sb is None:
        return empty
    try:
        result = (
            sb.table("tickets")
            .select("frustration_level")
            .eq("company_id", company_id)
            .in_("status", ["open", "in_progress"])
            .execute()
        )
        tickets = result.data or []
        counts = {level: 0 for level in FRUSTRATION_LEVELS}
        for ticket in tickets:
            level = ticket.get("frustration_level", "neutral")
            if level in counts:
                counts[level] += 1
        counts["total"] = len(tickets)
        return counts
    except Exception as exc:
        print(f"[sentiment] get_frustration_heatmap failed: {exc}")
        return empty


def analyze_and_save(ticket_id: str, ticket_title: str, ticket_body: str, current_priority: str) -> dict:
    try:
        sentiment = analyze_sentiment(ticket_title, ticket_body)
        should_escalate, new_priority = should_auto_escalate(sentiment["frustration_level"], current_priority)
        save_sentiment(ticket_id, sentiment, new_priority, should_escalate)
        return {**sentiment, "auto_escalated": should_escalate, "new_priority": new_priority}
    except Exception as exc:
        print(f"[sentiment] analyze_and_save pipeline failed: {exc}")
        return {
            "sentiment_score": 0.0,
            "frustration_level": "neutral",
            "detected_signals": [],
            "auto_escalated": False,
            "new_priority": current_priority,
        }