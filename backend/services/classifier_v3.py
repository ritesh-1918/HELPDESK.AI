import os
import torch
import torch.nn as nn
import json
from transformers import BertTokenizerFast, BertModel

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models", "classifier-v3")

class MultiOutputClassifierV3(nn.Module):
    def __init__(self, num_labels_per_output: dict):
        super().__init__()
        self.bert = BertModel.from_pretrained("bert-base-uncased")
        hidden = self.bert.config.hidden_size 
        self.dropout = nn.Dropout(0.3)
        self.heads = nn.ModuleDict()
        for name, n_labels in num_labels_per_output.items():
            self.heads[name] = nn.Sequential(
                nn.Linear(hidden, 256),
                nn.ReLU(),
                nn.Dropout(0.1),
                nn.Linear(256, n_labels)
            )

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        
        # Pull the raw [CLS] token representation directly from the last hidden state
        # Shape of last_hidden_state: (batch_size, sequence_length, hidden_size)
        # Slicing [:, 0] extracts the first token ([CLS]) for the entire batch
        raw_cls_output = outputs.last_hidden_state[:, 0, :]
        
        pooled_output = self.dropout(raw_cls_output)
        logits = {name: head(pooled_output) for name, head in self.heads.items()}
        return logits

import threading

class ClassifierServiceV3:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.tokenizer = None
        self.num_labels = None
        self.label_encoders = None
        
        # Thread lock and state flag to handle concurrent initialization safely
        self._is_loaded = False
        self._load_lock = threading.Lock()

    def load(self):
        """
        Explicitly triggers heavy disk I/O and model allocation.
        Thread-safe to prevent race conditions in concurrent environments.
        """
        if self._is_loaded:
            return self

        with self._load_lock:
            # Double-checked locking pattern
            if not self._is_loaded:
                config_path = os.path.join(MODEL_DIR, "model_config.json")
                if not os.path.exists(config_path):
                    print(f"[V3 Service] Model not found yet at {MODEL_DIR}")
                    return self

                with open(config_path, "r", encoding="utf-8") as f:
                    self.num_labels = json.load(f)

                encoders_path = os.path.join(MODEL_DIR, "label_encoders.json")
                with open(encoders_path, "r", encoding="utf-8") as f:
                    self.label_encoders = json.load(f)

                self.model = MultiOutputClassifierV3(self.num_labels).to(self.device)
                self.model.load_state_dict(torch.load(os.path.join(MODEL_DIR, "model.pt"), map_location=self.device))
                self.model.eval()

                self.tokenizer = BertTokenizerFast.from_pretrained(MODEL_DIR)
                print("[INFO] Classifier Service V3 (Power Model) Loaded successfully.")
                
                self._is_loaded = True
                
        return self
    
    def predict(self, text: str):
        if not self._is_loaded:
            self.load()
            
        if self.model is None: return {"error": "V3 Model not loaded"}

    def predict(self, text: str):
        if self.model is None: return {"error": "V3 Model not loaded"}
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=256).to(self.device)
        with torch.no_grad():
            logits = self.model(inputs["input_ids"], inputs["attention_mask"])
            
        results = {}
        for col, classes_list in self.label_encoders.items():
            probs = torch.softmax(logits[col], dim=1)
            conf, pred_idx = torch.max(probs, dim=1)
            
            # Use direct list index mapping instead of the unsafe object method
            pred_val = classes_list[pred_idx.item()] if pred_idx.item() < len(classes_list) else "Unknown"
            results[col] = {
                "prediction": pred_val,
                "confidence": float(conf.item())
            }
        
        if "Priority" in results: results["priority"] = results.pop("Priority")
        return results

classifier_v3 = ClassifierServiceV3()
