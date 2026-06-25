"""
Active Learning Service — Issue #1933
======================================
Manages the complete active-learning lifecycle:

  1. Telemetry-enriched correction ingestion
  2. Weekly dataset preparation (dedup, noise filter, hard-negative mining,
     class balancing)
  3. Model version registry (promotion / rollback)
  4. Low-confidence pool management for human-in-the-loop annotation
"""

from __future__ import annotations

import json
import os
import uuid
import datetime
import statistics
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_BASE = Path(__file__).parent.parent          # backend/
DATA_DIR = _BASE / "data"
MODEL_REGISTRY_PATH = DATA_DIR / "model_registry.json"
CORRECTIONS_LOG_PATH = DATA_DIR / "corrections_log.json"
LOW_CONFIDENCE_LOG_PATH = DATA_DIR / "low_confidence_log.json"
TRAINING_DATASET_PATH = DATA_DIR / "active_learning_dataset.json"

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
NOISE_FILTER_MIN_CHARS = 8
CONFIDENCE_HARD_NEG_THRESHOLD = 0.75
LOW_CONF_QUERY_THRESHOLD = 0.60
MAX_SAMPLES_PER_CLASS = 500
DUPLICATE_SIMILARITY_CHARS = 40


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_json(path: Path, default: Any = None) -> Any:
    if default is None:
        default = []
    try:
        if path.exists() and path.stat().st_size > 2:
            with open(path, "r", encoding="utf-8") as fh:
                return json.load(fh)
    except Exception as exc:
        print(f"[AL] WARNING: Could not read {path}: {exc}")
    return default


def _save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2)
    tmp.replace(path)


def _utcnow() -> str:
    return datetime.datetime.utcnow().isoformat() + "Z"


