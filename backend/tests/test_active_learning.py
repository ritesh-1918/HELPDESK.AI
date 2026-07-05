"""
Tests — Active Learning Pipeline (Issue #1933)
==============================================
38 tests across 7 test classes.
Run: pytest backend/tests/test_active_learning.py -v
"""

from __future__ import annotations

import json
import os
import sys
import uuid
import pytest
from pathlib import Path
from unittest.mock import patch
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def tmp_data_dir(tmp_path):
    import backend.services.active_learning_service as m
    orig = {k: getattr(m, k) for k in
            ["CORRECTIONS_LOG_PATH", "LOW_CONFIDENCE_LOG_PATH",
             "TRAINING_DATASET_PATH", "MODEL_REGISTRY_PATH"]}
    m.CORRECTIONS_LOG_PATH      = tmp_path / "corrections_log.json"
    m.LOW_CONFIDENCE_LOG_PATH   = tmp_path / "low_confidence_log.json"
    m.TRAINING_DATASET_PATH     = tmp_path / "active_learning_dataset.json"
    m.MODEL_REGISTRY_PATH       = tmp_path / "model_registry.json"
    yield tmp_path
    for k, v in orig.items():
        setattr(m, k, v)


@pytest.fixture()
def al_service(tmp_data_dir):
    from backend.services.active_learning_service import ActiveLearningService
    return ActiveLearningService()


def _seed(svc, *, text="VPN not working on office laptop", confidence=0.6):
    return svc.log_correction_with_telemetry(
        ticket_id=str(uuid.uuid4()),
        original_text=text,
        ocr_text="",
        original_prediction={"category": "General", "subcategory": "Incomplete Information"},
        corrected_prediction={"category": "Network", "subcategory": "VPN Connection"},
        changed_fields=["category"],
        confidence=confidence,
    )


# ===========================================================================
# 1. Correction Logging
# ===========================================================================

class TestCorrectionLogging:

    def test_logs_basic_correction(self, al_service, tmp_data_dir):
        e = _seed(al_service)
        assert e["original_text"] == "VPN not working on office laptop"
        assert e["corrected_prediction"]["category"] == "Network"
        assert "timestamp" in e

    def test_hard_negative_flagged(self, al_service, tmp_data_dir):
        e = _seed(al_service, confidence=0.85)
        assert e["is_hard_negative"] is True

    def test_non_hard_negative(self, al_service, tmp_data_dir):
        e = _seed(al_service, confidence=0.55)
        assert e["is_hard_negative"] is False

    def test_multiple_persisted(self, al_service, tmp_data_dir):
        for i in range(5):
            _seed(al_service, text=f"Issue number {i} unique ticket text here")
        import backend.services.active_learning_service as m
        data = json.loads(m.CORRECTIONS_LOG_PATH.read_text())
        assert len(data) == 5

    def test_survives_reload(self, al_service, tmp_data_dir):
        _seed(al_service, text="Printer not found on the network shared drive")
        import backend.services.active_learning_service as m
        reloaded = m._load_json(m.CORRECTIONS_LOG_PATH, [])
        assert reloaded[0]["original_text"] == "Printer not found on the network shared drive"


# ===========================================================================
# 2. Low-Confidence Pool
# ===========================================================================

class TestLowConfidencePool:

    def test_logs_below_threshold(self, al_service, tmp_data_dir):
        al_service.log_low_confidence_prediction(
            text="Screen flickering randomly", ocr_text="",
            predicted_category="Hardware", predicted_subcategory="Monitor",
            confidence=0.45,
        )
        assert len(al_service.get_unannotated_pool()) == 1

    def test_ignores_above_threshold(self, al_service, tmp_data_dir):
        al_service.log_low_confidence_prediction(
            text="Blue screen of death error", ocr_text="",
            predicted_category="Hardware", predicted_subcategory="BSOD",
            confidence=0.75,
        )
        assert len(al_service.get_unannotated_pool()) == 0

    def test_pool_sorted_by_confidence(self, al_service, tmp_data_dir):
        for conf in [0.55, 0.30, 0.45]:
            al_service.log_low_confidence_prediction(
                text=f"Issue conf {conf} long enough text here extra",
                ocr_text="", predicted_category="General",
                predicted_subcategory="Other", confidence=conf,
            )
        confs = [e["confidence"] for e in al_service.get_unannotated_pool()]
        assert confs == sorted(confs)

    def test_annotate_marks_entry(self, al_service, tmp_data_dir):
        al_service.log_low_confidence_prediction(
            text="Keyboard completely dead today morning",
            ocr_text="", predicted_category="Hardware",
            predicted_subcategory="Keyboard", confidence=0.40,
        )
        entry_id = al_service.get_unannotated_pool()[0]["id"]
        assert al_service.mark_annotated(entry_id, "Hardware") is True
        assert len(al_service.get_unannotated_pool()) == 0

    def test_annotate_unknown_id(self, al_service):
        assert al_service.mark_annotated("nonexistent", "Software") is False


