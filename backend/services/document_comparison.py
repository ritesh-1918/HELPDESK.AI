"""
Multi-Document Legal Comparison Service.

Compares up to 5 documents, identifies similarities, differences,
and generates a structured comparison report.
"""

import re
from typing import Optional


class DocumentComparisonService:
    """Compare multiple documents and extract structured differences."""

    @classmethod
    def compare(cls, documents: list[dict], gemini_service=None) -> dict:
        """
        documents: list of {"id": str, "title": str, "text": str}
        Returns a comparison report.
        """
        if len(documents) < 2:
            return {
                "error": "At least two documents are required for comparison.",
                "comparisons": [],
                "summary": "",
            }

        texts = [d["text"] for d in documents]
        titles = [d.get("title", f"Doc {i+1}") for i, d in enumerate(documents)]

        pairwise = cls._pairwise_comparison(texts, titles)
        global_similarity = cls._global_similarity(texts)
        global_diff_summary = cls._global_diff_summary(texts, titles)
        key_terms = cls._extract_key_terms(texts)

        result = {
            "document_count": len(documents),
            "titles": titles,
            "global_similarity": round(global_similarity, 4),
            "pairwise_comparisons": pairwise,
            "key_terms_shared": key_terms["shared"],
            "key_terms_unique": key_terms["unique"],
            "summary": global_diff_summary,
        }

        if gemini_service and gemini_service._initialized:
            try:
                ai_summary = cls._ai_summary(documents, gemini_service)
                result["ai_analysis"] = ai_summary
            except Exception as e:
                print(f"[DocComparison] AI analysis failed: {e}")
                result["ai_analysis"] = None

        return result

    @classmethod
    def _pairwise_comparison(cls, texts: list[str], titles: list[str]) -> list[dict]:
        comparisons = []
        for i in range(len(texts)):
            for j in range(i + 1, len(texts)):
                sim = cls._text_similarity(texts[i], texts[j])
                diffs = cls._find_differences(texts[i], texts[j], titles[i], titles[j])
                comparisons.append({
                    "doc_a_index": i,
                    "doc_a_title": titles[i],
                    "doc_b_index": j,
                    "doc_b_title": titles[j],
                    "similarity": round(sim, 4),
                    "differences": diffs,
                })
        return comparisons

    @classmethod
    def _text_similarity(cls, text_a: str, text_b: str) -> float:
        if not text_a.strip() or not text_b.strip():
            return 0.0
        words_a = set(text_a.lower().split())
        words_b = set(text_b.lower().split())
        if not words_a or not words_b:
            return 0.0
        intersection = words_a & words_b
        union = words_a | words_b
        return len(intersection) / len(union)

    @classmethod
    def _find_differences(cls, text_a: str, text_b: str, title_a: str, title_b: str) -> list[dict]:
        sentences_a = set(re.split(r'[.!?]+', text_a.lower()))
        sentences_b = set(re.split(r'[.!?]+', text_b.lower()))
        only_a = sentences_a - sentences_b
        only_b = sentences_b - sentences_a
        diffs = []
        for s in only_a:
            if len(s.strip()) > 10:
                diffs.append({"type": "unique_to", "document": title_a, "text": s.strip()})
        for s in only_b:
            if len(s.strip()) > 10:
                diffs.append({"type": "unique_to", "document": title_b, "text": s.strip()})
        return diffs[:20]

    @classmethod
    def _global_similarity(cls, texts: list[str]) -> float:
        if not texts:
            return 0.0
        word_sets = [set(t.lower().split()) for t in texts if t.strip()]
        if len(word_sets) < 2:
            return 1.0
        common = word_sets[0]
        for ws in word_sets[1:]:
            common = common & ws
        all_words = set()
        for ws in word_sets:
            all_words = all_words | ws
        return len(common) / len(all_words) if all_words else 0.0

    @classmethod
    def _global_diff_summary(cls, texts: list[str], titles: list[str]) -> str:
        sim = cls._global_similarity(texts)
        if sim > 0.8:
            return f"All documents are highly similar ({sim:.0%} shared vocabulary)."
        elif sim > 0.5:
            return f"Documents share moderate similarity ({sim:.0%} shared vocabulary). Significant differences exist."
        else:
            return f"Documents are largely different ({sim:.0%} shared vocabulary). Review pairwise comparisons for details."

    @classmethod
    def _extract_key_terms(cls, texts: list[str]) -> dict:
        from collections import Counter
        all_words = []
        for text in texts:
            words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
            all_words.extend(w.lower() for w in words)
        if not all_words:
            return {"shared": [], "unique": []}
        word_freq = Counter(all_words)
        common = word_freq.most_common(15)
        return {
            "shared": [{"term": w, "frequency": f} for w, f in common if f >= 2],
            "unique": [{"term": w, "frequency": f} for w, f in common if f < 2][:10],
        }

    @classmethod
    def _ai_summary(cls, documents: list[dict], gemini_service) -> str:
        prompt = "You are a legal document analyst. Compare the following documents and provide:\n"
        prompt += "1. Key similarities between the documents\n"
        prompt += "2. Important differences or discrepancies\n"
        prompt += "3. Any potential issues or clauses that need attention\n\n"
        for doc in documents:
            title = doc.get("title", "Untitled")
            text = doc.get("text", "")
            prompt += f"--- {title} ---\n{text[:2000]}\n\n"
        prompt += "\nProvide a concise, professional analysis."
        response = gemini_service.client.models.generate_content(
            model=gemini_service.model_name,
            contents=prompt
        )
        return response.text.strip()
