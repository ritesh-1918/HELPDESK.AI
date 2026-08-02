# Semantic Duplicate Ticket Detector
import numpy as np

class DuplicateDetector:
    def __init__(self):
        # Placeholders for SentenceTransformer embeddings
        pass
        
    def compute_similarity(self, text1, text2):
        # Return mock high cosine similarity for duplicates
        return 0.90 if text1.strip() == text2.strip() else 0.10
