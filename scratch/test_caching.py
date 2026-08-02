import sys
from unittest.mock import MagicMock

# Create mock modules to bypass heavy dependencies during testing
class MockModule(MagicMock):
    @property
    def __all__(self):
        return []

# Mock system dependencies
sys.modules['torch'] = MockModule()
sys.modules['torch.nn'] = MockModule()
sys.modules['torch.nn.functional'] = MockModule()
sys.modules['transformers'] = MockModule()
sys.modules['easyocr'] = MockModule()

# Mock Redis module and its exceptions
class MockRedisError(Exception):
    pass

class MockConnectionError(MockRedisError):
    pass

class MockTimeoutError(MockRedisError):
    pass

mock_redis_mod = MockModule()
mock_redis_client = MagicMock()
mock_redis_mod.from_url.return_value = mock_redis_client

mock_exceptions = MockModule()
mock_exceptions.RedisError = MockRedisError
mock_exceptions.ConnectionError = MockConnectionError
mock_exceptions.TimeoutError = MockTimeoutError
sys.modules['redis.exceptions'] = mock_exceptions
mock_redis_mod.exceptions = mock_exceptions

sys.modules['redis'] = mock_redis_mod

# Mock FastAPI & slowapi dependencies
mock_fastapi = MockModule()

class MockState:
    pass

class MockFastAPI:
    def __init__(self, *args, **kwargs):
        self.state = MockState()
    def get(self, *args, **kwargs):
        return lambda func: func
    def post(self, *args, **kwargs):
        return lambda func: func
    def patch(self, *args, **kwargs):
        return lambda func: func
    def put(self, *args, **kwargs):
        return lambda func: func
    def delete(self, *args, **kwargs):
        return lambda func: func
    def middleware(self, *args, **kwargs):
        return lambda func: func
    def exception_handler(self, *args, **kwargs):
        return lambda func: func
    def add_exception_handler(self, *args, **kwargs):
        pass
    def add_middleware(self, *args, **kwargs):
        pass

mock_fastapi.FastAPI = MockFastAPI

class MockHTTPException(Exception):
    def __init__(self, status_code, detail=None):
        self.status_code = status_code
        self.detail = detail
mock_fastapi.HTTPException = MockHTTPException
mock_fastapi.Request = MagicMock
mock_fastapi.Response = MagicMock
sys.modules['fastapi'] = mock_fastapi

# Mock slowapi Limiter to act as identity decorator
class MockLimiter:
    def __init__(self, **kwargs):
        pass
    def limit(self, *args, **kwargs):
        return lambda func: func

mock_slowapi = MockModule()
mock_slowapi.Limiter = MockLimiter
mock_slowapi._rate_limit_exceeded_handler = MagicMock
sys.modules['slowapi'] = mock_slowapi

mock_slowapi_util = MockModule()
mock_slowapi_util.get_remote_address = MagicMock
sys.modules['slowapi.util'] = mock_slowapi_util

mock_slowapi_errors = MockModule()
mock_slowapi_errors.RateLimitExceeded = MockHTTPException
sys.modules['slowapi.errors'] = mock_slowapi_errors

mock_cors = MockModule()
mock_cors.CORSMiddleware = MagicMock
sys.modules['fastapi.middleware.cors'] = mock_cors

mock_responses = MockModule()
mock_responses.HTMLResponse = MagicMock
mock_responses.JSONResponse = MagicMock
mock_responses.StreamingResponse = MagicMock
sys.modules['fastapi.responses'] = mock_responses

mock_encoders = MockModule()
mock_encoders.jsonable_encoder = lambda x: x
sys.modules['fastapi.encoders'] = mock_encoders

# Mock Pydantic
class MockBaseModel:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
    def dict(self):
        return self.__dict__
mock_pydantic = MockModule()
mock_pydantic.BaseModel = MockBaseModel
sys.modules['pydantic'] = mock_pydantic

# Mock database & other service modules
sys.modules['supabase'] = MockModule()
sys.modules['storage3'] = MockModule()

# Mock internal services to isolate caching tests
sys.modules['backend.services.classifier_service'] = MockModule()
sys.modules['backend.services.classifier_v2'] = MockModule()
sys.modules['backend.services.ner_service'] = MockModule()
sys.modules['backend.services.duplicate_service'] = MockModule()
sys.modules['backend.services.rag_service'] = MockModule()
sys.modules['backend.services.ocr_service'] = MockModule()
sys.modules['backend.services.email_service'] = MockModule()

import unittest
import json
import os
import asyncio

# Put project root on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set default env variable so backend initializes with it
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

# Import the backend app
import backend.main as main

