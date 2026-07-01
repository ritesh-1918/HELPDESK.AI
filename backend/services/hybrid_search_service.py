import re
import math
from typing import List, Dict, Any

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = sum(a * a for a in v1) ** 0.5
    norm_b = sum(b * b for b in v2) ** 0.5
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)

class BM25:
    def __init__(self, corpus: List[List[str]]):
        self.corpus_size = len(corpus)
        self.avgdl = sum(len(doc) for doc in corpus) / self.corpus_size if self.corpus_size > 0 else 0
        self.doc_freqs = []
        self.idf = {}
        self.doc_len = []
        self.initialize(corpus)

    def initialize(self, corpus: List[List[str]]):
        nd = {}
        for doc in corpus:
            self.doc_len.append(len(doc))
            frequencies = {}
            for word in doc:
                frequencies[word] = frequencies.get(word, 0) + 1
            self.doc_freqs.append(frequencies)
            for word in frequencies:
                nd[word] = nd.get(word, 0) + 1
        for word, freq in nd.items():
            # Standard BM25 IDF
            self.idf[word] = math.log((self.corpus_size - freq + 0.5) / (freq + 0.5) + 1.0)

    def get_scores(self, query: List[str], k1: float = 1.5, b: float = 0.75) -> List[float]:
        scores = []
        if self.corpus_size == 0:
            return scores
        for index in range(self.corpus_size):
            score = 0.0
            doc_len = self.doc_len[index]
            frequencies = self.doc_freqs[index]
            for word in query:
                if word not in frequencies:
                    continue
                freq = frequencies[word]
                numerator = self.idf.get(word, 0.0) * freq * (k1 + 1)
                denominator = freq + k1 * (1 - b + b * doc_len / self.avgdl)
                score += numerator / denominator
            scores.append(score)
        return scores

class HybridSearchService:
    def __init__(self, vector_weight: float = 0.60, keyword_weight: float = 0.40):
        self.vector_weight = vector_weight
        self.keyword_weight = keyword_weight

    def clean_text(self, text: str) -> List[str]:
        # Simple lowercase tokenizer
        return re.findall(r'\b\w+\b', text.lower())

    def search(
        self, 
        query: str, 
        query_embedding: List[float], 
        candidates: List[Dict[str, Any]], 
        model: Any = None
    ) -> List[Dict[str, Any]]:
        """
        Runs hybrid search over a list of candidate documents.
        Each candidate is a dict containing at least:
        - 'title'
        - 'content'
        - 'source'
        Optional fields:
        - 'embedding': pre-computed list of floats
        - 'similarity': pre-computed semantic similarity score
        """
        if not candidates:
            return []

        # Tokenize query
        query_tokens = self.clean_text(query)

        # 1. Compute keyword score (BM25)
        # Prepare corpus from candidates (combining title and content)
        corpus = [self.clean_text((doc.get("title") or "") + " " + (doc.get("content") or "")) for doc in candidates]
        bm25 = BM25(corpus)
        bm25_scores = bm25.get_scores(query_tokens)
        max_bm25 = max(bm25_scores) if bm25_scores else 0.0

        # Normalize BM25 scores to [0.0, 1.0]
        normalized_keyword_scores = []
        for score in bm25_scores:
            if max_bm25 > 0.0:
                normalized_keyword_scores.append(score / max_bm25)
            else:
                normalized_keyword_scores.append(0.0)

        # 2. Compute semantic score (cosine similarity)
        scored_results = []
        for idx, doc in enumerate(candidates):
            # Calculate or reuse vector similarity
            vector_score = doc.get("similarity")
            if vector_score is None:
                doc_emb = doc.get("embedding")
                if doc_emb is None and model is not None:
                    # Generate embedding on the fly for local matching if not present
                    doc_text = (doc.get("title") or "") + " " + (doc.get("content") or "")
                    try:
                        doc_emb = model.encode(doc_text).tolist()
                    except Exception as e:
                        print(f"[HybridSearchService] Encoding error: {e}")
                        doc_emb = None
                
                if doc_emb is not None:
                    vector_score = cosine_similarity(query_embedding, doc_emb)
                else:
                    vector_score = 0.0
            
            keyword_score = normalized_keyword_scores[idx]
            
            # Hybrid formula
            final_score = (self.vector_weight * vector_score) + (self.keyword_weight * keyword_score)

            # Build enriched result doc
            enriched_doc = {
                **doc,
                "similarity_score": round(vector_score, 4),
                "keyword_score": round(keyword_score, 4),
                "confidence": round(final_score, 4)
            }
            # Remove raw embedding to keep response size optimal
            if "embedding" in enriched_doc:
                del enriched_doc["embedding"]
                
            scored_results.append(enriched_doc)

        # Sort by confidence descending
        scored_results.sort(key=lambda x: x["confidence"], reverse=True)
        return scored_results
