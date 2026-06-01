"""
Optional ONNX Runtime fallback for offline ticket classification.

The service runs a locally exported all-MiniLM-L6-v2 encoder and compares the
ticket embedding against small, deterministic IT-support prototype prompts.
It is intentionally lazy: if ONNX artifacts or dependencies are unavailable,
the main classifier cascade continues without this fallback.
"""

from __future__ import annotations

import math
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

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


def cosine_similarity(left: Iterable[float], right: Iterable[float]) -> float:
    left_values = [float(value) for value in left]
    right_values = [float(value) for value in right]
    numerator = sum(a * b for a, b in zip(left_values, right_values))
    left_norm = math.sqrt(sum(value * value for value in left_values))
    right_norm = math.sqrt(sum(value * value for value in right_values))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return numerator / (left_norm * right_norm)


def best_prototype_match(query_embedding: Iterable[float], prototypes: dict[str, list[float]]) -> PrototypeMatch:
    best = PrototypeMatch(label="Unknown", score=0.0)
    for label, embedding in prototypes.items():
        score = cosine_similarity(query_embedding, embedding)
        if score > best.score:
            best = PrototypeMatch(label=label, score=score)
    return best


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
        self.category_embeddings = {}
        self.subcategory_embeddings = {}
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

    def _embed_prototype_groups(self, prototypes: dict[str, list[str]]) -> dict[str, list[float]]:
        return {
            label: self._average_embeddings([self.embed(text) for text in prompts])
            for label, prompts in prototypes.items()
        }

    def _embed_text_map(self, prototypes: dict[str, str]) -> dict[str, list[float]]:
        return {label: self.embed(text) for label, text in prototypes.items()}

    @staticmethod
    def _average_embeddings(embeddings: list[list[float]]) -> list[float]:
        if not embeddings:
            return []
        length = len(embeddings[0])
        return [
            sum(embedding[index] for embedding in embeddings) / len(embeddings)
            for index in range(length)
        ]

    def embed(self, text: str) -> list[float]:
        if not self.session or not self.tokenizer:
            raise RuntimeError("ONNX fallback is not loaded")

        import numpy as np

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
        token_embeddings = outputs[0][0]
        weights = attention_mask[0].astype(float)
        active_count = max(float(weights.sum()), 1.0)
        return [
            float(sum(token[index] * weights[row] for row, token in enumerate(token_embeddings)) / active_count)
            for index in range(len(token_embeddings[0]))
        ]

    def predict(self, text: str) -> dict | None:
        if not self.load():
            return None

        query_embedding = self.embed(text)
        category = best_prototype_match(query_embedding, self.category_embeddings)
        subcategory = best_prototype_match(query_embedding, self.subcategory_embeddings)
        confidence = max(category.score, subcategory.score)
        return build_classification_result(category.label, subcategory.label, confidence)


onnx_classifier = OnnxClassifierFallback()
