"""
Active Learning API Router — Issue #1933
"""

from __future__ import annotations

import asyncio
import datetime
import os
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client

from backend.auth_cookie import get_current_user
from backend.services.active_learning_service import active_learning_service

router = APIRouter(prefix="/active-learning", tags=["Active Learning"])

_last_retrain_result: dict[str, Any] = {}
_retrain_in_progress: bool = False


async def _require_admin(current_user: dict = Depends(get_current_user)) -> None:
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required.")
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(status_code=503, detail="Server configuration error.")
    try:
        client = create_client(url, key)
        result = client.table("profiles").select("role").eq("id", user_id).single().execute()
        data = getattr(result, "data", None) or {}
        if data.get("role") not in ("admin", "master_admin"):
            raise HTTPException(status_code=403, detail="Admin access required.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Authorization check failed.")


class AnnotationRequest(BaseModel):
    human_label: str


class RetrainRequest(BaseModel):
    dry_run: bool = False
    force: bool = False


async def _run_retrain_background(dry_run: bool) -> None:
    global _retrain_in_progress, _last_retrain_result
    _retrain_in_progress = True
    _last_retrain_result = {
        "status": "running",
        "started_at": datetime.datetime.utcnow().isoformat() + "Z",
    }
    try:
        active_learning_service.prepare_training_dataset()
        from backend.training.retraining_pipeline import run_retraining_pipeline
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: run_retraining_pipeline(al_service=active_learning_service, dry_run=dry_run),
        )
        _last_retrain_result = {**result, "completed_at": datetime.datetime.utcnow().isoformat() + "Z"}
    except Exception as exc:
        _last_retrain_result = {
            "status": "error",
            "error": str(exc),
            "completed_at": datetime.datetime.utcnow().isoformat() + "Z",
        }
        print(f"[AL ROUTER] Retraining error: {exc}")
    finally:
        _retrain_in_progress = False


@router.get("/status")
async def pipeline_status(_: None = Depends(_require_admin)):
    """Return the current active-learning pipeline status."""
    return {
        "pipeline_active": True,
        "retrain_in_progress": _retrain_in_progress,
        "current_model": active_learning_service.get_current_version(),
        "last_retrain": _last_retrain_result,
        "correction_stats": active_learning_service.get_correction_statistics(),
        "low_confidence_stats": active_learning_service.get_low_confidence_statistics(),
    }


@router.post("/retrain")
async def trigger_retrain(
    body: RetrainRequest,
    background_tasks: BackgroundTasks,
    _: None = Depends(_require_admin),
):
    """Queue a retraining job for the active-learning pipeline."""
    global _retrain_in_progress
    if _retrain_in_progress and not body.force:
        raise HTTPException(
            status_code=409,
            detail="A retraining job is already in progress. Pass force=true to override.",
        )
    background_tasks.add_task(_run_retrain_background, body.dry_run)
    return {"status": "accepted", "dry_run": body.dry_run,
            "message": "Retraining queued. Poll /active-learning/retrain/status."}


@router.get("/retrain/status")
async def retrain_status(_: None = Depends(_require_admin)):
    """Return the status of the latest retraining job."""
    return {"in_progress": _retrain_in_progress, "result": _last_retrain_result}


@router.get("/dataset/prepare")
async def prepare_dataset(_: None = Depends(_require_admin)):
    """Build the dataset used for the next retraining run."""
    try:
        summary = active_learning_service.prepare_training_dataset()
        return {"status": "ok", "summary": summary}
    except Exception:
        raise HTTPException(status_code=500, detail="Dataset preparation failed.")


@router.get("/model/registry")
async def get_model_registry(_: None = Depends(_require_admin)):
    """Return the active-learning model registry."""
    return active_learning_service.get_registry()


@router.post("/model/rollback")
async def rollback_model(_: None = Depends(_require_admin)):
    """Roll back to the previous model version."""
    restored = active_learning_service.rollback_to_previous()
    if restored is None:
        raise HTTPException(status_code=404, detail="No previous model version available.")
    return {"status": "rolled_back", "restored_version": restored}


@router.post("/model/promote/{version_tag}")
async def promote_model(version_tag: str, _: None = Depends(_require_admin)):
    """Promote a specific model version to active use."""
    success = active_learning_service.promote_model(version_tag)
    if not success:
        raise HTTPException(status_code=404, detail=f"Version '{version_tag}' not found.")
    return {"status": "promoted", "version_tag": version_tag}


@router.get("/pool")
async def get_annotation_pool(limit: int = 20, _: None = Depends(_require_admin)):
    """Return the unannotated review pool."""
    pool = active_learning_service.get_unannotated_pool(limit=limit)
    return {"count": len(pool), "items": pool}


@router.post("/pool/{entry_id}/annotate")
async def annotate_pool_entry(
    entry_id: str, body: AnnotationRequest, _: None = Depends(_require_admin)
):
    """Mark a pool entry as annotated with a human label."""
    ok = active_learning_service.mark_annotated(entry_id, body.human_label)
    if not ok:
        raise HTTPException(status_code=404, detail=f"Pool entry '{entry_id}' not found.")
    return {"status": "annotated", "entry_id": entry_id, "label": body.human_label}


@router.get("/stats/corrections")
async def correction_statistics(_: None = Depends(_require_admin)):
    """Return correction statistics for the active-learning loop."""
    return active_learning_service.get_correction_statistics()


@router.get("/stats/drift")
async def drift_statistics(_: None = Depends(_require_admin)):
    """Return low-confidence and drift statistics."""
    return active_learning_service.get_low_confidence_statistics()
