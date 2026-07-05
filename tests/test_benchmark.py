#!/usr/bin/env python3
"""
Benchmark test comparing loop-based vs. vectorized cosine similarity.

Tests execution time for increasing dataset sizes and asserts at least 10x
speedup for the largest dataset.  The module includes full type annotations,
input validation, error handling, logging, and configurable parameters via
command-line arguments.  Optimised for production use with NumPy routines.
"""

from __future__ import annotations

import argparse
import logging
import sys
import time
from typing import Dict, Final, List, NoReturn

import numpy as np
from numpy.typing import NDArray

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DEFAULT_EMBEDDING_DIM: Final[int] = 384
RANDOM_SEED: Final[int] = 42
SPEEDUP_THRESHOLD: Final[float] = 10.0
DATASET_SIZES: Final[List[int]] = [10, 50, 100, 500, 1000]
EPSILON: Final[float] = 1e-8  # To avoid division by zero
LOGGING_FORMAT: Final[str] = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# ---------------------------------------------------------------------------
# Logger
# ---------------------------------------------------------------------------
logger: logging.Logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------


def validate_embeddings(embeddings: NDArray[np.float64]) -> None:
    """
    Validate that the embeddings array has the expected shape and data types.

    Args:
        embeddings:
            NumPy array of shape (N, D) with float64 values.

    Raises:
        ValueError:
            If embeddings is not 2D, empty or contains non-finite values.
        TypeError:
            If embeddings is not an ndarray or dtype is not float64.
    """
    if not isinstance(embeddings, np.ndarray):
        raise TypeError(f"Expected numpy array, got {type(embeddings).__name__}")

    if embeddings.dtype != np.float64:
        raise TypeError(f"Expected float64 dtype, got {embeddings.dtype}")

    if embeddings.ndim != 2:
        raise ValueError(
            f"Embeddings must be a 2D array of shape (N, D), got ndim={embeddings.ndim}"
        )

    if embeddings.shape[0] == 0:
        raise ValueError("Embeddings array is empty (no rows)")

    if not np.all(np.isfinite(embeddings)):
        raise ValueError("Embeddings contain NaN or Inf values")

    if embeddings.shape[1] == 0:
        raise ValueError("Embedding dimension cannot be zero")


# ---------------------------------------------------------------------------
# Core computation functions
# ---------------------------------------------------------------------------


def compute_cosine_similarity_loop(
    embeddings: NDArray[np.float64],
) -> NDArray[np.float64]:
    """
    Compute pairwise cosine similarity using nested Python loops.

    Args:
        embeddings:
            NumPy array of shape (N, D), where N is number of embeddings.

    Returns:
        Similarity matrix of shape (N, N), float64, with values in [-1, 1].

    Raises:
        ValueError:
            If embeddings validation fails.
    """
    validate_embeddings(embeddings)
    n: int = embeddings.shape[0]
    similarity: NDArray[np.float64] = np.zeros((n, n), dtype=np.float64)

    # Precompute all norms once for slight optimisation
    norms: NDArray[np.float64] = np.linalg.norm(embeddings, axis=1)

    for i in range(n):
        norm_i: float = norms[i]
        if norm_i == 0.0:
            continue  # row remains zero (no similarity with any other vector)
        row_i: NDArray[np.float64] = embeddings[i]
        for j in range(n):
            norm_j: float = norms[j]
            if norm_j == 0.0:
                continue
            dot: float = np.dot(row_i, embeddings[j])
            similarity[i, j] = dot / (norm_i * norm_j + EPSILON)

    return similarity


