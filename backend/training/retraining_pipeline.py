"""
Continuous Retraining Pipeline — Issue #1933
=============================================
Fine-tunes the DistilBERT classifier on the active-learning dataset.
Enforces the validation gate:

    Deploy only if new_accuracy >= production_accuracy + MIN_IMPROVEMENT_DELTA
"""

from __future__ import annotations

import datetime
import json
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
_PROJECT_ROOT = Path(__file__).parent.parent.parent
_BACKEND_DIR = _PROJECT_ROOT / "backend"
_DATA_DIR = _BACKEND_DIR / "data"

TRAINING_DATASET_PATH = _DATA_DIR / "active_learning_dataset.json"
CLASSIFIER_MODEL_DIR = _BACKEND_DIR / "models" / "classifier"
CANDIDATE_MODEL_DIR = _BACKEND_DIR / "models" / "classifier-candidate"

MIN_IMPROVEMENT_DELTA = 0.02
MIN_TRAINING_SAMPLES = 10

MAX_LEN = 128
BATCH_SIZE = 8
EPOCHS = 3
LEARNING_RATE = 2e-5
VALIDATION_SPLIT = 0.15
RANDOM_SEED = 42


# ---------------------------------------------------------------------------
# Lazy import — keeps API server startup fast
# ---------------------------------------------------------------------------

def _import_ml():
    import torch
    import torch.nn.functional as F
    from torch.utils.data import Dataset, DataLoader
    from transformers import (
        DistilBertTokenizerFast,
        DistilBertForSequenceClassification,
        get_linear_schedule_with_warmup,
    )
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import (
        accuracy_score, precision_score, recall_score, f1_score,
        classification_report,
    )
    import numpy as np
    return (
        torch, F, Dataset, DataLoader,
        DistilBertTokenizerFast, DistilBertForSequenceClassification,
        get_linear_schedule_with_warmup,
        LabelEncoder, train_test_split,
        accuracy_score, precision_score, recall_score, f1_score,
        classification_report, np,
    )


# ---------------------------------------------------------------------------
# Core pipeline function
# ---------------------------------------------------------------------------

