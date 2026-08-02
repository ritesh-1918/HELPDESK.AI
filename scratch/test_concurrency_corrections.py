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

# Mock Redis module
mock_redis_mod = MockModule()
mock_redis_client = MagicMock()
mock_redis_mod.from_url.return_value = mock_redis_client
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
from unittest.mock import MagicMock
from pathlib import Path
import threading

# Put project root on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set default env variable so backend initializes with it
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

# Import the backend app
import backend.main as main

class MockRequest:
    def __init__(self, json_data):
        self._json_data = json_data
    async def json(self):
        return self._json_data

class TestConcurrencyCorrections(unittest.TestCase):
    def setUp(self):
        # We ensure corrections log path is a test file to avoid polluting the actual log
        self.orig_log_path = main.CORRECTIONS_LOG_PATH
        self.orig_log_dir = main.CORRECTIONS_LOG_DIR
        
        self.test_log_path = Path(__file__).parent / "test_data" / "corrections_log.json"
        self.test_structured_log_path = Path(__file__).parent / "test_data" / "corrections_structured.log"
        
        main.CORRECTIONS_LOG_PATH = self.test_log_path
        main.CORRECTIONS_LOG_DIR = self.test_log_path.parent
        main.CORRECTIONS_LOG_DIR.mkdir(parents=True, exist_ok=True)
        
        # Close and clear active rotating logger handlers to release locks on Windows
        for h in list(main.structured_logger.handlers):
            h.close()
        main.structured_logger.handlers.clear()
        
        # Ensure files are removed prior to test
        if self.test_log_path.exists():
            try: os.remove(self.test_log_path)
            except Exception: pass
        if self.test_structured_log_path.exists():
            try: os.remove(self.test_structured_log_path)
            except Exception: pass
            
        rotating_handler = main.RotatingFileHandler(
            self.test_structured_log_path,
            maxBytes=1024 * 1024,
            backupCount=5,
            encoding="utf-8"
        )
        rotating_handler.setFormatter(main.logging.Formatter('%(message)s'))
        main.structured_logger.addHandler(rotating_handler)

    def tearDown(self):
        # Restore original paths
        main.CORRECTIONS_LOG_PATH = self.orig_log_path
        main.CORRECTIONS_LOG_DIR = self.orig_log_dir
        
        # Close active handlers
        for h in list(main.structured_logger.handlers):
            h.close()
        main.structured_logger.handlers.clear()
        
        # Cleanup test files
        if self.test_log_path.exists():
            try: os.remove(self.test_log_path)
            except Exception: pass
        if self.test_structured_log_path.exists():
            try: os.remove(self.test_structured_log_path)
            except Exception: pass
        # Remove test_data directory if empty
        test_dir = self.test_log_path.parent
        if test_dir.exists():
            try: os.rmdir(test_dir)
            except Exception: pass

    def test_pii_redaction(self):
        text = "Hello, my email is test.user@gmail.com and my phone is +1-555-234-5678. Contact me at another.email@help.org or (123) 456-7890."
        redacted = main.redact_pii(text)
        self.assertNotIn("test.user@gmail.com", redacted)
        self.assertNotIn("+1-555-234-5678", redacted)
        self.assertNotIn("another.email@help.org", redacted)
        self.assertNotIn("(123) 456-7890", redacted)
        self.assertIn("[EMAIL_REDACTED]", redacted)
        self.assertIn("[PHONE_REDACTED]", redacted)

    def test_log_correction_redacts_payload(self):
        payload = {
            "ticket_id": "ticket_123",
            "original_text": "Customer test@gmail.com with phone 123-456-7890",
            "ocr_text": "Scanned image containing user@gmail.com",
            "confidence": 0.85,
            "original_prediction": {"category": "Software", "subcategory": "General", "priority": "Medium", "assigned_team": "General Support"},
            "corrected_prediction": {"category": "Access", "subcategory": "General", "priority": "Medium", "assigned_team": "IAM Team"}
        }
        req = MockRequest(payload)
        
        res = asyncio.run(main.log_correction(req))
        self.assertEqual(res["status"], "saved")
        
        # Verify JSON log file contents
        with open(self.test_log_path, "r", encoding="utf-8") as f:
            logs = json.load(f)
            
        self.assertEqual(len(logs), 1)
        self.assertNotIn("test@gmail.com", logs[0]["original_text"])
        self.assertIn("[EMAIL_REDACTED]", logs[0]["original_text"])
        self.assertIn("[PHONE_REDACTED]", logs[0]["original_text"])
        self.assertIn("[EMAIL_REDACTED]", logs[0]["ocr_text"])

    def test_concurrent_corrections(self):
        # We fire 20 parallel correction logging tasks concurrently using threads
        num_threads = 20
        threads = []
        errors = []

        def worker(thread_idx):
            # Create loop per thread since log_correction is async
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            payload = {
                "ticket_id": f"ticket_thread_{thread_idx}",
                "original_text": f"Error text for thread {thread_idx} from email_{thread_idx}@test.com",
                "ocr_text": "OCR scanning",
                "confidence": 0.9,
                "original_prediction": {"category": "Software"},
                "corrected_prediction": {"category": "Hardware"}
            }
            req = MockRequest(payload)
            try:
                res = loop.run_until_complete(main.log_correction(req))
                if res.get("status") != "saved":
                    errors.append(f"Thread {thread_idx} returned: {res}")
            except Exception as e:
                errors.append(f"Thread {thread_idx} failed: {e}")
            finally:
                loop.close()

        for i in range(num_threads):
            t = threading.Thread(target=worker, args=(i,))
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        # Check for immediate processing errors
        self.assertEqual(errors, [], f"Errors encountered during concurrent writes: {errors}")
        
        # Verify JSON file validity
        self.assertTrue(self.test_log_path.exists(), "Log file was not created.")
        with open(self.test_log_path, "r", encoding="utf-8") as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError as jde:
                self.fail(f"Log file is not valid JSON: {jde}")

        # Assert no updates were lost (all 20 entries are present)
        self.assertEqual(len(logs), num_threads, f"Lost updates! Expected {num_threads} entries, got {len(logs)}")
        
        # Assert consistent ordering and data integrity
        ticket_ids = sorted([log["ticket_id"] for log in logs])
        expected_ticket_ids = sorted([f"ticket_thread_{i}" for i in range(num_threads)])
        self.assertEqual(ticket_ids, expected_ticket_ids)

        # Assert structured rotating log file is created and has correct line count
        self.assertTrue(self.test_structured_log_path.exists())
        with open(self.test_structured_log_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        self.assertEqual(len(lines), num_threads)
        # Verify JSON validity per line
        for line in lines:
            line_json = json.loads(line)
            self.assertEqual(line_json["corrected_prediction"]["category"], "Hardware")
            self.assertIn("[EMAIL_REDACTED]", line_json["original_text"])

if __name__ == "__main__":
    unittest.main()
