import os
import sys
import types
import importlib.util
import pytest
from unittest.mock import MagicMock, patch

# Define shared mock objects to prevent ModuleNotFoundError on optional ML/caching libraries in test runs
def _get_or_create_mock(name):
    if name not in sys.modules:
        sys.modules[name] = MagicMock()
    return sys.modules[name]

# Mock redis
mock_redis = types.ModuleType("redis")
mock_redis.from_url = MagicMock()
sys.modules["redis"] = mock_redis

# Mock torch
mock_torch = _get_or_create_mock("torch")
mock_torch.device.return_value = "cpu"
mock_torch.cuda.is_available.return_value = False

# Ensure torch.max behaves correctly by default to prevent unpack errors in classifier/duplicate tests
def default_torch_max(tensor, dim=None, *args, **kwargs):
    val = MagicMock()
    val.item.return_value = 0
    idx = MagicMock()
    idx.item.return_value = 0
    return (val, idx)
mock_torch.max.side_effect = default_torch_max

_get_or_create_mock("torch.nn")

mock_f = _get_or_create_mock("torch.nn.functional")
def default_softmax(input, dim=None):
    return input
mock_f.softmax = default_softmax

_get_or_create_mock("transformers")

# sentence-transformers
mock_st = _get_or_create_mock("sentence_transformers")
mock_st.SentenceTransformer = MagicMock()
mock_st.util = MagicMock()

# Force test environment variables before anything is imported
os.environ["ALLOW_DEGRADED_STARTUP"] = "1"
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_SERVICE_KEY"] = "mockservicekey"
os.environ["SLA_ESCALATION_ENABLED"] = "false"

# Mock prometheus_fastapi_instrumentator to prevent duplicate timeseries registry errors
class MockInstrumentator:
    def __init__(self, *args, **kwargs):
        pass
    def add(self, *args, **kwargs):
        return self
    def instrument(self, *args, **kwargs):
        return self
    def expose(self, *args, **kwargs):
        return self

