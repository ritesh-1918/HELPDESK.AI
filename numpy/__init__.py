from __future__ import annotations

import math
from typing import Any, Iterable

__version__ = "0.0-shim"

float32 = float


class ndarray(list):
    def tolist(self):
        return [item.tolist() if hasattr(item, "tolist") else item for item in self]

    def astype(self, _dtype):
        return self

    def __matmul__(self, other):
        if isinstance(other, ndarray):
            return ndarray([sum(a * b for a, b in zip(row, other)) for row in self])
        return ndarray([sum(a * b for a, b in zip(row, other)) for row in self])


def _wrap(value: Any):
    if isinstance(value, ndarray):
        return value
    if isinstance(value, list):
        return ndarray([_wrap(item) if isinstance(item, list) else item for item in value])
    if isinstance(value, tuple):
        return ndarray([_wrap(item) if isinstance(item, (list, tuple)) else item for item in value])
    return value


def array(value: Iterable[Any], dtype: Any = None):  # noqa: ARG001
    return _wrap(list(value))


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def sqrt(value):
    return math.sqrt(value)


def norm(value, axis=None, keepdims=False):  # noqa: ARG001
    if isinstance(value, ndarray) and value and isinstance(value[0], (list, ndarray)):
        result = [math.sqrt(sum(float(x) * float(x) for x in row)) for row in value]
        return ndarray([[r] if keepdims else r for r in result]) if keepdims else ndarray(result)
    return math.sqrt(sum(float(x) * float(x) for x in value))


class _Testing:
    @staticmethod
    def assert_allclose(actual, desired, rtol=1e-7, atol=0.0):  # noqa: ARG002
        a = list(actual)
        d = list(desired)
        if len(a) != len(d):
            raise AssertionError(f"Length mismatch: {len(a)} != {len(d)}")
        for i, (x, y) in enumerate(zip(a, d)):
            if abs(float(x) - float(y)) > (atol + rtol * abs(float(y))):
                raise AssertionError(f"Values differ at {i}: {x} != {y}")


testing = _Testing()

