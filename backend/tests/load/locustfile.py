"""
Locust Load Testing Suite for HELPDESK.AI
Tests critical API endpoints: /auth, /tickets, /ai/analyze_ticket, /tickets/save
"""

import json
import logging
import time
import random
from locust import HttpUser, task, between, SequentialTaskSet
from sla_config import SLAConfig, ReportCollector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AuthBehaviour(SequentialTaskSet):
    """Simulates a user who first logs in, then performs actions."""

    token = None
    user_id = None

    def on_start(self):
        """Login at the start of the session."""
        self.login()

    def login(self):
        """POST /auth/login and extract token."""
        creds = {
            "email": f"loadtest_{random.randint(1, 999999)}@example.com",
            "password": "TestPass123!"
        }
        with self.client.post(
            "/auth/login",
            json=creds,
            name="POST /auth/login",
            catch_response=True
        ) as resp:
            if resp.status_code == 200:
                data = resp.json()
                self.token = data.get("token", data.get("access_token"))
                self.user_id = data.get("user_id") or data.get("id")
                if self.token:
                    resp.success()
                    logger.info("Auth login OK")
                else:
                    resp.failure("No token in login response")
            elif resp.status_code in (400, 401, 409):
                # Already exists or invalid — try signup
                self.signup(creds)
            else:
                resp.failure(f"Auth login failed: {resp.status_code}")

    def signup(self, creds):
        """POST /auth/signup as fallback."""
        with self.client.post(
            "/auth/signup",
            json=creds,
            name="POST /auth/signup",
            catch_response=True
        ) as resp:
            if resp.status_code == 200 or resp.status_code == 201:
                data = resp.json()
                self.token = data.get("token", data.get("access_token"))
                self.user_id = data.get("user_id") or data.get("id")
                if self.token:
                    resp.success()
                else:
                    resp.failure("No token after signup")
            else:
                resp.failure(f"Signup failed: {resp.status_code}")

    def get_headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task
    def list_tickets(self):
        """GET /tickets with optional filters."""
        params = {}
        if random.random() < 0.5:
            params["page"] = random.randint(1, 5)
            params["page_size"] = random.choice([10, 20, 50])
        if random.random() < 0.3:
            params["status"] = random.choice(["open", "in_progress", "resolved"])
        with self.client.get(
            "/tickets",
            params=params,
            headers=self.get_headers(),
            name="GET /tickets",
            catch_response=True
        ) as resp:
            if resp.status_code == 200:
                resp.success()
            elif resp.status_code in (401, 403):
                self.login()
                resp.failure("Unauthorized")
            else:
                resp.failure(f"List tickets: {resp.status_code}")

    @task
    def create_ticket(self):
        """POST /tickets to create a new ticket."""
        ticket = {
            "ticket_id": f"LT-{random.randint(10000, 99999)}",
            "owner_id": self.user_id or "loadtest_user",
            "summary": random.choice([
                "VPN connection failing to authenticate",
                "Email server not sending notifications",
                "Database query timeout on dashboard",
                "SSL certificate expired for subdomain",
                "File upload failing with large attachments",
                "API rate limit exceeded on third-party integration",
            ]),
            "category": random.choice(["Access", "Network", "Security", "Software"]),
            "subcategory": random.choice(["VPN", "Email", "Database", "Certificate"]),
            "priority": random.choice(["Low", "Medium", "High", "Critical"]),
            "status": "open",
            "assigned_team": random.choice(["IT Support", "Network Team", "Security", "DevOps"]),
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "metadata": {"source": "loadtest", "severity": random.randint(1, 5)}
        }
        with self.client.post(
            "/tickets",
            json=ticket,
            headers=self.get_headers(),
            name="POST /tickets",
            catch_response=True
        ) as resp:
            if resp.status_code == 200:
                resp.success()
            elif resp.status_code in (401, 403):
                self.login()
                resp.failure("Unauthorized")
            else:
                resp.failure(f"Create ticket: {resp.status_code}")


