"""
Classifier Service — Loads the trained DistilBert sequence classifier and predicts.
The model outputs combined "Category | SubCategory" labels.
Priority and other fields are derived from the category mapping.
"""

import os
import json
try:
    import torch
    import torch.nn.functional as F
    from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
    _HAS_TORCH = True
except Exception:  # pragma: no cover - optional CI/runtime dependency
    torch = None
    F = None
    DistilBertTokenizerFast = None
    DistilBertForSequenceClassification = None
    _HAS_TORCH = False

SAVE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models", "classifier")
DEVICE = torch.device("cuda" if torch and torch.cuda.is_available() else "cpu") if _HAS_TORCH else None
MAX_LEN = 128

try:
    from backend.services.metrics_service import (
        CLASSIFIER_LATENCY,
        CLASSIFIER_REQUESTS,
        CLASSIFIER_TOKENS,
    )
    _METRICS_ENABLED = True
except Exception:
    _METRICS_ENABLED = False

# Priority mapping based on sub-category severity
PRIORITY_MAP = {
    "Blue Screen": "Critical", "Overheating": "Critical", "Data Loss": "Critical",
    "Hardware Failure": "Critical", "Application Crash": "High",
    "Login Failure": "High", "Password Reset": "High", "VPN Connection": "High",
    "Firewall Block": "High", "DNS Problem": "High", "MFA Problem": "High",
    "Account Expired": "High", "Permission Issue": "Medium", "Access Request": "Medium",
    "Software Install": "Medium", "Update Problem": "Medium", "Compatibility": "Medium",
    "Configuration": "Medium", "License Issue": "Medium", "Performance": "Medium",
    "Internet Slow": "Medium", "WiFi Issue": "Medium", "Remote Access": "Medium",
    "Proxy Error": "Medium", "Network Drive": "Medium", "Role Change": "Medium",
    "Account Unlock": "Low", "Keyboard/Mouse": "Low", "Monitor Problem": "Low",
    "Printer Error": "Low", "Battery Issue": "Low", "Laptop Issue": "Low",
}

# Team assignment based on category
TEAM_MAP = {
    "Access": "IAM Team",
    "Network": "Network Support",
    "Software": "Application Support",
    "Hardware": "Hardware Support",
}

# Auto-resolve: simple issues that can be auto-resolved
AUTO_RESOLVE_SUBS = {
    "Password Reset", "Account Unlock", "Software Install",
    "WiFi Issue", "Printer Error", "Monitor Problem",
}


class ClassifierService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.id2label = None
        self.label2id = None
        self._loaded = False

    def load(self):
        """Load model, tokenizer, and label mappings from disk."""
        if self._loaded:
            return

        if not _HAS_TORCH:
            # Degraded environment: ML runtime not available. Delay failure until predict is called.
            print("[INFO] ML runtime not available; classifier will remain unloaded until dependencies are installed.")
            return

        abs_dir = os.path.abspath(SAVE_DIR)
        safetensors_path = os.path.join(abs_dir, "model.safetensors")

        if not os.path.exists(safetensors_path):
            raise FileNotFoundError(
                f"Classifier model not found at {abs_dir}. "
                "Please ensure model files are present."
            )

        with open(safetensors_path, "rb") as f:
            header = f.read(512)
        if (
            b"version https://git-lfs.github.com/spec" in header
            or b"oid sha256:" in header
        ):
            raise FileNotFoundError(
                f"Classifier model at {abs_dir} is a Git LFS placeholder, not the actual model. "
                "Please pull the LFS assets."
            )

        # Load label mappings
        with open(os.path.join(abs_dir, "id2label.json"), "r") as f:
            self.id2label = json.load(f)
        with open(os.path.join(abs_dir, "label2id.json"), "r") as f:
            self.label2id = json.load(f)

        # Load tokenizer
        self.tokenizer = DistilBertTokenizerFast.from_pretrained(abs_dir)

        # Load model
        self.model = DistilBertForSequenceClassification.from_pretrained(abs_dir)
        self.model.to(DEVICE)
        self.model.eval()

        self._loaded = True
        print("Classifier loaded successfully")

    def predict(self, text: str) -> dict:
        """
        Predict category, subcategory, priority, auto_resolve, assigned_team, and confidence.
        """
        start_time = time.time()
        try:
            self.load()

            encoding = self.tokenizer(
                text,
                truncation=True,
                padding="max_length",
                max_length=MAX_LEN,
                return_tensors="pt",
            )
            input_ids = encoding["input_ids"].to(DEVICE)
            attention_mask = encoding["attention_mask"].to(DEVICE)

        import time
        _t0 = time.perf_counter()
        try:
            with torch.no_grad():
                outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs.logits
                probs = F.softmax(logits, dim=1)
                confidence, pred_idx = torch.max(probs, dim=1)
        except Exception:
            if _METRICS_ENABLED:
                CLASSIFIER_REQUESTS.labels(model="distilbert", status="error").inc()
            raise
        if _METRICS_ENABLED:
            CLASSIFIER_LATENCY.labels(model="distilbert").observe(time.perf_counter() - _t0)
            CLASSIFIER_REQUESTS.labels(model="distilbert", status="ok").inc()
            CLASSIFIER_TOKENS.labels(model="distilbert").inc(int(attention_mask.sum().item()))

            pred_idx = pred_idx.item()
            confidence = round(confidence.item(), 4)

            # Decode the combined label "Category | SubCategory"
            combined_label = self.id2label.get(str(pred_idx), "Unknown | Unknown")
            parts = combined_label.split(" | ", 1)
            category = parts[0].strip() if len(parts) > 0 else "Unknown"
            subcategory = parts[1].strip() if len(parts) > 1 else "Unknown"

            # Derive priority
            priority = PRIORITY_MAP.get(subcategory, "Medium")

            # Derive assigned team
            assigned_team = TEAM_MAP.get(category, "General Support")

            # Derive auto_resolve
            auto_resolve = subcategory in AUTO_RESOLVE_SUBS

            # --- Regex Override Layer (Boost for Technical Keywords) ---
            tech_keywords = {
                "Network": ["IP address", "hostname", "connection", "network", "bandwidth", "DNS", "firewall", "VPN", "Connectivity", "Latency", "Routing", "Spikes"],
                "Software": ["crash", "load", "website", "application", "error", "bug", "failing", "software", "SQL", "Cluster", "Database", "Production", "Latency"],
                "Access": ["login", "password", "access", "authentication", "account", "permission", "MFA", "OAuth"]
            }
            
            lower_text = text.lower()
            for cat, keywords in tech_keywords.items():
                if any(k.lower() in lower_text for k in keywords):
                    # If current prediction is generic, or we have a high-value technical keyword
                    if category == "General" or confidence < 0.9:
                        category = cat
                        assigned_team = TEAM_MAP.get(cat, "General Support")
                        # Boost confidence significantly for verified technical signals
                        confidence = max(confidence, 0.92) 
                        break

            MODEL_PREDICTIONS_TOTAL.labels(status="success").inc()
            return {
                "category": category,
                "subcategory": subcategory,
                "priority": priority,
                "auto_resolve": auto_resolve,
                "assigned_team": assigned_team,
                "confidence": confidence,
            }
        except Exception as e:
            MODEL_PREDICTIONS_TOTAL.labels(status="failure").inc()
            raise e
        finally:
            duration = time.time() - start_time
            MODEL_PREDICTION_LATENCY.observe(duration)
