"""
Export the duplicate-detection SentenceTransformer (all-MiniLM-L6-v2)
to ONNX so the embedding pipeline can run on ONNX Runtime.

The script saves both the ONNX model and the tokenizer files required by
``OnnxEncoder`` (in ``backend/services/cosine_similarity.py``) so that
embedding generation can happen entirely within ONNX Runtime without the
full ``sentence-transformers`` / PyTorch stack.

Usage:
    python -m backend.scripts.export_duplicate_onnx                      \\
        [--output-dir PATH]                                              \\
        [--opset N]                                                      \\
        [--model MODEL]

Default output directory:
    backend/models/duplicate/  (contains model.onnx + tokenizer files)
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import torch
from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"
DEFAULT_OUTPUT_DIR = (
    Path(__file__).resolve().parent.parent / "models" / "duplicate"
)


def export(
    output_dir: Path,
    model_name: str = MODEL_NAME,
    opset: int = 14,
) -> Path:
    """Export a SentenceTransformer model to ONNX + save tokenizer files.

    The output directory will contain::

        model.onnx          — the exported ONNX model
        tokenizer.json      — HuggingFace tokenizer file (for ``OnnxEncoder``)
        tokenizer_config.json
        special_tokens_map.json
        vocab.txt

    Returns the path to ``model.onnx``.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    onnx_path = output_dir / "model.onnx"

    print(f"[export_duplicate_onnx] Loading {model_name}...")
    model = SentenceTransformer(model_name)
    transformer = model[0].auto_model
    transformer.eval()

    tokenizer = model.tokenizer
    dummy = tokenizer(
        ["duplicate detection onnx export"],
        padding=True,
        truncation=True,
        return_tensors="pt",
    )

    print(f"[export_duplicate_onnx] Exporting to {onnx_path}...")
    with torch.no_grad():
        torch.onnx.export(
            transformer,
            (dummy["input_ids"], dummy["attention_mask"], dummy["token_type_ids"]),
            str(onnx_path),
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

    # Save tokenizer files so OnnxEncoder can load them at runtime.
    print(f"[export_duplicate_onnx] Saving tokenizer files to {output_dir}...")
    tokenizer.save_pretrained(str(output_dir))

    # Also persist the fast tokenizer used by OnnxEncoder
    try:
        tokenizer.backend_tokenizer.save(str(output_dir / "tokenizer.json"))
    except Exception:
        pass

    print(f"[export_duplicate_onnx] Done. ONNX model at {onnx_path}")
    print(f"[export_duplicate_onnx] Tokenizer files in {output_dir}")
    return onnx_path


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Output directory (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--opset",
        type=int,
        default=14,
        help="ONNX opset version (default: 14)",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=MODEL_NAME,
        help=f"HuggingFace model name (default: {MODEL_NAME})",
    )
    return parser.parse_args(argv)


def main() -> int:
    args = parse_args()
    try:
        export(args.output_dir, model_name=args.model, opset=args.opset)
        return 0
    except Exception as exc:
        print(f"[export_duplicate_onnx] FAILED: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
