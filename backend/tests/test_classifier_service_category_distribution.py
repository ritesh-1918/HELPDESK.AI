"""
Unit tests for ClassifierService — Category Distribution Verification (Issue #1369)

This test module verifies that the classifier correctly distributes predictions
across all expected categories and subcategories, ensuring comprehensive coverage
and correct mapping logic.

All torch/transformers deps are mocked at module level.
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# ─── Add services directory to path ──────────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "services"))

# ─── Mock ML dependencies before importing classifier_service ────────────────

# Mock torch and its submodules
sys.modules['torch'] = MagicMock()
sys.modules['torch.nn'] = MagicMock()
sys.modules['torch.nn.functional'] = MagicMock()

# Mock transformers
sys.modules['transformers'] = MagicMock()

# Mock backend services dependencies
sys.modules['backend'] = MagicMock()
sys.modules['backend.services'] = MagicMock()
sys.modules['backend.services.cache_service'] = MagicMock()

# Now import the service under test
from classifier_service import ClassifierService, PRIORITY_MAP, TEAM_MAP, AUTO_RESOLVE_SUBS


class TestCategoryDistribution(unittest.TestCase):
    """Test that all expected categories are properly defined and mapped."""

    def test_all_priority_map_subcategories_are_strings(self):
        """Every subcategory in PRIORITY_MAP should be a string."""
        for subcategory, priority in PRIORITY_MAP.items():
            self.assertIsInstance(subcategory, str, f"Subcategory '{subcategory}' is not a string")
            self.assertIsInstance(priority, str, f"Priority '{priority}' is not a string")

    def test_all_priorities_are_valid(self):
        """Every priority in PRIORITY_MAP should be Critical, High, Medium, or Low."""
        valid_priorities = {"Critical", "High", "Medium", "Low"}
        for subcategory, priority in PRIORITY_MAP.items():
            self.assertIn(priority, valid_priorities, f"Priority '{priority}' for '{subcategory}' is not valid")

    def test_priority_distribution_coverage(self):
        """Verify all priority levels (Critical, High, Medium, Low) are used."""
        priorities_used = set(PRIORITY_MAP.values())
        expected_priorities = {"Critical", "High", "Medium", "Low"}
        
        self.assertEqual(
            priorities_used,
            expected_priorities,
            f"Not all priority levels are used. Found: {priorities_used}, Expected: {expected_priorities}"
        )

    def test_critical_priority_subcategories(self):
        """Verify critical priority has appropriate subcategories."""
        critical_subcategories = [
            subcat for subcat, priority in PRIORITY_MAP.items() 
            if priority == "Critical"
        ]
        
        # Critical should have at least 2 subcategories
        self.assertGreaterEqual(
            len(critical_subcategories),
            2,
            f"Critical priority should have at least 2 subcategories, found: {critical_subcategories}"
        )
        
        # Verify some expected critical subcategories
        expected_critical = ["Blue Screen", "Overheating", "Data Loss", "Hardware Failure"]
        for expected in expected_critical:
            self.assertIn(
                expected,
                critical_subcategories,
                f"Expected '{expected}' to be Critical priority"
            )

    def test_high_priority_subcategories(self):
        """Verify high priority has appropriate subcategories."""
        high_subcategories = [
            subcat for subcat, priority in PRIORITY_MAP.items() 
            if priority == "High"
        ]
        
        # High should have at least 3 subcategories
        self.assertGreaterEqual(
            len(high_subcategories),
            3,
            f"High priority should have at least 3 subcategories, found: {high_subcategories}"
        )
        
        # Verify some expected high priority subcategories
        expected_high = ["Application Crash", "Login Failure", "VPN Connection", "Firewall Block"]
        for expected in expected_high:
            self.assertIn(
                expected,
                high_subcategories,
                f"Expected '{expected}' to be High priority"
            )

    def test_medium_priority_subcategories(self):
        """Verify medium priority has appropriate subcategories."""
        medium_subcategories = [
            subcat for subcat, priority in PRIORITY_MAP.items() 
            if priority == "Medium"
        ]
        
        # Medium should have at least 5 subcategories
        self.assertGreaterEqual(
            len(medium_subcategories),
            5,
            f"Medium priority should have at least 5 subcategories, found: {medium_subcategories}"
        )

    def test_low_priority_subcategories(self):
        """Verify low priority has appropriate subcategories."""
        low_subcategories = [
            subcat for subcat, priority in PRIORITY_MAP.items() 
            if priority == "Low"
        ]
        
        # Low should have at least 3 subcategories
        self.assertGreaterEqual(
            len(low_subcategories),
            3,
            f"Low priority should have at least 3 subcategories, found: {low_subcategories}"
        )

    def test_auto_resolve_subcategories_exist_in_priority_map(self):
        """All auto-resolve subcategories should exist in PRIORITY_MAP."""
        for subcategory in AUTO_RESOLVE_SUBS:
            self.assertIn(
                subcategory,
                PRIORITY_MAP,
                f"Auto-resolve subcategory '{subcategory}' not found in PRIORITY_MAP"
            )

    def test_auto_resolve_subcategories_are_not_critical(self):
        """Auto-resolve subcategories should not be Critical priority."""
        for subcategory in AUTO_RESOLVE_SUBS:
            if subcategory in PRIORITY_MAP:
                priority = PRIORITY_MAP[subcategory]
                self.assertNotEqual(
                    priority,
                    "Critical",
                    f"Auto-resolve subcategory '{subcategory}' should not be Critical priority"
                )

    def test_no_duplicate_subcategory_names(self):
        """Verify no duplicate subcategory names in PRIORITY_MAP."""
        subcategory_names = list(PRIORITY_MAP.keys())
        duplicates = [name for name in subcategory_names 
                     if subcategory_names.count(name) > 1]
        
        self.assertEqual(
            len(duplicates),
            0,
            f"Duplicate subcategory names found: {set(duplicates)}"
        )

    def test_priority_map_has_minimum_coverage(self):
        """PRIORITY_MAP should have at least 20 subcategories."""
        self.assertGreaterEqual(
            len(PRIORITY_MAP),
            20,
            f"PRIORITY_MAP should have at least 20 subcategories, found {len(PRIORITY_MAP)}"
        )

    def test_team_map_has_all_expected_categories(self):
        """TEAM_MAP should have Access, Network, Software, Hardware categories."""
        expected_categories = {"Access", "Network", "Software", "Hardware"}
        actual_categories = set(TEAM_MAP.keys())
        
        self.assertEqual(
            actual_categories,
            expected_categories,
            f"TEAM_MAP categories mismatch. Expected: {expected_categories}, Found: {actual_categories}"
        )

    def test_team_map_values_are_non_empty_strings(self):
        """All team names should be non-empty strings."""
        for category, team in TEAM_MAP.items():
            self.assertIsInstance(team, str, f"Team for '{category}' is not a string")
            self.assertGreater(len(team.strip()), 0, f"Team for '{category}' is empty")


class TestClassifierServiceInitialization(unittest.TestCase):
    """Test ClassifierService initialization and model loading."""

    def setUp(self):
        """Set up test fixtures."""
        self.service = ClassifierService()

    def test_service_initialization(self):
        """Test that ClassifierService initializes correctly."""
        self.assertIsNotNone(self.service)
        self.assertFalse(self.service._loaded)
        self.assertIsNone(self.service.model)
        self.assertIsNone(self.service.tokenizer)
        self.assertIsNone(self.service.id2label)
        self.assertIsNone(self.service.label2id)

    def test_service_multiple_instances_are_independent(self):
        """Test that multiple ClassifierService instances are independent."""
        service2 = ClassifierService()
        
        self.service._loaded = True
        self.assertFalse(service2._loaded)
        
        self.service.model = MagicMock()
        self.assertIsNone(service2.model)


if __name__ == '__main__':
    unittest.main()