sys.modules["prometheus_fastapi_instrumentator"] = types.ModuleType("prometheus_fastapi_instrumentator")
sys.modules["prometheus_fastapi_instrumentator"].Instrumentator = MockInstrumentator
sys.modules["prometheus_fastapi_instrumentator"].metrics = MagicMock()

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
        self.offset_count = None
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

    def upsert(self, payload):
        rows = payload if isinstance(payload, list) else [payload]
        table_rows = self.db.setdefault(self.name, [])
        merged_rows = []
        for new_row in rows:
            match_index = None
            if new_row.get("company_id") is not None:
                for index, existing_row in enumerate(table_rows):
                    if existing_row.get("company_id") == new_row.get("company_id"):
                        match_index = index
                        break
            if match_index is None and new_row.get("id") is not None:
                for index, existing_row in enumerate(table_rows):
                    if existing_row.get("id") == new_row.get("id"):
                        match_index = index
                        break

            if match_index is None:
                table_rows.append(dict(new_row))
                merged_rows.append(table_rows[-1])
            else:
                table_rows[match_index].update(new_row)
                merged_rows.append(table_rows[match_index])

        self.inserted_rows = merged_rows
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

    def offset(self, value):
        self.offset_count = value
        return self

    def range(self, start, end):
        self.offset_count = start
        self.limit_count = max(end - start + 1, 0)
        return self

    def single(self):
        self.is_single = True
        return self

    def execute(self):
        if hasattr(self, "inserted_rows"):
            return FakeResult(self.inserted_rows)

        def _safe_eq(v1, v2):
            if v1 == v2:
                return True
            if v1 is None or v2 is None:
                return False
            if isinstance(v1, int) and isinstance(v2, str):
                try:
                    return v1 == int(v2)
                except ValueError:
                    return False
            if isinstance(v1, str) and isinstance(v2, int):
                try:
                    return int(v1) == v2
                except ValueError:
                    return False
            return False

        if self.payload is not None:
            rows = self.db.setdefault(self.name, [])
            updated_rows = []
            for row in rows:
                match = True
                for k, v in self.filters.items():
                    if not _safe_eq(row.get(k), v):
                        match = False
                        break
                if match:
                    row.update(self.payload)
                    updated_rows.append(row)
            return FakeResult(updated_rows)

        rows = list(self.db.get(self.name, []))
        for key, value in self.filters.items():
            rows = [row for row in rows if _safe_eq(row.get(key), value)]

        if self.order_field:
            rows.sort(key=lambda x: x.get(self.order_field, ""), reverse=self.order_desc)

        if self.offset_count is not None:
            rows = rows[self.offset_count:]

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
    class _LimiterStub:
        def __init__(self, *args, **kwargs):
            pass

        def limit(self, *args, **kwargs):
            def decorator(func):
                return func

            return decorator

    class _InstrumentatorStub:
        def __init__(self, *args, **kwargs):
            pass

        def instrument(self, *args, **kwargs):
            return self

        def expose(self, *args, **kwargs):
            return self

        def add(self, *args, **kwargs):
            return self

    class _CollectorRegistryStub:
        pass

    class _RateLimitExceededStub(Exception):
        pass

    class _MetricsStub:
        def __getattr__(self, _name):
            return lambda *args, **kwargs: None

    class _AsyncIOSchedulerStub:
        def add_job(self, *args, **kwargs):
            return None

        def start(self):
            return None

    class _CronTriggerStub:
        def __init__(self, *args, **kwargs):
            pass

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
        "slowapi": _make_stub_module(
            "slowapi",
            {"Limiter": _LimiterStub, "_rate_limit_exceeded_handler": lambda *args, **kwargs: None},
        ),
        "slowapi.util": _make_stub_module(
            "slowapi.util",
            {"get_remote_address": lambda *args, **kwargs: "127.0.0.1"},
        ),
        "slowapi.errors": _make_stub_module(
            "slowapi.errors",
            {"RateLimitExceeded": _RateLimitExceededStub},
        ),
        "prometheus_client": _make_stub_module(
            "prometheus_client",
            {
                "generate_latest": lambda *args, **kwargs: b"",
                "CONTENT_TYPE_LATEST": "text/plain; version=0.0.4",
                "CollectorRegistry": _CollectorRegistryStub,
                "REGISTRY": object(),
            },
        ),
        "prometheus_fastapi_instrumentator": _make_stub_module(
            "prometheus_fastapi_instrumentator",
            {
                "Instrumentator": _InstrumentatorStub,
                "metrics": _MetricsStub(),
            },
        ),
        "apscheduler": _make_stub_module(
            "apscheduler",
            {},
        ),
        "apscheduler.schedulers": _make_stub_module(
            "apscheduler.schedulers",
            {},
        ),
        "apscheduler.schedulers.asyncio": _make_stub_module(
            "apscheduler.schedulers.asyncio",
            {"AsyncIOScheduler": _AsyncIOSchedulerStub},
        ),
        "apscheduler.triggers": _make_stub_module(
            "apscheduler.triggers",
            {},
        ),
        "apscheduler.triggers.cron": _make_stub_module(
            "apscheduler.triggers.cron",
            {"CronTrigger": _CronTriggerStub},
        ),
        "fcntl": _make_stub_module(
            "fcntl",
            {
                "LOCK_EX": 0,
                "LOCK_UN": 0,
                "flock": lambda *args, **kwargs: None,
            },
        ),
        "encryption": _make_stub_module(
            "encryption",
            {
                "encrypt_pii": lambda value, *args, **kwargs: value,
                "decrypt_pii": lambda value, *args, **kwargs: value,
                "is_encrypted": lambda *_args, **_kwargs: False,
            },
        ),
    }

    for module_name, stub_module in stubs.items():
        if module_name.startswith("backend."):
            should_stub = module_name not in sys.modules
        elif module_name == "encryption":
            try:
                crypto_missing = importlib.util.find_spec("Crypto") is None
            except ModuleNotFoundError:
                crypto_missing = True
            should_stub = module_name not in sys.modules and crypto_missing
        elif module_name in sys.modules:
            should_stub = False
        else:
            try:
                spec_missing = importlib.util.find_spec(module_name) is None
            except (ModuleNotFoundError, ValueError):
                spec_missing = True
            should_stub = module_name not in sys.modules and spec_missing

        if should_stub:
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
                "company": "Company A",
                "role": "user",
            },
            {
                "id": "user_B",
                "company_id": "company_B",
                "company": "Company B",
                "role": "user",
            }
        ],
        "tickets": [],
        "ticket_messages": [],
        "audit_logs": []
    }


@pytest.fixture
def fake_supabase(fake_db):
    from backend.auth.crypto import wrap_client
    return wrap_client(FakeSupabase(fake_db))


@pytest.fixture(autouse=True)
def mock_ai_services(request):
    if request.node.fspath.basename in {
        "test_redis_cache.py",
        "test_semantic_duplicates.py",
        "test_auth_cookie.py",
        "test_mobile_supabase_env.py",
        "test_sla_service.py",
        "test_sla_engine.py",
        "test_language_pipeline.py",
        "test_sla_predictor.py",
        "test_webhook_service.py",
        "test_knowledge_gap_service.py",
        "test_metrics_service.py",
        "test_audit_service.py",
        "test_correction_log_async.py",
        "test_notification_routing.py",
        "test_notification_routing_push.py",
        "test_notification_routing_admin_alert.py",
        "test_spam_detector.py",
        "test_spam_detector_service.py",
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