class TicketAnalystUser(HttpUser):
    """
    Simulates a support agent analyzing tickets through AI.
    Tests: /ai/analyze_ticket, /ai/analyze, /health
    """
    wait_time = between(1, 3)

    def on_start(self):
        self.token = None
        self.login()

    def login(self):
        creds = {
            "email": f"analyst_{random.randint(1, 999999)}@example.com",
            "password": "AnalystPass456!"
        }
        with self.client.post(
            "/auth/login", json=creds,
            name="POST /auth/login (analyst)",
            catch_response=True
        ) as resp:
            if resp.status_code == 200:
                data = resp.json()
                self.token = data.get("token", data.get("access_token"))
                resp.success()
            else:
                # Try signup
                with self.client.post(
                    "/auth/signup", json=creds,
                    name="POST /auth/signup (analyst)",
                    catch_response=True
                ) as r2:
                    if r2.status_code in (200, 201):
                        data = r2.json()
                        self.token = data.get("token", data.get("access_token"))
                        r2.success()

    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(3)
    def health_check(self):
        with self.client.get("/health", name="GET /health", catch_response=True) as resp:
            if resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"Health: {resp.status_code}")

    @task(5)
    def analyze_ticket(self):
        """POST /ai/analyze_ticket — the critical AI endpoint."""
        ticket_texts = [
            "I cannot connect to the VPN from my home office. It keeps timing out.",
            "Our email server stopped sending notifications after the last update.",
            "The database keeps returning timeout errors during peak hours.",
            "A security certificate has expired and users are seeing warnings.",
            "File attachments over 25MB are failing to upload to the portal.",
            "The authentication service is returning 503 errors intermittently.",
        ]
        payload = {
            "text": random.choice(ticket_texts),
            "user_id": self.token or "loadtest",
            "company": "LoadTestCorp",
            "confidence_threshold": 0.20,
        }
        with self.client.post(
            "/ai/analyze_ticket",
            json=payload,
            headers=self._headers(),
            name="POST /ai/analyze_ticket",
            catch_response=True
        ) as resp:
            if resp.status_code == 200:
                resp.success()
            elif resp.status_code in (401, 403):
                self.login()
                resp.failure("Unauthorized")
            else:
                resp.failure(f"Analyze ticket: {resp.status_code}")

    @task(2)
    def analyze_only(self):
        """POST /ai/analyze — lightweight analysis endpoint."""
        payload = {
            "text": "User reports slow network performance after recent patch deployment.",
        }
        with self.client.post(
            "/ai/analyze",
            json=payload,
            headers=self._headers(),
            name="POST /ai/analyze",
            catch_response=True
        ) as resp:
            if resp.status_code == 200:
                resp.success()
            elif resp.status_code in (401, 403):
                resp.failure("Auth required")
            else:
                resp.failure(f"Analyze: {resp.status_code}")


class MixedWorkloadUser(HttpUser):
    """
    Simulates a realistic mixed workload: auth, tickets, and AI analysis.
    """
    wait_time = between(2, 5)
    host = "http://localhost:8000"

    def on_start(self):
        self.token = None
        self.user_id = None
        self._login()

    def _login(self):
        """Login and save token."""
        email = f"mixed_{random.randint(1, 999999)}@loadtest.com"
        with self.client.post(
            "/auth/signup",
            json={"email": email, "password": "MixedPass789!"},
            name="POST /auth/signup (mixed)",
            catch_response=True
        ) as resp:
            if resp.status_code in (200, 201):
                data = resp.json()
                self.token = data.get("token", data.get("access_token"))
                self.user_id = data.get("user_id", data.get("id"))
                resp.success()
            elif resp.status_code == 409:
                # Already exists, try login
                with self.client.post(
                    "/auth/login",
                    json={"email": email, "password": "MixedPass789!"},
                    name="POST /auth/login (mixed)",
                    catch_response=True
                ) as r2:
                    if r2.status_code == 200:
                        data = r2.json()
                        self.token = data.get("token", data.get("access_token"))
                        r2.success()

    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task
    def readiness(self):
        with self.client.get("/ready", name="GET /ready", catch_response=True) as resp:
            if resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"Readiness: {resp.status_code}")

    @task(3)
    def save_ticket(self):
        """POST /tickets/save — save analyzed ticket to database."""
        payload = {
            "user_id": self.user_id or "mixed_user",
            "subject": random.choice([
                "VPN timeout issue", "Email notification failure",
                "SSL certificate renewal", "Database performance degradation"
            ]),
            "description": random.choice([
                "User unable to establish VPN connection after password reset.",
                "Email notifications delayed by over 30 minutes.",
                "SSL certificate for api.internal.example.com expired yesterday.",
                "Queries timing out on the analytics dashboard during business hours."
            ]),
            "category": random.choice(["Access", "Network", "Security"]),
            "subcategory": random.choice(["VPN", "Email", "Certificate", "Database"]),
            "priority": random.choice(["High", "Medium"]),
            "assigned_team": random.choice(["IT Support", "Network Team"]),
            "status": "open",
            "auto_resolve": False,
            "is_duplicate": False,
            "confidence": round(random.uniform(0.75, 0.99), 2),
            "sla_breach_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 7200)),
            "metadata": {"source": "loadtest", "region": "us-east"},
            "entities": [],
            "solution_steps": [],
            "routing_confidence": round(random.uniform(0.7, 0.95), 2),
        }
        with self.client.post(
            "/tickets/save",
            json=payload,
            headers=self._headers(),
            name="POST /tickets/save",
            catch_response=True
        ) as resp:
            if resp.status_code in (200, 201):
                resp.success()
            else:
                resp.failure(f"Save ticket: {resp.status_code}")

    @task
    def get_ticket_by_id(self):
        """GET /tickets/{ticket_id} — retrieve specific ticket."""
        tid = f"LT-{random.randint(10000, 99999)}"
        with self.client.get(
            f"/tickets/{tid}",
            headers=self._headers(),
            name="GET /tickets/[id]",
            catch_response=True
        ) as resp:
            if resp.status_code in (200, 404):
                resp.success()
            else:
                resp.failure(f"Get ticket: {resp.status_code}")


# --- Report generation (standalone) ---
if __name__ == "__main__":
    print("Run with: locust -f locustfile.py --web-port 8089")
    print("Or headless: locust -f locustfile.py --headless -u 50 -r 10 --run-time 5m --host http://localhost:8000")
