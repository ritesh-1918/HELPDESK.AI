import importlib
import datetime as dt
import sys
import types

import pytest
from fastapi.testclient import TestClient


def _install_slowapi_stub():
    slowapi = types.ModuleType("slowapi")

    class Limiter:
        def __init__(self, *args, **kwargs):
            pass

        def limit(self, *args, **kwargs):
            def decorator(func):
                return func

            return decorator

    slowapi.Limiter = Limiter
    slowapi._rate_limit_exceeded_handler = lambda *args, **kwargs: None

    util = types.ModuleType("slowapi.util")
    util.get_remote_address = lambda request: "127.0.0.1"

    errors = types.ModuleType("slowapi.errors")

    class RateLimitExceeded(Exception):
        pass

    errors.RateLimitExceeded = RateLimitExceeded

    sys.modules["slowapi"] = slowapi
    sys.modules["slowapi.util"] = util
    sys.modules["slowapi.errors"] = errors


def _install_dotenv_stub():
    dotenv = types.ModuleType("dotenv")
    dotenv.load_dotenv = lambda *args, **kwargs: None
    sys.modules["dotenv"] = dotenv


def _install_service_stubs():
    classifier_service = types.ModuleType("backend.services.classifier_service")

    class ClassifierService:
        def load(self):
            pass

        def predict(self, text):
            return {
                "category": "Network",
                "subcategory": "VPN",
                "priority": "High",
                "confidence": 0.92,
                "needs_review": False,
                "routing_confidence": 0.9,
            }

    classifier_service.ClassifierService = ClassifierService

    classifier_v2 = types.ModuleType("backend.services.classifier_v2")
    classifier_v2.classifier_v2 = ClassifierService()

    classifier_v3 = types.ModuleType("backend.services.classifier_v3")
    classifier_v3.classifier_v3 = ClassifierService()

    ner_service = types.ModuleType("backend.services.ner_service")

    class NERService:
        def load(self):
            pass

        def extract_entities(self, text):
            return []

    ner_service.NERService = NERService

    duplicate_service = types.ModuleType("backend.services.duplicate_service")

    class DuplicateService:
        def load(self):
            pass

        def is_available(self):
            return True

        def find_semantic_duplicate(self, text, threshold, company_id=None, supabase_client=None):
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "parent_ticket_id": None,
                "is_potential_duplicate": False,
                "similarity": 0.0,
            }

        def check_duplicate(self, text, threshold=0.85):
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
            }

        def generate_embedding(self, text):
            return [0.1, 0.2, 0.3]

        def add_ticket(self, ticket_id, text):
            pass

    duplicate_service.DuplicateService = DuplicateService

    rag_service = types.ModuleType("backend.services.rag_service")

    class RagService:
        def load(self):
            pass

        def is_available(self):
            return True

    rag_service.RagService = RagService

    sla_service = types.ModuleType("backend.services.sla_service")
    sla_service.calculate_sla_response_at = lambda priority: dt.datetime(2026, 1, 1, tzinfo=dt.timezone.utc)
    sla_service.calculate_sla_breach_at = lambda priority: dt.datetime(2026, 1, 2, tzinfo=dt.timezone.utc)
    sla_service.classify_sla_status = lambda value: "on_track"
    sla_service.load = lambda: None
    sla_service.run_sla_escalation_loop = lambda *args, **kwargs: None

    for name, module in {
        "backend.services.classifier_service": classifier_service,
        "backend.services.classifier_v2": classifier_v2,
        "backend.services.classifier_v3": classifier_v3,
        "backend.services.ner_service": ner_service,
        "backend.services.duplicate_service": duplicate_service,
        "backend.services.rag_service": rag_service,
        "backend.services.sla_service": sla_service,
    }.items():
        sys.modules[name] = module


@pytest.fixture()
def backend_main(monkeypatch):
    _install_slowapi_stub()
    _install_dotenv_stub()
    _install_service_stubs()
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_KEY", raising=False)
    sys.modules.pop("backend.main", None)
    return importlib.import_module("backend.main")


@pytest.fixture()
def client(backend_main):
    return TestClient(backend_main.app)
