"""
Unit tests for backend/services/digest_service.py pure HTML helpers.

Issue: #1478

Covers:
- _build_team_performance_html: empty list, single team, high/medium/low
  resolution rate colour-coding, red vs gray breach colours, multiple teams,
  returns table HTML structure.
- _build_category_list_html: empty list, single category, multiple categories,
  returns proper HTML structure.
"""

import unittest

from backend.services.digest_service import (
    _build_team_performance_html,
    _build_category_list_html,
    _build_digest_email_subject,
)


class TestBuildTeamPerformanceHtml(unittest.TestCase):
    """Tests for _build_team_performance_html helper."""

    def test_empty_list_returns_no_data_paragraph(self):
        """Empty team_performance list should return a 'no data' paragraph."""
        result = _build_team_performance_html([])
        self.assertIn("No team data recorded this week", result)
        self.assertIn("<p", result)
        # Should NOT contain a table
        self.assertNotIn("<table", result)

    def test_single_team_returns_table(self):
        """A single team should produce a table with one data row."""
        teams = [
            {
                "team": "IT Support",
                "total": 10,
                "resolved": 9,
                "open": 1,
                "pending": 0,
                "resolution_rate": 90.0,
                "avg_resolution_time": "45m",
                "sla_breaches": 0,
            }
        ]
        result = _build_team_performance_html(teams)
        # Should contain a table structure
        self.assertIn("<table", result)
        self.assertIn("</table>", result)
        self.assertIn("<thead", result)
        self.assertIn("<tbody", result)
        # Team name and stats present
        self.assertIn("IT Support", result)
        self.assertIn("90.0%", result)
        self.assertIn("45m", result)

    def test_high_resolution_rate_uses_green(self):
        """Resolution rate >= 80 should use green (#059669)."""
        teams = [
            {
                "team": "Tier 1",
                "total": 20,
                "resolved": 18,
                "open": 2,
                "pending": 0,
                "resolution_rate": 90.0,
                "avg_resolution_time": "30m",
                "sla_breaches": 0,
            }
        ]
        result = _build_team_performance_html(teams)
        self.assertIn("#059669", result)