def compute_cosine_similarity_vectorized(
    embeddings: NDArray[np.float64],
) -> NDArray[np.float64]:
    """
    Compute pairwise cosine similarity using vectorized NumPy operations.

    This method leverages matrix multiplication and broadcasting for
    significant speedups on medium to large datasets.

    Args:
        embeddings:
            NumPy array of shape (N, D), where N is number of embeddings.

    Returns:
        Similarity matrix of shape (N, N), float64, with values in [-1, 1].

    Raises:
        ValueError:
            If embeddings validation fails.
    """
    validate_embeddings(embeddings)

    # Dot products via matrix multiplication: (N, D) @ (D, N) -> (N, N)
    dot_matrix: NDArray[np.float64] = embeddings @ embeddings.T

    # L2 norms for each row, shape (N, 1)
    norms: NDArray[np.float64] = np.linalg.norm(embeddings, axis=1, keepdims=True)

    # Outer product of norms (NxN)
    norm_product: NDArray[np.float64] = norms @ norms.T

    # Avoid division by zero
    similarity: NDArray[np.float64] = np.divide(
        dot_matrix, norm_product + EPSILON
    )

    return similarity


# ---------------------------------------------------------------------------
# Benchmark measurement
# ---------------------------------------------------------------------------


def measure_similarity_performance(
    dataset_sizes: List[int],
    embedding_dim: int = DEFAULT_EMBEDDING_DIM,
    random_seed: int = RANDOM_SEED,
) -> Dict[str, List[float]]:
    """
    Measure execution time for both methods across multiple dataset sizes.

    Args:
        dataset_sizes:
            List of integers representing number of embeddings.
        embedding_dim:
            Dimensionality of each embedding vector (default 384).
        random_seed:
            Seed for reproducible random data (default 42).

    Returns:
        Dictionary containing:
            - "sizes": list of dataset sizes
            - "old_times": list of loop method execution times (seconds)
            - "new_times": list of vectorized method execution times (seconds)

    Raises:
        ValueError:
            If dataset_sizes is empty or contains non-positive values.
        RuntimeError:
            If an unexpected error occurs during measurement.
    """
    if not dataset_sizes:
        raise ValueError("dataset_sizes list cannot be empty")
    if any(size <= 0 for size in dataset_sizes):
        raise ValueError("All dataset sizes must be positive integers")

    np.random.seed(random_seed)
    old_times: List[float] = []
    new_times: List[float] = []

    for size in dataset_sizes:
        try:
            # Generate random embeddings with validated dimensions
            embeddings: NDArray[np.float64] = np.random.randn(
                size, embedding_dim
            ).astype(np.float64)

            # Warm-up: vectorized call to prime caches / JIT (if any)
            _ = compute_cosine_similarity_vectorized(embeddings)

            # Measure old loop-based method
            start: float = time.perf_counter()
            compute_cosine_similarity_loop(embeddings)
            old_elapsed: float = time.perf_counter() - start
            old_times.append(old_elapsed)

            # Measure new vectorized method
            start = time.perf_counter()
            compute_cosine_similarity_vectorized(embeddings)
            new_elapsed: float = time.perf_counter() - start
            new_times.append(new_elapsed)

            speedup: float = (
                old_elapsed / new_elapsed if new_elapsed > 0 else float("inf")
            )
            logger.info(
                "Dataset size %5d: old loop = %.6fs, vectorized = %.6fs, speedup = %.2fx",
                size,
                old_elapsed,
                new_elapsed,
                speedup,
            )

        except (ValueError, TypeError, np.linalg.LinAlgError) as exc:
            logger.error("Validation or linear algebra error for size %d: %s", size, exc)
            raise
        except Exception as exc:
            logger.exception("Unexpected error during measurement for size %d", size)
            raise RuntimeError(f"Measurement failed for size {size}") from exc

    return {
        "sizes": dataset_sizes,
        "old_times": old_times,
        "new_times": new_times,
    }


# ---------------------------------------------------------------------------
# Reporting helpers
# ---------------------------------------------------------------------------


