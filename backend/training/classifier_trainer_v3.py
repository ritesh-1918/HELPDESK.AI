"""
Classifier Trainer V3 — "Supervised Brain" Pipeline
Upgraded to BERT-Base for maximum accuracy and power.
"""

import os
import pickle
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import (
    BertTokenizerFast,
    BertModel,
    get_linear_schedule_with_warmup,
)

# ---------------------------------------------------------------------------
# Configuration (V3 - Power Mode)
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_DIR = os.path.join(PROJECT_ROOT, "Model")
SAVE_DIR = os.path.join(PROJECT_ROOT, "backend", "models", "classifier-v3") 
DATASET_PATH = os.path.join(MODEL_DIR, "Final_Balanced_10000_IT_Support_Tickets.csv")

LABEL_COLUMNS = ["category", "sub_category", "Priority", "auto_resolve", "assigned_team"]
TEXT_COLUMN = "user_input_text"

MAX_LEN = 256  
BATCH_SIZE = 16 
EPOCHS = 10      # Increased for deep learning
LEARNING_RATE = 2e-5

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------------------------------------------------------------------
# Architecture: BERT-Base (110M Params)
# ---------------------------------------------------------------------------
class MultiOutputClassifierV3(nn.Module):
    def __init__(self, num_labels_per_output: dict):
        super().__init__()
        # Moving to full BERT for more power
        self.bert = BertModel.from_pretrained("bert-base-uncased")
        hidden = self.bert.config.hidden_size 
        
        self.dropout = nn.Dropout(0.3) # Slightly higher dropout for better generalization
        
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
        # Use the pooled output for full BERT
        pooled_output = outputs.pooler_output 
        pooled_output = self.dropout(pooled_output)
        
        logits = {name: head(pooled_output) for name, head in self.heads.items()}
        return logits

class TicketDataset(Dataset):
    def __init__(self, encodings, labels_dict):
        self.encodings = encodings
        self.labels_dict = labels_dict

    def __len__(self):
        return len(self.labels_dict[LABEL_COLUMNS[0]])

    def __getitem__(self, idx):
        item = {k: v[idx] for k, v in self.encodings.items()}
        for col in LABEL_COLUMNS:
            item[f"label_{col}"] = torch.tensor(self.labels_dict[col][idx], dtype=torch.long)
        return item

# ---------------------------------------------------------------------------
# Training Logic
# ---------------------------------------------------------------------------
def train_v3():
    print("🔥 Starting POWER TRAINING (V3 - BERT-Base)")
    
    df = pd.read_csv(DATASET_PATH)
    df.dropna(subset=[TEXT_COLUMN] + LABEL_COLUMNS, inplace=True)
    df.reset_index(drop=True, inplace=True)

    label_encoders = {}
    encoded_labels = {}
    for col in LABEL_COLUMNS:
        le = LabelEncoder()
        df[col] = df[col].astype(str)
        encoded_labels[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    num_labels_per_output = {col: len(le.classes_) for col, le in label_encoders.items()}

    tokenizer = BertTokenizerFast.from_pretrained("bert-base-uncased")
    texts = df[TEXT_COLUMN].tolist()
    encodings = tokenizer(texts, truncation=True, padding=True, max_length=MAX_LEN, return_tensors="pt")

    indices = np.arange(len(df))
    train_idx, test_idx = train_test_split(indices, test_size=0.1, random_state=42)

    def _subset(enc, idx): return {k: v[idx] for k, v in enc.items()}
    
    train_ds = TicketDataset(_subset(encodings, train_idx), {col: encoded_labels[col][train_idx] for col in LABEL_COLUMNS})
    test_ds = TicketDataset(_subset(encodings, test_idx), {col: encoded_labels[col][test_idx] for col in LABEL_COLUMNS})

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE)

    model = MultiOutputClassifierV3(num_labels_per_output).to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE)
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=200, num_training_steps=total_steps)
    loss_fn = nn.CrossEntropyLoss()

    print(f"\n[TRAIN] Executing {EPOCHS} epochs on {DEVICE}...")
    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0
        for batch in train_loader:
            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)

            logits = model(input_ids, attention_mask)
            loss = sum(loss_fn(logits[col], batch[f"label_{col}"].to(DEVICE)) for col in LABEL_COLUMNS)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            scheduler.step()
            total_loss += loss.item()

        print(f"✅ Epoch {epoch+1}/{EPOCHS} | Avg Loss: {total_loss/len(train_loader):.4f}")

    # Save
    os.makedirs(SAVE_DIR, exist_ok=True)
    torch.save(model.state_dict(), os.path.join(SAVE_DIR, "model.pt"))
    tokenizer.save_pretrained(SAVE_DIR)
    with open(os.path.join(SAVE_DIR, "label_encoders.pkl"), "wb") as f: pickle.dump(label_encoders, f)
    with open(os.path.join(SAVE_DIR, "model_config.json"), "w") as f: json.dump(num_labels_per_output, f)
    print(f"\n[SUCCESS] V3 Power Model saved to {SAVE_DIR}")

if __name__ == "__main__":
    train_v3()
