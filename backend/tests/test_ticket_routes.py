import types


class FakeTableQuery:
    def __init__(self, supabase, table_name):
        self.supabase = supabase
        self.table_name = table_name
        self.filters = {}
        self.insert_payload = None

    def select(self, *_args):
        return self

    def order(self, *_args, **_kwargs):
        return self

    def eq(self, key, value):
        self.filters[key] = value
        return self

    def single(self):
        return self

    def insert(self, payload):
        self.insert_payload = payload
        self.supabase.inserts.setdefault(self.table_name, []).append(payload)
        return self

    def execute(self):
        if self.table_name == "profiles":
            return types.SimpleNamespace(data=self.supabase.profile)
        if self.table_name == "system_settings":
            return types.SimpleNamespace(data=self.supabase.system_settings)
        if self.table_name == "tickets" and self.insert_payload is not None:
            return types.SimpleNamespace(data=[{"id": "ticket-1"}])
        if self.table_name == "ticket_messages" and self.insert_payload is not None:
            return types.SimpleNamespace(data=[{"id": "message-1"}])
        return types.SimpleNamespace(data=[])


class FakeRpcQuery:
    def __init__(self, supabase, name, params):
        self.supabase = supabase
        self.name = name
        self.params = params

    def execute(self):
        self.supabase.rpc_calls.append((self.name, self.params))
        return types.SimpleNamespace(data=[{"id": "ticket-1", "company_id": self.params["company_id"]}])


class FakeSupabase:
    def __init__(self, profile=None, system_settings=None):
        self.profile = profile or {}
        self.system_settings = system_settings or {}
        self.inserts = {}
        self.rpc_calls = []

    def table(self, table_name):
        return FakeTableQuery(self, table_name)

    def rpc(self, name, params):
        return FakeRpcQuery(self, name, params)


def valid_ticket_payload(**overrides):
    payload = {
        "user_id": "user-1",
        "subject": "VPN outage",
        "description": "VPN disconnects every few minutes",
        "category": "Network",
        "subcategory": "VPN",
        "priority": "High",
        "assigned_team": "Network Support",
        "status": "Open",
        "auto_resolve": False,
        "is_duplicate": False,
        "confidence": 0.91,
        "company": None,
        "company_id": None,
        "description_vector": None,
        "is_potential_duplicate": False,
        "parent_ticket_id": None,
        "sla_response_due_at": None,
        "sla_breach_at": "2026-01-02T00:00:00Z",
        "sla_status": None,
        "escalation_level": 0,
        "metadata": {},
        "entities": [{"text": "VPN", "label": "SYSTEM", "confidence": 0.95}],
        "solution_steps": ["Restart VPN client"],
        "ocr_text": "",
        "needs_review": True,
        "routing_confidence": 0.82,
    }
    payload.update(overrides)
    return payload


def test_search_tickets_requires_company_id(client, backend_main):
    backend_main.supabase = FakeSupabase()

    response = client.get("/tickets/search?q=vpn")

    assert response.status_code == 400
    assert response.json()["detail"] == "company_id is required for tenant-safe search"


def test_search_tickets_scopes_rpc_by_company_id(client, backend_main):
    fake_supabase = FakeSupabase()
    backend_main.supabase = fake_supabase

    response = client.get("/tickets/search?q=vpn&company_id=company-1&limit=5&offset=10")

    assert response.status_code == 200
    assert fake_supabase.rpc_calls == [
        (
            "search_tickets",
            {
                "query_text": "vpn",
                "company_id": "company-1",
                "limit_rows": 5,
                "offset_rows": 10,
            },
        )
    ]


def test_save_ticket_returns_403_for_profile_company_mismatch(client, backend_main):
    backend_main.supabase = FakeSupabase(profile={"company_id": "company-a", "company": "Company A"})

    response = client.post("/tickets/save", json=valid_ticket_payload(company_id="company-b"))

    assert response.status_code == 403
    assert response.json()["detail"] == "User not authorized for this tenant"


def test_save_ticket_backfills_tenant_and_preserves_ai_metadata(client, backend_main):
    fake_supabase = FakeSupabase(
        profile={"company_id": "company-a", "company": "Company A"},
        system_settings={"duplicate_sensitivity": 0.7},
    )
    backend_main.supabase = fake_supabase

    response = client.post("/tickets/save", json=valid_ticket_payload())

    assert response.status_code == 200
    assert response.json()["ticket_id"] == "ticket-1"
    saved_ticket = fake_supabase.inserts["tickets"][0]
    assert saved_ticket["company_id"] == "company-a"
    assert saved_ticket["company"] == "Company A"
    assert saved_ticket["metadata"]["entities"] == [{"text": "VPN", "label": "SYSTEM", "confidence": 0.95}]
    assert saved_ticket["metadata"]["solution_steps"] == ["Restart VPN client"]
    assert saved_ticket["metadata"]["needs_review"] is True
    assert saved_ticket["metadata"]["routing_confidence"] == 0.82
    assert fake_supabase.inserts["ticket_messages"][0]["ticket_id"] == "ticket-1"
