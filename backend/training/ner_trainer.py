"""
NER Trainer — Token Classification
Fine-tunes distilbert-base-uncased for named-entity recognition using BIO tags.
"""

import os
import sys
import glob
import json
import numpy as np

import torch
from torch.utils.data import DataLoader
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForTokenClassification,
    get_linear_schedule_with_warmup,
)
from sklearn.model_selection import train_test_split

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_DIR = os.path.join(PROJECT_ROOT, "Model")
SAVE_DIR = os.path.join(PROJECT_ROOT, "backend", "models", "ner")

MAX_LEN = 128
BATCH_SIZE = 16
EPOCHS = 3
LEARNING_RATE = 3e-5

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ---------------------------------------------------------------------------
# Load NER annotations JSON
# ---------------------------------------------------------------------------
def _find_ner_json() -> str:
    """Locate ner_annotations*.json inside Model folder."""
    matches = glob.glob(os.path.join(MODEL_DIR, "ner_annotations*.*json"))
    if not matches:
        # try broader pattern
        matches = glob.glob(os.path.join(MODEL_DIR, "*ner*.*json"))
    if not matches:
        raise FileNotFoundError(f"No NER annotations JSON found in {MODEL_DIR}")
    return matches[0]


def _load_annotations(path: str):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict) and "annotations" in data:
        annotations = data["annotations"]
    elif isinstance(data, list):
        annotations = data
    else:
        raise ValueError("Unexpected NER JSON structure")

    return annotations


# ---------------------------------------------------------------------------
# Build label map & aligned dataset
# ---------------------------------------------------------------------------
def _build_label_map(annotations):
    labels_set = set()
    for ann in annotations:
        for tok in ann["tokens"]:
            labels_set.add(tok["label"])
    label_list = sorted(labels_set)
    label2id = {l: i for i, l in enumerate(label_list)}
    id2label = {i: l for l, i in label2id.items()}
    return label_list, label2id, id2label


class NERDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, aligned_labels):
        self.encodings = encodings
        self.labels = aligned_labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {k: v[idx] for k, v in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item


def _align_labels(tokenizer, annotations, label2id, max_len):
    """
    Tokenize the raw tokens and align BIO labels to sub-tokens.
    """
    all_input_ids = []
    all_attention = []
    all_labels = []

    for ann in annotations:
        words = [t["token"] for t in ann["tokens"]]
        word_labels = [label2id[t["label"]] for t in ann["tokens"]]

        encoding = tokenizer(
            words,
            is_split_into_words=True,
            truncation=True,
            padding="max_length",
            max_length=max_len,
            return_tensors="pt",
        )

        word_ids = encoding.word_ids(batch_index=0)
        aligned = []
        prev_word_id = None
        for wid in word_ids:
            if wid is None:
                aligned.append(-100)  # special tokens
            elif wid != prev_word_id:
                aligned.append(word_labels[wid])
            else:
                # sub-token: copy the label (keep B- as is for continuity)
                aligned.append(word_labels[wid])
            prev_word_id = wid

        all_input_ids.append(encoding["input_ids"].squeeze(0))
        all_attention.append(encoding["attention_mask"].squeeze(0))
        all_labels.append(aligned)

    encodings_dict = {
        "input_ids": torch.stack(all_input_ids),
        "attention_mask": torch.stack(all_attention),
    }
    return encodings_dict, all_labels


# ---------------------------------------------------------------------------
# Training loop
# ---------------------------------------------------------------------------
def train_ner():
    print("=" * 60)
    print("NER TRAINING")
    print("=" * 60)

    # 1. Load
    path = _find_ner_json()
    print(f"[INFO] NER annotations found: {path}")
    annotations = _load_annotations(path)
    print(f"[INFO] Loaded {len(annotations)} samples")

    label_list, label2id, id2label = _build_label_map(annotations)
    print(f"[INFO] Labels ({len(label_list)}): {label_list}")

    # 2. Tokenize & align
    tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")
    encodings, aligned_labels = _align_labels(tokenizer, annotations, label2id, MAX_LEN)

    # 3. Split
    indices = list(range(len(annotations)))
    train_idx, test_idx = train_test_split(indices, test_size=0.2, random_state=42)

    def _subset(enc, idxs):
        return {k: v[idxs] for k, v in enc.items()}

    train_enc = _subset(encodings, train_idx)
    test_enc = _subset(encodings, test_idx)
    train_labels = [aligned_labels[i] for i in train_idx]
    test_labels = [aligned_labels[i] for i in test_idx]

    train_ds = NERDataset(train_enc, train_labels)
    test_ds = NERDataset(test_enc, test_labels)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE)

    print(f"[INFO] Train: {len(train_ds)}, Test: {len(test_ds)}")

    # 4. Model
    model = DistilBertForTokenClassification.from_pretrained(
        "distilbert-base-uncased",
        num_labels=len(label_list),
        id2label=id2label,
        label2id=label2id,
    ).to(DEVICE)

    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE)
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=0, num_training_steps=total_steps)

    print(f"[INFO] Device: {DEVICE}")
    print(f"[INFO] Training for {EPOCHS} epochs …")

    # 5. Train
    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0
        for batch in train_loader:
            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            labels = batch["labels"].to(DEVICE)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            scheduler.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f"  Epoch {epoch + 1}/{EPOCHS}  loss={avg_loss:.4f}")

    # 6. Evaluate
    print("\n[EVAL] Computing metrics on test set …")
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            labels = batch["labels"].to(DEVICE)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            preds = torch.argmax(outputs.logits, dim=2)

            # Only count non-special tokens (label != -100)
            mask = labels != -100
            correct += ((preds == labels) & mask).sum().item()
            total += mask.sum().item()

    accuracy = correct / total if total > 0 else 0
    print(f"  Token-level accuracy: {accuracy:.4f}")

    # 7. Save
    os.makedirs(SAVE_DIR, exist_ok=True)
    model.save_pretrained(SAVE_DIR)
    tokenizer.save_pretrained(SAVE_DIR)

    with open(os.path.join(SAVE_DIR, "label_map.json"), "w") as f:
        json.dump({"label2id": label2id, "id2label": {str(k): v for k, v in id2label.items()}}, f, indent=2)

    print(f"\n[INFO] NER model saved to {SAVE_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    train_ner()
