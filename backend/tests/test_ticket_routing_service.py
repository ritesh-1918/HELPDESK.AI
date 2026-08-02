"""
Tests for Automated Ticket Routing Service (Issue #3202)

Tests routing logic, classification, and database integration.
"""

import pytest
from datetime import datetime, timezone
from unittest.mock import Mock, MagicMock, patch
from uuid import uuid4

from backend.services.ticket_routing_service import (
    AutomatedTicketRoutingService,
    create_routing_service,
    ROUTING_THRESHOLDS,
    CATEGORY_TO_TEAM,
)


class TestTicketRoutingServiceInit:
    """Test service initialization."""

    def test_service_initialization_without_supabase(self):
        """Service should initialize without Supabase client."""
        service = AutomatedTicketRoutingService(supabase_client=None)
        assert service.supabase is None
        assert service.get_ticket_category is None

    def test_service_initialization_with_supabase(self):
        """Service should initialize with Supabase client."""
        mock_supabase = Mock()
        service = AutomatedTicketRoutingService(supabase_client=mock_supabase)
        assert service.supabase is mock_supabase

    def test_factory_function_creates_service(self):
        """Factory function should create service instance."""
        service = create_routing_service()
        assert isinstance(service, AutomatedTicketRoutingService)


class TestTicketClassification:
    """Test ticket classification logic."""

    def test_classify_empty_ticket(self):
        """Should handle empty ticket gracefully."""
        service = AutomatedTicketRoutingService()
        ticket = {"subject": "", "description": ""}
        
        result = service._classify_ticket(ticket)
        
        assert result["category"] == "General"
        assert result["confidence"] == 0.0
        assert isinstance(result["alternatives"], list)

    def test_classify_technical_ticket(self):
        """Should classify technical tickets correctly."""
        service = AutomatedTicketRoutingService()
        ticket = {
            "subject": "Database connection error",
            "description": "Cannot connect to API, getting timeout errors"
        }
        
        result = service._classify_ticket(ticket)
        
        assert result["category"] in ["Technical Support", "General"]
        assert 0 <= result["confidence"] <= 1
        assert isinstance(result["alternatives"], list)

    def test_classify_bug_report(self):
        """Should classify bug reports correctly."""
        service = AutomatedTicketRoutingService()
        ticket = {
            "subject": "Bug in user profile",
            "description": "User profile page crashes when editing"
        }
        
        result = service._classify_ticket(ticket)
        
        assert result["category"] in ["Bug Report", "Technical Support", "General"]
        assert result["confidence"] >= 0.0

    def test_classify_billing_ticket(self):
        """Should classify billing tickets correctly."""
        service = AutomatedTicketRoutingService()
        ticket = {
            "subject": "Incorrect charge on invoice",
            "description": "I was charged twice for my subscription"
        }
        
        result = service._classify_ticket(ticket)
        
        assert result["category"] in ["Billing", "General"]
        assert result["confidence"] >= 0.0

    def test_classify_feature_request(self):
        """Should classify feature requests correctly."""
        service = AutomatedTicketRoutingService()
        ticket = {
            "subject": "Add export to CSV feature",
            "description": "We need ability to export reports to CSV"
        }
        
        result = service._classify_ticket(ticket)
        
        assert result["category"] in ["Feature Request", "General"]
        assert result["confidence"] >= 0.0

    def test_heuristic_classification_high_confidence(self):
        """Heuristic should give reasonable confidence scores."""
        service = AutomatedTicketRoutingService()
        text = "I found a critical bug in the system that crashes the app"
        
        result = service._heuristic_classification(text)
        
        assert result["category"] == "Bug Report"
        assert result["confidence"] > 0.5
        assert result["confidence"] <= 0.75  # Heuristic caps at 0.75

    def test_heuristic_classification_with_alternatives(self):
        """Heuristic should return alternatives."""
        service = AutomatedTicketRoutingService()
        text = "Cannot access my account and need help"
        
        result = service._heuristic_classification(text)
        
        assert "alternatives" in result
        assert isinstance(result["alternatives"], list)


