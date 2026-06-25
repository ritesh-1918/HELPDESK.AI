import hashlib
import hmac
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODELS = [
    ("classifier-v2", b"helpdesk-ai-classifier-v2"),
    ("classifier-v3", b"helpdesk-ai-classifier-v3"),
]

for model_dir, key in MODELS:
    le_path = os.path.join(BASE_DIR, "models", model_dir, "label_encoders.pkl")
    if not os.path.exists(le_path):
        print(f"[SKIP] {le_path} not found")
        continue
    with open(le_path, "rb") as f:
        raw = f.read()
    sig = hmac.new(key, raw, hashlib.sha256).hexdigest()
    sig_path = le_path + ".sig"
    with open(sig_path, "w") as f:
        f.write(sig)
    print(f"[SIGNED] {sig_path}")