def run_retraining_pipeline(*, al_service=None, dry_run: bool = False) -> dict[str, Any]:
    """
    Execute the full retraining pipeline.

    Returns dict with keys:
        status         — "promoted" | "rejected" | "skipped" | "error"
        new_accuracy   — float
        prod_accuracy  — float
        improvement    — float delta
        version_tag    — str
        metrics        — classification report dict
        message        — human-readable summary
    """
    result: dict[str, Any] = {
        "status": "error",
        "new_accuracy": 0.0,
        "prod_accuracy": 0.0,
        "improvement": 0.0,
        "version_tag": "",
        "metrics": {},
        "message": "",
    }

    print("[RETRAIN] ====== Active Learning Retraining Pipeline ======")

    # ── 1. Load dataset ────────────────────────────────────────────────
    if not TRAINING_DATASET_PATH.exists():
        result["status"] = "skipped"
        result["message"] = "No training dataset found. Run prepare_training_dataset() first."
        print(f"[RETRAIN] {result['message']}")
        return result

    with open(TRAINING_DATASET_PATH, "r", encoding="utf-8") as fh:
        dataset_meta = json.load(fh)

    samples = dataset_meta.get("samples", [])
    if len(samples) < MIN_TRAINING_SAMPLES:
        result["status"] = "skipped"
        result["message"] = f"Insufficient samples: {len(samples)} < {MIN_TRAINING_SAMPLES}."
        print(f"[RETRAIN] {result['message']}")
        return result

    print(f"[RETRAIN] Loaded {len(samples)} samples.")

    texts = [s["text"] for s in samples]
    raw_labels = [s["category"] for s in samples]
    weights = [float(s.get("weight", 1.0)) for s in samples]

    # ── 2. Prod accuracy + dry-run gate ────────────────────────────────
    prod_accuracy = 0.0
    if al_service:
        current = al_service.get_current_version()
        if current:
            prod_accuracy = current.get("accuracy", 0.0)
    print(f"[RETRAIN] Production accuracy: {prod_accuracy:.4f}")

    if dry_run:
        result.update({
            "status": "skipped",
            "message": "Dry run — skipping actual training.",
            "prod_accuracy": prod_accuracy,
        })
        return result

    # ── 3. Import heavy ML deps ────────────────────────────────────────
    (
        torch, F, _Dataset, DataLoader,
        DistilBertTokenizerFast, DistilBertForSequenceClassification,
        get_linear_schedule_with_warmup,
        LabelEncoder, train_test_split,
        accuracy_score, precision_score, recall_score, f1_score,
        classification_report, np,
    ) = _import_ml()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[RETRAIN] Device: {device}")

    # ── 4. Encode labels ───────────────────────────────────────────────
    le = LabelEncoder()
    encoded_labels = le.fit_transform(raw_labels).tolist()
    num_labels = len(le.classes_)
    id2label = {str(i): c for i, c in enumerate(le.classes_)}
    label2id = {c: i for i, c in enumerate(le.classes_)}
    print(f"[RETRAIN] Classes ({num_labels}): {list(le.classes_)}")

    # ── 5. Tokenise & split ────────────────────────────────────────────
    tokenizer_src = (
        str(CLASSIFIER_MODEL_DIR)
        if CLASSIFIER_MODEL_DIR.exists()
        else "distilbert-base-uncased"
    )
    print(f"[RETRAIN] Tokenizer: {tokenizer_src}")
    tokenizer = DistilBertTokenizerFast.from_pretrained(tokenizer_src)

    indices = list(range(len(texts)))
    train_idx, val_idx = train_test_split(
        indices,
        test_size=VALIDATION_SPLIT,
        random_state=RANDOM_SEED,
        stratify=encoded_labels if num_labels > 1 else None,
    )
    all_enc = tokenizer(
        texts, truncation=True, padding="max_length", max_length=MAX_LEN,
        return_tensors="pt",
    )

    def _subset(enc, idx_list):
        return {k: v[idx_list] for k, v in enc.items()}

    import torch.utils.data as _tud

    class CorrectionDataset(_tud.Dataset):
        def __init__(self, encodings, labels, weights_):
            self.encodings = encodings
            self.labels = labels
            self.weights = weights_

        def __len__(self):
            return len(self.labels)

        def __getitem__(self, idx):
            item = {k: v[idx] for k, v in self.encodings.items()}
            item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
            item["weight"] = torch.tensor(self.weights[idx], dtype=torch.float)
            return item

    train_enc = _subset(all_enc, train_idx)
    val_enc = _subset(all_enc, val_idx)
    train_ds = CorrectionDataset(
        train_enc, [encoded_labels[i] for i in train_idx], [weights[i] for i in train_idx]
    )
    val_ds = CorrectionDataset(
        val_enc, [encoded_labels[i] for i in val_idx], [weights[i] for i in val_idx]
    )
    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE)

    # ── 6. Build model ─────────────────────────────────────────────────
    if CLASSIFIER_MODEL_DIR.exists():
        try:
            model = DistilBertForSequenceClassification.from_pretrained(
                str(CLASSIFIER_MODEL_DIR), num_labels=num_labels,
                ignore_mismatched_sizes=True,
            )
            print("[RETRAIN] Fine-tuning from production model.")
        except Exception as exc:
            print(f"[RETRAIN] WARNING: prod model load failed ({exc}). Starting fresh.")
            model = DistilBertForSequenceClassification.from_pretrained(
                "distilbert-base-uncased", num_labels=num_labels
            )
    else:
        model = DistilBertForSequenceClassification.from_pretrained(
            "distilbert-base-uncased", num_labels=num_labels
        )
    model.config.id2label = id2label
    model.config.label2id = label2id
    model.to(device)

    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE)
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=max(1, total_steps // 10),
        num_training_steps=total_steps,
    )
    loss_fn = torch.nn.CrossEntropyLoss(reduction="none")

    # ── 7. Training loop ───────────────────────────────────────────────
    print(f"[RETRAIN] Training {EPOCHS} epochs on {len(train_ds)} samples…")
    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0.0
        for batch in train_loader:
            input_ids = batch["input_ids"].to(device)
            attn = batch["attention_mask"].to(device)
            labels_t = batch["labels"].to(device)
            sample_w = batch["weight"].to(device)
            outputs = model(input_ids=input_ids, attention_mask=attn, labels=labels_t)
            per_sample_loss = loss_fn(outputs.logits, labels_t)
            loss = (per_sample_loss * sample_w).mean()
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            total_loss += loss.item()
        avg_loss = total_loss / len(train_loader)
        print(f"[RETRAIN] Epoch {epoch + 1}/{EPOCHS} | loss={avg_loss:.4f}")

    # ── 8. Validation ──────────────────────────────────────────────────
    model.eval()
    all_preds, all_true = [], []
    with torch.no_grad():
        for batch in val_loader:
            outputs = model(
                input_ids=batch["input_ids"].to(device),
                attention_mask=batch["attention_mask"].to(device),
            )
            preds = torch.argmax(outputs.logits, dim=1).cpu().tolist()
            all_preds.extend(preds)
            all_true.extend(batch["labels"].tolist())

    new_accuracy = accuracy_score(all_true, all_preds)
    cls_report = classification_report(
        all_true, all_preds, target_names=le.classes_,
        output_dict=True, zero_division=0,
    )
    print(f"[RETRAIN] Candidate accuracy: {new_accuracy:.4f}")
    print(f"[RETRAIN] Production accuracy: {prod_accuracy:.4f}")

    improvement = new_accuracy - prod_accuracy
    version_tag = f"al-{datetime.datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
    should_promote = improvement >= MIN_IMPROVEMENT_DELTA

    # ── 9. Save candidate ──────────────────────────────────────────────
    CANDIDATE_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(str(CANDIDATE_MODEL_DIR))
    tokenizer.save_pretrained(str(CANDIDATE_MODEL_DIR))
    with open(CANDIDATE_MODEL_DIR / "id2label.json", "w") as fh:
        json.dump(id2label, fh)
    with open(CANDIDATE_MODEL_DIR / "label2id.json", "w") as fh:
        json.dump(label2id, fh)
    with open(CANDIDATE_MODEL_DIR / "al_meta.json", "w") as fh:
        json.dump({
            "version_tag": version_tag,
            "accuracy": new_accuracy,
            "prod_accuracy": prod_accuracy,
            "improvement": improvement,
            "promoted": should_promote,
            "trained_at": datetime.datetime.utcnow().isoformat() + "Z",
            "training_samples": len(train_ds),
            "classes": list(le.classes_),
        }, fh, indent=2)
    print(f"[RETRAIN] Candidate saved → {CANDIDATE_MODEL_DIR}")

    # ── 10. Validation gate ────────────────────────────────────────────
    if should_promote:
        import shutil
        if CLASSIFIER_MODEL_DIR.exists():
            backup = _BACKEND_DIR / "models" / f"classifier-backup-{version_tag}"
            shutil.copytree(str(CLASSIFIER_MODEL_DIR), str(backup))
            print(f"[RETRAIN] Production backed up → {backup}")
        shutil.copytree(str(CANDIDATE_MODEL_DIR), str(CLASSIFIER_MODEL_DIR), dirs_exist_ok=True)
        print(f"[RETRAIN] ✅ Promoted {version_tag} (improvement={improvement:+.4f})")
        status = "promoted"
    else:
        status = "rejected"
        print(
            f"[RETRAIN] ❌ Rejected — improvement {improvement:+.4f} "
            f"< required {MIN_IMPROVEMENT_DELTA:+.4f}"
        )

    if al_service:
        al_service.register_model_version(
            version_tag=version_tag,
            model_path=str(CLASSIFIER_MODEL_DIR if should_promote else CANDIDATE_MODEL_DIR),
            accuracy=new_accuracy,
            metrics=cls_report,
            training_samples=len(train_ds),
            promoted=should_promote,
            notes=f"auto-retrain | improvement={improvement:+.4f}",
        )

    result.update({
        "status": status,
        "new_accuracy": round(new_accuracy, 4),
        "prod_accuracy": round(prod_accuracy, 4),
        "improvement": round(improvement, 4),
        "version_tag": version_tag,
        "metrics": cls_report,
        "message": (
            f"Model {version_tag} promoted with {improvement:+.2%} improvement."
            if should_promote
            else f"Model {version_tag} rejected — improvement {improvement:+.2%} below gate."
        ),
    })
    return result


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import sys
    from backend.services.active_learning_service import active_learning_service as svc

    dry = "--dry-run" in sys.argv
    print("[CLI] Preparing dataset…")
    summary = svc.prepare_training_dataset()
    print(f"[CLI] Dataset: {summary}")
    print("[CLI] Starting pipeline…")
    outcome = run_retraining_pipeline(al_service=svc, dry_run=dry)
    print(f"[CLI] Result:\n{json.dumps(outcome, indent=2, default=str)}")