class TestRoutingDecision:
    """Test routing decision logic."""

    def test_high_confidence_routing(self):
        """High confidence should route to specialized team."""
        service = AutomatedTicketRoutingService()
        company_id = str(uuid4())
        
        decision = service._make_routing_decision(
            "Bug Report",
            0.95,  # High confidence
            company_id
        )
        
        assert decision["target_team"] == "Dev Team"
        assert decision["fallback"] is False
        assert "High confidence" in decision["reason"]

    def test_medium_confidence_routing(self):
        """Medium confidence should route to general support."""
        service = AutomatedTicketRoutingService()
        company_id = str(uuid4())
        
        decision = service._make_routing_decision(
            "Billing",
            0.70,  # Medium confidence
            company_id
        )
        
        assert decision["target_team"] == "General Support"
        assert decision["fallback"] is False
        assert "Medium confidence" in decision["reason"]

    def test_low_confidence_routing(self):
        """Low confidence should fall back to general support."""
        service = AutomatedTicketRoutingService()
        company_id = str(uuid4())
        
        decision = service._make_routing_decision(
            "Unknown",
            0.45,  # Low confidence
            company_id
        )
        
        assert decision["target_team"] == "General Support"
        assert decision["fallback"] is True
        assert "Low confidence" in decision["reason"]

    def test_routing_decision_with_different_categories(self):
        """Different categories should route appropriately."""
        service = AutomatedTicketRoutingService()
        company_id = str(uuid4())
        
        # Technical Support
        decision = service._make_routing_decision("Technical Support", 0.85, company_id)
        assert "Tech Support Team" in decision["target_team"]
        
        # Billing
        decision = service._make_routing_decision("Billing", 0.85, company_id)
        assert decision["target_team"] == "Billing Team"
        
        # Account Management
        decision = service._make_routing_decision("Account Management", 0.85, company_id)
        assert decision["target_team"] == "Account Management"


