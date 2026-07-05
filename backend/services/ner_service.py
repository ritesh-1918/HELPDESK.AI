"""
NER Service — Loads the trained DistilBert token classifier and extracts entities.
Labels follow pattern: B-B-ENTITY_TYPE, I-B-ENTITY_TYPE, O
"""

import os
import json
import torch
import torch.nn.functional as F
from transformers import DistilBertTokenizerFast, DistilBertForTokenClassification

SAVE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models", "ner")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MAX_LEN = 128

import re

# Regex patterns for high-fidelity extraction
REGEX_PATTERNS = {
    "IP_ADDRESS": r"\b(?:\d{1,3}\.){3}\d{1,3}\b|IP\s?Address",
    "HOSTNAME": r"\b(?:srv|db|app|web|dev|prod)-[\w\d-]+\b|Hostname",
    "NETWORK_ERROR": r"Network issues|Timeout|Connection failed|Cannot load|Latency|Spikes",
    "LOGIN_ISSUE": r"logging in|login error|authentication failed|MFA",
    "VLAN": r"\bVLAN\s?\d+\b",
    "DATABASE": r"\bSQL\b|\bPostgres\b|\bDatabase\b|\bCluster\b|\bNode\b",
    "SYSTEM": r"\bProduction\b|\bStaging\b|\bInstance\b|\bMainframe\b",
    "BROWSER": r"Chrome|Edge|Firefox|Safari|Browser"
}


class NERService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.id2label = None
        self.label2id = None
        self._loaded = False

    def load(self):
        """Load model, tokenizer, and label map from disk."""
        if self._loaded:
            return

        abs_dir = os.path.abspath(SAVE_DIR)

        if not os.path.exists(os.path.join(abs_dir, "model.safetensors")):
            raise FileNotFoundError(
                f"NER model not found at {abs_dir}. "
                "Please ensure model files are present."
            )

        # Load label mappings
        with open(os.path.join(abs_dir, "ner_id2label.json"), "r") as f:
            self.id2label = json.load(f)
        with open(os.path.join(abs_dir, "ner_label2id.json"), "r") as f:
            self.label2id = json.load(f)

        # Load tokenizer and model
        self.tokenizer = DistilBertTokenizerFast.from_pretrained(abs_dir)
        self.model = DistilBertForTokenClassification.from_pretrained(abs_dir)
        self.model.to(DEVICE)
        self.model.eval()

        self._loaded = True
        print("NER loaded successfully")

    def _clean_label(self, label: str) -> tuple[str, str]:
        """
        Parse label like 'B-B-APP_NAME' into (bio_prefix, entity_type).
        Returns ('B', 'APP_NAME') for 'B-B-APP_NAME'
        Returns ('I', 'APP_NAME') for 'I-B-APP_NAME'
        Returns ('O', '') for 'O'
        """
        if label == "O":
            return ("O", "")

        # Format: B-B-ENTITY or I-B-ENTITY
        if label.startswith("B-B-"):
            return ("B", label[4:])
        elif label.startswith("I-B-"):
            return ("I", label[4:])
        elif label.startswith("B-"):
            return ("B", label[2:])
        elif label.startswith("I-"):
            return ("I", label[2:])
        return ("O", "")

    def extract_entities(self, text: str) -> list[dict]:
        """
        Extract named entities from text.
        Returns list of {text: str, label: str, confidence: float}.
        """
        self.load()

        # Tokenize word-by-word for alignment
        words = text.split()
        if not words:
            return []

        encoding = self.tokenizer(
            words,
            is_split_into_words=True,
            truncation=True,
            padding="max_length",
            max_length=MAX_LEN,
            return_tensors="pt",
        )

        input_ids = encoding["input_ids"].to(DEVICE)
        attention_mask = encoding["attention_mask"].to(DEVICE)

        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
            probs = F.softmax(outputs.logits, dim=2)
            pred_ids = torch.argmax(probs, dim=2).squeeze(0).cpu().tolist()
            confs = torch.max(probs, dim=2).values.squeeze(0).cpu().tolist()

        word_ids = encoding.word_ids(batch_index=0)

        # Aggregate sub-tokens back to word-level predictions
        # For each word, take the prediction from its first sub-token
        word_preds = {}  # word_idx -> (label_str, confidence)
        for token_idx, wid in enumerate(word_ids):
            if wid is None:
                continue
            if wid not in word_preds:
                label_str = self.id2label.get(str(pred_ids[token_idx]), "O")
                word_preds[wid] = (label_str, confs[token_idx])

        # Build entities from BIO tags
        entities = []
        current_text = None
        current_label = None
        current_confs = []

        for wid in sorted(word_preds.keys()):
            raw_label, conf = word_preds[wid]
            bio, entity_type = self._clean_label(raw_label)

            if bio == "B":
                # Save previous entity
                if current_text is not None and current_label:
                    entities.append({
                        "text": current_text,
                        "label": current_label,
                        "confidence": round(sum(current_confs) / len(current_confs), 4),
                    })
                current_text = words[wid]
                current_label = entity_type
                current_confs = [conf]
            elif bio == "I" and current_label == entity_type:
                # Continue current entity
                current_text += " " + words[wid]
                current_confs.append(conf)
            else:
                # O tag or label mismatch — flush
                if current_text is not None and current_label:
                    entities.append({
                        "text": current_text,
                        "label": current_label,
                        "confidence": round(sum(current_confs) / len(current_confs), 4),
                    })
                current_text = None
                current_label = None
                current_confs = []

        # Flush last entity
        if current_text is not None and current_label:
            entities.append({
                "text": current_text,
                "label": current_label,
                "confidence": round(sum(current_confs) / len(current_confs), 4),
            })

        # --- Regex Fallback Layer ---
        for label, pattern in REGEX_PATTERNS.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                # Add to entities, avoiding duplicates (check if text already extracted)
                match_text = match.group()
                if not any(e["text"].lower() == match_text.lower() for e in entities):
                    entities.append({
                        "text": match_text,
                        "label": label,
                        "confidence": 0.99 # High confidence for regex matches
                    })

        return entities