# ===========================================================================
# 3. Dataset Preparation
# ===========================================================================

class TestDatasetPreparation:

    def _seed_many(self, al_service, n=15):
        cats = ["Network", "Hardware", "Software", "Access"]
        for i in range(n):
            al_service.log_correction_with_telemetry(
                ticket_id=str(uuid.uuid4()),
                original_text=f"Ticket {i:04d}: unique issue description for testing purposes",
                ocr_text="",
                original_prediction={},
                corrected_prediction={"category": cats[i % len(cats)], "subcategory": "Sub"},
                changed_fields=["category"],
                confidence=0.6,
            )

    def test_dataset_created(self, al_service, tmp_data_dir):
        self._seed_many(al_service)
        summary = al_service.prepare_training_dataset()
        assert summary["total_samples"] > 0

    def test_noise_filtered(self, al_service, tmp_data_dir):
        al_service.log_correction_with_telemetry(
            ticket_id="n1", original_text="hi", ocr_text="",
            original_prediction={},
            corrected_prediction={"category": "Network", "subcategory": "DNS"},
            changed_fields=["category"], confidence=0.5,
        )
        assert al_service.prepare_training_dataset()["total_samples"] == 0

    def test_dedup_removes_duplicates(self, al_service, tmp_data_dir):
        for _ in range(5):
            al_service.log_correction_with_telemetry(
                ticket_id=str(uuid.uuid4()),
                original_text="Exact same ticket text repeated verbatim",
                ocr_text="",
                original_prediction={},
                corrected_prediction={"category": "Software", "subcategory": "Crash"},
                changed_fields=["category"], confidence=0.7,
            )
        assert al_service.prepare_training_dataset()["total_samples"] == 1

    def test_hard_negatives_counted(self, al_service, tmp_data_dir):
        unique_texts = [
            "VPN timeout on login hard negative case A here",
            "Printer offline hard negative unique text B ok",
            "Blue screen crash hard negative example C now!",
            "DNS resolution failing hard negative case D yes",
            "MFA prompt loop hard negative unique text E end",
        ]
        for text in unique_texts:
            _seed(al_service, text=text, confidence=0.85)
        assert al_service.prepare_training_dataset()["hard_negatives"] == 5

    def test_class_distribution(self, al_service, tmp_data_dir):
        self._seed_many(al_service)
        summary = al_service.prepare_training_dataset()
        assert isinstance(summary["class_distribution"], dict)


# ===========================================================================
# 4. Model Registry
# ===========================================================================

class TestModelRegistry:

    def test_register_version(self, al_service, tmp_data_dir):
        e = al_service.register_model_version(
            version_tag="v1.0", model_path="/m1", accuracy=0.87,
            metrics={}, training_samples=100, promoted=True,
        )
        assert e["version_tag"] == "v1.0"

    def test_current_version(self, al_service, tmp_data_dir):
        al_service.register_model_version(
            version_tag="v1.0", model_path="/m1", accuracy=0.85,
            metrics={}, training_samples=100, promoted=True,
        )
        assert al_service.get_current_version()["version_tag"] == "v1.0"

    def test_promote_switches(self, al_service, tmp_data_dir):
        al_service.register_model_version(
            version_tag="v1.0", model_path="/m1", accuracy=0.85,
            metrics={}, training_samples=100, promoted=True,
        )
        al_service.register_model_version(
            version_tag="v2.0", model_path="/m2", accuracy=0.87,
            metrics={}, training_samples=150, promoted=False,
        )
        al_service.promote_model("v2.0")
        assert al_service.get_current_version()["version_tag"] == "v2.0"

    def test_rollback(self, al_service, tmp_data_dir):
        al_service.register_model_version(
            version_tag="v1.0", model_path="/m1", accuracy=0.85,
            metrics={}, training_samples=100, promoted=True,
        )
        al_service.register_model_version(
            version_tag="v2.0", model_path="/m2", accuracy=0.87,
            metrics={}, training_samples=150, promoted=True,
        )
        restored = al_service.rollback_to_previous()
        assert restored == "v1.0"
        assert al_service.get_current_version()["version_tag"] == "v1.0"

    def test_rollback_no_previous(self, al_service, tmp_data_dir):
        al_service.register_model_version(
            version_tag="v1.0", model_path="/m1", accuracy=0.85,
            metrics={}, training_samples=100, promoted=True,
        )
        assert al_service.rollback_to_previous() is None


# ===========================================================================
# 5. Statistics
# ===========================================================================

class TestStatistics:

    def test_correction_stats_empty(self, al_service, tmp_data_dir):
        assert al_service.get_correction_statistics()["total_corrections"] == 0

    def test_correction_stats_populated(self, al_service, tmp_data_dir):
        for i in range(6):
            _seed(al_service, confidence=0.85 if i < 2 else 0.5)
        stats = al_service.get_correction_statistics()
        assert stats["total_corrections"] == 6
        assert stats["hard_negative_count"] == 2
        assert "avg_confidence_on_correction" in stats

    def test_lc_stats(self, al_service, tmp_data_dir):
        for conf in [0.30, 0.45, 0.55]:
            al_service.log_low_confidence_prediction(
                text=f"Test low conf {conf} extra text here for length",
                ocr_text="", predicted_category="Hardware",
                predicted_subcategory="Monitor", confidence=conf,
            )
        stats = al_service.get_low_confidence_statistics()
        assert stats["total_in_pool"] == 3
        assert stats["pending_annotation"] == 3


