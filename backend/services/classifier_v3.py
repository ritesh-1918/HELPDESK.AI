import os
import torch
import torch.nn as nn
import pickle
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
        pooled_output = outputs.pooler_output 
        pooled_output = self.dropout(pooled_output)
        logits = {name: head(pooled_output) for name, head in self.heads.items()}
        return logits

class ClassifierServiceV3:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        
        config_path = os.path.join(MODEL_DIR, "model_config.json")
        if not os.path.exists(config_path):
            print(f"[V3 Service] Model not found yet at {MODEL_DIR}")
            return

        with open(config_path, "r") as f:
            self.num_labels = json.load(f)

        with open(os.path.join(MODEL_DIR, "label_encoders.pkl"), "rb") as f:
            self.label_encoders = pickle.load(f)

        self.model = MultiOutputClassifierV3(self.num_labels).to(self.device)
        self.model.load_state_dict(torch.load(os.path.join(MODEL_DIR, "model.pt"), map_location=self.device))
        self.model.eval()

        self.tokenizer = BertTokenizerFast.from_pretrained(MODEL_DIR)
        print("[INFO] Classifier Service V3 (Power Model) Loaded.")

    def predict(self, text: str):
        if self.model is None: return {"error": "V3 Model not loaded"}
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=256).to(self.device)
        with torch.no_grad():
            logits = self.model(inputs["input_ids"], inputs["attention_mask"])
            
        results = {}
        for col, le in self.label_encoders.items():
            probs = torch.softmax(logits[col], dim=1)
            conf, pred_idx = torch.max(probs, dim=1)
            results[col] = {
                "prediction": le.inverse_transform([pred_idx.item()])[0],
                "confidence": float(conf.item())
            }
        
        if "Priority" in results: results["priority"] = results.pop("Priority")
        return results

classifier_v3 = ClassifierServiceV3()
