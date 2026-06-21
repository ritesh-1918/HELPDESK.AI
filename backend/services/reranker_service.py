import re
import datetime
from typing import List, Dict, Any

class RerankerService:
    def __init__(self):
        # standard english stop words to ignore in keyword overlap
        self.stop_words = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", 
            "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", 
            "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", 
            "did", "didn", "do", "does", "doesn", "doing", "don", "down", "during", "each", 
            "few", "for", "from", "further", "had", "hadn", "has", "hasn", "have", "haven", 
            "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", 
            "i", "if", "in", "into", "is", "isn", "it", "its", "itself", "just", "me", "more", 
            "most", "mustn", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", 
            "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", 
            "shan", "she", "should", "shouldn", "so", "some", "such", "than", "that", "the", 
            "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", 
            "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn", 
            "we", "were", "weren", "what", "when", "where", "which", "while", "who", "whom", 
            "why", "with", "won", "would", "wouldn", "you", "your", "yours", "yourself", "yourselves"
        }

    def _get_words(self, text: str) -> set:
        words = re.findall(r'\b\w+\b', text.lower())
        return {w for w in words if w not in self.stop_words}

    def rerank(self, query: str, candidates: List[Dict[str, Any]], limit: int = 5) -> List[Dict[str, Any]]:
        """
        Reranks top candidates based on:
        - Semantic Score (using the precomputed hybrid confidence score)
        - Keyword overlap ratio
        - Resolution success rate (effectiveness)
        - Document recency (recency of ticket or default 1.0 for articles)
        - Document quality (based on length and completeness)
        """
        if not candidates:
            return []

        query_words = self._get_words(query)
        reranked_results = []
        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

        for doc in candidates:
            # 1. Semantic score (from hybrid confidence, normalized)
            semantic_score = doc.get("confidence", 0.0)

            # 2. Keyword overlap ratio
            doc_text = (doc.get("title") or "") + " " + (doc.get("content") or "")
            doc_words = self._get_words(doc_text)
            if query_words:
                overlap_ratio = len(query_words.intersection(doc_words)) / len(query_words)
            else:
                overlap_ratio = 0.0

            # 3. Resolution success rate (effectiveness)
            effectiveness_str = doc.get("resolution_effectiveness")
            if effectiveness_str:
                try:
                    # Parse percentage e.g. "94%" or float
                    effectiveness = float(effectiveness_str.replace("%", "")) / 100.0
                except ValueError:
                    effectiveness = 0.85
            else:
                # Default success rates
                if doc.get("source") == "Ticket":
                    effectiveness = 0.80
                else:
                    effectiveness = 0.90

            # 4. Ticket recency score
            recency_score = 1.0
            created_at_str = doc.get("created_at")
            if created_at_str and doc.get("source") == "Ticket":
                try:
                    # Handle common ISO formats
                    clean_date_str = created_at_str.replace("Z", "")
                    # split decimal seconds if present
                    if "." in clean_date_str:
                        clean_date_str = clean_date_str.split(".")[0]
                    created_at = datetime.datetime.fromisoformat(clean_date_str)
                    age_in_days = (now - created_at).days
                    if age_in_days < 0:
                        age_in_days = 0
                    recency_score = 1.0 / (1.0 + age_in_days / 30.0)
                except Exception as ex:
                    # fallback to default
                    recency_score = 0.8

            # 5. Document quality score
            doc_len = len(doc.get("content") or "")
            quality_score = min(doc_len / 500.0, 1.0)
            if doc.get("title"):
                quality_score = min(quality_score + 0.2, 1.0)

            # Weighted Rerank Score Formula
            rerank_score = (
                0.40 * semantic_score +
                0.20 * overlap_ratio +
                0.15 * effectiveness +
                0.15 * recency_score +
                0.10 * quality_score
            )

            # Enrich and add
            effectiveness_pct = f"{int(effectiveness * 100)}%"
            reranked_doc = {
                **doc,
                "confidence": round(rerank_score, 4),
                "resolution_effectiveness": effectiveness_pct
            }
            reranked_results.append(reranked_doc)

        # Re-sort based on the new confidence score
        reranked_results.sort(key=lambda x: x["confidence"], reverse=True)
        return reranked_results[:limit]
