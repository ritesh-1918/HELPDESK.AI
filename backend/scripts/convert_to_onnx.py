"""
Export all-MiniLM-L6-v2 to backend/models/onnx-minilm for local fallback use.

Run from the repository root:
    python backend/scripts/convert_to_onnx.py
"""

from __future__ import annotations

from pathlib import Path


def main() -> None:
    try:
        from sentence_transformers import SentenceTransformer
        from transformers import AutoTokenizer
        import torch
    except ImportError as error:
        raise SystemExit(
            "Install backend dependencies before exporting ONNX artifacts: "
            "sentence-transformers, transformers, torch, and tokenizers are required."
        ) from error

    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    output_dir = Path(__file__).resolve().parents[1] / "models" / "onnx-minilm"
    output_dir.mkdir(parents=True, exist_ok=True)

    class EncoderWrapper(torch.nn.Module):
        def __init__(self, model):
            super().__init__()
            self.model = model

        def forward(self, input_ids, attention_mask, token_type_ids=None):
            kwargs = {
                "input_ids": input_ids,
                "attention_mask": attention_mask,
            }
            if token_type_ids is not None:
                kwargs["token_type_ids"] = token_type_ids
            return self.model(**kwargs).last_hidden_state

    sentence_model = SentenceTransformer(model_name)
    transformer = EncoderWrapper(sentence_model[0].auto_model)
    transformer.eval()
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    sample = tokenizer(
        "ticket classifier export sample",
        return_tensors="pt",
        padding="max_length",
        truncation=True,
        max_length=128,
    )

    input_names = ["input_ids", "attention_mask"]
    inputs = (sample["input_ids"], sample["attention_mask"])
    if "token_type_ids" in sample:
        input_names.append("token_type_ids")
        inputs = (*inputs, sample["token_type_ids"])

    torch.onnx.export(
        transformer,
        inputs,
        output_dir / "model.onnx",
        input_names=input_names,
        output_names=["last_hidden_state"],
        dynamic_axes={
            "input_ids": {0: "batch", 1: "sequence"},
            "attention_mask": {0: "batch", 1: "sequence"},
            "last_hidden_state": {0: "batch", 1: "sequence"},
            **({"token_type_ids": {0: "batch", 1: "sequence"}} if "token_type_ids" in input_names else {}),
        },
        opset_version=17,
    )
    tokenizer.backend_tokenizer.save(str(output_dir / "tokenizer.json"))
    tokenizer.save_pretrained(output_dir)
    print(f"ONNX MiniLM fallback exported to {output_dir}")


if __name__ == "__main__":
    main()
