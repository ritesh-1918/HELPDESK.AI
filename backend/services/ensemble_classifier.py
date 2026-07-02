"""
Ensemble Classifier Service — Multi-Model Voting Pipeline
Combines DistilBERT, TF-IDF + Logistic Regression, Random Forest, and Rule-Based
models using weighted soft voting to produce a more accurate, robust classification.

Issue #2805 — Multi-Model Ensemble for Ticket Classifications
"""

import math
import logging
import numpy as np
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Ensemble Weights ─────────────────────────────────────────────────────────
# Based on empirical accuracy from each model type.
# Configurable: higher weight = more influence on the final prediction.
DEFAULT_WEIGHTS = {
    "bert": 0.40,   # DistilBERT — semantic understanding
    "tfidf": 0.30,  # TF-IDF + LR — keyword detection
    "rf": 0.20,     # Random Forest — feature-engineered patterns
    "rules": 0.10,  # Rule engine — deterministic domain signals
}

# ─── Confidence Routing Thresholds ────────────────────────────────────────────
HIGH_CONFIDENCE_THRESHOLD = 0.85    # Auto-route
MEDIUM_CONFIDENCE_THRESHOLD = 0.70  # Auto-route + flag for monitoring
# Below MEDIUM_CONFIDENCE_THRESHOLD → route to Human Review Queue

# ─── Escalation: extreme disagreement (all 4 models predict different labels)
ESCALATION_DISAGREEMENT_THRESHOLD = 0.25  # agreement score below this → escalate


def _shannon_entropy(proba: np.ndarray) -> float:
    """
    Calculate Shannon entropy of a probability distribution.
    Low entropy = high confidence. High entropy = uncertainty.
    """
    # Clip to avoid log(0)
    p = np.clip(proba, 1e-12, 1.0)
    return float(-np.sum(p * np.log(p)))


def _normalized_entropy(proba: np.ndarray) -> float:
    """Entropy normalized to [0, 1] range by dividing by max possible entropy."""
    n = len(proba)
    max_entropy = math.log(n)
    raw = _shannon_entropy(proba)
    return raw / max_entropy if max_entropy > 0 else 0.0


def _agreement_score(model_predictions: list[str]) -> float:
    """
    Compute agreement score: fraction of models agreeing with the majority vote.
    1.0 = all models agree; 0.25 = all 4 disagree on a 4-model ensemble.
    """
    if not model_predictions:
        return 0.0
    from collections import Counter
    most_common_count = Counter(model_predictions).most_common(1)[0][1]
    return most_common_count / len(model_predictions)


def _routing_action(confidence: float, agreement: float) -> str:
    """
    Determine routing action based on confidence and agreement score.

    Returns one of:
      "auto_route"         — send directly to the relevant team
      "monitor"            — auto-route but flag for human review / monitoring
      "human_review"       — send to Human Review Queue
      "escalate"           — extreme disagreement, escalate to supervising admin
    """
    if agreement < ESCALATION_DISAGREEMENT_THRESHOLD:
        return "escalate"
    if confidence >= HIGH_CONFIDENCE_THRESHOLD:
        return "auto_route"
    if confidence >= MEDIUM_CONFIDENCE_THRESHOLD:
        return "monitor"
    return "human_review"


