"""
Random Forest Classifier (Feature-Engineered)
Provides pattern-recognition classification via hand-crafted features
as a complementary ensemble model.
"""

import os
import re
import pickle
import logging
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models" / "rf_classifier"

# Label list — kept in sync with tfidf_model.DEFAULT_LABELS to avoid circular imports
DEFAULT_LABELS = [
    "Access | Password Reset", "Access | Login Failure", "Access | Access Request",
    "Access | Permission Issue", "Access | MFA Problem", "Access | Account Expired",
    "Access | Role Change", "Access | Account Unlock",
    "Software | Software Install", "Software | Data Loss", "Software | Application Crash",
    "Software | Update Problem", "Software | Compatibility", "Software | Configuration",
    "Software | License Issue", "Software | Performance",
    "Hardware | Overheating", "Hardware | Hardware Failure", "Hardware | Keyboard/Mouse",
    "Hardware | Laptop Issue", "Hardware | Battery Issue", "Hardware | Blue Screen",
    "Hardware | Monitor Problem", "Hardware | Printer Error",
    "Network | DNS Problem", "Network | Internet Slow", "Network | Remote Access",
    "Network | VPN Connection", "Network | WiFi Issue", "Network | Firewall Block",
    "Network | Proxy Error", "Network | Network Drive",
]

# Keyword signals for pseudo-training data (imported from tfidf_model lazily)

# Feature vocabulary: category-level keyword groups
FEATURE_GROUPS = {
    "access_keywords": [
        "password", "login", "authentication", "account", "permission",
        "access", "mfa", "2fa", "role", "unlock", "expired", "unauthorized",
    ],
    "software_keywords": [
        "crash", "install", "update", "upgrade", "patch", "configure",
        "configuration", "license", "activation", "performance", "lag",
        "data", "corrupt", "compatibility", "software", "application",
    ],
    "hardware_keywords": [
        "hardware", "screen", "monitor", "keyboard", "mouse", "printer",
        "battery", "charging", "laptop", "blue screen", "overheating",
        "fan", "temperature", "broken", "damaged",
    ],
    "network_keywords": [
        "network", "internet", "wifi", "vpn", "dns", "firewall",
        "proxy", "bandwidth", "latency", "slow", "connection", "remote",
        "drive", "share", "disconnected",
    ],
    "urgency_keywords": [
        "urgent", "critical", "emergency", "asap", "immediately",
        "production", "down", "outage", "blocked", "cannot work",
    ],
    "question_markers": ["?", "how", "why", "what", "when", "where"],
    "negation_markers": ["not", "cannot", "can't", "unable", "failed", "no", "never"],
}


def _extract_features(text: str) -> np.ndarray:
    """
    Extract a hand-crafted feature vector from ticket text.
    Features: keyword group counts, text statistics, pattern flags.
    """
    lower = text.lower()
    features = []

    # Keyword group hit counts
    for group, keywords in FEATURE_GROUPS.items():
        count = sum(1 for kw in keywords if kw in lower)
        features.append(count)

    # Text statistics
    features.append(len(text))                         # char count
    features.append(len(text.split()))                 # word count
    features.append(lower.count("!"))                  # exclamation marks
    features.append(lower.count("?"))                  # question marks
    features.append(int(any(c.isupper() for c in text)))  # has uppercase (urgency)

    # Specific pattern flags
    features.append(int(bool(re.search(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", lower))))  # IP address
    features.append(int(bool(re.search(r"\berror\s*\d+\b|\bcode\s*\d+\b", lower))))           # Error codes
    features.append(int("cannot" in lower or "can't" in lower or "unable" in lower))           # Inability

    return np.array(features, dtype=np.float32)


class RandomForestClassifierService:
    """
    Random Forest classifier using hand-crafted features.
    Trained on pseudo-data derived from keyword patterns and returns soft
    probability distributions for use in ensemble voting.
    """

    def __init__(self):
        self.classifier = None
        self.labels = list(DEFAULT_LABELS)
        self._loaded = False
        self._load_or_train()

    def _load_or_train(self):
        try:
            from sklearn.ensemble import RandomForestClassifier
        except ImportError:
            logger.error("[RF] scikit-learn not installed.")
            return

        model_file = MODEL_DIR / "rf_model.pkl"
        if model_file.exists():
            try:
                with open(model_file, "rb") as f:
                    saved = pickle.load(f)
                self.classifier = saved["classifier"]
                self.labels = saved["labels"]
                self._loaded = True
                logger.info("[RF] Loaded persisted model from disk.")
                return
            except Exception as e:
                logger.warning(f"[RF] Failed to load persisted model: {e}. Retraining.")

        # Build pseudo-training data using keyword signals (lazy import to avoid circular)
        from backend.services.tfidf_model import KEYWORD_SIGNALS
        X_train, y_train = [], []

        for label, keywords in KEYWORD_SIGNALS.items():
            if label not in self.labels:
                continue
            templates = [
                "{kw}",
                "I have a {kw} problem",
                "Help with {kw}",
                "Issue with {kw}",
                "Error: {kw} is not working",
                "Can't {kw} on my device",
            ]
            for kw in keywords:
                for tmpl in templates:
                    sentence = tmpl.format(kw=kw)
                    features = _extract_features(sentence)
                    X_train.append(features)
                    y_train.append(label)

        # Pad missing labels
        for label in self.labels:
            if label not in y_train:
                dummy = label.split(" | ")[-1].lower()
                X_train.append(_extract_features(dummy))
                y_train.append(label)

        X_arr = np.array(X_train)
        self.classifier = RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_leaf=1,
            random_state=42,
            n_jobs=-1,
        )
        self.classifier.fit(X_arr, y_train)
        self._loaded = True

        # Persist
        try:
            MODEL_DIR.mkdir(parents=True, exist_ok=True)
            with open(model_file, "wb") as f:
                pickle.dump({"classifier": self.classifier, "labels": self.labels}, f)
            logger.info("[RF] Model trained and saved.")
        except Exception as e:
            logger.warning(f"[RF] Could not save model: {e}")

    def predict_proba(self, text: str) -> np.ndarray:
        """Return probability array in DEFAULT_LABELS order."""
        if not self._loaded or self.classifier is None:
            return np.ones(len(DEFAULT_LABELS)) / len(DEFAULT_LABELS)

        features = _extract_features(text).reshape(1, -1)
        raw_proba = self.classifier.predict_proba(features)[0]
        class_order = list(self.classifier.classes_)

        result = np.zeros(len(DEFAULT_LABELS))
        for i, label in enumerate(DEFAULT_LABELS):
            if label in class_order:
                idx = class_order.index(label)
                result[i] = raw_proba[idx]

        total = result.sum()
        if total > 0:
            result /= total
        else:
            result = np.ones(len(DEFAULT_LABELS)) / len(DEFAULT_LABELS)

        return result

    def predict(self, text: str) -> dict:
        """Return top prediction with confidence."""
        proba = self.predict_proba(text)
        best_idx = int(np.argmax(proba))
        return {
            "label": DEFAULT_LABELS[best_idx],
            "confidence": float(proba[best_idx]),
            "probabilities": proba,
        }


# Singleton
rf_classifier = RandomForestClassifierService()
