# Real-Time SLA Monitoring & Indicator

This document describes the design, implementation, and behavior of the real-time Service Level Agreement (SLA) status monitoring system in **HELPDESK.AI**.

---

## Architecture Overview

To support proactive service delivery, the system monitors SLA deadlines in real time directly on the ticket details view. It uses a lightweight API polling model that retrieves status metrics without incurring the performance overhead of full ticket updates.

```
[Frontend Client: TicketDetail] 
       |
       | (GET /api/tickets/{id}/sla-status every 5s)
       v
[FastAPI Backend] 
       |
       | (Fetches only priority & sla_breach_at from Supabase)
       v
[SLA Status Service] ---> Computes remaining seconds, percentage, and severity state
       |
       +--- Returns lightweight SLA metadata JSON
```

---

## SLA Thresholds & Severity States

The ticket's SLA consumption is calculated dynamically based on its priority definition and the deadline stored in `sla_breach_at`. The platform maps priorities to the following total resolution windows:
- **Critical**: 4 hours
- **High**: 12 hours
- **Medium**: 24 hours
- **Low**: 72 hours

As time passes, the percentage of the SLA window consumed determines the severity state and visual display:

| Severity | SLA Consumption | Color Code | Badge Text / Indicator |
| :--- | :--- | :--- | :--- |
| **Healthy** | `< 75%` | Green (🟢) | `🟢 SLA Healthy` (e.g. "3h 15m until breach") |
| **Warning** | `75% - 89%` | Yellow (🟡) | `🟡 SLA Warning` (e.g. "50m until breach") |
| **Critical** | `90% - 99%` | Red (🔴) | `🔴 SLA Critical` (with dynamic countdown) |
| **Breached** | `100%+` | Rose/Dark Red (❌) | `❌ SLA Breached` (e.g. "Breached 1h 5m ago") |

---

## Polling & Performance Optimization

To protect browser performance and avoid database connection saturation:
1. **Lightweight Endpoint**: The `/api/tickets/{ticket_id}/sla-status` endpoint queries only the required columns (`id`, `priority`, `sla_breach_at`, `status`) rather than retrieving the entire ticket document and audit logs.
2. **Page Visibility Awareness**: Polling uses the browser's `visibilitychange` API. When a user switches tabs or minimizes the window, polling is automatically suspended. It resumes instantly when the tab becomes active again.
3. **Terminal State Suppression**: If the ticket reaches a terminal state (e.g., `resolved`, `closed`, `auto-resolved`), polling is disabled completely since the SLA is met.
4. **Resiliency**: If a fetch error occurs (e.g., brief network disruption), the badge suppresses visual error states to prevent page disruption, retrying on the next scheduled poll.

---

## Unit Testing

Backend calculations and state transitions are covered by unit tests in [test_sla_service.py](file:///C:/Users/ASUS/Desktop/88/HELPDESK.AI/backend/tests/test_sla_service.py).
Run the tests using:
```bash
python -m unittest backend/tests/test_sla_service.py
```
