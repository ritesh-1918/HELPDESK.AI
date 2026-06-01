"""
Export the duplicate-detection SentenceTransformer (all-MiniLM-L6-v2)
to ONNX so the embedding pipeline can run on ONNX Runtime.

Usage:
    python -m backend.scripts.export_duplicate_onnx [--output PATH]

Output: backend/models/duplicate/all-MiniLM-L6-v2.onnx (default)
"""

import argparse
import os
from pathlib import Path

import torch
from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"
DEFAULT_OUTPUT = (
    Path(__file__).resolve().parent.parent / "models" / "duplicate" / "all-MiniLM-L6-v2.onnx"
)


def export(output_path: Path, opset: int = 14):
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"[export_duplicate_onnx] Loading {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    transformer = model[0].auto_model  # underlying HuggingFace transformer
    transformer.eval()

    tokenizer = model.tokenizer
    dummy = tokenizer(
        ["duplicate detection onnx export"],
        padding=True,
        truncation=True,
        return_tensors="pt",
    )

    print(f"[export_duplicate_onnx] Exporting to {output_path}...")
    with torch.no_grad():
        torch.onnx.export(
            transformer,
            (dummy["input_ids"], dummy["attention_mask"], dummy["token_type_ids"]),
            str(output_path),
            input_names=["input_ids", "attention_mask", "token_type_ids"],
            output_names=["last_hidden_state"],
            dynamic_axes={
                "input_ids": {0: "batch", 1: "sequence"},
                "attention_mask": {0: "batch", 1: "sequence"},
                "token_type_ids": {0: "batch", 1: "sequence"},
                "last_hidden_state": {0: "batch", 1: "sequence"},
            },
            opset_version=opset,
            do_constant_folding=True,
        )

    print(f"[export_duplicate_onnx] Done. Wrote {output_path}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--opset", type=int, default=14)
    args = parser.parse_args()
    export(args.output, opset=args.opset)


if __name__ == "__main__":
    main()
