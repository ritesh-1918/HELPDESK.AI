"""
Vectorized cosine similarity functions using NumPy.

Replaces the previous loop-based implementation with efficient matrix operations.
Supports batch pairwise similarity and single query vs database comparisons.
Includes comprehensive error handling, logging, input validation, and type annotations.
"""

from __future__ import annotations

import logging
import time
from typing import Optional, Tuple

import numpy as np

# Configure logger for this module
logger = logging.getLogger(__name__)


def normalize(
    embeddings: np.ndarray,
    inplace: bool = False,
    *,
    eps: float = 1e-12,
) -> np.ndarray:
    """
    L2-normalize embeddings along the last axis.

    Safe for zero vectors: vectors with zero norm remain zero (after division by 1).

    Args:
        embeddings:
            Input array of shape (n, d) or (d,). Must be numeric and finite.
        inplace:
            If True, modify the input array in place; otherwise return a normalized copy.
        eps:
            Small epsilon to add to norms to avoid division by zero (applied only when
            norm is zero). Default 1e-12.

    Returns:
        Normalized embeddings of the same shape as input.

    Raises:
        ValueError:
            If embeddings contain NaN or infinite values, or if the array is empty.
    """
    _validate_array(embeddings, name="embeddings")

    axis: int = -1
    norm: np.ndarray = np.linalg.norm(embeddings, axis=axis, keepdims=True)

    # Replace zero norms with 1.0 so that division keeps the original zero
    # but we add eps to avoid any warning or nan in gradient environments.
    norm = np.where(np.abs(norm) < eps, 1.0, norm)

    if inplace:
        embeddings /= norm
        return embeddings  # type: ignore[return-value]
    else:
        return embeddings / norm


def cosine_similarity_matrix(
    X: np.ndarray,
    Y: np.ndarray,
    normalize_input: bool = True,
    *,
    eps: float = 1e-12,
    check_finite: bool = True,
) -> np.ndarray:
    """
    Compute pairwise cosine similarity between rows of X and rows of Y.

    Uses the formula: sim = dot(X_normalized, Y_normalized.T)

    Args:
        X:
            First embedding set, shape (n, d). Must be 2-dimensional.
        Y:
            Second embedding set, shape (m, d). Must be 2-dimensional.
        normalize_input:
            If True, L2-normalize input arrays before computing.
            If False, assumes inputs are already normalized.
        eps:
            Small epsilon for numerical stability when normalizing. Default 1e-12.
        check_finite:
            If True, raise ValueError if X or Y contain non-finite values. Default True.

    Returns:
        Similarity matrix of shape (n, m) with values in [-1, 1].

    Raises:
        ValueError:
            If X or Y are not 2D, have mismatched feature dimensions, or contain
            NaN/Inf when check_finite is True.
    """
    X, Y = _validate_shapes(X, Y, check_finite=check_finite)

    if normalize_input:
        X_norm = normalize(X, inplace=False, eps=eps)
        Y_norm = normalize(Y, inplace=False, eps=eps)
    else:
        X_norm = X
        Y_norm = Y

    # Dot product of normalized vectors yields cosine similarities
    similarity: np.ndarray = np.dot(X_norm, Y_norm.T)

    # Clip to handle tiny numerical errors outside [-1, 1]
    return np.clip(similarity, -1.0, 1.0)


def cosine_similarity_query(
    query_embedding: np.ndarray,
    database_embeddings: np.ndarray,
    normalize_input: bool = True,
    *,
    eps: float = 1e-12,
    check_finite: bool = True,
) -> np.ndarray:
    """
    Compute cosine similarity between a single query and all database embeddings.

    Args:
        query_embedding:
            Query vector of shape (d,) or (1, d). If 1D, it is reshaped to (1, d).
        database_embeddings:
            Database embeddings of shape (m, d) where m is number of items.
        normalize_input:
            If True, normalize inputs; otherwise assume they are normalized.
        eps:
            Small epsilon for numerical stability.
        check_finite:
            If True, raise ValueError if inputs contain non-finite values.

    Returns:
        Similarity vector of shape (m,) with values in [-1, 1].

    Raises:
        ValueError:
            If inputs have incompatible dimensions or contain invalid values.
    """
    if query_embedding.ndim == 1:
        query_embedding = query_embedding.reshape(1, -1)

    sim_matrix: np.ndarray = cosine_similarity_matrix(
        query_embedding,
        database_embeddings,
        normalize_input=normalize_input,
        eps=eps,
        check_finite=check_finite,
    )
    return sim_matrix.flatten()


