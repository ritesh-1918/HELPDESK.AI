"""
Vectorized cosine similarity computations using NumPy.

Provides a drop-in replacement for sentence_transformers.util.cos_sim that
operates entirely on NumPy arrays, eliminating the PyTorch dependency for
the similarity search step.

Performance:
  - A single matrix-vector multiply computes the similarity of one query
    against N stored embeddings in O(N·d) FLOPS — identical to PyTorch's
    batched approach but without GPU memory overhead.
  - When embeddings are L2-normalised (all-MiniLM-L6-v2 with
    normalize_embeddings=True), cosine similarity equals the dot product,
    so no explicit normalisation is needed inside this module.
  - np.float32 reduces memory by half vs float64 with no accuracy loss for
    this use-case (embeddings are bounded in [-1, 1]).

ONNX Runtime path:
  When `onnxruntime` is available and a model path is configured via the
  ONNX_EMBEDDING_MODEL_PATH environment variable, `OnnxEncoder` provides
  embedding generation without requiring the full sentence_transformers
  package.  Falls back to sentence_transformers automatically.
"""

from __future__ import annotations

import logging
import os
from typing import TYPE_CHECKING

import numpy as np

if TYPE_CHECKING:
    from numpy.typing import NDArray

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Vectorized cosine similarity
# ---------------------------------------------------------------------------

def cosine_similarity_matrix(
    query: "NDArray[np.float32]",
    corpus: "NDArray[np.float32]",
) -> "NDArray[np.float32]":
    """
    Compute cosine similarity between a single query vector and a corpus matrix.

    Args:
        query:  1-D array of shape (d,) or 2-D array of shape (1, d).
                Must be L2-normalised (∥query∥₂ = 1).
        corpus: 2-D array of shape (N, d).
                Must be L2-normalised (∥row∥₂ = 1 for each row).

    Returns:
        1-D float32 array of shape (N,) containing similarity scores in [-1, 1].

    Raises:
        ValueError: if shapes are incompatible.

    Note:
        For L2-normalised vectors, cosine_similarity(a, b) == a @ b.
        This is the same algorithm used by sentence_transformers.util.cos_sim
        but implemented in pure NumPy (no PyTorch required).
    """
    q = np.asarray(query, dtype=np.float32)
    c = np.asarray(corpus, dtype=np.float32)

    if q.ndim == 2:
        q = q.ravel()

    if q.ndim != 1:
        raise ValueError(f"query must be 1-D or (1, d), got shape {q.shape}")
    if c.ndim != 2:
        raise ValueError(f"corpus must be 2-D (N, d), got shape {c.shape}")
    if q.shape[0] != c.shape[1]:
        raise ValueError(
            f"Dimension mismatch: query has {q.shape[0]} dims, "
            f"corpus rows have {c.shape[1]} dims"
        )

    # For normalised vectors: sim(q, cᵢ) = q · cᵢ
    return c @ q  # shape (N,)


def top_k_similar(
    query: "NDArray[np.float32]",
    corpus: "NDArray[np.float32]",
    k: int = 1,
) -> tuple[list[float], list[int]]:
    """
    Return the top-k most similar corpus entries for a query.

    Args:
        query:  L2-normalised query embedding (1-D or 2-D of shape (1, d)).
        corpus: L2-normalised corpus matrix (N, d).
        k:      Number of top results to return.

    Returns:
        (scores, indices) — both sorted descending by similarity score.
        scores: list of float in [-1, 1]
        indices: list of int into corpus rows
    """
    scores = cosine_similarity_matrix(query, corpus)
    k = min(k, len(scores))

    # argpartition for O(N) partial sort, then sort the top-k subset
    top_idx = np.argpartition(scores, -k)[-k:]
    top_idx = top_idx[np.argsort(scores[top_idx])[::-1]]

    return scores[top_idx].tolist(), top_idx.tolist()


def best_match(
    query: "NDArray[np.float32]",
    corpus: "NDArray[np.float32]",
) -> tuple[float, int]:
    """
    Return the single best cosine similarity score and its corpus index.

    Args:
        query:  L2-normalised query embedding.
        corpus: L2-normalised corpus matrix (N, d).

    Returns:
        (best_score, best_index) — float in [-1, 1] and int.
    """
    scores = cosine_similarity_matrix(query, corpus)
    idx = int(np.argmax(scores))
    return float(scores[idx]), idx


