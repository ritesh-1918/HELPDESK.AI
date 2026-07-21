"""
TF-IDF + Logistic Regression Classifier
Provides keyword-based classification as a complementary model in the ensemble.
Produces probability scores over all known label classes.
"""

import os
import json
import pickle
import logging
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models" / "tfidf_classifier"
LABELS_PATH = BASE_DIR / "models" / "classifier" / "id2label.json"

# All known combined labels (Category | SubCategory)
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

# Domain keyword signals for keyword-based scoring
KEYWORD_SIGNALS = {
    "Access | Password Reset": ["password", "reset", "forgot", "change password", "new password"],
    "Access | Login Failure": ["login", "sign in", "cannot log", "unable to log", "authentication failed"],
    "Access | Account Unlock": ["locked", "unlock", "account locked", "suspended"],
    "Access | MFA Problem": ["mfa", "2fa", "two-factor", "authenticator", "otp", "verification code"],
    "Access | Permission Issue": ["permission", "denied", "access denied", "not authorized", "forbidden"],
    "Access | Account Expired": ["expired", "expiry", "account expired", "renewal"],
    "Access | Access Request": ["access request", "need access", "grant access", "request access"],
    "Access | Role Change": ["role", "promotion", "demotion", "change role", "new role"],
    "Software | Application Crash": ["crash", "not responding", "application error", "stopped working", "force close"],
    "Software | Software Install": ["install", "installation", "setup", "deploy software"],
    "Software | Update Problem": ["update", "upgrade", "patch", "version", "latest version"],
    "Software | Configuration": ["config", "configuration", "settings", "setup", "configure"],
    "Software | Compatibility": ["compatible", "compatibility", "conflict", "version conflict"],
    "Software | Data Loss": ["data loss", "lost data", "deleted", "missing files", "corrupted"],
    "Software | License Issue": ["license", "activation", "key expired", "not licensed", "trial"],
    "Software | Performance": ["slow", "performance", "lag", "high cpu", "memory", "freeze"],
    "Hardware | Blue Screen": ["blue screen", "bsod", "system crash", "kernel panic"],
    "Hardware | Overheating": ["overheat", "hot", "fan noise", "temperature", "cooling"],
    "Hardware | Hardware Failure": ["hardware failure", "device failure", "broken", "not working", "dead"],
    "Hardware | Keyboard/Mouse": ["keyboard", "mouse", "trackpad", "key not working"],
    "Hardware | Monitor Problem": ["monitor", "display", "screen", "no display", "blank screen"],
    "Hardware | Printer Error": ["printer", "printing", "print queue", "scanner"],
    "Hardware | Battery Issue": ["battery", "charging", "power", "not charging", "draining"],
    "Hardware | Laptop Issue": ["laptop", "notebook", "lid", "hinge", "portable"],
    "Network | DNS Problem": ["dns", "domain", "name resolution", "cannot resolve"],
    "Network | Internet Slow": ["internet slow", "bandwidth", "speed", "slow connection", "latency"],
    "Network | VPN Connection": ["vpn", "virtual private", "tunnel", "remote network"],
    "Network | WiFi Issue": ["wifi", "wireless", "wi-fi", "no wifi", "disconnecting"],
    "Network | Firewall Block": ["firewall", "blocked", "port blocked", "traffic blocked"],
    "Network | Remote Access": ["remote", "rdp", "remote desktop", "teamviewer", "anydesk"],
    "Network | Proxy Error": ["proxy", "proxy error", "proxy server"],
    "Network | Network Drive": ["network drive", "shared drive", "mapped drive", "nas"],
}


class TFIDFClassifierService:
    """
    TF-IDF + Logistic Regression classifier that produces soft probability
    distributions over all label classes for use in ensemble voting.

    On first call it trains in-memory using keyword signals as pseudo-training
    data if no persisted model exists, ensuring zero-dependency operation.
    """

    def __init__(self):
        self.vectorizer = None
        self.classifier = None
        self.labels = list(DEFAULT_LABELS)
        self._loaded = False
        self._load_or_train()

    def _load_or_train(self):
        """Load a persisted model or train a fresh one from keyword pseudo-data."""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.linear_model import LogisticRegression
        except ImportError:
            logger.error("[TF-IDF] scikit-learn not installed.")
            return

        model_file = MODEL_DIR / "tfidf_model.pkl"
        if model_file.exists():
            try:
                with open(model_file, "rb") as f:
                    saved = pickle.load(f)
                self.vectorizer = saved["vectorizer"]
                self.classifier = saved["classifier"]
                self.labels = saved["labels"]
                self._loaded = True
                logger.info("[TF-IDF] Loaded persisted model from disk.")
                return
            except Exception as e:
                logger.warning(f"[TF-IDF] Failed to load persisted model: {e}. Retraining.")

        # Build pseudo-training data from keyword signals
        X_train, y_train = [], []
        for label, keywords in KEYWORD_SIGNALS.items():
            if label not in self.labels:
                continue
            for kw in keywords:
                # Generate multiple pseudo-examples per keyword for robustness
                X_train.append(kw)
                y_train.append(label)
                X_train.append(f"I have a problem with {kw}")
                y_train.append(label)
                X_train.append(f"Issue: {kw} is not working")
                y_train.append(label)

        # Ensure all labels have at least one example
        for label in self.labels:
            if label not in y_train:
                X_train.append(label.split(" | ")[-1].lower())
                y_train.append(label)

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=8000,
            sublinear_tf=True,
            min_df=1,
        )
        X_vec = self.vectorizer.fit_transform(X_train)

        self.classifier = LogisticRegression(
            max_iter=1000,
            C=1.0,
            solver="lbfgs",
        )
        self.classifier.fit(X_vec, y_train)
        self._loaded = True

        # Persist model
        try:
            MODEL_DIR.mkdir(parents=True, exist_ok=True)
            with open(model_file, "wb") as f:
                pickle.dump({
                    "vectorizer": self.vectorizer,
                    "classifier": self.classifier,
                    "labels": self.labels,
                }, f)
            logger.info("[TF-IDF] Model trained and saved.")
        except Exception as e:
            logger.warning(f"[TF-IDF] Could not save model: {e}")

    def predict_proba(self, text: str) -> np.ndarray:
        """
        Return a probability array over all labels in DEFAULT_LABELS order.
        Shape: (len(DEFAULT_LABELS),)
        """
        if not self._loaded or self.vectorizer is None:
            return np.ones(len(DEFAULT_LABELS)) / len(DEFAULT_LABELS)

        X_vec = self.vectorizer.transform([text])
        raw_proba = self.classifier.predict_proba(X_vec)[0]  # shape: (n_classes,)
        class_order = list(self.classifier.classes_)

        # Map back to DEFAULT_LABELS order
        result = np.zeros(len(DEFAULT_LABELS))
        for i, label in enumerate(DEFAULT_LABELS):
            if label in class_order:
                idx = class_order.index(label)
                result[i] = raw_proba[idx]

        # Normalize to sum to 1
        total = result.sum()
        if total > 0:
            result /= total
        else:
            result = np.ones(len(DEFAULT_LABELS)) / len(DEFAULT_LABELS)

        return result

    def predict(self, text: str) -> dict:
        """Return top prediction with confidence and full probability vector."""
        proba = self.predict_proba(text)
        best_idx = int(np.argmax(proba))
        return {
            "label": DEFAULT_LABELS[best_idx],
            "confidence": float(proba[best_idx]),
            "probabilities": proba,
        }


# Singleton
tfidf_classifier = TFIDFClassifierService()
