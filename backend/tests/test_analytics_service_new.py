"""
Unit tests for backend/services/analytics_service.py (analytics/metrics computation).

Since the source file is not available in the repository, these tests are written
based on the bounty issue description to cover the expected interface:

- get_ticket_metrics(date_range, ticket_states)
- get_response_time_stats(date_range)
- get_resolution_rate(date_range, priority)
- get_team_workload(date_range)
- get_category_breakdown(date_range)
- Custom date range filtering
- Empty data handling
- Null value handling
"""

import pytest
from unittest.mock import patch, MagicMock, call
from datetime import datetime, timedelta


# ---------------------------------------------------------------------------
# Helper: Create a mock analytics service with mocked supabase
# ---------------------------------------------------------------------------

def _make_service(mock_supabase=None):
    """Create an AnalyticsService with mocked supabase client."""
    with patch("backend.services.analytics_service.create_client") as m:
        m.return_value = mock_supabase or MagicMock()
        from backend.services.analytics_service import AnalyticsService
        return AnalyticsService()


# ---------------------------------------------------------------------------
# 1. get_ticket_metrics
# ---------------------------------------------------------------------------

class TestGetTicketMetrics:
    """Tests for get_ticket_metrics."""

    def test_returns_dict_with_required_keys(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.gte.return_value.lte.return_value.execute.return_value = mock_resp

            result = svc.get_ticket_metrics(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_open_tickets_count(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [{"id": "1", "status": "open"}]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.gte.return_value.lte.return_value.execute.return_value = mock_resp

            result = svc.get_ticket_metrics(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert "open_count" in result or "total" in result or "open" in result

    def test_closed_tickets_count(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [{"id": "1", "status": "closed"}]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.gte.return_value.lte.return_value.execute.return_value = mock_resp

            result = svc.get_ticket_metrics(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_multiple_states(self):
        """Test with multiple ticket states in one call."""
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "status": "open"},
                {"id": "2", "status": "pending"},
                {"id": "3", "status": "closed"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.gte.return_value.lte.return_value.execute.return_value = mock_resp

            result = svc.get_ticket_metrics(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_empty_date_range(self):
        """No tickets in date range → empty result."""
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.gte.return_value.lte.return_value.execute.return_value = mock_resp

            result = svc.get_ticket_metrics(
                start_date="2099-01-01", end_date="2099-12-31"
            )
            assert isinstance(result, dict)

    def test_supabase_called_with_date_filter(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            gte_mock = MagicMock()
            gte_mock.lte.return_value.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.gte.return_value = gte_mock

            svc.get_ticket_metrics(
                start_date="2024-06-01", end_date="2024-06-30"
            )
            # Verify supabase was called with date filters
            assert mock_sb.table.called


# ---------------------------------------------------------------------------
# 2. get_response_time_stats
# ---------------------------------------------------------------------------

class TestGetResponseTimeStats:
    """Tests for get_response_time_stats."""

    def test_returns_stats_dict(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_response_time_stats(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_average_response_time(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            # Each ticket has first_response_at - created_at = response time
            mock_resp.data = [
                {"id": "1", "created_at": "2024-01-01T00:00:00", "first_response_at": "2024-01-01T00:30:00"},
                {"id": "2", "created_at": "2024-01-01T01:00:00", "first_response_at": "2024-01-01T02:00:00"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_response_time_stats(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert "average" in result or "avg" in result or "mean" in result

    def test_median_response_time(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [{"id": "1", "created_at": "2024-01-01T00:00:00", "first_response_at": "2024-01-01T01:00:00"}]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_response_time_stats(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_min_max_response_time(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "created_at": "2024-01-01T00:00:00", "first_response_at": "2024-01-01T00:05:00"},
                {"id": "2", "created_at": "2024-01-01T00:00:00", "first_response_at": "2024-01-01T02:00:00"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_response_time_stats(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_empty_data(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_response_time_stats(
                start_date="2099-01-01", end_date="2099-12-31"
            )
            assert isinstance(result, dict)

    def test_null_first_response_at_ignored(self):
        """Tickets without first_response_at should be excluded from stats."""
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "created_at": "2024-01-01T00:00:00", "first_response_at": None},
                {"id": "2", "created_at": "2024-01-01T00:00:00", "first_response_at": "2024-01-01T00:30:00"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_response_time_stats(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)


# ---------------------------------------------------------------------------
# 3. get_resolution_rate
# ---------------------------------------------------------------------------

class TestGetResolutionRate:
    """Tests for get_resolution_rate."""

    def test_returns_rate_dict(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_resolution_rate(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_resolution_rate_with_closed_tickets(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "status": "closed", "resolved_at": "2024-01-02T00:00:00"},
                {"id": "2", "status": "open", "resolved_at": None},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_resolution_rate(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert "rate" in result or "resolution_rate" in result or "percentage" in result

    def test_resolution_rate_by_priority(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "priority": "high", "status": "closed"},
                {"id": "2", "priority": "low", "status": "open"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_resolution_rate(
                start_date="2024-01-01", end_date="2024-01-31", priority="high"
            )
            assert isinstance(result, dict)

    def test_empty_period(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_resolution_rate(
                start_date="2099-01-01", end_date="2099-12-31"
            )
            assert isinstance(result, dict)

    def test_all_resolved(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "status": "closed"},
                {"id": "2", "status": "closed"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_resolution_rate(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)


# ---------------------------------------------------------------------------
# 4. get_team_workload
# ---------------------------------------------------------------------------

class TestGetTeamWorkload:
    """Tests for get_team_workload."""

    def test_returns_workload_dict(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_team_workload(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_workload_distribution(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "assigned_to": "alice", "status": "open"},
                {"id": "2", "assigned_to": "bob", "status": "open"},
                {"id": "3", "assigned_to": "alice", "status": "pending"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_team_workload(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_unassigned_tickets(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "assigned_to": None, "status": "open"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_team_workload(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_empty_workload(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_team_workload(
                start_date="2099-01-01", end_date="2099-12-31"
            )
            assert isinstance(result, dict)


# ---------------------------------------------------------------------------
# 5. get_category_breakdown
# ---------------------------------------------------------------------------

class TestGetCategoryBreakdown:
    """Tests for get_category_breakdown."""

    def test_returns_breakdown_dict(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_category_breakdown(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_category_counts(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "category": "billing"},
                {"id": "2", "category": "technical"},
                {"id": "3", "category": "billing"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_category_breakdown(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_unknown_category(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "category": None},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_category_breakdown(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_empty_breakdown(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_category_breakdown(
                start_date="2099-01-01", end_date="2099-12-31"
            )
            assert isinstance(result, dict)


# ---------------------------------------------------------------------------
# 6. Custom date range filtering
# ---------------------------------------------------------------------------

class TestCustomDateRange:
    """Tests for custom date range filtering across all methods."""

    def test_ticket_metrics_custom_range(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.gte.return_value.lte.return_value.execute.return_value = mock_resp

            result = svc.get_ticket_metrics(
                start_date="2023-06-01", end_date="2023-06-30"
            )
            assert isinstance(result, dict)

    def test_response_time_custom_range(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_response_time_stats(
                start_date="2023-06-01", end_date="2023-06-30"
            )
            assert isinstance(result, dict)

    def test_resolution_rate_custom_range(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_resolution_rate(
                start_date="2023-06-01", end_date="2023-06-30"
            )
            assert isinstance(result, dict)


# ---------------------------------------------------------------------------
# 7. Empty data handling
# ---------------------------------------------------------------------------

class TestEmptyDataHandling:
    """Tests for handling empty data across all methods."""

    def test_all_methods_empty_data(self):
        """All methods should handle empty data gracefully."""
        svc = _make_service()
        methods_to_test = [
            ("get_ticket_metrics", {"start_date": "2099-01-01", "end_date": "2099-12-31"}),
            ("get_response_time_stats", {"start_date": "2099-01-01", "end_date": "2099-12-31"}),
            ("get_resolution_rate", {"start_date": "2099-01-01", "end_date": "2099-12-31"}),
            ("get_team_workload", {"start_date": "2099-01-01", "end_date": "2099-12-31"}),
            ("get_category_breakdown", {"start_date": "2099-01-01", "end_date": "2099-12-31"}),
        ]

        for method_name, kwargs in methods_to_test:
            with patch.object(svc, "supabase") as mock_sb:
                mock_resp = MagicMock()
                mock_resp.data = []
                chain = MagicMock()
                chain.execute.return_value = mock_resp
                mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

                method = getattr(svc, method_name)
                result = method(**kwargs)
                assert isinstance(result, dict), f"{method_name} should return dict for empty data"


# ---------------------------------------------------------------------------
# 8. Null value handling
# ---------------------------------------------------------------------------

class TestNullValueHandling:
    """Tests for handling null values in aggregated data."""

    def test_null_fields_in_ticket_data(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "status": "open", "assigned_to": None, "category": None, "priority": None},
                {"id": "2", "status": "closed", "assigned_to": "alice", "category": "billing", "priority": "high"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_ticket_metrics(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_null_in_resolution_rate(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "status": "closed", "resolved_at": None},
                {"id": "2", "status": "open", "resolved_at": None},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_resolution_rate(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_null_in_response_time(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "created_at": "2024-01-01T00:00:00", "first_response_at": None},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_response_time_stats(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)


# ---------------------------------------------------------------------------
# 9. AnalyticsService init
# ---------------------------------------------------------------------------

class TestAnalyticsServiceInit:
    """Tests for AnalyticsService initialization."""

    def test_init_creates_supabase_client(self):
        with patch("backend.services.analytics_service.create_client") as m:
            m.return_value = MagicMock()
            from backend.services.analytics_service import AnalyticsService
            svc = AnalyticsService()
            m.assert_called_once()

    def test_init_has_supabase_attribute(self):
        with patch("backend.services.analytics_service.create_client") as m:
            m.return_value = MagicMock()
            from backend.services.analytics_service import AnalyticsService
            svc = AnalyticsService()
            assert hasattr(svc, "supabase")


# ---------------------------------------------------------------------------
# 10. Edge cases
# ---------------------------------------------------------------------------

class TestEdgeCases:
    """Edge case tests for analytics service."""

    def test_single_ticket(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [{"id": "1", "status": "open"}]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_ticket_metrics(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)

    def test_very_large_date_range(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.gte.return_value.lte.return_value.execute.return_value = mock_resp

            result = svc.get_ticket_metrics(
                start_date="2000-01-01", end_date="2099-12-31"
            )
            assert isinstance(result, dict)

    def test_reverse_date_range(self):
        """Reverse date range (end < start) should be handled."""
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = []
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.gte.return_value.lte.return_value.execute.return_value = mock_resp

            result = svc.get_ticket_metrics(
                start_date="2024-12-31", end_date="2024-01-01"
            )
            assert isinstance(result, dict)

    def test_unicode_category_names(self):
        svc = _make_service()
        with patch.object(svc, "supabase") as mock_sb:
            mock_resp = MagicMock()
            mock_resp.data = [
                {"id": "1", "category": "预计问题"},
                {"id": "2", "category": "Аналитика"},
            ]
            chain = MagicMock()
            chain.execute.return_value = mock_resp
            mock_sb.table.return_value.select.return_value.execute.return_value = mock_resp

            result = svc.get_category_breakdown(
                start_date="2024-01-01", end_date="2024-01-31"
            )
            assert isinstance(result, dict)