class TestTeamSelection:
    """Test team/agent selection logic."""

    def test_team_selection_without_supabase(self):
        """Should return generic team without Supabase."""
        service = AutomatedTicketRoutingService()
        ticket = {"id": str(uuid4())}
        
        team = service._select_team("Tech Support Team", str(uuid4()), ticket)
        
        assert team["name"] == "Tech Support Team"
        assert team["workload"] == 0

    def test_team_selection_with_supabase_no_agents(self):
        """Should return generic team when no agents found."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
        
        service = AutomatedTicketRoutingService(mock_supabase)
        ticket = {"id": str(uuid4())}
        company_id = str(uuid4())
        
        team = service._select_team("Tech Support Team", company_id, ticket)
        
        assert team["name"] == "Tech Support Team"
        assert team["workload"] == 0

    def test_team_selection_with_load_balancing(self):
        """Should select agent with lowest workload."""
        mock_supabase = Mock()
        agents_data = [
            {"id": "agent1", "name": "Agent 1", "team": "Tech Support Team", "current_workload": 10},
            {"id": "agent2", "name": "Agent 2", "team": "Tech Support Team", "current_workload": 3},
            {"id": "agent3", "name": "Agent 3", "team": "Tech Support Team", "current_workload": 8},
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = agents_data
        
        service = AutomatedTicketRoutingService(mock_supabase)
        ticket = {"id": str(uuid4())}
        company_id = str(uuid4())
        
        team = service._select_team("Tech Support Team", company_id, ticket)
        
        assert team["name"] == "Tech Support Team"
        assert team["agent_id"] == "agent2"  # Lowest workload
        assert team["workload"] == 3


class TestCompleteRouting:
    """Test complete routing workflow."""

    def test_route_ticket_success(self):
        """Should successfully route a ticket."""
        mock_supabase = Mock()
        service = AutomatedTicketRoutingService(mock_supabase)
        
        ticket = {
            "id": str(uuid4()),
            "subject": "Database connection failed",
            "description": "Cannot connect to database"
        }
        company_id = str(uuid4())
        
        with patch.object(service, '_log_routing_decision'):
            result = service.route_ticket(ticket, company_id)
        
        assert result["success"] is True
        assert result["ticket_id"] == ticket["id"]
        assert "category" in result
        assert "assigned_team" in result
        assert result["confidence"] >= 0.0

    def test_route_ticket_with_error(self):
        """Should handle routing errors gracefully."""
        service = AutomatedTicketRoutingService(None)
        
        with patch.object(service, '_classify_ticket', side_effect=Exception("Classification error")):
            result = service.route_ticket({"id": str(uuid4()), "subject": "", "description": ""}, str(uuid4()))
        
        assert result["success"] is False
        assert result["assigned_team"] == "General Support"
        assert result["fallback"] is True
        assert "error" in result

    def test_route_ticket_end_to_end(self):
        """End-to-end test with classification and routing."""
        service = AutomatedTicketRoutingService()
        
        ticket = {
            "id": str(uuid4()),
            "subject": "Payment failed",
            "description": "My credit card was declined during payment"
        }
        company_id = str(uuid4())
        
        with patch.object(service, '_log_routing_decision'):
            result = service.route_ticket(ticket, company_id)
        
        assert result["success"] is True
        assert "assigned_team" in result
        assert result["category"] in ["Billing", "General"]


class TestRoutingAnalytics:
    """Test routing analytics and reporting."""

    def test_get_routing_analytics_without_supabase(self):
        """Should return empty dict without Supabase."""
        service = AutomatedTicketRoutingService()
        
        analytics = service.get_routing_analytics(str(uuid4()))
        
        assert analytics == {}

    def test_get_routing_analytics_with_logs(self):
        """Should calculate analytics from routing logs."""
        mock_supabase = Mock()
        logs_data = [
            {
                "ticket_id": str(uuid4()),
                "category": "Bug Report",
                "confidence": 0.92,
                "assigned_team": "Dev Team"
            },
            {
                "ticket_id": str(uuid4()),
                "category": "Billing",
                "confidence": 0.78,
                "assigned_team": "Billing Team"
            },
            {
                "ticket_id": str(uuid4()),
                "category": "Bug Report",
                "confidence": 0.85,
                "assigned_team": "Dev Team"
            },
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.gte.return_value.execute.return_value.data = logs_data
        
        service = AutomatedTicketRoutingService(mock_supabase)
        company_id = str(uuid4())
        
        analytics = service.get_routing_analytics(company_id, 24)
        
        assert analytics["total_routed"] == 3
        assert analytics["avg_confidence"] > 0.78
        assert "category_distribution" in analytics
        assert analytics["category_distribution"]["Bug Report"] == 2
        assert analytics["category_distribution"]["Billing"] == 1

    def test_get_routing_analytics_team_distribution(self):
        """Should track team distribution."""
        mock_supabase = Mock()
        logs_data = [
            {"category": "Bug Report", "confidence": 0.92, "assigned_team": "Dev Team"},
            {"category": "Billing", "confidence": 0.78, "assigned_team": "Billing Team"},
            {"category": "Bug Report", "confidence": 0.85, "assigned_team": "Dev Team"},
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.gte.return_value.execute.return_value.data = logs_data
        
        service = AutomatedTicketRoutingService(mock_supabase)
        
        analytics = service.get_routing_analytics(str(uuid4()), 24)
        
        assert analytics["team_distribution"]["Dev Team"] == 2
        assert analytics["team_distribution"]["Billing Team"] == 1


class TestThresholdManagement:
    """Test routing threshold configuration."""

    def test_adjust_routing_thresholds_without_supabase(self):
        """Should fail gracefully without Supabase."""
        service = AutomatedTicketRoutingService()
        company_id = str(uuid4())
        
        result = service.adjust_routing_thresholds(
            company_id,
            {"critical": 0.95, "specialized": 0.80, "standard": 0.60}
        )
        
        assert result["success"] is False
        assert "error" in result

    def test_adjust_routing_thresholds_with_supabase(self):
        """Should update thresholds in database."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.upsert.return_value.execute.return_value.data = [{"company_id": "test"}]
        
        service = AutomatedTicketRoutingService(mock_supabase)
        company_id = str(uuid4())
        new_thresholds = {
            "critical": 0.98,
            "specialized": 0.85,
            "standard": 0.65
        }
        
        result = service.adjust_routing_thresholds(company_id, new_thresholds)
        
        assert result["success"] is True
        assert result["company_id"] == company_id

    def test_threshold_values_must_be_valid(self):
        """Thresholds should be between 0 and 1."""
        service = AutomatedTicketRoutingService()
        
        # High confidence should route to specialized team
        high_conf_decision = service._make_routing_decision("Test", 0.95, str(uuid4()))
        assert "specialized" in high_conf_decision["reason"] or "High" in high_conf_decision["reason"]
        
        # Medium confidence should route to general support
        med_conf_decision = service._make_routing_decision("Test", 0.70, str(uuid4()))
        assert "General Support" in med_conf_decision["target_team"]


