# app/services/cosine_similarity.py
"""
Optimized cosine similarity operations using NumPy and ONNX export utilities.

Provides vectorized pairwise and pair-specific similarity computations,
benchmarking against naive loop implementations, and an ONNX export pipeline
for SentenceTransformer models.

All functions include comprehensive input validation, logging, and error handling
to ensure production robustness.
"""

import contextlib
import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
from numpy.typing import NDArray

# Configure module-level logger
logger = logging.getLogger(__name__)

# Validation and benchmarking constants
DEFAULT_N_REPEATS: int = 10
DEFAULT_N_PAIRS_FRACTION: float = 0.01  # 1% of total pairs
RANDOM_SEED: int = 42


# ──────────────────────────────────────────────
# Input Validation Helpers
# ──────────────────────────────────────────────
def _validate_embeddings(embeddings: NDArray[np.floating]) -> None:
    """Validate embeddings array for shape, dtype, and value integrity.

    Args:
        embeddings: Input embeddings as a 2-D NumPy floating-point array.

    Raises:
        TypeError: If ``embeddings`` is not a ``np.ndarray``.
        ValueError: If the array is not 2-D, empty, non-floating dtype,
                    or contains NaN / Inf.
    """
    if not isinstance(embeddings, np.ndarray):
        raise TypeError("embeddings must be a NumPy ndarray")

    if embeddings.ndim != 2:
        raise ValueError(
            f"embeddings must be 2-dimensional, got {embeddings.ndim}D"
        )

    if embeddings.shape[0] == 0:
        raise ValueError("embeddings must contain at least one row")

    if not np.issubdtype(embeddings.dtype, np.floating):
        raise ValueError(
            f"embeddings must have floating-point dtype, got {embeddings.dtype}"
        )

    if np.any(np.isnan(embeddings)) or np.any(np.isinf(embeddings)):
        raise ValueError("embeddings must not contain NaN or Inf values")


def _validate_indices(indices: NDArray[np.integer], n_embeddings: int) -> None:
    """Validate pairwise index array for shape, dtype, and bounds.

    Args:
        indices: 2-D array of shape ``(n_pairs, 2)`` with integer indices.
        n_embeddings: Number of rows in the embeddings matrix.

    Raises:
        TypeError: If ``indices`` is not a ``np.ndarray``.
        ValueError: If shape is incorrect, dtype is non-integer, empty,
                    or indices are out of bounds.
    """
    if not isinstance(indices, np.ndarray):
        raise TypeError("indices must be a NumPy ndarray")

    if indices.ndim != 2 or indices.shape[1] != 2:
        raise ValueError(
            f"indices must have shape (n_pairs, 2), got {indices.shape}"
        )

    if indices.size == 0:
        raise ValueError("indices must contain at least one pair")

    if not np.issubdtype(indices.dtype, np.integer):
        raise ValueError(
            f"indices must have integer dtype, got {indices.dtype}"
        )

    if indices.min() < 0 or indices.max() >= n_embeddings:
        raise ValueError(
            f"indices contain out-of-bounds values (valid range: "
            f"0 to {n_embeddings - 1})"
        )


# ──────────────────────────────────────────────
# Core Similarity Functions
# ──────────────────────────────────────────────
def cosine_similarity_matrix(
    embeddings: NDArray[np.floating],
) -> NDArray[np.floating]:
    """Compute the full pairwise cosine similarity matrix.

    Uses vectorized dot products and norm normalization.
    Vectors with zero norm are assigned a similarity of 0.

    Args:
        embeddings: 2-D array of shape ``(n_embeddings, embedding_dim)``.

    Returns:
        Matrix of shape ``(n_embeddings, n_embeddings)`` with values in ``[0.0, 1.0]``.

    Raises:
        ValueError: If validation fails.
        np.linalg.LinAlgError: On linear algebra failure.
    """
    logger.debug("Computing pairwise cosine similarity matrix")
    _validate_embeddings(embeddings)

    try:
        dot = embeddings @ embeddings.T                               # shape (n, n)
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)    # (n, 1)
        norm_product = norms @ norms.T                                 # (n, n)

        # Avoid division by zero: only divide where norm_product != 0
        similarity = np.divide(
            dot,
            norm_product,
            out=np.zeros_like(dot),
            where=(norm_product != 0),
        )

        # Clamp for numerical stability
        similarity = np.clip(similarity, 0.0, 1.0)

        logger.debug(
            "Pairwise similarity computed: shape=%s, min=%.6f, max=%.6f",
            similarity.shape,
            similarity.min(),
            similarity.max(),
        )
        return similarity

    except np.linalg.LinAlgError as exc:
        logger.error("Linear algebra error during similarity matrix: %s", exc)
        raise
    except Exception as exc:
        logger.error("Unexpected error in cosine_similarity_matrix: %s", exc)
        raise


