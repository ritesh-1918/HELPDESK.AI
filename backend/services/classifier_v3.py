# backend/services/classifier_v3.py

import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

try:
    import torch
    import torch.nn as nn
    from transformers import DistilBertModel, DistilBertTokenizerFast
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


# ---------------------------------------------------------------------------
# Neural architecture
# ---------------------------------------------------------------------------

class MultiOutputClassifierV3(nn.Module if TORCH_AVAILABLE else object):
    """
    Multi-output DistilBERT classifier with per-head task loss weighting.

    Args:
        encoder:      Pretrained DistilBERT encoder.
        head_configs: List of dicts — each with keys:
                        'name', 'input_dim', 'hidden_dim', 'num_classes',
                        and optionally 'dropout' (default 0.1).
        task_weights: Optional dict mapping head name -> float weight.
                      Weights must be >= 0. Missing heads default to 1.0.
    """

    def __init__(
        self,
        encoder,
        head_configs: list,
        task_weights: Optional[Dict[str, float]] = None,
    ):
        super().__init__()
        self.encoder = encoder

        # Build per-task classification heads
        self.heads = nn.ModuleDict()
        for cfg in head_configs:
            self.heads[cfg["name"]] = nn.Sequential(
                nn.Linear(cfg["input_dim"], cfg["hidden_dim"]),
                nn.ReLU(),
                nn.Dropout(cfg.get("dropout", 0.1)),
                nn.Linear(cfg["hidden_dim"], cfg["num_classes"]),
            )

        # Validate task_weights
        head_names = set(self.heads.keys())
        if task_weights is not None:
            unknown = set(task_weights.keys()) - head_names
            if unknown:
                raise ValueError(
                    f"task_weights contains unknown head names: {unknown}. "
                    f"Valid heads: {head_names}"
                )
            for name, w in task_weights.items():
                if w < 0:
                    raise ValueError(
                        f"task_weight for '{name}' must be >= 0, got {w}"
                    )

        self.task_weights: Dict[str, float] = {
            name: (task_weights.get(name, 1.0) if task_weights else 1.0)
            for name in head_names
        }

    def forward(self, input_ids, attention_mask):
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        cls = outputs.last_hidden_state[:, 0, :]
        return {name: head(cls) for name, head in self.heads.items()}

    def compute_weighted_loss(
        self,
        logits: Dict[str, Any],
        targets: Dict[str, Any],
        criterion=None,
    ):
        """
        Weighted sum of per-head cross-entropy losses.

        Args:
            logits:    {head_name: tensor(B, num_classes)}
            targets:   {head_name: tensor(B,)}
            criterion: Loss function (default: nn.CrossEntropyLoss())

        Returns:
            Scalar loss tensor.
        """
        if criterion is None:
            criterion = nn.CrossEntropyLoss()

        device = next(self.parameters()).device
        total = torch.tensor(0.0, device=device)
        for name, head_logits in logits.items():
            total = total + self.task_weights.get(name, 1.0) * criterion(
                head_logits, targets[name]
            )
        return total


# ---------------------------------------------------------------------------
# Service layer
# ---------------------------------------------------------------------------

class ClassifierServiceV3:
    """
    Service wrapper around MultiOutputClassifierV3 for inference.

    Attributes set after load_model():
        model         — loaded MultiOutputClassifierV3 (or None)
        tokenizer     — DistilBertTokenizerFast
        label_encoders — dict mapping head name -> sklearn LabelEncoder
        device        — torch.device
        task_weights  — dict passed through to the model
    """

    # Default head configuration matching the repo's training setup
    DEFAULT_HEAD_CONFIGS = [
        {"name": "category", "input_dim": 768, "hidden_dim": 256, "num_classes": 8},
        {"name": "priority", "input_dim": 768, "hidden_dim": 128, "num_classes": 3},
        {"name": "sentiment","input_dim": 768, "hidden_dim": 64,  "num_classes": 3},
    ]

    # Default task weights (can be overridden at init or load time)
    DEFAULT_TASK_WEIGHTS: Dict[str, float] = {
        "category":  2.0,
        "priority":  1.0,
        "sentiment": 0.5,
    }

    def __init__(self, task_weights: Optional[Dict[str, float]] = None):
        self.model = None
        self.tokenizer = None
        self.label_encoders: Dict[str, Any] = {}
        self.device = None
        self.task_weights = task_weights if task_weights is not None else self.DEFAULT_TASK_WEIGHTS

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------

    def load_model(
        self,
        model_path: str,
        tokenizer_name: str = "distilbert-base-uncased",
        head_configs: Optional[list] = None,
        task_weights: Optional[Dict[str, float]] = None,
    ) -> bool:
        """
        Load weights, tokenizer, and label encoders from disk.

        Args:
            model_path:     Path to saved model state dict (.pt / .bin).
            tokenizer_name: HuggingFace model name or local path.
            head_configs:   Override DEFAULT_HEAD_CONFIGS if provided.
            task_weights:   Override instance task_weights if provided.

        Returns:
            True on success, False on failure.
        """
        if not TORCH_AVAILABLE:
            logger.error("torch/transformers not available — cannot load V3 model")
            return False

        try:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            encoder = DistilBertModel.from_pretrained(tokenizer_name)
            self.tokenizer = DistilBertTokenizerFast.from_pretrained(tokenizer_name)

            configs = head_configs or self.DEFAULT_HEAD_CONFIGS
            weights = task_weights if task_weights is not None else self.task_weights

            self.model = MultiOutputClassifierV3(
                encoder=encoder,
                head_configs=configs,
                task_weights=weights,
            )
            state = torch.load(model_path, map_location=self.device)
            self.model.load_state_dict(state)
            self.model.to(self.device)
            self.model.eval()

            logger.info("ClassifierServiceV3 loaded from %s", model_path)
            return True

        except Exception as exc:
            logger.exception("Failed to load V3 model: %s", exc)
            self.model = None
            return False

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Run inference on a single text string.

        Returns:
            On success:  dict of {head_name: {"label": str, "confidence": float}}
            Model unset: {"error": "V3 Model not loaded"}
            Exception:   {"error": <message>}
        """
        if self.model is None:
            return {"error": "V3 Model not loaded"}

        try:
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=512,
            ).to(self.device)

            with torch.no_grad():
                logits = self.model(**inputs)

            results: Dict[str, Any] = {}
            for head_name, head_logits in logits.items():
                probs = torch.softmax(head_logits, dim=-1)
                confidence, pred_idx = torch.max(probs, dim=-1)
                idx = pred_idx.item()

                # Decode label if encoder available, else return raw index
                encoder = self.label_encoders.get(head_name)
                label = encoder.inverse_transform([idx])[0] if encoder else str(idx)

                results[head_name] = {
                    "label": label,
                    "confidence": round(float(confidence.item()), 4),
                }

            return results

        except Exception as exc:
            logger.exception("Prediction failed: %s", exc)
            return {"error": str(exc)}