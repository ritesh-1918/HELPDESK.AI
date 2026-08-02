"""
Tests for Priority Escalation Service

Tests cover:
  - Rule evaluation logic
  - Age-based escalation
  - Reopen-count-based escalation
  - Priority ordering constraints
  - Ticket escalation and logging
  - Sweep operations
"""

import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import Mock, MagicMock, patch
from backend.services.priority_escalation_service import (
    PriorityEscalationService,
    _calculate_ticket_age_hours,
)


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture
def escalation_service():
    """Fixture for PriorityEscalationService instance."""
    return PriorityEscalationService()


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    return Mock()


@pytest.fixture
def sample_rules():
    """Sample escalation rules."""
    return [
        {
            "id": "rule-1",
            "rule_name": "Low to Medium after 7 days",
            "from_priority": "low",
            "to_priority": "medium",
            "age_threshold_hours": 168,  # 7 days
            "reopen_count_threshold": None,
            "enabled": True,
            "priority_order": 1,
        },
        {
            "id": "rule-2",
            "rule_name": "Medium to High after 3 days",
            "from_priority": "medium",
            "to_priority": "high",
            "age_threshold_hours": 72,  # 3 days
            "reopen_count_threshold": None,
            "enabled": True,
            "priority_order": 2,
        },
        {
            "id": "rule-3",
            "rule_name": "Reopen to Critical",
            "from_priority": "low",
            "to_priority": "critical",
            "age_threshold_hours": None,
            "reopen_count_threshold": 2,
            "enabled": True,
            "priority_order": 3,
        },
    ]


@pytest.fixture
def sample_ticket_old_low():
    """Sample ticket: low priority, 10 days old."""
    created_at = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
    return {
        "id": "ticket-1",
        "subject": "Test ticket",
        "priority": "low",
        "status": "open",
        "created_at": created_at,
        "reopen_count": 0,
        "company_id": "company-1",
        "assigned_team": "Support",
    }


