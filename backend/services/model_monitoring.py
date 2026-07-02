"""
Model Monitoring & Drift Detection Service
Tracks ensemble and individual model performance metrics over time.
Detects prediction drift, confidence degradation, and category distribution shifts.

Issue #2805 — Multi-Model Ensemble for Ticket Classifications
"""

import json
import logging
import datetime
import hashlib
from collections import Counter, deque
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Storage ──────────────────────────────────────────────────────────────────
DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "monitoring"
METRICS_LOG = DATA_DIR / "ensemble_metrics.jsonl"
DRIFT_LOG = DATA_DIR / "drift_events.jsonl"
AB_LOG = DATA_DIR / "ab_test_records.jsonl"

# ─── Drift Detection Thresholds ───────────────────────────────────────────────
CONFIDENCE_DROP_THRESHOLD = 0.10   # Alert if avg confidence drops by this amount
DISAGREEMENT_SPIKE_THRESHOLD = 0.3 # Alert if avg agreement drops below this
WINDOW_SIZE = 100                  # Rolling window for drift detection


class ModelMonitoringService:
    """
    Tracks prediction events and metrics for:
      - Ensemble accuracy and confidence distribution
      - Per-model performance tracking
      - Drift detection (sudden accuracy/confidence drops)
      - A/B testing comparisons
      - Human escalation rate tracking
    """

    def __init__(self):
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        # Rolling window buffers
        self._confidence_window: deque = deque(maxlen=WINDOW_SIZE)
        self._agreement_window: deque = deque(maxlen=WINDOW_SIZE)
        self._category_counter: Counter = Counter()
        self._routing_counter: Counter = Counter()
        self._correction_counter: int = 0
        self._total_predictions: int = 0
        self._load_from_disk()

    def _load_from_disk(self):
        """Replay recent metrics from disk to restore rolling windows."""
        if not METRICS_LOG.exists():
            return
        try:
            with open(METRICS_LOG, "r", encoding="utf-8") as f:
                lines = f.readlines()[-WINDOW_SIZE:]
            for line in lines:
                record = json.loads(line)
                self._confidence_window.append(record.get("confidence", 0.0))
                self._agreement_window.append(record.get("agreement", 0.0))
                self._category_counter[record.get("category", "Unknown")] += 1
                self._routing_counter[record.get("routing_action", "unknown")] += 1
                self._total_predictions += 1
        except Exception as e:
            logger.warning(f"[Monitor] Could not load historical metrics: {e}")

    def log_prediction(self, prediction_record: dict):
        """
        Log a new prediction event for monitoring.
        Accepts the dict output from EnsembleClassifier.predict_with_metadata().
        """
        self._total_predictions += 1
        conf = prediction_record.get("confidence", 0.0)
        agreement = prediction_record.get("agreement", 0.0)
        category = prediction_record.get("category", "Unknown")
        routing = prediction_record.get("routing_action", "unknown")

        self._confidence_window.append(conf)
        self._agreement_window.append(agreement)
        self._category_counter[category] += 1
        self._routing_counter[routing] += 1

        # Persist to JSONL
        entry = {
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "prediction": prediction_record.get("prediction", ""),
            "category": category,
            "subcategory": prediction_record.get("subcategory", ""),
            "confidence": round(conf, 4),
            "entropy": round(prediction_record.get("entropy", 0.0), 4),
            "agreement": round(agreement, 4),
            "routing_action": routing,
            "model_votes": prediction_record.get("model_votes", {}),
            "individual_confidences": prediction_record.get("individual_confidences", {}),
        }
        self._write_jsonl(METRICS_LOG, entry)

        # Check for drift
        self._check_drift()

    def log_correction(self, ticket_id: str, original_prediction: str,
                       corrected_prediction: str, confidence: float):
        """Record a human correction — used to track misclassification rate."""
        self._correction_counter += 1
        correction_entry = {
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "ticket_id": ticket_id,
            "original_prediction": original_prediction,
            "corrected_prediction": corrected_prediction,
            "confidence_at_prediction": round(confidence, 4),
        }
        self._write_jsonl(METRICS_LOG, {**correction_entry, "event_type": "correction"})

    def log_ab_record(self, ab_record: dict):
        """Persist an A/B test comparison record."""
        self._write_jsonl(AB_LOG, ab_record)

    def _check_drift(self):
        """
        Detect drift conditions and log drift events when triggered.
        Conditions:
          1. Rolling average confidence drops by > CONFIDENCE_DROP_THRESHOLD
          2. Rolling average agreement drops below DISAGREEMENT_SPIKE_THRESHOLD
        """
        if len(self._confidence_window) < 20:
            return  # Not enough data

        avg_conf = sum(self._confidence_window) / len(self._confidence_window)
        avg_agreement = sum(self._agreement_window) / len(self._agreement_window)

        if avg_conf < (0.70 - CONFIDENCE_DROP_THRESHOLD):
            self._log_drift_event("confidence_drop", {
                "avg_confidence": round(avg_conf, 4),
                "threshold": 0.70 - CONFIDENCE_DROP_THRESHOLD,
            })

        if avg_agreement < DISAGREEMENT_SPIKE_THRESHOLD:
            self._log_drift_event("disagreement_spike", {
                "avg_agreement": round(avg_agreement, 4),
                "threshold": DISAGREEMENT_SPIKE_THRESHOLD,
            })

    def _log_drift_event(self, event_type: str, details: dict):
        """Write a drift event to the drift log."""
        event = {
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "event_type": event_type,
            "details": details,
        }
        self._write_jsonl(DRIFT_LOG, event)
        logger.warning(f"[Monitor] Drift detected: {event_type} — {details}")

    @staticmethod
    def _write_jsonl(path: Path, record: dict):
        """Append a record to a JSONL file (thread-safe append)."""
        try:
            with open(path, "a", encoding="utf-8") as f:
                f.write(json.dumps(record) + "\n")
        except Exception as e:
            logger.error(f"[Monitor] Failed to write to {path}: {e}")

    # ─── Dashboard Metrics ────────────────────────────────────────────────────

    def get_dashboard_metrics(self) -> dict:
        """
        Return aggregated metrics for admin dashboard display.
        Covers: ensemble accuracy indicators, confidence distribution,
        human escalation rate, category distribution, drift indicators.
        """
        total = self._total_predictions
        if total == 0:
            return self._empty_metrics()

        avg_conf = sum(self._confidence_window) / len(self._confidence_window) if self._confidence_window else 0.0
        avg_agreement = sum(self._agreement_window) / len(self._agreement_window) if self._agreement_window else 0.0

        human_review_count = self._routing_counter.get("human_review", 0) + self._routing_counter.get("escalate", 0)
        escalation_count = self._routing_counter.get("escalate", 0)
        auto_route_count = self._routing_counter.get("auto_route", 0)

        return {
            "total_predictions": total,
            "average_confidence": round(avg_conf, 4),
            "average_agreement": round(avg_agreement, 4),
            "human_escalation_rate": round(human_review_count / total, 4) if total > 0 else 0.0,
            "escalation_count": escalation_count,
            "auto_route_count": auto_route_count,
            "human_review_count": human_review_count,
            "correction_count": self._correction_counter,
            "misclassification_rate": round(self._correction_counter / total, 4) if total > 0 else 0.0,
            "routing_distribution": dict(self._routing_counter),
            "category_distribution": dict(self._category_counter.most_common(10)),
            "drift_indicators": self._get_drift_indicators(),
            "confidence_trend": self._get_confidence_trend(),
        }

    def _get_drift_indicators(self) -> dict:
        """Summarize current drift status."""
        if not self._confidence_window:
            return {"status": "insufficient_data"}

        avg_conf = sum(self._confidence_window) / len(self._confidence_window)
        avg_agreement = sum(self._agreement_window) / len(self._agreement_window)

        drift_detected = (
            avg_conf < (0.70 - CONFIDENCE_DROP_THRESHOLD) or
            avg_agreement < DISAGREEMENT_SPIKE_THRESHOLD
        )
        return {
            "drift_detected": drift_detected,
            "avg_rolling_confidence": round(avg_conf, 4),
            "avg_rolling_agreement": round(avg_agreement, 4),
            "window_size": len(self._confidence_window),
        }

    def _get_confidence_trend(self) -> list[float]:
        """Return the last 20 confidence values for sparkline charts."""
        return [round(c, 4) for c in list(self._confidence_window)[-20:]]

    def get_recent_drift_events(self, limit: int = 20) -> list[dict]:
        """Read the most recent drift events from the drift log."""
        if not DRIFT_LOG.exists():
            return []
        try:
            with open(DRIFT_LOG, "r", encoding="utf-8") as f:
                lines = f.readlines()
            events = [json.loads(l) for l in lines[-limit:]]
            return list(reversed(events))
        except Exception as e:
            logger.error(f"[Monitor] Could not read drift log: {e}")
            return []

    def get_ab_test_summary(self) -> dict:
        """
        Summarize A/B test results: single-model vs ensemble win rates.
        Only counts records where ground truth has been set.
        """
        if not AB_LOG.exists():
            return {"status": "no_ab_data"}
        try:
            with open(AB_LOG, "r", encoding="utf-8") as f:
                records = [json.loads(l) for l in f.readlines()]
        except Exception:
            return {"status": "error_reading_ab_data"}

        scored = [r for r in records if r.get("ground_truth_label")]
        if not scored:
            return {"status": "no_ground_truth_data", "total_records": len(records)}

        single_wins = sum(1 for r in scored if r.get("single_model_correct"))
        ensemble_wins = sum(1 for r in scored if r.get("ensemble_correct"))
        total = len(scored)

        return {
            "total_ab_records": len(records),
            "graded_records": total,
            "single_model_accuracy": round(single_wins / total, 4) if total > 0 else 0.0,
            "ensemble_accuracy": round(ensemble_wins / total, 4) if total > 0 else 0.0,
            "ensemble_improvement": round((ensemble_wins - single_wins) / total, 4) if total > 0 else 0.0,
        }

    @staticmethod
    def _empty_metrics() -> dict:
        return {
            "total_predictions": 0,
            "average_confidence": 0.0,
            "average_agreement": 0.0,
            "human_escalation_rate": 0.0,
            "escalation_count": 0,
            "auto_route_count": 0,
            "human_review_count": 0,
            "correction_count": 0,
            "misclassification_rate": 0.0,
            "routing_distribution": {},
            "category_distribution": {},
            "drift_indicators": {"status": "insufficient_data"},
            "confidence_trend": [],
        }


# Singleton
model_monitor = ModelMonitoringService()