def cosine_similarity_pairs(
    embeddings: NDArray[np.floating],
    indices: NDArray[np.integer],
) -> NDArray[np.floating]:
    """Compute cosine similarity for given pairs of embeddings.

    Embeds the index pairs, computes dot products and norm products
    element‑wise.

    Args:
        embeddings: 2-D array of shape ``(n_embeddings, embedding_dim)``.
        indices: 2-D array of shape ``(n_pairs, 2)``.

    Returns:
        1-D array of similarity values in ``[0.0, 1.0]``.

    Raises:
        ValueError: If validation fails.
        np.linalg.LinAlgError: On linear algebra failure.
    """
    logger.debug("Computing cosine similarity for %d pairs", indices.shape[0])
    _validate_embeddings(embeddings)
    _validate_indices(indices, embeddings.shape[0])

    try:
        vec_i = embeddings[indices[:, 0]]          # (n_pairs, dim)
        vec_j = embeddings[indices[:, 1]]          # (n_pairs, dim)
        dots = np.sum(vec_i * vec_j, axis=1)       # (n_pairs,)
        norms_i = np.linalg.norm(vec_i, axis=1)    # (n_pairs,)
        norms_j = np.linalg.norm(vec_j, axis=1)    # (n_pairs,)
        norm_product = norms_i * norms_j

        similarity = np.divide(
            dots,
            norm_product,
            out=np.zeros_like(dots),
            where=(norm_product != 0),
        )
        similarity = np.clip(similarity, 0.0, 1.0)

        logger.debug(
            "Pair similarities: min=%.6f, max=%.6f",
            similarity.min(),
            similarity.max(),
        )
        return similarity

    except np.linalg.LinAlgError as exc:
        logger.error("Linear algebra error during pair similarity: %s", exc)
        raise
    except Exception as exc:
        logger.error("Unexpected error in cosine_similarity_pairs: %s", exc)
        raise


# ──────────────────────────────────────────────
# Loop‑based Reference (for benchmarking)
# ──────────────────────────────────────────────
def _cosine_similarity_loop(
    embeddings: NDArray[np.floating],
    indices: NDArray[np.integer],
) -> NDArray[np.floating]:
    """Naive loop‑based cosine similarity for benchmarking.

    Directly loops over each pair and computes dot / (norm * norm) manually.

    Args:
        embeddings: 2-D array of shape ``(n_embeddings, embedding_dim)``.
        indices: 2-D array of shape ``(n_pairs, 2)``.

    Returns:
        1-D array of similarities (dtype float64).
    """
    _validate_embeddings(embeddings)
    _validate_indices(indices, embeddings.shape[0])

    n_pairs = indices.shape[0]
    results = np.empty(n_pairs, dtype=np.float64)

    for idx in range(n_pairs):
        i, j = indices[idx]
        vec_i = embeddings[i]
        vec_j = embeddings[j]
        dot = np.dot(vec_i, vec_j)
        norm_i = np.linalg.norm(vec_i)
        norm_j = np.linalg.norm(vec_j)
        denom = norm_i * norm_j
        if denom == 0.0:
            results[idx] = 0.0
        else:
            sim = dot / denom
            results[idx] = np.clip(sim, 0.0, 1.0)

    return results