class TestRedisCaching(unittest.TestCase):
    def setUp(self):
        # Save original clients to restore after tests
        self.orig_redis = main.redis_client
        self.orig_supabase = main.supabase
        self.orig_tickets_db = list(main.TICKETS_DB)
        self.orig_duplicate_service = main.duplicate_service
        
        # Create mocks
        self.mock_redis = MagicMock()
        self.mock_supabase = MagicMock()
        self.mock_duplicate_service = MagicMock()
        
        main.redis_client = self.mock_redis
        main.supabase = self.mock_supabase
        main.duplicate_service = self.mock_duplicate_service
        main.TICKETS_DB.clear()

    def tearDown(self):
        # Restore original clients
        main.redis_client = self.orig_redis
        main.supabase = self.orig_supabase
        main.TICKETS_DB = self.orig_tickets_db
        main.duplicate_service = self.orig_duplicate_service

    def test_get_system_settings_cache_hit(self):
        # Set up mock cache hit
        cached_data = {
            "ai_confidence_threshold": 0.8,
            "duplicate_sensitivity": 0.5,
            "enable_auto_resolve": True
        }
        self.mock_redis.get.return_value = json.dumps(cached_data)
        
        # Call function
        res = main.get_system_settings("comp_123")
        
        # Verify
        self.assertEqual(res["ai_confidence_threshold"], 0.8)
        self.mock_redis.get.assert_called_once_with("system_settings:comp_123")
        self.mock_supabase.table.assert_not_called()

    def test_get_system_settings_cache_miss(self):
        # Cache miss
        self.mock_redis.get.return_value = None
        
        # Supabase response mock
        mock_response = MagicMock()
        mock_response.data = {
            "ai_confidence_threshold": 0.7,
            "duplicate_sensitivity": 0.6,
            "enable_auto_resolve": False
        }
        
        # Mock supabase execution chain
        table_mock = MagicMock()
        select_mock = MagicMock()
        eq_mock = MagicMock()
        single_mock = MagicMock()
        
        self.mock_supabase.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq_mock
        eq_mock.single.return_value = single_mock
        single_mock.execute.return_value = mock_response
        
        # Call function
        res = main.get_system_settings("comp_123")
        
        # Verify
        self.assertEqual(res["ai_confidence_threshold"], 0.7)
        self.mock_redis.get.assert_called_once_with("system_settings:comp_123")
        self.mock_redis.setex.assert_called_once_with("system_settings:comp_123", 300, json.dumps(res))

    def test_get_system_settings_fallback_when_redis_none(self):
        # Mock Redis client as None
        main.redis_client = None
        
        # Supabase response mock
        mock_response = MagicMock()
        mock_response.data = {
            "ai_confidence_threshold": 0.9,
            "duplicate_sensitivity": 0.4,
            "enable_auto_resolve": True
        }
        
        table_mock = MagicMock()
        select_mock = MagicMock()
        eq_mock = MagicMock()
        single_mock = MagicMock()
        
        self.mock_supabase.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq_mock
        eq_mock.single.return_value = single_mock
        single_mock.execute.return_value = mock_response
        
        # Call function
        res = main.get_system_settings("comp_123")
        
        # Verify
        self.assertEqual(res["ai_confidence_threshold"], 0.9)
        self.mock_redis.get.assert_not_called()

    def test_get_tickets_cache_hit(self):
        cached_tickets = [{"id": "t1", "subject": "Test ticket"}]
        self.mock_redis.get.return_value = json.dumps(cached_tickets)
        
        # Call function (async function)
        res = asyncio.run(main.get_tickets("comp_123"))
        
        # Verify
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["id"], "t1")
        self.mock_redis.get.assert_called_once_with("tickets:list:comp_123")
        self.mock_supabase.table.assert_not_called()

    def test_get_ticket_by_id_cache_hit(self):
        cached_ticket = {"id": "t1", "subject": "Test ticket"}
        self.mock_redis.get.return_value = json.dumps(cached_ticket)
        
        res = asyncio.run(main.get_ticket_by_id("t1"))
        
        # Verify
        self.assertEqual(res["id"], "t1")
        self.mock_redis.get.assert_called_once_with("tickets:detail:t1")
        self.mock_supabase.table.assert_not_called()

    def test_save_ticket_invalidates_cache(self):
        # We need to mock TicketSaveRequest
        from backend.main import TicketSaveRequest
        payload = TicketSaveRequest(
            user_id="843dfe99-70dd-4283-8eaf-c1bc70047b59",
            subject="Test Subject",
            description="Test Description",
            category="Software",
            subcategory="General",
            priority="Low",
            assigned_team="Software Team",
            status="pending",
            auto_resolve=False,
            is_duplicate=False,
            confidence=0.95,
            company="RITESH PVT LTD",
            company_id="76d16bf6-2ee9-44ad-b64e-ad5ecf0a079b",
            is_potential_duplicate=False,
            parent_ticket_id=None,
            sla_breach_at="2026-06-01T00:00:00Z",
            routing_confidence=0.95,
            metadata={}
        )
        
        # Mock profile query
        profile_res = MagicMock()
        profile_res.data = {"company_id": "76d16bf6-2ee9-44ad-b64e-ad5ecf0a079b", "company": "RITESH PVT LTD"}
        
        # Mock ticket insert response
        ticket_insert_res = MagicMock()
        ticket_insert_res.data = [{"id": "ticket_new_123"}]
        
        # Mock message insert response
        msg_insert_res = MagicMock()
        msg_insert_res.data = [{"id": "msg_123"}]
        
        # Mock table calls by name
        def table_side_effect(name):
            mock_table_obj = MagicMock()
            if name == "profiles":
                mock_table_obj.select.return_value.eq.return_value.single.return_value.execute.return_value = profile_res
            elif name == "tickets":
                mock_table_obj.insert.return_value.execute.return_value = ticket_insert_res
            elif name == "ticket_messages":
                mock_table_obj.insert.return_value.execute.return_value = msg_insert_res
            return mock_table_obj
            
        self.mock_supabase.table.side_effect = table_side_effect
        
        # Call save_ticket
        res = asyncio.run(main.save_ticket(payload))
        
        # Verify ticket was successfully returned
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["ticket_id"], "ticket_new_123")
        
        # Verify redis cache invalidation deletes the correct list keys
        self.mock_redis.delete.assert_called_once_with("tickets:list:all", "tickets:list:76d16bf6-2ee9-44ad-b64e-ad5ecf0a079b")

    def test_update_ticket_invalidates_cache(self):
        from backend.main import TicketRecord
        test_ticket = TicketRecord(
            ticket_id="ticket_123",
            owner_id="owner_1",
            company_id="comp_123",
            subject="Original Subject",
            description="Desc",
            category="Software",
            subcategory="General",
            priority="Low",
            assigned_team="Software Team",
            status="pending",
            auto_resolve=False,
            is_duplicate=False,
            confidence=0.95,
            sla_breach_at="2026-06-01T00:00:00Z",
            routing_confidence=0.95,
            metadata={}
        )
        main.TICKETS_DB.append(test_ticket)
        
        # Mock keys in redis
        self.mock_redis.keys.return_value = ["tickets:list:all", "tickets:list:comp_123"]
        
        # Call update_ticket
        res = asyncio.run(main.update_ticket("ticket_123", {"status": "resolved"}))
        
        # Verify result is updated
        self.assertEqual(res.status, "resolved")
        # Verify redis cache invalidation called
        self.mock_redis.delete.assert_any_call("tickets:detail:ticket_123")
        self.mock_redis.delete.assert_any_call("tickets:list:all", "tickets:list:comp_123")

    def test_get_system_settings_graceful_fallback_on_redis_connection_error(self):
        import redis
        self.mock_redis.get.side_effect = redis.exceptions.ConnectionError("Connection refused")
        
        # Supabase response mock
        mock_response = MagicMock()
        mock_response.data = {
            "ai_confidence_threshold": 0.7,
            "duplicate_sensitivity": 0.6,
            "enable_auto_resolve": False
        }
        
        table_mock = MagicMock()
        select_mock = MagicMock()
        eq_mock = MagicMock()
        single_mock = MagicMock()
        
        self.mock_supabase.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq_mock
        eq_mock.single.return_value = single_mock
        single_mock.execute.return_value = mock_response
        
        res = main.get_system_settings("comp_123")
        
        self.assertEqual(res["ai_confidence_threshold"], 0.7)
        self.mock_redis.get.assert_called_once_with("system_settings:comp_123")

    def test_get_system_settings_graceful_fallback_on_redis_write_error(self):
        import redis
        self.mock_redis.get.return_value = None
        self.mock_redis.setex.side_effect = redis.exceptions.ConnectionError("Connection refused")
        
        # Supabase response mock
        mock_response = MagicMock()
        mock_response.data = {
            "ai_confidence_threshold": 0.7,
            "duplicate_sensitivity": 0.6,
            "enable_auto_resolve": False
        }
        
        table_mock = MagicMock()
        select_mock = MagicMock()
        eq_mock = MagicMock()
        single_mock = MagicMock()
        
        self.mock_supabase.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq_mock
        eq_mock.single.return_value = single_mock
        single_mock.execute.return_value = mock_response
        
        res = main.get_system_settings("comp_123")
        
        self.assertEqual(res["ai_confidence_threshold"], 0.7)
        self.mock_redis.get.assert_called_once_with("system_settings:comp_123")
        self.mock_redis.setex.assert_called_once()

    def test_get_tickets_graceful_fallback_on_redis_connection_error(self):
        import redis
        self.mock_redis.get.side_effect = redis.exceptions.ConnectionError("Connection refused")
        
        mock_response = MagicMock()
        mock_response.data = [{"id": "t1", "subject": "Test ticket"}]
        
        table_mock = MagicMock()
        select_mock = MagicMock()
        order_mock = MagicMock()
        eq_mock = MagicMock()
        
        self.mock_supabase.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.order.return_value = order_mock
        order_mock.eq.return_value = eq_mock
        eq_mock.execute.return_value = mock_response
        
        res = asyncio.run(main.get_tickets("comp_123"))
        
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["id"], "t1")
        self.mock_redis.get.assert_called_once_with("tickets:list:comp_123")

    def test_get_ticket_by_id_graceful_fallback_on_redis_connection_error(self):
        import redis
        self.mock_redis.get.side_effect = redis.exceptions.ConnectionError("Connection refused")
        
        mock_response = MagicMock()
        mock_response.data = {"id": "t1", "subject": "Test ticket"}
        
        table_mock = MagicMock()
        select_mock = MagicMock()
        eq_mock = MagicMock()
        single_mock = MagicMock()
        
        self.mock_supabase.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq_mock
        eq_mock.single.return_value = single_mock
        single_mock.execute.return_value = mock_response
        
        res = asyncio.run(main.get_ticket_by_id("t1"))
        
        self.assertEqual(res["id"], "t1")
        self.mock_redis.get.assert_called_once_with("tickets:detail:t1")

    def test_save_ticket_graceful_fallback_on_redis_connection_error(self):
        import redis
        self.mock_redis.delete.side_effect = redis.exceptions.ConnectionError("Connection refused")
        
        from backend.main import TicketSaveRequest
        payload = TicketSaveRequest(
            user_id="843dfe99-70dd-4283-8eaf-c1bc70047b59",
            subject="Test Subject",
            description="Test Description",
            category="Software",
            subcategory="General",
            priority="Low",
            assigned_team="Software Team",
            status="pending",
            auto_resolve=False,
            is_duplicate=False,
            confidence=0.95,
            company="RITESH PVT LTD",
            company_id="76d16bf6-2ee9-44ad-b64e-ad5ecf0a079b",
            is_potential_duplicate=False,
            parent_ticket_id=None,
            sla_breach_at="2026-06-01T00:00:00Z",
            routing_confidence=0.95,
            metadata={}
        )
        
        profile_res = MagicMock()
        profile_res.data = {"company_id": "76d16bf6-2ee9-44ad-b64e-ad5ecf0a079b", "company": "RITESH PVT LTD"}
        
        ticket_insert_res = MagicMock()
        ticket_insert_res.data = [{"id": "ticket_new_123"}]
        
        msg_insert_res = MagicMock()
        msg_insert_res.data = [{"id": "msg_123"}]
        
        def table_side_effect(name):
            mock_table_obj = MagicMock()
            if name == "profiles":
                mock_table_obj.select.return_value.eq.return_value.single.return_value.execute.return_value = profile_res
            elif name == "tickets":
                mock_table_obj.insert.return_value.execute.return_value = ticket_insert_res
            elif name == "ticket_messages":
                mock_table_obj.insert.return_value.execute.return_value = msg_insert_res
            return mock_table_obj
            
        self.mock_supabase.table.side_effect = table_side_effect
        
        res = asyncio.run(main.save_ticket(payload))
        
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["ticket_id"], "ticket_new_123")
        self.mock_redis.delete.assert_called_once_with("tickets:list:all", "tickets:list:76d16bf6-2ee9-44ad-b64e-ad5ecf0a079b")

    def test_update_ticket_graceful_fallback_on_redis_connection_error(self):
        import redis
        self.mock_redis.delete.side_effect = redis.exceptions.ConnectionError("Connection refused")
        
        from backend.main import TicketRecord
        test_ticket = TicketRecord(
            ticket_id="ticket_123",
            owner_id="owner_1",
            company_id="comp_123",
            subject="Original Subject",
            description="Desc",
            category="Software",
            subcategory="General",
            priority="Low",
            assigned_team="Software Team",
            status="pending",
            auto_resolve=False,
            is_duplicate=False,
            confidence=0.95,
            sla_breach_at="2026-06-01T00:00:00Z",
            routing_confidence=0.95,
            metadata={}
        )
        main.TICKETS_DB.append(test_ticket)
        
        res = asyncio.run(main.update_ticket("ticket_123", {"status": "resolved"}))
        
        self.assertEqual(res.status, "resolved")
        self.mock_redis.delete.assert_any_call("tickets:detail:ticket_123")

if __name__ == "__main__":
    unittest.main()
