"""
Test suite for Jaccard similarity duplicate filter — Issue #3228.

Covers:
  - Identical / near-duplicate text detection
  - Different text passing through
  - Empty / whitespace input handling
  - Timeline window filtering
  - Custom threshold sensitivity
  - Stopword removal effects
  - LRU cache eviction
  - Add / remove ticket operations
  - Jaccard math correctness
  - Case insensitivity
  - Punctuation normalization
"""

import datetime
import pytest

from backend.services.jaccard_duplicate_filter import (
    JaccardDuplicateFilter,
    extract_keywords,
    jaccard_similarity,
    normalize_text,
)


# ============================================================================
# Fixtures
# ============================================================================


@pytest.fixture
def service():
    """Fresh JaccardDuplicateFilter instance for each test."""
    return JaccardDuplicateFilter(max_cache_size=100)


@pytest.fixture
def populated_service(service):
    """Service pre-loaded with a few tickets."""
    service.add_ticket("TKT-001", "My printer is not working at all")
    service.add_ticket("TKT-002", "Cannot login to the VPN from office laptop")
    service.add_ticket("TKT-003", "Email server is down and not responding")
    return service


# ============================================================================
# Test: Identical texts detected
# ============================================================================


class TestIdenticalTexts:

    def test_exact_duplicate_detected(self, service):
        service.add_ticket("TKT-001", "Printer not working")
        result = service.check_duplicate("Printer not working")

        assert result["is_duplicate"] is True
        assert result["duplicate_ticket_id"] == "TKT-001"
        assert result["similarity"] == 1.0

    def test_same_text_different_casing(self, service):
        service.add_ticket("TKT-001", "PRINTER NOT WORKING")
        result = service.check_duplicate("printer not working")

        assert result["is_duplicate"] is True
        assert result["similarity"] == 1.0


# ============================================================================
# Test: Near-duplicate detection
# ============================================================================


class TestNearDuplicate:

    def test_minor_word_change_detected(self, service):
        service.add_ticket("TKT-001", "My printer is not working at all")
        result = service.check_duplicate(
            "The printer is not working anymore",
            threshold=0.5,
        )

        assert result["is_duplicate"] is True
        assert result["similarity"] >= 0.5

    def test_reworded_same_issue(self, service):
        service.add_ticket("TKT-001", "Cannot connect to wifi network")
        result = service.check_duplicate(
            "wifi network connection failing",
            threshold=0.25,
        )

        assert result["is_duplicate"] is True
        assert result["similarity"] >= 0.25


# ============================================================================
# Test: Different texts pass through
# ============================================================================


class TestDifferentTexts:

    def test_unrelated_texts_not_flagged(self, populated_service):
        result = populated_service.check_duplicate(
            "How do I reset my password on the mobile app?"
        )

        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None

    def test_low_similarity_below_threshold(self, service):
        service.add_ticket("TKT-001", "Printer paper jam error")
        result = service.check_duplicate("Network latency during video calls")

        assert result["is_duplicate"] is False
        assert result["similarity"] < 0.5


# ============================================================================
# Test: Empty text handling
# ============================================================================


class TestEmptyTextHandling:

    def test_empty_string_query(self, populated_service):
        result = populated_service.check_duplicate("")

        assert result["is_duplicate"] is False
        assert result["similarity"] == 0.0

    def test_whitespace_only_query(self, populated_service):
        result = populated_service.check_duplicate("   \t\n  ")

        assert result["is_duplicate"] is False
        assert result["similarity"] == 0.0

    def test_add_empty_text_ticket(self, service):
        service.add_ticket("TKT-001", "")
        assert service.cache_size == 1

        result = service.check_duplicate("some query text")
        assert result["is_duplicate"] is False

    def test_stopwords_only_text(self, service):
        """Text containing only stopwords yields an empty keyword set."""
        service.add_ticket("TKT-001", "the is a an to for")
        result = service.check_duplicate("is a the an")
        assert result["is_duplicate"] is False


# ============================================================================
# Test: Timeline window filtering
# ============================================================================


class TestTimelineWindow:

    def test_recent_ticket_within_window(self, service):
        now = datetime.datetime.now(datetime.UTC)
        service.add_ticket("TKT-001", "Printer broken", timestamp=now)
        result = service.check_duplicate("Printer broken", window_hours=24)

        assert result["is_duplicate"] is True

    def test_old_ticket_outside_window(self, service):
        old_time = datetime.datetime.now(datetime.UTC) - datetime.timedelta(hours=48)
        service.add_ticket("TKT-001", "Printer broken", timestamp=old_time)
        result = service.check_duplicate("Printer broken", window_hours=24)

        assert result["is_duplicate"] is False
        assert result["duplicate_ticket_id"] is None

    def test_zero_window_disables_filtering(self, service):
        old_time = datetime.datetime.now(datetime.UTC) - datetime.timedelta(days=365)
        service.add_ticket("TKT-001", "Printer broken", timestamp=old_time)
        result = service.check_duplicate("Printer broken", window_hours=0)

        assert result["is_duplicate"] is True

    def test_boundary_exactly_at_window_edge(self, service):
        """Ticket at exactly window_hours ago should be excluded (age > window)."""
        edge_time = datetime.datetime.now(datetime.UTC) - datetime.timedelta(hours=24, seconds=1)
        service.add_ticket("TKT-001", "Printer broken", timestamp=edge_time)
        result = service.check_duplicate("Printer broken", window_hours=24)

        assert result["is_duplicate"] is False


# ============================================================================
# Test: Custom threshold
# ============================================================================


