## 🏆 Intermediate Feature Bounty Description

Service Level Agreements (SLAs) are now fully operational on our backend. However, administrators shouldn't need to poll the dashboard to notice a breach. 

We need a lightweight, secure background trigger that posts automated alerts to a Slack channel when critical tickets are ignored or breached.

---

## 🛠️ Requirements

1. **FastAPI Integration**:
   * Add a Slack dispatch helper inside `backend/sla_checker.py` (or as a service).
   * Retrieve the webhook URL from an environment variable (`SLACK_WEBHOOK_URL`).
2. **Interactive Payload Format**:
   * Dispatch a beautiful Slack rich attachment block including:
     * Ticket Reference (`#T-XXXX`)
     * Subject and Category
     * Current Assignee
     * Breach Timestamp
3. **Mock Fallback**: Fall back gracefully if no webhook URL is defined without breaking startup loops.
4. **Target Branch**: Please target the `gssoc` branch, NOT `main`.
