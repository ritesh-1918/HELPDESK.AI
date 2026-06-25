"""
Rate limiter configuration — shared global instance.
Extracted to avoid circular imports between main.py and routers.

Rate Limit Tiers
----------------
- **AUTH_LIMIT** (5/min):   Login, signup brute-force protection
- **ADMIN_LIMIT** (10/min): Admin mutations (settings, knowledge-gap scans)
- **TICKET_WRITE_LIMIT** (30/min): Ticket creation, updates, bulk operations
- **TICKET_READ_LIMIT** (60/min): Read-heavy ticket endpoints
- **ML_HEAVY_LIMIT** (10/min):   NLP, OCR, Gemini — GPU/CPU intensive
- **ML_LIGHT_LIMIT** (30/min):   Similar-incident search — lighter
- **API_TOKEN_LIMIT** (5/min):   Token creation/rotation — low-frequency
- **SECURITY_LIMIT** (10/min):   Security audit/report endpoints
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Single global limiter instance (used by main.py and all routers)
limiter = Limiter(key_func=get_remote_address)

# ── Shared limit constants ────────────────────────────────────────────────────
AUTH_LIMIT          = "5/minute"    # Brute-force protection on login / signup
ADMIN_LIMIT         = "10/minute"   # Admin mutations (settings, KB scans)
TICKET_WRITE_LIMIT  = "30/minute"   # Ticket creation, updates, bulk ops
TICKET_READ_LIMIT   = "60/minute"   # Ticket listing and search
ML_HEAVY_LIMIT      = "10/minute"   # NLP, OCR, Gemini — GPU/CPU intensive
ML_LIGHT_LIMIT      = "30/minute"   # Similar-incident search — lighter
API_TOKEN_LIMIT     = "5/minute"    # API token creation and rotation
SECURITY_LIMIT      = "10/minute"   # Security audit and report endpoints
