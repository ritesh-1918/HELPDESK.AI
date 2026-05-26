from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def _format_ticket_reference(ticket_id: str) -> str:
    clean_id = str(ticket_id or "").strip()
    if clean_id.isdigit():
        return f"#T-{int(clean_id):04d}"
    return f"#T-{clean_id}" if clean_id else "#T-UNKNOWN"


def _format_breach_time(breach_time: datetime) -> str:
    if breach_time.tzinfo is None:
        normalized = breach_time.replace(tzinfo=timezone.utc)
    else:
        normalized = breach_time.astimezone(timezone.utc)
    iso_value = normalized.isoformat().replace("+00:00", "Z")
    human_value = normalized.strftime("%Y-%m-%d %H:%M:%S UTC")
    return f"{iso_value} ({human_value})"


def _post_json(url: str, payload: dict) -> None:
    try:
        import requests

        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return
    except ImportError:
        pass
    except Exception as exc:
        logger.error("Slack alert request failed: %s", exc)
        return

    try:
        import httpx

        response = httpx.post(url, json=payload, timeout=10)
        response.raise_for_status()
    except ImportError:
        logger.error("Slack alert client not available: install requests or httpx")
    except Exception as exc:
        logger.error("Slack alert request failed: %s", exc)


def dispatch_slack_alert(
    ticket_id: str,
    subject: str,
    category: str,
    assignee: str,
    breach_time: datetime,
) -> None:
    webhook_url = (os.environ.get("SLACK_WEBHOOK_URL") or "").strip()
    if not webhook_url:
        return None

    payload = {
        "attachments": [
            {
                "color": "#FF0000",
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": "🚨 SLA Breach Alert",
                            "emoji": True,
                        },
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": f"*Ticket Reference:*\n{_format_ticket_reference(ticket_id)}",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Subject:*\n{subject or 'Untitled ticket'}",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Category:*\n{category or 'Uncategorized'}",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Assigned To:*\n{assignee or 'Unassigned'}",
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Breach Time:*\n{_format_breach_time(breach_time)}",
                            },
                        ],
                    },
                    {"type": "divider"},
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": "Automated SLA Monitor",
                            }
                        ],
                    },
                ],
            }
        ]
    }

    _post_json(webhook_url, payload)

    return None
"""
SLA Background Checker — Periodic worker that evaluates ticket SLAs
and dispatches multi-channel escalation notifications.

Run as a standalone process:
    python backend/sla_checker.py

Or import and use the start_background_checker() function.
"""

import os
import sys
import time
import json
import asyncio
import logging
import datetime
from pathlib import Path

# ── Project Path ──────────────────────────────────────────────────────────
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="[SLA-Checker %(asctime)s] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("sla-checker")

# ── Load env ───────────────────────────────────────────────────────────────
from dotenv import load_dotenv
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)


def create_supabase_client():
    """Create a Supabase client using service role key."""
    try:
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not url or not key:
            logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set")
            return None
        return create_client(url, key)
    except ImportError:
        logger.warning("supabase-py not installed — running in dry-run mode")
        return None
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        return None


async def run_sla_check(supabase=None, dry_run: bool = False) -> dict:
    """
    Execute one full SLA check cycle.
    Returns a summary dict with counts.
    """
    from backend.services.sla_engine import SLAEngine

    engine = SLAEngine(supabase_client=supabase)
    logger.info("Starting SLA check cycle...")

    if dry_run:
        logger.info("DRY RUN mode — no DB updates will be made.")

    if supabase and not dry_run:
        escalated = await engine.check_all_active_tickets()
        if escalated:
            logger.info(f"Dispatching notifications for {len(escalated)} escalated tickets...")
            await engine.dispatch_notifications(escalated)
            # Send Slack alerts for escalated tickets
            _dispatch_slack_alerts(escalated)
        stats = await engine.get_dashboard_stats()
        logger.info(f"SLA stats: {json.dumps(stats)}")
        return {"checked": len(escalated) if escalated else 0, "stats": stats}
    else:
        logger.warning("No Supabase client — cannot run SLA check.")
        return {"checked": 0, "stats": {}}


def run_sla_check_sync(supabase=None, dry_run: bool = False) -> dict:
    """Synchronous wrapper for run_sla_check."""
    return asyncio.run(run_sla_check(supabase, dry_run))


def background_checker_loop(interval_minutes: int = 5, dry_run: bool = False):
    """
    Run the SLA check in an infinite loop.
    
    Args:
        interval_minutes: How often to check (default 5 min).
        dry_run: If True, only log what would be done.
    """
    supabase = create_supabase_client()
    logger.info(
        f"SLA Background Checker started "
        f"(interval={interval_minutes}m, dry_run={dry_run})"
    )

    while True:
        try:
            result = run_sla_check_sync(supabase, dry_run)
            logger.info(f"Cycle complete: {json.dumps(result)}")
        except Exception as e:
            logger.error(f"Cycle failed: {e}", exc_info=True)

        logger.info(f"Sleeping for {interval_minutes} minutes...")
        time.sleep(interval_minutes * 60)


# # ── FastAPI lifespan integration ──────────────────────────────────────
# Use this inside lifespan() to start the checker as a background task:
#
#   task = asyncio.create_task(sla_checker_loop_async(app.state.supabase))
#
# (Not a standalone asyncio loop to avoid blocking the server.)


def _dispatch_slack_alerts(escalated: list) -> None:
    """Send Slack alerts for escalated tickets (best-effort)."""
    try:
        from backend.services.slack_notifier import notify_sla_breach

        for ticket in escalated:
            try:
                notify_sla_breach(ticket)
            except Exception as e:
                logger.warning("Slack notification failed for ticket %s: %s", ticket.get("id"), e)
    except ImportError:
        logger.debug("slack_notifier module not available — skipping Slack alerts")
    except Exception as e:
        logger.warning("Slack alert dispatch error: %s", e)

async def sla_checker_loop_async(
    supabase,
    interval_seconds: int = 300,
):
    """Async SLA checker loop — suitable for FastAPI lifespan background task."""
    from backend.services.sla_engine import SLAEngine
    engine = SLAEngine(supabase_client=supabase)
    logger.info(f"SLA background async checker started (interval={interval_seconds}s)")

    while True:
        try:
            escalated = await engine.check_all_active_tickets()
            if escalated:
                await engine.dispatch_notifications(escalated)
                _dispatch_slack_alerts(escalated)
            logger.info(f"Async SLA check: {len(escalated)} escalations triggered")
        except Exception as e:
            logger.error(f"Async SLA check error: {e}")

        await asyncio.sleep(interval_seconds)


# ── CLI entry point ──────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="SLA Breach & Escalation Checker")
    parser.add_argument(
        "--interval", type=int, default=5,
        help="Check interval in minutes (default: 5)"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Log evaluations without updating the database"
    )
    parser.add_argument(
        "--once", action="store_true",
        help="Run a single check cycle and exit"
    )
    args = parser.parse_args()

    if args.once:
        supabase = create_supabase_client()
        result = run_sla_check_sync(supabase, args.dry_run)
        print(json.dumps(result, indent=2))
    else:
        background_checker_loop(args.interval, args.dry_run)
