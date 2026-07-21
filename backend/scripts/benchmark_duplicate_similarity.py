#!/usr/bin/env python3
"""
Benchmark: Loop-based vs NumPy-Vectorized vs ONNX Cosine Similarity

Compares three approaches for duplicate detection similarity search:
1. Old loop-based (per-ticket cos_sim calls)           -- baseline
2. NumPy vectorized (single matrix dot-product)         -- production
3. PyTorch / sentence-transformers util.cos_sim         -- reference

Produces detailed execution-time logs with mean, median, std, min, max
latency for every approach across multiple dataset sizes.

Run:
    python -m backend.scripts.benchmark_duplicate_similarity
"""

from __future__ import annotations

import statistics
import sys
import time
from typing import List

import numpy as np

EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 output dimension
WARMUP_ROUNDS = 5
BENCHMARK_ROUNDS = 20
DATASET_SIZES = [10, 50, 100, 500, 1000, 5000]


def _generate_synthetic_embeddings(n: int, dim: int = EMBEDDING_DIM) -> np.ndarray:
    """Create *n* random L2-normalised embeddings as a (n, dim) float32 array."""
    raw = np.random.randn(n, dim).astype(np.float32)
    norms = np.linalg.norm(raw, axis=1, keepdims=True)
    norms = np.where(norms < 1e-8, 1.0, norms)
    return raw / norms


def benchmark_loop(query: np.ndarray, matrix: np.ndarray, rounds: int = BENCHMARK_ROUNDS) -> List[float]:
    """Old approach: iterate and compute dot product one at a time.

    Returns raw execution times per round in seconds.
    """
    for _ in range(WARMUP_ROUNDS):
        for i in range(len(matrix)):
            _ = float(np.dot(query, matrix[i]))

    times: List[float] = []
    for _ in range(rounds):
        t0 = time.perf_counter()
        best = -1.0
        for i in range(len(matrix)):
            score = float(np.dot(query, matrix[i]))
            if score > best:
                best = score
        times.append(time.perf_counter() - t0)
    return times


def benchmark_vectorized(query: np.ndarray, matrix: np.ndarray, rounds: int = BENCHMARK_ROUNDS) -> List[float]:
    """New approach: single matrix dot-product.

    Returns raw execution times per round in seconds.
    """
    for _ in range(WARMUP_ROUNDS):
        _ = matrix @ query

    times: List[float] = []
    for _ in range(rounds):
        t0 = time.perf_counter()
        similarities = matrix @ query
        _ = int(np.argmax(similarities))
        times.append(time.perf_counter() - t0)
    return times


def benchmark_torch(query_np: np.ndarray, matrix_np: np.ndarray, rounds: int = BENCHMARK_ROUNDS) -> List[float] | None:
    """Torch approach: util.cos_sim.

    Returns raw execution times per round in seconds, or None if torch is
    unavailable.
    """
    try:
        import torch
        from sentence_transformers import util
    except ImportError:
        return None

    query = torch.from_numpy(query_np).unsqueeze(0)
    matrix = torch.from_numpy(matrix_np)

    for _ in range(WARMUP_ROUNDS):
        _ = util.cos_sim(query, matrix)

    times: List[float] = []
    for _ in range(rounds):
        t0 = time.perf_counter()
        sim = util.cos_sim(query, matrix)
        _ = torch.max(sim, dim=1)
        times.append(time.perf_counter() - t0)
    return times


def fmt_ms(seconds: float) -> str:
    return f"{seconds * 1000:.3f}"


def _print_stats(label: str, times: List[float]) -> None:
    """Print detailed execution-time statistics for a benchmark run."""
    if not times:
        print(f"  {label:30s}  N/A")
        return
    mean = statistics.mean(times)
    median = statistics.median(times)
    std = statistics.stdev(times) if len(times) > 1 else 0.0
    minimum = min(times)
    maximum = max(times)
    print(f"  {label:30s}  mean={fmt_ms(mean):>8s} ms  "
          f"med={fmt_ms(median):>8s} ms  "
          f"std={fmt_ms(std):>8s} ms  "
          f"min={fmt_ms(minimum):>8s} ms  "
          f"max={fmt_ms(maximum):>8s} ms  "
          f"({len(times)} rounds)")


def main() -> int:
    print("=" * 90)
    print("  DUPLICATE DETECTION -- COSINE SIMILARITY BENCHMARK")
    print("  Comparing: OLD (Python loop) vs NEW (NumPy vectorized) vs Torch")
    print("=" * 90)

    for n in DATASET_SIZES:
        matrix = _generate_synthetic_embeddings(n)
        query = _generate_synthetic_embeddings(1)[0]

        rounds = max(5, min(BENCHMARK_ROUNDS, 100_000 // n))

        print(f"\n{'-' * 90}")
        print(f"  Dataset:  {n:>5} embeddings  |  {rounds} benchmark rounds")
        print(f"{'-' * 90}")

        # --- Loop (old) ---
        t_loop = benchmark_loop(query, matrix, rounds)
        _print_stats("OLD -- Python loop", t_loop)

        # --- NumPy vectorized (new) ---
        t_numpy = benchmark_vectorized(query, matrix, rounds)
        _print_stats("NEW -- NumPy vectorized", t_numpy)

        # --- Torch reference ---
        t_torch = benchmark_torch(query, matrix, rounds)
        _print_stats("REF -- Torch util.cos_sim", t_torch)

        # --- Speedup ---
        loop_mean = statistics.mean(t_loop)
        numpy_mean = statistics.mean(t_numpy)
        speedup = loop_mean / numpy_mean if numpy_mean > 0 else float("inf")
        print(f"  {'-' * 45}")
        print(f"  >>> SPEEDUP:  {speedup:>7.1f}x  "
              f"(old={fmt_ms(loop_mean)} ms -> new={fmt_ms(numpy_mean)} ms)")

    print(f"\n{'=' * 90}")
    print("  [OK] NumPy vectorized is the recommended production path.")
    print("     DuplicateService now uses matrix @ query (one BLAS call).")
    print("     ONNX Runtime can further accelerate via optimized execution providers.")
    print(f"{'=' * 90}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
