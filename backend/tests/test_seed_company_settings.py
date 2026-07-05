from __future__ import annotations

from dataclasses import dataclass
from unittest.mock import MagicMock, patch

import pytest

from backend.scripts import seed_company_settings as seed_mod


@dataclass
class FakeResponse:
    data: list[dict]


class FakeQuery:
    def __init__(self, client, table_name: str):
        self.client = client
        self.table_name = table_name
        self.selected_column = "*"
        self.insert_records = None
        self.start = 0
        self.end = 0

    def select(self, column: str):
        self.selected_column = column
        return self

    def range(self, start: int, end: int):
        self.start = start
        self.end = end
        return self

    def insert(self, records: list[dict]):
        self.insert_records = records
        return self

    def execute(self):
        if self.insert_records is not None:
            self.client.insert_calls.append((self.table_name, self.insert_records))
            return FakeResponse([])

        self.client.range_calls.append((self.table_name, self.selected_column, self.start, self.end))
        rows = self.client.tables.get(self.table_name, [])
        page = rows[self.start : self.end + 1]
        return FakeResponse(page)


class FakeSupabase:
    def __init__(self, tables: dict[str, list[dict]]):
        self.tables = tables
        self.range_calls = []
        self.insert_calls = []

    def table(self, table_name: str):
        return FakeQuery(self, table_name)


def test_fetch_all_pages_reads_past_supabase_default_limit(monkeypatch):
    monkeypatch.setattr(seed_mod, "PAGE_SIZE", 2)
    client = FakeSupabase({
        "tickets": [
            {"company_id": "c1"},
            {"company_id": "c2"},
            {"company_id": "c3"},
        ]
    })

    rows = seed_mod._fetch_all_pages(client, "tickets", "company_id")

    assert [row["company_id"] for row in rows] == ["c1", "c2", "c3"]
    assert client.range_calls == [
        ("tickets", "company_id", 0, 1),
        ("tickets", "company_id", 2, 3),
    ]


def test_seed_batch_inserts_missing_company_settings(monkeypatch):
    monkeypatch.setattr(seed_mod, "PAGE_SIZE", 2)
    client = FakeSupabase({
        "tickets": [
            {"company_id": "c1"},
            {"company_id": "c2"},
            {"company_id": "c1"},
            {"company_id": None},
        ],
        "system_settings": [{"company_id": "c1"}],
    })

    result = seed_mod.seed_company_settings(supabase=client)

    assert result == {"status": "success", "created_count": 1}
    assert len(client.insert_calls) == 1
    table_name, records = client.insert_calls[0]
    assert table_name == "system_settings"
    assert records[0]["company_id"] == "c2"
    assert records[0]["auto_close_enabled"] is True
    assert records[0]["auto_close_days"] == 7
    assert records[0]["created_at"]


def test_dry_run_skips_insert_but_reports_pending_records():
    client = FakeSupabase({
        "tickets": [{"company_id": "c1"}],
        "system_settings": [],
    })

    result = seed_mod.seed_company_settings(dry_run=True, supabase=client)

    assert result == {"status": "dry_run", "created_count": 1}
    assert client.insert_calls == []


def test_build_client_reports_missing_environment(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_KEY", raising=False)

    with pytest.raises(EnvironmentError) as exc_info:
        seed_mod._build_client()

    message = str(exc_info.value)
    assert "SUPABASE_URL" in message
    assert "SUPABASE_SERVICE_ROLE_KEY" in message
    assert "SUPABASE_SERVICE_KEY" in message


def test_build_client_accepts_service_key_alias(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    monkeypatch.setenv("SUPABASE_SERVICE_KEY", "service-key")

    with patch.dict("sys.modules", {"supabase": MagicMock()}):
        import supabase

        supabase.create_client.return_value = "client"

        client = seed_mod._build_client()

    assert client == "client"
    supabase.create_client.assert_called_once_with(
        "https://example.supabase.co",
        "service-key",
    )


def test_build_client_prefers_service_role_key_over_alias(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "primary-key")
    monkeypatch.setenv("SUPABASE_SERVICE_KEY", "fallback-key")

    with patch.dict("sys.modules", {"supabase": MagicMock()}):
        import supabase

        supabase.create_client.return_value = "client"

        client = seed_mod._build_client()

    assert client == "client"
    supabase.create_client.assert_called_once_with(
        "https://example.supabase.co",
        "primary-key",
    )


def test_main_reuses_one_client_for_seed_and_verify():
    client = FakeSupabase({
        "tickets": [{"company_id": "c1"}],
        "system_settings": [],
    })

    with patch.object(seed_mod, "_build_client", return_value=client) as build_client:
        with patch.object(seed_mod, "verify_seed", return_value=True) as verify_seed:
            exit_code = seed_mod.main([])

    assert exit_code == 0
    build_client.assert_called_once_with()
    verify_seed.assert_called_once_with(client)


def test_main_dry_run_skips_verify():
    client = FakeSupabase({
        "tickets": [{"company_id": "c1"}],
        "system_settings": [],
    })

    with patch.object(seed_mod, "_build_client", return_value=client):
        with patch.object(seed_mod, "verify_seed") as verify_seed:
            exit_code = seed_mod.main(["--dry-run"])

    assert exit_code == 0
    verify_seed.assert_not_called()