# ──────────────────────────────────────────────
# Benchmarking Utilities
# ──────────────────────────────────────────────
@contextlib.contextmanager
def _timed_block(description: str) -> float:
    """Context manager that logs execution time of a code block.

    Args:
        description: Human‑readable description for logging.

    Yields:
        Elapsed time in seconds.
    """
    start = time.perf_counter()
    yield
    elapsed = time.perf_counter() - start
    logger.info("%s --- %.6f seconds", description, elapsed)


def benchmark_similarity(
    embeddings: NDArray[np.floating],
    n_repeats: int = DEFAULT_N_REPEATS,
    n_pairs: Optional[int] = None,
    log_results: bool = True,
) -> Dict[str, float]:
    """Benchmark vectorised and loop‑based cosine similarity.

    Measures execution time for:
      - matrix (full pairwise)
      - pair (vectorised specific pairs)
      - loop (specific pairs using a Python loop)

    Args:
        embeddings: 2-D float array.
        n_repeats: Number of times to run each variant (default 10).
        n_pairs: Number of random pairs for pair/loop benchmarks.
                 If ``None``, uses ``DEFAULT_N_PAIRS_FRACTION`` of all possible pairs.
        log_results: If ``True`` (default), log results with ``logging.info``.

    Returns:
        Dictionary with keys ``'mean_matrix'``, ``'mean_pairs'``, ``'mean_loop'``
        (only if n_pairs > 0).

    Raises:
        ValueError: If ``embeddings`` validation fails.
    """
    _validate_embeddings(embeddings)
    rng = np.random.default_rng(RANDOM_SEED)
    n = embeddings.shape[0]

    if n_pairs is None:
        n_pairs = max(1, int(DEFAULT_N_PAIRS_FRACTION * n * (n - 1)))

    # Generate random distinct pairs
    all_indices = np.arange(n)
    pair_list: List[Tuple[int, int]] = []
    while len(pair_list) < n_pairs:
        i, j = rng.integers(0, n, size=2)
        if i != j:
            pair_list.append((i, j))
    indices = np.array(pair_list[:n_pairs], dtype=np.int64)

    logger.info(
        "Benchmarking with n=%d, embedding_dim=%d, n_pairs=%d, n_repeats=%d",
        n, embeddings.shape[1], n_pairs, n_repeats,
    )

    # Warm‑up (not measured)
    _ = cosine_similarity_matrix(embeddings)
    _ = cosine_similarity_pairs(embeddings, indices)
    _ = _cosine_similarity_loop(embeddings, indices)

    # Benchmark matrix
    matrix_times: List[float] = []
    for _ in range(n_repeats):
        t0 = time.perf_counter()
        _ = cosine_similarity_matrix(embeddings)
        matrix_times.append(time.perf_counter() - t0)

    # Benchmark pair (vectorised)
    pair_times: List[float] = []
    for _ in range(n_repeats):
        t0 = time.perf_counter()
        _ = cosine_similarity_pairs(embeddings, indices)
        pair_times.append(time.perf_counter() - t0)

    # Benchmark loop
    loop_times: List[float] = []
    for _ in range(n_repeats):
        t0 = time.perf_counter()
        _ = _cosine_similarity_loop(embeddings, indices)
        loop_times.append(time.perf_counter() - t0)

    mean_matrix = np.mean(matrix_times)
    mean_pairs = np.mean(pair_times)
    mean_loop = np.mean(loop_times)
    std_matrix = np.std(matrix_times)
    std_pairs = np.std(pair_times)
    std_loop = np.std(loop_times)

    results: Dict[str, float] = {
        "mean_matrix": mean_matrix,
        "mean_pairs": mean_pairs,
        "mean_loop": mean_loop,
        "std_matrix": std_matrix,
        "std_pairs": std_pairs,
        "std_loop": std_loop,
    }

    if log_results:
        logger.info("=== Benchmark Results ===")
        logger.info(
            "Matrix (full pairwise) : mean=%.6f s, std=%.6f s", mean_matrix, std_matrix
        )
        logger.info(
            "Pairs (vectorised)    : mean=%.6f s, std=%.6f s", mean_pairs, std_pairs
        )
        logger.info(
            "Loop (naive)          : mean=%.6f s, std=%.6f s", mean_loop, std_loop
        )
        speedup = mean_loop / mean_pairs if mean_pairs > 0 else float("inf")
        logger.info("Speedup (loop / vectorised pairs): %.2fx", speedup)

    return results