# ===========================================================================
# 6. Pipeline Guards
# ===========================================================================

class TestPipelineGuards:

    def test_skips_no_dataset(self, tmp_path):
        import backend.training.retraining_pipeline as rp
        from backend.training.retraining_pipeline import run_retraining_pipeline
        orig = rp.TRAINING_DATASET_PATH
        rp.TRAINING_DATASET_PATH = tmp_path / "nonexistent.json"
        try:
            r = run_retraining_pipeline(al_service=None, dry_run=False)
            assert r["status"] == "skipped"
        finally:
            rp.TRAINING_DATASET_PATH = orig

    def test_skips_too_few(self, tmp_path):
        import backend.training.retraining_pipeline as rp
        from backend.training.retraining_pipeline import run_retraining_pipeline
        ds = {"samples": [{"text": f"s{i}", "category": "Net", "subcategory": "", "weight": 1.0}
                          for i in range(5)]}
        p = tmp_path / "ds.json"
        p.write_text(json.dumps(ds))
        orig = rp.TRAINING_DATASET_PATH
        rp.TRAINING_DATASET_PATH = p
        try:
            r = run_retraining_pipeline(al_service=None, dry_run=False)
            assert r["status"] == "skipped"
        finally:
            rp.TRAINING_DATASET_PATH = orig

    def test_dry_run_skips(self, tmp_path):
        import backend.training.retraining_pipeline as rp
        from backend.training.retraining_pipeline import run_retraining_pipeline
        ds = {"samples": [
            {"text": f"Long enough sample text number {i} extra words here",
             "category": "Network", "subcategory": "VPN", "weight": 1.0}
            for i in range(15)
        ]}
        p = tmp_path / "ds.json"
        p.write_text(json.dumps(ds))
        orig = rp.TRAINING_DATASET_PATH
        rp.TRAINING_DATASET_PATH = p
        try:
            r = run_retraining_pipeline(al_service=None, dry_run=True)
            assert r["status"] == "skipped"
            assert "Dry run" in r["message"]
        finally:
            rp.TRAINING_DATASET_PATH = orig


# ===========================================================================
# 7. API Router
# ===========================================================================

@pytest.fixture()
def test_client(tmp_data_dir):
    from fastapi import FastAPI
    from backend.routes.active_learning import router
    app = FastAPI()
    app.include_router(router)
    with patch.dict(os.environ, {"ADMIN_SECRET": ""}):
        with TestClient(app) as c:
            yield c


class TestRouter:

    def test_status(self, test_client):
        r = test_client.get("/active-learning/status")
        assert r.status_code == 200
        assert "pipeline_active" in r.json()

    def test_retrain_status_initial(self, test_client):
        r = test_client.get("/active-learning/retrain/status")
        assert r.status_code == 200
        assert "in_progress" in r.json()

    def test_prepare_dataset(self, test_client):
        r = test_client.get("/active-learning/dataset/prepare")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_model_registry(self, test_client):
        r = test_client.get("/active-learning/model/registry")
        assert r.status_code == 200
        assert "versions" in r.json()

    def test_rollback_no_previous(self, test_client):
        r = test_client.post("/active-learning/model/rollback")
        assert r.status_code == 404

    def test_promote_unknown(self, test_client):
        r = test_client.post("/active-learning/model/promote/ghost")
        assert r.status_code == 404

    def test_pool_empty(self, test_client):
        r = test_client.get("/active-learning/pool")
        assert r.status_code == 200
        assert r.json()["count"] == 0

    def test_annotate_unknown(self, test_client):
        r = test_client.post("/active-learning/pool/bad-id/annotate",
                             json={"human_label": "Network"})
        assert r.status_code == 404

    def test_correction_stats(self, test_client):
        r = test_client.get("/active-learning/stats/corrections")
        assert r.status_code == 200
        assert "total_corrections" in r.json()

    def test_drift_stats(self, test_client):
        r = test_client.get("/active-learning/stats/drift")
        assert r.status_code == 200
        assert "total_in_pool" in r.json()

    def test_retrain_trigger(self, test_client):
        r = test_client.post("/active-learning/retrain",
                             json={"dry_run": True, "force": True})
        assert r.status_code == 200
        assert r.json()["status"] == "accepted"

    def test_retrain_conflict(self, test_client):
        import backend.routes.active_learning as al_router
        al_router._retrain_in_progress = True
        try:
            r = test_client.post("/active-learning/retrain",
                                 json={"dry_run": True, "force": False})
            assert r.status_code == 409
        finally:
            al_router._retrain_in_progress = False