class TestBuildDigestEmailSubject(unittest.TestCase):
    """Tests for digest email subject formatting."""

    def test_preserves_special_characters(self):
        result = _build_digest_email_subject({"company_name": "Soporte Nino & Cafe \"VIP\" 🚀"})

        self.assertEqual(result, 'Weekly Helpdesk Operations Digest - Soporte Nino & Cafe "VIP" 🚀')

    def test_strips_control_characters(self):
        result = _build_digest_email_subject({"company_name": "ACME\r\n\tOps\x00Team"})

        self.assertEqual(result, "Weekly Helpdesk Operations Digest - ACME Ops Team")

    def test_falls_back_when_company_name_is_blank(self):
        result = _build_digest_email_subject({"company_name": "\n\t"})

        self.assertEqual(result, "Weekly Helpdesk Operations Digest - Your Company")

    def test_medium_resolution_rate_uses_amber(self):
        """Resolution rate 50-79 should use amber (#d97706)."""
        teams = [
            {
                "team": "Tier 2",
                "total": 15,
                "resolved": 9,
                "open": 6,
                "pending": 0,
                "resolution_rate": 60.0,
                "avg_resolution_time": "2h",
                "sla_breaches": 1,
            }
        ]
        result = _build_team_performance_html(teams)
        self.assertIn("#d97706", result)

    def test_low_resolution_rate_uses_red(self):
        """Resolution rate < 50 should use red (#dc2626)."""
        teams = [
            {
                "team": "Tier 3",
                "total": 10,
                "resolved": 3,
                "open": 7,
                "pending": 0,
                "resolution_rate": 30.0,
                "avg_resolution_time": "3d",
                "sla_breaches": 5,
            }
        ]
        result = _build_team_performance_html(teams)
        self.assertIn("#dc2626", result)

    def test_sla_breaches_greater_than_zero_uses_red(self):
        """SLA breaches > 0 should use red colour for breach count."""
        teams = [
            {
                "team": "DevOps",
                "total": 8,
                "resolved": 6,
                "open": 2,
                "pending": 0,
                "resolution_rate": 75.0,
                "avg_resolution_time": "1h",
                "sla_breaches": 3,
            }
        ]
        result = _build_team_performance_html(teams)
        # breach_color should be red (#dc2626) when breaches > 0
        self.assertIn("#dc2626", result)

    def test_zero_sla_breaches_uses_gray(self):
        """SLA breaches == 0 should use gray (#6b7280) for breach count."""
        teams = [
            {
                "team": "QA",
                "total": 5,
                "resolved": 5,
                "open": 0,
                "pending": 0,
                "resolution_rate": 100.0,
                "avg_resolution_time": "20m",
                "sla_breaches": 0,
            }
        ]
        result = _build_team_performance_html(teams)
        # Should have gray colour for zero breaches
        self.assertIn("#6b7280", result)

    def test_multiple_teams_sorted_by_total(self):
        """Multiple teams should all appear in the output."""
        teams = [
            {
                "team": "Alpha",
                "total": 5,
                "resolved": 4,
                "open": 1,
                "pending": 0,
                "resolution_rate": 80.0,
                "avg_resolution_time": "1h",
                "sla_breaches": 0,
            },
            {
                "team": "Beta",
                "total": 10,
                "resolved": 7,
                "open": 2,
                "pending": 1,
                "resolution_rate": 70.0,
                "avg_resolution_time": "2h",
                "sla_breaches": 2,
            },
            {
                "team": "Gamma",
                "total": 3,
                "resolved": 3,
                "open": 0,
                "pending": 0,
                "resolution_rate": 100.0,
                "avg_resolution_time": "15m",
                "sla_breaches": 0,
            },
        ]
        result = _build_team_performance_html(teams)
        self.assertIn("Alpha", result)
        self.assertIn("Beta", result)
        self.assertIn("Gamma", result)
        # Count data rows (each team creates one <tr> with border-bottom style)
        self.assertEqual(result.count("border-bottom: 1px solid #f3f4f6"), 3)

    def test_returns_table_html_structure(self):
        """Output should contain proper table HTML structure with headers."""
        teams = [
            {
                "team": "Support",
                "total": 1,
                "resolved": 1,
                "open": 0,
                "pending": 0,
                "resolution_rate": 100.0,
                "avg_resolution_time": "10m",
                "sla_breaches": 0,
            }
        ]
        result = _build_team_performance_html(teams)
        # Table headers present
        self.assertIn("Team", result)
        self.assertIn("Total", result)
        self.assertIn("Resolved", result)
        self.assertIn("Rate", result)
        self.assertIn("Avg Time", result)
        self.assertIn("SLA Breaches", result)
        # Proper structure
        self.assertIn("<thead>", result)
        self.assertIn("</thead>", result)
        self.assertIn("<tbody>", result)
        self.assertIn("</tbody>", result)

    def test_missing_keys_use_defaults(self):
        """Teams with missing keys should use sensible defaults."""
        teams = [
            {
                "team": "Sparse",
                # Missing most keys
            }
        ]
        result = _build_team_performance_html(teams)
        self.assertIn("Sparse", result)
        self.assertIn("0%", result)  # Default resolution_rate is 0
        self.assertIn("N/A", result)  # Default avg_resolution_time is N/A


class TestBuildCategoryListHtml(unittest.TestCase):
    """Tests for _build_category_list_html helper."""

    def test_empty_list_returns_no_data_paragraph(self):
        """Empty top_categories list should return a 'no data' paragraph."""
        result = _build_category_list_html([])
        self.assertIn("No category data recorded", result)
        self.assertIn("<p", result)

    def test_single_category(self):
        """A single category should produce one item with name and count."""
        categories = [{"category": "Hardware", "count": 5}]
        result = _build_category_list_html(categories)
        self.assertIn("Hardware", result)
        self.assertIn("5 tickets", result)

    def test_multiple_categories(self):
        """Multiple categories should all appear in the output."""
        categories = [
            {"category": "Hardware", "count": 10},
            {"category": "Software", "count": 7},
            {"category": "Network", "count": 3},
        ]
        result = _build_category_list_html(categories)
        self.assertIn("Hardware", result)
        self.assertIn("10 tickets", result)
        self.assertIn("Software", result)
        self.assertIn("7 tickets", result)
        self.assertIn("Network", result)
        self.assertIn("3 tickets", result)

    def test_uses_flexbox_layout(self):
        """Output should use flexbox for layout."""
        categories = [{"category": "Test", "count": 1}]
        result = _build_category_list_html(categories)
        self.assertIn("display: flex", result)
        self.assertIn("justify-content: space-between", result)

    def test_returns_string_type(self):
        """Both helpers should always return strings."""
        self.assertIsInstance(_build_team_performance_html([]), str)
        self.assertIsInstance(_build_team_performance_html([{"team": "X"}]), str)
        self.assertIsInstance(_build_category_list_html([]), str)
        self.assertIsInstance(_build_category_list_html([{"category": "X", "count": 1}]), str)


if __name__ == "__main__":
    unittest.main()