def _validate_array(
    arr: np.ndarray,
    name: str = "array",
    check_finite: bool = True,
) -> None:
    """
    Validate that an array is numeric, non-empty, and optionally finite.

    Args:
        arr: Input array to validate.
        name: Name of the variable for error messages.
        check_finite: If True, check for NaN and infinity.

    Raises:
        ValueError: If validation fails.
    """
    if not isinstance(arr, np.ndarray):
        raise TypeError(f"{name} must be a numpy array, got {type(arr).__name__}")

    if arr.size == 0:
        raise ValueError(f"{name} must not be empty")

    if not np.issubdtype(arr.dtype, np.floating) and not np.issubdtype(
        arr.dtype, np.integer
    ):
        raise TypeError(
            f"{name} must have float or integer dtype, got {arr.dtype}"
        )

    if check_finite and not np.all(np.isfinite(arr)):
        raise ValueError(f"{name} contains NaN or infinite values")


def _validate_shapes(
    X: np.ndarray,
    Y: np.ndarray,
    check_finite: bool = True,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Validate shape compatibility and optionally check for finite values.

    Args:
        X: First matrix.
        Y: Second matrix.
        check_finite: If True, check for NaN/Inf.

    Returns:
        Tuple of validated arrays (X, Y).

    Raises:
        ValueError: If shape or dtype constraints are violated.
    """
    _validate_array(X, name="X", check_finite=check_finite)
    _validate_array(Y, name="Y", check_finite=check_finite)

    if X.ndim != 2 or Y.ndim != 2:
        raise ValueError(
            f"Expected 2D arrays, got X.ndim={X.ndim}, Y.ndim={Y.ndim}"
        )

    if X.shape[1] != Y.shape[1]:
        raise ValueError(
            f"Feature dimension mismatch: X.shape[1]={X.shape[1]} "
            f"(type={X.dtype}), Y.shape[1]={Y.shape[1]} (type={Y.dtype})"
        )

    return X, Y


# ---------------------------------------------------------------------------
# Benchmark & demonstration helper (only when run directly)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # Set up logging to see timings and info
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    np.random.seed(42)
    logger.info("Starting cosine similarity benchmark...")

    # Create sample data: 1000 database items, 50 query items, dimension 384
    n_db: int = 1000
    n_query: int = 50
    dim: int = 384
    db: np.ndarray = np.random.randn(n_db, dim).astype(np.float32)
    queries: np.ndarray = np.random.randn(n_query, dim).astype(np.float32)

    # ---- Loop-based (old) ----
    def loop_cosine_similarity(q: np.ndarray, db: np.ndarray) -> np.ndarray:
        """Compute cosine similarity using nested Python loops (slow)."""
        sims: list = []
        for i in range(q.shape[0]):
            q_norm = q[i] / (np.linalg.norm(q[i]) + 1e-12)
            row_sims: list = []
            for j in range(db.shape[0]):
                db_norm = db[j] / (np.linalg.norm(db[j]) + 1e-12)
                row_sims.append(float(np.dot(q_norm, db_norm)))
            sims.append(row_sims)
        return np.array(sims, dtype=np.float32)

    # Warmup (not timed)
    _ = loop_cosine_similarity(queries[:2], db[:2])
    _ = cosine_similarity_matrix(queries[:2], db[:2])

    logger.info("Warmup done. Running timed benchmark...")

    # Timed loop version
    start: float = time.perf_counter()
    loop_result: np.ndarray = loop_cosine_similarity(queries, db)
    loop_time: float = time.perf_counter() - start

    # Timed vectorized version
    start = time.perf_counter()
    vec_result: np.ndarray = cosine_similarity_matrix(
        queries, db, normalize_input=True
    )
    vec_time: float = time.perf_counter() - start

    logger.info(f"Loop-based time:     {loop_time:.6f} s")
    logger.info(f"Vectorized time:     {vec_time:.6f} s")
    logger.info(f"Speedup:             {loop_time / vec_time:.3f}x")

    # Verify correctness (tolerate small differences)
    max_diff: float = float(np.max(np.abs(loop_result - vec_result)))
    logger.info(f"Max difference:      {max_diff:.3e}")

    if max_diff > 1e-4:
        logger.warning("Max difference exceeds 1e-4 – results may differ.")
    else:
        logger.info("Correctness check PASSED.")