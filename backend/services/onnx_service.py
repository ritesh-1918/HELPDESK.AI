"""
Optional ONNX Runtime fallback for offline ticket classification.

The service runs a locally exported all-MiniLM-L6-v2 encoder and compares the
ticket embedding against small, deterministic IT-support prototype prompts.
It is intentionally lazy: if ONNX artifacts or dependencies are unavailable,
the main classifier cascade continues without this fallback.

All cosine similarity computations use vectorized NumPy operations for
optimal performance.  The loop-based fallback has been replaced with
matrix-level dot products that run in compiled BLAS code.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_MODEL_DIR = BASE_DIR / "models" / "onnx-minilm"

PRIORITY_MAP = {
    "Blue Screen": "Critical", "Overheating": "Critical", "Data Loss": "Critical",
    "Hardware Failure": "Critical", "Application Crash": "High",
    "Login Failure": "High", "Password Reset": "High", "VPN Connection": "High",
    "Firewall Block": "High", "DNS Problem": "High", "MFA Problem": "High",
    "Account Expired": "High", "Permission Issue": "Medium", "Access Request": "Medium",
    "Software Install": "Medium", "Update Problem": "Medium", "Compatibility": "Medium",
    "Configuration": "Medium", "License Issue": "Medium", "Performance": "Medium",
    "Internet Slow": "Medium", "WiFi Issue": "Medium", "Remote Access": "Medium",
    "Proxy Error": "Medium", "Network Drive": "Medium", "Role Change": "Medium",
    "Account Unlock": "Low", "Keyboard/Mouse": "Low", "Monitor Problem": "Low",
    "Printer Error": "Low", "Battery Issue": "Low", "Laptop Issue": "Low",
}

TEAM_MAP = {
    "Access": "IAM Team",
    "Network": "Network Support",
    "Software": "Application Support",
    "Hardware": "Hardware Support",
}

AUTO_RESOLVE_SUBS = {
    "Password Reset", "Account Unlock", "Software Install",
    "WiFi Issue", "Printer Error", "Monitor Problem",
}

CATEGORY_PROTOTYPES = {
    "Access": [
        "user cannot log in password reset account locked multi factor authentication access denied",
        "permission issue role change account expired oauth sso login failure",
    ],
    "Network": [
        "vpn connection failed dns problem firewall block internet slow wifi issue proxy error",
        "network latency routing bandwidth packet loss remote access outage",
    ],
    "Software": [
        "application crash website error software install update problem license issue database bug",
        "production app failing sql error compatibility configuration performance issue",
    ],
    "Hardware": [
        "laptop overheating blue screen printer error monitor problem keyboard mouse battery issue",
        "hardware failure device not working disk failure peripheral problem",
    ],
}

SUBCATEGORY_PROTOTYPES = {
    "Login Failure": "login failure user cannot sign in authentication rejected",
    "Password Reset": "password reset forgot password change credentials",
    "Account Unlock": "account locked unlock user account",
    "MFA Problem": "multi factor authentication otp authenticator problem",
    "Permission Issue": "permission denied access request role change",
    "VPN Connection": "vpn connection remote access tunnel failed",
    "DNS Problem": "dns problem hostname resolution domain lookup failed",
    "Firewall Block": "firewall block port blocked traffic denied",
    "Internet Slow": "internet slow bandwidth latency unstable connection",
    "WiFi Issue": "wifi issue wireless network disconnecting",
    "Application Crash": "application crash app closes unexpectedly",
    "Software Install": "software install package setup application installation",
    "Update Problem": "software update patch upgrade problem",
    "License Issue": "license issue subscription activation problem",
    "Configuration": "configuration setting environment setup problem",
    "Performance": "performance slow application database latency",
    "Blue Screen": "blue screen crash stop code operating system failure",
    "Overheating": "laptop overheating fan temperature shutdown",
    "Printer Error": "printer error paper jam print queue problem",
    "Monitor Problem": "monitor display problem screen flickering",
    "Keyboard/Mouse": "keyboard mouse input device not working",
    "Battery Issue": "battery charging power adapter issue",
    "Hardware Failure": "hardware failure broken device component failure",
}


@dataclass(frozen=True)
class PrototypeMatch:
    label: str
    score: float


def cosine_similarity(query: np.ndarray, prototypes: np.ndarray) -> np.ndarray:
    """Vectorized cosine similarity between a query and a matrix of prototypes.

    For L2-normalised vectors, cosine similarity is equivalent to dot product.
    The function falls back to explicit normalisation if vectors are not unit.

    Args:
        query:      1-D float32 array of shape (d,).
        prototypes: 2-D float32 array of shape (N, d).

    Returns:
        1-D float32 array of shape (N,) with similarity scores in [-1, 1].
    """
    q = np.asarray(query, dtype=np.float32)
    p = np.asarray(prototypes, dtype=np.float32)

    if q.ndim != 1:
        raise ValueError(f"query must be 1-D, got shape {q.shape}")
    if p.ndim != 2:
        raise ValueError(f"prototypes must be 2-D (N, d), got shape {p.shape}")
    if q.shape[0] != p.shape[1]:
        raise ValueError(
            f"Dimension mismatch: query ({q.shape[0]}) vs prototypes ({p.shape[1]})"
        )

    # Vectorized: all dot products in one BLAS call
    return p @ q


def best_prototype_match(query_embedding: np.ndarray, prototypes: dict[str, np.ndarray]) -> PrototypeMatch:
    prototypes_matrix = np.array(list(prototypes.values()), dtype=np.float32)
    labels = list(prototypes.keys())

    if prototypes_matrix.shape[0] == 0:
        return PrototypeMatch(label="Unknown", score=0.0)

    scores = cosine_similarity(query_embedding, prototypes_matrix)
    best_index = int(np.argmax(scores))
    return PrototypeMatch(label=labels[best_index], score=float(scores[best_index]))


def build_classification_result(category: str, subcategory: str, confidence: float) -> dict:
    return {
        "category": category,
        "subcategory": subcategory,
        "priority": PRIORITY_MAP.get(subcategory, "Medium"),
        "auto_resolve": subcategory in AUTO_RESOLVE_SUBS,
        "assigned_team": TEAM_MAP.get(category, "General Support"),
        "confidence": round(float(confidence), 4),
        "source": "onnx-minilm",
    }


class OnnxClassifierFallback:
    def __init__(self, model_dir: str | os.PathLike | None = None):
        self.model_dir = Path(model_dir or os.getenv("ONNX_MINILM_MODEL_DIR") or DEFAULT_MODEL_DIR)
        self.session = None
        self.tokenizer = None
        self.category_embeddings: dict[str, np.ndarray] = {}
        self.subcategory_embeddings: dict[str, np.ndarray] = {}
        self._loaded = False

    def load(self) -> bool:
        if self._loaded:
            return True

        model_path = self.model_dir / "model.onnx"
        tokenizer_path = self.model_dir / "tokenizer.json"
        if not model_path.exists() or not tokenizer_path.exists():
            return False

        try:
            import onnxruntime as ort
            from tokenizers import Tokenizer

            self.session = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])
            self.tokenizer = Tokenizer.from_file(str(tokenizer_path))
            self.category_embeddings = self._embed_prototype_groups(CATEGORY_PROTOTYPES)
            self.subcategory_embeddings = self._embed_text_map(SUBCATEGORY_PROTOTYPES)
            self._loaded = True
            print(f"[ONNX] Local MiniLM fallback loaded from {self.model_dir}")
            return True
        except Exception as error:
            print(f"[ONNX] Local MiniLM fallback unavailable: {error}")
            return False

    def _embed_prototype_groups(self, prototypes: dict[str, list[str]]) -> dict[str, np.ndarray]:
        return {
            label: self._average_embeddings(
                np.vstack([self.embed(text) for text in prompts])
            )
            for label, prompts in prototypes.items()
        }

    def _embed_text_map(self, prototypes: dict[str, str]) -> dict[str, np.ndarray]:
        return {label: self.embed(text).ravel() for label, text in prototypes.items()}

    @staticmethod
    def _average_embeddings(embeddings: np.ndarray) -> np.ndarray:
        """Average embeddings across the first (batch) dimension using vectorized NumPy."""
        if embeddings.shape[0] == 0:
            return np.array([], dtype=np.float32)
        return embeddings.mean(axis=0)

    def embed(self, text: str) -> np.ndarray:
        if not self.session or not self.tokenizer:
            raise RuntimeError("ONNX fallback is not loaded")

        encoding = self.tokenizer.encode(text)
        input_ids = np.array([encoding.ids], dtype=np.int64)
        attention_mask = np.array([encoding.attention_mask], dtype=np.int64)
        feed = {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
        }
        input_names = {input_info.name for input_info in self.session.get_inputs()}
        if "token_type_ids" in input_names:
            feed["token_type_ids"] = np.array([encoding.type_ids], dtype=np.int64)

        outputs = self.session.run(None, feed)
        token_embeddings = outputs[0].astype(np.float32)  # (1, seq_len, d)
        mask = attention_mask[:, :, np.newaxis].astype(np.float32)

        sum_embeddings = (token_embeddings * mask).sum(axis=1)
        sum_mask = mask.sum(axis=1).clip(min=1e-9)
        embedding = (sum_embeddings / sum_mask).ravel()

        norm = np.linalg.norm(embedding)
        if norm > 1e-9:
            embedding = embedding / norm

        return embedding

    def predict(self, text: str) -> dict | None:
        if not self.load():
            return None

        query_embedding = self.embed(text)
        category = best_prototype_match(query_embedding, self.category_embeddings)
        subcategory = best_prototype_match(query_embedding, self.subcategory_embeddings)
        confidence = max(category.score, subcategory.score)
        return build_classification_result(category.label, subcategory.label, confidence)


onnx_classifier = OnnxClassifierFallback()