class EnsembleClassifier:
    """
    Multi-Model Ensemble Classifier that aggregates:
      1. DistilBERT (semantic)
      2. TF-IDF + Logistic Regression (keyword)
      3. Random Forest (feature-engineered)
      4. Rule-Based Engine (deterministic)

    Voting Strategy: Weighted Soft Voting
      final_prob = w_bert * bert_probs + w_tfidf * tfidf_probs
                 + w_rf * rf_probs + w_rules * rule_probs
    """

    def __init__(self, weights: Optional[dict] = None):
        self.weights = weights or dict(DEFAULT_WEIGHTS)
        self._bert_proba_fn = None  # Injected at runtime to avoid circular imports
        self._tfidf = None
        self._rf = None
        self._rules = None
        self._label_list = None
        self._initialized = False
        self._initialize()

    def _initialize(self):
        """Lazily import model singletons to avoid circular import issues."""
        try:
            from backend.services.tfidf_model import tfidf_classifier, DEFAULT_LABELS
            from backend.services.rf_model import rf_classifier
            from backend.services.rule_engine import rule_engine

            self._tfidf = tfidf_classifier
            self._rf = rf_classifier
            self._rules = rule_engine
            self._label_list = list(DEFAULT_LABELS)
            self._initialized = True
            logger.info("[Ensemble] Initialized: TF-IDF, RF, Rules ready.")
        except Exception as e:
            logger.error(f"[Ensemble] Initialization failed: {e}")

    def _get_bert_proba(self, text: str) -> Optional[np.ndarray]:
        """
        Get DistilBERT probability vector aligned to self._label_list.
        Tries V3 → V1 fallback. Returns None if neither is available.
        """
        try:
            from backend.services.classifier_v3 import classifier_v3
            from backend.services.classifier_service import ClassifierService, PRIORITY_MAP, TEAM_MAP, AUTO_RESOLVE_SUBS

            result = classifier_v3.predict(text)
            if "error" not in result and result:
                # V3 returns probabilities per head — build label-level proba
                cat_label = result.get("Category", {}).get("prediction", "Unknown")
                sub_label = result.get("Subcategory", {}).get("prediction", "Unknown")
                combined = f"{cat_label} | {sub_label}"
                conf = float(result.get("Category", {}).get("confidence", 0.5))

                proba = np.ones(len(self._label_list)) * ((1.0 - conf) / max(len(self._label_list) - 1, 1))
                if combined in self._label_list:
                    idx = self._label_list.index(combined)
                    proba[idx] = conf
                proba /= proba.sum()
                return proba
        except Exception as e:
            logger.debug(f"[Ensemble] V3 BERT failed: {e}")

        try:
            # Fallback to V1 — it returns a single label + confidence
            from backend.services.classifier_service import ClassifierService
            svc = ClassifierService()
            svc.load()
            v1_res = svc.predict(text)
            combined = f"{v1_res['category']} | {v1_res['subcategory']}"
            conf = float(v1_res.get("confidence", 0.5))

            proba = np.ones(len(self._label_list)) * ((1.0 - conf) / max(len(self._label_list) - 1, 1))
            if combined in self._label_list:
                idx = self._label_list.index(combined)
                proba[idx] = conf
            proba /= proba.sum()
            return proba
        except Exception as e:
            logger.debug(f"[Ensemble] V1 BERT fallback failed: {e}")

        return None

    def predict(self, text: str) -> dict:
        """
        Run ensemble inference on a ticket text string.

        Returns a structured dict with:
          - prediction      : final label ("Category | SubCategory")
          - category        : category portion
          - subcategory     : subcategory portion
          - confidence      : max probability of the ensemble output
          - entropy         : Shannon entropy (normalized, 0–1)
          - agreement       : model agreement score (0–1)
          - routing_action  : one of auto_route / monitor / human_review / escalate
          - needs_review    : bool (True when not auto_route)
          - model_votes     : per-model top predictions for transparency
          - individual_confidences : per-model confidence scores
        """
        if not self._initialized:
            logger.warning("[Ensemble] Not initialized; using rule engine only.")

        n_labels = len(self._label_list) if self._label_list else 1

        # ── Collect probabilities ──────────────────────────────────────────────
        bert_proba = self._get_bert_proba(text)
        tfidf_proba = self._tfidf.predict_proba(text) if self._tfidf else None
        rf_proba = self._rf.predict_proba(text) if self._rf else None
        rules_proba = self._rules.predict_proba(text) if self._rules else None

        # ── Weighted soft voting ───────────────────────────────────────────────
        ensemble_proba = np.zeros(n_labels)
        active_weight = 0.0

        if bert_proba is not None:
            ensemble_proba += self.weights["bert"] * bert_proba
            active_weight += self.weights["bert"]
        if tfidf_proba is not None:
            ensemble_proba += self.weights["tfidf"] * tfidf_proba
            active_weight += self.weights["tfidf"]
        if rf_proba is not None:
            ensemble_proba += self.weights["rf"] * rf_proba
            active_weight += self.weights["rf"]
        if rules_proba is not None:
            ensemble_proba += self.weights["rules"] * rules_proba
            active_weight += self.weights["rules"]

        # Normalize by active weight to handle missing models gracefully
        if active_weight > 0:
            ensemble_proba /= active_weight

        # Normalize to sum to 1
        total = ensemble_proba.sum()
        if total > 0:
            ensemble_proba /= total
        else:
            ensemble_proba = np.ones(n_labels) / n_labels

        # ── Final prediction ───────────────────────────────────────────────────
        best_idx = int(np.argmax(ensemble_proba))
        best_label = self._label_list[best_idx] if self._label_list else "Unknown | Unknown"
        confidence = float(ensemble_proba[best_idx])

        parts = best_label.split(" | ", 1)
        category = parts[0].strip() if len(parts) > 0 else "Unknown"
        subcategory = parts[1].strip() if len(parts) > 1 else "Unknown"

        # ── Uncertainty metrics ────────────────────────────────────────────────
        entropy = _normalized_entropy(ensemble_proba)

        # Per-model top predictions for agreement score
        model_votes = {}
        individual_confidences = {}

        if bert_proba is not None:
            idx = int(np.argmax(bert_proba))
            model_votes["bert"] = self._label_list[idx]
            individual_confidences["bert"] = round(float(bert_proba[idx]), 4)
        if tfidf_proba is not None:
            idx = int(np.argmax(tfidf_proba))
            model_votes["tfidf"] = self._label_list[idx]
            individual_confidences["tfidf"] = round(float(tfidf_proba[idx]), 4)
        if rf_proba is not None:
            idx = int(np.argmax(rf_proba))
            model_votes["rf"] = self._label_list[idx]
            individual_confidences["rf"] = round(float(rf_proba[idx]), 4)
        if rules_proba is not None:
            idx = int(np.argmax(rules_proba))
            model_votes["rules"] = self._label_list[idx]
            individual_confidences["rules"] = round(float(rules_proba[idx]), 4)

        agreement = _agreement_score(list(model_votes.values()))
        routing_action = _routing_action(confidence, agreement)

        return {
            "prediction": best_label,
            "category": category,
            "subcategory": subcategory,
            "confidence": round(confidence, 4),
            "entropy": round(entropy, 4),
            "agreement": round(agreement, 4),
            "routing_action": routing_action,
            "needs_review": routing_action != "auto_route",
            "model_votes": model_votes,
            "individual_confidences": individual_confidences,
        }

    def predict_with_metadata(self, text: str) -> dict:
        """
        Extended prediction including rule matches and ensemble weights for
        dashboard/admin display.
        """
        result = self.predict(text)
        if self._rules:
            result["matched_rules"] = self._rules.get_matched_rules(text)
        result["ensemble_weights"] = dict(self.weights)
        return result

    def update_weights(self, new_weights: dict):
        """
        Dynamically update model weights (for A/B testing or drift adaptation).
        Weights are normalized so they always sum to 1.
        """
        total = sum(new_weights.values())
        if total <= 0:
            raise ValueError("Weights must be positive and sum to > 0")
        self.weights = {k: v / total for k, v in new_weights.items()}
        logger.info(f"[Ensemble] Updated weights: {self.weights}")


# Singleton
ensemble_classifier = EnsembleClassifier()
