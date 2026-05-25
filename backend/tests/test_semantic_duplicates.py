"""
Integration-style tests for SemanticDuplicateService / match_tickets RPC.

Issue #109: tenant-scoped duplicate detection without live Hugging Face calls.
"""

from __future__ import annotations

import os
import sys
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.services.semantic_duplicate_service import SemanticDuplicateService

COMPANY_A = "11111111-1111-1111-1111-111111111111"
COMPANY_B = "22222222-2222-2222-2222-222222222222"


class FakeResult:
    def __init__(self, data=None):
        self.data = data


class FakeTable:
    def __init__(self, db: dict, name: str):
        self.db = db
        self.name = name
        self.filters: dict = {}
        self._single = False

    def select(self, *_args):
        return self

    def eq(self, field, value):
        self.filters[field] = value
        return self

    def single(self):
        self._single = True
        return self

    def execute(self):
        rows = list(self.db.get(self.name, []))
        for key, value in self.filters.items():
            rows = [row for row in rows if row.get(key) == value]
        if self._single:
            return FakeResult(rows[0] if rows else None)
        return FakeResult(rows)


class MatchTicketsSupabase:
    """Simulates match_tickets RPC tenant filtering (see semantic_duplicates migration)."""

    def __init__(self, tickets: list[dict], settings: list[dict] | None = None):
        self.db = {
            "tickets": tickets,
            "system_settings": settings
            or [
                {
                    "key": "duplicate_detection",
                    "value": {"sensitivity": 0.85, "enabled": True, "max_candidates": 5},
                }
            ],
        }
        self.last_rpc_params: dict | None = None

    def table(self, name: str):
        return FakeTable(self.db, name)

    def rpc(self, name: str, params: dict):
        assert name == "match_tickets"
        self.last_rpc_params = params

        tenant_company_id = params.get("tenant_company_id")
        match_threshold = float(params.get("match_threshold", 0.70))
        match_count = int(params.get("match_count", 5))

        candidates: list[dict] = []
        for ticket in self.db.get("tickets", []):
            if ticket.get("description_vector") is None:
                continue
            if tenant_company_id and str(ticket.get("company_id")) != str(tenant_company_id):
                continue
            status = (ticket.get("status") or "").lower()
            if "resolv" in status or "closed" in status:
                continue
            similarity = float(ticket.get("_test_similarity", 0.0))
            if similarity > match_threshold:
                candidates.append(
                    {
                        "id": ticket["id"],
                        "subject": ticket.get("subject"),
                        "summary": ticket.get("summary"),
                        "status": ticket.get("status"),
                        "assigned_team": ticket.get("assigned_team"),
                        "company_id": ticket.get("company_id"),
                        "similarity": similarity,
                        "created_at": ticket.get("created_at"),
                    }
                )

        candidates.sort(key=lambda row: row["similarity"], reverse=True)
        candidates = candidates[:match_count]

        class RpcResult:
            def execute(self_inner):
                return FakeResult(candidates)

        return RpcResult()


def _service_with_stubbed_embeddings(supabase: MatchTicketsSupabase) -> SemanticDuplicateService:
    service = SemanticDuplicateService(supabase_client=supabase)
    service._loaded = True
    service._model = MagicMock()
    service._model.encode.return_value = MagicMock(tolist=lambda: [0.1] * 384)
    return service


@pytest.fixture
def cross_tenant_tickets() -> list[dict]:
    return [
        {
            "id": "ticket-a-dup",
            "company_id": COMPANY_A,
            "subject": "VPN connection failing",
            "status": "open",
            "assigned_team": "Network Ops",
            "description_vector": [0.1] * 384,
            "_test_similarity": 0.92,
        },
        {
            "id": "ticket-b-dup",
            "company_id": COMPANY_B,
            "subject": "VPN connection failing",
            "status": "open",
            "assigned_team": "Network Ops",
            "description_vector": [0.1] * 384,
            "_test_similarity": 0.95,
        },
    ]


@pytest.mark.asyncio
async def test_match_tickets_scopes_results_by_company_id(cross_tenant_tickets):
    supabase = MatchTicketsSupabase(cross_tenant_tickets)
    service = _service_with_stubbed_embeddings(supabase)

    result_a = await service.check_duplicate(
        "VPN keeps disconnecting",
        company_id=COMPANY_A,
        threshold=0.85,
    )

    assert supabase.last_rpc_params is not None
    assert supabase.last_rpc_params["tenant_company_id"] == COMPANY_A
    assert result_a["is_duplicate"] is True
    assert result_a["duplicate_ticket_id"] == "ticket-a-dup"
    assert all(c["id"] != "ticket-b-dup" for c in result_a["candidates"])

    result_b = await service.check_duplicate(
        "VPN keeps disconnecting",
        company_id=COMPANY_B,
        threshold=0.85,
    )

    assert supabase.last_rpc_params["tenant_company_id"] == COMPANY_B
    assert result_b["duplicate_ticket_id"] == "ticket-b-dup"
    assert all(c["id"] != "ticket-a-dup" for c in result_b["candidates"])


@pytest.mark.asyncio
async def test_no_cross_tenant_leak_when_other_company_has_higher_similarity(cross_tenant_tickets):
    supabase = MatchTicketsSupabase(cross_tenant_tickets)
    service = _service_with_stubbed_embeddings(supabase)

    result = await service.check_duplicate(
        "VPN keeps disconnecting",
        company_id=COMPANY_A,
        threshold=0.85,
    )

    candidate_ids = {c["id"] for c in result["candidates"]}
    assert "ticket-b-dup" not in candidate_ids
    assert result["duplicate_ticket_id"] != "ticket-b-dup"


@pytest.mark.asyncio
async def test_no_duplicate_when_similarity_below_threshold(cross_tenant_tickets):
    supabase = MatchTicketsSupabase(cross_tenant_tickets)
    service = _service_with_stubbed_embeddings(supabase)

    low_similarity_tickets = [
        {**cross_tenant_tickets[0], "_test_similarity": 0.60},
    ]
    supabase.db["tickets"] = low_similarity_tickets

    result = await service.check_duplicate(
        "Unrelated printer jam",
        company_id=COMPANY_A,
        threshold=0.85,
    )

    assert result["is_duplicate"] is False
    assert result["duplicate_ticket_id"] is None
    assert result["candidates"] == []


@pytest.mark.asyncio
async def test_embeddings_use_stub_without_loading_sentence_transformer():
    supabase = MatchTicketsSupabase([])
    service = SemanticDuplicateService(supabase_client=supabase)
    service._loaded = True
    service._model = MagicMock()
    service._model.encode.return_value = MagicMock(tolist=lambda: [0.2] * 384)

    with patch.object(service, "load", side_effect=AssertionError("load must not run in tests")):
        result = await service.check_duplicate(
            "test query",
            company_id=COMPANY_A,
            threshold=0.85,
        )

    assert result["is_duplicate"] is False
    service._model.encode.assert_called_once()
