"""
Tests for SLA Breach Prediction Engine

Tests prediction algorithms, risk calculations, and proactive alerting.
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, AsyncMock, patch, MagicMock

from backend.services.sla_breach_predictor import (
    SLABreachPredictor,
    RiskLevel,
    create_predictor
)
from backend.services.proactive_alert_service import (
    ProactiveAlertService,
    AlertChannel,
    create_alert_service
)


class TestSLABreachPredictor:
    """Tests for SLA Breach Predictor."""
    
    @pytest.fixture
    def mock_supabase(self):
        """Create a mock Supabase client."""
        return Mock()
    
    @pytest.fixture
    def predictor(self, mock_supabase):
        """Create a predictor instance with mock database."""
        return SLABreachPredictor(mock_supabase)
    
    def create_test_ticket(self, **kwargs):
        """Create a test ticket dict with default values."""
        now = datetime.now(timezone.utc)
        defaults = {
            "id": "ticket-123",
            "subject": "Test ticket",
            "priority": "high",
            "category": "Technical Support",
            "status": "open",
            "company_id": "company-456",
            "assigned_to": "agent-789",
            "created_at": (now - timedelta(hours=2)).isoformat(),
            "sla_breach_at": (now + timedelta(hours=2)).isoformat()
        }
        defaults.update(kwargs)
        return defaults
    
    def test_predict_breach_probability_basic(self, predictor):
        """Test basic breach probability calculation."""
        ticket = self.create_test_ticket()
        
        prediction = predictor.predict_breach_probability(ticket)
        
        assert "probability" in prediction
        assert 0.0 <= prediction["probability"] <= 1.0
        assert "risk_level" in prediction
        assert isinstance(prediction["risk_level"], RiskLevel)
        assert "time_to_breach_minutes" in prediction
        assert "contributing_factors" in prediction
        assert "confidence" in prediction
        assert "recommended_actions" in prediction
    
    def test_predict_already_breached(self, predictor):
        """Test prediction for already breached ticket."""
        # SLA breach time in the past
        past_time = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        ticket = self.create_test_ticket(sla_breach_at=past_time)
        
        prediction = predictor.predict_breach_probability(ticket)
        
        assert prediction["probability"] == 1.0
        assert prediction["risk_level"] == RiskLevel.CRITICAL
        assert prediction["time_to_breach_minutes"] == 0
        assert prediction["breach_status"] == "breached"
    
    def test_predict_critical_risk(self, predictor):
        """Test prediction for ticket with critical risk."""
        # SLA breach in 30 minutes
        soon = (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat()
        ticket = self.create_test_ticket(
            priority="critical",
            sla_breach_at=soon
        )
        
        prediction = predictor.predict_breach_probability(ticket)
        
        assert prediction["risk_level"] in [RiskLevel.CRITICAL, RiskLevel.HIGH]
        assert prediction["probability"] > 0.7
        assert prediction["time_to_breach_minutes"] < 60
    
    def test_predict_safe_ticket(self, predictor):
        """Test prediction for ticket with plenty of time."""
        # SLA breach in 5 days
        far_future = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
        ticket = self.create_test_ticket(
            priority="low",
            sla_breach_at=far_future
        )
        
        prediction = predictor.predict_breach_probability(ticket)
        
        assert prediction["risk_level"] in [RiskLevel.SAFE, RiskLevel.LOW]
        assert prediction["probability"] < 0.5
    
    def test_calculate_time_urgency_probability(self, predictor):
        """Test time urgency probability calculation."""
        # Test various time remaining scenarios
        test_cases = [
            (0, "critical", 1.0),  # Already breached
            (30, "critical", 0.95),  # < 10% time remaining
            (120, "high", 0.85),  # < 25% time remaining
            (480, "medium", 0.40),  # < 75% time remaining
            (2000, "low", 0.15),  # Plenty of time
        ]
        
        for time_remaining, priority, expected_min in test_cases:
            prob = predictor._calculate_time_urgency_probability(time_remaining, priority)
            assert prob >= expected_min * 0.9  # Allow 10% variance
    
    def test_calculate_workload_probability(self, predictor, mock_supabase):
        """Test workload probability calculation."""
        # Mock high workload (15+ tickets)
        mock_result = Mock()
        mock_result.count = 15
        mock_supabase.table().select().eq().eq().in_().execute.return_value = mock_result
        
        prob = predictor._calculate_workload_probability("agent-123", "company-456", None)
        
        assert prob >= 0.7  # High workload should give high probability
    
    def test_calculate_complexity_probability(self, predictor):
        """Test complexity probability calculation."""
        # Simple ticket
        simple_ticket = self.create_test_ticket(
            description="Quick question"
        )
        simple_prob = predictor._calculate_complexity_probability(simple_ticket)
        
        # Complex ticket
        complex_ticket = self.create_test_ticket(
            description="A" * 1500,  # Long description
            tags=["urgent", "critical", "escalated", "important"],
            reopen_count=2,
            has_attachments=True
        )
        complex_prob = predictor._calculate_complexity_probability(complex_ticket)
        
        assert complex_prob > simple_prob
        assert complex_prob > 0.5
    
    def test_determine_risk_level(self, predictor):
        """Test risk level determination."""
        test_cases = [
            (0.95, 30, RiskLevel.CRITICAL),
            (0.75, 180, RiskLevel.HIGH),
            (0.55, 600, RiskLevel.MEDIUM),
            (0.35, 1500, RiskLevel.LOW),
            (0.20, 3000, RiskLevel.SAFE),
        ]
        
        for probability, time_remaining, expected_risk in test_cases:
            risk = predictor._determine_risk_level(probability, time_remaining)
            assert risk == expected_risk
    
    def test_generate_recommendations_critical(self, predictor):
        """Test recommendations for critical risk."""
        recommendations = predictor._generate_recommendations(
            RiskLevel.CRITICAL,
            0.95,
            ["Critical time pressure", "Assigned agent has high workload"],
            30
        )
        
        assert len(recommendations) > 0
        assert any("escalate" in rec.lower() for rec in recommendations)
        assert any("immediate" in rec.lower() or "urgent" in rec.lower() for rec in recommendations)
    
    def test_get_at_risk_tickets(self, predictor, mock_supabase):
        """Test getting at-risk tickets for a company."""
        # Mock ticket data
        mock_tickets = [
            {
                "id": "ticket-1",
                "subject": "Critical issue",
                "priority": "critical",
                "sla_breach_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
                "status": "open",
                "company_id": "company-123"
            },
            {
                "id": "ticket-2",
                "subject": "Normal issue",
                "priority": "medium",
                "sla_breach_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
                "status": "open",
                "company_id": "company-123"
            }
        ]
        
        mock_result = Mock()
        mock_result.data = mock_tickets
        mock_supabase.table().select().eq().in_().execute.return_value = mock_result
        
        at_risk = predictor.get_at_risk_tickets("company-123", RiskLevel.MEDIUM)
        
        assert isinstance(at_risk, list)
        # Should have predictions for both tickets
        assert all("prediction" in ticket for ticket in at_risk)
    
    def test_cache_mechanism(self, predictor, mock_supabase):
        """Test that historical data is cached."""
        # First call should query database
        mock_result = Mock()
        mock_result.data = [
            {
                "created_at": "2024-01-01T10:00:00Z",
                "resolved_at": "2024-01-02T10:00:00Z",
                "sla_breach_at": "2024-01-01T18:00:00Z"
            }
        ]
        mock_supabase.table().select().eq().eq().eq().eq().limit().execute.return_value = mock_result
        
        # First call
        prob1 = predictor._calculate_historical_probability("Tech Support", "high", "company-123")
        
        # Second call should use cache (no database query)
        mock_supabase.table().select().eq().eq().eq().eq().limit().execute.reset_mock()
        prob2 = predictor._calculate_historical_probability("Tech Support", "high", "company-123")
        
        assert prob1 == prob2
        mock_supabase.table().select().eq().eq().eq().eq().limit().execute.assert_not_called()


class TestProactiveAlertService:
    """Tests for Proactive Alert Service."""
    
    @pytest.fixture
    def mock_supabase(self):
        """Create a mock Supabase client."""
        return Mock()
    
    @pytest.fixture
    def mock_predictor(self):
        """Create a mock predictor."""
        predictor = Mock(spec=SLABreachPredictor)
        return predictor
    
    @pytest.fixture
    def alert_service(self, mock_supabase, mock_predictor):
        """Create an alert service instance."""
        return ProactiveAlertService(mock_supabase, mock_predictor)
    
    @pytest.mark.asyncio
    async def test_scan_and_alert(self, alert_service, mock_predictor):
        """Test scanning and alerting workflow."""
        # Mock at-risk tickets
        mock_tickets = [
            {
                "id": "ticket-1",
                "subject": "Critical issue",
                "company_id": "company-123",
                "prediction": {
                    "risk_level": RiskLevel.CRITICAL,
                    "probability": 0.95,
                    "time_to_breach_minutes": 30,
                    "contributing_factors": ["Time pressure"],
                    "recommended_actions": ["Escalate immediately"]
                }
            }
        ]
        mock_predictor.get_at_risk_tickets.return_value = mock_tickets
        
        result = await alert_service.scan_and_alert("company-123", RiskLevel.MEDIUM)
        
        assert result["success"] is True
        assert "scanned_tickets" in result
        assert "alerts_sent" in result
    
    def test_should_send_alert_first_time(self, alert_service):
        """Test alert should be sent on first occurrence."""
        should_send = alert_service._should_send_alert("ticket-new", RiskLevel.HIGH)
        assert should_send is True
    
    def test_should_send_alert_cooldown(self, alert_service):
        """Test alert respects cooldown period."""
        ticket_id = "ticket-123"
        
        # Simulate alert sent recently
        alert_service._sent_alerts[ticket_id] = {
            "risk_level": RiskLevel.HIGH,
            "timestamp": datetime.now(timezone.utc)
        }
        
        # Should not send again (within cooldown)
        should_send = alert_service._should_send_alert(ticket_id, RiskLevel.HIGH)
        assert should_send is False
        
        # Should send if risk increased
        should_send = alert_service._should_send_alert(ticket_id, RiskLevel.CRITICAL)
        assert should_send is True
    
    def test_build_alert_message(self, alert_service):
        """Test alert message building."""
        ticket_data = {
            "id": "ticket-123",
            "subject": "Test issue",
            "priority": "high",
            "company_id": "company-456"
        }
        
        prediction = {
            "risk_level": RiskLevel.CRITICAL,
            "probability": 0.92,
            "time_to_breach_minutes": 45,
            "contributing_factors": ["Time pressure", "High workload"],
            "recommended_actions": ["Escalate now"]
        }
        
        message = alert_service._build_alert_message(ticket_data, prediction)
        
        assert message["ticket_id"] == "ticket-123"
        assert message["risk_level"] == "critical"
        assert message["breach_probability"] == "92%"
        assert "minutes" in message["time_to_breach"]
        assert len(message["contributing_factors"]) > 0
    
    @pytest.mark.asyncio
    async def test_send_in_app_notification(self, alert_service, mock_supabase):
        """Test sending in-app notification."""
        ticket_data = {
            "id": "ticket-123",
            "subject": "Test",
            "company_id": "company-456",
            "assigned_to": "agent-789"
        }
        
        alert_message = {
            "ticket_id": "ticket-123",
            "alert_level": "🔴 CRITICAL",
            "risk_level": "critical",
            "breach_probability": "90%",
            "time_to_breach": "30 minutes"
        }
        
        mock_supabase.table().insert().execute.return_value = Mock()
        
        success = await alert_service._send_in_app_notification(ticket_data, alert_message)
        
        assert success is True
        mock_supabase.table().insert().execute.assert_called_once()


class TestCreateFunctions:
    """Test factory functions."""
    
    def test_create_predictor(self):
        """Test predictor factory function."""
        predictor = create_predictor()
        assert isinstance(predictor, SLABreachPredictor)
    
    def test_create_alert_service(self):
        """Test alert service factory function."""
        service = create_alert_service()
        assert isinstance(service, ProactiveAlertService)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