# ---------------------------------------------------------------------------
# ONNX Runtime encoder (optional, no sentence_transformers required)
# ---------------------------------------------------------------------------

class OnnxEncoder:
    """
    Sentence embedding encoder backed by ONNX Runtime.

    Loads a pre-exported all-MiniLM-L6-v2 ONNX model and provides an
    encode() interface compatible with SentenceTransformer.encode().

    Configuration:
        ONNX_EMBEDDING_MODEL_PATH — directory containing model.onnx,
                                    tokenizer.json, tokenizer_config.json
    """

    def __init__(self, model_dir: str | None = None):
        self._session = None
        self._tokenizer = None
        self._available = False
        self._model_dir = model_dir or os.getenv("ONNX_EMBEDDING_MODEL_PATH", "")
        self._load()

    def _load(self) -> None:
        if not self._model_dir or not os.path.isdir(self._model_dir):
            logger.debug("[OnnxEncoder] No model directory configured — disabled")
            return

        try:
            import onnxruntime as ort
            from tokenizers import Tokenizer

            model_path = os.path.join(self._model_dir, "model.onnx")
            tokenizer_path = os.path.join(self._model_dir, "tokenizer.json")

            if not os.path.exists(model_path) or not os.path.exists(tokenizer_path):
                logger.warning(
                    "[OnnxEncoder] model.onnx or tokenizer.json not found in %s",
                    self._model_dir,
                )
                return

            self._session = ort.InferenceSession(
                model_path,
                providers=["CPUExecutionProvider"],
            )
            self._tokenizer = Tokenizer.from_file(tokenizer_path)
            self._available = True
            logger.info("[OnnxEncoder] Loaded ONNX model from %s", self._model_dir)

        except ImportError as exc:
            logger.debug("[OnnxEncoder] Optional deps missing: %s", exc)
        except Exception as exc:
            logger.warning("[OnnxEncoder] Load failed: %s", exc)

    @property
    def is_available(self) -> bool:
        return self._available

    def encode(
        self,
        texts: str | list[str],
        *,
        normalize_embeddings: bool = True,
    ) -> "NDArray[np.float32]":
        """
        Encode one or more texts into embeddings using ONNX Runtime.

        Args:
            texts:               Single string or list of strings.
            normalize_embeddings: L2-normalise the output (default: True).

        Returns:
            float32 ndarray of shape (N, d) where d = 384 for MiniLM-L6-v2.

        Raises:
            RuntimeError: if the encoder was not loaded successfully.
        """
        if not self._available or self._session is None or self._tokenizer is None:
            raise RuntimeError(
                "OnnxEncoder is not available. "
                "Set ONNX_EMBEDDING_MODEL_PATH to a directory containing "
                "model.onnx and tokenizer.json."
            )

        if isinstance(texts, str):
            texts = [texts]

        encodings = self._tokenizer.encode_batch(texts)

        input_ids = np.array([e.ids for e in encodings], dtype=np.int64)
        attention_mask = np.array([e.attention_mask for e in encodings], dtype=np.int64)
        token_type_ids = np.zeros_like(input_ids, dtype=np.int64)

        outputs = self._session.run(
            None,
            {
                "input_ids": input_ids,
                "attention_mask": attention_mask,
                "token_type_ids": token_type_ids,
            },
        )

        # Mean pooling over token dimension, masked by attention
        token_embeddings = outputs[0].astype(np.float32)  # (N, seq_len, d)
        mask = attention_mask[:, :, np.newaxis].astype(np.float32)

        # Expand mask and sum along sequence dimension
        sum_embeddings = (token_embeddings * mask).sum(axis=1)
        sum_mask = mask.sum(axis=1).clip(min=1e-9)
        embeddings = sum_embeddings / sum_mask  # (N, d)

        if normalize_embeddings:
            norms = np.linalg.norm(embeddings, axis=1, keepdims=True).clip(min=1e-9)
            embeddings = embeddings / norms

        return embeddings.astype(np.float32)
