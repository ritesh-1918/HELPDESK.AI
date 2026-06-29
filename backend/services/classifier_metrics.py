import datetime
import hashlib
import logging
from collections import deque
from statistics import mean
from threading import Lock
from typing import Optional

_LOCK = Lock()
_WINDOW_SIZE = 100
_EVENT_LIMIT = 25

_STATE = {
    "total_predictions": 0,
    "v3_success_count": 0,
    "fallback_count": 0,
    "v3_confidences": deque(maxlen=_WINDOW_SIZE),
    "v1_confidences": deque(maxlen=_WINDOW_SIZE),
    "v3_outcomes": deque(maxlen=_WINDOW_SIZE),
    "shadow_comparisons": deque(maxlen=_WINDOW_SIZE),
    "fallback_events": deque(maxlen=_EVENT_LIMIT),
}


def _now():
    return datetime.datetime.utcnow().isoformat() + "Z"


def _ticket_hash(text: str) -> str:
    payload = text or ""
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:12]


def _match_prediction(first: Optional[dict], second: Optional[dict]) -> bool:
    if not first or not second:
        return False
    keys = ("category", "subcategory", "priority", "assigned_team", "auto_resolve")
    return all(first.get(key) == second.get(key) for key in keys)


def _normalize_prediction(prediction: Optional[dict]) -> Optional[dict]:
    if not prediction:
        return None
    if "prediction" in prediction:
        return prediction

    def _extract(value):
        if isinstance(value, dict):
            return value.get("prediction")
        return value

    return {
        "category": _extract(prediction.get("category")),
        "subcategory": _extract(prediction.get("sub_category")) or _extract(prediction.get("subcategory")),
        "priority": _extract(prediction.get("priority")),
        "assigned_team": _extract(prediction.get("assigned_team")),
        "auto_resolve": _extract(prediction.get("auto_resolve")),
    }


def record_v3_success(confidence: float):
    with _LOCK:
        _STATE["total_predictions"] += 1
        _STATE["v3_success_count"] += 1
        _STATE["v3_outcomes"].append({"success": True, "confidence": float(confidence), "timestamp": _now()})
        _STATE["v3_confidences"].append(float(confidence))


def record_v3_fallback(error_message: str, text: str, v1_confidence: Optional[float] = None):
    with _LOCK:
        _STATE["total_predictions"] += 1
        _STATE["fallback_count"] += 1
        _STATE["v3_outcomes"].append({"success": False, "confidence": 0.0, "timestamp": _now()})
        event = {
            "timestamp": _now(),
            "text_hash": _ticket_hash(text),
            "error": error_message,
            "fallback_version": "v1",
        }
        _STATE["fallback_events"].append(event)
        if v1_confidence is not None:
            _STATE["v1_confidences"].append(float(v1_confidence))

        fallback_rate = _STATE["fallback_count"] / max(_STATE["total_predictions"], 1)
        if _STATE["total_predictions"] >= 10 and fallback_rate > 0.10:
            logging.critical(
                "Classifier V3 fallback rate exceeded 10%% (rate=%.2f, text_hash=%s, error=%s)",
                fallback_rate,
                event["text_hash"],
                error_message,
            )


def record_shadow_comparison(v3_prediction: Optional[dict], v2_prediction: Optional[dict]):
    with _LOCK:
        v3_normalized = _normalize_prediction(v3_prediction)
        v2_normalized = _normalize_prediction(v2_prediction)
        _STATE["shadow_comparisons"].append(
            {
                "timestamp": _now(),
                "matched": _match_prediction(v3_normalized, v2_normalized),
                "v3_version": (v3_prediction or {}).get("classifier_version", "v3"),
                "v2_version": (v2_prediction or {}).get("classifier_version", "v2_shadow"),
            }
        )


def compare_predictions(v3_prediction: Optional[dict], v2_prediction: Optional[dict]) -> bool:
    return _match_prediction(_normalize_prediction(v3_prediction), _normalize_prediction(v2_prediction))


def get_classifier_health():
    with _LOCK:
        total_predictions = _STATE["total_predictions"]
        fallback_count = _STATE["fallback_count"]
        v3_success_count = _STATE["v3_success_count"]
        fallback_rate = fallback_count / max(total_predictions, 1)
        v3_success_rate = v3_success_count / max(total_predictions, 1)
        shadow_checked = len(_STATE["shadow_comparisons"])
        shadow_agreed = sum(1 for item in _STATE["shadow_comparisons"] if item["matched"])

        return {
            "total_predictions": total_predictions,
            "classifier_fallback_count": fallback_count,
            "classifier_fallback_rate": round(fallback_rate, 4),
            "v3_success_rate": round(v3_success_rate, 4),
            "v3_average_confidence": round(mean(_STATE["v3_confidences"]), 4) if _STATE["v3_confidences"] else 0.0,
            "v1_average_confidence": round(mean(_STATE["v1_confidences"]), 4) if _STATE["v1_confidences"] else 0.0,
            "shadow_comparison_count": shadow_checked,
            "shadow_agreement_rate": round(shadow_agreed / max(shadow_checked, 1), 4),
            "recent_fallback_events": list(_STATE["fallback_events"]),
        }


def reset_classifier_metrics():
    with _LOCK:
        _STATE["total_predictions"] = 0
        _STATE["v3_success_count"] = 0
        _STATE["fallback_count"] = 0
        _STATE["v3_confidences"].clear()
        _STATE["v1_confidences"].clear()
        _STATE["v3_outcomes"].clear()
        _STATE["shadow_comparisons"].clear()
        _STATE["fallback_events"].clear()
