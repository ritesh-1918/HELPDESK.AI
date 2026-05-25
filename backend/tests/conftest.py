import os
import sys
import types
import pytest
from unittest.mock import MagicMock, patch

# Force test environment variables before anything is imported
os.environ["ALLOW_DEGRADED_STARTUP"] = "1"
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_SERVICE_KEY"] = "mockservicekey"
os.environ["SLA_ESCALATION_ENABLED"] = "false"

# Ensure root directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))


class FakeResult:
    def __init__(self, data=None):
        self.data = data or []


class FakeTable:
    def __init__(self, db, name):
        self.db = db
        self.name = name
        self.filters = {}
        self.payload = None
        self.limit_count = None
        self.is_single = False
        self.order_field = None
        self.order_desc = False

    def select(self, *_args):
        return self

    def update(self, payload):
        self.payload = payload
        return self

    def insert(self, payload):
        rows = payload if isinstance(payload, list) else [payload]
        for r in rows:
            if "id" not in r:
                r["id"] = len(self.db.get(self.name, [])) + 1
        self.db.setdefault(self.name, []).extend(rows)
        self.inserted_rows = rows
        return self

    def eq(self, field, value):
        self.filters[field] = value
        return self

    def order(self, field, desc=False):
        self.order_field = field
        self.order_desc = desc
        return self

    def limit(self, value):
        self.limit_count = value
        return self

    def single(self):
        self.is_single = True
        return self

    def execute(self):
        if hasattr(self, "inserted_rows"):
            return FakeResult(self.inserted_rows)

        if self.payload is not None:
            rows = self.db.setdefault(self.name, [])
            updated_rows = []
            for row in rows:
                match = True
                for k, v in self.filters.items():
                    if row.get(k) != v:
                        match = False
                        break
                if match:
                    row.update(self.payload)
                    updated_rows.append(row)
            return FakeResult(updated_rows)

        rows = list(self.db.get(self.name, []))
        for key, value in self.filters.items():
            rows = [row for row in rows if row.get(key) == value]

        if self.order_field:
            rows.sort(key=lambda x: x.get(self.order_field, ""), reverse=self.order_desc)

        if self.limit_count is not None:
            rows = rows[:self.limit_count]

        if self.is_single:
            return FakeResult(rows[0] if rows else None)
        return FakeResult(rows)


class FakeSupabase:
    def __init__(self, db):
        self.db = db

    def table(self, name):
        return FakeTable(self.db, name)

    def rpc(self, name, params):
        # Mock simple search matching logic
        query = params.get("query_text", "").lower()
        company_id = params.get("company_id")
        
        matching = []
        tickets = self.db.get("tickets", [])
        for t in tickets:
            if company_id and t.get("company_id") != company_id:
                continue
            if query in str(t.get("subject", "")).lower() or query in str(t.get("description", "")).lower():
                matching.append(t)
        
        class RpcMock:
            def execute(self):
                return FakeResult(matching)
        return RpcMock()


def _make_stub_module(name, attrs):
    mod = types.ModuleType(name)
    for key, value in attrs.items():
        setattr(mod, key, value)
    return mod


def _install_optional_ml_stubs():
    # Provide import-safe stand-ins for optional ML modules used by backend.main.
    class _BaseStub:
        def __init__(self):
            self._loaded = True

        def load(self):
            self._loaded = True

    class _ClassifierStub(_BaseStub):
        def predict(self, _text):
            return {
                "category": "Software",
                "subcategory": "Software Install",
                "priority": "Medium",
                "auto_resolve": True,
                "assigned_team": "Application Support",
                "confidence": 0.95,
            }

    class _ClassifierV3Stub:
        def predict(self, _text):
            return {
                "Category": {"prediction": "Software", "confidence": 0.95},
                "Subcategory": {"prediction": "Software Install", "confidence": 0.95},
                "priority": {"prediction": "Medium", "confidence": 0.95},
            }

    class _NERStub(_BaseStub):
        def extract_entities(self, _text):
            return [{"text": "VPN", "label": "PRODUCT", "confidence": 0.99}]

    class _DuplicateStub(_BaseStub):
        def find_semantic_duplicate(self, *_args, **_kwargs):
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "parent_ticket_id": None,
                "is_potential_duplicate": False,
                "similarity": 0.0,
            }

        def check_duplicate(self, *_args, **_kwargs):
            return self.find_semantic_duplicate()

        def generate_embedding(self, *_args, **_kwargs):
            return [0.1] * 384

        def add_ticket(self, *_args, **_kwargs):
            return None

        def is_available(self):
            return True

    class _RagStub(_BaseStub):
        def search_knowledge_base(self, *_args, **_kwargs):
            return None

        def is_available(self):
            return True

    stubs = {
        "backend.services.classifier_service": _make_stub_module(
            "backend.services.classifier_service",
            {
                "ClassifierService": _ClassifierStub,
                "TEAM_MAP": {"Software": "Application Support"},
                "AUTO_RESOLVE_SUBS": {"Software Install"},
            },
        ),
        "backend.services.classifier_v3": _make_stub_module(
            "backend.services.classifier_v3",
            {"classifier_v3": _ClassifierV3Stub()},
        ),
        "backend.services.ner_service": _make_stub_module(
            "backend.services.ner_service",
            {"NERService": _NERStub},
        ),
        "backend.services.duplicate_service": _make_stub_module(
            "backend.services.duplicate_service",
            {"DuplicateService": _DuplicateStub},
        ),
        "backend.services.rag_service": _make_stub_module(
            "backend.services.rag_service",
            {"RagService": _RagStub},
        ),
    }

    for module_name, stub_module in stubs.items():
        if module_name not in sys.modules:
            sys.modules[module_name] = stub_module