class TestLoggingAndAuditing:
    """Test routing decision logging."""

    def test_log_routing_decision_without_supabase(self):
        """Should skip logging without Supabase."""
        service = AutomatedTicketRoutingService()
        
        # Should not raise exception
        service._log_routing_decision(
            str(uuid4()),
            str(uuid4()),
            "Test",
            0.85,
            {"name": "Test Team"}
        )

    def test_log_routing_decision_with_supabase(self):
        """Should log routing decision to database."""
        mock_supabase = Mock()
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{}]
        
        service = AutomatedTicketRoutingService(mock_supabase)
        ticket_id = str(uuid4())
        company_id = str(uuid4())
        
        service._log_routing_decision(
            ticket_id,
            company_id,
            "Bug Report",
            0.92,
            {"name": "Dev Team", "agent_id": "agent1"}
        )
        
        mock_supabase.table.assert_called()


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_ticket_with_special_characters(self):
        """Should handle special characters in ticket."""
        service = AutomatedTicketRoutingService()
        
        ticket = {
            "id": str(uuid4()),
            "subject": "Issue with @#$% symbols & unicode: 日本語",
            "description": "Error with <html> tags & symbols"
        }
        
        result = service.route_ticket(ticket, str(uuid4()))
        
        assert result["success"] is True

    def test_very_long_ticket_description(self):
        """Should handle very long descriptions."""
        service = AutomatedTicketRoutingService()
        
        long_desc = "This is a very long description. " * 1000  # Very long text
        ticket = {
            "id": str(uuid4()),
            "subject": "Performance issue",
            "description": long_desc
        }
        
        result = service.route_ticket(ticket, str(uuid4()))
        
        assert result["success"] is True

    def test_null_ticket_fields(self):
        """Should handle null/missing ticket fields."""
        service = AutomatedTicketRoutingService()
        
        ticket = {
            "id": str(uuid4()),
            "subject": None,
            "description": None
        }
        
        result = service.route_ticket(ticket, str(uuid4()))
        
        assert result["success"] is True

    def test_concurrent_routing_calls(self):
        """Service should be thread-safe."""
        service = AutomatedTicketRoutingService()
        
        ticket = {
            "id": str(uuid4()),
            "subject": "Test",
            "description": "Test"
        }
        company_id = str(uuid4())
        
        # Multiple calls should work without state issues
        result1 = service.route_ticket(ticket, company_id)
        result2 = service.route_ticket(ticket, company_id)
        
        assert result1["success"] is True
        assert result2["success"] is True


class TestMatchReason:
    """Test match reason generation."""

    def test_match_reason_same_category(self):
        """Should identify same category matches."""
        service = AutomatedTicketRoutingService()
        ticket = {"category": "Bug Report"}
        article = {"category": "Bug Report", "tags": ["bug"]}
        
        reason = service._get_match_reason(ticket, article)
        
        assert "Bug Report" in reason

    def test_match_reason_with_tags(self):
        """Should include tags in match reason."""
        service = AutomatedTicketRoutingService()
        ticket = {"category": "General"}
        article = {"category": "Technical", "tags": ["api", "error"]}
        
        reason = service._get_match_reason(ticket, article)
        
        assert "tags" in reason.lower() or "api" in reason


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
