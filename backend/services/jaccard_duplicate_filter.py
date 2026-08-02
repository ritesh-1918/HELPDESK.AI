"""
JaccardDuplicateFilter — Keyword-based text classification filter (Issue #3228).

Lightweight, zero-dependency duplicate gate that catches near-identical ticket
submissions BEFORE the heavier semantic (embedding-based) DuplicateService runs.

Algorithm:
  1. Normalize text: lowercase, strip punctuation, remove stopwords.
  2. Tokenize into a keyword set.
  3. Compute Jaccard similarity: |A ∩ B| / |A ∪ B| against each cached ticket.
  4. Only compare against tickets within the timeline window (default 24h).
  5. Flag as duplicate if similarity >= threshold (default 0.85).

Usage:
    from backend.services.jaccard_duplicate_filter import jaccard_filter

    jaccard_filter.add_ticket("ticket-123", "My printer is not working")
    result = jaccard_filter.check_duplicate("Printer not working for me")
    # → {"is_duplicate": True, "duplicate_ticket_id": "ticket-123", "similarity": 0.87}
"""

import re
import datetime
import logging
import threading
from collections import OrderedDict
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# English stopwords — common words that inflate similarity without meaning.
# Kept minimal to avoid false negatives on short ticket texts.
# ---------------------------------------------------------------------------
STOPWORDS: frozenset[str] = frozenset({
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "must",
    "i", "me", "my", "we", "our", "you", "your", "he", "she", "it",
    "they", "them", "his", "her", "its", "this", "that", "these", "those",
    "am", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "about", "between", "through", "after", "before",
    "and", "but", "or", "nor", "not", "so", "if", "then", "than",
    "very", "just", "also", "please", "thanks", "thank",
})

# Regex to strip non-alphanumeric characters (keeps spaces for splitting)
_PUNCT_RE = re.compile(r"[^\w\s]", re.UNICODE)
# Regex to collapse whitespace
_SPACE_RE = re.compile(r"\s+")

# Default configuration
DEFAULT_THRESHOLD = 0.85
DEFAULT_WINDOW_HOURS = 24
MAX_CACHE_SIZE = 1000


# ---------------------------------------------------------------------------
# Text normalization
# ---------------------------------------------------------------------------

def normalize_text(text: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    if not text:
        return ""
    result = text.lower()
    result = _PUNCT_RE.sub(" ", result)
    result = _SPACE_RE.sub(" ", result).strip()
    return result


def extract_keywords(text: str) -> set[str]:
    """
    Tokenize normalized text into a keyword set with stopwords removed.

    Returns an empty set for blank/whitespace-only input.
    """
    normalized = normalize_text(text)
    if not normalized:
        return set()
    tokens = normalized.split()
    return {t for t in tokens if t not in STOPWORDS and len(t) >= 2}


# ---------------------------------------------------------------------------
# Jaccard similarity
# ---------------------------------------------------------------------------

def jaccard_similarity(set_a: set[str], set_b: set[str]) -> float:
    """
    Compute Jaccard similarity coefficient: |A ∩ B| / |A ∪ B|.

    Returns 0.0 if either set is empty (no keywords → no match).
    Returns 1.0 if both sets are empty (edge case: identical empty texts).
    """
    if not set_a and not set_b:
        return 1.0
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union


# ---------------------------------------------------------------------------
# Cached ticket entry
# ---------------------------------------------------------------------------

class _TicketEntry:
    """In-memory cache entry for a recently-registered ticket."""

    __slots__ = ("ticket_id", "keywords", "created_at")

    def __init__(self, ticket_id: str, keywords: set[str], created_at: datetime.datetime):
        self.ticket_id = ticket_id
        self.keywords = keywords
        self.created_at = created_at


# ---------------------------------------------------------------------------
# JaccardDuplicateFilter
# ---------------------------------------------------------------------------

class JaccardDuplicateFilter:
    """
    In-memory keyword-based duplicate detector using Jaccard similarity.

    Thread-safe, LRU-bounded cache of recent ticket keyword sets.
    Designed to run as a fast pre-filter before the heavier semantic
    DuplicateService (sentence-transformers / cosine similarity).
    """

    def __init__(self, max_cache_size: int = MAX_CACHE_SIZE):
        self._cache: OrderedDict[str, _TicketEntry] = OrderedDict()
        self._max_cache_size = max_cache_size
        self._lock = threading.Lock()

    # ------------------------------------------------------------------
    # Core API
    # ------------------------------------------------------------------

    def add_ticket(
        self,
        ticket_id: str,
        text: str,
        timestamp: Optional[datetime.datetime] = None,
    ) -> None:
        """
        Register a ticket's text in the duplicate cache.

        Args:
            ticket_id:  Unique ticket identifier.
            text:       Ticket description / subject text.
            timestamp:  Creation time (defaults to now UTC).
        """
        keywords = extract_keywords(text)
        created_at = timestamp or datetime.datetime.now(datetime.UTC)
        entry = _TicketEntry(ticket_id, keywords, created_at)

        with self._lock:
            # If ticket already exists, move to end (LRU refresh)
            if ticket_id in self._cache:
                self._cache.move_to_end(ticket_id)
            self._cache[ticket_id] = entry

            # Evict oldest entries if cache exceeds max size
            while len(self._cache) > self._max_cache_size:
                self._cache.popitem(last=False)

        logger.debug(
            "[JaccardFilter] Cached ticket %s (%d keywords)",
            ticket_id, len(keywords),
        )

    def remove_ticket(self, ticket_id: str) -> bool:
        """
        Remove a ticket from the duplicate cache.

        Returns True if the ticket was found and removed.
        """
        with self._lock:
            if ticket_id in self._cache:
                del self._cache[ticket_id]
                return True
        return False

    def check_duplicate(
        self,
        text: str,
        threshold: float = DEFAULT_THRESHOLD,
        window_hours: float = DEFAULT_WINDOW_HOURS,
    ) -> dict:
        """
        Check if text is a duplicate of any recently-cached ticket.

        Args:
            text:          Incoming ticket text to check.
            threshold:     Jaccard similarity threshold (0.0–1.0). Default 0.85.
            window_hours:  Only compare against tickets created within this many
                           hours. Default 24. Set to 0 for no time filtering.

        Returns:
            {
                "is_duplicate": bool,
                "duplicate_ticket_id": str | None,
                "similarity": float,
            }
        """
        query_keywords = extract_keywords(text)

        if not query_keywords:
            return {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "similarity": 0.0,
            }

        now = datetime.datetime.now(datetime.UTC)
        best_score = 0.0
        best_ticket_id = None

        with self._lock:
            for entry in self._cache.values():
                # Timeline window filtering
                if window_hours > 0:
                    age_hours = (now - entry.created_at).total_seconds() / 3600
                    if age_hours > window_hours:
                        continue

                score = jaccard_similarity(query_keywords, entry.keywords)
                if score > best_score:
                    best_score = score
                    best_ticket_id = entry.ticket_id

        is_dup = best_score >= threshold
        return {
            "is_duplicate": is_dup,
            "duplicate_ticket_id": best_ticket_id if is_dup else None,
            "similarity": round(best_score, 4),
        }

    @property
    def cache_size(self) -> int:
        """Current number of tickets in the cache."""
        return len(self._cache)

    def clear(self) -> None:
        """Flush the entire cache."""
        with self._lock:
            self._cache.clear()


# ---------------------------------------------------------------------------
# Module-level singleton — import and use directly
# ---------------------------------------------------------------------------
jaccard_filter = JaccardDuplicateFilter()
