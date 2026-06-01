"""
Benchmark duplicate-detection cosine similarity:
loop-based (old) vs NumPy-vectorized (new).

Usage:
    python -m backend.scripts.benchmark_duplicate_similarity \
        [--sizes 100 1000 5000 10000] [--dim 384] [--repeat 5]

Reports per-query latency (ms) and speedup factor.
"""

import argparse
import time
import numpy as np


def loop_cosine(query: np.ndarray, stored: list[np.ndarray]) -> tuple[int, float]:
    """Old behaviour: Python loop, one cosine per stored embedding."""
    best_idx, best_score = -1, -1.0
    q_norm = query / (np.linalg.norm(query) + 1e-12)
    for i, emb in enumerate(stored):
        e_norm = emb / (np.linalg.norm(emb) + 1e-12)
        score = float(np.dot(q_norm, e_norm))
        if score > best_score:
            best_score = score
            best_idx = i
    return best_idx, best_score


def vector_cosine(query: np.ndarray, matrix: np.ndarray) -> tuple[int, float]:
    """New behaviour: single matrix-vector dot product."""
    q = query / (np.linalg.norm(query) + 1e-12)
    # matrix rows assumed L2-normalised in the service; we normalise here for parity.
    norms = np.linalg.norm(matrix, axis=1, keepdims=True) + 1e-12
    m = matrix / norms
    scores = m @ q
    idx = int(np.argmax(scores))
    return idx, float(scores[idx])


def benchmark(n: int, dim: int, repeat: int):
    rng = np.random.default_rng(seed=42)
    stored_list = [rng.standard_normal(dim).astype(np.float32) for _ in range(n)]
    stored_matrix = np.vstack(stored_list)
    query = rng.standard_normal(dim).astype(np.float32)

    # Warm-up.
    loop_cosine(query, stored_list)
    vector_cosine(query, stored_matrix)

    t0 = time.perf_counter()
    for _ in range(repeat):
        loop_cosine(query, stored_list)
    loop_ms = (time.perf_counter() - t0) * 1000 / repeat

    t0 = time.perf_counter()
    for _ in range(repeat):
        vector_cosine(query, stored_matrix)
    vec_ms = (time.perf_counter() - t0) * 1000 / repeat

    speedup = loop_ms / vec_ms if vec_ms > 0 else float("inf")
    return loop_ms, vec_ms, speedup


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sizes", type=int, nargs="+", default=[100, 1000, 5000, 10000])
    parser.add_argument("--dim", type=int, default=384)  # all-MiniLM-L6-v2 dim
    parser.add_argument("--repeat", type=int, default=5)
    args = parser.parse_args()

    print(f"{'N tickets':>10} | {'loop (ms)':>12} | {'vector (ms)':>12} | {'speedup':>8}")
    print("-" * 54)
    for n in args.sizes:
        loop_ms, vec_ms, speedup = benchmark(n, args.dim, args.repeat)
        print(f"{n:>10} | {loop_ms:>12.3f} | {vec_ms:>12.3f} | {speedup:>7.1f}x")


if __name__ == "__main__":
    main()
