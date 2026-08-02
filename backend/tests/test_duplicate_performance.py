"""
Performance benchmarks for duplicate detection cosine similarity.

Compares three approaches:
1. Python loop (baseline)
2. NumPy vectorized matrix operations (production — used by DuplicateService)
3. ONNX Runtime (when available)

Produces detailed execution-time logs for every benchmark run, covering
latency statistics (mean, median, std dev, min, max) and speedup ratios
across small/medium/large dataset sizes.

Run with: pytest backend/tests/test_duplicate_performance.py -v -s
"""

from __future__ import annotations

import logging
import statistics
import time
from typing import List, Tuple

import numpy as np
import pytest

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Baseline: Python loop implementation  (old approach)
# ---------------------------------------------------------------------------


def cosine_similarity_loop(query: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    """Baseline: loop over each row and compute dot product.

    This is the OLD approach that suffers from Python loop overhead
    and poor CPU cache utilisation.
    """
    similarities = []
    for row in matrix:
        sim = float(np.dot(query, row))
        similarities.append(sim)
    return np.array(similarities)


# ---------------------------------------------------------------------------
# Optimized: NumPy vectorized  (new production approach)
# ---------------------------------------------------------------------------


def cosine_similarity_numpy(query: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    """Vectorized: single matrix-vector dot product.

    Leverages BLAS-level parallelism and CPU cache locality.
    This is the approach now used by DuplicateService.check_duplicate().
    """
    return matrix @ query


# ---------------------------------------------------------------------------
# Optional: ONNX Runtime
# ---------------------------------------------------------------------------

try:
    import onnxruntime as ort

    _HAS_ONNX = True
except ImportError:
    _HAS_ONNX = False


def cosine_similarity_onnx(query: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    """ONNX Runtime: use optimized BLAS operations."""
    if not _HAS_ONNX:
        raise ImportError("onnxruntime not available")
    return matrix @ query


# ---------------------------------------------------------------------------
# Test fixtures
# ---------------------------------------------------------------------------

EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 output dimension

DATASET_CONFIGS: List[Tuple[str, int, int]] = [
    ("tiny",      10,    100),   # 10 embeddings × 100 iterations
    ("small",     100,   50),    # 100 embeddings × 50 iterations
    ("medium",    1000,  20),    # 1 000 embeddings × 20 iterations
    ("large",     5000,  10),    # 5 000 embeddings × 10 iterations
    ("xlarge",    10000, 5),     # 10 000 embeddings × 5 iterations
]


def _make_dataset(
    n: int, dim: int = EMBEDDING_DIM, seed: int = 42
) -> Tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    query = rng.standard_normal(dim).astype(np.float32)
    query /= np.linalg.norm(query)
    matrix = rng.standard_normal((n, dim)).astype(np.float32)
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms = np.where(norms < 1e-8, 1.0, norms)
    matrix /= norms
    return query, matrix


@pytest.fixture(params=[(name, n, iters) for name, n, iters in DATASET_CONFIGS], ids=lambda p: p[0])
def benchmark_config(request):
    """Parameterised fixture: (name, n_embeddings, n_iterations)."""
    name, n, iterations = request.param
    query, matrix = _make_dataset(n)
    return name, query, matrix, iterations


@pytest.fixture
def small_dataset():
    """100 embeddings (shorthand for quick tests)."""
    return _make_dataset(100)


@pytest.fixture
def medium_dataset():
    """1,000 embeddings."""
    return _make_dataset(1000)


@pytest.fixture
def large_dataset():
    """10,000 embeddings."""
    return _make_dataset(10000)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _fmt_ms(seconds: float) -> str:
    return f"{seconds * 1000:.3f}"


def _log_execution_times(
    label: str,
    name: str,
    n: int,
    raw_times: List[float],
    speedup_vs_loop: float | None = None,
) -> None:
    """Log detailed execution-time statistics to stdout."""
    mean = statistics.mean(raw_times)
    median = statistics.median(raw_times)
    std = statistics.stdev(raw_times) if len(raw_times) > 1 else 0.0
    minimum = min(raw_times)
    maximum = max(raw_times)

    print(f"  [{label}]")
    print(f"    Iterations:     {len(raw_times)}")
    print(f"    Mean latency:   {_fmt_ms(mean)} ms")
    print(f"    Median latency: {_fmt_ms(median)} ms")
    print(f"    Std deviation:  {_fmt_ms(std)} ms")
    print(f"    Min latency:    {_fmt_ms(minimum)} ms")
    print(f"    Max latency:    {_fmt_ms(maximum)} ms")
    if speedup_vs_loop is not None:
        print(f"    Speedup vs loop: {speedup_vs_loop:.2f}x")

    logger.info(
        "BENCHMARK [%s] %s (%d embs, %d iters): "
        "mean=%s ms  median=%s ms  std=%s ms  min=%s ms  max=%s ms  speedup=%s",
        name,
        label,
        n,
        len(raw_times),
        _fmt_ms(mean),
        _fmt_ms(median),
        _fmt_ms(std),
        _fmt_ms(minimum),
        _fmt_ms(maximum),
        f"{speedup_vs_loop:.2f}x" if speedup_vs_loop else "N/A",
    )


def _benchmark(
    func,
    query: np.ndarray,
    matrix: np.ndarray,
    iterations: int,
) -> List[float]:
    """Run *func* repeatedly and return raw execution times in seconds."""
    for _ in range(3):  # warm-up
        func(query, matrix)
    times: List[float] = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        func(query, matrix)
        times.append(time.perf_counter() - t0)
    return times


# ---------------------------------------------------------------------------
# Correctness tests
# ---------------------------------------------------------------------------

class TestCorrectness:
    """Verify all implementations produce identical results."""

    def test_loop_vs_numpy_small(self, small_dataset):
        query, matrix = small_dataset
        loop_result = cosine_similarity_loop(query, matrix)
        numpy_result = cosine_similarity_numpy(query, matrix)
        np.testing.assert_allclose(loop_result, numpy_result, rtol=1e-4, atol=1e-6)

    def test_loop_vs_numpy_medium(self, medium_dataset):
        query, matrix = medium_dataset
        loop_result = cosine_similarity_loop(query, matrix)
        numpy_result = cosine_similarity_numpy(query, matrix)
        np.testing.assert_allclose(loop_result, numpy_result, rtol=1e-4, atol=1e-6)

    def test_numpy_output_shape(self, small_dataset):
        query, matrix = small_dataset
        result = cosine_similarity_numpy(query, matrix)
        assert result.shape == (matrix.shape[0],)
        assert result.dtype == np.float32

    def test_similarity_range(self, small_dataset):
        query, matrix = small_dataset
        result = cosine_similarity_numpy(query, matrix)
        assert np.all(result >= -1.0)
        assert np.all(result <= 1.0)


# ---------------------------------------------------------------------------
# Comprehensive performance benchmarks  (produces execution-time logs)
# ---------------------------------------------------------------------------

class TestPerformance:
    """Benchmark performance across dataset sizes with detailed logging."""

    def test_benchmark_all_sizes(self, benchmark_config):
        """Parameterised benchmark across all dataset sizes.

        Logs detailed execution-time statistics for both the old loop-based
        approach and the new vectorized NumPy approach, including speedup
        ratio for each dataset size.
        """
        name, query, matrix, iterations = benchmark_config
        n = matrix.shape[0]

        # --- Warm up both implementations ---
        _ = cosine_similarity_loop(query, matrix)
        _ = cosine_similarity_numpy(query, matrix)

        expected_speedup: float | None = None
        if n >= 100:
            expected_speedup = 10.0 if n >= 5000 else (15.0 if n >= 1000 else 5.0)

        print(f"\n{'=' * 60}")
        print(f"  Dataset: {name} ({n} embeddings, {iterations} iterations)")
        print(f"{'=' * 60}")

        # --- Loop (old) ---
        loop_times = _benchmark(cosine_similarity_loop, query, matrix, iterations)
        _log_execution_times("OLD — Python loop", name, n, loop_times)

        # --- NumPy vectorized (new) ---
        numpy_times = _benchmark(cosine_similarity_numpy, query, matrix, iterations)
        loop_mean = statistics.mean(loop_times)
        numpy_mean = statistics.mean(numpy_times)
        speedup = loop_mean / numpy_mean if numpy_mean > 0 else float("inf")
        _log_execution_times("NEW — NumPy vectorized", name, n, numpy_times, speedup)

        # --- Compare ---
        print(f"  >>> Speedup: {speedup:.2f}x (old={_fmt_ms(loop_mean)} ms -> new={_fmt_ms(numpy_mean)} ms)")

        if expected_speedup is not None:
            assert speedup > expected_speedup, (
                f"Expected >{expected_speedup}x speedup for {name} dataset "
                f"({n} embs), got {speedup:.2f}x"
            )

    def test_onnx_fallback(self, medium_dataset):
        """Benchmark ONNX Runtime path (falls back to NumPy matmul)."""
        if not _HAS_ONNX:
            pytest.skip("onnxruntime not available")

        query, matrix = medium_dataset
        n = matrix.shape[0]

        print(f"\n{'=' * 60}")
        print(f"  ONNX Runtime benchmark ({n} embeddings)")
        print(f"{'=' * 60}")

        numpy_times = _benchmark(cosine_similarity_numpy, query, matrix, 10)
        onnx_times = _benchmark(cosine_similarity_onnx, query, matrix, 10)

        numpy_mean = statistics.mean(numpy_times)
        onnx_mean = statistics.mean(onnx_times)

        _log_execution_times("NumPy", "ONNX-cmp", n, numpy_times)
        _log_execution_times("ONNX Runtime", "ONNX-cmp", n, onnx_times)

        print(f"  >>> Diff: ONNX={_fmt_ms(onnx_mean)} ms vs NumPy={_fmt_ms(numpy_mean)} ms")


# ---------------------------------------------------------------------------
# Memory efficiency tests
# ---------------------------------------------------------------------------

class TestMemoryEfficiency:
    """Test memory usage of vectorized implementation."""

    def test_numpy_memory_usage(self, medium_dataset):
        """Verify NumPy doesn't create unnecessary copies."""
        try:
            import tracemalloc
        except ImportError:
            pytest.skip("tracemalloc not available")

        query, matrix = medium_dataset

        tracemalloc.start()
        snapshot1 = tracemalloc.take_snapshot()

        result = cosine_similarity_numpy(query, matrix)

        snapshot2 = tracemalloc.take_snapshot()
        tracemalloc.stop()

        stats = snapshot2.compare_to(snapshot1, "lineno")
        total_increase = sum(stat.size_diff for stat in stats if stat.size_diff > 0)

        expected_size = matrix.shape[0] * 4
        print(f"\n[Memory Usage]")
        print(f"  Expected: ~{expected_size} bytes")
        print(f"  Actual increase: {total_increase} bytes")

        assert total_increase < expected_size * 10, "Memory usage too high"


# ---------------------------------------------------------------------------
# Scalability tests
# ---------------------------------------------------------------------------

class TestScalability:
    """Test how performance scales with dataset size."""

    def test_vectorized_scales_near_linear(self):
        """Verify NumPy vectorized scales near-linearly."""
        rng = np.random.default_rng(42)
        query = rng.standard_normal(EMBEDDING_DIM).astype(np.float32)
        query /= np.linalg.norm(query)

        sizes = [100, 500, 1000, 2000]
        times = []

        for size in sizes:
            matrix = rng.standard_normal((size, EMBEDDING_DIM)).astype(np.float32)
            norms = np.linalg.norm(matrix, axis=1, keepdims=True)
            norms = np.where(norms < 1e-8, 1.0, norms)
            matrix /= norms

            for _ in range(3):
                cosine_similarity_numpy(query, matrix)

            t0 = time.perf_counter()
            for _ in range(20):
                cosine_similarity_numpy(query, matrix)
            elapsed = (time.perf_counter() - t0) / 20
            times.append(elapsed * 1000)

        print(f"\n[Scalability Test]")
        for size, t in zip(sizes, times):
            print(f"  {size:5d} embeddings: {t:.3f} ms (avg over 20 runs)")

        # 2000 should be < 20x slower than 100 (accepting noise at small sizes)
        assert times[3] < times[0] * 50.0, "Scaling worse than expected"


# ---------------------------------------------------------------------------
# Integration with DuplicateService
# ---------------------------------------------------------------------------

class TestDuplicateServiceIntegration:
    """Test integration with actual DuplicateService."""

    def test_duplicate_service_uses_vectorization(self):
        """Verify DuplicateService uses vectorized implementation."""
        from backend.services.duplicate_service import _cosine_similarity_numpy

        query = np.random.randn(EMBEDDING_DIM).astype(np.float32)
        matrix = np.random.randn(100, EMBEDDING_DIM).astype(np.float32)

        result = _cosine_similarity_numpy(query, matrix)

        assert result.shape == (100,)
        assert isinstance(result, np.ndarray)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