_install_optional_ml_stubs()


@pytest.fixture
def fake_db():
    return {
        "system_settings": [
            {
                "company_id": "company_A",
                "ai_confidence_threshold": 0.80,
                "duplicate_sensitivity": 0.85,
                "enable_auto_resolve": True
            },
            {
                "company_id": "company_B",
                "ai_confidence_threshold": 0.80,
                "duplicate_sensitivity": 0.85,
                "enable_auto_resolve": True
            }
        ],
        "profiles": [
            {
                "id": "user_A",
                "company_id": "company_A",
                "company": "Company A"
            },
            {
                "id": "user_B",
                "company_id": "company_B",
                "company": "Company B"
            }
        ],
        "tickets": [],
        "ticket_messages": [],
        "audit_logs": []
    }


@pytest.fixture
def fake_supabase(fake_db):
    return FakeSupabase(fake_db)


@pytest.fixture(autouse=True)
def mock_ai_services(request):
    if request.node.fspath.basename in {
        "test_redis_cache.py",
        "test_semantic_duplicates.py",
        "test_auth_cookie.py",
    }:
        yield
        return

    import backend.main as main

    with patch.object(main.classifier_service, "predict") as mock_v1_predict, \
         patch.object(main.classifier_service, "load") as mock_v1_load, \
         patch.object(main.classifier_v3, "predict") as mock_v3_predict, \
         patch.object(main.ner_service, "extract_entities") as mock_ner_extract, \
         patch.object(main.ner_service, "load") as mock_ner_load, \
         patch.object(main.duplicate_service, "find_semantic_duplicate") as mock_dup_find, \
         patch.object(main.duplicate_service, "check_duplicate") as mock_dup_check, \
         patch.object(main.duplicate_service, "generate_embedding") as mock_dup_emb, \
         patch.object(main.duplicate_service, "load") as mock_dup_load, \
         patch.object(main.rag_service, "search_knowledge_base") as mock_rag_search, \
         patch.object(main.rag_service, "load") as mock_rag_load:

        # Stub default returns
        mock_v1_predict.return_value = {
            "category": "Software",
            "subcategory": "Software Install",
            "priority": "Medium",
            "auto_resolve": True,
            "assigned_team": "Application Support",
            "confidence": 0.95,
        }
        mock_v3_predict.return_value = {
            "Category": {"prediction": "Software", "confidence": 0.95},
            "Subcategory": {"prediction": "Software Install", "confidence": 0.95},
            "priority": {"prediction": "Medium", "confidence": 0.95},
        }
        mock_ner_extract.return_value = [
            {"text": "VPN", "label": "PRODUCT", "confidence": 0.99}
        ]
        mock_dup_find.return_value = {
            "is_duplicate": False,
            "duplicate_ticket_id": None,
            "parent_ticket_id": None,
            "is_potential_duplicate": False,
            "similarity": 0.0,
        }
        mock_dup_check.return_value = mock_dup_find.return_value
        mock_dup_emb.return_value = [0.1] * 384
        mock_rag_search.return_value = None

        yield


@pytest.fixture
def test_client(fake_supabase):
    with patch("backend.main.supabase", fake_supabase):
        from fastapi.testclient import TestClient
        from backend.main import app
        # Ensure ALLOW_DEGRADED_STARTUP is set during client initialization
        with patch.dict(os.environ, {"ALLOW_DEGRADED_STARTUP": "1"}):
            with TestClient(app) as client:
                yield client