@pytest.fixture
def sample_ticket_reopened():
    """Sample ticket: low priority, reopened 3 times."""
    created_at = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    return {
        "id": "ticket-2",
        "subject": "Frequently reopened ticket",
        "priority": "low",
        "status": "open",
        "created_at": created_at,
        "reopen_count": 3,
        "company_id": "company-1",
        "assigned_team": "Support",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Tests: Utility Functions
# ─────────────────────────────────────────────────────────────────────────────

def test_calculate_ticket_age_hours():
    """Test ticket age calculation."""
    # Ticket created 48 hours ago
    created_at = (datetime.now(timezone.utc) - timedelta(hours=48)).isoformat()
    age = _calculate_ticket_age_hours(created_at)
    assert 47.5 < age < 48.5  # Allow small margin for test execution time


def test_calculate_ticket_age_hours_recent():
    """Test age calculation for recent ticket."""
    # Ticket created 1 hour ago
    created_at = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    age = _calculate_ticket_age_hours(created_at)
    assert 0.9 < age < 1.1


def test_calculate_ticket_age_hours_invalid():
    """Test age calculation with invalid timestamp."""
    age = _calculate_ticket_age_hours("invalid-timestamp")
    assert age == 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Tests: Rule Evaluation
# ─────────────────────────────────────────────────────────────────────────────

def test_evaluate_age_based_escalation(escalation_service, sample_rules, sample_ticket_old_low):
    """Test age-based escalation rule evaluation."""
    result = escalation_service.evaluate_ticket_for_escalation(
        sample_ticket_old_low, sample_rules
    )
    
    assert result is not None
    assert result["new_priority"] == "medium"
    assert result["rule"]["id"] == "rule-1"
    assert "aged" in result["reason"].lower()
    assert result["ticket_age_hours"] > 168


def test_evaluate_reopen_based_escalation(escalation_service, sample_rules, sample_ticket_reopened):
    """Test reopen-count-based escalation rule evaluation."""
    result = escalation_service.evaluate_ticket_for_escalation(
        sample_ticket_reopened, sample_rules
    )
    
    assert result is not None
    assert result["new_priority"] == "critical"
    assert result["rule"]["id"] == "rule-3"
    assert "reopened" in result["reason"].lower()
    assert result["reopen_count"] == 3


def test_evaluate_no_escalation_needed(escalation_service, sample_rules):
    """Test when no escalation is needed (young ticket, no reopens)."""
    recent_ticket = {
        "id": "ticket-3",
        "priority": "low",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reopen_count": 0,
    }
    
    result = escalation_service.evaluate_ticket_for_escalation(recent_ticket, sample_rules)
    assert result is None


def test_evaluate_priority_not_matched(escalation_service, sample_rules):
    """Test when ticket priority doesn't match any rule."""
    critical_ticket = {
        "id": "ticket-4",
        "priority": "critical",
        "created_at": (datetime.now(timezone.utc) - timedelta(days=100)).isoformat(),
        "reopen_count": 10,
    }
    
    result = escalation_service.evaluate_ticket_for_escalation(critical_ticket, sample_rules)
    assert result is None  # No rule for critical tickets


def test_rule_priority_order(escalation_service, sample_rules, sample_ticket_reopened):
    """Test that rules are evaluated in priority order."""
    # Ticket qualifies for both rule-1 (age) and rule-3 (reopen)
    # Rule-3 should win because reopen rules typically have higher priority
    ticket = {
        "id": "ticket-5",
        "priority": "low",
        "created_at": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
        "reopen_count": 3,
    }
    
    result = escalation_service.evaluate_ticket_for_escalation(ticket, sample_rules)
    
    # Should match first applicable rule (rule-1 due to priority_order: 1)
    assert result is not None
    assert result["rule"]["id"] == "rule-1"  # Age rule comes first in priority_order


# ─────────────────────────────────────────────────────────────────────────────
# Tests: Ticket Escalation
# ─────────────────────────────────────────────────────────────────────────────

def test_escalate_ticket_priority_success(escalation_service, mock_supabase, sample_rules):
    """Test successful ticket escalation."""
    ticket_id = "ticket-1"
    escalation_data = {
        "rule": sample_rules[0],
        "new_priority": "medium",
        "reason": "Ticket aged 240 hours (threshold: 168h)",
        "ticket_age_hours": 240.5,
    }
    
    # Mock Supabase responses
    updated_ticket = {
        "id": ticket_id,
        "priority": "medium",
        "company_id": "company-1",
        "auto_escalated": True,
    }
    
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
        updated_ticket
    ]
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{"id": "log-1"}]
    
    result = escalation_service.escalate_ticket_priority(
        mock_supabase, ticket_id, "medium", escalation_data
    )
    
    assert result is not None
    assert result["priority"] == "medium"
    assert result["auto_escalated"] is True
    
    # Verify Supabase calls
    assert mock_supabase.table.called
    assert mock_supabase.table.call_count >= 3  # tickets update, log insert, message insert


def test_escalate_ticket_priority_not_found(escalation_service, mock_supabase, sample_rules):
    """Test escalation when ticket is not found."""
    escalation_data = {
        "rule": sample_rules[0],
        "new_priority": "medium",
        "reason": "Test",
    }
    
    # Mock no ticket found
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = []
    
    result = escalation_service.escalate_ticket_priority(
        mock_supabase, "nonexistent", "medium", escalation_data
    )
    
    assert result is None


def test_escalate_ticket_priority_exception(escalation_service, mock_supabase, sample_rules):
    """Test escalation with database exception."""
    escalation_data = {
        "rule": sample_rules[0],
        "new_priority": "medium",
        "reason": "Test",
    }
    
    # Mock exception
    mock_supabase.table.return_value.update.side_effect = Exception("DB error")
    
    result = escalation_service.escalate_ticket_priority(
        mock_supabase, "ticket-1", "medium", escalation_data
    )
    
    assert result is None


