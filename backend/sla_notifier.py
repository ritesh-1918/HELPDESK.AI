"""
sla_notifier.py -- Admin SLA Breach Notification Service
"""
import os, json, logging, threading
from urllib.request import Request, urlopen
from urllib.error import URLError
from backend.sla_predictor import compute_risk_score, trigger_admin_notification

logger = logging.getLogger(__name__)
WEBHOOK_URL = os.environ.get("SLA_ALERT_WEBHOOK_URL", "")
NOTIFICATION_LOG = []
NOTIFICATION_LOCK = threading.Lock()

def send_webhook(notification):
    if not WEBHOOK_URL:
        logger.info("No webhook configured")
        return False
    payload = json.dumps(notification).encode("utf-8")
    req = Request(WEBHOOK_URL, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except URLError as e:
        logger.warning("Webhook failed: %s", e)
        return False

def get_notification_log(count=10):
    with NOTIFICATION_LOCK:
        return list(NOTIFICATION_LOG[-count:])

async def assess_and_notify(ticket, supabase=None):
    risk = compute_risk_score(
        priority=ticket.get("priority"),
        sla_breach_at=ticket.get("sla_breach_at"),
        category=ticket.get("category"),
        company_id=ticket.get("company_id"),
        sentiment=ticket.get("sentiment"),
        supabase=supabase,
    )
    notification = trigger_admin_notification(ticket, risk)
    if notification:
        send_webhook(notification)
        with NOTIFICATION_LOCK:
            NOTIFICATION_LOG.append(notification)
            if len(NOTIFICATION_LOG) > 100:
                NOTIFICATION_LOG.pop(0)
    return notification

async def notify_high_risk_tickets(supabase, batch_size=50):
    sent = []
    if not supabase:
        return sent
    try:
        res = supabase.table("tickets").select(
            "id,ticket_id,subject,priority,status,sla_breach_at,category,company_id,sentiment,created_at"
        ).in_("status", ["open","in_progress","pending"]).limit(batch_size).execute()
    except Exception as e:
        logger.error("Batch query failed: %s", e)
        return sent
    for ticket in (res.data or []):
        notification = await assess_and_notify(ticket, supabase)
        if notification:
            sent.append(notification)
    return sent
