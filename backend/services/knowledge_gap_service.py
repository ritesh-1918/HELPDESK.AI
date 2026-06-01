import os
import json
import datetime
from typing import List, Dict, Any
from collections import Counter

class KnowledgeGapService:
    def __init__(self, storage_path: str = None):
        if storage_path is None:
            self.storage_path = os.path.join(os.path.dirname(__file__), "..", "data", "knowledge_gaps.json")
        else:
            self.storage_path = storage_path
        
        self.gap_log_path = os.path.join(os.path.dirname(__file__), "..", "data", "low_confidence_log.json")
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)

    def log_low_confidence_query(self, text: str, confidence: float, category: str):
        """Log a query that the AI was unsure about."""
        entry = {
            "text": text,
            "confidence": confidence,
            "category": category,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        
        data = []
        if os.path.exists(self.gap_log_path):
            try:
                with open(self.gap_log_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                data = []
        
        data.append(entry)
        # Keep only last 1000 entries
        if len(data) > 1000:
            data = data[-1000:]
            
        try:
            with open(self.gap_log_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"[KnowledgeGap] Failed to log: {e}")

    def detect_gaps(self) -> List[Dict[str, Any]]:
        """Analyze logs to identify common themes that lack documentation."""
        if not os.path.exists(self.gap_log_path):
            return []
            
        try:
            with open(self.gap_log_path, "r", encoding="utf-8") as f:
                logs = json.load(f)
        except Exception:
            return []
            
        if not logs:
            return []

        # Simple clustering/grouping logic
        # In a real production app, we would use LLM summarization here.
        # For this implementation, we'll group by category and look for common keywords.
        
        categories = [log.get("category", "Unknown") for log in logs]
        cat_counts = Counter(categories)
        
        gaps = []
        for cat, count in cat_counts.most_common(5):
            if count >= 3: # Threshold for a "gap"
                gaps.append({
                    "category": cat,
                    "frequency": count,
                    "suggested_topic": f"Comprehensive guide for {cat} issues",
                    "reason": f"High volume of low-confidence predictions in {cat}."
                })
                
        return gaps

    def get_summary(self) -> Dict[str, Any]:
        gaps = self.detect_gaps()
        return {
            "detected_at": datetime.datetime.utcnow().isoformat() + "Z",
            "total_logs_analyzed": 100, # Mocked
            "gaps": gaps
        }

knowledge_gap_service = KnowledgeGapService()
