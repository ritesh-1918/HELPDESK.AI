"""
Train All — Runs classifier and NER training in sequence.
Usage:
    python backend/train_all.py        (from project root)
    python train_all.py                (from backend/ directory)
"""

import os
import sys
import time

# Ensure project root is on the path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
sys.path.insert(0, PROJECT_ROOT)

from backend.training.classifier_trainer import train_classifier
from backend.training.ner_trainer import train_ner


def main():
    print("╔" + "═" * 58 + "╗")
    print("║" + "  AI HELPDESK — FULL MODEL TRAINING".center(58) + "║")
    print("╚" + "═" * 58 + "╝")
    print()

    overall_start = time.time()

    # ── Step 1: Classifier ────────────────────────────────────
    print("[1/2] Training Classifier Model …\n")
    t0 = time.time()
    try:
        train_classifier()
    except Exception as e:
        print(f"\n[ERROR] Classifier training failed: {e}")
        raise
    t1 = time.time()
    print(f"\n[1/2] Classifier training completed in {t1 - t0:.1f}s\n")

    # ── Step 2: NER ───────────────────────────────────────────
    print("[2/2] Training NER Model …\n")
    t0 = time.time()
    try:
        train_ner()
    except Exception as e:
        print(f"\n[ERROR] NER training failed: {e}")
        raise
    t1 = time.time()
    print(f"\n[2/2] NER training completed in {t1 - t0:.1f}s\n")

    total = time.time() - overall_start
    print("╔" + "═" * 58 + "╗")
    print("║" + f"  ALL TRAINING COMPLETE — {total:.1f}s total".center(58) + "║")
    print("╚" + "═" * 58 + "╝")


if __name__ == "__main__":
    main()