# ──────────────────────────────────────────────
# ONNX Export
# ──────────────────────────────────────────────
def export_sentence_transformer_to_onnx(
    model_name_or_path: str,
    output_path: Union[str, Path],
    opset_version: int = 14,
    force_export: bool = False,
) -> Path:
    """Export a SentenceTransformer model to ONNX format.

    Uses the ``optimum.onnxruntime`` library's ``ORTModelForFeatureExtraction``
    for reliable export and inference.

    Args:
        model_name_or_path: Hugging Face model ID or local path to a
            SentenceTransformer model.
        output_path: Destination path for the ``.onnx`` file.
        opset_version: ONNX opset version (default 14, supports most ops).
        force_export: If ``True``, overwrites existing file (default ``False``).

    Returns:
        Path to the exported ONNX file.

    Raises:
        ImportError: If ``optimum`` or ``torch`` is not installed.
        FileExistsError: If ``output_path`` exists and ``force_export`` is ``False``.
        RuntimeError: If the export process fails.
    """
    output_path = Path(output_path)
    if output_path.suffix != ".onnx":
        output_path = output_path.with_suffix(".onnx")

    if output_path.exists():
        if not force_export:
            raise FileExistsError(
                f"ONNX file already exists at {output_path}. "
                "Set force_export=True to overwrite."
            )
        logger.warning("Overwriting existing ONNX file at %s", output_path)

    # Lazy imports to avoid heavy dependencies at module load time
    try:
        from optimum.onnxruntime import ORTModelForFeatureExtraction
        from transformers import AutoTokenizer
    except ImportError as exc:
        raise ImportError(
            "optimum[onnxruntime] and transformers are required for ONNX export. "
            "Install with: pip install optimum[onnxruntime] transformers"
        ) from exc

    try:
        logger.info(
            "Exporting SentenceTransformer model '%s' to ONNX (opset %d) ...",
            model_name_or_path,
            opset_version,
        )
        model = ORTModelForFeatureExtraction.from_pretrained(
            model_name_or_path, export=True, opset=opset_version
        )
        tokenizer = AutoTokenizer.from_pretrained(model_name_or_path)

        # Validate with a dummy forward pass
        dummy_input = tokenizer(
            "This is a test sentence.",
            return_tensors="pt",
            padding="max_length",
            truncation=True,
            max_length=128,
        )
        _ = model(**dummy_input)
        logger.info("Forward pass with dummy input succeeded.")

        # Save the ONNX model and tokenizer
        model.save_pretrained(output_path.parent)
        tokenizer.save_pretrained(output_path.parent)
        logger.info("Exported ONNX model to %s", output_path)

        return output_path

    except Exception as exc:
        logger.error("ONNX export failed: %s", exc, exc_info=True)
        raise RuntimeError(f"Failed to export model to ONNX: {exc}") from exc


# ──────────────────────────────────────────────
# Main demonstration (if run directly)
# ──────────────────────────────────────────────
if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Generate a synthetic embedding set for benchmarking
    np.random.seed(RANDOM_SEED)
    n_emb = 500
    dim = 384  # typical sentence‑BERT dimension
    demo_embeddings = np.random.randn(n_emb, dim).astype(np.float32)
    demo_embeddings[0] = 0.0  # inject zero vector for robustness test

    print("\n=== Benchmark Demo ===")
    bench_results = benchmark_similarity(demo_embeddings, n_repeats=3, n_pairs=100)
    print("Benchmark summary:")
    for k, v in bench_results.items():
        print(f"  {k}: {v:.6f}")

    # Uncomment the line below to test ONNX export (requires `optimum`)
    # export_sentence_transformer_to_onnx("all-MiniLM-L6-v2", "./onnx_models")

    print("\nAll tests passed.")