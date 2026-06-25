"""
Shared Model Registry
Ensures expensive models (sentence-transformers, etc.) are loaded only once
and shared across all consuming services. Eliminates redundant memory from
DuplicateService and RagService each loading their own copy of all-MiniLM-L6-v2.
"""

import os
import logging

logger = logging.getLogger(__name__)

_sentence_transformer_model = None
_sentence_transformer_loaded = False


def get_sentence_transformer():
    """Return the shared SentenceTransformer instance, loading it on first call."""
    global _sentence_transformer_model, _sentence_transformer_loaded

    if _sentence_transformer_loaded:
        return _sentence_transformer_model

    from sentence_transformers import SentenceTransformer

    model_path = os.environ.get("SENTENCE_TRANSFORMER_MODEL_PATH")
    if model_path and os.path.exists(model_path):
        logger.info("[ModelRegistry] Loading SentenceTransformer from %s", model_path)
        _sentence_transformer_model = SentenceTransformer(model_path)
    else:
        logger.info("[ModelRegistry] Loading SentenceTransformer all-MiniLM-L6-v2 from HuggingFace")
        _sentence_transformer_model = SentenceTransformer("all-MiniLM-L6-v2")

    _sentence_transformer_loaded = True
    return _sentence_transformer_model
