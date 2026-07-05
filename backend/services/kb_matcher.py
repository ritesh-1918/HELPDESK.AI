"""
Knowledge Base Matcher Service
--------------------------------
Suggests relevant KB articles / previously-resolved tickets as the user
types a new ticket, so they can potentially self-resolve before a ticket
is ever created (GitHub issue #3203).

Deliberately lightweight (TF-IDF, not a transformer) so it's cheap enough
to call on every debounced keystroke without adding noticeable latency,
unlike duplicate_service / rag_service which are used at full-analysis time.
"""

import os
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

MIN_QUERY_LENGTH = 12          # don't bother matching on "hi" / "help"
DEFAULT_THRESHOLD = 0.12       # TF-IDF cosine scores are lower-magnitude than embedding scores
DEFAULT_TOP_K = 3


class KBMatcherService:
    def __init__(self):
        self._loaded = False
        self._load_failed = False

        self.articles_file = os.path.join(os.path.dirname(__file__), "..", "data", "kb_articles.json")
        self.resolved_tickets_file = os.path.join(os.path.dirname(__file__), "..", "data", "knowledge_base.json")

        self._corpus_ids: list[str] = []
        self._corpus_texts: list[str] = []
        self._corpus_meta: list[dict] = []

        self.vectorizer: TfidfVectorizer | None = None
        self._matrix = None

    def is_available(self) -> bool:
        return self._loaded and not self._load_failed

    def _load_articles(self):
        if not os.path.exists(self.articles_file):
            return
        try:
            with open(self.articles_file, "r") as f:
                articles = json.load(f)
            for a in articles:
                searchable = f"{a.get('title', '')} {a.get('content', '')} {' '.join(a.get('tags', []))}"
                self._corpus_ids.append(a["id"])
                self._corpus_texts.append(searchable)
                self._corpus_meta.append({
                    "type": "kb_article",
                    "id": a["id"],
                    "title": a.get("title", ""),
                    "snippet": (a.get("content", "")[:220] + "…") if len(a.get("content", "")) > 220 else a.get("content", ""),
                    "category": a.get("category", "General"),
                })
        except Exception as e:
            print(f"[KBMatcher] Failed to load kb_articles.json: {e}")

    def _load_resolved_tickets(self):
        """Previously-resolved tickets are also useful 'someone had this exact
        problem before' suggestions, even without a formal KB article."""
        if not os.path.exists(self.resolved_tickets_file):
            return
        try:
            with open(self.resolved_tickets_file, "r") as f:
                tickets = json.load(f)
            for t in tickets:
                text = (t.get("text") or "").strip()
                # Skip junk / too-short entries (e.g. "hi", "hello", "help")
                if len(text) < 40:
                    continue
                self._corpus_ids.append(t["ticket_id"])
                self._corpus_texts.append(text)
                self._corpus_meta.append({
                    "type": "resolved_ticket",
                    "id": t["ticket_id"],
                    "title": "Similar resolved ticket",
                    "snippet": (text[:220] + "…") if len(text) > 220 else text,
                    "category": "Past Ticket",
                })
        except Exception as e:
            print(f"[KBMatcher] Failed to load resolved tickets: {e}")

    def load(self):
        if self._loaded or self._load_failed:
            return
        print("[KBMatcher] Building TF-IDF index...")
        try:
            self._load_articles()
            self._load_resolved_tickets()

            if not self._corpus_texts:
                print("[KBMatcher] No KB content found — service will return empty suggestions.")
                self._loaded = True
                return

            self.vectorizer = TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2))
            self._matrix = self.vectorizer.fit_transform(self._corpus_texts)
            self._loaded = True
            print(f"[KBMatcher] Indexed {len(self._corpus_texts)} items "
                  f"({sum(1 for m in self._corpus_meta if m['type'] == 'kb_article')} articles, "
                  f"{sum(1 for m in self._corpus_meta if m['type'] == 'resolved_ticket')} resolved tickets).")
        except Exception as e:
            allow_degraded = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") == "1"
            self._load_failed = True
            print(f"[KBMatcher] Failed to build index: {e}")
            if not allow_degraded:
                raise

    def get_suggestions(self, text: str, top_k: int = DEFAULT_TOP_K, threshold: float = DEFAULT_THRESHOLD) -> list[dict]:
        """
        Return up to top_k KB article / resolved-ticket suggestions matching `text`.
        Cheap enough to call on every debounced keystroke from the Create Ticket page.
        """
        self.load()

        if not self.is_available() or self._matrix is None:
            return []

        text = (text or "").strip()
        if len(text) < MIN_QUERY_LENGTH:
            return []

        try:
            query_vec = self.vectorizer.transform([text])
            scores = cosine_similarity(query_vec, self._matrix)[0]

            ranked = sorted(
                zip(scores, self._corpus_meta),
                key=lambda x: x[0],
                reverse=True,
            )

            results = []
            for score, meta in ranked[:top_k]:
                if score < threshold:
                    continue
                results.append({
                    **meta,
                    "similarity": round(float(score), 4),
                })
            return results
        except Exception as e:
            print(f"[KBMatcher] Suggestion query failed: {e}")
            return []


kb_matcher_service = KBMatcherService()