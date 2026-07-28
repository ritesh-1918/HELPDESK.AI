"""
Conftest for security tests — mock heavy dependencies before any import.
"""
import sys
import os
from unittest.mock import MagicMock

# Set env before anything else
os.environ["ALLOW_DEGRADED_STARTUP"] = "1"
os.environ["SUPABASE_URL"] = "https://mock-project.supabase.co"
os.environ["SUPABASE_SERVICE_KEY"] = "mock-service-key"

# Mock all heavy dependencies that main.py imports
_heavy_modules = [
    "torch", "torch.nn", "torch.nn.functional", "torch.optim",
    "transformers", "sentence_transformers", "easyocr",
    "datasets", "sklearn", "sklearn.metrics", "pandas", "openpyxl",
    "prometheus_client", "prometheus_fastapi_instrumentator",
    "slowapi", "slowapi.util", "slowapi.errors", "slowapi.middleware",
    "apscheduler", "apscheduler.schedulers", "apscheduler.schedulers.asyncio",
    "apscheduler.triggers", "apscheduler.triggers.cron",
    "postgrest", "postgrest.exceptions", "postgrest._sync", "postgrest._sync.request_builder",
    "supabase",
]

for mod in _heavy_modules:
    if mod not in sys.modules:
        sys.modules[mod] = MagicMock()

# Make slowapi mocks return usable objects
sys.modules["slowapi"].Limiter = MagicMock()
sys.modules["slowapi"]._rate_limit_exceeded_handler = MagicMock()
sys.modules["slowapi.util"].get_remote_address = MagicMock()
sys.modules["slowapi.errors"].RateLimitExceeded = Exception
sys.modules["slowapi.middleware"].SlowAPIMiddleware = MagicMock()

# Make postgrest.exceptions.APIError a real exception
class DummyAPIError(Exception):
    pass
sys.modules["postgrest.exceptions"].APIError = DummyAPIError