def print_results_table(results: Dict[str, List[float]]) -> None:
    """
    Pretty-print the benchmark results to stdout.

    Args:
        results:
            Dictionary returned by measure_similarity_performance.

    Raises:
        ValueError:
            If results dictionary is missing required keys or has mismatched list lengths.
    """
    required_keys: List[str] = ["sizes", "old_times", "new_times"]
    for key in required_keys:
        if key not in results:
            raise ValueError(f"Missing required key '{key}' in results dictionary")

    sizes: List[int] = [int(s) for s in results["sizes"]]
    old_times: List[float] = results["old_times"]
    new_times: List[float] = results["new_times"]

    if not (len(sizes) == len(old_times) == len(new_times)):
        raise ValueError(
            "Mismatched list lengths in results: sizes=%d, old_times=%d, new_times=%d",
            len(sizes),
            len(old_times),
            len(new_times),
        )

    header: str = f"{'Dataset Size':>15} {'Old Loop (s)':>15} {'Vectorized (s)':>15} {'Speedup':>10}"
    separator: str = "-" * len(header)
    print("\n" + header)
    print(separator)

    for size, old_time, new_time in zip(sizes, old_times, new_times):
        speedup: float = (
            old_time / new_time if new_time > 0 else float("inf")
        )
        print(
            f"{size:>15d} {old_time:>15.6f} {new_time:>15.6f} {speedup:>10.2f}x"
        )
    print()


# ---------------------------------------------------------------------------
# CLI argument parser
# ---------------------------------------------------------------------------


def parse_args(argv: List[str]) -> argparse.Namespace:
    """
    Parse command-line arguments.

    Args:
        argv:
            List of raw argument strings (typically sys.argv[1:]).

    Returns:
        Parsed namespace with fields:
            - dataset_sizes: list[int]
            - embedding_dim: int
            - random_seed: int
            - verbose: bool
    """
    parser = argparse.ArgumentParser(
        description="Benchmark cosine similarity implementations."
    )
    parser.add_argument(
        "--dataset-sizes",
        type=int,
        nargs="+",
        default=DATASET_SIZES,
        help="List of dataset sizes to benchmark (default: %(default)s)",
    )
    parser.add_argument(
        "--embedding-dim",
        type=int,
        default=DEFAULT_EMBEDDING_DIM,
        help="Dimension of embedding vectors (default: %(default)s)",
    )
    parser.add_argument(
        "--random-seed",
        type=int,
        default=RANDOM_SEED,
        help="Random seed for reproducibility (default: %(default)s)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable debug logging",
    )
    return parser.parse_args(argv)


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------


def main() -> NoReturn:
    """
    Entry point for the benchmark script.

    Parses arguments, configures logging, runs the benchmark, prints results,
    and validates that the speedup threshold is met for the largest dataset.
    Exits with appropriate status code.
    """
    args: argparse.Namespace = parse_args(sys.argv[1:])

    # Configure logging
    log_level: int = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format=LOGGING_FORMAT,
    )

    logger.debug("Benchmark started with parameters: %s", args)

    try:
        # Run measurements
        results: Dict[str, List[float]] = measure_similarity_performance(
            dataset_sizes=args.dataset_sizes,
            embedding_dim=args.embedding_dim,
            random_seed=args.random_seed,
        )

        # Print formatted table
        print_results_table(results)

        # Validate speedup threshold for the largest dataset
        largest_index: int = len(results["sizes"]) - 1
        largest_speedup: float = (
            results["old_times"][largest_index] / results["new_times"][largest_index]
            if results["new_times"][largest_index] > 0
            else float("inf")
        )
        if largest_speedup >= SPEEDUP_THRESHOLD:
            logger.info(
                "✓ Speedup threshold met: %.2fx >= %.1fx (largest dataset size %d)",
                largest_speedup,
                SPEEDUP_THRESHOLD,
                results["sizes"][largest_index],
            )
            sys.exit(0)
        else:
            logger.warning(
                "✗ Speedup threshold NOT met: %.2fx < %.1fx (largest dataset size %d)",
                largest_speedup,
                SPEEDUP_THRESHOLD,
                results["sizes"][largest_index],
            )
            sys.exit(1)

    except (ValueError, TypeError) as exc:
        logger.error("Input error: %s", exc)
        sys.exit(1)
    except RuntimeError as exc:
        logger.critical("Runtime failure: %s", exc)
        sys.exit(2)
    except Exception as exc:
        logger.critical("Unexpected error: %s", exc, exc_info=True)
        sys.exit(3)


if __name__ == "__main__":
    main()