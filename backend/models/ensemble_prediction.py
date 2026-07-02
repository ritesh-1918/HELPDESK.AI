"""
Ensemble Prediction Model — Database / In-Memory Persistence Schema
Stores ensemble prediction metadata, confidence scores, entropy values,
and model agreement metrics for audit, drift detection, and A/B analysis.

Issue #2805 — Multi-Model Ensemble for Ticket Classifications
"""

import uuid
import datetime
from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class ModelVotes:
    """Per-model top prediction votes."""
    bert: Optional[str] = None
    tfidf: Optional[str] = None
    rf: Optional[str] = None
    rules: Optional[str] = None

    def to_dict(self) -> dict:
        return {k: v for k, v in asdict(self).items() if v is not None}

    def as_list(self) -> list[str]:
        """Return all non-null vote values."""
        return [v for v in [self.bert, self.tfidf, self.rf, self.rules] if v is not None]


@dataclass
class IndividualConfidences:
    """Per-model confidence scores for a single prediction."""
    bert: Optional[float] = None
    tfidf: Optional[float] = None
    rf: Optional[float] = None
    rules: Optional[float] = None

    def to_dict(self) -> dict:
        return {k: v for k, v in asdict(self).items() if v is not None}

    def average(self) -> float:
        vals = [v for v in [self.bert, self.tfidf, self.rf, self.rules] if v is not None]
        return sum(vals) / len(vals) if vals else 0.0


@dataclass
class EnsemblePrediction:
    """
    Complete ensemble prediction record including all uncertainty metrics.
    Designed for:
      - Storage in Supabase / any DB as a JSON column or dedicated table
      - A/B testing comparison with single-model predictions
      - Drift detection and monitoring dashboards
    """
    # Core prediction
    prediction: str              # e.g. "Access | Password Reset"
    category: str
    subcategory: str
    confidence: float            # Ensemble weighted confidence [0, 1]
    entropy: float               # Normalized Shannon entropy [0, 1]
    agreement: float             # Model agreement score [0, 1]

    # Routing decision
    routing_action: str          # "auto_route" | "monitor" | "human_review" | "escalate"
    needs_review: bool

    # Per-model breakdown
    model_votes: dict = field(default_factory=dict)
    individual_confidences: dict = field(default_factory=dict)
    matched_rules: list = field(default_factory=list)
    ensemble_weights: dict = field(default_factory=dict)

    # Metadata
    prediction_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    ticket_id: Optional[str] = None
    original_text_hash: Optional[str] = None  # sha256 of input text (PII-safe)
    created_at: str = field(default_factory=lambda: datetime.datetime.utcnow().isoformat() + "Z")

    # A/B testing fields
    was_corrected: bool = False
    corrected_label: Optional[str] = None
    correction_timestamp: Optional[str] = None

    def to_dict(self) -> dict:
        """Serialize to a plain dict for JSON storage."""
        return asdict(self)

    def is_high_confidence(self) -> bool:
        return self.confidence >= 0.85 and self.routing_action == "auto_route"

    def is_ambiguous(self) -> bool:
        """True when entropy is very high — multiple equally-likely categories."""
        return self.entropy > 0.7

    def mark_correction(self, corrected_label: str):
        """Record a human correction for active learning / drift tracking."""
        self.was_corrected = True
        self.corrected_label = corrected_label
        self.correction_timestamp = datetime.datetime.utcnow().isoformat() + "Z"

    @classmethod
    def from_ensemble_result(cls, result: dict, ticket_id: Optional[str] = None,
                              text_hash: Optional[str] = None) -> "EnsemblePrediction":
        """Factory: build from the dict returned by EnsembleClassifier.predict_with_metadata()."""
        return cls(
            prediction=result.get("prediction", "Unknown | Unknown"),
            category=result.get("category", "Unknown"),
            subcategory=result.get("subcategory", "Unknown"),
            confidence=result.get("confidence", 0.0),
            entropy=result.get("entropy", 1.0),
            agreement=result.get("agreement", 0.0),
            routing_action=result.get("routing_action", "human_review"),
            needs_review=result.get("needs_review", True),
            model_votes=result.get("model_votes", {}),
            individual_confidences=result.get("individual_confidences", {}),
            matched_rules=result.get("matched_rules", []),
            ensemble_weights=result.get("ensemble_weights", {}),
            ticket_id=ticket_id,
            original_text_hash=text_hash,
        )


@dataclass
class ABTestRecord:
    """
    A/B test comparison record: stores single-model vs ensemble predictions
    for the same ticket, enabling side-by-side accuracy comparison.
    """
    ticket_id: str
    input_text_hash: str

    # Control: single DistilBERT model
    single_model_prediction: str
    single_model_confidence: float

    # Treatment: ensemble
    ensemble_prediction: str
    ensemble_confidence: float
    ensemble_entropy: float
    ensemble_agreement: float
    ensemble_routing_action: str

    # Ground truth (filled in after human review/correction)
    ground_truth_label: Optional[str] = None
    single_model_correct: Optional[bool] = None
    ensemble_correct: Optional[bool] = None

    # Metadata
    record_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = field(default_factory=lambda: datetime.datetime.utcnow().isoformat() + "Z")

    def set_ground_truth(self, true_label: str):
        """Update ground truth and compute correctness flags."""
        self.ground_truth_label = true_label
        self.single_model_correct = (self.single_model_prediction == true_label)
        self.ensemble_correct = (self.ensemble_prediction == true_label)

    def to_dict(self) -> dict:
        return asdict(self)
