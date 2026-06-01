"""
Benchmark: Loop-based vs Vectorized Cosine Similarity

Compares the old per-ticket loop approach against the new vectorized
batch approach for duplicate detection similarity search.

Run:
    python backend/services/benchmark_similarity.py
"""

import time
import torch
import numpy as np
from sentence_transformers import util

EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 output dimension


def _generate_synthetic_embeddings(n: int, dim: int = EMBEDDING_DIM) -> list[torch.Tensor]:
    """Create *n* random unit-normalised embeddings."""
    raw = torch.randn(n, dim)
    norms = raw.norm(dim=1, keepdim=True).clamp(min=1e-8)
    return [row for row in raw / norms]


def benchmark_loop(query: torch.Tensor, stored: list[torch.Tensor], rounds: int = 5) -> float:
    """Old approach: iterate and compute cos_sim one at a time."""
    # Warm up to avoid one-time allocation overhead
    _ = [util.cos_sim(query, emb).item() for emb in stored]
    times = []
    for _ in range(rounds):
        t0 = time.perf_counter()
        for emb in stored:
            _ = util.cos_sim(query, emb).item()
        times.append(time.perf_counter() - t0)
    return sum(times) / len(times)


def benchmark_vectorized(query: torch.Tensor, matrix: torch.Tensor, rounds: int = 5) -> float:
    """New approach: single batched cos_sim call."""
    query_2d = query.unsqueeze(0)
    # Warm up to avoid one-time allocation overhead
    _ = util.cos_sim(query_2d, matrix).squeeze(0)
    times = []
    for _ in range(rounds):
        t0 = time.perf_counter()
        _ = util.cos_sim(query_2d, matrix).squeeze(0)
        times.append(time.perf_counter() - t0)
    return sum(times) / len(times)


def main():
    print("=" * 68)
    print("  Benchmark: Loop-based vs Vectorized Cosine Similarity Search")
    print("=" * 68)

    query = torch.randn(EMBEDDING_DIM)
    query = query / query.norm().clamp(min=1e-8)

    for n in [10, 100, 500, 1000, 5000]:
        stored = _generate_synthetic_embeddings(n)
        matrix = torch.stack(stored)

        loop_time = benchmark_loop(query, stored, rounds=7)
        vec_time = benchmark_vectorized(query, matrix, rounds=7)
        speedup = loop_time / vec_time if vec_time > 0 else float("inf")

        print(
            f"\n  n={n:>5} tickets  |  "
            f"loop: {loop_time*1000:8.2f} ms  |  "
            f"vectorized: {vec_time*1000:8.2f} ms  |  "
            f"speedup: {speedup:6.1f}x"
        )

    print("\n" + "=" * 68)
    print("  Conclusion: vectorized search is significantly faster as n grows.")
    print("  The per-ticket loop incurs O(n) individual kernel launches,")
    print("  while the vectorized approach performs a single matrix multiply.")
    print("=" * 68)


if __name__ == "__main__":
    main()