def _fingerprint(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())[:DUPLICATE_SIMILARITY_CHARS]


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class ActiveLearningService:

    # ------------------------------------------------------------------
    # 1. Correction ingestion with telemetry
    # ------------------------------------------------------------------

    def log_correction_with_telemetry(
        self,
        *,
        ticket_id: str,
        original_text: str,
        ocr_text: str,
        original_prediction: dict,
        corrected_prediction: dict,
        changed_fields: list[str],
        confidence: float,
        classifier_version: str = "v1",
        tenant_id: str | None = None,
    ) -> dict:
        entry = {
            "ticket_id": ticket_id,
            "original_text": original_text,
            "ocr_text": ocr_text,
            "original_prediction": original_prediction,
            "corrected_prediction": corrected_prediction,
            "changed_fields": changed_fields,
            "confidence": confidence,
            "classifier_version": classifier_version,
            "tenant_id": tenant_id,
            "timestamp": _utcnow(),
            "is_hard_negative": confidence >= CONFIDENCE_HARD_NEG_THRESHOLD,
        }
        logs = _load_json(CORRECTIONS_LOG_PATH, default=[])
        logs.append(entry)
        _save_json(CORRECTIONS_LOG_PATH, logs)
        print(
            f"[AL] Correction saved | ticket={ticket_id} | "
            f"conf={confidence:.3f} | hard_neg={entry['is_hard_negative']}"
        )
        return entry

    # ------------------------------------------------------------------
    # 2. Low-confidence pool
    # ------------------------------------------------------------------

    def log_low_confidence_prediction(
        self,
        *,
        text: str,
        ocr_text: str,
        predicted_category: str,
        predicted_subcategory: str,
        confidence: float,
        classifier_version: str = "v1",
        tenant_id: str | None = None,
    ) -> None:
        if confidence >= LOW_CONF_QUERY_THRESHOLD:
            return
        entry = {
            "id": str(uuid.uuid4()),
            "text": text,
            "ocr_text": ocr_text,
            "predicted_category": predicted_category,
            "predicted_subcategory": predicted_subcategory,
            "confidence": confidence,
            "classifier_version": classifier_version,
            "tenant_id": tenant_id,
            "timestamp": _utcnow(),
            "annotated": False,
        }
        pool = _load_json(LOW_CONFIDENCE_LOG_PATH, default=[])
        pool.append(entry)
        _save_json(LOW_CONFIDENCE_LOG_PATH, pool)

    def get_unannotated_pool(self, limit: int = 20) -> list[dict]:
        pool = _load_json(LOW_CONFIDENCE_LOG_PATH, default=[])
        unannotated = [e for e in pool if not e.get("annotated", False)]
        unannotated.sort(key=lambda x: x.get("confidence", 1.0))
        return unannotated[:limit]

    def mark_annotated(self, entry_id: str, human_label: str) -> bool:
        pool = _load_json(LOW_CONFIDENCE_LOG_PATH, default=[])
        updated = False
        for entry in pool:
            if entry.get("id") == entry_id:
                entry["annotated"] = True
                entry["human_label"] = human_label
                entry["annotated_at"] = _utcnow()
                updated = True
                break
        if updated:
            _save_json(LOW_CONFIDENCE_LOG_PATH, pool)
        return updated

    # ------------------------------------------------------------------
    # 3. Dataset preparation
    # ------------------------------------------------------------------

    def prepare_training_dataset(self) -> dict:
        corrections = _load_json(CORRECTIONS_LOG_PATH, default=[])
        pool = _load_json(LOW_CONFIDENCE_LOG_PATH, default=[])

        samples: list[dict] = []
        seen_fingerprints: set[str] = set()

        for c in corrections:
            text = c.get("original_text", "").strip()
            if len(text) < NOISE_FILTER_MIN_CHARS:
                continue
            fp = _fingerprint(text)
            if fp in seen_fingerprints:
                continue
            seen_fingerprints.add(fp)
            label = c.get("corrected_prediction", {}).get("category", "")
            sublabel = c.get("corrected_prediction", {}).get("subcategory", "")
            if not label:
                continue
            samples.append({
                "text": text,
                "category": label,
                "subcategory": sublabel,
                "source": "correction",
                "is_hard_negative": c.get("is_hard_negative", False),
                "weight": 2.0 if c.get("is_hard_negative") else 1.0,
            })

        hard_neg_count = sum(1 for s in samples if s["is_hard_negative"])

        for entry in pool:
            if not entry.get("annotated"):
                continue
            text = entry.get("text", "").strip()
            if len(text) < NOISE_FILTER_MIN_CHARS:
                continue
            fp = _fingerprint(text)
            if fp in seen_fingerprints:
                continue
            seen_fingerprints.add(fp)
            label = entry.get("human_label", entry.get("predicted_category", ""))
            sublabel = entry.get("predicted_subcategory", "")
            samples.append({
                "text": text,
                "category": label,
                "subcategory": sublabel,
                "source": "low_confidence_annotated",
                "is_hard_negative": False,
                "weight": 1.0,
            })

        by_class: dict[str, list] = defaultdict(list)
        for s in samples:
            by_class[s["category"]].append(s)

        balanced: list[dict] = []
        for cls, cls_samples in by_class.items():
            if len(cls_samples) > MAX_SAMPLES_PER_CLASS:
                hard = [s for s in cls_samples if s["is_hard_negative"]]
                regular = [s for s in cls_samples if not s["is_hard_negative"]]
                keep = hard + regular[: MAX_SAMPLES_PER_CLASS - len(hard)]
                balanced.extend(keep)
            else:
                balanced.extend(cls_samples)

        label_counts: Counter = Counter(s["category"] for s in balanced)
        class_distribution = dict(label_counts.most_common())

        dataset = {
            "version": str(uuid.uuid4()),
            "created_at": _utcnow(),
            "total_samples": len(balanced),
            "hard_negatives": hard_neg_count,
            "class_distribution": class_distribution,
            "samples": balanced,
        }
        _save_json(TRAINING_DATASET_PATH, dataset)
        print(
            f"[AL] Dataset prepared: {len(balanced)} samples | "
            f"{hard_neg_count} hard negatives | "
            f"classes={list(class_distribution.keys())}"
        )
        return {
            "total_samples": len(balanced),
            "hard_negatives": hard_neg_count,
            "class_distribution": class_distribution,
            "dataset_version": dataset["version"],
        }

    # ------------------------------------------------------------------
    # 4. Model Version Registry
    # ------------------------------------------------------------------

    def _load_registry(self) -> dict:
        default = {"current_version": None, "versions": []}
        return _load_json(MODEL_REGISTRY_PATH, default=default)

    def _save_registry(self, registry: dict) -> None:
        _save_json(MODEL_REGISTRY_PATH, registry)

    def register_model_version(
        self,
        *,
        version_tag: str,
        model_path: str,
        accuracy: float,
        metrics: dict,
        training_samples: int,
        promoted: bool = False,
        notes: str = "",
    ) -> dict:
        registry = self._load_registry()
        entry = {
            "version_tag": version_tag,
            "model_path": model_path,
            "accuracy": accuracy,
            "metrics": metrics,
            "training_samples": training_samples,
            "promoted": promoted,
            "notes": notes,
            "registered_at": _utcnow(),
        }
        registry["versions"].append(entry)
        if promoted:
            registry["current_version"] = version_tag
        self._save_registry(registry)
        print(f"[AL] Model registered: {version_tag} | acc={accuracy:.4f} | promoted={promoted}")
        return entry

    def promote_model(self, version_tag: str) -> bool:
        registry = self._load_registry()
        found = False
        for v in registry["versions"]:
            if v["version_tag"] == version_tag:
                v["promoted"] = True
                found = True
            else:
                v["promoted"] = False
        if found:
            registry["current_version"] = version_tag
            self._save_registry(registry)
            print(f"[AL] Promoted model: {version_tag}")
        return found

    def rollback_to_previous(self) -> str | None:
        registry = self._load_registry()
        versions = registry.get("versions", [])
        current = registry.get("current_version")
        promoted_indices = [
            i for i, v in enumerate(versions)
            if v.get("promoted") or v["version_tag"] == current
        ]
        if not promoted_indices:
            return None
        current_idx = promoted_indices[-1]
        if current_idx == 0:
            return None
        previous = versions[current_idx - 1]
        previous_tag = previous["version_tag"]
        self.promote_model(previous_tag)
        print(f"[AL] Rolled back from {current} to {previous_tag}")
        return previous_tag

    def get_registry(self) -> dict:
        return self._load_registry()

    def get_current_version(self) -> dict | None:
        registry = self._load_registry()
        current = registry.get("current_version")
        for v in registry.get("versions", []):
            if v["version_tag"] == current:
                return v
        return None

    # ------------------------------------------------------------------
    # 5. Statistics & Drift Monitoring
    # ------------------------------------------------------------------

    def get_correction_statistics(self) -> dict:
        corrections = _load_json(CORRECTIONS_LOG_PATH, default=[])
        if not corrections:
            return {"total_corrections": 0}
        total = len(corrections)
        category_counts: Counter = Counter()
        confidences: list[float] = []
        hard_neg_count = 0
        weekly: Counter = Counter()
        now = datetime.datetime.utcnow()
        for c in corrections:
            orig_cat = c.get("original_prediction", {}).get("category", "Unknown")
            category_counts[orig_cat] += 1
            conf = c.get("confidence", 0.0)
            confidences.append(conf)
            if c.get("is_hard_negative"):
                hard_neg_count += 1
            try:
                ts = datetime.datetime.fromisoformat(c["timestamp"].rstrip("Z"))
                delta_days = (now - ts).days
                week_num = delta_days // 7
                if week_num < 4:
                    weekly[f"week_{week_num}_ago"] += 1
            except Exception:
                pass
        avg_conf = statistics.mean(confidences) if confidences else 0.0
        return {
            "total_corrections": total,
            "hard_negative_count": hard_neg_count,
            "hard_negative_rate": round(hard_neg_count / total, 4) if total else 0,
            "avg_confidence_on_correction": round(avg_conf, 4),
            "corrections_by_category": dict(category_counts.most_common()),
            "weekly_trend": dict(weekly),
        }

    def get_low_confidence_statistics(self) -> dict:
        pool = _load_json(LOW_CONFIDENCE_LOG_PATH, default=[])
        total = len(pool)
        annotated = sum(1 for e in pool if e.get("annotated"))
        confidences = [e.get("confidence", 0.0) for e in pool]
        avg_conf = statistics.mean(confidences) if confidences else 0.0
        return {
            "total_in_pool": total,
            "annotated": annotated,
            "pending_annotation": total - annotated,
            "avg_confidence": round(avg_conf, 4),
        }


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------
active_learning_service = ActiveLearningService()
