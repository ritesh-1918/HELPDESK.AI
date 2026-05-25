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