# ─────────────────────────────────────────────────────────────────────────────
# Tests: Escalation Sweep
# ─────────────────────────────────────────────────────────────────────────────

def test_run_escalation_sweep_success(escalation_service, mock_supabase, sample_rules, sample_ticket_old_low):
    """Test full escalation sweep operation."""
    # Create separate mock chains for different table operations
    rules_mock = Mock()
    rules_mock.select.return_value.eq.return_value.order.return_value.or_.return_value.execute.return_value.data = sample_rules
    
    candidates_mock = Mock()
    candidates_mock.select.return_value.in_.return_value.neq.return_value.execute.return_value.data = [
        sample_ticket_old_low
    ]
    
    updated_ticket = {**sample_ticket_old_low, "priority": "medium", "auto_escalated": True}
    update_mock = Mock()
    update_mock.update.return_value.eq.return_value.execute.return_value.data = [updated_ticket]
    
    insert_mock = Mock()
    insert_mock.insert.return_value.execute.return_value.data = [{"id": "log-1"}]
    
    # Mock table() to return different mocks based on call order
    mock_supabase.table.side_effect = [rules_mock, candidates_mock, update_mock, insert_mock, insert_mock]
    
    stats = escalation_service.run_escalation_sweep(mock_supabase, company_id="company-1")
    
    assert stats["candidates_found"] == 1
    assert stats["evaluated"] == 1
    assert stats["escalated"] == 1
    assert stats["errors"] == 0


def test_run_escalation_sweep_no_rules(escalation_service, mock_supabase):
    """Test sweep with no active rules."""
    # Mock no rules
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.or_.return_value.execute.return_value.data = []
    
    stats = escalation_service.run_escalation_sweep(mock_supabase)
    
    assert stats["candidates_found"] == 0
    assert stats["escalated"] == 0


def test_run_escalation_sweep_no_candidates(escalation_service, mock_supabase, sample_rules):
    """Test sweep with no eligible tickets."""
    # Mock rules exist
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.or_.return_value.execute.return_value.data = sample_rules
    
    # Mock no candidates
    mock_supabase.table.return_value.select.return_value.in_.return_value.neq.return_value.execute.return_value.data = []
    
    stats = escalation_service.run_escalation_sweep(mock_supabase)
    
    assert stats["candidates_found"] == 0
    assert stats["evaluated"] == 0
    assert stats["escalated"] == 0


def test_run_escalation_sweep_skip_no_matching_rule(escalation_service, mock_supabase, sample_rules):
    """Test sweep skips tickets with no matching rule."""
    # Mock rules
    rules_mock = Mock()
    rules_mock.select.return_value.eq.return_value.order.return_value.or_.return_value.execute.return_value.data = sample_rules
    
    # Mock recent ticket (doesn't match any rule)
    recent_ticket = {
        "id": "ticket-new",
        "priority": "low",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reopen_count": 0,
    }
    candidates_mock = Mock()
    candidates_mock.select.return_value.in_.return_value.neq.return_value.execute.return_value.data = [
        recent_ticket
    ]
    
    mock_supabase.table.side_effect = [rules_mock, candidates_mock]
    
    stats = escalation_service.run_escalation_sweep(mock_supabase)
    
    assert stats["candidates_found"] == 1
    assert stats["evaluated"] == 1
    assert stats["skipped_no_rule"] == 1
    assert stats["escalated"] == 0


def test_run_escalation_sweep_with_errors(escalation_service, mock_supabase, sample_rules, sample_ticket_old_low):
    """Test sweep handles errors gracefully."""
    # Mock rules
    rules_mock = Mock()
    rules_mock.select.return_value.eq.return_value.order.return_value.or_.return_value.execute.return_value.data = sample_rules
    
    # Mock candidates
    candidates_mock = Mock()
    candidates_mock.select.return_value.in_.return_value.neq.return_value.execute.return_value.data = [
        sample_ticket_old_low
    ]
    
    # Mock escalation failure
    update_mock = Mock()
    update_mock.update.return_value.eq.return_value.execute.return_value.data = []
    
    mock_supabase.table.side_effect = [rules_mock, candidates_mock, update_mock]
    
    stats = escalation_service.run_escalation_sweep(mock_supabase)
    
    assert stats["candidates_found"] == 1
    assert stats["evaluated"] == 1
    assert stats["escalated"] == 0
    assert stats["errors"] == 1


