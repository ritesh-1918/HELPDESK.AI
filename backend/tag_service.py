"""
tag_service.py — AI-powered ticket tagging using Gemini
Issue #404 — Smart Ticket Tagging System
"""
import os
import json
try:
    import google.generativeai as genai
except ImportError:
    genai = None
from supabase import create_client

def _make_supabase():
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        return None
    try:
        return create_client(url, key)
    except Exception as e:
        print(f"[tag_service] Supabase init failed: {e}")
        return None


def _make_gemini():
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-pro")
    except Exception as e:
        print(f"[tag_service] Gemini init failed: {e}")
        return None


_supabase = _make_supabase()
_gemini_model = _make_gemini()


def _get_supabase():
    return _supabase


def _get_gemini():
    return _gemini_model


# ── Core functions ────────────────────────────────────────────────────────────

def suggest_tags(ticket_title: str, ticket_body: str, category: str = "") -> list[str]:
    """
    Use Gemini to suggest 2-4 operational tags for a ticket.
    Returns a list of lowercase hyphenated strings.
    Gracefully returns [] on any error — never crashes.
    """
    if not ticket_title and not ticket_body:
        return []

    try:
        model = _get_gemini()

        prompt = f"""You are an IT helpdesk assistant. Suggest 2-4 short operational tags for this support ticket.

Rules:
- Lowercase and hyphenated only (e.g. "needs-escalation", "vpn-issue", "quick-fix")
- Focus on operational state OR specific technical topic
- Return ONLY a valid JSON array of strings — no explanation, no markdown, no backticks
- Bad: ["Needs Escalation", "VPN Issue"]
- Good: ["needs-escalation", "vpn-issue"]

Ticket Category: {category or "unknown"}
Ticket Title: {ticket_title[:200]}
Ticket Description: {ticket_body[:400]}

JSON array only:"""

        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Strip accidental markdown fences
        raw = raw.replace("```json", "").replace("```", "").strip()

        tags = json.loads(raw)

        if isinstance(tags, list):
            cleaned = []
            for t in tags:
                if isinstance(t, str) and t.strip():
                    tag = t.strip().lower().replace(" ", "-")
                    # Only allow alphanumeric + hyphens
                    tag = "".join(c for c in tag if c.isalnum() or c == "-")
                    if tag and len(tag) <= 30:
                        cleaned.append(tag)
            return cleaned[:4]

        return []

    except Exception as e:
        print(f"[tag_service] suggest_tags failed: {e}")
        return []


def save_tags(ticket_id: str, tags: list[str]) -> bool:
    """Persist tags array to Supabase tickets table."""
    try:
        # Sanitize before saving
        clean = [
            "".join(c for c in t.strip().lower().replace(" ", "-") if c.isalnum() or c == "-")
            for t in tags if t.strip()
        ]
        clean = [t for t in clean if t and len(t) <= 30][:10]  # max 10 tags

        _get_supabase().table("tickets").update(
            {"tags": clean}
        ).eq("id", ticket_id).execute()
        return True
    except Exception as e:
        print(f"[tag_service] save_tags failed: {e}")
        return False


def get_tags(ticket_id: str) -> list[str]:
    """Fetch current tags for a ticket."""
    try:
        result = _get_supabase().table("tickets").select("tags").eq("id", ticket_id).single().execute()
        return result.data.get("tags") or []
    except Exception as e:
        print(f"[tag_service] get_tags failed: {e}")
        return []


def get_popular_tags(company_id: str, limit: int = 20) -> list[dict]:
    """Return top N most-used tags across a company (for autocomplete)."""
    try:
        result = _get_supabase().rpc(
            "get_popular_tags",
            {"p_company_id": company_id, "p_limit": limit}
        ).execute()
        return result.data or []
    except Exception as e:
        print(f"[tag_service] get_popular_tags failed: {e}")
        return []
