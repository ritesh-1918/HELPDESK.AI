import pytest
import numpy as np
from unittest.mock import MagicMock, AsyncMock, patch
from backend.services.knowledge_gap_service import KnowledgeGapService

@pytest.fixture
def mock_supabase():
    mock = MagicMock()
    # Mocking tickets table chain
    mock_tickets_table = MagicMock()
    mock_tickets_select = MagicMock()
    mock_tickets_eq = MagicMock()
    mock_tickets_in = MagicMock()
    mock_tickets_execute = MagicMock()
    
    mock.table.return_value = mock_tickets_table
    mock_tickets_table.select.return_value = mock_tickets_select
    mock_tickets_table.delete.return_value = mock_tickets_eq
    mock_tickets_table.insert.return_value = mock_tickets_execute
    
    mock_tickets_select.eq.return_value = mock_tickets_eq
    mock_tickets_eq.in_.return_value = mock_tickets_in
    mock_tickets_eq.eq.return_value = mock_tickets_eq
    mock_tickets_eq.execute.return_value = mock_tickets_execute
    mock_tickets_in.execute.return_value = mock_tickets_execute
    
    mock_tickets_eq.single.return_value = mock_tickets_execute
    mock_tickets_eq.order.return_value = mock_tickets_execute
    
    return mock

def test_detect_gaps_no_tickets(mock_supabase):
    import asyncio
    mock_supabase.table().select().eq().in_().execute().data = []
    kgs = KnowledgeGapService(mock_supabase)
    asyncio.run(kgs.detect_gaps("company-id"))
    # Shouldn't fail
    assert True

def test_detect_gaps_with_tickets(mock_supabase):
    import json
    import asyncio
    
    # 3 tickets that form a cluster
    vec = [0.1] * 384
    mock_tickets = [
        {"id": "1", "subject": "VPN Error 1", "description_vector": json.dumps(vec), "created_at": "2026-06-01T10:00:00Z", "closed_at": "2026-06-01T11:00:00Z"},
        {"id": "2", "subject": "VPN Error 2", "description_vector": json.dumps(vec), "created_at": "2026-06-01T10:00:00Z", "closed_at": "2026-06-01T11:00:00Z"},
        {"id": "3", "subject": "VPN Error 3", "description_vector": json.dumps(vec), "created_at": "2026-06-01T10:00:00Z", "closed_at": "2026-06-01T11:00:00Z"}
    ]
    
    mock_supabase.table().select().eq().in_().execute().data = mock_tickets
    
    # Mock match_articles RPC
    mock_rpc_execute = MagicMock(data=[{"id": "uuid", "title": "VPN Guide", "similarity": 0.88}])
    mock_supabase.rpc.return_value.execute.return_value = mock_rpc_execute
    
    kgs = KnowledgeGapService(mock_supabase)
    asyncio.run(kgs.detect_gaps("company-id"))
    
    # Verify insert was called
    assert mock_supabase.table().insert.called
    args = mock_supabase.table().insert.call_args[0][0]
    assert args["company_id"] == "company-id"
    assert args["cluster_subject"] == "VPN Error 1"
    assert args["occurrences"] == 3
    assert args["coverage_status"] == "Covered"

def test_get_dashboard_insights(mock_supabase):
    import asyncio
    mock_data = [
        {"id": "1", "cluster_subject": "VPN", "occurrences": 10, "gap_score": 90, "coverage_status": "None", "recommended_draft": "Draft"}
    ]
    mock_supabase.table().select().eq().order().execute().data = mock_data
    
    kgs = KnowledgeGapService(mock_supabase)
    res = asyncio.run(kgs.get_dashboard_insights("company-id"))
    
    assert res["total_gaps_detected"] == 1
    assert res["missing_documentation_count"] == 1
    assert res["top_recurring_issues"][0]["subject"] == "VPN"
