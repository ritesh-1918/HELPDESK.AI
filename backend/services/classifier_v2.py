import os
import torch
import torch.nn as nn
import pickle
import json
from transformers import DistilBertTokenizerFast, DistilBertModel

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models", "classifier-v2")

# We must use the exact same class definition as trainer_v2
class MultiOutputClassifierV2(nn.Module):
    def __init__(self, num_labels_per_output: dict):
        super().__init__()
        self.bert = DistilBertModel.from_pretrained("distilbert-base-uncased")
        hidden = self.bert.config.hidden_size 
        self.dropout = nn.Dropout(0.2)
        self.heads = nn.ModuleDict()
        for name, n_labels in num_labels_per_output.items():
            self.heads[name] = nn.Linear(hidden, n_labels)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls_output = outputs.last_hidden_state[:, 0] 
        cls_output = self.dropout(cls_output)
        logits = {name: head(cls_output) for name, head in self.heads.items()}
        return logits

class ClassifierServiceV2:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # 1. Load Config
        config_path = os.path.join(MODEL_DIR, "model_config.json")
        if not os.path.exists(config_path):
            self.model = None
            print(f"[WARN] V2 Model config not found at {config_path}")
            return

        with open(config_path, "r") as f:
            self.num_labels = json.load(f)

        # 2. Load Encoders
        with open(os.path.join(MODEL_DIR, "label_encoders.pkl"), "rb") as f:
            self.label_encoders = pickle.load(f)

        # 3. Load Model
        self.model = MultiOutputClassifierV2(self.num_labels).to(self.device)
        model_path = os.path.join(MODEL_DIR, "model.pt")
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()

        # 4. Load Tokenizer
        self.tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_DIR)
        print("[SUCCESS] Classifier Service V2 (Shadow) Loaded Successfully.")

    def predict(self, text: str):
        if self.model is None:
            return {"error": "V2 Model not initialized"}

        inputs = self.tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            padding=True, 
            max_length=256 # V2 uses 256
        ).to(self.device)

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
        
        # Map V2 'Priority' (capitalized) to generic response
        if "Priority" in results:
            results["priority"] = results.pop("Priority")

        return results

# Singleton instance
classifier_v2 = ClassifierServiceV2()