# ─────────────────────────────────────────────────────────────────────────────
# Tests: Alert Sending
# ─────────────────────────────────────────────────────────────────────────────

@patch("backend.services.priority_escalation_service.logger")
def test_send_escalation_alert_success(mock_logger, escalation_service, sample_ticket_old_low):
    """Test sending escalation alert."""
    # Mock the notification import to avoid ImportError
    with patch.dict('sys.modules', {'backend.services.notification_routing': Mock()}):
        result = escalation_service.send_escalation_alert(
            sample_ticket_old_low, "medium", "Ticket aged 240 hours"
        )
        
        # Alert logging should succeed even if notification fails
        assert result is True


def test_send_escalation_alert_no_notification_service(escalation_service, sample_ticket_old_low):
    """Test alert sending when notification service is unavailable."""
    # The service should handle missing notification gracefully
    result = escalation_service.send_escalation_alert(
        sample_ticket_old_low, "medium", "Test"
    )
    # Should return True because logging succeeded
    assert result is True


# ─────────────────────────────────────────────────────────────────────────────
# Tests: Get Escalation Rules
# ─────────────────────────────────────────────────────────────────────────────

def test_get_escalation_rules_success(escalation_service, mock_supabase, sample_rules):
    """Test fetching escalation rules."""
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.or_.return_value.execute.return_value.data = sample_rules
    
    rules = escalation_service.get_escalation_rules(mock_supabase, company_id="company-1")
    
    assert len(rules) == 3
    assert rules[0]["id"] == "rule-1"


def test_get_escalation_rules_empty(escalation_service, mock_supabase):
    """Test fetching rules when none exist."""
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.or_.return_value.execute.return_value.data = []
    
    rules = escalation_service.get_escalation_rules(mock_supabase)
    
    assert len(rules) == 0


def test_get_escalation_rules_exception(escalation_service, mock_supabase):
    """Test rule fetching with exception."""
    mock_supabase.table.side_effect = Exception("DB error")
    
    rules = escalation_service.get_escalation_rules(mock_supabase)
    
    assert len(rules) == 0


# ─────────────────────────────────────────────────────────────────────────────
# Tests: Get Escalation Candidates
# ─────────────────────────────────────────────────────────────────────────────

def test_get_escalation_candidates_success(escalation_service, mock_supabase, sample_ticket_old_low):
    """Test fetching escalation candidates."""
    mock_supabase.table.return_value.select.return_value.in_.return_value.neq.return_value.execute.return_value.data = [
        sample_ticket_old_low
    ]
    
    candidates = escalation_service.get_escalation_candidates(mock_supabase)
    
    assert len(candidates) == 1
    assert candidates[0]["id"] == "ticket-1"


def test_get_escalation_candidates_empty(escalation_service, mock_supabase):
    """Test fetching candidates when none exist."""
    mock_supabase.table.return_value.select.return_value.in_.return_value.neq.return_value.execute.return_value.data = []
    
    candidates = escalation_service.get_escalation_candidates(mock_supabase)
    
    assert len(candidates) == 0


def test_get_escalation_candidates_with_company_filter(escalation_service, mock_supabase, sample_ticket_old_low):
    """Test fetching candidates with company filter."""
    mock_supabase.table.return_value.select.return_value.in_.return_value.neq.return_value.eq.return_value.execute.return_value.data = [
        sample_ticket_old_low
    ]
    
    candidates = escalation_service.get_escalation_candidates(mock_supabase, company_id="company-1")
    
    assert len(candidates) == 1