class TestCustomThreshold:

    def test_strict_threshold_rejects_near_match(self, service):
        service.add_ticket("TKT-001", "printer paper jam office desk")
        result = service.check_duplicate(
            "printer paper jam desk table chair",
            threshold=0.95,
        )

        assert result["is_duplicate"] is False

    def test_loose_threshold_accepts_partial_match(self, service):
        service.add_ticket("TKT-001", "printer paper jam office")
        result = service.check_duplicate(
            "printer paper jam different location",
            threshold=0.3,
        )

        assert result["is_duplicate"] is True


# ============================================================================
# Test: Stopword removal
# ============================================================================


class TestStopwordRemoval:

    def test_stopwords_do_not_inflate_similarity(self):
        kw1 = extract_keywords("I am having a very big problem with my printer")
        kw2 = extract_keywords("The problem with the printer is serious")

        # Without stopword removal these would share many more tokens
        sim = jaccard_similarity(kw1, kw2)
        assert sim < 1.0  # Not identical — only "problem" and "printer" overlap

        # The shared keywords should be "problem" and "printer"
        assert "problem" in kw1
        assert "printer" in kw1
        assert kw1 & kw2 == {"problem", "printer"}


# ============================================================================
# Test: Cache eviction
# ============================================================================


class TestCacheEviction:

    def test_cache_respects_max_size(self):
        service = JaccardDuplicateFilter(max_cache_size=5)

        for i in range(10):
            service.add_ticket(f"TKT-{i:03d}", f"Ticket number {i} about topic {i}")

        assert service.cache_size == 5

    def test_oldest_entries_evicted_first(self):
        service = JaccardDuplicateFilter(max_cache_size=3)
        service.add_ticket("TKT-001", "first ticket about printers")
        service.add_ticket("TKT-002", "second ticket about network")
        service.add_ticket("TKT-003", "third ticket about email")
        service.add_ticket("TKT-004", "fourth ticket about vpn")

        # TKT-001 should have been evicted
        result = service.check_duplicate("first ticket about printers")
        assert result["duplicate_ticket_id"] != "TKT-001"

    def test_clear_empties_cache(self, populated_service):
        assert populated_service.cache_size > 0
        populated_service.clear()
        assert populated_service.cache_size == 0


# ============================================================================
# Test: Add and remove ticket
# ============================================================================


class TestAddRemoveTicket:

    def test_add_ticket_increases_cache(self, service):
        assert service.cache_size == 0
        service.add_ticket("TKT-001", "Test ticket")
        assert service.cache_size == 1

    def test_remove_ticket_decreases_cache(self, service):
        service.add_ticket("TKT-001", "Test ticket")
        removed = service.remove_ticket("TKT-001")

        assert removed is True
        assert service.cache_size == 0

    def test_remove_nonexistent_returns_false(self, service):
        removed = service.remove_ticket("NONEXISTENT")
        assert removed is False

    def test_removed_ticket_not_matched(self, service):
        service.add_ticket("TKT-001", "Printer broken")
        service.remove_ticket("TKT-001")
        result = service.check_duplicate("Printer broken")

        assert result["is_duplicate"] is False


# ============================================================================
# Test: Jaccard math correctness
# ============================================================================


class TestJaccardMath:

    def test_identical_sets(self):
        assert jaccard_similarity({"a", "b", "c"}, {"a", "b", "c"}) == 1.0

    def test_disjoint_sets(self):
        assert jaccard_similarity({"a", "b"}, {"c", "d"}) == 0.0

    def test_partial_overlap(self):
        # {a, b, c} ∩ {b, c, d} = {b, c} → 2
        # {a, b, c} ∪ {b, c, d} = {a, b, c, d} → 4
        # Jaccard = 2/4 = 0.5
        assert jaccard_similarity({"a", "b", "c"}, {"b", "c", "d"}) == 0.5

    def test_both_empty(self):
        assert jaccard_similarity(set(), set()) == 1.0

    def test_one_empty(self):
        assert jaccard_similarity({"a"}, set()) == 0.0
        assert jaccard_similarity(set(), {"a"}) == 0.0

    def test_single_element_match(self):
        assert jaccard_similarity({"a"}, {"a"}) == 1.0


# ============================================================================
# Test: Case insensitivity
# ============================================================================


class TestCaseInsensitivity:

    def test_mixed_case_normalization(self):
        kw1 = extract_keywords("Login Failed ERROR")
        kw2 = extract_keywords("login failed error")

        assert kw1 == kw2

    def test_case_insensitive_duplicate_check(self, service):
        service.add_ticket("TKT-001", "Login Failed Error")
        result = service.check_duplicate("login failed error")

        assert result["is_duplicate"] is True
        assert result["similarity"] == 1.0


# ============================================================================
# Test: Punctuation normalization
# ============================================================================


class TestPunctuationNormalization:

    def test_punctuation_stripped(self):
        kw1 = extract_keywords("Can't login!")
        kw2 = extract_keywords("cant login")

        assert "login" in kw1
        assert "login" in kw2
        # "can't" → "can t" → {"can", "login"} vs {"cant", "login"}
        # They share "login" at minimum
        assert "login" in (kw1 & kw2)

    def test_punctuation_insensitive_check(self, service):
        service.add_ticket("TKT-001", "Printer---not...working!!!")
        result = service.check_duplicate("printer not working")

        assert result["is_duplicate"] is True
        assert result["similarity"] == 1.0

    def test_special_characters_removed(self):
        text = "Error @#$% code: 500!!! on server"
        normalized = normalize_text(text)

        assert "@" not in normalized
        assert "#" not in normalized
        assert "!" not in normalized
