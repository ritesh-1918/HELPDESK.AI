from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_supabase_client_initializers_accept_service_key_alias():
    for relative_path in [
        "services/auto_close_service.py",
        "services/notification_routing.py",
    ]:
        source = (ROOT / relative_path).read_text(encoding="utf-8")

        assert "SUPABASE_SERVICE_ROLE_KEY" in source
        assert "SUPABASE_SERVICE_KEY" in source
